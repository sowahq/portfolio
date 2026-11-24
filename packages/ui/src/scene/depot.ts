import { seeded } from "../fx/random.js";
import {
  SCENE_PIXEL,
  SKYLINE_BACK,
  SKYLINE_FAR,
  bayer,
  paintSky,
  paintSkyline,
  painter,
  type Painter,
  type SceneCanvas,
} from "./pixels.js";

const OUTLINE = "#5B3E88";
const BELFRY = "#A48CDA";
const BELFRY_LIGHT = "#FDE68A";
const BRICKS = ["#9C79BC", "#A585C8"] as const;
const MORTAR = "#8C6BB2";
const ROOF_SHADE = "#6E529C";
const ROOF = "#7457B0";
const ROOF_GLASS = "#E9DDF6";
const BAY_DEEP = "#2A1D48";
const BAY = "#3B2A63";
const GROUND = "#7B62A4";
const GROUND_GRAIN = "#6F5598";
const RAIL_TOP = "#E9DFFA";
const RAIL_SHADE = "#C9B7EE";

const TRAIN_CANVAS_HEIGHT = 11;

/**
 * The sign hanging on the depot hall, one track per published fiche.
 */
export function depotSignLabel(tracks: number): string {
  return `ATELIER · VOIES 1–${tracks}`;
}

export interface DepotLayout {
  /** Horizontal center of the hall, where the sign hangs, in scene pixels. */
  signX: number;
  /** Top of the sign, in scene pixels. */
  signY: number;
  /** Center of the welding spark at the workbench, in scene pixels. */
  weld: { x: number; y: number };
  /** Top of the train riding the main track, in scene pixels. */
  trainTop: number;
}

interface Hall {
  left: number;
  right: number;
  wallTop: number;
  ground: number;
  wide: boolean;
}

function paintBelfry(paint: Painter, width: number, height: number, ground: number, wide: boolean): void {
  const x = Math.round(wide ? width * 0.86 : width * 0.88);
  const top = ground - Math.round(height * 0.5);

  paint.rect(x - 5, top + 12, 10, ground - top - 12, BELFRY);
  paint.rect(x - 3, top + 4, 6, 8, BELFRY);

  for (let step = 0; step < 6; step++) {
    paint.rect(x - Math.max(0, 3 - step / 2), top - step, Math.max(1, 6 - step), 1, BELFRY);
  }

  paint.rect(x - 1, top + 6, 2, 2, BELFRY_LIGHT);
}

function paintWall(paint: Painter, { left, right, wallTop, ground }: Hall): void {
  for (let y = wallTop; y < ground; y++) {
    for (let x = left; x < right; x++) {
      const row = (y - wallTop) % 3 === 0;
      const joint = (x + (Math.floor((y - wallTop) / 3) % 2) * 3) % 6 === 0;

      paint.dot(x, y, row || joint ? MORTAR : BRICKS[(x >> 3) & 1]);
    }
  }

  paint.rect(left - 1, wallTop - 1, right - left + 2, 1, OUTLINE);
  paint.rect(left - 1, wallTop, 1, ground - wallTop, OUTLINE);
  paint.rect(right, wallTop, 1, ground - wallTop, OUTLINE);
}

function paintSawtoothRoof(paint: Painter, { left, right, wallTop, wide }: Hall): void {
  const toothWidth = wide ? 18 : 14;
  const toothHeight = wide ? 12 : 9;

  for (let x = left; x + toothWidth <= right + 1; x += toothWidth) {
    for (let row = 0; row < toothHeight; row++) {
      const y = wallTop - toothHeight + row;
      const span = Math.round((toothWidth - 4) * ((row + 1) / toothHeight));

      paint.rect(x + toothWidth - 4 - span, y, span, 1, row % 3 === 0 ? ROOF_SHADE : ROOF);
      paint.dot(x + toothWidth - 5 - span, y, OUTLINE);
    }

    for (let row = 0; row < toothHeight; row++) {
      const lit = row % 4 !== 0;

      paint.rect(x + toothWidth - 4, wallTop - toothHeight + row, 3, 1, lit ? ROOF_GLASS : ROOF_SHADE);
    }

    paint.rect(x + toothWidth - 1, wallTop - toothHeight, 1, toothHeight, OUTLINE);
  }
}

function paintParkedTrain(paint: Painter, x: number, bayWidth: number, ground: number): void {
  const noseY = ground - 10;

  paint.rect(x + 3, noseY, bayWidth - 6, 10, "#FFFFFF");
  paint.rect(x + 4, noseY + 2, bayWidth - 8, 3, BAY);
  paint.rect(x + 3, noseY + 6, bayWidth - 6, 1, "#FDE047");
  paint.rect(x + 3, noseY + 7, bayWidth - 6, 1, "#7C3AED");
  paint.rect(x + 4, noseY + 8, 2, 1, "#FDF2B8");
  paint.rect(x + bayWidth - 6, noseY + 8, 2, 1, "#FDF2B8");
  paint.rect(x + 3, noseY, bayWidth - 6, 1, "#24123F");
}

function paintWorkbench(paint: Painter, x: number, bayWidth: number, ground: number): void {
  const benchY = ground - 6;

  paint.rect(x + 3, benchY, bayWidth - 6, 2, ROOF_SHADE);
  paint.rect(x + 4, benchY + 2, 1, 4, ROOF_SHADE);
  paint.rect(x + bayWidth - 5, benchY + 2, 1, 4, ROOF_SHADE);
  paint.rect(x + 6, benchY - 4, 3, 4, BRICKS[0]);
  paint.rect(x + 7, benchY - 6, 1, 2, BRICKS[0]);
  paint.rect(x + bayWidth - 9, benchY - 2, 4, 2, "#C29ABF");
}

function paintBays(paint: Painter, hall: Hall, bayTop: number): number[] {
  const { left, right, ground, wide } = hall;
  const hallWidth = right - left;
  const bays = wide ? 4 : 2;
  const bayWidth = Math.min(22, Math.floor((hallWidth - (bays + 1) * 6) / bays));
  const bayGap = (hallWidth - bays * bayWidth) / (bays + 1);
  const radius = bayWidth / 2;
  const centers: number[] = [];

  for (let index = 0; index < bays; index++) {
    const x = Math.round(left + bayGap + index * (bayWidth + bayGap));

    centers.push(x + radius);

    for (let y = bayTop; y < ground; y++) {
      for (let dx = 0; dx < bayWidth; dx++) {
        const fromCenter = dx + 0.5 - radius;
        const archY = bayTop + radius - Math.sqrt(Math.max(0, radius * radius - fromCenter * fromCenter));

        if (y < archY) {
          continue;
        }

        const depth = (y - bayTop) / (ground - bayTop);

        paint.dot(x + dx, y, depth > 0.55 ? BAY_DEEP : BAY);
      }
    }

    for (let dx = -1; dx <= bayWidth; dx++) {
      const fromCenter = dx + 0.5 - radius;
      const archY = bayTop + radius - Math.sqrt(Math.max(0, (radius + 1) ** 2 - fromCenter * fromCenter));

      paint.dot(x + dx, Math.round(archY), OUTLINE);
    }

    if (index === 0) {
      paintParkedTrain(paint, x, bayWidth, ground);
    }

    if (index === bays - 1) {
      paintWorkbench(paint, x, bayWidth, ground);
    }
  }

  return centers;
}

function paintYard(paint: Painter, width: number, height: number, ground: number, bayCenters: number[]): number {
  paint.rect(0, ground, width, height - ground, GROUND);

  for (let y = ground; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (bayer(x, y) > 9) {
        paint.dot(x, y, GROUND_GRAIN);
      }
    }
  }

  for (const center of bayCenters) {
    for (let y = ground; y < ground + 5; y++) {
      const spread = (y - ground) * 0.6;

      paint.dot(center - 3 - spread, y, OUTLINE);
      paint.dot(center + 2 + spread, y, OUTLINE);
    }
  }

  const mainTrack = ground + 7;

  for (let x = 0; x < width; x += 3) {
    paint.rect(x, mainTrack - 1, 2, 3, OUTLINE);
  }

  paint.rect(0, mainTrack - 1, width, 1, RAIL_TOP);
  paint.rect(0, mainTrack + 1, width, 1, RAIL_SHADE);

  return mainTrack;
}

/**
 * Paints the VAL depot (dithered sky, skyline, distant belfry, brick hall with a sawtooth roof and arched bays,
 * a train parked in the first bay, a workbench in the last one, and the main track) on a canvas sized to its CSS box.
 * Returns where the sign, the welding spark and the riding train go, in scene pixels.
 */
export function paintDepot(canvas: SceneCanvas, seed = 23): DepotLayout {
  const random = seeded(seed);
  const width = Math.max(90, Math.ceil(canvas.clientWidth / SCENE_PIXEL));
  const height = Math.max(60, Math.ceil(canvas.clientHeight / SCENE_PIXEL));

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return { signX: 0, signY: 0, weld: { x: 0, y: 0 }, trainTop: 0 };
  }

  const ground = height - 14;
  const wide = width > 200;
  const paint = painter(context);

  paintSky(context, width, height, ground);
  paintSkyline(paint, random, width, ground, SKYLINE_FAR, Math.round(height * 0.1), Math.round(height * 0.22));
  paintSkyline(paint, random, width, ground, SKYLINE_BACK, Math.round(height * 0.06), Math.round(height * 0.15));
  paintBelfry(paint, width, height, ground, wide);

  const hall: Hall = {
    left: wide ? Math.round(width * 0.05) : 3,
    right: Math.round(width * (wide ? 0.7 : 0.74)),
    wallTop: ground - Math.round(height * 0.36),
    ground,
    wide,
  };

  paintWall(paint, hall);
  paintSawtoothRoof(paint, hall);

  const signY = hall.wallTop + 3;
  const bayCenters = paintBays(paint, hall, signY + 9);
  const mainTrack = paintYard(paint, width, height, ground, bayCenters);
  const lastBay = bayCenters.at(-1) ?? hall.left;

  return {
    signX: hall.left + (hall.right - hall.left) / 2,
    signY,
    weld: { x: lastBay + 2, y: ground - 7 },
    trainTop: mainTrack - TRAIN_CANVAS_HEIGHT,
  };
}
