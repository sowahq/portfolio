import { describe, expect, it } from "vitest";
import { buildToc, flattenToc } from "./toc.js";
import type { HeadingEntry, TocEntry } from "./types.js";

const heading = (id: string, depth: number): HeadingEntry => ({ id, text: id.toUpperCase(), depth });

const entry = (id: string, depth: number, children: TocEntry[] = []): TocEntry => ({
  ...heading(id, depth),
  children,
});

describe("buildToc", () => {
  const cases: { name: string; headings: HeadingEntry[]; expected: TocEntry[] }[] = [
    { name: "empty", headings: [], expected: [] },
    {
      name: "siblings",
      headings: [heading("a", 1), heading("b", 1)],
      expected: [entry("a", 1), entry("b", 1)],
    },
    {
      name: "nesting and climbing back",
      headings: [heading("a", 1), heading("a1", 2), heading("a1x", 3), heading("a2", 2), heading("b", 1)],
      expected: [entry("a", 1, [entry("a1", 2, [entry("a1x", 3)]), entry("a2", 2)]), entry("b", 1)],
    },
    {
      name: "levels deeper than 3 are dropped",
      headings: [heading("a", 1), heading("deep", 4)],
      expected: [entry("a", 1)],
    },
    {
      name: "a document starting at h2",
      headings: [heading("a", 2), heading("b", 1)],
      expected: [entry("a", 2), entry("b", 1)],
    },
  ];

  for (const { name, headings, expected } of cases) {
    it(name, () => {
      expect(buildToc(headings)).toEqual(expected);
    });
  }
});

describe("flattenToc", () => {
  it("returns entries in document order", () => {
    const toc = buildToc([heading("a", 1), heading("a1", 2), heading("b", 1)]);

    expect(flattenToc(toc).map(({ id }) => id)).toEqual(["a", "a1", "b"]);
  });
});
