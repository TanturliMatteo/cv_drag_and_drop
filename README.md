# CV Drag & Drop

Web app to build a résumé with a drag-and-drop interface on an A4 sheet and export it to PDF. **Beta version (0.1.0).**

> This project was built with the help of **[Claude Code](https://claude.com/claude-code)**, Anthropic's coding assistant: architecture, code and documentation came out of joint work between the developer and Claude Code.

## Features

- **Real A4 sheet** (210 × 297 mm) with a 24 × 48 cell grid. Blocks snap to cells without overlapping.
- **Four block types**: text, line, image, icon. Add them with a click or by **dragging** them from the sidebar onto the sheet; move them pixel by pixel and they snap to the nearest cell on drop; resize them from the bottom-right handle.
- **Rich text** (Tiptap): bold, italic, underline, strikethrough, subscript/superscript, color, highlighter, alignment, lists, indentation, line height, letter spacing, undo/redo. Double-click to type, `Esc` to exit.
- **Text block background** with color picker and opacity slider.
- **Auto height**: a text block grows with new lines and shrinks when they are deleted, never below the chosen height.
- **20 fonts** (14 self-hosted via `@fontsource`, with no requests to Google, plus 6 system fonts).
- **Lines** with thickness and color, **icons** (lucide set) with color, **images** uploaded from your computer.
- **PDF export** from the button at the bottom of the sidebar (or `Ctrl/Cmd+P`): after a short ad slot, the browser print dialog opens (UI, grid, outlines and watermark are hidden, A4 page with no margins).
- **Confirmation before leaving**, because the CV is not saved.

## Stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript, React Router |
| Build | Vite |
| Grid and resize | react-grid-layout 2.x |
| Text editor | Tiptap 3 |
| Styling | SCSS (sass-embedded), tokens and mixins in `src/styles` |
| Icons / fonts | lucide-react / @fontsource |
| Lint | oxlint |

## Getting started

```bash
npm install
npm run dev       # development server
npm run build     # typecheck + production build
npm run lint      # oxlint
npm run preview   # preview the build
```

## Structure

```
src/
├── features/editor/
│   ├── model/          # types, A4 grid, initial values, placement (pure logic)
│   ├── store/          # editor state (context + provider)
│   ├── catalog/        # font and icon lists
│   ├── blocks/         # block content (text, line, image, icon)
│   ├── dnd/            # drag from the sidebar and free movement of blocks
│   ├── Sheet/          # the sheet, shortcuts and protections
│   ├── SideBar/        # adding blocks and export
│   ├── TopBar/         # formatting of the selected block
│   ├── ExportDialog/   # ad slot before the PDF
│   └── LeaveGuard/     # confirmation before leaving
├── pages/              # Home, EditorPage, NotFoundPage
├── layouts/SiteLayout/ # site header + footer
├── components/         # Header, Footer
└── styles/             # reset, tokens (CSS variables) and mixins
```

## Design choices

- **Geometry in a single file**: `model/grid.ts` is the only source for sizes and grid (`1in = 25.4mm = 96px`); cells are derived from the sheet, so the grid fills it exactly.
- **Library-independent model**: blocks use coordinates in *cells*, not pixels, and do not depend on react-grid-layout.
- **Text as HTML**: formatting lives in the HTML produced by Tiptap, per selection, like in a word processor.
- **Smooth dragging**: while dragging, only the DOM node's style is updated; the cell is computed on drop.

## Known beta limitations

- The CV is **not saved**: reloading the page loses it.
- The print preview must be checked manually; PDF quality depends on the browser (Chrome/Edge recommended).
- Designed for desktop: dragging from the sidebar only works with a mouse (on touch, click still works).
- The ad slot is a placeholder; watermark and anti-screenshot protections are only deterrents, not a guarantee.

## Notes

Working instructions and detailed decisions for Claude Code are in [`CLAUDE.md`](./CLAUDE.md). The repo also ships a reusable agent skill in [`skills/react-a4-drag-drop-editor`](./skills/react-a4-drag-drop-editor).
