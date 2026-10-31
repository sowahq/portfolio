import { pick, range, type Random } from "./random.js";

export interface Drifter {
  x: number;
  y: number;
  size: number;
  rotation: number;
  spin: number;
  speed: number;
  depth: number;
  color: string;
}

export interface DriftOptions {
  count: number;
  colors: readonly string[];
  size: readonly [number, number];
  speed: readonly [number, number];
  spin: readonly [number, number];
}

/**
 * Scatters outlined squares across an area. Speeds are in px/ms, spin in rad/ms.
 * Larger squares get a higher depth so they react more to parallax.
 */
export function createDrifters(width: number, height: number, options: DriftOptions, random: Random): Drifter[] {
  const [minSize, maxSize] = options.size;
  return Array.from({ length: options.count }, () => {
    const size = range(random, options.size);
    return {
      x: random() * width,
      y: random() * height,
      size,
      rotation: random() * Math.PI * 2,
      spin: range(random, options.spin) * (random() < 0.5 ? -1 : 1),
      speed: range(random, options.speed),
      depth: maxSize === minSize ? 1 : 0.3 + ((size - minSize) / (maxSize - minSize)) * 0.7,
      color: pick(random, options.colors),
    };
  });
}

/**
 * Moves a drifter upward and wraps it to the bottom once it fully leaves the top edge.
 */
export function stepDrifter(drifter: Drifter, delta: number, height: number): void {
  drifter.y -= drifter.speed * delta;
  drifter.rotation += drifter.spin * delta;
  if (drifter.y < -drifter.size) drifter.y = height + drifter.size;
}
