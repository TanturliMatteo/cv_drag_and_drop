# Free-form block dragging

RGL moves items cell by cell, which feels steppy. Alternative: follow the pointer at pixel level, snap to a cell only on release.

## Principles

- During move, write only `el.style.transform`. No React render, no cell math.
- Use a 3 px threshold so a click or double click never moves the block.
- Attach `pointermove` / `pointerup` / `pointercancel` to **`window`**, filtered by `pointerId`. Fast moves and releases outside the block are then never lost.
- **Do not** call `setPointerCapture`: it retargets clicks to the block and breaks double click on inner content (e.g. text editing).
- Ignore drags that start on interactive children (`.no-drag`, `.react-resizable-handle`) and non-primary buttons.
- RGL positions items with `translate(Xpx, Ypx)` using rounded px; use the same rounding to avoid a visible jump when React rewrites the style.

## Skeleton

```ts
export function startFreeDrag(e: React.PointerEvent<HTMLElement>, layout: GridRect,
                              others: GridRect[], commit: (r: GridRect) => void) {
  if (e.button !== 0 || (e.target as Element).closest(".no-drag, .react-resizable-handle")) return;
  const el = e.currentTarget;
  const base = { x: Math.round(layout.x * COL_WIDTH_PX), y: Math.round(layout.y * ROW_HEIGHT_PX) };
  let dragging = false, dx = 0, dy = 0;

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== e.pointerId) return;
    dx = ev.clientX - e.clientX; dy = ev.clientY - e.clientY;
    if (!dragging) {
      if (Math.hypot(dx, dy) < 3) return;
      dragging = true;
      el.style.transition = "none"; el.style.zIndex = "3";
    }
    el.style.transform = `translate(${base.x + dx}px, ${base.y + dy}px)`;
  };

  const onEnd = (ev: PointerEvent) => {
    if (ev.pointerId !== e.pointerId) return;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
    window.removeEventListener("pointercancel", onEnd);
    if (!dragging) return;
    const target = { ...layout,
      x: clamp(Math.round((base.x + dx) / COL_WIDTH_PX), 0, GRID_COLS - layout.w),
      y: clamp(Math.round((base.y + dy) / ROW_HEIGHT_PX), 0, GRID_ROWS - layout.h) };
    const final = isFree(target, others) ? target : (findFreeSpot(others, layout, target) ?? layout);
    el.style.transition = "";
    el.getBoundingClientRect();                 // force reflow so the snap animates
    el.style.transform = `translate(${Math.round(final.x * COL_WIDTH_PX)}px, ${Math.round(final.y * ROW_HEIGHT_PX)}px)`;
    el.style.zIndex = "";
    commit(final);                              // updates the store
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);
  window.addEventListener("pointercancel", onEnd);
}
```

Write the final transform manually: if the cell did not change, React will not rewrite the style and the block would stay where it was released.

Mouse/pen only is supported as written; touch needs `touch-action: none` on the block and a separate decision on scrolling.
