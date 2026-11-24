import { describe, expect, it } from "vitest";
import { AXOLOTL, AXOLOTL_SHOW, AXOLOTL_STILL_SHOW, axolotlAt, paintAxolotl } from "./axolotl.js";
import type { Painter } from "./pixels.js";

function recorder(): { paint: Painter; rows: Set<number>; count: () => number } {
  const rows = new Set<number>();
  let pixels = 0;
  const rect = (_x: number, y: number, w: number): void => {
    rows.add(y);
    pixels += w;
  };
  return { paint: { rect, dot: (x, y) => rect(x, y, 1) }, rows, count: () => pixels };
}

describe("axolotlAt", () => {
  const width = 360;
  const height = 195;
  const ground = height - 7;

  it("starts hidden under the ground, rises above the rooftops, then leaves", () => {
    expect(axolotlAt(0.2, width, height)!.top).toBeGreaterThan(ground);
    expect(axolotlAt(2, width, height)!.top).toBeLessThan(ground - 40);
    expect(axolotlAt(AXOLOTL_SHOW + 0.1, width, height)).toBeNull();
  });

  it("opens its mouth only while it cries", () => {
    expect(axolotlAt(2, width, height)!.mouth).toBe(0);
    expect(axolotlAt(3.2, width, height)!.mouth).toBeGreaterThan(0);
    expect(axolotlAt(4.5, width, height)!.mouth).toBe(0);
  });

  it("stands still, without shaking, when motion is reduced", () => {
    const first = axolotlAt(0, width, height, true)!;
    expect(axolotlAt(3, width, height, true)).toEqual(first);
    expect(first.shake).toBe(0);
    expect(first.top).toBeLessThan(ground - 40);
    expect(axolotlAt(AXOLOTL_STILL_SHOW, width, height, true)).toBeNull();
  });
});

describe("paintAxolotl", () => {
  it("paints within its sprite box", () => {
    const { paint, rows, count } = recorder();
    paintAxolotl(paint, 100, 50, 0);
    expect(count()).toBeGreaterThan(1000);
    expect(Math.min(...rows)).toBeGreaterThanOrEqual(50 - AXOLOTL.originY);
    expect(Math.max(...rows)).toBeLessThan(50 - AXOLOTL.originY + AXOLOTL.height);
  });

  it("skips the rows below the clip line", () => {
    const { paint, rows } = recorder();
    paintAxolotl(paint, 100, 50, 0, 70);
    expect(Math.max(...rows)).toBe(69);
  });

  it("draws an open mouth differently from a smile", () => {
    const smile = recorder();
    const cry = recorder();
    paintAxolotl(smile.paint, 100, 50, 0);
    paintAxolotl(cry.paint, 100, 50, 5);
    expect(cry.count()).not.toBe(smile.count());
  });
});
