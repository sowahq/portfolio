import type { Attachment } from "svelte/attachments";

export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

/**
 * Advances a key-sequence matcher. Returns the new progress, equal to `sequence.length` on a full match.
 */
export function advance(sequence: readonly string[], progress: number, key: string): number {
  const normalized = key.length === 1 ? key.toLowerCase() : key;
  const typed = [...sequence.slice(0, progress), normalized];
  const length = Array.from({ length: typed.length }, (_, i) => typed.length - i).find((size) =>
    typed.slice(-size).every((value, index) => value === sequence[index]),
  );
  return length ?? 0;
}

/**
 * Calls `onMatch` each time the window receives the full key sequence.
 */
export function onSequence(sequence: readonly string[], onMatch: () => void): Attachment<Element> {
  return () => {
    let progress = 0;
    const onKey = (event: KeyboardEvent): void => {
      progress = advance(sequence, progress, event.key);
      if (progress < sequence.length) return;
      progress = 0;
      onMatch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  };
}
