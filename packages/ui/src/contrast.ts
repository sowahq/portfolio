type Rgb = [number, number, number];

function parseHex(color: string): Rgb {
  const value = Number.parseInt(color.replace("#", "").slice(0, 6), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`;
}

function channel(value: number): number {
  const scaled = value / 255;

  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG contrast ratio between two hex colors.
 */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(parseHex(foreground));
  const b = luminance(parseHex(background));

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const STEPS = 20;

/**
 * Returns the color itself when it reaches the ratio on the background, otherwise the closest tint
 * toward white (on a dark background) or black (on a light one) that does.
 */
export function ensureContrast(color: string, background: string, ratio = 4.5): string {
  if (contrastRatio(color, background) >= ratio) {
    return color;
  }

  const base = parseHex(color);
  const target: Rgb = luminance(parseHex(background)) < 0.5 ? [255, 255, 255] : [0, 0, 0];

  for (let step = 1; step <= STEPS; step++) {
    const amount = step / STEPS;
    const mixed = base.map((part, index) => part + ((target[index] ?? part) - part) * amount) as Rgb;
    const candidate = toHex(mixed);

    if (contrastRatio(candidate, background) >= ratio) {
      return candidate;
    }
  }

  return toHex(target);
}
