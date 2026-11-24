import { buildSitemap, xmlResponse } from "@mth/ui/seo";
import { sitemapEntries } from "#lib/content/feeds.js";
import { loadPostSummaries } from "#lib/server/posts.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  return xmlResponse(buildSitemap(sitemapEntries(await loadPostSummaries())));
};
