# react-grid-layout v2 setup (verified on 2.3.0)

```tsx
import ReactGridLayout, { getCompactor } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const gridConfig = {
  cols: GRID_COLS,
  rowHeight: ROW_HEIGHT_PX,
  margin: [0, 0] as const,
  containerPadding: [0, 0] as const,
};
// (compactType null, allowOverlap false, preventCollision true) = free placement, no overlaps
const compactor = getCompactor(null, false, true);

<ReactGridLayout
  width={SHEET_WIDTH_PX}            // required in v2; fixed sheet, so no measuring
  layout={toLayout(items)}          // explicit layout, no data-grid
  gridConfig={gridConfig}
  dragConfig={{ enabled: false }}   // see free-drag.md
  resizeConfig={{ enabled: true, handles: ["n","s","e","w","ne","nw","se","sw"] }}
  dropConfig={{
    enabled: true,
    defaultItem: DEFAULT_SIZE.text,
    // accept only drags started from your sidebar; returning false rejects
    onDragOver: () => (dragState.type ? DEFAULT_SIZE[dragState.type] : false),
  }}
  compactor={compactor}
  autoSize={false}
  style={{ height: SHEET_HEIGHT_PX }} // autoSize=false leaves the container at height 0
/>
```

## Notes

- Sidebar drag: set a module-level `dragState.type` on `dragstart` of the sidebar button, clear it on `dragend`. `onDrop` then reads it to know which block to create.
- Keep the `SheetItem ↔ RGL layout` conversion in the Sheet component only.
- Hide the RGL placeholder with CSS (`.react-grid-placeholder { display: none }`) if it looks jumpy with a custom drag.
- Resize handler: write the new height to `minH` only for user-made resizes, not for programmatic auto-height changes.
