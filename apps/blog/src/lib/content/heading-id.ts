import GithubSlugger from "github-slugger";

function tidySlug(slug: string): string {
  const singleDashes = slug.replace(/-+/g, "-");
  const trimmed = singleDashes.replace(/^-|-$/g, "");

  return trimmed.replace(/^(\d)/, "_$1");
}

/**
 * Returns a per-document id generator that reproduces the heading ids of @nuxtjs/mdc,
 * so anchors already shared on the Nuxt blog keep working.
 */
export function createHeadingIds(): (text: string) => string {
  const slugger = new GithubSlugger();

  return (text) => tidySlug(slugger.slug(text));
}
