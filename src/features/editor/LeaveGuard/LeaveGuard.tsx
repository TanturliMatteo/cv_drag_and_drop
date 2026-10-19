import { useEffect, useRef } from "react";
import { useBlocker } from "react-router";
import { useEditor } from "../store/editorStore";
import styles from "./LeaveGuard.module.scss";

// Chiede conferma prima di perdere il lavoro (nulla è salvato): chiusura o
// ricarica della scheda con beforeunload, navigazione interna (link, tasto
// indietro) con useBlocker. Attivo solo se sul foglio c'è almeno un blocco.
export default function LeaveGuard() {
  const { items } = useEditor();
  const dirty = items.length > 0;
  const ref = useRef<HTMLDialogElement>(null);

  // Il browser mostra un suo messaggio fisso: il testo non è personalizzabile.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const blocker = useBlocker(dirty);

  // Apre il dialog nativo solo mentre la navigazione è bloccata.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (blocker.state === "blocked" && !dialog.open) dialog.showModal();
    else if (blocker.state !== "blocked" && dialog.open) dialog.close();
  }, [blocker.state]);

  return (
    // onCancel (Esc) = restare: la navigazione torna sbloccata.
    <dialog
      ref={ref}
      className={styles.dialog}
      onCancel={() => blocker.state === "blocked" && blocker.reset()}
    >
      <h2 className={styles.title}>Uscire dall'editor?</h2>
      <p className={styles.text}>
        Il CV non viene salvato: se esci, perdi le modifiche.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.stay}
          onClick={() => blocker.state === "blocked" && blocker.reset()}
        >
          Resta
        </button>
        <button
          type="button"
          className={styles.leave}
          onClick={() => blocker.state === "blocked" && blocker.proceed()}
        >
          Esci
        </button>
      </div>
    </dialog>
  );
}
