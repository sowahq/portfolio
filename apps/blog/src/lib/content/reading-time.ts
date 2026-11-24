export const WORDS_PER_MINUTE = 200;

/**
 * Counts whitespace-separated words.
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Reading time in minutes, rounded up like the Nuxt reading-time plugin.
 */
export function readingMinutes(wordCount: number): number {
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

/**
 * Short label for a reading time, e.g. "11 min".
 */
export function readingLabel(minutes: number): string {
  return `${minutes} min`;
}
