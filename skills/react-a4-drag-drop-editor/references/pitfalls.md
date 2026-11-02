# Pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Grid container invisible / height 0 | `autoSize={false}` | `style={{ height: SHEET_HEIGHT_PX }}` |
| Blocks collapse upward | default vertical compaction | `getCompactor(null, false, true)` |
| `WidthProvider` / `data-grid` missing | v2 moved them to `/legacy` | pass `width` and an explicit `layout` |
| Double click on text does not start editing | `setPointerCapture` retargets the click | listen on `window`, no capture |
| Dragged block "chases" the mouse | CSS transition active during drag | `transition: none` while dragging, restore on release |
| Block does not snap after release on same cell | React does not rewrite unchanged style | set final `transform` manually |
| Text scrolls when selecting past block edge | `overflow: hidden` | `overflow: clip` on the inner wrapper |
| Toolbar button blurs the editor | `mousedown` moves focus | `onMouseDown` + `preventDefault()` |
| Blank second PDF page | sheet height rounds above 297 mm | fixed `height: 297mm; overflow: clip` in print |
| "Invalid hook call" after installing a dependency | Vite pre-bundle has duplicate React | stop dev server, delete `node_modules/.vite`, restart |
| Missing backgrounds in PDF | browser strips them | `print-color-adjust: exact` |
