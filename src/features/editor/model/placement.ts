import { GRID_COLS, GRID_ROWS } from "./grid";
import type { GridRect } from "./types";

// Logica pura di posizionamento sulla griglia (celle, non pixel).

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

// Posto libero per un nuovo blocco: così non finisce mai sopra quelli esistenti
// (RGL non li accetterebbe). Senza `near` è il primo scandendo dall'alto a
// sinistra; con `near` (rilascio col mouse) è il più vicino a quel punto.
// Restituisce null se il foglio è pieno.
export function findFreeSpot(
  occupied: GridRect[],
  size: { w: number; h: number },
  near?: { x: number; y: number },
): GridRect | null {
  let best: GridRect | null = null;
  let bestDist = Infinity;
  for (let y = 0; y + size.h <= GRID_ROWS; y++) {
    for (let x = 0; x + size.w <= GRID_COLS; x++) {
      const candidate = { x, y, ...size };
      if (occupied.some((r) => overlaps(candidate, r))) continue;
      if (!near) return candidate;
      const dist = (x - near.x) ** 2 + (y - near.y) ** 2;
      if (dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
  }
  return best;
}

// true se il rettangolo sta nel foglio e non tocca altri blocchi.
export function isFree(rect: GridRect, occupied: GridRect[]): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.w <= GRID_COLS &&
    rect.y + rect.h <= GRID_ROWS &&
    !occupied.some((r) => overlaps(rect, r))
  );
}
