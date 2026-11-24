import { textResponse } from "@mth/ui/seo";
import { portfolioLlmsTxt } from "#lib/seo.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => textResponse(portfolioLlmsTxt());
