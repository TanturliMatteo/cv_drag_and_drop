# Tiptap 3 text block

## Three states

| State | Behaviour |
|---|---|
| Not selected | read-only editor |
| Selected | toolbar formats the whole block (`selectAll` then apply mark) |
| Editing | entered by double click, left with Esc; add the `no-drag` class so dragging does not start |

## Setup

- Use a reduced `StarterKit`; enable only the marks/nodes the UI exposes.
- Font size in px (e.g. 4–72, step 2, default 14) and letter spacing via small custom extensions on the `textStyle` mark.
- Toolbar buttons: `onMouseDown={e => e.preventDefault()}` plus the action, so the editor keeps focus.
- Content is stored as HTML in `SheetItem.content`.

## Auto-height

- `minH` = height chosen by the user (at creation and on manual resize only).
- On every editor `update`: measure the real content height, convert to rows, set block height to `max(rows, minH)`, limited by `growHeight` (free space below).
- Result: grows with new lines when there is room, shrinks on delete, never below `minH`.
- If there is no room, keep the text clipped and show an overflow indicator (hide it in print).

## Block chrome

- Clip content with `overflow: clip` on an inner `.content` wrapper, **not** `hidden` (browsers scroll `hidden` containers when the cursor leaves the edge during selection), and not on the block itself, so the delete button can protrude from the corner.
- Background: `color-mix(in srgb, <color> <opacity>%, transparent)` so the text stays fully opaque.
