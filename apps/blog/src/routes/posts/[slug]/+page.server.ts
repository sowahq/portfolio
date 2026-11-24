import { error } from "@sveltejs/kit";
import { ficheNeighbor } from "#lib/content/fiche.js";
import { loadPost, loadPostSummaries } from "#lib/server/posts.js";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = async () => {
  const posts = await loadPostSummaries();

  return posts.map(({ slug }) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const post = await loadPost(params.slug);

  if (!post) {
    error(404, "Article introuvable");
  }

  return {
    post,
    neighbor: ficheNeighbor(await loadPostSummaries(), post.slug),
  };
};
