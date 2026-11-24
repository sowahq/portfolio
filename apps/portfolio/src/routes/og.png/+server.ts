import { imageResponse, profileCard, renderOgPng } from "@mth/ui/og";
import { AUTHOR_NAME } from "@mth/ui/seo";
import { PAGE } from "#lib/seo.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const card = profileCard({ sticker: PAGE.sticker, name: AUTHOR_NAME, role: PAGE.role, host: PAGE.host });

  return imageResponse(await renderOgPng(card), "image/png");
};
