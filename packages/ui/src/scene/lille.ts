import { seeded } from "../fx/random.js";
import {
  SCENE_PIXEL,
  SKY,
  SKYLINE_BACK,
  SKYLINE_FAR,
  bayer,
  paintSky,
  paintSkyline,
  painter,
  type SceneBox,
  type SceneCanvas,
} from "./pixels.js";

export { SCENE_PIXEL };

interface Palette {
  sky: readonly string[];
  far: string;
  farBack: string;
  houses: string[];
  line: string;
  windowOff: string;
  windowOn: string;
  litRatio: number;
  tower: [string, string];
  ground: [string, string];
  walk: string;
}

const DAY: Palette = {
  sky: SKY,
  far: SKYLINE_FAR,
  farBack: SKYLINE_BACK,
  houses: ["#9C79BC", "#B08BC6", "#8C6BB2", "#C29ABF", "#A585C8", "#B696CF"],
  line: "#5B3E88",
  windowOff: "#6E529C",
  windowOn: "#FDE68A",
  litRatio: 0.18,
  tower: ["#8D70C9", "#7457B0"],
  ground: ["#6F5598", "#7B62A4"],
  walk: "#D9CBF4",
};

export interface CityWindow {
  x: number;
  y: number;
  on: boolean;
}

export interface CityScene {
  /** Top of the viaduct deck, in scene pixels. */
  deck: number;
  /** Windows visible above the viaduct, the only ones the flicker may touch. */
  windows: CityWindow[];
  windowColors: { on: string; off: string };
}

/**
 * Paints the Lille rooftops, the belfry and the VAL viaduct on a canvas sized to its CSS box.
 */
export function paintCity(canvas: SceneCanvas, seed = 11): CityScene {
  const palette = DAY;
  const random = seeded(seed);
  const width = Math.max(80, Math.ceil(canvas.clientWidth / SCENE_PIXEL));
  const height = Math.max(60, Math.ceil(canvas.clientHeight / SCENE_PIXEL));
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return { deck: 0, windows: [], windowColors: { on: palette.windowOn, off: palette.windowOff } };

  const ground = height - 7;
  paintSky(context, width, height, ground, palette.sky);

  const paint = painter(context);
  const { rect, dot } = paint;

  const wide = width > 240;
  const sunX = Math.round(wide ? width * 0.82 : width * 0.5);
  const sunY = Math.round(ground - height * (wide ? 0.2 : 0.3));
  const sunRadius = Math.max(5, Math.round(height * 0.05));
  for (let y = -sunRadius * 3; y <= sunRadius * 3; y++) {
    for (let x = -sunRadius * 3; x <= sunRadius * 3; x++) {
      const distance = Math.hypot(x, y);
      if (distance <= sunRadius) dot(sunX + x, sunY + y, "#FDF2B8");
      else if (distance <= sunRadius * 2.6) {
        const glow = 1 - (distance - sunRadius) / (sunRadius * 1.6);
        if (glow * 16 * 0.55 > bayer(sunX + x, sunY + y)) dot(sunX + x, sunY + y, "#F8E6C8");
      }
    }
  }

  paintSkyline(paint, random, width, ground, palette.far, Math.round(height * 0.08), Math.round(height * 0.16));
  paintSkyline(paint, random, width, ground, palette.farBack, Math.round(height * 0.06), Math.round(height * 0.13));

  const windows: CityWindow[] = [];
  const towerX = Math.round(wide ? width * 0.94 : width * 0.78);

  const belfry = (cx: number): void => {
    const [body, shade] = palette.tower;
    const baseWidth = 14;
    const baseHeight = Math.round(height * 0.2);
    const upperWidth = 10;
    const upperHeight = Math.round(height * 0.08);
    const baseX = cx - baseWidth / 2;
    const baseY = ground - baseHeight;
    rect(baseX, baseY, baseWidth, baseHeight, body);
    rect(baseX + baseWidth - 4, baseY, 4, baseHeight, shade);
    for (let y = baseY + 4; y < ground - 6; y += 7) {
      rect(baseX + 3, y, 2, 4, palette.windowOff);
      rect(baseX + 8, y, 2, 4, random() < palette.litRatio ? palette.windowOn : palette.windowOff);
    }
    const upperX = cx - upperWidth / 2;
    const upperY = baseY - upperHeight;
    rect(upperX, upperY, upperWidth, upperHeight, body);
    rect(upperX + upperWidth - 3, upperY, 3, upperHeight, shade);
    rect(baseX - 1, baseY - 1, baseWidth + 2, 1, palette.line);
    rect(cx - 2, upperY + 2, 4, 4, "#FDE68A");
    dot(cx, upperY + 3, palette.line);
    dot(cx, upperY + 4, palette.line);
    const spire = Math.round(height * 0.09);
    for (let i = 0; i < spire; i++) {
      const w = Math.max(1, Math.round(upperWidth * (1 - i / spire)));
      rect(cx - w / 2, upperY - i, w, 1, i % 4 === 0 ? shade : body);
    }
    rect(cx, upperY - spire - 3, 1, 3, palette.line);
    for (const turretX of [upperX - 1, upperX + upperWidth - 1]) {
      rect(turretX, upperY - 3, 2, 3, body);
      dot(turretX, upperY - 4, palette.line);
    }
  };

  const house = (x: number, w: number, h: number, color: string): void => {
    const top = ground - h;
    const steps = Math.max(2, Math.floor(w / 4));
    rect(x, top, w, h, color);
    for (let step = 0; step < steps; step++) {
      const inset = (step + 1) * Math.floor(w / (2 * steps + 1));
      rect(x + inset, top - (step + 1) * 2, w - inset * 2, 2, color);
      rect(x + inset - 1, top - (step + 1) * 2, 1, 2, palette.line);
      rect(x + w - inset, top - (step + 1) * 2, 1, 2, palette.line);
    }
    rect(x, top, 1, h, palette.line);
    rect(x + w - 1, top, 1, h, palette.line);
    for (let wy = top + 3; wy < ground - 6; wy += 6) {
      for (let wx = x + 2; wx + 2 < x + w - 1; wx += 4) {
        const on = random() < palette.litRatio;
        rect(wx, wy, 2, 3, on ? palette.windowOn : palette.windowOff);
        windows.push({ x: wx, y: wy, on });
      }
    }
    rect(x + (w >> 1) - 1, ground - 5, 3, 5, palette.line);
  };

  const rows: [number, number, number, string][] = [];
  for (let x = -3, index = 0; x < width + 4; index++) {
    const w = 11 + ((random() * 9) | 0);
    const h = Math.round(height * 0.07) + ((random() * height * 0.06) | 0);
    rows.push([x, w, h, palette.houses[index % palette.houses.length]]);
    x += w;
  }
  belfry(towerX);
  for (const [x, w, h, color] of rows) if (Math.abs(x + w / 2 - towerX) > 12) house(x, w, h, color);

  const deck = ground - Math.round(height * 0.085);
  for (let px = 6; px < width; px += 22) {
    rect(px, deck + 3, 4, ground - deck - 3, "#E9DFFA");
    rect(px + 3, deck + 3, 1, ground - deck - 3, "#C9B7EE");
    rect(px - 1, deck + 3, 6, 1, "#C9B7EE");
  }
  rect(0, deck, width, 3, "#F4EEFD");
  rect(0, deck + 3, width, 1, "#B9A5E6");
  rect(0, deck - 1, width, 1, "#B9A5E6");

  rect(0, ground, width, 1, palette.walk);
  for (let y = ground + 1; y < height; y++) {
    for (let x = 0; x < width; x++) dot(x, y, palette.ground[((x >> 1) + (y & 1)) & 1]);
  }

  return {
    deck,
    windows: windows.filter((pane) => pane.y + 3 < deck - 1),
    windowColors: { on: palette.windowOn, off: palette.windowOff },
  };
}

/**
 * Lights or switches off one real window, never anything else on the canvas.
 */
export function flickerWindow(canvas: SceneCanvas, scene: CityScene, random: () => number = Math.random): void {
  if (scene.windows.length === 0) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const pane = scene.windows[Math.floor(random() * scene.windows.length)];
  pane.on = !pane.on;
  context.fillStyle = pane.on ? scene.windowColors.on : scene.windowColors.off;
  context.fillRect(pane.x, pane.y, 2, 3);
}

/**
 * Paints a strip of pixel clouds twice as wide as its box so a CSS translate can loop it.
 */
export function paintClouds(canvas: SceneCanvas, box: SceneBox): void {
  const width = Math.ceil(box.clientWidth / SCENE_PIXEL);
  const height = Math.ceil(box.clientHeight / SCENE_PIXEL);
  canvas.width = width * 2;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  const random = seeded(5);
  const blob = (cx: number, cy: number, size: number): void => {
    for (let part = 0; part < 5; part++) {
      const offset = (part - 2) * size * 0.9;
      const radius = size * (part === 2 ? 1.2 : 0.75 + random() * 0.3);
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          if (x * x + y * y > radius * radius || y >= radius * 0.55) continue;
          context.fillStyle = y > radius * 0.2 ? "#E4D8F8" : "#F6F1FD";
          context.fillRect((cx + offset + x) | 0, (cy + y) | 0, 1, 1);
        }
      }
    }
  };
  for (let half = 0; half < 2; half++) {
    const layout = seeded(9);
    for (let n = 0; n < 4; n++)
      blob(half * width + layout() * width, height * (0.08 + layout() * 0.3), 3 + layout() * 3);
  }
}

export const TRAIN_HEIGHT = 11;

/**
 * Paints the two-car VAL train at its native 64x11 pixel size.
 */
export function paintTrain(canvas: SceneCanvas): void {
  canvas.width = 64;
  canvas.height = TRAIN_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return;
  const rect = (x: number, y: number, w: number, h: number, color: string): void => {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  };
  for (const car of [0, 33]) {
    rect(car + 1, 1, 29, 8, "#FFFFFF");
    rect(car, 2, 31, 6, "#FFFFFF");
    rect(car + 1, 8, 29, 1, "#C9B7EE");
    rect(car + 2, 6, 27, 1, "#FDE047");
    rect(car + 2, 7, 27, 1, "#7C3AED");
    for (let pane = 0; pane < 5; pane++) rect(car + 3 + pane * 5, 3, 3, 2, "#3B2A63");
    rect(car + 1, 0, 29, 1, "#24123F");
    rect(car, 1, 1, 8, "#24123F");
    rect(car + 30, 1, 1, 8, "#24123F");
    rect(car + 1, 9, 29, 1, "#24123F");
    rect(car + 5, 10, 3, 1, "#24123F");
    rect(car + 22, 10, 3, 1, "#24123F");
  }
  rect(31, 4, 2, 3, "#24123F");
}
