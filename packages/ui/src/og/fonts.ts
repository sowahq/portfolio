import type { Font } from "satori";
import departureMono from "../fonts/og/departure-mono.otf?inline";
import monocraftSemibold from "../fonts/og/monocraft-600.ttf?inline";
import monocraftBold from "../fonts/og/monocraft-700.ttf?inline";
import onestSemibold from "../fonts/og/onest-600.ttf?inline";

export const OG_FONT = {
  pixel: "Monocraft",
  led: "Departure Mono",
  sans: "Onest",
} as const;

/**
 * Width of one Monocraft character, in em. The font is monospaced, so a line can be measured by counting characters.
 */
export const MONOCRAFT_ADVANCE = 2 / 3;

/**
 * Width of one Departure Mono character, in em.
 */
export const DEPARTURE_MONO_ADVANCE = 7 / 11;

function bytes(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
}

let fonts: Font[] | undefined;

/**
 * The site fonts in the formats satori reads (TTF and OTF, not WOFF2), bundled with the build.
 */
export function ogFonts(): Font[] {
  fonts ??= [
    { name: OG_FONT.pixel, data: bytes(monocraftSemibold), weight: 600, style: "normal" },
    { name: OG_FONT.pixel, data: bytes(monocraftBold), weight: 700, style: "normal" },
    { name: OG_FONT.led, data: bytes(departureMono), weight: 400, style: "normal" },
    { name: OG_FONT.sans, data: bytes(onestSemibold), weight: 600, style: "normal" },
  ];

  return fonts;
}
