import { webManifestResponse } from "@mth/ui/og";
import { SITE } from "#lib/site.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return webManifestResponse({
    name: SITE.siteName,
    shortName: SITE.title,
    description: SITE.description,
    lang: SITE.language,
  });
};
