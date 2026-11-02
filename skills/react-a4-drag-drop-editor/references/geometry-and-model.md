# Geometry and model

## Single source of measurements

```ts
// model/grid.ts
export const MM_TO_PX = 96 / 25.4;      // CSS px at 96 dpi
export const SHEET_WIDTH_MM = 210;
export const SHEET_HEIGHT_MM = 297;
export const SHEET_WIDTH_PX = SHEET_WIDTH_MM * MM_TO_PX;
export const SHEET_HEIGHT_PX = SHEET_HEIGHT_MM * MM_TO_PX;

export const GRID_COLS = 24;
export const GRID_ROWS = 48;
// Dividing the sheet makes the grid fill it exactly.
export const COL_WIDTH_PX = SHEET_WIDTH_PX / GRID_COLS;
export const ROW_HEIGHT_PX = SHEET_HEIGHT_PX / GRID_ROWS;
```

A square-cell integer grid does not exist for 1:√2, so cells are rectangular by design.

## Model

```ts
export type BlockType = "text" | "image" | "line" | "icon";
export interface GridRect { x: number; y: number; w: number; h: number } // cells

export interface SheetItem {
  id: string;            // crypto.randomUUID()
  type: BlockType;
  layout: GridRect;
  minH: number;          // height chosen by the user; auto-height never goes below it
  content: string;       // HTML (text), data URL (image), icon name
  style: { color?: string; thickness?: number; background?: string; backgroundOpacity?: number };
}
```

## Placement helpers (pure)

- `isFree(rect, others)`: no overlap with any other rect and inside the sheet.
- `findFreeSpot(others, size, from?)`: nearest free cell to `from` (default top-left), `null` if the sheet is full.
- `growHeight(...)`: how many rows a block can grow before hitting another block or the sheet bottom.

Insertion policy: sidebar click → first free spot; drop on sheet → drop cell if free, else nearest free; sheet full → insert nothing.
