import { Baseline, Ban, Blend, MoveVertical, PaintBucket } from "lucide-react";
import { ICONS, iconFor } from "../catalog/iconRegistry";
import { DEFAULT_ICON, DEFAULT_THICKNESS } from "../model/defaults";
import { useEditor } from "../store/editorStore";
import { ColorTool, Group, IconSelect, SliderTool, Tool } from "./controls";
import TextTools from "./TextTools";
import styles from "./TopBar.module.scss";

// Spessori di linea selezionabili, in px.
const THICKNESSES = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20];

// Barra di formattazione: mostra gli strumenti del blocco selezionato.
function TopBar() {
  const { items, selectedId, activeEditor, updateItem } = useEditor();
  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className={styles.topbar}>
      {!selected && (
        <span className={styles.hint}>Seleziona un blocco per formattarlo</span>
      )}

      {selected?.type === "text" && activeEditor && (
        <TextTools editor={activeEditor} />
      )}

      {/* Lo sfondo è del blocco, non del testo: sta nello stile, come il colore di linea. */}
      {selected?.type === "text" && (
        <Group>
          <ColorTool
            label="Sfondo del blocco"
            Icon={PaintBucket}
            value={selected.style.background ?? "#ffffff"}
            onChange={(background) =>
              updateItem(selected.id, { style: { ...selected.style, background } })
            }
          />
          {selected.style.background && (
            <SliderTool
              label="Opacità sfondo"
              Icon={Blend}
              value={Math.round((selected.style.backgroundOpacity ?? 1) * 100)}
              onChange={(percent) =>
                updateItem(selected.id, {
                  style: { ...selected.style, backgroundOpacity: percent / 100 },
                })
              }
            />
          )}
          <Tool
            label="Rimuovi sfondo"
            Icon={Ban}
            disabled={!selected.style.background}
            onClick={() =>
              updateItem(selected.id, {
                style: {
                  ...selected.style,
                  background: undefined,
                  backgroundOpacity: undefined,
                },
              })
            }
          />
        </Group>
      )}

      {/* Il colore di linea e icona sta nello stile del blocco, non in un HTML. */}
      {(selected?.type === "line" || selected?.type === "icon") && (
        <Group>
          <ColorTool
            label="Colore"
            Icon={Baseline}
            value={selected.style.color ?? "#000000"}
            onChange={(color) =>
              updateItem(selected.id, { style: { ...selected.style, color } })
            }
          />
        </Group>
      )}

      {selected?.type === "line" && (
        <Group>
          <IconSelect
            label="Spessore"
            Icon={MoveVertical}
            value={selected.style.thickness ?? DEFAULT_THICKNESS}
            options={THICKNESSES}
            format={(v) => `${v} px`}
            onChange={(v) =>
              updateItem(selected.id, {
                style: { ...selected.style, thickness: Number(v) },
              })
            }
          />
        </Group>
      )}

      {selected?.type === "icon" && (
        <Group>
          {Object.keys(ICONS).map((name) => (
            <Tool
              key={name}
              label={name}
              Icon={iconFor(name)}
              active={(selected.content || DEFAULT_ICON) === name}
              onClick={() => updateItem(selected.id, { content: name })}
            />
          ))}
        </Group>
      )}

      {selected?.type === "image" && selected.content && (
        <button
          type="button"
          className={styles.textButton}
          onClick={() => updateItem(selected.id, { content: "" })}
        >
          Cambia immagine
        </button>
      )}
    </div>
  );
}
export default TopBar;
