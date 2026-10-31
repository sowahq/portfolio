/**
 * Rounds a value to the nearest multiple of `grid`.
 */
export function snap(value: number, grid: number): number {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

/**
 * Floors an elapsed time to the last frame boundary of a virtual frame rate.
 */
export function quantizeTime(elapsed: number, fps: number): number {
  if (fps <= 0) return elapsed;
  const frame = 1000 / fps;
  return Math.floor(elapsed / frame) * frame;
}
