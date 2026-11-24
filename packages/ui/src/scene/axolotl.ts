import type { Painter } from "./pixels.js";

/**
 * Sprite box of the giant axolotl: wide flat head, smile, pink feathery gills, soft dorsal crest, mint belly.
 * Its origin is the top of the head, near the back.
 */
export const AXOLOTL = { width: 76, height: 104, originX: 38, originY: 14 } as const;

const COLORS = {
  body: "#4C3A86",
  shade: "#3A2B6E",
  spot: "#6B58A8",
  belly: "#7EE0B8",
  bellyShade: "#58C49A",
  fin: "#8B7BD0",
  gill: "#F472B6",
  gillTip: "#FBCFE8",
  mouth: "#9F1239",
  line: "#1A0E30",
  white: "#FFFFFF",
} as const;

type Grid = (string | null)[];

const grids = new Map<number, Grid>();

function build(mouth: number): Grid {
  const { width: W, height: H, originX: OX, originY: OY } = AXOLOTL;
  const grid: Grid = new Array<string | null>(W * H).fill(null);
  const set = (x: number, y: number, color: string): void => {
    const px = x + OX;
    const py = y + OY;
    if (px >= 0 && px < W && py >= 0 && py < H) grid[py * W + px] = color;
  };

  for (let y = 14; y < H - OY; y++) {
    const edge = 2 + 15 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 58) / 42, 2)));
    const fin = 3 + Math.round(Math.sin(y * 0.35) * 1.2);
    for (let k = 0; k < fin; k++) set(Math.round(edge) + k, y, COLORS.fin);
  }

  const frond = (x0: number, y0: number, dx: number, dy: number, length: number): void => {
    const n = Math.hypot(dx, dy);
    const ux = dx / n;
    const uy = dy / n;
    for (let i = 0; i < length; i++) {
      const x = Math.round(x0 + ux * i);
      const y = Math.round(y0 + uy * i);
      set(x, y, COLORS.gill);
      set(x, y + 1, COLORS.gill);
      if (i > 1 && i % 2 === 0) {
        set(Math.round(x - uy * 2), Math.round(y + ux * 2), COLORS.gillTip);
        set(Math.round(x + uy * 2), Math.round(y - ux * 2) + 1, COLORS.gillTip);
      }
    }
  };
  frond(-4, 2, -0.5, -1, 9);
  frond(-1, 2, 0.15, -1, 10);
  frond(3, 3, 0.8, -1, 9);
  frond(6, 6, 1, -0.45, 10);
  frond(7, 10, 1, 0.05, 10);
  frond(6, 14, 1, 0.5, 9);

  for (let y = 16; y < H - OY; y++) {
    for (let x = -16; x <= 18; x++) {
      if (Math.pow((x - 1) / 16, 2) + Math.pow((y - 58) / 42, 2) <= 1) set(x, y, x > 10 ? COLORS.shade : COLORS.body);
    }
  }
  for (let y = 26; y < H - OY; y++) {
    for (let x = -14; x <= 1; x++) {
      if (Math.pow((x + 6) / 7, 2) + Math.pow((y - 62) / 36, 2) <= 1) {
        set(x, y, y % 6 === 0 ? COLORS.bellyShade : COLORS.belly);
      }
    }
  }
  for (const [x, y] of [
    [6, 30],
    [9, 40],
    [4, 48],
    [10, 56],
    [7, 66],
  ] as const) {
    set(x, y, COLORS.spot);
    set(x + 1, y, COLORS.spot);
    set(x, y + 1, COLORS.spot);
  }

  for (let y = 0; y <= 18; y++) {
    for (let x = -26; x <= 7; x++) {
      const cx = x < -23 ? -23 - x : x > 4 ? x - 4 : 0;
      const cy = y < 3 ? 3 - y : y > 15 ? y - 15 : 0;
      if (cx * cx + cy * cy <= 10) set(x, y, x > 3 ? COLORS.shade : COLORS.body);
    }
  }
  for (const [x, y] of [
    [-6, 3],
    [-2, 6],
    [-10, 2],
  ] as const) {
    set(x, y, COLORS.spot);
  }

  for (const [x, y] of [
    [-16, 6],
    [-17, 7],
    [-16, 7],
    [-18, 7],
    [-15, 7],
    [-17, 8],
    [-16, 8],
  ] as const) {
    set(x, y, COLORS.line);
  }
  set(-17, 6, COLORS.white);

  if (mouth === 0) {
    for (let x = -25; x <= -11; x++) set(x, 13, COLORS.line);
    set(-10, 12, COLORS.line);
    set(-9, 11, COLORS.line);
  } else {
    for (let y = 13; y < 13 + mouth; y++) for (let x = -26; x <= -9; x++) set(x, y, COLORS.mouth);
    for (let x = -25; x <= -11; x += 4) {
      set(x, 13, COLORS.white);
      set(x + 2, 12 + mouth, COLORS.white);
    }
    for (let y = 13 + mouth; y <= 18 + mouth; y++) {
      for (let x = -25 + (y > 16 + mouth ? 2 : 0); x <= 0; x++) set(x, y, COLORS.body);
    }
  }

  for (let y = 34; y <= 38; y++) for (let x = -22; x <= -12; x++) set(x, y, y > 36 ? COLORS.shade : COLORS.body);
  for (const y of [33, 35, 37, 39]) {
    set(-24, y, COLORS.body);
    set(-23, y, COLORS.body);
  }

  const outlined = grid.slice();
  const filled = (x: number, y: number): boolean => x >= 0 && x < W && y >= 0 && y < H && grid[y * W + x] !== null;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y * W + x] === null && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))) {
        outlined[y * W + x] = COLORS.line;
      }
    }
  }
  return outlined;
}

/**
 * Paints the giant axolotl with its head top at (x, top), its mouth open by `mouth` pixels (0 smiles).
 * Rows below `clip` are skipped, so it can rise from behind the rooftops.
 */
export function paintAxolotl(paint: Painter, x: number, top: number, mouth: number, clip = Infinity): void {
  let grid = grids.get(mouth);
  if (!grid) {
    grid = build(mouth);
    grids.set(mouth, grid);
  }
  const { width: W, height: H, originX: OX, originY: OY } = AXOLOTL;
  const left = Math.round(x) - OX;
  const head = Math.round(top) - OY;
  for (let row = 0; row < H && head + row < clip; row++) {
    for (let column = 0; column < W;) {
      const color = grid[row * W + column];
      let run = 1;
      while (column + run < W && grid[row * W + column + run] === color) run++;
      if (color) paint.rect(left + column, head + row, run, 1, color);
      column += run;
    }
  }
}

/** Length of the whole appearance, in seconds. */
export const AXOLOTL_SHOW = 6.4;

/** Length of the appearance when motion is reduced: it simply stands there for a while. */
export const AXOLOTL_STILL_SHOW = 4;

export interface AxolotlPose {
  /** Head centre and top, in scene pixels. */
  x: number;
  top: number;
  mouth: number;
  /** Screen shake in scene pixels, 0 when calm. */
  shake: number;
}

const easeOut = (p: number): number => 1 - Math.pow(1 - p, 3);
const easeIn = (p: number): number => p * p * p;
const clamp = (p: number): number => Math.max(0, Math.min(1, p));

/**
 * Where the axolotl stands `seconds` after the code was typed, or null once it is gone.
 * It rumbles, rises from behind the rooftops, cries, breathes for a moment, then sinks back.
 */
export function axolotlAt(seconds: number, width: number, height: number, reduced = false): AxolotlPose | null {
  const ground = height - 7;
  const x = Math.round(width * (width > 240 ? 0.6 : 0.64));
  const raised = ground - Math.round(Math.max(44, height * 0.26));
  const hidden = ground + AXOLOTL.originY + 2;

  if (reduced) return seconds < AXOLOTL_STILL_SHOW ? { x, top: raised, mouth: 0, shake: 0 } : null;
  if (seconds >= AXOLOTL_SHOW) return null;

  const rise = seconds < 0.6 ? 0 : seconds < 1.8 ? easeOut((seconds - 0.6) / 1.2) : 1;
  const sink = seconds < 5.2 ? 0 : easeIn(clamp((seconds - 5.2) / 1.2));
  const breathe = seconds > 3.8 && seconds < 5.2 ? Math.round(Math.sin((seconds - 3.8) * 4)) : 0;
  const top = Math.round(hidden + (raised - hidden) * rise + (hidden - raised) * sink) + breathe;
  const mouth = seconds < 2.4 || seconds > 3.8 ? 0 : seconds < 3.4 ? Math.min(5, Math.floor((seconds - 2.4) * 10)) : 2;
  const moving = seconds < 1.8 || seconds > 5.2;
  const crying = seconds > 2.6 && seconds < 3.4;
  return { x, top, mouth, shake: crying ? 2 : moving ? 1 : 0 };
}
