import type { CodeToken } from "./types.js";

const LANGUAGE_LABELS: Record<string, string> = {
  "": "SORTIE",
  text: "SORTIE",
  plaintext: "SORTIE",
  plain: "SORTIE",
  txt: "SORTIE",
  python: "PYTHON",
  py: "PYTHON",
  javascript: "FRIDA · JAVASCRIPT",
  js: "FRIDA · JAVASCRIPT",
  cpp: "C++",
  "c++": "C++",
  asm: "ASM",
};

/**
 * Header of a diagnostic terminal for a code block language, e.g. "DIAG · PYTHON".
 */
export function terminalLabel(lang: string): string {
  const normalized = lang.trim().toLowerCase();

  return `DIAG · ${LANGUAGE_LABELS[normalized] ?? normalized.toUpperCase()}`;
}

/**
 * Plain source of a highlighted code block, as copied to the clipboard.
 */
export function codeText(lines: CodeToken[][]): string {
  return lines.map((line) => line.map((token) => token.content).join("")).join("\n");
}
