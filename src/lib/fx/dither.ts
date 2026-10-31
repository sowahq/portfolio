const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16);

export interface GlowBlob {
  x: number;
  y: number;
  radius: number;
}

/**
 * Ordered-dithering threshold (4x4 Bayer matrix) for a cell, in ]0, 1[.
 */
export function bayerThreshold(col: number, row: number): number {
  return BAYER_4[(row % 4) * 4 + (col % 4)] ?? 0.5;
}

/**
 * Gaussian falloff of a blob: 1 at its center, close to 0 beyond its radius.
 */
export function blobField(x: number, y: number, blob: GlowBlob): number {
  const distance = ((x - blob.x) ** 2 + (y - blob.y) ** 2) / blob.radius ** 2;
  return Math.exp(-distance * 2);
}

/**
 * Slow Lissajous path keeping a blob inside the area; each index follows its own curve.
 */
export function blobPosition(time: number, index: number, width: number, height: number): { x: number; y: number } {
  const speed = 0.00006 * (index + 1);
  return {
    x: width * (0.5 + 0.38 * Math.sin(time * speed + index * 2.1)),
    y: height * (0.5 + 0.32 * Math.cos(time * speed * 1.3 + index * 1.7)),
  };
}
