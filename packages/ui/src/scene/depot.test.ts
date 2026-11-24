import { describe, expect, it } from "vitest";
import { paintDepot, type DepotLayout } from "./depot.js";

interface FakeCanvas {
  canvas: HTMLCanvasElement;
  fills: number;
}

function fakeCanvas(clientWidth: number, clientHeight: number, withContext = true): FakeCanvas {
  const state = { fills: 0 };
  const context = {
    set fillStyle(_value: string) {},
    fillRect: () => {
      state.fills += 1;
    },
    createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    putImageData: () => {},
  };
  const canvas = {
    clientWidth,
    clientHeight,
    width: 0,
    height: 0,
    getContext: () => (withContext ? context : null),
  } as unknown as HTMLCanvasElement;

  return {
    canvas,
    get fills() {
      return state.fills;
    },
  };
}

describe("paintDepot", () => {
  const cases: { name: string; width: number; height: number; size: [number, number]; layout: DepotLayout }[] = [
    {
      name: "desktop hall with four bays",
      width: 1280,
      height: 430,
      size: [320, 108],
      layout: { signX: 120, signY: 58, weld: { x: 191, y: 87 }, trainTop: 90 },
    },
    {
      name: "just below the wide threshold",
      width: 800,
      height: 430,
      size: [200, 108],
      layout: { signX: 75.5, signY: 58, weld: { x: 105, y: 87 }, trainTop: 90 },
    },
    {
      name: "mobile hall with two bays",
      width: 375,
      height: 300,
      size: [94, 75],
      layout: { signX: 36.5, signY: 37, weld: { x: 53, y: 54 }, trainTop: 57 },
    },
    {
      name: "tiny box clamped to the minimum scene",
      width: 100,
      height: 100,
      size: [90, 60],
      layout: { signX: 35, signY: 27, weld: { x: 51, y: 39 }, trainTop: 42 },
    },
  ];

  for (const { name, width, height, size, layout } of cases) {
    it(name, () => {
      const fake = fakeCanvas(width, height);
      const placement = paintDepot(fake.canvas);

      expect(placement).toEqual(layout);
      expect([fake.canvas.width, fake.canvas.height]).toEqual(size);
      expect(fake.fills).toBeGreaterThan(0);
    });
  }

  it("stacks the sign above the spark and the spark above the train", () => {
    const { signY, weld, trainTop } = paintDepot(fakeCanvas(1280, 430).canvas);

    expect(signY).toBeLessThan(weld.y);
    expect(weld.y).toBeLessThan(trainTop);
  });

  it("returns an empty layout without a 2D context", () => {
    expect(paintDepot(fakeCanvas(1280, 430, false).canvas)).toEqual({
      signX: 0,
      signY: 0,
      weld: { x: 0, y: 0 },
      trainTop: 0,
    });
  });
});
