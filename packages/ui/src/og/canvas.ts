import type { SceneCanvas, SceneContext, SceneImage } from "../scene/pixels.js";
import { copyPixels, createRaster, fillRect, parseHexColor, type Raster } from "./raster.js";

class SoftwareContext implements SceneContext {
  fillStyle: string | CanvasGradient | CanvasPattern = "#000000";

  readonly #canvas: SoftwareCanvas;

  constructor(canvas: SoftwareCanvas) {
    this.#canvas = canvas;
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    if (typeof this.fillStyle !== "string") {
      throw new Error("Le canvas logiciel ne dessine que des couleurs unies.");
    }

    fillRect(this.#canvas.raster, x, y, w, h, parseHexColor(this.fillStyle));
  }

  createImageData(width: number, height: number): SceneImage {
    return createRaster(width, height);
  }

  putImageData(image: SceneImage, dx: number, dy: number): void {
    copyPixels(this.#canvas.raster, image, dx, dy);
  }
}

/**
 * A canvas drawn in memory, implementing only what the scene painters use, so the pixel-art scenes
 * can be rendered at build time without a browser. Resizing it clears it, like a canvas element.
 */
export class SoftwareCanvas implements SceneCanvas {
  readonly clientWidth: number;
  readonly clientHeight: number;

  #raster: Raster = createRaster(0, 0);
  #context: SoftwareContext | undefined;

  constructor(clientWidth: number, clientHeight: number) {
    this.clientWidth = clientWidth;
    this.clientHeight = clientHeight;
  }

  get width(): number {
    return this.#raster.width;
  }

  set width(value: number) {
    this.#raster = createRaster(value, this.#raster.height);
  }

  get height(): number {
    return this.#raster.height;
  }

  set height(value: number) {
    this.#raster = createRaster(this.#raster.width, value);
  }

  /** What has been painted so far. */
  get raster(): Raster {
    return this.#raster;
  }

  getContext(): SceneContext {
    this.#context ??= new SoftwareContext(this);

    return this.#context;
  }
}
