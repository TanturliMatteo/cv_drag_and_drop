// Geometria del foglio: unica fonte per misure e griglia.
// 1in = 25.4mm, e il CSS fissa 1in = 96px → conversione mm → px.
const MM_TO_PX = 96 / 25.4;

export const SHEET_WIDTH_PX = 210 * MM_TO_PX; // ≈ 793.7
export const SHEET_HEIGHT_PX = 297 * MM_TO_PX; // ≈ 1122.5

// 24 colonne: abbastanza fini per un CV
export const GRID_COLS = 24;
// 48 righe: celle alte ~23px, una riga di testo circa.
export const GRID_ROWS = 48;

// Altezza ricavata, così le 48 righe riempiono esattamente il foglio.
export const ROW_HEIGHT_PX = SHEET_HEIGHT_PX / GRID_ROWS;
export const COL_WIDTH_PX = SHEET_WIDTH_PX / GRID_COLS; // ≈ 33px
