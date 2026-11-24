import { paintDepot } from "../scene/depot.js";
import { TRAIN_HEIGHT, paintCity, paintClouds, paintTrain } from "../scene/lille.js";
import { SCENE_PIXEL } from "../scene/pixels.js";
import { depotPlacement, type DepotPlacement } from "../scene/placement.js";
import { SoftwareCanvas } from "./canvas.js";
import { crop, drawRaster, fadeVertically, upscale, type FadeStop, type Raster } from "./raster.js";

/**
 * The same fade as the `depot-fade` utility of theme.css, so the depot sinks into the paper at the top.
 */
export const DEPOT_FADE: readonly FadeStop[] = [
  { at: 0, opacity: 0 },
  { at: 0.22, opacity: 0.35 },
  { at: 0.38, opacity: 0.8 },
  { at: 0.52, opacity: 1 },
];

function train(): Raster {
  const canvas = new SoftwareCanvas(0, 0);

  paintTrain(canvas);

  return canvas.raster;
}

function enlarge(raster: Raster, width: number, height: number): Raster {
  return crop(upscale(raster, SCENE_PIXEL), width, height);
}

export interface DepotStrip {
  image: Raster;
  /** Where the hall sign goes, in image pixels. */
  placement: DepotPlacement;
}

/**
 * The VAL depot painted at the size of a box, with a train on the main track, enlarged to the box
 * pixel for pixel like on the blog header.
 */
export function depotStrip(width: number, height: number, trainAt = 0.6): DepotStrip {
  const canvas = new SoftwareCanvas(width, height);
  const layout = paintDepot(canvas);

  drawRaster(canvas.raster, train(), Math.round(canvas.width * trainAt), layout.trainTop);
  fadeVertically(canvas.raster, DEPOT_FADE);

  return { image: enlarge(canvas.raster, width, height), placement: depotPlacement(layout) };
}

const CLOUD_BAND = { top: 380, height: 120 } as const;

/**
 * The Lille rooftops, the belfry, the clouds and a train on the viaduct, painted at the size of a box
 * and enlarged to it pixel for pixel like on the portfolio header.
 */
export function cityBackdrop(width: number, height: number, trainAt = 0.34): Raster {
  const canvas = new SoftwareCanvas(width, height);
  const clouds = new SoftwareCanvas(0, 0);
  const scene = paintCity(canvas);

  paintClouds(clouds, { clientWidth: width, clientHeight: CLOUD_BAND.height });
  drawRaster(canvas.raster, clouds.raster, 0, Math.round(CLOUD_BAND.top / SCENE_PIXEL));
  drawRaster(canvas.raster, train(), Math.round(canvas.width * trainAt), scene.deck - TRAIN_HEIGHT);

  return enlarge(canvas.raster, width, height);
}
