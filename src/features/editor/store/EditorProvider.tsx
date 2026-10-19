import type { Editor } from "@tiptap/react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, DEFAULT_SIZE } from "../model/defaults";
import { findFreeSpot, growHeight, isFree } from "../model/placement";
import type { SheetItem } from "../model/types";
import { EditorContext, type EditorStore, type ItemPatch } from "./editorStore";

// Stato dell'editor: elenco dei blocchi sul foglio, selezione e operazioni
// (aggiungi, sposta, ridimensiona, modifica, elimina).
export default function EditorProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SheetItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const addItem = useCallback<EditorStore["addItem"]>(
    (type, at) => {
      const occupied = items.map((i) => i.layout);
      const size = DEFAULT_SIZE[type];
      // Rilascio col mouse: se il punto scelto è libero lo uso, altrimenti il
      // posto libero più vicino. Click: primo posto libero.
      const wanted = at && { ...at, ...size };
      const layout =
        wanted && isFree(wanted, occupied)
          ? wanted
          : findFreeSpot(occupied, size, at);
      if (!layout) return false;
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type,
          layout,
          minH: layout.h,
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
        // Un'altezza diversa da quella in stato arriva solo da un resize a mano
        // (le variazioni automatiche passano da fitHeight e sono già in stato).
        return {
          ...item,
          layout: { x: r.x, y: r.y, w: r.w, h: r.h },
          minH: r.h !== l.h ? r.h : item.minH,
        };
      });
      return changed ? next : prev;
    });
  }, []);

  // Altezza automatica: il blocco segue il testo (rows = righe che servono).
  // Cresce verso il basso finché c'è spazio; quando il testo si accorcia si
  // restringe, ma mai sotto l'altezza scelta dall'utente (minH).
  const fitHeight = useCallback((id: string, rows: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const others = prev.filter((i) => i.id !== id).map((i) => i.layout);
      const wanted = Math.max(rows, item.minH);
      const h =
        wanted < item.layout.h
          ? wanted
          : growHeight(item.layout, others, wanted);
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
