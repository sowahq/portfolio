import { loadPosts, loadPostSummaries } from "#lib/server/posts.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [latest] = await loadPosts();

  return {
    posts: await loadPostSummaries(),
    latestCover: latest ? { width: latest.cover.width, height: latest.cover.height } : null,
  };
};
