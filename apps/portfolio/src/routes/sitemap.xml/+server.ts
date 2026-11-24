import { buildSitemap, xmlResponse } from "@mth/ui/seo";
import { portfolioSitemap } from "#lib/seo.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => xmlResponse(buildSitemap(portfolioSitemap()));
