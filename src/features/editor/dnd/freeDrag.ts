import type { PointerEvent as ReactPointerEvent } from "react";
import { findFreeSpot, isFree } from "../model/placement";
import type { GridRect } from "../model/types";
import { COL_WIDTH_PX, GRID_COLS, GRID_ROWS, ROW_HEIGHT_PX } from "../model/grid";

// Classe dei controlli interni a un blocco (testo in modifica, ×, caricamento
// immagine): il mouse lì non avvia un trascinamento. Il CSS la usa per tornare
// a rendere selezionabile il testo.
export const NO_DRAG = "no-drag";

// Altri elementi che non devono avviare il trascinamento: la maniglia di resize.
const NO_DRAG_SELECTOR = `.${NO_DRAG}, .react-resizable-handle`;

// Pixel da muovere prima che parta il trascinamento: un clic o un doppio clic
// con la mano che trema non deve spostare il blocco.
const THRESHOLD_PX = 3;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

// RGL posiziona i blocchi con translate(x, y) in px arrotondati: uso gli stessi
// valori, così quando React riscrive lo style non c'è nessuno scarto.
const toPx = (r: GridRect) => ({
  x: Math.round(r.x * COL_WIDTH_PX),
  y: Math.round(r.y * ROW_HEIGHT_PX),
});
const translate = (x: number, y: number) => `translate(${x}px, ${y}px)`;

// Trascinamento libero di un blocco. Durante il movimento aggiorno solo lo style
// del nodo DOM (nessun render React, nessun calcolo di celle): il blocco segue il
// puntatore al pixel, come quando si trascina dalla sidebar. Solo al rilascio
// calcolo la cella più vicina (o il posto libero più vicino se è occupata) e il
// blocco scivola lì con la transizione CSS di RGL.
export function startFreeDrag(
  e: ReactPointerEvent<HTMLElement>,
  layout: GridRect,
  others: GridRect[],
  commit: (rect: GridRect) => void,
) {
  // Solo tasto principale, e non sui controlli interni.
  if (e.button !== 0 || (e.target as Element).closest(NO_DRAG_SELECTOR)) return;

  const el = e.currentTarget;
  const startX = e.clientX;
  const startY = e.clientY;
  const base = toPx(layout);
  let dragging = false;
  let dx = 0;
  let dy = 0;

  // Gli eventi si ascoltano su window e non sul blocco: così arrivano anche quando
  // il puntatore esce dal blocco (movimenti veloci, fuori dal foglio) e un
  // rilascio non può andare perso. Niente setPointerCapture: sposterebbe il
  // target del clic sul blocco e il doppio clic sul testo non partirebbe più.
  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== e.pointerId) return;
    dx = ev.clientX - startX;
    dy = ev.clientY - startY;
    if (!dragging) {
      if (Math.hypot(dx, dy) < THRESHOLD_PX) return;
      dragging = true;
      // Niente transizione mentre si trascina (altrimenti il blocco "rincorre" il mouse).
      el.style.transition = "none";
      el.style.zIndex = "3";
    }
    el.style.transform = translate(base.x + dx, base.y + dy);
  };

  const onEnd = (ev: PointerEvent) => {
    if (ev.pointerId !== e.pointerId) return;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
    window.removeEventListener("pointercancel", onEnd);
    if (!dragging) return;

    // Cella più vicina alla posizione di rilascio, tenuta dentro il foglio.
    const target: GridRect = {
      ...layout,
      x: clamp(Math.round((base.x + dx) / COL_WIDTH_PX), 0, GRID_COLS - layout.w),
      y: clamp(Math.round((base.y + dy) / ROW_HEIGHT_PX), 0, GRID_ROWS - layout.h),
    };
    // Cella occupata → il posto libero più vicino; foglio senza posto → torna dov'era.
    const final = isFree(target, others)
      ? target
      : (findFreeSpot(others, { w: layout.w, h: layout.h }, target) ?? layout);

    // Riattivo la transizione e porto il nodo sulla cella finale: parte l'animazione
    // di "aggancio". Lo scrivo io perché, se la cella non cambia, React non
    // riscriverebbe lo style e il blocco resterebbe dove l'ho lasciato.
    el.style.transition = "";
    el.getBoundingClientRect(); // forza il reflow: la transizione parte da qui
    const px = toPx(final);
    el.style.transform = translate(px.x, px.y);
    el.style.zIndex = "";
    commit(final);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);
  window.addEventListener("pointercancel", onEnd);
}
