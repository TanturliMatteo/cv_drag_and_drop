// I 20 font disponibili nel CV. Quelli web arrivano da @fontsource (file serviti da
// noi, nessuna richiesta a Google, quindi niente problemi di privacy/GDPR);
// i sei di sistema sono quelli più raccomandati per i CV e non pesano nulla.
// Solo il sottoinsieme latin e solo regular/bold + corsivi: basta per le lingue
// dell'Europa occidentale e tiene leggero il sito. Il browser scarica un file
// solo quando il font è davvero usato (unicode-range di @fontsource).
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-400-italic.css";
import "@fontsource/roboto/latin-700.css";
import "@fontsource/roboto/latin-700-italic.css";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-400-italic.css";
import "@fontsource/open-sans/latin-700.css";
import "@fontsource/open-sans/latin-700-italic.css";
import "@fontsource/lato/latin-400.css";
import "@fontsource/lato/latin-400-italic.css";
import "@fontsource/lato/latin-700.css";
import "@fontsource/lato/latin-700-italic.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-400-italic.css";
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/montserrat/latin-700-italic.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-400-italic.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-700-italic.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-400-italic.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-700-italic.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-400-italic.css";
import "@fontsource/source-sans-3/latin-700.css";
import "@fontsource/source-sans-3/latin-700-italic.css";
import "@fontsource/raleway/latin-400.css";
import "@fontsource/raleway/latin-400-italic.css";
import "@fontsource/raleway/latin-700.css";
import "@fontsource/raleway/latin-700-italic.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-400-italic.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-700-italic.css";
import "@fontsource/noto-sans/latin-400.css";
import "@fontsource/noto-sans/latin-400-italic.css";
import "@fontsource/noto-sans/latin-700.css";
import "@fontsource/noto-sans/latin-700-italic.css";
import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/latin-400-italic.css";
import "@fontsource/lora/latin-700.css";
import "@fontsource/lora/latin-700-italic.css";
import "@fontsource/merriweather/latin-400.css";
import "@fontsource/merriweather/latin-400-italic.css";
import "@fontsource/merriweather/latin-700.css";
import "@fontsource/merriweather/latin-700-italic.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-400-italic.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-700-italic.css";
import "@fontsource/pt-serif/latin-400.css";
import "@fontsource/pt-serif/latin-400-italic.css";
import "@fontsource/pt-serif/latin-700.css";
import "@fontsource/pt-serif/latin-700-italic.css";

export type FontOption = { label: string; stack: string };

export const FONTS: FontOption[] = [
  { label: "Roboto", stack: "'Roboto', sans-serif" },
  { label: "Open Sans", stack: "'Open Sans', sans-serif" },
  { label: "Lato", stack: "'Lato', sans-serif" },
  { label: "Montserrat", stack: "'Montserrat', sans-serif" },
  { label: "Inter", stack: "'Inter', sans-serif" },
  { label: "Poppins", stack: "'Poppins', sans-serif" },
  { label: "Source Sans 3", stack: "'Source Sans 3', sans-serif" },
  { label: "Raleway", stack: "'Raleway', sans-serif" },
  { label: "Nunito", stack: "'Nunito', sans-serif" },
  { label: "Noto Sans", stack: "'Noto Sans', sans-serif" },
  { label: "Lora", stack: "'Lora', serif" },
  { label: "Merriweather", stack: "'Merriweather', serif" },
  { label: "Playfair Display", stack: "'Playfair Display', serif" },
  { label: "PT Serif", stack: "'PT Serif', serif" },
  { label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", stack: "'Trebuchet MS', sans-serif" },
  { label: "Times New Roman", stack: "'Times New Roman', Times, serif" },
  { label: "Georgia", stack: "Georgia, serif" },
  { label: "Courier New", stack: "'Courier New', monospace" },
].sort((a, b) => a.label.localeCompare(b.label));

// Font di partenza di ogni blocco di testo.
export const DEFAULT_FONT = "Arial, Helvetica, sans-serif";
