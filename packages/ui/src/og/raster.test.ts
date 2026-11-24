import { describe, expect, it } from "vitest";
import {
  copyPixels,
  createRaster,
  crop,
  drawRaster,
  fadeVertically,
  fillRect,
  parseHexColor,
  pixelAt,
  upscale,
  type Rgba,
} from "./raster.js";

describe("parseHexColor", () => {
  const cases: { input: string; expected: Rgba }[] = [
    { input: "#24123F", expected: [36, 18, 63, 255] },
    { input: "#fde047", expected: [253, 224, 71, 255] },
    { input: "#fff", expected: [255, 255, 255, 255] },
    { input: "#0008", expected: [0, 0, 0, 136] },
    { input: "#7c3aed80", expected: [124, 58, 237, 128] },
  ];

  for (const { input, expected } of cases) {
    it(input, () => {
      expect(parseHexColor(input)).toEqual(expected);
    });
  }

  const invalid = ["red", "rgb(0 0 0)", "#12345", ""];

  for (const input of invalid) {
    it(`rejects "${input}"`, () => {
      expect(() => parseHexColor(input)).toThrow();
    });
  }
});

describe("fillRect", () => {
  const cases: {
    name: string;
    rect: [number, number, number, number];
    inside: [number, number][];
    outside: [number, number][];
  }[] = [
    {
      name: "inside the raster",
      rect: [1, 1, 2, 2],
      inside: [
        [1, 1],
        [2, 2],
      ],
      outside: [
        [0, 0],
        [3, 3],
      ],
    },
    { name: "clipped on the left and top", rect: [-2, -2, 3, 3], inside: [[0, 0]], outside: [[1, 1]] },
    { name: "clipped on the right and bottom", rect: [3, 3, 5, 5], inside: [[3, 3]], outside: [[2, 2]] },
    {
      name: "fractional coordinates are truncated",
      rect: [1.7, 0.2, 1.9, 1],
      inside: [
        [1, 0],
        [2, 0],
      ],
      outside: [[3, 0]],
    },
  ];

  for (const { name, rect, inside, outside } of cases) {
    it(name, () => {
      const raster = createRaster(4, 4);

      fillRect(raster, ...rect, [255, 0, 0, 255]);

      for (const [x, y] of inside) {
        expect(pixelAt(raster, x, y)).toEqual([255, 0, 0, 255]);
      }

      for (const [x, y] of outside) {
        expect(pixelAt(raster, x, y)).toEqual([0, 0, 0, 0]);
      }
    });
  }

  it("blends a translucent color over an opaque one", () => {
    const raster = createRaster(1, 1);

    fillRect(raster, 0, 0, 1, 1, [0, 0, 0, 255]);
    fillRect(raster, 0, 0, 1, 1, [255, 255, 255, 128]);

    expect(pixelAt(raster, 0, 0)).toEqual([128, 128, 128, 255]);
  });
});

describe("raster transforms", () => {
  it("upscales with nearest-neighbor sampling", () => {
    const raster = createRaster(2, 1);

    fillRect(raster, 1, 0, 1, 1, [255, 255, 255, 255]);

    const scaled = upscale(raster, 4);

    expect([scaled.width, scaled.height]).toEqual([8, 4]);
    expect(pixelAt(scaled, 3, 3)).toEqual([0, 0, 0, 0]);
    expect(pixelAt(scaled, 4, 0)).toEqual([255, 255, 255, 255]);
  });

  it("crops to the top-left corner", () => {
    const raster = createRaster(4, 4);

    fillRect(raster, 0, 0, 1, 1, [1, 2, 3, 255]);

    const cropped = crop(raster, 2, 3);

    expect([cropped.width, cropped.height]).toEqual([2, 3]);
    expect(pixelAt(cropped, 0, 0)).toEqual([1, 2, 3, 255]);
  });

  it("draws over transparent pixels without erasing", () => {
    const target = createRaster(3, 1);
    const source = createRaster(2, 1);

    fillRect(target, 0, 0, 3, 1, [9, 9, 9, 255]);
    fillRect(source, 1, 0, 1, 1, [200, 0, 0, 255]);
    drawRaster(target, source, 1, 0);

    expect([pixelAt(target, 1, 0), pixelAt(target, 2, 0)]).toEqual([
      [9, 9, 9, 255],
      [200, 0, 0, 255],
    ]);
  });

  it("copies pixels as they are", () => {
    const target = createRaster(2, 1);
    const source = createRaster(1, 1);

    fillRect(target, 0, 0, 2, 1, [9, 9, 9, 255]);
    copyPixels(target, source, 1, 0);

    expect(pixelAt(target, 1, 0)).toEqual([0, 0, 0, 0]);
  });

  it("fades from transparent at the top to opaque at the bottom", () => {
    const raster = createRaster(1, 10);

    fillRect(raster, 0, 0, 1, 10, [0, 0, 0, 255]);
    fadeVertically(raster, [
      { at: 0, opacity: 0 },
      { at: 0.5, opacity: 1 },
    ]);

    const alphas = Array.from({ length: 10 }, (_, y) => pixelAt(raster, 0, y)[3]);

    expect(alphas[0]).toBeLessThan(40);
    expect(alphas[2]).toBeGreaterThan(alphas[1] ?? 0);
    expect(alphas.slice(5)).toEqual([255, 255, 255, 255, 255]);
  });
});
