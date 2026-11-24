import type { HeadingEntry, TocEntry } from "./types.js";

/**
 * Nests a flat list of headings into a table of contents, keeping levels up to maxDepth.
 */
export function buildToc(headings: HeadingEntry[], maxDepth = 3): TocEntry[] {
  const roots: TocEntry[] = [];
  const stack: TocEntry[] = [];

  const kept = headings.filter((heading) => heading.depth <= maxDepth && heading.id && heading.text);

  for (const heading of kept) {
    const entry: TocEntry = { ...heading, children: [] };

    while ((stack.at(-1)?.depth ?? 0) >= entry.depth) {
      stack.pop();
    }

    const parent = stack.at(-1);

    if (parent) {
      parent.children.push(entry);
    } else {
      roots.push(entry);
    }

    stack.push(entry);
  }

  return roots;
}

/**
 * Flattens a table of contents back into document order.
 */
export function flattenToc(entries: TocEntry[]): TocEntry[] {
  return entries.flatMap((entry) => [entry, ...flattenToc(entry.children)]);
}
