# A4 print / PDF export

Export = `window.print()`; the user picks "Save as PDF".

```scss
@page { size: A4; margin: 0; }

@media print {
  * { print-color-adjust: exact; }          // keep backgrounds and borders
  html, body, #root { height: auto; }

  .sidebar, .topbar { display: none; }      // all UI
  .sheet {
    margin: 0; box-shadow: none; background-image: none; // grid lines
    height: 297mm;
    overflow: clip;                         // avoids a blank second page from rounding
  }
  .watermark, .overflow-indicator, .block-outline { display: none; }
}
```

## Checklist

- Print preview shows exactly one page.
- No UI, grid lines, selection outlines, or delete buttons in the output.
- Colours and background opacity preserved.
- Fonts are self-hosted (`@fontsource/*`) so the PDF does not depend on network or Google Fonts.
- Hook `Ctrl/Cmd+P` to the same export flow.

Automated tests cannot see the print preview; check it manually with rich text content.
