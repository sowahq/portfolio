import { describe, expect, it } from "vitest";
import { buildSitemap, escapeXml, type SitemapEntry } from "./xml.js";

describe("escapeXml", () => {
  const cases: { input: string; expected: string }[] = [
    { input: "a & b", expected: "a &amp; b" },
    { input: "<tag>", expected: "&lt;tag&gt;" },
    { input: `"l'app"`, expected: "&quot;l&apos;app&quot;" },
    { input: "rien", expected: "rien" },
  ];

  for (const { input, expected } of cases) {
    it(input, () => {
      expect(escapeXml(input)).toBe(expected);
    });
  }
});

describe("buildSitemap", () => {
  const cases: { name: string; entries: SitemapEntry[]; contains: string[] }[] = [
    {
      name: "no entries",
      entries: [],
      contains: ['<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', "</urlset>"],
    },
    {
      name: "a page without date",
      entries: [{ url: "https://mth.lc/" }],
      contains: ["  <url><loc>https://mth.lc/</loc></url>"],
    },
    {
      name: "a page with its last change",
      entries: [{ url: "https://blog.mth.lc/posts/a?b=1&c=2", lastModified: "2026-08-20" }],
      contains: ["<loc>https://blog.mth.lc/posts/a?b=1&amp;c=2</loc><lastmod>2026-08-20</lastmod>"],
    },
  ];

  for (const { name, entries, contains } of cases) {
    it(name, () => {
      const xml = buildSitemap(entries);

      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);

      for (const fragment of contains) {
        expect(xml).toContain(fragment);
      }
    });
  }
});
