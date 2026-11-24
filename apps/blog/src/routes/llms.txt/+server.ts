import { textResponse } from "@mth/ui/seo";
import { blogLlmsTxt } from "#lib/content/llms.js";
import { loadPostSummaries } from "#lib/server/posts.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  return textResponse(blogLlmsTxt(await loadPostSummaries()));
};
