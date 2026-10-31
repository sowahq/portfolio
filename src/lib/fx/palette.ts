export type PaletteToken =
  | "accent"
  | "accent-soft"
  | "highlight"
  | "highlight-strong"
  | "paper"
  | "ink";

/**
 * Reads a design token exposed as a `--fx-*` CSS variable in app.css.
 */
export function token(name: PaletteToken, element: Element = document.documentElement): string {
  return getComputedStyle(element).getPropertyValue(`--fx-${name}`).trim();
}

export function tokens(names: readonly PaletteToken[], element?: Element): string[] {
  return names.map((name) => token(name, element));
}
