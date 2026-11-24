import themeCss from "../theme.css?raw";

const COLOR_TOKEN = /--color-([a-z0-9-]+):\s*(#[0-9a-f]{3,8})\s*;/gi;

/**
 * Reads the hex color tokens declared in a Tailwind `@theme` block, keyed by name without the `--color-` prefix.
 */
export function readColorTokens(css: string): Record<string, string> {
  return Object.fromEntries([...css.matchAll(COLOR_TOKEN)].map(([, name, value]) => [name, value]));
}

const themeTokens = readColorTokens(themeCss);

/**
 * The value of a color token from theme.css. Throws when the token is missing, so renaming one breaks the build.
 */
export function themeColor(name: string, tokens: Record<string, string> = themeTokens): string {
  const value = tokens[name];

  if (!value) {
    throw new Error(`Jeton de couleur introuvable dans theme.css : --color-${name}`);
  }

  return value;
}

/**
 * The theme colors the Open Graph cards, the icons and the web manifests are drawn with,
 * read from theme.css so they always match the sites.
 */
export const ogColors = {
  paper: themeColor("paper"),
  grid: themeColor("grid"),
  ink: themeColor("ink"),
  text: themeColor("text"),
  muted: themeColor("muted"),
  violet: themeColor("violet"),
  violetDeep: themeColor("violet-deep"),
  lavender: themeColor("lavender"),
  card: themeColor("card"),
  highlight: themeColor("highlight"),
  board: themeColor("board"),
  boardEdge: themeColor("board-edge"),
  boardText: themeColor("board-text"),
  skyMid: themeColor("sky-mid"),
  sceneGround: themeColor("scene-ground"),
} as const;
