import { describe, expect, it } from "vitest";
import { personJsonLd } from "@mth/ui/seo";
import {
  BLOG_ID,
  WEBSITE_ID,
  blogJsonLd,
  blogPostingJsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  homePageJsonLd,
  postPageJsonLd,
  webSiteJsonLd,
} from "./json-ld.js";
import type { PostSummary } from "./types.js";

const post: PostSummary = {
  slug: "les-nanomites-d-armadillo",
  title: "Les Nanomites d'Armadillo",
  description: "Plongée dans Armadillo.",
  publishedAt: "2026-04-04",
  image: "/blog-img/les-nanomites-d-armadillo/header.png",
  tags: ["reverse engineering", "anti-debug"],
  target: "le protecteur Armadillo",
  tools: ["x64dbg"],
  workshops: ["protections", "jeux"],
  shortLabel: "Armadillo",
  wordCount: 1500,
  readingMinutes: 8,
  ficheNumber: "003",
};

const url = "https://blog.mth.lc/posts/les-nanomites-d-armadillo";

const person = { "@id": "https://mth.lc/#person" };

const ogImage = {
  "@type": "ImageObject",
  url: "https://blog.mth.lc/og/les-nanomites-d-armadillo.png",
  width: 1200,
  height: 630,
};

describe("blogPostingJsonLd", () => {
  const posting = blogPostingJsonLd(post);

  const cases: { field: string; expected: unknown }[] = [
    { field: "@type", expected: "BlogPosting" },
    { field: "@id", expected: `${url}#article` },
    { field: "headline", expected: post.title },
    { field: "url", expected: url },
    { field: "mainEntityOfPage", expected: { "@id": url } },
    { field: "author", expected: person },
    { field: "publisher", expected: person },
    { field: "image", expected: ogImage },
    { field: "datePublished", expected: "2026-04-04" },
    { field: "dateModified", expected: "2026-04-04" },
    { field: "inLanguage", expected: "fr-FR" },
    { field: "keywords", expected: ["reverse engineering", "anti-debug"] },
    { field: "articleSection", expected: "protections, jeux" },
    { field: "isPartOf", expected: { "@id": BLOG_ID } },
  ];

  for (const { field, expected } of cases) {
    it(field, () => {
      expect(posting[field]).toEqual(expected);
    });
  }
});

describe("headlines", () => {
  const seoPost: PostSummary = { ...post, seoTitle: "Nanomites et anti-debug" };

  const cases: { name: string; headline: unknown; expected: string }[] = [
    { name: "a fiche without SEO title", headline: blogPostingJsonLd(post).headline, expected: post.title },
    {
      name: "a fiche with an SEO title",
      headline: blogPostingJsonLd(seoPost).headline,
      expected: "Nanomites et anti-debug",
    },
    {
      name: "a listed fiche with an SEO title",
      headline: (blogJsonLd([seoPost]).blogPost as { headline: string }[])[0]?.headline,
      expected: "Nanomites et anti-debug",
    },
  ];

  for (const { name, headline, expected } of cases) {
    it(name, () => {
      expect(headline).toBe(expected);
    });
  }
});

describe("breadcrumbJsonLd", () => {
  it("goes from the blog home to the fiche", () => {
    expect(breadcrumbJsonLd(post)).toEqual({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "le dépôt", item: "https://blog.mth.lc/" },
        { "@type": "ListItem", position: 2, name: post.title, item: url },
      ],
    });
  });
});

describe("page graphs", () => {
  const cases: { name: string; graph: { "@type": string | string[] }[]; types: string[] }[] = [
    {
      name: "a fiche page",
      graph: postPageJsonLd(post),
      types: ["Person", "WebSite", "BlogPosting", "BreadcrumbList"],
    },
    {
      name: "the home page",
      graph: homePageJsonLd([post]),
      types: ["Person", "WebSite", "Blog", "CollectionPage"],
    },
  ];

  for (const { name, graph, types } of cases) {
    it(`${name} lists its nodes`, () => {
      expect(graph.map((node) => node["@type"])).toEqual(types);
    });

    it(`${name} embeds the full Person node`, () => {
      expect(graph[0]).toEqual(personJsonLd());
    });
  }
});

describe("webSiteJsonLd", () => {
  it("is published by the Person", () => {
    expect(webSiteJsonLd()).toEqual({
      "@type": "WebSite",
      "@id": "https://blog.mth.lc/#website",
      name: "le dépôt",
      url: "https://blog.mth.lc/",
      inLanguage: "fr-FR",
      publisher: person,
    });
  });
});

describe("blogJsonLd", () => {
  const blog = blogJsonLd([post]);

  const cases: { field: string; expected: unknown }[] = [
    { field: "@id", expected: BLOG_ID },
    { field: "author", expected: person },
    { field: "publisher", expected: person },
    { field: "isPartOf", expected: { "@id": WEBSITE_ID } },
    {
      field: "blogPost",
      expected: [
        {
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          headline: post.title,
          url,
          author: person,
          datePublished: "2026-04-04",
          dateModified: "2026-04-04",
          image: ogImage,
        },
      ],
    },
  ];

  for (const { field, expected } of cases) {
    it(field, () => {
      expect(blog[field]).toEqual(expected);
    });
  }
});

describe("collectionPageJsonLd", () => {
  it("points at the blog as its main entity, inside the website", () => {
    expect(collectionPageJsonLd()).toMatchObject({
      "@type": "CollectionPage",
      url: "https://blog.mth.lc/",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": BLOG_ID },
    });
  });
});
