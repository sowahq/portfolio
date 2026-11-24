import { describe, expect, it } from "vitest";
import { encodeIco, encodePng, pngDataUrl, PNG_SIGNATURE } from "./png.js";
import { decodeRgbaPng, readPngChunks, readPngHeader } from "./png-reader.js";
import { createRaster, fillRect, pixelAt, type Rgba } from "./raster.js";

function solid(width: number, height: number, color: Rgba) {
  const raster = createRaster(width, height);

  fillRect(raster, 0, 0, width, height, color);

  return raster;
}

describe("encodePng", () => {
  const cases: { name: string; width: number; height: number; color: Rgba }[] = [
    { name: "a single opaque pixel", width: 1, height: 1, color: [36, 18, 63, 255] },
    { name: "a wide strip", width: 300, height: 2, color: [253, 224, 71, 255] },
    { name: "a translucent square", width: 7, height: 7, color: [124, 58, 237, 128] },
    { name: "an Open Graph sized image", width: 1200, height: 630, color: [246, 241, 253, 255] },
  ];

  for (const { name, width, height, color } of cases) {
    it(name, () => {
      const png = encodePng(solid(width, height, color));

      expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
      expect(readPngChunks(png).map((chunk) => [chunk.type, chunk.crcValid])).toEqual([
        ["IHDR", true],
        ["IDAT", true],
        ["IEND", true],
      ]);
      expect(readPngHeader(png)).toEqual({ width, height, bitDepth: 8, colorType: 6 });

      const decoded = decodeRgbaPng(png);

      expect(pixelAt(decoded, 0, 0)).toEqual(color);
      expect(pixelAt(decoded, width - 1, height - 1)).toEqual(color);
    });
  }

  it("keeps every pixel where it was painted", () => {
    const raster = solid(4, 3, [255, 255, 255, 255]);

    fillRect(raster, 2, 1, 1, 1, [255, 0, 0, 255]);

    const decoded = decodeRgbaPng(encodePng(raster));

    expect(pixelAt(decoded, 2, 1)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(decoded, 1, 1)).toEqual([255, 255, 255, 255]);
  });

  it("refuses an empty image", () => {
    expect(() => encodePng(createRaster(0, 0))).toThrow();
  });

  it("builds a base64 data URL", () => {
    const png = encodePng(solid(1, 1, [0, 0, 0, 255]));

    expect(pngDataUrl(png)).toBe(`data:image/png;base64,${Buffer.from(png).toString("base64")}`);
  });
});

describe("encodeIco", () => {
  const cases: { name: string; sizes: number[] }[] = [
    { name: "one size", sizes: [32] },
    { name: "the favicon sizes", sizes: [16, 32, 48] },
    { name: "a 256 pixel entry is written as 0", sizes: [256] },
  ];

  for (const { name, sizes } of cases) {
    it(name, () => {
      const images = sizes.map((size) => ({ size, png: encodePng(solid(size, size, [0, 0, 0, 255])) }));
      const ico = encodeIco(images);
      const view = new DataView(ico.buffer);

      expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, sizes.length]);

      images.forEach(({ size, png }, index) => {
        const entry = 6 + index * 16;
        const offset = view.getUint32(entry + 12, true);

        expect(ico[entry]).toBe(size >= 256 ? 0 : size);
        expect(view.getUint32(entry + 8, true)).toBe(png.length);
        expect([...ico.subarray(offset, offset + 8)]).toEqual(PNG_SIGNATURE);
      });
    });
  }
});
