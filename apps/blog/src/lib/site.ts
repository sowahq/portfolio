import { AUTHOR_NAME, LANGUAGE, ogImage, type SeoImage } from "@mth/ui/seo";
import { productionSites } from "@mth/ui";

const NAME = "le dépôt";

export const SITE = {
  url: productionSites.blog,
  host: new URL(productionSites.blog).host,
  title: NAME,
  siteName: `${NAME} · ${AUTHOR_NAME}`,
  homeTitle: `${NAME} · reverse engineering et démontages de ${AUTHOR_NAME}`,
  description:
    "Je démonte ce qui me tombe sous la main : objets connectés, applis mobiles, protections logicielles. Chaque fiche raconte l'intervention, impasses comprises.",
  sticker: "le blog de mathis",
  ogLead: "Reverse engineering et démontages : objets connectés, applis mobiles, protections logicielles.",
  language: LANGUAGE,
} as const;

/**
 * Turns a site-relative path into an absolute URL on the blog domain.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

/**
 * Canonical path of an article. It must never change: these URLs are indexed.
 */
export function postPath(slug: string): string {
  return `/posts/${slug}`;
}

/**
 * The headline of a fiche for search results and shares: its SEO title when it has one.
 */
export function postHeadline(post: { title: string; seoTitle?: string }): string {
  return post.seoTitle ?? post.title;
}

/**
 * Title of a fiche page, followed by the blog name.
 */
export function postTitle(title: string): string {
  return `${title} · ${SITE.title}`;
}

export const HOME_OG_PATH = "/og/home.png";

/**
 * Path of the Open Graph image generated for a fiche.
 */
export function postOgPath(slug: string): string {
  return `/og/${slug}.png`;
}

/**
 * The generated Open Graph image of the home page.
 */
export function homeOgImage(): SeoImage {
  return ogImage(
    absoluteUrl(HOME_OG_PATH),
    `${SITE.title}, le blog de ${AUTHOR_NAME}, devant le dépôt du VAL en pixel art`,
  );
}

/**
 * The generated Open Graph image of a fiche.
 */
export function postOgImage(post: { slug: string; title: string; ficheNumber: string }): SeoImage {
  return ogImage(absoluteUrl(postOgPath(post.slug)), `Fiche d'intervention n° ${post.ficheNumber} : ${post.title}`);
}
