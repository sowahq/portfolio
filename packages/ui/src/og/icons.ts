import { buildWebManifest, type WebManifest } from "../seo/manifest.js";
import { markRaster, markSvg } from "./icon.js";
import { encodeIco, encodePng } from "./png.js";
import { imageResponse } from "./render.js";
import { ogColors } from "./tokens.js";

const APPLE_TOUCH = { size: 180, scale: 10 } as const;

const FAVICON_SIZES = [16, 32, 48] as const;

/**
 * The SVG favicon.
 */
export function faviconSvgResponse(): Response {
  return imageResponse(markSvg(), "image/svg+xml");
}

/**
 * The 180x180 apple-touch-icon, on the paper color since iOS fills transparency with black.
 */
export function appleTouchIconResponse(): Response {
  const icon = markRaster({ ...APPLE_TOUCH, background: ogColors.paper });

  return imageResponse(encodePng(icon), "image/png");
}

/**
 * The favicon.ico browsers request on their own, with the mark at 16, 32 and 48 pixels.
 */
export function faviconIcoResponse(): Response {
  const images = FAVICON_SIZES.map((size) => ({
    size,
    png: encodePng(markRaster({ size, scale: size / 16 })),
  }));

  return imageResponse(encodeIco(images), "image/x-icon");
}

/**
 * The site.webmanifest, colored with the paper token like the theme-color meta.
 */
export function webManifestResponse(details: Omit<WebManifest, "themeColor" | "backgroundColor">): Response {
  const body = buildWebManifest({ ...details, themeColor: ogColors.paper, backgroundColor: ogColors.paper });

  return new Response(body, { headers: { "content-type": "application/manifest+json; charset=utf-8" } });
}
