import { depotSignLabel } from "@mth/ui";
import { depotHomeCard, imageResponse, renderOgPng } from "@mth/ui/og";
import { loadPostSummaries } from "#lib/server/posts.js";
import { SITE } from "#lib/site.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = await loadPostSummaries();

  const card = depotHomeCard({
    sticker: SITE.sticker,
    title: SITE.title,
    lead: SITE.ogLead,
    host: SITE.host,
    sign: depotSignLabel(posts.length),
  });

  return imageResponse(await renderOgPng(card), "image/png");
};
