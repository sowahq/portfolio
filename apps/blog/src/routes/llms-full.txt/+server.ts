import { textResponse } from "@mth/ui/seo";
import { blogLlmsFullTxt } from "#lib/content/llms.js";
import { loadFicheSources } from "#lib/server/posts.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  return textResponse(blogLlmsFullTxt(await loadFicheSources()));
};
