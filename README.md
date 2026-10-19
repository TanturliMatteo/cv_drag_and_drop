# CV Drag & Drop

Webapp per creare un curriculum con un'interfaccia drag and drop su un foglio A4 e, a fine lavoro, esportarlo in PDF.

> Questo progetto è stato realizzato con l'aiuto di **[Claude Code](https://claude.com/claude-code)**, l'assistente di programmazione di Anthropic: architettura, codice e documentazione sono nati dal lavoro congiunto tra lo sviluppatore e Claude Code.

## Funzionalità

- **Foglio A4 reale** (210 × 297 mm) con griglia visibile di 24 colonne × 48 righe; i blocchi si agganciano alle celle e restano dentro i bordi del foglio.
- **Blocchi trascinabili e ridimensionabili**: testo, linea, immagine, icona. Aggiunta dalla sidebar, posizionamento automatico nel primo spazio libero (avviso se il foglio è pieno), niente sovrapposizioni.
- **Testo ricco** (Tiptap): grassetto, corsivo, sottolineato, barrato, pedice/apice, colore, evidenziatore, allineamento, elenchi puntati e numerati, rientro, interlinea, spaziatura delle lettere, annulla/ripeti.
- **20 font** (14 self-hosted tramite `@fontsource`, senza richieste a Google, più 6 di sistema) e dimensione del testo da 4 a 72 px.
- **Auto-allungamento** dei blocchi di testo verso il basso; se manca spazio, il blocco mostra una barra rossa di avviso.
- **Tre stati del blocco**: non selezionato, selezionato (la TopBar formatta l'intero blocco), in modifica (doppio clic; `Esc` per uscire).
- **Linee** con spessore e colore, **icone** (set lucide) con colore, **immagini** con `object-fit: cover`.
- **Esportazione PDF** dal pulsante in fondo alla sidebar (`window.print()` con `@media print`: UI, griglia e contorni nascosti, pagina A4 senza margini).

## Stack

| Ambito | Tecnologia |
| --- | --- |
| UI | React 19, TypeScript, React Router |
| Build | Vite |
| Drag & drop / griglia | react-grid-layout 2.x |
| Editor di testo | Tiptap 3 |
| Stile | SCSS (sass-embedded), token in `src/styles/_tokens.scss` |
| Icone | lucide-react |
| Font | @fontsource |
| Lint | oxlint |

## Per iniziare

```bash
npm install
npm run dev       # server di sviluppo
npm run build     # typecheck + build di produzione
npm run lint      # oxlint
npm run preview   # anteprima della build
```

> Dopo aver installato una nuova dipendenza con il dev server acceso, cancella `node_modules/.vite` e riavvia (altrimenti può comparire l'errore "Invalid hook call" per React duplicato).

## Struttura

```
src/
├── features/editor/
│   ├── Sheet/          # foglio A4, griglia (grid.ts), blocchi (Block, TextBlock)
│   ├── SideBar/        # aggiunta blocchi ed esportazione PDF
│   ├── TopBar/         # formattazione testo / colore
│   ├── editorStore.ts  # stato dell'editor (contesto + hook)
│   ├── EditorProvider.tsx
│   ├── placement.ts    # ricerca spazio libero e crescita dei blocchi
│   ├── types.ts        # modello dati (SheetItem, GridRect, BlockStyle)
│   ├── fonts.ts        # elenco font
│   ├── iconRegistry.ts # icone disponibili per i blocchi
│   └── letterSpacing.ts# estensione Tiptap per la spaziatura lettere
├── pages/EditorPage/   # pagina dell'editor
└── styles/             # reset e token SCSS
```

## Scelte di progetto

- **Geometria in un solo file**: `Sheet/grid.ts` è l'unica fonte per misure e griglia (`1in = 25.4mm = 96px`); celle derivate dividendo il foglio, così la griglia lo riempie esattamente.
- **Modello indipendente dalla libreria**: `SheetItem` usa coordinate in *celle di griglia*, non in pixel, e non dipende da react-grid-layout; la conversione verso il layout della libreria è una piccola funzione dentro `Sheet`.
- **Contenuto testuale in HTML**: la formattazione vive nell'HTML prodotto da Tiptap, per selezione, come in un word processor.
- **Griglia senza DOM extra**: due `linear-gradient` pilotati da variabili CSS (`--col-width`, `--row-height`).

## Roadmap

1. Core dell'editor (in corso): verificare l'anteprima di stampa/PDF con il testo ricco.
2. Miglioramento dello stile con SCSS.
3. Inserzione pubblicitaria mostrata prima della conversione in PDF.
4. Misure anti-screenshot e watermark.
5. Abbellimento complessivo del sito che ospita la webapp.

## Note

Le decisioni di progettazione dettagliate e le istruzioni di lavoro per Claude Code sono in [`CLAUDE.md`](./CLAUDE.md).
