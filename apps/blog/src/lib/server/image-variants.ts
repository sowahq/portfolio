import { readFile } from "node:fs/promises";
import { contentImages } from "#lib/content/figures.js";
import { imageVariants, type ImageVariant } from "#lib/content/responsive-image.js";
import { staticFile } from "./images.js";
import { loadPosts } from "./posts.js";

const QUALITY = { avif: 55, webp: 80 } as const;

let variants: Promise<Map<string, ImageVariant>> | undefined;

async function collectVariants(): Promise<Map<string, ImageVariant>> {
  const images = (await loadPosts()).flatMap((post) => [post.cover, ...contentImages(post.body)]);
  const all = images.flatMap((image) => imageVariants(image.src, image.width));

  return new Map(all.map((variant) => [variant.path, variant]));
}

/**
 * Every resized variant of the covers and body images of the published posts, by path, collected once per build.
 */
export function loadImageVariants(): Promise<Map<string, ImageVariant>> {
  variants ??= collectVariants();

  return variants;
}

/**
 * Encodes a variant from its original image. Runs at prerender time only.
 */
export async function encodeVariant({ source, width, format }: ImageVariant): Promise<Uint8Array<ArrayBuffer>> {
  const { default: sharp } = await import("sharp");
  const pipeline = sharp(await readFile(staticFile(source))).resize({ width, withoutEnlargement: true });
  const encoded =
    format === "avif" ? pipeline.avif({ quality: QUALITY.avif }) : pipeline.webp({ quality: QUALITY.webp });

  return new Uint8Array(await encoded.toBuffer());
}
