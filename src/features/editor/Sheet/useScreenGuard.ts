import { useEffect, useState } from "react";

// Deterrenti anti-screenshot. Nessun browser permette di bloccarli davvero:
// qui si sfoca il foglio quando la scheda viene nascosta o si preme Stamp, e si
// toglie il menu contestuale (salva immagine). Restano solo ostacoli, non garanzie.
export function useScreenGuard(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setHidden(true);
        // Svuota gli appunti, dove molti sistemi mettono lo screenshot.
        navigator.clipboard?.writeText("").catch(() => {});
      }
    };
    // Il foglio torna nitido quando si rilascia il tasto o si rientra nella scheda.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") setHidden(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return hidden;
}
