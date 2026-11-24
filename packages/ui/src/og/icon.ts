import { createRaster, drawRaster, fillRect, parseHexColor, upscale, type Raster } from "./raster.js";
import { ogColors } from "./tokens.js";

/**
 * The site mark, a lowercase "m" on a yellow ticket with the violet stripe of the VAL trains, one character per pixel:
 * "I" ink, "Y" highlight, "V" violet, "." transparent.
 */
export const MARK: readonly string[] = [
  ".IIIIIIIIIIIIII.",
  "IYYYYYYYYYYYYYYI",
  "IYYYYYYYYYYYYYYI",
  "IYYYYYYYYYYYYYYI",
  "IYYIIIIIIIIYYYYI",
  "IYYIIIIIIIIIIYYI",
  "IYYIIYYIIYYIIYYI",
  "IYYIIYYIIYYIIYYI",
  "IYYIIYYIIYYIIYYI",
  "IYYIIYYIIYYIIYYI",
  "IYYIIYYIIYYIIYYI",
  "IYYYYYYYYYYYYYYI",
  "IYYYYYYYYYYYYYYI",
  "IVVVVVVVVVVVVVVI",
  "IVVVVVVVVVVVVVVI",
  ".IIIIIIIIIIIIII.",
];

export const MARK_SIZE = MARK.length;

const MARK_COLORS: Record<string, string> = {
  I: ogColors.ink,
  Y: ogColors.highlight,
  V: ogColors.violet,
};

export interface MarkRun {
  x: number;
  y: number;
  length: number;
  color: string;
}

/**
 * The mark as horizontal runs of one color, the fewest rectangles that draw it.
 */
export function markRuns(mark: readonly string[] = MARK): MarkRun[] {
  return mark.flatMap((row, y) => {
    const runs: MarkRun[] = [];

    [...row].forEach((character, x) => {
      const color = MARK_COLORS[character];
      const last = runs.at(-1);

      if (!color) {
        return;
      }

      if (last && last.color === color && last.x + last.length === x) {
        last.length += 1;
      } else {
        runs.push({ x, y, length: 1, color });
      }
    });

    return runs;
  });
}

/**
 * The mark as a crisp SVG favicon.
 */
export function markSvg(mark: readonly string[] = MARK): string {
  const size = mark.length;
  const rects = markRuns(mark).map(
    ({ x, y, length, color }) => `<rect x="${x}" y="${y}" width="${length}" height="1" fill="${color}"/>`,
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
    ...rects,
    "</svg>",
    "",
  ].join("\n");
}

export interface MarkRasterOptions {
  /** Width and height of the image, in pixels. */
  size: number;
  /** Pixels per mark pixel. */
  scale: number;
  /** Fills the image behind the mark, for icons that cannot be transparent. */
  background?: string;
}

/**
 * The mark enlarged without blur and centered on a square image.
 */
export function markRaster({ size, scale, background }: MarkRasterOptions, mark: readonly string[] = MARK): Raster {
  const native = createRaster(mark.length, mark.length);

  for (const { x, y, length, color } of markRuns(mark)) {
    fillRect(native, x, y, length, 1, parseHexColor(color));
  }

  const image = createRaster(size, size);
  const offset = Math.floor((size - mark.length * scale) / 2);

  if (background) {
    fillRect(image, 0, 0, size, size, parseHexColor(background));
  }

  drawRaster(image, upscale(native, scale), offset, offset);

  return image;
}
