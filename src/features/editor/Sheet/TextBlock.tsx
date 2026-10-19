import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor as useTiptap } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useEditor } from "../editorStore";
import { LetterSpacing } from "../letterSpacing";
import type { SheetItem } from "../types";
import { ROW_HEIGHT_PX } from "./grid";
import { NO_DRAG } from "./noDrag";
import styles from "./Sheet.module.scss";

// Estensioni condivise da tutti i blocchi. StarterKit ridotto a ciò che serve a
// un CV: via titoli, citazioni, codice, link e riga orizzontale (hanno senso
// solo per documenti lunghi e aggiungerebbero comandi che la TopBar non offre).
const extensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    // Il paragrafo vuoto che aggiunge dopo un elenco finirebbe nel PDF come riga fantasma.
    trailingNode: false,
  }),
  TextStyleKit,
  LetterSpacing,
  Subscript,
  Superscript,
  TextAlign.configure({ types: ["paragraph"] }),
];

// Blocco di testo ricco. Tre stati: non selezionato (solo lettura), selezionato
// (la TopBar formatta tutto il blocco) e in modifica (doppio clic: si scrive e
// la TopBar formatta la selezione, come in Word).
export default function TextBlock({ item }: { item: SheetItem }) {
  const { selectedId, setActiveEditor, updateItem, fitHeight } = useEditor();
  const boxRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  // true se il testo non entra nel blocco (e sotto non c'è spazio per allungarlo).
  const [overflowing, setOverflowing] = useState(false);
  const selected = selectedId === item.id;
  // Deselezionato → si esce dalla modifica (aggiustamento durante il render,
  // il pattern React per derivare stato da una prop senza passare da un effect).
  if (!selected && editing) setEditing(false);

  const editor = useTiptap({
    extensions,
    content: item.content,
    editable: false,
    // L'HTML nello store è la fonte per salvataggio ed esportazione.
    onUpdate: ({ editor }) => updateItem(item.id, { content: editor.getHTML() }),
  });

  // Quando il blocco è selezionato la TopBar lo comanda; il cleanup scatta anche
  // passando da un blocco a un altro, quindi non restano editor "fantasma".
  useEffect(() => {
    if (!selected) return;
    setActiveEditor(editor);
    return () => setActiveEditor(null);
  }, [selected, editor, setActiveEditor]);

  // Se il testo non entra più nel blocco (es. Invio a fine riga) lo allungo verso
  // il basso di quante righe servono; fitHeight si ferma se sotto non c'è spazio.
  // Si ascolta "update" (cambia il documento), non ogni transazione.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // Il bordo rosso segue il confronto contenuto/blocco; setState non fa nulla
    // se il valore non cambia.
    const measure = () => setOverflowing(box.scrollHeight > box.clientHeight);
    const fit = () => {
      if (box.scrollHeight > box.clientHeight) {
        fitHeight(item.id, Math.ceil(box.scrollHeight / ROW_HEIGHT_PX));
      }
      measure();
    };
    editor.on("update", fit);
    // Quando il blocco cambia altezza (crescita automatica o resize a mano)
    // l'esito va rimisurato.
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => {
      editor.off("update", fit);
      observer.disconnect();
    };
  }, [editor, fitHeight, item.id]);

  // Si può scrivere solo in modifica; al passaggio entra il cursore a fine testo.
  useEffect(() => {
    const canEdit = editing && selected;
    editor.setEditable(canEdit);
    if (canEdit) editor.commands.focus("end");
  }, [editing, selected, editor]);

  return (
    <div
      ref={boxRef}
      className={`${styles.text} ${editing ? NO_DRAG : ""} ${overflowing ? styles.overflowing : ""}`}
      title={overflowing ? "Il testo non entra: ingrandisci il blocco" : undefined}
      // Doppio clic per modificare: il clic singolo serve a selezionare/trascinare.
      onDoubleClick={() => setEditing(true)}
      onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
