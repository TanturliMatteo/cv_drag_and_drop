import { useState } from "react";
import { FileDown, Image, Minus, Shapes, Type, type LucideIcon } from "lucide-react";
import { useEditor } from "../editorStore";
import type { BlockType } from "../types";
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

  const handleAdd = (type: BlockType) => setFull(!addItem(type));

  return (
    <div className={styles.sidebar}>
      <section className={styles.section}>
        <h2 className={styles.title}>Elementi</h2>
        {BLOCKS.map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            className={styles.add}
            onClick={() => handleAdd(type)}
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

      {/* Esporta: il browser genera il PDF dalla stampa; il CSS @media print
          mostra solo il foglio (vedi Sheet.module.scss e EditorPage.module.scss).
          La formattazione dei blocchi sta nella TopBar. */}
      <button
        type="button"
        className={styles.export}
        onClick={() => window.print()}
      >
        <FileDown size={18} strokeWidth={1.75} />
        Esporta PDF
      </button>
    </div>
  );
}
export default SideBar;
