import { Link, NavLink } from "react-router";
import { FilePenLine } from "lucide-react";
import styles from "./Header.module.scss";

function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <FilePenLine size={20} strokeWidth={1.75} />
        CV Drag &amp; Drop
      </Link>
      <nav className={styles.nav}>
        <NavLink to="/" end className={styles.link}>
          Home
        </NavLink>
        <NavLink to="/editor" className={styles.cta}>
          Crea il tuo CV
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
