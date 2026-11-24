import type { LinkPreview } from "./types.js";

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Decodes the HTML entities commonly found in meta tags.
 */
export function decodeEntities(value: string): string {
  return value
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&[a-z]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity);
}

/**
 * Collects meta tags (by property or name) and the document title from an HTML page.
 */
export function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};

  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i.exec(tag);
    const value = content?.[1] ?? content?.[2];

    if (key && value && !meta[key]) {
      meta[key] = decodeEntities(value.trim());
    }
  }

  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];

  if (title) {
    meta.title = decodeEntities(title.replace(/\s+/g, " ").trim());
  }

  return meta;
}

/**
 * Hostname without the leading "www.", or an empty string for an invalid URL.
 */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Builds a link preview from a fetched page, or null when the page has neither title nor description.
 */
export function previewFromHtml(html: string, url: string): LinkPreview | null {
  const meta = extractMeta(html);

  const title = meta["og:title"] || meta["twitter:title"] || meta.title;
  const description = meta["og:description"] || meta["twitter:description"] || meta.description;
  const image = meta["og:image"] || meta["twitter:image"];

  if (!title && !description) {
    return null;
  }

  return {
    url,
    host: displayHost(url),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image: new URL(image, url).href } : {}),
  };
}

/**
 * Favicon service used by the Nuxt blog for reference cards and previews.
 */
export function faviconUrl(host: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}
