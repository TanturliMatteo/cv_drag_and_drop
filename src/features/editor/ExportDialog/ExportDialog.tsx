import { useEffect, useRef, useState } from "react";
import { FileDown, X } from "lucide-react";
import styles from "./ExportDialog.module.scss";

// Secondi di attesa prima che il download si sblocchi (durata dell'inserzione).
const AD_SECONDS = 5;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Finestra mostrata prima della conversione in PDF: inserzione + conto alla
// rovescia. <dialog> dà gratis focus trap, Esc e sfondo oscurato.
export default function ExportDialog({ open, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [left, setLeft] = useState(AD_SECONDS);

  // Apre/chiude il dialog nativo seguendo la prop e riavvia il conto.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setLeft(AD_SECONDS);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Un tick al secondo finché il dialog è aperto e il conto non è a zero.
  useEffect(() => {
    if (!open || left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, left]);

  return (
    // onClose copre anche Esc: mantiene sincronizzato lo stato del genitore.
    <dialog ref={ref} className={styles.dialog} onClose={onClose}>
      <button type="button" className={styles.close} aria-label="Chiudi" onClick={onClose}>
        <X size={16} />
      </button>
      <h2 className={styles.title}>Il tuo CV è pronto</h2>
      <p className={styles.text}>Il download inizia dopo questo breve messaggio.</p>

      {/* Segnaposto dell'inserzione: qui andrà il codice del circuito pubblicitario. */}
      <div className={styles.ad} aria-label="Spazio pubblicitario">
        Spazio pubblicitario
      </div>

      <button
        type="button"
        className={styles.confirm}
        disabled={left > 0}
        onClick={onConfirm}
      >
        <FileDown size={18} strokeWidth={1.75} />
        {left > 0 ? `Attendi ${left}s…` : "Scarica PDF"}
      </button>
    </dialog>
  );
}
