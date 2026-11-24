export type Rgba = readonly [number, number, number, number];

/**
 * A block of RGBA pixels, row by row, four bytes per pixel.
 */
export interface Raster {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

const HEX_COLOR = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Reads a #RGB, #RGBA, #RRGGBB or #RRGGBBAA color. Throws on anything else, so a painter using
 * a color the software canvas cannot draw fails the build instead of drawing nothing.
 */
export function parseHexColor(color: string): Rgba {
  const match = HEX_COLOR.exec(color.trim());

  if (!match?.[1]) {
    throw new Error(`Couleur non prise en charge : ${color}`);
  }

  const digits = match[1];
  const full = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join("") : digits;
  const channel = (index: number): number => Number.parseInt(full.slice(index * 2, index * 2 + 2), 16);

  return [channel(0), channel(1), channel(2), full.length === 8 ? channel(3) : 255];
}

/**
 * A transparent raster of the given size.
 */
export function createRaster(width: number, height: number): Raster {
  return { width, height, data: new Uint8ClampedArray(width * height * 4) };
}

/**
 * The RGBA value of one pixel.
 */
export function pixelAt(raster: Raster, x: number, y: number): Rgba {
  const offset = (y * raster.width + x) * 4;
  const { data } = raster;

  return [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0, data[offset + 3] ?? 0];
}

function blendPixel(raster: Raster, offset: number, [r, g, b, a]: Rgba): void {
  const { data } = raster;

  if (a === 255) {
    data[offset] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
    data[offset + 3] = 255;

    return;
  }

  if (a === 0) {
    return;
  }

  const sourceAlpha = a / 255;
  const targetAlpha = (data[offset + 3] ?? 0) / 255;
  const alpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  const mix = (source: number, target: number): number =>
    (source * sourceAlpha + target * targetAlpha * (1 - sourceAlpha)) / alpha;

  data[offset] = mix(r, data[offset] ?? 0);
  data[offset + 1] = mix(g, data[offset + 1] ?? 0);
  data[offset + 2] = mix(b, data[offset + 2] ?? 0);
  data[offset + 3] = alpha * 255;
}

/**
 * Paints a rectangle over the raster, clipped to its bounds, blending translucent colors.
 */
export function fillRect(raster: Raster, x: number, y: number, w: number, h: number, color: Rgba): void {
  const left = Math.max(0, Math.trunc(x));
  const top = Math.max(0, Math.trunc(y));
  const right = Math.min(raster.width, Math.trunc(x + w));
  const bottom = Math.min(raster.height, Math.trunc(y + h));

  for (let row = top; row < bottom; row++) {
    for (let column = left; column < right; column++) {
      blendPixel(raster, (row * raster.width + column) * 4, color);
    }
  }
}

/**
 * Draws a raster over another one at an integer offset, blending its translucent pixels.
 */
export function drawRaster(target: Raster, source: Raster, dx: number, dy: number): void {
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const tx = x + dx;
      const ty = y + dy;

      if (tx >= 0 && ty >= 0 && tx < target.width && ty < target.height) {
        blendPixel(target, (ty * target.width + tx) * 4, pixelAt(source, x, y));
      }
    }
  }
}

/**
 * Copies a rectangle of pixels into a raster as is, replacing what was there, clipped to its bounds.
 */
export function copyPixels(target: Raster, source: Raster, dx: number, dy: number): void {
  for (let y = 0; y < source.height; y++) {
    const ty = y + dy;

    if (ty < 0 || ty >= target.height) {
      continue;
    }

    for (let x = 0; x < source.width; x++) {
      const tx = x + dx;

      if (tx >= 0 && tx < target.width) {
        const from = (y * source.width + x) * 4;

        target.data.set(source.data.subarray(from, from + 4), (ty * target.width + tx) * 4);
      }
    }
  }
}

/**
 * Enlarges a raster by an integer factor with nearest-neighbor sampling, keeping pixel art sharp.
 */
export function upscale(raster: Raster, factor: number): Raster {
  const scaled = createRaster(raster.width * factor, raster.height * factor);

  for (let y = 0; y < scaled.height; y++) {
    for (let x = 0; x < scaled.width; x++) {
      const from = (Math.floor(y / factor) * raster.width + Math.floor(x / factor)) * 4;

      scaled.data.set(raster.data.subarray(from, from + 4), (y * scaled.width + x) * 4);
    }
  }

  return scaled;
}

/**
 * The top-left part of a raster, cut to the given size.
 */
export function crop(raster: Raster, width: number, height: number): Raster {
  const cropped = createRaster(Math.min(width, raster.width), Math.min(height, raster.height));

  for (let y = 0; y < cropped.height; y++) {
    const from = y * raster.width * 4;

    cropped.data.set(raster.data.subarray(from, from + cropped.width * 4), y * cropped.width * 4);
  }

  return cropped;
}

export interface FadeStop {
  /** Position from the top, from 0 to 1. */
  at: number;
  /** Opacity kept at that position, from 0 to 1. */
  opacity: number;
}

function opacityAt(stops: readonly FadeStop[], position: number): number {
  const after = stops.findIndex((stop) => stop.at >= position);

  if (after === -1) {
    return stops.at(-1)?.opacity ?? 1;
  }

  const next = stops[after];
  const previous = stops[after - 1];

  if (!next || !previous) {
    return next?.opacity ?? 1;
  }

  const progress = (position - previous.at) / (next.at - previous.at);

  return previous.opacity + (next.opacity - previous.opacity) * progress;
}

/**
 * Multiplies the alpha of every row by a vertical gradient, like a CSS mask-image going top to bottom.
 */
export function fadeVertically(raster: Raster, stops: readonly FadeStop[]): void {
  for (let y = 0; y < raster.height; y++) {
    const opacity = opacityAt(stops, (y + 0.5) / raster.height);

    for (let x = 0; x < raster.width; x++) {
      const offset = (y * raster.width + x) * 4 + 3;

      raster.data[offset] = (raster.data[offset] ?? 0) * opacity;
    }
  }
}
