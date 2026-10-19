import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./TopBar.module.scss";

// Piccoli controlli riusati dalla barra: pulsante a icona, selettore colore,
// menu con icona e gruppo di controlli.

// Pulsante a icona. onMouseDown+preventDefault evita che il clic tolga il
// focus (e quindi la selezione) dal testo che si sta formattando.
export function Tool(props: {
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
export function ColorTool(props: {
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
export function IconSelect(props: {
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

export const Group = ({ children }: { children: ReactNode }) => (
  <div className={styles.group}>{children}</div>
);

// Pulsante a icona che apre un piccolo pannello flottante con uno slider minimale
// (es. opacità). Il pannello è in posizione assoluta sotto il pulsante: nella
// barra occupa solo 32px e non ne cambia mai la larghezza né l'altezza.
export function SliderTool(props: {
  label: string;
  Icon: LucideIcon;
  value: number; // 0–100
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Si chiude con un clic fuori o con Esc.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={boxRef} className={styles.popoverAnchor}>
      <Tool
        label={`${props.label}: ${props.value}%`}
        Icon={props.Icon}
        active={open}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className={styles.popover}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            aria-label={props.label}
            value={props.value}
            onChange={(e) => props.onChange(Number(e.target.value))}
          />
          <output>{props.value}%</output>
        </div>
      )}
    </div>
  );
}
