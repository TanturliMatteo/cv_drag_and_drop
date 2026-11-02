import { Link } from "react-router";
import styles from "./NotFoundPage.module.scss";

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <h1>404</h1>
      <p>Pagina non trovata.</p>
      <Link to="/">Torna alla home</Link>
    </div>
  );
}

export default NotFoundPage;
