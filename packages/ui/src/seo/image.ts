/**
 * Size and format of every Open Graph image the sites generate.
 */
export const OG_IMAGE = { width: 1200, height: 630, type: "image/png" } as const;

export interface SeoImage {
  /** Absolute URL on the production domain. */
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
}

/**
 * Describes a generated Open Graph image from its absolute URL.
 */
export function ogImage(url: string, alt: string): SeoImage {
  return { url, alt, width: OG_IMAGE.width, height: OG_IMAGE.height, type: OG_IMAGE.type };
}
