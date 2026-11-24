/**
 * Breaks text into lines of at most `columns` characters, at spaces when it can, for a monospaced font.
 */
export function wrapMonospace(text: string, columns: number): string[] {
  const words = text
    .trim()
    .split(/[ \t\n]+/)
    .filter((word) => word.length > 0);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (candidate.length <= columns) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
    }

    let rest = word;

    while (rest.length > columns) {
      lines.push(rest.slice(0, columns));
      rest = rest.slice(columns);
    }

    line = rest;
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

export interface TitleBox {
  /** Width available for a line, in pixels. */
  width: number;
  /** Height available for every line together, in pixels. */
  height: number;
  /** Width of one character, in em, letter spacing included. */
  advance: number;
  lineHeight: number;
  /** Font sizes to try, largest first. */
  sizes: readonly number[];
}

export interface FittedTitle {
  size: number;
  lines: string[];
}

/**
 * The largest font size from the list at which a monospaced title fits the box, with its lines.
 * Falls back to the smallest size when none fits.
 */
export function fitTitle(text: string, box: TitleBox): FittedTitle {
  const fitted = box.sizes.map((size) => ({
    size,
    lines: wrapMonospace(text, Math.max(1, Math.floor(box.width / (size * box.advance)))),
  }));

  const fitting = fitted.find(({ size, lines }) => lines.length * size * box.lineHeight <= box.height);

  return fitting ?? fitted.at(-1) ?? { size: 0, lines: [] };
}
