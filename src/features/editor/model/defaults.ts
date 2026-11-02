import type { BlockType } from "./types";

// Valori di partenza dei blocchi appena aggiunti al foglio.

// Dimensione iniziale di ogni tipo di blocco, in celle.
export const DEFAULT_SIZE: Record<BlockType, { w: number; h: number }> = {
  text: { w: 12, h: 3 },
  line: { w: 24, h: 1 },
  // Celle non quadrate (8,75×6,19 mm): 6×9 dà una foto quasi tonda (52×56 mm).
  image: { w: 6, h: 9 },
  icon: { w: 3, h: 3 },
};

// Simbolo di partenza di un blocco icona (nome nel catalogo delle icone).
export const DEFAULT_ICON = "star";

// Contenuto iniziale: HTML per il testo, nome per l'icona, vuoto per linea e immagine.
export const DEFAULT_CONTENT: Record<BlockType, string> = {
  text: "<p>Nuovo testo</p>",
  line: "",
  image: "",
  icon: DEFAULT_ICON,
};

// Spessore di partenza di una linea, in px.
export const DEFAULT_THICKNESS = 2;
