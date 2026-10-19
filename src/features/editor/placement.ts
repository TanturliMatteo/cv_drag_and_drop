import { GRID_COLS, GRID_ROWS } from "./Sheet/grid";
import type { BlockType, GridRect } from "./types";

// Dimensione iniziale di ogni tipo di blocco, in celle.
export const DEFAULT_SIZE: Record<BlockType, { w: number; h: number }> = {
  text: { w: 12, h: 3 },
  line: { w: 24, h: 1 },
  image: { w: 8, h: 8 },
  icon: { w: 3, h: 3 },
};

// Spessore di partenza di una linea, in px.
export const DEFAULT_THICKNESS = 2;

// Due rettangoli si sovrappongono solo se lo fanno sia in orizzontale sia in verticale.
const overlaps = (a: GridRect, b: GridRect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// Altezza (in righe) a cui può crescere un blocco verso il basso: la maggiore
// ≤ wanted che non esce dal foglio e non tocca altri blocchi. Se non c'è spazio
// restituisce l'altezza attuale.
export function growHeight(
  self: GridRect,
  others: GridRect[],
  wanted: number,
): number {
  let h = self.h;
  while (h < wanted && self.y + h + 1 <= GRID_ROWS) {
    if (others.some((r) => overlaps({ ...self, h: h + 1 }, r))) break;
    h++;
  }
  return h;
}

// Primo posto libero scandendo il foglio dall'alto a sinistra: così i nuovi
// blocchi non finiscono mai sopra quelli esistenti (RGL non li accetterebbe).
// Restituisce null se il foglio è pieno.
export function findFreeSpot(
  occupied: GridRect[],
  size: { w: number; h: number },
): GridRect | null {
  for (let y = 0; y + size.h <= GRID_ROWS; y++) {
    for (let x = 0; x + size.w <= GRID_COLS; x++) {
      const candidate = { x, y, ...size };
      if (!occupied.some((r) => overlaps(candidate, r))) return candidate;
    }
  }
  return null;
}
