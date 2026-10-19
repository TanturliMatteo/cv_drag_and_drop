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
// selezione, come in Word); qui restano colore e spessore di linea e icona.
export type BlockStyle = {
  color?: string;
  thickness?: number; // spessore della linea, in px
};

// Un elemento sul foglio.
export type SheetItem = {
  id: string;
  type: BlockType;
  layout: GridRect;
  content: string; // HTML per il testo, src per le immagini, simbolo per le icone
  style: BlockStyle;
};
