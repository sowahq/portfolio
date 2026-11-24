import { describe, expect, it } from "vitest";
import { countWords, readingLabel, readingMinutes } from "./reading-time.js";

describe("countWords", () => {
  const cases: { text: string; expected: number }[] = [
    { text: "", expected: 0 },
    { text: "   ", expected: 0 },
    { text: "un", expected: 1 },
    { text: "  un  deux\ntrois\tquatre ", expected: 4 },
    { text: "l'obfuscation via la virtualisation", expected: 4 },
  ];

  for (const { text, expected } of cases) {
    it(`counts ${JSON.stringify(text)}`, () => {
      expect(countWords(text)).toBe(expected);
    });
  }
});

describe("readingMinutes", () => {
  const cases: { words: number; expected: number }[] = [
    { words: 0, expected: 0 },
    { words: 1, expected: 1 },
    { words: 200, expected: 1 },
    { words: 201, expected: 2 },
    { words: 1999, expected: 10 },
  ];

  for (const { words, expected } of cases) {
    it(`rounds ${words} words up to ${expected} min`, () => {
      expect(readingMinutes(words)).toBe(expected);
    });
  }
});

describe("readingLabel", () => {
  const cases: { minutes: number; expected: string }[] = [
    { minutes: 1, expected: "1 min" },
    { minutes: 11, expected: "11 min" },
  ];

  for (const { minutes, expected } of cases) {
    it(expected, () => {
      expect(readingLabel(minutes)).toBe(expected);
    });
  }
});
