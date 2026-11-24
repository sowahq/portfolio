import { describe, expect, it } from "vitest";
import { parisTime } from "./clock.js";

describe("parisTime", () => {
  const cases: { name: string; date: string; expected: string }[] = [
    { name: "winter, UTC+1", date: "2026-01-15T08:05:00Z", expected: "09:05" },
    { name: "summer, UTC+2", date: "2026-07-15T08:05:00Z", expected: "10:05" },
    { name: "past midnight in Lille", date: "2026-11-23T23:30:00Z", expected: "00:30" },
  ];

  for (const { name, date, expected } of cases) {
    it(name, () => {
      expect(parisTime(new Date(date))).toBe(expected);
    });
  }
});
