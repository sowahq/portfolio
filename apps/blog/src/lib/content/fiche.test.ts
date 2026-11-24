import { describe, expect, it } from "vitest";
import { ficheNeighbor, formatFicheNumber, numberFiches } from "./fiche.js";
import type { PostSummary } from "./types.js";

const summary = (slug: string, publishedAt: string, ficheNumber = "000"): PostSummary => ({
  slug,
  title: slug,
  description: "",
  publishedAt,
  image: "/header.png",
  tags: [],
  target: "",
  tools: [],
  workshops: ["mobile"],
  shortLabel: slug,
  wordCount: 0,
  readingMinutes: 1,
  ficheNumber,
});

describe("formatFicheNumber", () => {
  const cases: { rank: number; expected: string }[] = [
    { rank: 1, expected: "001" },
    { rank: 5, expected: "005" },
    { rank: 42, expected: "042" },
    { rank: 1234, expected: "1234" },
  ];

  for (const { rank, expected } of cases) {
    it(`formats ${rank}`, () => {
      expect(formatFicheNumber(rank)).toBe(expected);
    });
  }
});

describe("numberFiches", () => {
  const cases: { name: string; posts: { slug: string; publishedAt: string }[]; expected: [string, string][] }[] = [
    { name: "no posts", posts: [], expected: [] },
    {
      name: "oldest is 001, returned newest first",
      posts: [
        { slug: "milieu", publishedAt: "2026-03-23" },
        { slug: "ancien", publishedAt: "2025-01-10" },
        { slug: "recent", publishedAt: "2026-08-20" },
      ],
      expected: [
        ["recent", "003"],
        ["milieu", "002"],
        ["ancien", "001"],
      ],
    },
    {
      name: "same day ordered by slug",
      posts: [
        { slug: "b", publishedAt: "2026-04-04" },
        { slug: "a", publishedAt: "2026-04-04" },
      ],
      expected: [
        ["b", "002"],
        ["a", "001"],
      ],
    },
  ];

  for (const { name, posts, expected } of cases) {
    it(name, () => {
      expect(numberFiches(posts).map(({ slug, ficheNumber }) => [slug, ficheNumber])).toEqual(expected);
    });
  }
});

describe("ficheNeighbor", () => {
  const posts = [
    summary("c", "2026-08-20", "003"),
    summary("b", "2026-08-05", "002"),
    summary("a", "2026-04-04", "001"),
  ];

  const cases: { name: string; posts: PostSummary[]; slug: string; expected: [string, string] | null }[] = [
    { name: "newest points to the previous one", posts, slug: "c", expected: ["précédente", "b"] },
    { name: "middle points to the previous one", posts, slug: "b", expected: ["précédente", "a"] },
    { name: "oldest points to the next one", posts, slug: "a", expected: ["suivante", "b"] },
    { name: "a single post has no neighbor", posts: [summary("a", "2026-04-04")], slug: "a", expected: null },
    { name: "unknown slug", posts, slug: "z", expected: null },
  ];

  for (const { name, posts: list, slug, expected } of cases) {
    it(name, () => {
      const neighbor = ficheNeighbor(list, slug);

      expect(neighbor ? [neighbor.direction, neighbor.post.slug] : null).toEqual(expected);
    });
  }
});
