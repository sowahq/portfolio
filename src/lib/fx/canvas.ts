export interface FittedCanvas {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

/**
 * Sizes a canvas backing store to its CSS box and device pixel ratio, so drawing happens in CSS pixels.
 */
export function fitCanvas(canvas: HTMLCanvasElement): FittedCanvas {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("fitCanvas: 2D canvas context is unavailable");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.imageSmoothingEnabled = false;
  return { context, width, height };
}
