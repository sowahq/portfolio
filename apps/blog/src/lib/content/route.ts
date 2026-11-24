export interface RoutePosition {
  current: number;
  offset: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Where the train stands on the steps rail: the last step whose heading the reading line has passed,
 * and how far it is between that stop and the next one, in rail pixels.
 */
export function routePosition(readingLine: number, headingTops: number[], stopTops: number[]): RoutePosition {
  if (headingTops.length === 0 || stopTops.length === 0) {
    return { current: 0, offset: 0 };
  }

  const current = headingTops.reduce((reached, top, index) => (readingLine >= top ? index : reached), 0);
  const next = Math.min(headingTops.length - 1, current + 1);
  const span = (headingTops[next] ?? 0) - (headingTops[current] ?? 0);
  const fraction = span > 0 ? clamp((readingLine - (headingTops[current] ?? 0)) / span, 0, 1) : 0;
  const from = stopTops[current] ?? 0;
  const to = stopTops[next] ?? from;

  return { current, offset: from + (to - from) * fraction };
}

/**
 * Share of an element that a reading line has passed, from 0 to 1.
 */
export function readFraction(readingLine: number, top: number, height: number): number {
  return height > 0 ? clamp((readingLine - top) / height, 0, 1) : 0;
}

/**
 * Line under the steps rail: the minutes left, or the terminus once the last stop is reached.
 */
export function remainingLabel(minutes: number, lastStopReached: boolean): string {
  if (minutes === 0 || lastStopReached) {
    return "terminus, tout le monde descend";
  }

  return `encore ${minutes} min avant le terminus`;
}

/**
 * Minutes of reading left, rounded up.
 */
export function remainingMinutes(totalMinutes: number, read: number): number {
  return Math.max(0, Math.ceil(totalMinutes * (1 - read)));
}
