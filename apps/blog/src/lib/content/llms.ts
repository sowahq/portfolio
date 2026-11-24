import { productionSites } from "@mth/ui";
import { AUTHOR_NAME, buildLlmsTxt, type LlmsLink } from "@mth/ui/seo";
import { SITE, absoluteUrl, postPath } from "#lib/site.js";
import type { PostSummary } from "./types.js";

export const LLMS_FULL_PATH = "/llms-full.txt";

function ficheTitle(post: PostSummary): string {
  return `Fiche n° ${post.ficheNumber} : ${post.title}`;
}

function ficheLink(post: PostSummary): LlmsLink {
  return {
    title: ficheTitle(post),
    url: absoluteUrl(postPath(post.slug)),
    description: post.description,
  };
}

/**
 * The llms.txt of the blog: what it is, then one line per published fiche, newest first.
 */
export function blogLlmsTxt(posts: PostSummary[]): string {
  return buildLlmsTxt({
    title: SITE.siteName,
    summary: SITE.description,
    details: [
      `Blog de reverse engineering en français tenu par ${AUTHOR_NAME}, développeur freelance à Lille.`,
      "Chaque article est une fiche d'intervention numérotée : la cible, le protocole, les outils, la démarche et les impasses.",
    ],
    sections: [
      { title: "Fiches", links: posts.map(ficheLink) },
      {
        title: "Optional",
        links: [
          { title: "Texte intégral des fiches", url: absoluteUrl(LLMS_FULL_PATH) },
          { title: "Flux RSS", url: absoluteUrl("/rss.xml") },
          {
            title: `Portfolio de ${AUTHOR_NAME}`,
            url: `${productionSites.portfolio}/`,
            description: "Ses missions de développement web et mobile.",
          },
        ],
      },
    ],
  });
}

export interface FicheSource {
  post: PostSummary;
  markdown: string;
}

function ficheFullText({ post, markdown }: FicheSource): string {
  return [
    `# ${ficheTitle(post)}`,
    `URL : ${absoluteUrl(postPath(post.slug))}`,
    `Date : ${post.publishedAt}`,
    markdown.trim(),
  ].join("\n\n");
}

/**
 * The llms-full.txt of the blog: every published fiche, newest first, with its full markdown source.
 */
export function blogLlmsFullTxt(fiches: FicheSource[]): string {
  const header = [`# ${SITE.siteName}`, `> ${SITE.description}`].join("\n\n");

  return `${[header, ...fiches.map(ficheFullText)].join("\n\n---\n\n")}\n`;
}
