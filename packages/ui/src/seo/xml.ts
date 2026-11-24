const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/**
 * Escapes text for XML element content and attribute values.
 */
export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ENTITIES[character] ?? character);
}

export interface SitemapEntry {
  /** Absolute URL on the production domain. */
  url: string;
  /** ISO date of the last change. */
  lastModified?: string;
}

/**
 * Renders a sitemap.xml document.
 */
export function buildSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map(({ url, lastModified }) => {
    const lastmod = lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : "";

    return `  <url><loc>${escapeXml(url)}</loc>${lastmod}</url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/**
 * Response headers of a prerendered XML document.
 */
export function xmlResponse(body: string, type = "application/xml"): Response {
  return new Response(body, { headers: { "content-type": `${type}; charset=utf-8` } });
}
