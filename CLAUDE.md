# CLAUDE.md

Istruzioni per Claude Code su questo progetto. Architettura, convenzioni e decisioni sono in questo file; `README.md` è la presentazione pubblica.

## Obiettivo

Webapp per creare un CV con interfaccia drag and drop su un foglio A4, esportabile in PDF. Stato: **beta** (versione 0.1.0).

Roadmap originale, tutta implementata: editor → stile SCSS → inserzione prima del PDF → watermark e anti-screenshot → abbellimento del sito. Prossimi passi possibili: salvataggio dei CV, collegare un vero circuito pubblicitario, supporto touch/mobile.

## Regole di lavoro

- Lavora in autonomia: implementa senza chiedere ok a ogni file. Fermati solo per decisioni di design davvero aperte.
- Codice ordinato e robusto: tipi corretti, casi limite gestiti, verifica con typecheck/lint (`npx tsc -b`, `npx oxlint`) e nel browser prima di dire "fatto".
- Ogni macroblocco di codice va commentato (il "perché", non solo il "cosa"), senza esagerare.
- Approccio "lazy": la soluzione più lineare ed efficiente, niente astrazioni premature.
- A fine lavoro riepiloga cosa hai cambiato, file per file, in modo breve.
- Le scelte tecniche vanno verificate sulla documentazione ufficiale della versione installata.
- Rispondi in italiano.

## Struttura di `src/`

```
App.tsx, main.tsx          router (editor caricato in lazy) e avvio
pages/<Nome>/              Home, EditorPage, NotFoundPage (+ .module.scss)
layouts/SiteLayout/        header + footer delle pagine del sito
components/                Header, Footer
styles/                    _reset, _tokens (variabili CSS), _mixins, main
features/editor/
  model/                   logica pura: types, grid (misure), defaults, placement
  store/                   EditorProvider + hook useEditor (stato dei blocchi)
  catalog/                 elenchi: fonts, iconRegistry
  blocks/                  contenuto dei blocchi: Block, TextBlock, letterSpacing
  dnd/                     dragState (drag dalla sidebar), freeDrag (spostamento) e NO_DRAG
  Sheet/                   il foglio A4 (react-grid-layout), hook useDeleteShortcut/useScreenGuard
  SideBar/  TopBar/        aggiunta blocchi + esportazione; formattazione (TopBar, TextTools, controls)
  ExportDialog/            inserzione prima del PDF
  LeaveGuard/              conferma prima di uscire
```

Convenzioni: un componente per cartella con il proprio `.module.scss`; import ordinati (librerie, poi `../`, poi `./`); la logica pura sta in `model/` e non importa React.

## Modello e geometria

- `model/grid.ts` è l'**unica fonte** di misure: `MM_TO_PX = 96 / 25.4`, foglio 210×297 mm, `GRID_COLS = 24`, `GRID_ROWS = 48`; `ROW_HEIGHT_PX` e `COL_WIDTH_PX` derivano dividendo il foglio, quindi la griglia lo riempie esattamente. Celle non quadrate per scelta (con rapporto 1:√2 non esiste una griglia intera a celle quadrate).
- `model/types.ts`: `BlockType = "text" | "image" | "line" | "icon"`; `GridRect {x,y,w,h}` in **celle**, non pixel; `BlockStyle {color?, thickness?, background?, backgroundOpacity?}`; `SheetItem {id, type, layout, minH, content, style}`. `content` è HTML per il testo, data URL per l'immagine, nome per l'icona. `id` da `crypto.randomUUID()`.
- Il modello **non dipende da react-grid-layout**: la conversione `SheetItem ↔ layout RGL` vive solo in `Sheet.tsx`.
- `model/defaults.ts` (dimensioni, contenuto, spessore e icona iniziali) e `model/placement.ts` (`findFreeSpot`, `isFree`, `growHeight`).

## react-grid-layout 2.3.0 (verificata)

- API v2: `width` obbligatoria (fissa, `SHEET_WIDTH_PX`), `gridConfig` con `margin`/`containerPadding` a 0, `compactor = getCompactor(null, false, true)` (posizionamento libero senza sovrapposizioni), `layout` esplicito. Niente `WidthProvider`/`data-grid` (solo in `/legacy`).
- Con `autoSize={false}` il contenitore ha altezza 0: serve `style={{height: SHEET_HEIGHT_PX}}`.
- RGL gestisce **resize** e **rilascio dalla sidebar** (`dropConfig` + `onDrop`). Lo **spostamento** dei blocchi no (`dragConfig.enabled = false`): lo fa `dnd/freeDrag.ts`.
- Il placeholder di RGL (ombra) è nascosto in `Sheet.module.scss` perché dava un effetto scattoso; per riattivarlo basta togliere la regola.
- CSS da importare: `react-grid-layout/css/styles.css` e `react-resizable/css/styles.css`.
- Dopo aver installato una dipendenza con il dev server acceso: cancellare `node_modules/.vite` e riavviare (React duplicato → "Invalid hook call").

## Comportamenti dell'editor

- **Inserimento**: click sui pulsanti della sidebar (primo posto libero) oppure drag sul foglio (`dnd/dragState.ts` porta il tipo; punto libero → lì, altrimenti il più vicino; foglio pieno → nessun blocco). Solo mouse per il drag.
- **Spostamento** (`dnd/freeDrag.ts`): pointer events; durante il movimento si aggiorna solo `style.transform` (zero render React, al pixel, senza limiti); al rilascio si calcola la cella più vicina dentro il foglio (se occupata, il posto libero più vicino) e il blocco scivola lì, poi `updateLayouts`. I listener di move/up stanno su `window` (non sul blocco): un movimento veloce o un rilascio fuori dal blocco non si perde. Niente `setPointerCapture`: sposterebbe il target del clic sul blocco e il doppio clic sul testo non partirebbe più.
- **Testo** (Tiptap 3, `blocks/TextBlock.tsx`): tre stati — non selezionato (sola lettura), selezionato (la TopBar formatta tutto il blocco con `selectAll`), in modifica (doppio clic, Esc esce; classe `NO_DRAG`). StarterKit ridotto; dimensioni in px (4–72 di due in due, default 14); spaziatura lettere con estensione propria (`letterSpacing.ts`). I pulsanti della TopBar usano `onMouseDown`+`preventDefault` per non togliere il focus dal testo.
- **Altezza automatica**: `SheetItem.minH` è l'altezza scelta dall'utente (alla creazione e a ogni resize a mano, in `updateLayouts`). A ogni `update` di Tiptap `TextBlock` misura le righe reali e `fitHeight` porta il blocco a `max(righe, minH)`: cresce con gli a capo se c'è spazio, si restringe quando si cancellano, mai sotto `minH`. Se manca spazio il testo resta tagliato e compare una barra rossa (`overflowing`, nascosta in stampa).
- **Sfondo del blocco di testo**: `BlockStyle.background` + `backgroundOpacity` (applicato con `color-mix`, il testo resta pieno). In TopBar: selettore colore, `SliderTool` (pulsante a icona + pannello flottante, così la barra non cambia dimensioni), "Rimuovi sfondo".
- **Linea**: `thickness` (px, default 2). **Icona**: `container-type: size`, il simbolo (lucide, in alto nel blocco) segue il blocco fino a una cella. **Immagine**: `object-fit: cover`, caricata come data URL.
- **Pulsante ×** del blocco: sporge dall'angolo in alto a destra; il taglio del contenuto (`overflow: clip`, non `hidden`: con `hidden` il browser scorre il contenuto quando il cursore esce dal bordo) sta sul wrapper `.content`, non sul blocco.
- **Font**: 20, di cui 14 da `@fontsource` (subset latin, 400/700 + corsivi, serviti da noi senza richieste a Google) e 6 di sistema. Per aggiungerne uno: pacchetto `@fontsource/…`, import e voce in `catalog/fonts.ts`.
- **Esportazione**: il pulsante (e Ctrl/Cmd+P) apre `ExportDialog` (segnaposto pubblicitario, conto alla rovescia di 5 s) poi `window.print()`; `@media print` nasconde UI, griglia, contorni, watermark e imposta `@page` A4 senza margini.
- **Protezioni** (solo deterrenti, lato browser non si può impedire uno screenshot): watermark SVG ripetuto sul foglio (assente nel PDF), sfocatura quando la scheda è nascosta o si preme Stamp (`useScreenGuard`), niente menu contestuale sul foglio tranne nel testo.
- **Uscita**: `LeaveGuard` chiede conferma (dialog + `useBlocker` per link e tasto indietro, `beforeunload` per chiusura/ricarica) se sul foglio c'è almeno un blocco. Nulla è salvato.

## Stile (SCSS)

- `styles/_tokens.scss`: unica fonte di colori, raggi, ombre, transizione (`--transition-fast`). Nessun colore scritto a mano nei moduli.
- `styles/_mixins.scss`: `solid-button`, `plain-button`, `floating-surface`, `dashed-box`, `dialog`, `dialog-title`, `dialog-text`. Si usano con `@use "…/styles/mixins" as *;`.
- Un modulo per componente; le regole `@media print` stanno accanto agli stili che nascondono. Font UI Inter, icone lucide-react.

## Limiti noti della beta

- Anteprima di stampa/PDF non verificata in automatico: controllare a mano con testo ricco (e che non esca una seconda pagina vuota).
- Nessun salvataggio: ricaricando la pagina si perde il CV.
- Drag dalla sidebar solo con mouse (su touch resta il click); editor pensato per desktop.
- L'inserzione è un segnaposto.
