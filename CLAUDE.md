# CLAUDE.md

Istruzioni per Claude Code su questo progetto. Architettura, convenzioni e roadmap sono in questo file (il `README.md` è ancora quello di default del template Vite).

## Obiettivo

Webapp per creare un CV con interfaccia drag and drop su un foglio A4, esportabile in PDF.

- Esportazione PDF tramite un pulsante: in fondo alla sidebar oppure in overlay in basso a destra (da decidere).
- Fasi successive, in ordine:
  1. Miglioramento dello stile con SCSS.
  2. Inserzione (pubblicitaria) mostrata prima della conversione in PDF.
  3. Misure anti-screenshot e watermark.
  4. Abbellimento totale del sito che contiene la webapp.
- Finché non si arriva a queste fasi, non anticiparle: resta sul core dell'editor.

## Regole di lavoro

- Lavora in autonomia: implementa i passi della roadmap uno dopo l'altro senza chiedere ok a ogni file. Fermati solo per decisioni di design davvero aperte.
- Codice ordinato e robusto: tipi corretti, casi limite gestiti, verifica con typecheck/lint e nel browser prima di dire "fatto".
- Ogni macroblocco di codice va commentato (il "perché", non solo il "cosa").
- Approccio "lazy": la soluzione più lineare ed efficiente, niente astrazioni premature.
- A fine lavoro riepiloga cosa hai cambiato, file per file, in modo breve.
- Le scelte tecniche vanno verificate sulla documentazione ufficiale della versione installata.
- Rispondi in italiano.

## Decisioni già prese (sessione di progettazione della griglia)

### Geometria — `src/features/editor/Sheet/grid.ts`

Unica fonte per misure e griglia. Nessun altro file contiene numeri di layout propri.

- Conversione: `MM_TO_PX = 96 / 25.4` (specifica CSS: 1in = 25.4mm = 96px).
- `SHEET_WIDTH_PX = 210 * MM_TO_PX` (≈ 793.7), `SHEET_HEIGHT_PX = 297 * MM_TO_PX` (≈ 1122.5).
- `GRID_COLS = 24` (divisibile per 2, 3, 4, 6: layout a più colonne con celle intere).
- `GRID_ROWS = 48` (celle alte ≈ 23px, circa una riga di testo).
- `ROW_HEIGHT_PX` e `COL_WIDTH_PX` sono **derivate** dividendo il foglio, così la griglia lo riempie esattamente.
- Celle non quadrate per scelta: con rapporto 1:√2 non esiste una griglia intera a celle quadrate.

### Griglia visibile — `Sheet.tsx` + `Sheet.module.scss`

- Sheet passa `--col-width` e `--row-height` come variabili CSS inline (cast `as CSSProperties`), così lo SCSS non duplica i numeri.
- Le linee sono due `linear-gradient` (verticali e orizzontali) con `background-size: var(--col-width) var(--row-height)`. Nessun elemento DOM in più.
- Da nascondere più avanti nella vista finale e in `@media print`.

### Modello dati — `src/features/editor/types.ts`

- `BlockType = "text" | "image" | "line" | "icon"`.
- `GridRect = { x, y, w, h }` in **celle di griglia**, non pixel.
- `BlockStyle = { fontFamily?, color?, bullet? }`, tutto opzionale.
- `SheetItem = { id, type, layout: GridRect, content, style: BlockStyle }`.
- `id` stringa, generato con `crypto.randomUUID()` in `addItem`.
- Il modello **non dipende da react-grid-layout**: la conversione `SheetItem → layout RGL` sarà una piccola funzione dentro Sheet.

### Configurazione prevista di react-grid-layout

- Larghezza fissa (`SHEET_WIDTH_PX`), niente `WidthProvider`: il foglio è sempre 210mm.
- `margin={[0, 0]}` e `containerPadding={[0, 0]}`: una cella = una frazione esatta del foglio.
- Posizionamento libero: `compactType={null}`, `preventCollision`, `maxRows={GRID_ROWS}`, `isBounded`.
- Se in futuro si usa `transform: scale()` sul foglio, passare `transformScale`.
- **Da verificare prima di scrivere codice**: versione installata (`npm ls react-grid-layout`). Le versioni recenti hanno cambiato parte dell'API rispetto alla 1.x, quindi nomi delle prop ed esempi vanno controllati sulla documentazione della versione effettiva.

### react-grid-layout 2.3.0 (installata, verificata)

- API v2: `width` obbligatoria; `gridConfig={{cols,rowHeight,margin,containerPadding,maxRows}}`, `dragConfig={{bounded}}`, `compactor`, `layout` esplicito. Niente `WidthProvider`/`data-grid` (solo in `/legacy`).
- Posizionamento libero senza sovrapposizioni: `getCompactor(null, false, true)`.
- Con `autoSize={false}` il contenitore ha altezza 0 e i vincoli di bordo non funzionano: serve `style={{height: SHEET_HEIGHT_PX}}`.
- Dopo aver installato una dipendenza con il dev server acceso: cancellare `node_modules/.vite` e riavviare (React duplicato → "Invalid hook call").
- CSS da importare: `react-grid-layout/css/styles.css` e `react-resizable/css/styles.css`.

## Stato attuale

- Fatto: layout editor (sidebar, topbar, main, sheet), `grid.ts`, griglia visibile in Sheet, `types.ts`.
- Da verificare: che i file sopra esistano e corrispondano a queste decisioni; che l'ultima riga della griglia chiuda esattamente sul bordo del foglio.

## Prossimo passo

Fatti: versione RGL, `SheetItem` di prova in `useState`, conversione `toLayout`, render RGL, `onLayoutChange` (spostamento verificato nel browser, blocchi bloccati ai bordi del foglio).

Fatto anche: store in `features/editor/` (`editorStore.ts` contesto + hook, `EditorProvider.tsx`, `placement.ts` con `findFreeSpot`), Sidebar con pulsanti "+ Testo/Linea/Immagine/Icona" (avviso se il foglio è pieno).

Fatto anche: rendering per tipo, selezione e cancellazione, pulsante "Esporta PDF" in fondo alla sidebar (`window.print()` + `@media print` che nasconde UI, griglia e contorni; `@page` A4 senza margini).

### Testo ricco e TopBar (Tiptap 3)

- I blocchi `text` usano Tiptap (`Sheet/TextBlock.tsx`); `SheetItem.content` è **HTML**. `BlockStyle` ha solo `color` (linea e icona): la formattazione del testo vive nell'HTML, per selezione, come in Word.
- Tre stati: non selezionato (sola lettura), selezionato (la TopBar formatta tutto il blocco con `selectAll`), in modifica (doppio clic; Esc esce). L'editor del blocco selezionato è in `activeEditor` dello store.
- TopBar (`TopBar/TopBar.tsx`): font, dimensione in pt, B/I/U/barrato, colore, evidenziatore, allineamento, elenchi puntati/numerati, interlinea, spaziatura lettere (`letterSpacing.ts`, estensione nostra sopra `TextStyle`), annulla/ripeti. Per linea/icona: colore e simboli.
- Font (`fonts.ts`): 20, di cui 14 da `@fontsource` (solo subset latin, 400/700 + corsivi, serviti da noi senza richieste a Google) e 6 di sistema. Per aggiungerne uno: pacchetto `@fontsource/…`, import in `fonts.ts` e voce in `FONTS`.
- StarterKit ridotto (niente titoli, citazioni, codice, link, riga orizzontale, trailing node).
- Dimensioni testo in **px**, da 4 a 72 di due in due, default 14px.
- Auto-allungamento: se il testo non entra nel blocco (evento `update` di Tiptap) `fitHeight` (store) allunga il blocco verso il basso con `growHeight` (`placement.ts`) finché non tocca altri blocchi o il bordo del foglio; se manca spazio il testo resta tagliato e il blocco mostra una barra rossa in basso (`overflowing`, nascosta in stampa). I blocchi usano `overflow: clip`, non `hidden`: con `hidden` il browser scorre il contenuto quando il cursore esce dal bordo e le prime righe spariscono.
- Linea: `BlockStyle.thickness` (px, default 2), disegnata come div centrato nel blocco. Icona: `container-type: size` + `font-size: min(80cqw, 80cqh)`, così il simbolo segue il blocco fino a una cella. Immagine: `object-fit: cover`.
- Stile UI (minimal/elegante/moderno): token in `styles/_tokens.scss` (grigi neutri, accento indaco, `--radius-block` 8px per i blocchi), font UI Inter, icone **lucide-react**. Icone dei blocchi: SVG lucide scelti in `iconRegistry.ts`; `content` = nome icona (es. "mail"). TopBar a gruppi (annulla, font/dimensione ±, B/I/U/S/pedice/apice, colore/evidenziatore/cancella formattazione, allineamento, elenchi+rientro, interlinea/spaziatura). Font in ordine alfabetico (`fonts.ts`).
- I pulsanti della TopBar usano `onMouseDown` + `preventDefault` per non togliere il focus dal testo.

Verificato nel browser: aggiunta blocco, modifica, B/I, allineamento, elenco, font/dimensione/interlinea/spaziatura (anche selezione completa), Esc, drag. **Non** verificata l'anteprima di stampa/PDF con il testo ricco.

Da fare:
