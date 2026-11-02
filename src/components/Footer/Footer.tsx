import styles from "./Footer.module.scss";

// Anno calcolato una volta al caricamento del modulo, non a ogni render.
const YEAR = new Date().getFullYear();

function Footer() {
  return (
    <footer className={styles.footer}>
      © {YEAR} CV Drag &amp; Drop · Creato con Claude Code
    </footer>
  );
}
export default Footer;
