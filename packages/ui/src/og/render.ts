import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { OG_IMAGE } from "../seo/image.js";
import { ogFonts } from "./fonts.js";
import type { OgElement } from "./node.js";

/**
 * Renders an Open Graph layout to a PNG with satori, then resvg.
 */
export async function renderOgPng(
  element: OgElement,
  width: number = OG_IMAGE.width,
  height: number = OG_IMAGE.height,
): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(element, { width, height, fonts: ogFonts() });
  const png = new Resvg(svg, { fitTo: { mode: "original" } }).render().asPng();

  return new Uint8Array(png);
}

/**
 * A response for a prerendered image route.
 */
export function imageResponse(body: Uint8Array<ArrayBuffer> | string, type: string): Response {
  return new Response(body, { headers: { "content-type": type } });
}
