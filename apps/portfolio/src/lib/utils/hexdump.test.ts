import { describe, expect, it } from "vitest";
import { hexdumpLine } from "./hexdump.js";

describe("hexdumpLine", () => {
  const cases: { text: string; length?: number; expected: string }[] = [
    { text: "frigo", expected: "00000000  66 72 69 67 6f" },
    { text: "steam_api64", length: 4, expected: "00000000  73 74 65 61" },
    { text: "", expected: "00000000  " },
  ];

  for (const { text, length, expected } of cases) {
    it(`dumps "${text}"`, () => {
      expect(hexdumpLine(text, length)).toBe(expected);
    });
  }
});
