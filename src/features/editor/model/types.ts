// I tipi di blocco che si possono mettere sul foglio.
export type BlockType = "text" | "image" | "line" | "icon";

// Posizione e dimensione, in celle di griglia (non in pixel).
export type GridRect = {
  x: number; // colonna di partenza (0 … GRID_COLS - 1)
  y: number; // riga di partenza   (0 … GRID_ROWS - 1)
  w: number; // larghezza in colonne
  h: number; // altezza in righe
};

// Stile a livello di blocco. Il testo ha la formattazione dentro l'HTML (per
// selezione, come in Word); qui restano colore (linea e icona), spessore di
// linea e sfondo dei blocchi di testo.
export type BlockStyle = {
  color?: string;
  thickness?: number; // spessore della linea, in px
  background?: string; // colore di sfondo del blocco di testo
  backgroundOpacity?: number; // opacità dello sfondo, da 0 a 1 (default 1)
};

// Un elemento sul foglio.
export type SheetItem = {
  id: string;
  type: BlockType;
  layout: GridRect;
  // Altezza (in righe) scelta dall'utente: il testo può allungare il blocco, ma
  // quando si accorcia il blocco torna a questa altezza, non più in basso.
  minH: number;
  content: string; // HTML per il testo, src per le immagini, simbolo per le icone
  style: BlockStyle;
};
