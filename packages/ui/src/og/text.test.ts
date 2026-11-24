import { describe, expect, it } from "vitest";
import { fitTitle, wrapMonospace } from "./text.js";

describe("wrapMonospace", () => {
  const cases: { name: string; text: string; columns: number; expected: string[] }[] = [
    { name: "fits on one line", text: "le dépôt", columns: 10, expected: ["le dépôt"] },
    { name: "breaks at spaces", text: "un frigo de voiture", columns: 8, expected: ["un frigo", "de", "voiture"] },
    { name: "collapses spaces", text: "  a   b  ", columns: 5, expected: ["a b"] },
    {
      name: "cuts a word longer than a line",
      text: "virtualisation",
      columns: 6,
      expected: ["virtua", "lisati", "on"],
    },
    { name: "empty text", text: "", columns: 5, expected: [] },
  ];

  for (const { name, text, columns, expected } of cases) {
    it(name, () => {
      expect(wrapMonospace(text, columns)).toEqual(expected);
    });
  }
});

describe("fitTitle", () => {
  const box = { width: 600, height: 150, advance: 0.5, lineHeight: 1, sizes: [100, 60, 40] };

  const cases: { name: string; text: string; size: number; lines: number }[] = [
    { name: "a short title keeps the largest size", text: "abc def", size: 100, lines: 1 },
    { name: "a longer title steps down", text: "abcdefghij klmnopqrst", size: 60, lines: 2 },
    { name: "a very long title falls back to the smallest size", text: "a ".repeat(400), size: 40, lines: 27 },
  ];

  for (const { name, text, size, lines } of cases) {
    it(name, () => {
      const fitted = fitTitle(text, box);

      expect(fitted.size).toBe(size);
      expect(fitted.lines).toHaveLength(lines);
    });
  }
});
