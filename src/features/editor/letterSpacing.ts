import { Extension, isValidCSSStyleValue } from "@tiptap/core";
import "@tiptap/extension-text-style";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    letterSpacing: {
      setLetterSpacing: (letterSpacing: string) => ReturnType;
      unsetLetterSpacing: () => ReturnType;
    };
  }
}

declare module "@tiptap/extension-text-style" {
  interface TextStyleAttributes {
    letterSpacing?: string | null;
  }
}

// Tiptap non ha una spaziatura tra lettere ufficiale: la aggiungo come attributo
// del mark textStyle, identico a come fa FontSize (stessa mark → un solo <span>).
export const LetterSpacing = Extension.create({
  name: "letterSpacing",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: (el) => el.style.letterSpacing || null,
            renderHTML: (attrs) =>
              isValidCSSStyleValue(attrs.letterSpacing)
                ? { style: `letter-spacing: ${attrs.letterSpacing}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing:
        (letterSpacing) =>
        ({ chain }) =>
          chain().setMark("textStyle", { letterSpacing }).run(),
      unsetLetterSpacing:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { letterSpacing: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});
