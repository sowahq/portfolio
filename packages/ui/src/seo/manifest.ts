export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export const SITE_ICONS = {
  svg: { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
  appleTouch: { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
} as const satisfies Record<string, ManifestIcon>;

export interface WebManifest {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  lang: string;
}

/**
 * Renders a minimal site.webmanifest.
 */
export function buildWebManifest({
  name,
  shortName,
  description,
  themeColor,
  backgroundColor,
  lang,
}: WebManifest): string {
  const manifest = {
    name,
    short_name: shortName,
    description,
    lang,
    start_url: "/",
    display: "browser",
    theme_color: themeColor,
    background_color: backgroundColor,
    icons: Object.values(SITE_ICONS),
  };

  return `${JSON.stringify(manifest, null, 2)}\n`;
}
