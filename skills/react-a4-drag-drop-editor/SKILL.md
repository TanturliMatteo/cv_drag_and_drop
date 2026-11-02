---
name: react-a4-drag-drop-editor
description: Use when the user asks to build a drag-and-drop editor in React, such as a CV builder, resume maker, A4 page layout tool, or print-to-PDF export. Trigger phrases - "drag and drop editor", "CV builder", "A4 sheet", "react-grid-layout", "export to PDF". Covers react-grid-layout v2 setup, free-form block dragging, Tiptap text blocks with auto-height, mm-accurate grid geometry and A4 print CSS.
---

# React A4 drag-and-drop editor

Build a block editor on a fixed A4 sheet (210×297 mm) with React, react-grid-layout (RGL) v2 and Tiptap 3, exported to PDF through `window.print()`.

Verify API details against the installed versions before coding (`node_modules/react-grid-layout`, official docs). RGL v1 and v2 differ substantially.

## Workflow

1. **Geometry first.** Create one module that owns all measurements. See `references/geometry-and-model.md`.
2. **Model.** Keep a pure data model (`SheetItem[]`) independent from RGL. Convert to/from RGL layout in a single file.
3. **Sheet.** Configure RGL v2 as a fixed-width, free-placement grid. See `references/rgl-v2-setup.md`.
4. **Drag.** If the default RGL drag feels jumpy, disable it and use pointer-event dragging with snap on release. See `references/free-drag.md`.
5. **Text blocks.** Use Tiptap with three states and auto-height. See `references/text-block.md`.
6. **Export.** Print CSS for A4 without margins. See `references/print-export.md`.
7. **Verify.** Run `npx tsc -b` and the linter, then test in the browser: drag, resize, drop from sidebar, print preview.

## Rules

- Store grid positions in **cells**, never pixels. Pixels are derived from the geometry module.
- Derive `ROW_HEIGHT_PX` and `COL_WIDTH_PX` by dividing the sheet size, so the grid fills the sheet exactly. Cells are not square (A4 ratio is 1:√2); accept this.
- Keep pure logic (`grid`, `placement`, `defaults`) free of React imports.
- Do not use `WidthProvider` or `data-grid` (RGL v2 only offers them under `/legacy`).
- Drop-from-sidebar must reject drags that do not originate from the sidebar (e.g. desktop files).
- Browser-side screenshot protection is impossible. If requested, offer deterrents only (watermark hidden in print, blur on `visibilitychange`) and say so.

## Output expectations

When the task is done, report briefly per file what changed, and which checks (typecheck, lint, browser, print preview) were actually run.

## Common pitfalls

See `references/pitfalls.md` before debugging odd behaviour (container height 0, double click not firing, blank second PDF page, "Invalid hook call").
