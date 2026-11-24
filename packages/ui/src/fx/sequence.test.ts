import { describe, expect, it } from "vitest";
import { KONAMI, advance } from "./sequence.js";

describe("advance", () => {
  const cases: { name: string; keys: string[]; expected: number }[] = [
    { name: "full konami code matches", keys: [...KONAMI], expected: KONAMI.length },
    { name: "uppercase letters are normalized", keys: [...KONAMI.slice(0, 8), "B", "A"], expected: KONAMI.length },
    { name: "a wrong key resets progress", keys: ["ArrowUp", "ArrowUp", "x"], expected: 0 },
    {
      name: "an extra leading key keeps the overlap",
      keys: ["ArrowUp", "ArrowUp", "ArrowUp", "ArrowDown"],
      expected: 3,
    },
  ];

  for (const { name, keys, expected } of cases) {
    it(name, () => {
      const progress = keys.reduce((current, key) => advance(KONAMI, current, key), 0);
      expect(progress).toBe(expected);
    });
  }
});
