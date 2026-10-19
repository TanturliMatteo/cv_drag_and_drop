import type { Editor } from "@tiptap/react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { EditorContext, type EditorStore, type ItemPatch } from "./editorStore";
import { DEFAULT_SIZE, findFreeSpot, growHeight } from "./placement";
import type { BlockType, SheetItem } from "./types";

// Contenuto iniziale dei blocchi appena aggiunti.
const DEFAULT_CONTENT: Record<BlockType, string> = {
  text: "<p>Nuovo testo</p>",
  line: "",
  image: "",
  icon: "star",
};

export default function EditorProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SheetItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const addItem = useCallback<EditorStore["addItem"]>(
    (type) => {
      const layout = findFreeSpot(
        items.map((i) => i.layout),
        DEFAULT_SIZE[type],
      );
      if (!layout) return false;
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type,
          layout,
          content: DEFAULT_CONTENT[type],
          style: {},
        },
      ]);
      return true;
    },
    [items],
  );

  // RGL notifica anche al mount e senza cambi reali: aggiorno lo stato solo se
  // una posizione è davvero diversa, così non si innescano render inutili.
  const updateLayouts = useCallback<EditorStore["updateLayouts"]>((rects) => {
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const r = rects.get(item.id);
        const l = item.layout;
        if (!r || (r.x === l.x && r.y === l.y && r.w === l.w && r.h === l.h)) {
          return item;
        }
        changed = true;
        return { ...item, layout: { x: r.x, y: r.y, w: r.w, h: r.h } };
      });
      return changed ? next : prev;
    });
  }, []);

  // Il testo che non entra nel blocco lo allunga in basso, finché c'è spazio.
  const fitHeight = useCallback((id: string, rows: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const others = prev.filter((i) => i.id !== id).map((i) => i.layout);
      const h = growHeight(item.layout, others, rows);
      if (h === item.layout.h) return prev;
      return prev.map((i) =>
        i.id === id ? { ...i, layout: { ...i.layout, h } } : i,
      );
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    // Se era selezionato, la selezione non deve puntare a un blocco sparito.
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const updateItem = useCallback((id: string, patch: ItemPatch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const value = useMemo(
    () => ({
      items,
      selectedId,
      activeEditor,
      setActiveEditor,
      addItem,
      removeItem,
      updateItem,
      select: setSelectedId,
      updateLayouts,
      fitHeight,
    }),
    [items, selectedId, activeEditor, addItem, removeItem, updateItem, updateLayouts, fitHeight],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}
