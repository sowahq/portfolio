import { xmlResponse } from "@mth/ui/seo";
import { buildRssFeed } from "#lib/content/feeds.js";
import { loadPostSummaries } from "#lib/server/posts.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  return xmlResponse(buildRssFeed(await loadPostSummaries()), "application/rss+xml");
};
