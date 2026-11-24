import { readFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import type { ImageDimensions } from "#lib/content/types.js";

const STATIC_DIR = path.resolve("static");

/**
 * The file behind a path served from static/. Throws when the path leaves static/.
 */
export function staticFile(src: string): string {
  const file = path.resolve(STATIC_DIR, `.${decodeURI(src)}`);

  if (!file.startsWith(STATIC_DIR + path.sep)) {
    throw new Error(`Chemin d'image hors de static/ : ${src}`);
  }

  return file;
}

/**
 * Reads the intrinsic size of an image served from static/, so the page reserves its space.
 * Returns null for remote images and throws when a local image is missing.
 */
export async function readImageDimensions(src: string): Promise<ImageDimensions | null> {
  if (!src.startsWith("/")) {
    return null;
  }

  const { width, height } = imageSize(await readFile(staticFile(src)));

  return { width, height };
}
