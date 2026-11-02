import { useEffect } from "react";

// Canc/Backspace elimina il blocco selezionato, ma non mentre si scrive:
// altrimenti cancellare una lettera cancellerebbe tutto il blocco.
export function useDeleteShortcut(
  selectedId: string | null,
  removeItem: (id: string) => void,
) {
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
}
