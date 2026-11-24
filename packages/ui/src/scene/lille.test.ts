import { describe, expect, it } from "vitest";
import { flickerWindow, type CityScene } from "./lille.js";

function fakeCanvas(): {
  canvas: HTMLCanvasElement;
  fills: { color: string; x: number; y: number; w: number; h: number }[];
} {
  const fills: { color: string; x: number; y: number; w: number; h: number }[] = [];
  let color = "";
  const context = {
    set fillStyle(value: string) {
      color = value;
    },
    fillRect: (x: number, y: number, w: number, h: number) => fills.push({ color, x, y, w, h }),
  };
  const canvas = { getContext: () => context } as unknown as HTMLCanvasElement;
  return { canvas, fills };
}

describe("flickerWindow", () => {
  const cases: { name: string; on: boolean; expected: string }[] = [
    { name: "a dark window lights up", on: false, expected: "#on" },
    { name: "a lit window switches off", on: true, expected: "#off" },
  ];

  for (const { name, on, expected } of cases) {
    it(name, () => {
      const scene: CityScene = { deck: 100, windows: [{ x: 12, y: 40, on }], windowColors: { on: "#on", off: "#off" } };
      const { canvas, fills } = fakeCanvas();
      flickerWindow(canvas, scene, () => 0);
      expect(fills).toEqual([{ color: expected, x: 12, y: 40, w: 2, h: 3 }]);
      expect(scene.windows[0].on).toBe(!on);
    });
  }

  it("paints nothing when no window is visible", () => {
    const { canvas, fills } = fakeCanvas();
    flickerWindow(canvas, { deck: 0, windows: [], windowColors: { on: "#on", off: "#off" } });
    expect(fills).toEqual([]);
  });
});
