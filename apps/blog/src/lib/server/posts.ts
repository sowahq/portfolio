import { parsePostSource } from "#lib/content/frontmatter.js";
import type { FicheSource } from "#lib/content/llms.js";
import type { Post, PostSummary } from "#lib/content/types.js";
import { buildPosts, toSummary, type PostFile } from "./collection.js";
import { highlightCode } from "./highlighter.js";
import { readImageDimensions } from "./images.js";
import { loadLinkPreview } from "./link-previews.js";

const sources = import.meta.glob<string>("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const files: PostFile[] = Object.entries(sources).map(([file, source]) => ({ file, source }));

let posts: Promise<Post[]> | undefined;

/**
 * Every published post, parsed once per build.
 */
export function loadPosts(): Promise<Post[]> {
  posts ??= buildPosts(files, {
    highlight: highlightCode,
    linkPreview: loadLinkPreview,
    imageDimensions: readImageDimensions,
  });

  return posts;
}

/**
 * Listing data for every published post, newest first.
 */
export async function loadPostSummaries(): Promise<PostSummary[]> {
  return (await loadPosts()).map(toSummary);
}

/**
 * A published post by its slug.
 */
export async function loadPost(slug: string): Promise<Post | undefined> {
  return (await loadPosts()).find((post) => post.slug === slug);
}

function markdownBySlug(): Map<string, string> {
  const bodies = files.map(({ file, source }): [string, string] => {
    const { frontmatter, content } = parsePostSource(source, file);

    return [frontmatter.slug, content];
  });

  return new Map(bodies);
}

/**
 * Every published post with its markdown body, frontmatter removed, newest first.
 */
export async function loadFicheSources(): Promise<FicheSource[]> {
  const bodies = markdownBySlug();

  return (await loadPostSummaries()).map((post) => ({ post, markdown: bodies.get(post.slug) ?? "" }));
}
