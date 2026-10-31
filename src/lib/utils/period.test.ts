import { describe, expect, it } from "vitest";
import { formatPeriod } from "./period.js";

describe("formatPeriod", () => {
  const cases = [
    { name: "closed period", period: { start: Date.parse("2021-01-16"), end: Date.parse("2022-02-02") }, expected: "2021 - 2022" },
    { name: "ongoing", period: { start: Date.parse("2024-03-01"), end: null }, expected: "2024 - présent" },
    { name: "missing start", period: { end: Date.parse("2020-05-01") }, expected: " - 2020" },
    { name: "utc year boundary", period: { start: Date.parse("2025-01-01T00:00:00Z") }, expected: "2025 - présent" },
  ];
  cases.forEach(({ name, period, expected }) => {
    it(name, () => {
      expect(formatPeriod(period)).toBe(expected);
    });
  });
});
