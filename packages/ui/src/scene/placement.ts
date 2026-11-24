import type { DepotLayout } from "./depot.js";
import { TRAIN_HEIGHT, type CityScene } from "./lille.js";
import { SCENE_PIXEL } from "./pixels.js";

export const SIGN_LIFT_PX = 4;

export interface Point {
  left: number;
  top: number;
}

export interface DepotPlacement {
  sign: Point;
  weld: Point;
  trainTop: number;
}

/**
 * Converts the depot layout, in scene pixels, to the CSS positions of the sign, the spark and the train.
 */
export function depotPlacement(layout: DepotLayout): DepotPlacement {
  return {
    sign: { left: layout.signX * SCENE_PIXEL, top: layout.signY * SCENE_PIXEL - SIGN_LIFT_PX },
    weld: { left: layout.weld.x * SCENE_PIXEL, top: layout.weld.y * SCENE_PIXEL },
    trainTop: layout.trainTop * SCENE_PIXEL,
  };
}

/**
 * CSS top of the train riding the VAL viaduct of the Lille scene.
 */
export function cityTrainTop(scene: CityScene): number {
  return (scene.deck - TRAIN_HEIGHT) * SCENE_PIXEL;
}
