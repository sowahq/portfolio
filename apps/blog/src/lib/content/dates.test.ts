import { describe, expect, it } from "vitest";
import { formatDayMonth, formatPostDate, toIsoDate, toRfc822 } from "./dates.js";

describe("toIsoDate", () => {
  const cases: { input: string; expected: string | null }[] = [
    { input: "08/20/2026", expected: "2026-08-20" },
    { input: "01/10/2025", expected: "2025-01-10" },
    { input: " 03/23/2026 ", expected: "2026-03-23" },
    { input: "2026-04-04", expected: "2026-04-04" },
    { input: "02/30/2026", expected: null },
    { input: "13/01/2026", expected: null },
    { input: "2026-13-01", expected: null },
    { input: "20 août 2026", expected: null },
    { input: "", expected: null },
  ];

  for (const { input, expected } of cases) {
    it(`reads "${input}"`, () => {
      expect(toIsoDate(input)).toBe(expected);
    });
  }
});

describe("formatPostDate", () => {
  const cases: { iso: string; expected: string }[] = [
    { iso: "2026-08-20", expected: "20 août 2026" },
    { iso: "2025-01-10", expected: "10 janvier 2025" },
    { iso: "2026-04-04", expected: "4 avril 2026" },
    { iso: "2026-08-05", expected: "5 août 2026" },
  ];

  for (const { iso, expected } of cases) {
    it(`formats ${iso}`, () => {
      expect(formatPostDate(iso)).toBe(expected);
    });
  }
});

describe("formatDayMonth", () => {
  const cases: { iso: string; expected: string }[] = [
    { iso: "2026-08-20", expected: "20 août" },
    { iso: "2026-08-05", expected: "5 août" },
    { iso: "2026-03-23", expected: "23 mars" },
    { iso: "2025-01-10", expected: "10 janvier" },
  ];

  for (const { iso, expected } of cases) {
    it(`formats ${iso}`, () => {
      expect(formatDayMonth(iso)).toBe(expected);
    });
  }
});

describe("toRfc822", () => {
  const cases: { iso: string; expected: string }[] = [
    { iso: "2026-08-20", expected: "Thu, 20 Aug 2026 00:00:00 GMT" },
    { iso: "2025-01-10", expected: "Fri, 10 Jan 2025 00:00:00 GMT" },
  ];

  for (const { iso, expected } of cases) {
    it(`formats ${iso}`, () => {
      expect(toRfc822(iso)).toBe(expected);
    });
  }
});
