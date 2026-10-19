import { createContext, useContext } from "react";
import type { Editor } from "@tiptap/react";
import type { BlockType, GridRect, SheetItem } from "../model/types";

// Cosa si può cambiare in un blocco dopo la creazione (posizione a parte).
export type ItemPatch = Partial<Pick<SheetItem, "content" | "style">>;

// Stato condiviso tra Sidebar (aggiunge) e Sheet (mostra, sposta, modifica).
export type EditorStore = {
  items: SheetItem[];
  selectedId: string | null;
  // Editor Tiptap del blocco di testo selezionato: la TopBar lo comanda.
  activeEditor: Editor | null;
  setActiveEditor: (editor: Editor | null) => void;
  // false se non c'è spazio libero sul foglio. `at` = punto di rilascio (celle).
  addItem: (type: BlockType, at?: { x: number; y: number }) => boolean;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: ItemPatch) => void;
  select: (id: string | null) => void;
  // Adegua l'altezza di un blocco di testo alle righe che servono (cresce se c'è
  // spazio, si restringe fino all'altezza scelta dall'utente).
  fitHeight: (id: string, rows: number) => void;
  // Aggiorna le posizioni dopo drag/resize; id sconosciuti ignorati.
  updateLayouts: (rects: ReadonlyMap<string, GridRect>) => void;
};

export const EditorContext = createContext<EditorStore | null>(null);

export function useEditor(): EditorStore {
  const store = useContext(EditorContext);
  // Errore esplicito: usare l'hook fuori dal Provider è sempre un bug.
  if (!store) throw new Error("useEditor va usato dentro <EditorProvider>");
  return store;
}
