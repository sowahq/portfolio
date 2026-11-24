import { describe, expect, it } from "vitest";
import { buildSitemap } from "@mth/ui/seo";
import { buildRssFeed, sitemapEntries } from "./feeds.js";
import type { PostSummary } from "./types.js";

const summary = (slug: string, publishedAt: string, title = slug): PostSummary => ({
  slug,
  title,
  description: `Description de ${slug}`,
  publishedAt,
  image: `/blog-img/${slug}/header.png`,
  tags: ["reverse engineering"],
  target: "un objet",
  tools: [],
  workshops: ["mobile"],
  shortLabel: slug,
  wordCount: 400,
  readingMinutes: 2,
  ficheNumber: "001",
});

const older = summary("les-qr-codes-de-basic-fit-comment-ca-fonctionne", "2025-01-10");
const newer = summary("reverse-frigo-de-voiture-tuya-ble", "2026-08-20", "J'ai reverse un frigo <oui> & co");

describe("sitemapEntries", () => {
  const cases: { name: string; posts: PostSummary[]; expected: ReturnType<typeof sitemapEntries> }[] = [
    { name: "no posts", posts: [], expected: [{ url: "https://blog.mth.lc/" }] },
    {
      name: "home takes the newest date",
      posts: [older, newer],
      expected: [
        { url: "https://blog.mth.lc/", lastModified: "2026-08-20" },
        {
          url: "https://blog.mth.lc/posts/les-qr-codes-de-basic-fit-comment-ca-fonctionne",
          lastModified: "2025-01-10",
        },
        { url: "https://blog.mth.lc/posts/reverse-frigo-de-voiture-tuya-ble", lastModified: "2026-08-20" },
      ],
    },
  ];

  for (const { name, posts, expected } of cases) {
    it(name, () => {
      expect(sitemapEntries(posts)).toEqual(expected);
    });
  }
});

describe("buildSitemap", () => {
  it("renders absolute canonical URLs", () => {
    const xml = buildSitemap(sitemapEntries([newer]));

    expect(xml).toContain("<loc>https://blog.mth.lc/</loc><lastmod>2026-08-20</lastmod>");
    expect(xml).toContain("<loc>https://blog.mth.lc/posts/reverse-frigo-de-voiture-tuya-ble</loc>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });
});

describe("buildRssFeed", () => {
  const cases: { name: string; posts: PostSummary[]; contains: string[]; excludes: string[] }[] = [
    {
      name: "empty feed",
      posts: [],
      contains: ["<title>le dépôt</title>", 'rel="self"', "<copyright>© Mathis Lutic</copyright>"],
      excludes: ["<item>", "<lastBuildDate>"],
    },
    {
      name: "escaped items with permalinks",
      posts: [older, newer],
      contains: [
        "<title>J&apos;ai reverse un frigo &lt;oui&gt; &amp; co</title>",
        '<guid isPermaLink="true">https://blog.mth.lc/posts/reverse-frigo-de-voiture-tuya-ble</guid>',
        "<pubDate>Thu, 20 Aug 2026 00:00:00 GMT</pubDate>",
        "<lastBuildDate>Thu, 20 Aug 2026 00:00:00 GMT</lastBuildDate>",
        "<category>reverse engineering</category>",
        "<dc:creator>Mathis Lutic</dc:creator>",
      ],
      excludes: ["<oui>"],
    },
  ];

  for (const { name, posts, contains, excludes } of cases) {
    it(name, () => {
      const xml = buildRssFeed(posts);

      for (const fragment of contains) {
        expect(xml).toContain(fragment);
      }

      for (const fragment of excludes) {
        expect(xml).not.toContain(fragment);
      }
    });
  }

  it("lists the newest post first", () => {
    const xml = buildRssFeed([older, newer]);

    expect(xml.indexOf(newer.slug)).toBeLessThan(xml.indexOf(older.slug));
  });
});
