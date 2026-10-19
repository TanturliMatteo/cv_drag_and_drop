import type { ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  AArrowDown,
  AArrowUp,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Eraser,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  MoveHorizontal,
  MoveVertical,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEditor } from "../editorStore";
import { DEFAULT_FONT, FONTS } from "../fonts";
import { ICONS, iconFor } from "../iconRegistry";
import { DEFAULT_THICKNESS } from "../placement";
import styles from "./TopBar.module.scss";

// Dimensioni in px, da 4 a 72 di due in due. Il testo parte da 14px (vedi Sheet.module.scss).
const DEFAULT_SIZE_PX = 14;
const SIZES = Array.from({ length: 35 }, (_, i) => 4 + i * 2);
const THICKNESSES = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20];
const LINE_HEIGHTS = ["1", "1.15", "1.3", "1.5", "2"];
const LETTER_SPACINGS = ["-0.5px", "0px", "0.5px", "1px", "2px", "3px"];

const ALIGNS = [
  { value: "left", label: "Allinea a sinistra", Icon: AlignLeft },
  { value: "center", label: "Centra", Icon: AlignCenter },
  { value: "right", label: "Allinea a destra", Icon: AlignRight },
  { value: "justify", label: "Giustifica", Icon: AlignJustify },
] as const;

// Il nome del font torna dal browser con virgolette e fallback diversi da quelli
// salvati: confronto solo la prima famiglia, senza virgolette.
const firstFamily = (css: string | null | undefined) =>
  css?.split(",")[0].replace(/["']/g, "").trim();

// Pulsante a icona. onMouseDown+preventDefault evita che il clic tolga il
// focus (e quindi la selezione) dal testo che si sta formattando.
function Tool(props: {
  label: string;
  Icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.tool} ${props.active ? styles.active : ""}`}
      title={props.label}
      aria-label={props.label}
      aria-pressed={props.active}
      disabled={props.disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={props.onClick}
    >
      <props.Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

// Selettore colore: icona con barretta del colore corrente. L'<input> nativo
// è trasparente e copre tutto il pulsante, così il clic apre il selettore.
function ColorTool(props: {
  label: string;
  Icon: LucideIcon;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <label className={styles.tool} title={props.label}>
      <props.Icon size={16} strokeWidth={1.75} />
      <span className={styles.swatch} style={{ background: props.value }} />
      <input
        className={styles.colorInput}
        type="color"
        aria-label={props.label}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

// Menu a tendina con un'icona davanti (interlinea, spaziatura, spessore).
function IconSelect(props: {
  label: string;
  Icon: LucideIcon;
  value: string | number;
  options: (string | number)[];
  format?: (v: string | number) => string;
  onChange: (value: string) => void;
}) {
  const fmt = props.format ?? String;
  // Un valore fuori elenco (es. incollato) resta comunque visibile.
  const options = props.options.includes(props.value)
    ? props.options
    : [props.value, ...props.options];
  return (
    <label className={styles.iconSelect} title={props.label}>
      <props.Icon size={15} strokeWidth={1.75} />
      <select
        aria-label={props.label}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {fmt(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

const Group = ({ children }: { children: ReactNode }) => (
  <div className={styles.group}>{children}</div>
);

// Strumenti di formattazione del testo, comandati dall'editor del blocco attivo.
function TextTools({ editor }: { editor: Editor }) {
  // useEditorState rilegge lo stato a ogni transazione ma ridisegna la barra solo
  // se il risultato cambia: la selezione nel testo aggiorna i pulsanti.
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const a = e?.getAttributes("textStyle") ?? {};
      return {
        bold: !!e?.isActive("bold"),
        italic: !!e?.isActive("italic"),
        underline: !!e?.isActive("underline"),
        strike: !!e?.isActive("strike"),
        sub: !!e?.isActive("subscript"),
        sup: !!e?.isActive("superscript"),
        bullet: !!e?.isActive("bulletList"),
        ordered: !!e?.isActive("orderedList"),
        align:
          ALIGNS.find((al) => e?.isActive({ textAlign: al.value }))?.value ??
          "left",
        font: firstFamily(a.fontFamily) ?? firstFamily(DEFAULT_FONT),
        size: a.fontSize ? parseFloat(a.fontSize) : DEFAULT_SIZE_PX,
        color: (a.color as string | undefined) ?? "#000000",
        background: (a.backgroundColor as string | undefined) ?? "#ffff00",
        lineHeight: (a.lineHeight as string | undefined) ?? "1.3",
        letterSpacing: (a.letterSpacing as string | undefined) ?? "0px",
        canUndo: !!e?.can().undo(),
        canRedo: !!e?.can().redo(),
        canIndent: !!e?.can().sinkListItem("listItem"),
        canOutdent: !!e?.can().liftListItem("listItem"),
      };
    },
  });

  // Fuori dalla modifica non c'è cursore: il comando vale per tutto il blocco
  // (selectAll). In modifica vale per la selezione, con il focus riportato nel testo.
  const run = () => {
    const c = editor.chain();
    return editor.isEditable ? c.focus() : c.selectAll();
  };

  // A+ / A−: come in Word, passano alla dimensione successiva/precedente dell'elenco.
  const stepSize = (dir: 1 | -1) => {
    const next =
      dir === 1
        ? SIZES.find((n) => n > s.size)
        : [...SIZES].reverse().find((n) => n < s.size);
    if (next) run().setFontSize(`${next}px`).run();
  };

  return (
    <>
      <Group>
        <Tool
          label="Annulla"
          Icon={Undo2}
          disabled={!s.canUndo}
          onClick={() => run().undo().run()}
        />
        <Tool
          label="Ripeti"
          Icon={Redo2}
          disabled={!s.canRedo}
          onClick={() => run().redo().run()}
        />
      </Group>

      <Group>
        <select
          className={styles.font}
          aria-label="Font"
          value={s.font}
          onChange={(e) => {
            const f = FONTS.find((o) => o.label === e.target.value);
            if (f) run().setFontFamily(f.stack).run();
          }}
        >
          {/* Se la selezione ha un font fuori elenco, resta comunque visibile. */}
          {!FONTS.some((f) => f.label === s.font) && (
            <option value={s.font}>{s.font}</option>
          )}
          {FONTS.map((f) => (
            <option key={f.label} value={f.label} style={{ fontFamily: f.stack }}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className={styles.size}
          aria-label="Dimensione (px)"
          title="Dimensione (px)"
          value={s.size}
          onChange={(e) => run().setFontSize(`${e.target.value}px`).run()}
        >
          {!SIZES.includes(s.size) && <option value={s.size}>{s.size}</option>}
          {SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Tool label="Aumenta dimensione" Icon={AArrowUp} onClick={() => stepSize(1)} />
        <Tool label="Riduci dimensione" Icon={AArrowDown} onClick={() => stepSize(-1)} />
      </Group>

      <Group>
        <Tool label="Grassetto" Icon={Bold} active={s.bold} onClick={() => run().toggleBold().run()} />
        <Tool label="Corsivo" Icon={Italic} active={s.italic} onClick={() => run().toggleItalic().run()} />
        <Tool label="Sottolineato" Icon={Underline} active={s.underline} onClick={() => run().toggleUnderline().run()} />
        <Tool label="Barrato" Icon={Strikethrough} active={s.strike} onClick={() => run().toggleStrike().run()} />
        <Tool label="Pedice" Icon={Subscript} active={s.sub} onClick={() => run().toggleSubscript().run()} />
        <Tool label="Apice" Icon={Superscript} active={s.sup} onClick={() => run().toggleSuperscript().run()} />
      </Group>

      <Group>
        <ColorTool
          label="Colore testo"
          Icon={Baseline}
          value={s.color}
          onChange={(c) => run().setColor(c).run()}
        />
        <ColorTool
          label="Evidenziatore"
          Icon={Highlighter}
          value={s.background}
          onChange={(c) => run().setBackgroundColor(c).run()}
        />
        <Tool
          label="Rimuovi evidenziatore"
          Icon={Eraser}
          onClick={() => run().unsetBackgroundColor().run()}
        />
        <Tool
          label="Cancella formattazione"
          Icon={RemoveFormatting}
          onClick={() => run().unsetAllMarks().unsetTextAlign().run()}
        />
      </Group>

      <Group>
        {ALIGNS.map(({ value, label, Icon }) => (
          <Tool
            key={value}
            label={label}
            Icon={Icon}
            active={s.align === value}
            onClick={() => run().setTextAlign(value).run()}
          />
        ))}
      </Group>

      <Group>
        <Tool label="Elenco puntato" Icon={List} active={s.bullet} onClick={() => run().toggleBulletList().run()} />
        <Tool label="Elenco numerato" Icon={ListOrdered} active={s.ordered} onClick={() => run().toggleOrderedList().run()} />
        <Tool label="Riduci rientro" Icon={IndentDecrease} disabled={!s.canOutdent} onClick={() => run().liftListItem("listItem").run()} />
        <Tool label="Aumenta rientro" Icon={IndentIncrease} disabled={!s.canIndent} onClick={() => run().sinkListItem("listItem").run()} />
      </Group>

      <Group>
        <IconSelect
          label="Interlinea"
          Icon={MoveVertical}
          value={s.lineHeight}
          options={LINE_HEIGHTS}
          onChange={(v) => run().setLineHeight(v).run()}
        />
        <IconSelect
          label="Spaziatura lettere"
          Icon={MoveHorizontal}
          value={s.letterSpacing}
          options={LETTER_SPACINGS}
          onChange={(v) => run().setLetterSpacing(v).run()}
        />
      </Group>
    </>
  );
}

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
              active={(selected.content || "star") === name}
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
