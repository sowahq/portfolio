import { describe, expect, it } from "vitest";
import { bayer, hexToRgb, type Rgb } from "./pixels.js";

describe("hexToRgb", () => {
  const cases: { color: string; expected: Rgb }[] = [
    { color: "#000000", expected: [0, 0, 0] },
    { color: "#FFFFFF", expected: [255, 255, 255] },
    { color: "#A996E8", expected: [169, 150, 232] },
    { color: "#24123f", expected: [36, 18, 63] },
  ];

  for (const { color, expected } of cases) {
    it(color, () => {
      expect(hexToRgb(color)).toEqual(expected);
    });
  }
});

describe("bayer", () => {
  const cases: { x: number; y: number; expected: number }[] = [
    { x: 0, y: 0, expected: 0 },
    { x: 1, y: 0, expected: 8 },
    { x: 0, y: 1, expected: 12 },
    { x: 3, y: 3, expected: 5 },
    { x: 4, y: 4, expected: 0 },
    { x: 6, y: 5, expected: 14 },
  ];

  for (const { x, y, expected } of cases) {
    it(`reads (${x}, ${y})`, () => {
      expect(bayer(x, y)).toBe(expected);
    });
  }
});
