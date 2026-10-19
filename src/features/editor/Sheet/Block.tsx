import { createElement, type ChangeEvent } from "react";
import { useEditor } from "../editorStore";
import type { SheetItem } from "../types";
import styles from "./Sheet.module.scss";
import { NO_DRAG } from "./noDrag";
import TextBlock from "./TextBlock";
import { iconFor } from "../iconRegistry";
import { DEFAULT_THICKNESS } from "../placement";

// Legge un file immagine come data URL: così il contenuto resta una semplice
// stringa nel modello e sopravvive a un eventuale salvataggio.
const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// Contenuto di un blocco in base al tipo. Il div esterno (posizione, selezione)
// resta in Sheet perché RGL deve poterlo clonare con le sue prop.
export default function Block({ item }: { item: SheetItem }) {
  const { updateItem } = useEditor();
  const { id, type, content, style } = item;

  switch (type) {
    case "text":
      return <TextBlock item={item} />;

    case "line":
      // Il contenitore centra la linea in verticale; lo spessore è in px.
      return (
        <div className={styles.lineBox}>
          <div
            className={styles.line}
            style={{
              height: style.thickness ?? DEFAULT_THICKNESS,
              background: style.color ?? "#000",
            }}
          />
        </div>
      );

    case "image": {
      const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Solo immagini: qualunque altro file viene ignorato.
        if (!file?.type.startsWith("image/")) return;
        updateItem(id, { content: await readImage(file) });
      };
      return content ? (
        <img className={styles.image} src={content} alt="" draggable={false} />
      ) : (
        <label className={`${styles.placeholder} ${NO_DRAG}`}>
          Carica immagine
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>
      );
    }

    case "icon":
      return (
        <div className={styles.icon} style={{ color: style.color }}>
          {createElement(iconFor(content), { strokeWidth: 1.75 })}
        </div>
      );
  }
}
