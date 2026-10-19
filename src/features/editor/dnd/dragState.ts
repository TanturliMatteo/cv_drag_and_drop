import type { BlockType } from "../model/types";

// Tipo di blocco che si sta trascinando dalla sidebar. Durante il dragover il
// browser non permette di leggere dataTransfer, quindi il tipo passa da qui.
export const dragState: { type: BlockType | null } = { type: null };
