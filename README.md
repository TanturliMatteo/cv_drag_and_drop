# CV Drag & Drop

Webapp per creare un curriculum con un'interfaccia drag and drop su un foglio A4 ed esportarlo in PDF. **Versione beta (0.1.0).**

> Questo progetto è stato realizzato con l'aiuto di **[Claude Code](https://claude.com/claude-code)**, l'assistente di programmazione di Anthropic: architettura, codice e documentazione sono nati dal lavoro congiunto tra lo sviluppatore e Claude Code.

## Funzionalità

- **Foglio A4 reale** (210 × 297 mm) con griglia di 24 × 48 celle. I blocchi si agganciano alle celle senza sovrapporsi.
- **Quattro tipi di blocco**: testo, linea, immagine, icona. Si aggiungono con un click o **trascinandoli** dalla sidebar sul foglio; si spostano al pixel e si agganciano alla cella più vicina al rilascio; si ridimensionano dalla maniglia in basso a destra.
- **Testo ricco** (Tiptap): grassetto, corsivo, sottolineato, barrato, pedice/apice, colore, evidenziatore, allineamento, elenchi, rientro, interlinea, spaziatura delle lettere, annulla/ripeti. Doppio clic per scrivere, `Esc` per uscire.
- **Sfondo dei blocchi di testo** con selettore colore e slider di opacità.
- **Altezza automatica**: il blocco di testo si allunga con gli a capo e si restringe quando si cancellano, mai sotto l'altezza scelta.
- **20 font** (14 self-hosted tramite `@fontsource`, senza richieste a Google, più 6 di sistema).
- **Linee** con spessore e colore, **icone** (set lucide) con colore, **immagini** caricate dal computer.
- **Esportazione PDF** dal pulsante in fondo alla sidebar (o `Ctrl/Cmd+P`): dopo un breve spazio pubblicitario si apre la stampa del browser (UI, griglia, contorni e watermark sono nascosti, pagina A4 senza margini).
- **Conferma prima di uscire**, perché il CV non viene salvato.

## Stack

| Ambito | Tecnologia |
| --- | --- |
| UI | React 19, TypeScript, React Router |
| Build | Vite |
| Griglia e resize | react-grid-layout 2.x |
| Editor di testo | Tiptap 3 |
| Stile | SCSS (sass-embedded), token e mixin in `src/styles` |
| Icone / font | lucide-react / @fontsource |
| Lint | oxlint |

## Per iniziare

```bash
npm install
npm run dev       # server di sviluppo
npm run build     # typecheck + build di produzione
npm run lint      # oxlint
npm run preview   # anteprima della build
```

## Struttura

```
src/
├── features/editor/
│   ├── model/          # tipi, griglia A4, valori iniziali, posizionamento (logica pura)
│   ├── store/          # stato dell'editor (contesto + provider)
│   ├── catalog/        # elenchi di font e icone
│   ├── blocks/         # contenuto dei blocchi (testo, linea, immagine, icona)
│   ├── dnd/            # drag dalla sidebar e spostamento libero dei blocchi
│   ├── Sheet/          # il foglio, scorciatoie e protezioni
│   ├── SideBar/        # aggiunta blocchi ed esportazione
│   ├── TopBar/         # formattazione del blocco selezionato
│   ├── ExportDialog/   # inserzione prima del PDF
│   └── LeaveGuard/     # conferma prima di uscire
├── pages/              # Home, EditorPage, NotFoundPage
├── layouts/SiteLayout/ # header + footer del sito
├── components/         # Header, Footer
└── styles/             # reset, token (variabili CSS) e mixin
```

## Scelte di progetto

- **Geometria in un solo file**: `model/grid.ts` è l'unica fonte per misure e griglia (`1in = 25.4mm = 96px`); le celle derivano dal foglio, quindi la griglia lo riempie esattamente.
- **Modello indipendente dalla libreria**: i blocchi usano coordinate in *celle*, non in pixel, e non dipendono da react-grid-layout.
- **Testo in HTML**: la formattazione vive nell'HTML prodotto da Tiptap, per selezione, come in un word processor.
- **Spostamento fluido**: durante il trascinamento si aggiorna solo lo stile del nodo DOM; la cella si calcola al rilascio.

## Limiti noti della beta

- Il CV **non viene salvato**: ricaricando la pagina si perde.
- L'anteprima di stampa va controllata a mano; la qualità del PDF dipende dal browser (consigliato Chrome/Edge).
- Pensata per desktop: il drag dalla sidebar funziona solo con il mouse (col touch resta il click).
- Lo spazio pubblicitario è un segnaposto; watermark e protezioni anti-screenshot sono solo deterrenti, non una garanzia.

## Note

Istruzioni di lavoro e decisioni di dettaglio per Claude Code sono in [`CLAUDE.md`](./CLAUDE.md).
