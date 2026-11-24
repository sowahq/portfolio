import { parisTime } from "../clock.js";
import { paintDepot } from "../scene/depot.js";
import { paintCity, paintClouds, paintTrain, type CityScene } from "../scene/lille.js";
import { cityTrainTop, depotPlacement, type Point } from "../scene/placement.js";

function find<T extends Element>(root: ParentNode, selector: string): T | null {
  return root.querySelector<T>(selector);
}

function place(element: HTMLElement, point: Point): void {
  element.style.left = `${point.left}px`;
  element.style.top = `${point.top}px`;
  element.style.visibility = "visible";
}

export interface PaintedCity {
  canvas: HTMLCanvasElement;
  scene: CityScene;
}

const CITY_SCENE = Symbol.for("mth.city-scene");

function isPaintedCity(value: unknown): value is PaintedCity {
  return typeof value === "object" && value !== null && "canvas" in value && "scene" in value;
}

/**
 * Paints the depot inside its root element and moves the sign, the spark and the train into place.
 */
export function paintDepotScene(root: HTMLElement): void {
  const canvas = find<HTMLCanvasElement>(root, "[data-depot-scene]");
  const sign = find<HTMLElement>(root, "[data-depot-sign]");
  const weld = find<HTMLElement>(root, "[data-depot-weld]");
  const train = find<HTMLCanvasElement>(root, "[data-depot-train]");

  if (!canvas || !sign || !weld || !train) {
    return;
  }

  const placement = depotPlacement(paintDepot(canvas));

  place(sign, placement.sign);
  place(weld, placement.weld);

  paintTrain(train);
  train.style.top = `${placement.trainTop}px`;
  train.style.visibility = "visible";
}

/**
 * Paints the Lille rooftops, the clouds and the train inside the scene root, and returns the city for the window flicker.
 */
export function paintCityScene(root: HTMLElement): PaintedCity | null {
  const city = find<HTMLCanvasElement>(root, "[data-city-scene]");
  const clouds = find<HTMLCanvasElement>(root, "[data-city-clouds]");
  const cloudBox = find<HTMLElement>(root, "[data-city-cloud-box]");
  const train = find<HTMLCanvasElement>(root, "[data-city-train]");

  if (!city || !clouds || !cloudBox || !train) {
    return null;
  }

  const scene = paintCity(city);

  paintClouds(clouds, cloudBox);
  paintTrain(train);
  train.style.top = `${cityTrainTop(scene)}px`;
  train.style.visibility = "visible";

  const painted = { canvas: city, scene };

  Reflect.set(root, CITY_SCENE, painted);

  return painted;
}

/**
 * The city last painted inside this scene root, whichever bundle painted it.
 */
export function paintedCity(root: HTMLElement): PaintedCity | null {
  const painted: unknown = Reflect.get(root, CITY_SCENE);

  return isPaintedCity(painted) ? painted : null;
}

const PAINTED = "data-painted";

/**
 * Paints a scene now, then again only when its box really changes size.
 * Returns a function that stops watching it.
 */
export function keepPainted(root: HTMLElement, paint: (root: HTMLElement) => unknown): () => void {
  let width = root.clientWidth;
  let height = root.clientHeight;

  paint(root);
  root.setAttribute(PAINTED, "");

  const observer = new ResizeObserver(() => {
    if (root.clientWidth === width && root.clientHeight === height) {
      return;
    }

    width = root.clientWidth;
    height = root.clientHeight;
    paint(root);
  });

  observer.observe(root);

  return () => observer.disconnect();
}

/**
 * True when the early script already paints this scene and keeps it in sync with its size.
 */
export function paintedEarly(root: HTMLElement): boolean {
  return root.hasAttribute(PAINTED);
}

/**
 * Paints the header scenes and sets the board clocks while the HTML is still being parsed,
 * so the first frame already shows them instead of waiting for the app to hydrate.
 * Each scene is then repainted inside its resize observer, in the same frame as the layout change
 * that resized it (the web fonts arriving, the window being resized).
 */
export function paintEarly(): void {
  for (const root of document.querySelectorAll<HTMLElement>("[data-depot]")) {
    keepPainted(root, paintDepotScene);
  }

  for (const root of document.querySelectorAll<HTMLElement>("[data-city]")) {
    keepPainted(root, paintCityScene);
  }

  for (const clock of document.querySelectorAll<HTMLElement>("[data-paris-clock]")) {
    clock.textContent = parisTime();
  }
}
