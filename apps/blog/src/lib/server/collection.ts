import { numberFiches } from "#lib/content/fiche.js";
import { parsePostSource } from "#lib/content/frontmatter.js";
import { readingMinutes } from "#lib/content/reading-time.js";
import { buildToc } from "#lib/content/toc.js";
import type { Post, PostSummary } from "#lib/content/types.js";
import { renderMarkdown, type MarkdownServices } from "./markdown.js";

export interface PostFile {
  file: string;
  source: string;
}

type UnnumberedPost = Omit<Post, "ficheNumber">;

async function buildPost({ file, source }: PostFile, services: MarkdownServices): Promise<UnnumberedPost | null> {
  const { frontmatter, content } = parsePostSource(source, file);

  if (!frontmatter.published) {
    return null;
  }

  const rendered = await renderMarkdown(content, services);
  const coverSize = await services.imageDimensions(frontmatter.image);

  return {
    slug: frontmatter.slug,
    title: frontmatter.title,
    ...(frontmatter.seoTitle ? { seoTitle: frontmatter.seoTitle } : {}),
    description: frontmatter.description,
    publishedAt: frontmatter.pubDate,
    image: frontmatter.image,
    tags: frontmatter.tags,
    target: frontmatter.cible,
    ...(frontmatter.protocole ? { protocol: frontmatter.protocole } : {}),
    tools: frontmatter.outils,
    workshops: frontmatter.ateliers,
    shortLabel: frontmatter.court,
    wordCount: rendered.wordCount,
    readingMinutes: readingMinutes(rendered.wordCount),
    cover: { kind: "image", src: frontmatter.image, alt: frontmatter.title, ...coverSize },
    body: rendered.nodes,
    toc: buildToc(rendered.headings),
  };
}

function assertUniqueSlugs(posts: UnnumberedPost[]): void {
  const seen = new Set<string>();

  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`Slug en double : ${post.slug}`);
    }

    seen.add(post.slug);
  }
}

/**
 * Builds every published post from its markdown file, numbered by date and returned newest first.
 */
export async function buildPosts(files: PostFile[], services: MarkdownServices): Promise<Post[]> {
  const built = await Promise.all(files.map((file) => buildPost(file, services)));
  const posts = built.filter((post): post is UnnumberedPost => post !== null);

  assertUniqueSlugs(posts);

  return numberFiches(posts);
}

/**
 * Keeps only the fields needed by listings, feeds and structured data.
 */
export function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    ...(post.seoTitle ? { seoTitle: post.seoTitle } : {}),
    description: post.description,
    publishedAt: post.publishedAt,
    image: post.image,
    tags: post.tags,
    target: post.target,
    ...(post.protocol ? { protocol: post.protocol } : {}),
    tools: post.tools,
    workshops: post.workshops,
    shortLabel: post.shortLabel,
    wordCount: post.wordCount,
    readingMinutes: post.readingMinutes,
    ficheNumber: post.ficheNumber,
  };
}
