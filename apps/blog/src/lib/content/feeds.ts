import { AUTHOR_NAME, escapeXml, type SitemapEntry } from "@mth/ui/seo";
import { SITE, absoluteUrl, postPath } from "#lib/site.js";
import { toRfc822 } from "./dates.js";
import type { PostSummary } from "./types.js";

function newestFirst(posts: PostSummary[]): PostSummary[] {
  return [...posts].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

/**
 * Sitemap entries: the home page, then every published post.
 */
export function sitemapEntries(posts: PostSummary[]): SitemapEntry[] {
  const latest = newestFirst(posts)[0]?.publishedAt;

  return [
    { url: absoluteUrl("/"), ...(latest ? { lastModified: latest } : {}) },
    ...posts.map((post) => ({ url: absoluteUrl(postPath(post.slug)), lastModified: post.publishedAt })),
  ];
}

function rssItem(post: PostSummary): string {
  const url = escapeXml(absoluteUrl(postPath(post.slug)));
  const categories = post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`);

  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    `      <pubDate>${toRfc822(post.publishedAt)}</pubDate>`,
    `      <dc:creator>${escapeXml(AUTHOR_NAME)}</dc:creator>`,
    `      <description>${escapeXml(post.description)}</description>`,
    ...categories,
    "    </item>",
  ].join("\n");
}

/**
 * Renders an RSS 2.0 feed of the given posts, newest first.
 */
export function buildRssFeed(posts: PostSummary[]): string {
  const sorted = newestFirst(posts);
  const newest = sorted[0];

  const channel = [
    `    <title>${escapeXml(SITE.title)}</title>`,
    `    <link>${escapeXml(absoluteUrl("/"))}</link>`,
    `    <description>${escapeXml(SITE.description)}</description>`,
    `    <language>${SITE.language}</language>`,
    `    <copyright>${escapeXml(`© ${AUTHOR_NAME}`)}</copyright>`,
    `    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />`,
    ...(newest ? [`    <lastBuildDate>${toRfc822(newest.publishedAt)}</lastBuildDate>`] : []),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    ...channel,
    ...sorted.map(rssItem),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
