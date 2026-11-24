import { describe, expect, it } from "vitest";
import { readFraction, remainingMinutes, routePosition, type RoutePosition, remainingLabel } from "./route.js";

describe("routePosition", () => {
  const headings = [100, 600, 1100];
  const stops = [0, 40, 100];

  const cases: { name: string; line: number; headings: number[]; stops: number[]; expected: RoutePosition }[] = [
    { name: "before the first heading", line: 50, headings, stops, expected: { current: 0, offset: 0 } },
    { name: "on the first heading", line: 100, headings, stops, expected: { current: 0, offset: 0 } },
    { name: "halfway to the second stop", line: 350, headings, stops, expected: { current: 0, offset: 20 } },
    { name: "on the second heading", line: 600, headings, stops, expected: { current: 1, offset: 40 } },
    { name: "quarter of the last leg", line: 725, headings, stops, expected: { current: 1, offset: 55 } },
    { name: "past the last heading", line: 5000, headings, stops, expected: { current: 2, offset: 100 } },
    { name: "single step", line: 900, headings: [100], stops: [0], expected: { current: 0, offset: 0 } },
    { name: "no step", line: 900, headings: [], stops: [], expected: { current: 0, offset: 0 } },
  ];

  for (const { name, line, headings: tops, stops: rail, expected } of cases) {
    it(name, () => {
      expect(routePosition(line, tops, rail)).toEqual(expected);
    });
  }
});

describe("readFraction", () => {
  const cases: { name: string; line: number; top: number; height: number; expected: number }[] = [
    { name: "above the article", line: 300, top: 500, height: 1000, expected: 0 },
    { name: "a quarter in", line: 300, top: 50, height: 1000, expected: 0.25 },
    { name: "past the end", line: 300, top: -2000, height: 1000, expected: 1 },
    { name: "empty article", line: 300, top: 0, height: 0, expected: 0 },
  ];

  for (const { name, line, top, height, expected } of cases) {
    it(name, () => {
      expect(readFraction(line, top, height)).toBe(expected);
    });
  }
});

describe("remainingMinutes", () => {
  const cases: { total: number; read: number; expected: number }[] = [
    { total: 11, read: 0, expected: 11 },
    { total: 11, read: 0.5, expected: 6 },
    { total: 11, read: 0.99, expected: 1 },
    { total: 11, read: 1, expected: 0 },
  ];

  for (const { total, read, expected } of cases) {
    it(`${total} min, ${read * 100}% read`, () => {
      expect(remainingMinutes(total, read)).toBe(expected);
    });
  }
});

describe("remainingLabel", () => {
  const cases: { name: string; minutes: number; lastStopReached: boolean; expected: string }[] = [
    { name: "on the way", minutes: 7, lastStopReached: false, expected: "encore 7 min avant le terminus" },
    { name: "last minute", minutes: 1, lastStopReached: false, expected: "encore 1 min avant le terminus" },
    { name: "nothing left to read", minutes: 0, lastStopReached: false, expected: "terminus, tout le monde descend" },
    { name: "last stop reached", minutes: 2, lastStopReached: true, expected: "terminus, tout le monde descend" },
  ];

  for (const { name, minutes, lastStopReached, expected } of cases) {
    it(name, () => {
      expect(remainingLabel(minutes, lastStopReached)).toBe(expected);
    });
  }
});
