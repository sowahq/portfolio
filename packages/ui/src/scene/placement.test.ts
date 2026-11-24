import { describe, expect, it } from "vitest";
import type { DepotLayout } from "./depot.js";
import type { CityScene } from "./lille.js";
import { cityTrainTop, depotPlacement, type DepotPlacement } from "./placement.js";

describe("depotPlacement", () => {
  const cases: { name: string; layout: DepotLayout; expected: DepotPlacement }[] = [
    {
      name: "desktop depot",
      layout: { signX: 140, signY: 58, weld: { x: 290, y: 87 }, trainTop: 90 },
      expected: { sign: { left: 560, top: 228 }, weld: { left: 1160, top: 348 }, trainTop: 360 },
    },
    {
      name: "half-pixel sign center",
      layout: { signX: 36.5, signY: 37, weld: { x: 53, y: 54 }, trainTop: 57 },
      expected: { sign: { left: 146, top: 144 }, weld: { left: 212, top: 216 }, trainTop: 228 },
    },
  ];

  for (const { name, layout, expected } of cases) {
    it(name, () => {
      expect(depotPlacement(layout)).toEqual(expected);
    });
  }
});

describe("cityTrainTop", () => {
  const cases: { deck: number; expected: number }[] = [
    { deck: 180, expected: 676 },
    { deck: 11, expected: 0 },
  ];

  for (const { deck, expected } of cases) {
    it(`deck at ${deck}`, () => {
      const scene: CityScene = { deck, windows: [], windowColors: { on: "#fde68a", off: "#6e529c" } };

      expect(cityTrainTop(scene)).toBe(expected);
    });
  }
});
