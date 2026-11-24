import { LANGUAGE, PERSON_ID, nodeReference, personJsonLd, type JsonLd, type SeoImage } from "@mth/ui/seo";
import { SITE, absoluteUrl, homeOgImage, postHeadline, postOgImage, postPath } from "#lib/site.js";
import type { PostSummary } from "./types.js";

export const BLOG_ID = `${SITE.url}/#blog`;

export const WEBSITE_ID = `${SITE.url}/#website`;

const HOME_PAGE_ID = `${SITE.url}/#page`;

function postUrl(post: PostSummary): string {
  return absoluteUrl(postPath(post.slug));
}

function postingId(post: PostSummary): string {
  return `${postUrl(post)}#article`;
}

function imageObject(image: SeoImage): JsonLd {
  return { "@type": "ImageObject", url: image.url, width: image.width, height: image.height };
}

/**
 * The blog as a WebSite, published by the Person described on both sites.
 */
export function webSiteJsonLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.title,
    url: absoluteUrl("/"),
    inLanguage: LANGUAGE,
    publisher: nodeReference(PERSON_ID),
  };
}

/**
 * The nodes every page of the blog carries: the author and the website.
 */
export function siteJsonLd(): JsonLd[] {
  return [personJsonLd(), webSiteJsonLd()];
}

/**
 * BlogPosting structured data of a fiche, written by the Person of the graph.
 */
export function blogPostingJsonLd(post: PostSummary): JsonLd {
  const url = postUrl(post);

  return {
    "@type": "BlogPosting",
    "@id": postingId(post),
    headline: postHeadline(post),
    description: post.description,
    url,
    mainEntityOfPage: nodeReference(url),
    author: nodeReference(PERSON_ID),
    publisher: nodeReference(PERSON_ID),
    image: imageObject(postOgImage(post)),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    wordCount: post.wordCount,
    keywords: post.tags,
    articleSection: post.workshops.join(", "),
    inLanguage: LANGUAGE,
    isPartOf: nodeReference(BLOG_ID),
  };
}

/**
 * Breadcrumb of a fiche: the blog home, then the fiche.
 */
export function breadcrumbJsonLd(post: PostSummary): JsonLd {
  const url = postUrl(post);

  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE.title, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: post.title, item: url },
    ],
  };
}

/**
 * Structured data of a fiche page.
 */
export function postPageJsonLd(post: PostSummary): JsonLd[] {
  return [...siteJsonLd(), blogPostingJsonLd(post), breadcrumbJsonLd(post)];
}

function listedPostingJsonLd(post: PostSummary): JsonLd {
  return {
    "@type": "BlogPosting",
    "@id": postingId(post),
    headline: postHeadline(post),
    url: postUrl(post),
    author: nodeReference(PERSON_ID),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: imageObject(postOgImage(post)),
  };
}

/**
 * The Blog node, listing every fiche.
 */
export function blogJsonLd(posts: PostSummary[]): JsonLd {
  return {
    "@type": "Blog",
    "@id": BLOG_ID,
    name: SITE.title,
    url: absoluteUrl("/"),
    description: SITE.description,
    inLanguage: LANGUAGE,
    author: nodeReference(PERSON_ID),
    publisher: nodeReference(PERSON_ID),
    isPartOf: nodeReference(WEBSITE_ID),
    image: imageObject(homeOgImage()),
    blogPost: posts.map(listedPostingJsonLd),
  };
}

/**
 * The home page, a collection page whose main entity is the blog.
 */
export function collectionPageJsonLd(): JsonLd {
  return {
    "@type": "CollectionPage",
    "@id": HOME_PAGE_ID,
    url: absoluteUrl("/"),
    name: SITE.homeTitle,
    description: SITE.description,
    inLanguage: LANGUAGE,
    isPartOf: nodeReference(WEBSITE_ID),
    mainEntity: nodeReference(BLOG_ID),
    primaryImageOfPage: imageObject(homeOgImage()),
  };
}

/**
 * Structured data of the home page.
 */
export function homePageJsonLd(posts: PostSummary[]): JsonLd[] {
  return [...siteJsonLd(), blogJsonLd(posts), collectionPageJsonLd()];
}
