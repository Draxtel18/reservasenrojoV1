export interface DocumentaryChapter { start: number; title: string }
export interface DocumentaryCue { start: number; text: string }

/** Populate only after reviewing timestamps against the original film. */
export const documentaryAccessibility: {
  reviewed: boolean;
  chapters: DocumentaryChapter[];
  transcript: DocumentaryCue[];
} = { reviewed: false, chapters: [], transcript: [] };
