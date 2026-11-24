import { describe, expect, it } from "vitest";
import { contrastRatio, ensureContrast } from "./contrast.js";

describe("contrastRatio", () => {
  const cases: { name: string; foreground: string; background: string; expected: number }[] = [
    { name: "black on white", foreground: "#000000", background: "#ffffff", expected: 21 },
    { name: "same color", foreground: "#7c3aed", background: "#7c3aed", expected: 1 },
    { name: "shiki comment on the board", foreground: "#51597d", background: "#1a1030", expected: 2.65 },
  ];

  for (const { name, foreground, background, expected } of cases) {
    it(name, () => {
      expect(contrastRatio(foreground, background)).toBeCloseTo(expected, 2);
    });
  }
});

describe("ensureContrast", () => {
  const cases: { name: string; color: string; background: string; unchanged: boolean }[] = [
    { name: "keeps a readable color", color: "#c0caf5", background: "#1a1030", unchanged: true },
    { name: "lightens a dim comment on a dark board", color: "#51597d", background: "#1a1030", unchanged: false },
    { name: "darkens a pale color on paper", color: "#e9ddf6", background: "#f6f1fd", unchanged: false },
  ];

  for (const { name, color, background, unchanged } of cases) {
    it(name, () => {
      const result = ensureContrast(color, background);

      expect(result === color).toBe(unchanged);
      expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
