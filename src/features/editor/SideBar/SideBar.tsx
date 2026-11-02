import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, FileDown, Image, Minus, Shapes, Type, type LucideIcon } from "lucide-react";
import ExportDialog from "../ExportDialog/ExportDialog";
import { dragState } from "../dnd/dragState";
import { useEditor } from "../store/editorStore";
import type { BlockType } from "../model/types";
import styles from "./SideBar.module.scss";

// Pulsanti per aggiungere blocchi; l'ordine è quello mostrato.
const BLOCKS: { type: BlockType; label: string; Icon: LucideIcon }[] = [
  { type: "text", label: "Testo", Icon: Type },
  { type: "line", label: "Linea", Icon: Minus },
  { type: "image", label: "Immagine", Icon: Image },
  { type: "icon", label: "Icona", Icon: Shapes },
];

function SideBar() {
  const { addItem } = useEditor();
  const [full, setFull] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Ctrl/Cmd+P passa dall'inserzione come il pulsante, invece di stampare subito.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setExporting(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Chiude il dialog e stampa dopo un frame, così il dialog non finisce nel PDF.
  const confirmExport = () => {
    setExporting(false);
    requestAnimationFrame(() => window.print());
  };

  const handleAdd = (type: BlockType) => setFull(!addItem(type));

  return (
    <div className={styles.sidebar}>
      <Link to="/" className={styles.brand}>
        <ArrowLeft size={16} strokeWidth={1.75} />
        CV Drag &amp; Drop
      </Link>

      <section className={styles.section}>
        <h2 className={styles.title}>Elementi</h2>
        {BLOCKS.map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            className={styles.add}
            onClick={() => handleAdd(type)}
            // Trascinabile sul foglio (vedi Sheet); il click resta come alternativa.
            draggable
            onDragStart={(e) => {
              dragState.type = type;
              e.dataTransfer.effectAllowed = "copy";
              // Firefox non avvia il drag senza dati.
              e.dataTransfer.setData("text/plain", type);
            }}
            onDragEnd={() => {
              dragState.type = null;
            }}
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </button>
        ))}
        {full && (
          <p role="alert" className={styles.alert}>
            Non c'è più spazio sul foglio.
          </p>
        )}
      </section>

      {/* Esporta: prima l'inserzione (ExportDialog), poi il browser genera il PDF
          dalla stampa; il CSS @media print mostra solo il foglio. */}
      <button
        type="button"
        className={styles.export}
        onClick={() => setExporting(true)}
      >
        <FileDown size={18} strokeWidth={1.75} />
        Esporta PDF
      </button>

      <ExportDialog
        open={exporting}
        onClose={() => setExporting(false)}
        onConfirm={confirmExport}
      />
    </div>
  );
}
export default SideBar;
