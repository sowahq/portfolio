import { describe, expect, it } from "vitest";
import { MARK, markRaster, markRuns, markSvg } from "./icon.js";
import { parseHexColor, pixelAt } from "./raster.js";
import { ogColors } from "./tokens.js";

describe("MARK", () => {
  it("is a square drawn with known colors only", () => {
    expect(MARK.every((row) => row.length === MARK.length)).toBe(true);
    expect(MARK.join("")).toMatch(/^[IYV.]+$/);
  });
});

describe("markRuns", () => {
  const cases: { name: string; mark: string[]; expected: ReturnType<typeof markRuns> }[] = [
    { name: "an empty row", mark: [".."], expected: [] },
    {
      name: "neighbors of one color merge",
      mark: ["IIY"],
      expected: [
        { x: 0, y: 0, length: 2, color: ogColors.ink },
        { x: 2, y: 0, length: 1, color: ogColors.highlight },
      ],
    },
    {
      name: "a gap splits a run",
      mark: ["I.I"],
      expected: [
        { x: 0, y: 0, length: 1, color: ogColors.ink },
        { x: 2, y: 0, length: 1, color: ogColors.ink },
      ],
    },
  ];

  for (const { name, mark, expected } of cases) {
    it(name, () => {
      expect(markRuns(mark)).toEqual(expected);
    });
  }
});

describe("markSvg", () => {
  it("draws crisp rectangles on the mark grid", () => {
    const svg = markSvg();

    expect(svg).toContain(`viewBox="0 0 ${MARK.length} ${MARK.length}"`);
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg.match(/<rect /g)).toHaveLength(markRuns().length);
  });
});

describe("markRaster", () => {
  const cases: { name: string; size: number; scale: number; background?: string; corner: string | null }[] = [
    { name: "favicon 16", size: 16, scale: 1, corner: null },
    { name: "favicon 48", size: 48, scale: 3, corner: null },
    { name: "apple-touch-icon", size: 180, scale: 10, background: ogColors.paper, corner: ogColors.paper },
  ];

  for (const { name, size, scale, background, corner } of cases) {
    it(name, () => {
      const raster = markRaster({ size, scale, ...(background ? { background } : {}) });
      const offset = Math.floor((size - MARK.length * scale) / 2);

      expect([raster.width, raster.height]).toEqual([size, size]);
      expect(pixelAt(raster, 0, 0)).toEqual(corner ? parseHexColor(corner) : [0, 0, 0, 0]);
      expect(pixelAt(raster, offset + scale, offset + scale)).toEqual(parseHexColor(ogColors.highlight));
      expect(pixelAt(raster, offset, offset + scale)).toEqual(parseHexColor(ogColors.ink));
    });
  }
});
