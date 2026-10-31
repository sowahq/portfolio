import { fitCanvas } from "./canvas.js";
import { linear, type Easing } from "./easing.js";
import { quantizeTime } from "./quantize.js";
import type { Random } from "./random.js";
import { getTicker, type Ticker } from "./ticker.js";

export interface Point {
  x: number;
  y: number;
}

export interface DissolveGrid {
  cols: number;
  rows: number;
  cell: number;
}

export type WipeMode = "cover" | "reveal";

export interface WipeOptions {
  mode: WipeMode;
  color: string;
  cell?: number;
  duration?: number;
  fps?: number;
  origin?: Point;
  jitter?: number;
  ease?: Easing;
  random?: Random;
  ticker?: Ticker;
}

export function gridFor(width: number, height: number, cell: number): DissolveGrid {
  return {
    cols: Math.ceil(width / cell),
    rows: Math.ceil(height / cell),
    cell,
  };
}

/**
 * Orders grid cells for a dissolve: random noise, optionally radiating from an origin point.
 */
export function dissolveOrder(
  grid: DissolveGrid,
  random: Random,
  origin?: Point,
  jitter = 0.35,
): number[] {
  const total = grid.cols * grid.rows;
  const maxDistance = Math.hypot(grid.cols * grid.cell, grid.rows * grid.cell) || 1;
  const keyed = Array.from({ length: total }, (_, index) => {
    if (!origin) return { index, key: random() };
    const cx = ((index % grid.cols) + 0.5) * grid.cell;
    const cy = (Math.floor(index / grid.cols) + 0.5) * grid.cell;
    const distance = Math.hypot(cx - origin.x, cy - origin.y) / maxDistance;
    return { index, key: distance + random() * jitter };
  });
  return keyed.sort((a, b) => a.key - b.key).map(({ index }) => index);
}

/**
 * Number of cells that should be processed at a given elapsed time.
 */
export function cellsAt(
  elapsed: number,
  total: number,
  duration: number,
  fps: number,
  ease: Easing = linear,
): number {
  const progress = duration <= 0 ? 1 : Math.min(1, quantizeTime(elapsed, fps) / duration);
  return Math.min(total, Math.floor(ease(progress) * total));
}

/**
 * Covers or reveals a canvas cell by cell, like a sprite being drawn or erased.
 */
export function pixelWipe(canvas: HTMLCanvasElement, options: WipeOptions): Promise<void> {
  const {
    mode,
    color,
    cell = 32,
    duration = 600,
    fps = 24,
    origin,
    jitter,
    ease = linear,
    random = Math.random,
    ticker = getTicker(),
  } = options;
  const { context, width, height } = fitCanvas(canvas);
  const grid = gridFor(width, height, cell);
  const order = dissolveOrder(grid, random, origin, jitter);
  const total = order.length;

  context.fillStyle = color;
  if (mode === "reveal") context.fillRect(0, 0, width, height);

  const paint = (from: number, to: number): void => {
    order.slice(from, to).forEach((index) => {
      const x = (index % grid.cols) * cell;
      const y = Math.floor(index / grid.cols) * cell;
      if (mode === "cover") context.fillRect(x, y, cell, cell);
      else context.clearRect(x, y, cell, cell);
    });
  };

  return new Promise((resolve) => {
    let start = -1;
    let done = 0;
    const remove = ticker.add((time) => {
      if (start < 0) start = time;
      const target = cellsAt(time - start, total, duration, fps, ease);
      paint(done, target);
      done = target;
      if (done >= total) {
        remove();
        resolve();
      }
    });
  });
}
