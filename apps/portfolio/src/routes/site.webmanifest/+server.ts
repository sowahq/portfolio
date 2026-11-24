import { webManifestResponse } from "@mth/ui/og";
import { LANGUAGE } from "@mth/ui/seo";
import { PAGE } from "#lib/seo.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return webManifestResponse({
    name: PAGE.title,
    shortName: PAGE.siteName,
    description: PAGE.description,
    lang: LANGUAGE,
  });
};
