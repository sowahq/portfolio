export const SCENE_PIXEL = 4;

export const BAYER: readonly number[] = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export const SKY: readonly string[] = ["#A996E8", "#B9A7EE", "#CABAF2", "#DACCF5", "#E9DDF6", "#F6E2EC", "#FCE7DD"];

export const SKYLINE_FAR = "#C6B4EE";

export const SKYLINE_BACK = "#B6A1E6";

export type Rgb = [number, number, number];

export interface SceneImage {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

/**
 * The part of a 2D context the scene painters use, so they also run on a software canvas at build time.
 */
export interface SceneContext {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
  createImageData(width: number, height: number): SceneImage;
  putImageData(image: SceneImage, dx: number, dy: number): void;
}

/**
 * The part of a canvas element the scene painters use.
 */
export interface SceneCanvas {
  readonly clientWidth: number;
  readonly clientHeight: number;
  width: number;
  height: number;
  getContext(contextId: "2d"): SceneContext | null;
}

/**
 * The size of the box a strip of clouds is painted for.
 */
export interface SceneBox {
  readonly clientWidth: number;
  readonly clientHeight: number;
}

export interface Painter {
  rect: (x: number, y: number, w: number, h: number, color: string) => void;
  dot: (x: number, y: number, color: string) => void;
}

/**
 * Converts a #RRGGBB color into its red, green and blue channels.
 */
export function hexToRgb(color: string): Rgb {
  const value = Number.parseInt(color.slice(1), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * Value of the 4x4 Bayer matrix at a pixel, from 0 to 15.
 */
export function bayer(x: number, y: number): number {
  return BAYER[(y & 3) * 4 + (x & 3)] ?? 0;
}

/**
 * Wraps a 2D context into integer-snapped rectangle and dot helpers.
 */
export function painter(context: SceneContext): Painter {
  const rect = (x: number, y: number, w: number, h: number, color: string): void => {
    context.fillStyle = color;
    context.fillRect(x | 0, y | 0, w | 0, h | 0);
  };

  const dot = (x: number, y: number, color: string): void => rect(x, y, 1, 1, color);

  return { rect, dot };
}

/**
 * Fills the whole canvas with a sky gradient dithered through the Bayer matrix, the last band reaching the horizon.
 */
export function paintSky(
  context: SceneContext,
  width: number,
  height: number,
  horizon: number,
  palette: readonly string[] = SKY,
): void {
  const bands = palette.map(hexToRgb);
  const last = bands.length - 1;
  const image = context.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = Math.min(1, y / horizon) * last;
      const band = Math.floor(t);
      const threshold = (bayer(x, y) + 0.5) / 16;
      const [r, g, b] = bands[Math.min(last, t - band > threshold ? band + 1 : band)] ?? [0, 0, 0];
      const offset = (y * width + x) * 4;

      image.data[offset] = r;
      image.data[offset + 1] = g;
      image.data[offset + 2] = b;
      image.data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
}

/**
 * Paints a row of flat distant blocks, some with a chimney, standing on the ground line.
 */
export function paintSkyline(
  paint: Painter,
  random: () => number,
  width: number,
  ground: number,
  color: string,
  minHeight: number,
  maxHeight: number,
): void {
  for (let x = -2; x < width;) {
    const w = 6 + ((random() * 10) | 0);
    const h = minHeight + ((random() * (maxHeight - minHeight)) | 0);

    paint.rect(x, ground - h, w, h, color);

    if (random() > 0.6) {
      paint.rect(x + 2, ground - h - 3, 2, 3, color);
    }

    x += w;
  }
}
