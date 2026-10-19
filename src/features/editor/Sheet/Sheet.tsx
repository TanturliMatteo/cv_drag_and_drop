import { useCallback, type CSSProperties } from "react";
import { X } from "lucide-react";
import ReactGridLayout, {
  getCompactor,
  type Layout,
  type LayoutItem,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Block from "../blocks/Block";
import { dragState } from "../dnd/dragState";
import { NO_DRAG, startFreeDrag } from "../dnd/freeDrag";
import { DEFAULT_SIZE } from "../model/defaults";
import {
  COL_WIDTH_PX,
  GRID_COLS,
  GRID_ROWS,
  ROW_HEIGHT_PX,
  SHEET_HEIGHT_PX,
  SHEET_WIDTH_PX,
} from "../model/grid";
import type { GridRect, SheetItem } from "../model/types";
import { useEditor } from "../store/editorStore";
import styles from "./Sheet.module.scss";
import { useDeleteShortcut } from "./useDeleteShortcut";
import { useScreenGuard } from "./useScreenGuard";

// Misure della griglia come variabili CSS: lo SCSS disegna le linee senza
// ripetere i numeri.
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

// Posizionamento libero (niente compattazione verso l'alto) e niente sovrapposizioni.
const compactor = getCompactor(null, false, true);

// Il trascinamento dei blocchi non è di RGL ma di freeDrag.ts (movimento al
// pixel, aggancio alla cella solo al rilascio): RGL gestisce solo il resize e
// il rilascio dalla sidebar.
const dragConfig = { enabled: false };

// Rilascio dalla sidebar: dimensione del blocco in arrivo = quella del tipo
// trascinato; senza un blocco della sidebar in corso (es. file dal desktop) rifiuta.
const dropConfig = {
  enabled: true,
  defaultItem: DEFAULT_SIZE.text,
  onDragOver: () => (dragState.type ? DEFAULT_SIZE[dragState.type] : false),
};

// Con autoSize={false} RGL non imposta l'altezza del contenitore, ma i vincoli
// di bordo la usano: la fisso io all'altezza esatta del foglio.
const containerStyle: CSSProperties = { height: SHEET_HEIGHT_PX };

// Il modello dati non dipende da RGL: la conversione vive solo qui.
const toLayout = (items: SheetItem[]): LayoutItem[] =>
  items.map(({ id, layout }) => ({ i: id, ...layout }));

const fromLayout = (layout: Layout): Map<string, GridRect> =>
  new Map(layout.map(({ i, x, y, w, h }) => [i, { x, y, w, h }]));

export default function Sheet() {
  const { items, selectedId, updateLayouts, select, removeItem, addItem } =
    useEditor();
  const blurred = useScreenGuard();
  useDeleteShortcut(selectedId, removeItem);

  const handleLayoutChange = useCallback(
    (layout: Layout) => updateLayouts(fromLayout(layout)),
    [updateLayouts],
  );

  // Rilascio dalla sidebar: RGL ha già calcolato la cella sotto il mouse; il
  // blocco lo crea addItem, che gestisce collisioni e foglio pieno.
  const handleDrop = useCallback(
    (_layout: Layout, dropped: LayoutItem | undefined) => {
      const type = dragState.type;
      dragState.type = null;
      if (type && dropped) addItem(type, { x: dropped.x, y: dropped.y });
    },
    [addItem],
  );

  return (
    <div
      className={`${styles.sheet} ${blurred ? styles.blurred : ""}`}
      style={gridVars}
      // Niente menu contestuale ("salva immagine"), tranne nel testo per incolla/correzione.
      onContextMenu={(e) => {
        if (!(e.target as Element).closest("[contenteditable]")) e.preventDefault();
      }}
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
        dropConfig={dropConfig}
        compactor={compactor}
        autoSize={false}
        style={containerStyle}
        onLayoutChange={handleLayoutChange}
        onDrop={handleDrop}
      >
        {/* RGL clona questo div aggiungendo posizione e maniglia di resize:
            deve restare un elemento DOM diretto, non un componente. */}
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <div
              key={item.id}
              className={`${styles.item} ${selected ? styles.selected : ""}`}
              onClick={() => select(item.id)}
              onPointerDown={(e) =>
                startFreeDrag(
                  e,
                  item.layout,
                  items.filter((i) => i.id !== item.id).map((i) => i.layout),
                  (rect) => updateLayouts(new Map([[item.id, rect]])),
                )
              }
            >
              <div className={styles.content}>
                <Block item={item} />
              </div>
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
      {/* Watermark: sopra i blocchi ma trasparente al mouse; assente nel PDF. */}
      <div className={styles.watermark} aria-hidden="true" />
    </div>
  );
}
