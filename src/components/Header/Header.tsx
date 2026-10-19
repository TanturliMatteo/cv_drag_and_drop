import { NavLink } from "react-router";
import styles from "./Header.module.scss";

function Header() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.link}>
        Home
      </NavLink>
      <NavLink to="/editor" target="_blank" className={styles.link}>
        Editor
      </NavLink>
    </header>
  );
}

export default Header;
