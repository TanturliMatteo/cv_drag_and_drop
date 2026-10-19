import { Link } from "react-router";
import { FileDown, GripVertical, Type } from "lucide-react";
import styles from "./Home.module.scss";

// Vantaggi mostrati sotto il titolo: breve, tre punti.
const FEATURES = [
  { Icon: GripVertical, title: "Trascina e rilascia", text: "Disponi testo, linee, immagini e icone su un foglio A4 con griglia." },
  { Icon: Type, title: "Testo completo", text: "Venti font, colori, elenchi, interlinea: formatti come in un word processor." },
  { Icon: FileDown, title: "PDF in un clic", text: "Esporta un A4 pronto da inviare, senza registrazione." },
];

function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Il tuo CV, come lo vuoi tu.</h1>
        <p className={styles.lead}>
          Crea un curriculum su misura trascinando gli elementi sul foglio, poi
          scaricalo in PDF.
        </p>
        <Link to="/editor" className={styles.cta}>
          Inizia ora
        </Link>
      </section>
      <section className={styles.features}>
        {FEATURES.map(({ Icon, title, text }) => (
          <article key={title} className={styles.card}>
            <Icon size={22} strokeWidth={1.75} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
export default Home;
