import { error } from "@sveltejs/kit";
import { ficheCard, imageResponse, renderOgPng } from "@mth/ui/og";
import { ficheCardData } from "#lib/content/og-card.js";
import { loadPostSummaries } from "#lib/server/posts.js";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = async () => {
  const posts = await loadPostSummaries();

  return posts.map(({ slug }) => ({ slug }));
};

export const GET: RequestHandler = async ({ params }) => {
  const posts = await loadPostSummaries();
  const post = posts.find(({ slug }) => slug === params.slug);

  if (!post) {
    error(404, "Fiche introuvable");
  }

  return imageResponse(await renderOgPng(ficheCard(ficheCardData(post, posts.length))), "image/png");
};
