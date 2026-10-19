import { useCallback, useEffect, type CSSProperties } from "react";
import { X } from "lucide-react";
import ReactGridLayout, {
  getCompactor,
  type Layout,
  type LayoutItem,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./Sheet.module.scss";
import Block from "./Block";
import { NO_DRAG } from "./noDrag";
import {
  COL_WIDTH_PX,
  GRID_COLS,
  GRID_ROWS,
  ROW_HEIGHT_PX,
  SHEET_HEIGHT_PX,
  SHEET_WIDTH_PX,
} from "./grid";
import { useEditor } from "../editorStore";
import type { GridRect, SheetItem } from "../types";

const gridVars = {
  "--col-width": `${COL_WIDTH_PX}px`,
  "--row-height": `${ROW_HEIGHT_PX}px`,
} as CSSProperties;

// Configurazione fissa: il foglio è sempre 210mm, quindi niente misure dinamiche.
// Margini e padding a 0 → una cella è esattamente una frazione del foglio.
const gridConfig = {
  cols: GRID_COLS,
  rowHeight: ROW_HEIGHT_PX,
  margin: [0, 0] as const,
  containerPadding: [0, 0] as const,
  maxRows: GRID_ROWS,
};
// Posizionamento libero (niente compattazione verso l'alto) e niente
// sovrapposizioni: un blocco che finisce su un altro torna dov'era.
const compactor = getCompactor(null, false, true);
// Con autoSize={false} RGL non imposta l'altezza del contenitore, ma i vincoli
// di bordo la usano: la fisso io all'altezza esatta del foglio.
const containerStyle: CSSProperties = { height: SHEET_HEIGHT_PX };
// bounded: i blocchi non escono dal foglio. cancel: i controlli interni
// (textarea, pulsante ×, caricamento immagine) non devono avviare un drag.
const dragConfig = { bounded: true, cancel: `.${NO_DRAG}` };

// Il modello dati non dipende da RGL: la conversione vive solo qui.
const toLayout = (items: SheetItem[]): LayoutItem[] =>
  items.map(({ id, layout }) => ({ i: id, ...layout }));

const fromLayout = (layout: Layout): Map<string, GridRect> =>
  new Map(layout.map(({ i, x, y, w, h }) => [i, { x, y, w, h }]));

export default function Sheet() {
  const { items, selectedId, updateLayouts, select, removeItem } = useEditor();

  const handleLayoutChange = useCallback(
    (layout: Layout) => updateLayouts(fromLayout(layout)),
    [updateLayouts],
  );

  // Canc/Backspace elimina il blocco selezionato, ma non mentre si scrive:
  // altrimenti cancellare una lettera cancellerebbe tutto il blocco.
  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      // target può non essere un elemento (es. window): in quel caso non si sta scrivendo.
      const typing =
        e.target instanceof Element &&
        e.target.closest("input, textarea, select, [contenteditable]");
      if (typing) return;
      e.preventDefault();
      removeItem(selectedId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, removeItem]);

  return (
    <div
      className={styles.sheet}
      style={gridVars}
      // Clic sul foglio vuoto (fuori da qualunque blocco) → deseleziona.
      onClick={(e) => {
        if (!(e.target as Element).closest(".react-grid-item")) select(null);
      }}
    >
      <ReactGridLayout
        width={SHEET_WIDTH_PX}
        layout={toLayout(items)}
        gridConfig={gridConfig}
        dragConfig={dragConfig}
        compactor={compactor}
        autoSize={false}
        style={containerStyle}
        onLayoutChange={handleLayoutChange}
      >
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <div
              key={item.id}
              className={`${styles.item} ${selected ? styles.selected : ""}`}
              onClick={() => select(item.id)}
            >
              <Block item={item} />
              {selected && (
                <button
                  type="button"
                  className={`${styles.remove} ${NO_DRAG}`}
                  aria-label="Elimina blocco"
                  onClick={() => removeItem(item.id)}
                >
                  <X size={12} strokeWidth={2.25} />
                </button>
              )}
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
}
