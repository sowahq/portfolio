import { describe, expect, it } from "vitest";
import { blogLlmsFullTxt, blogLlmsTxt } from "./llms.js";
import type { PostSummary } from "./types.js";

const summary = (slug: string, ficheNumber: string, title: string, description: string): PostSummary => ({
  slug,
  title,
  description,
  publishedAt: "2026-08-20",
  image: `/blog-img/${slug}/header.png`,
  tags: [],
  target: "un objet",
  tools: [],
  workshops: ["mobile"],
  shortLabel: slug,
  wordCount: 400,
  readingMinutes: 2,
  ficheNumber,
});

describe("blogLlmsTxt", () => {
  const posts = [
    summary(
      "reverse-frigo-de-voiture-tuya-ble",
      "005",
      "J'ai reverse un frigo de voiture (oui.)",
      "Un frigo\nBluetooth.",
    ),
    summary("les-nanomites-d-armadillo", "002", "Les Nanomites d'Armadillo", "Plongée dans Armadillo."),
  ];

  const text = blogLlmsTxt(posts);

  const cases: string[] = [
    "# le dépôt · Mathis Lutic\n",
    "> Je démonte ce qui me tombe sous la main",
    "## Fiches",
    "- [Fiche n° 005 : J'ai reverse un frigo de voiture (oui.)](https://blog.mth.lc/posts/reverse-frigo-de-voiture-tuya-ble): Un frigo Bluetooth.",
    "- [Fiche n° 002 : Les Nanomites d'Armadillo](https://blog.mth.lc/posts/les-nanomites-d-armadillo): Plongée dans Armadillo.",
    "- [Flux RSS](https://blog.mth.lc/rss.xml)",
    "- [Texte intégral des fiches](https://blog.mth.lc/llms-full.txt)",
  ];

  for (const fragment of cases) {
    it(`contains ${fragment.slice(0, 40)}`, () => {
      expect(text).toContain(fragment);
    });
  }

  it("keeps the posts in the given order", () => {
    expect(text.indexOf("005")).toBeLessThan(text.indexOf("002"));
  });
});

describe("blogLlmsTxt descriptions", () => {
  const long =
    "Quand un jeu demande s'il possède un DLC, la réponse est calculée dans son propre processus, sans réseau ni signature. Pourquoi ces interfaces ne sont pas une frontière de sécurité, et comment vérifier la propriété correctement.";

  it("keeps the whole frontmatter description", () => {
    expect(blogLlmsTxt([summary("steamworks", "004", "Steamworks", long)])).toContain(`: ${long}\n`);
  });
});

describe("blogLlmsFullTxt", () => {
  const text = blogLlmsFullTxt([
    {
      post: summary("reverse-frigo-de-voiture-tuya-ble", "005", "Frigo", "d"),
      markdown: "\n# Introduction\n\nUn frigo.\n\n",
    },
    {
      post: summary("les-nanomites-d-armadillo", "002", "Nanomites", "d"),
      markdown: "# Introduction\n\nDes nanomites.",
    },
  ]);

  const cases: string[] = [
    "# le dépôt · Mathis Lutic\n\n> Je démonte",
    [
      "# Fiche n° 005 : Frigo",
      "URL : https://blog.mth.lc/posts/reverse-frigo-de-voiture-tuya-ble",
      "Date : 2026-08-20",
      "# Introduction\n\nUn frigo.",
    ].join("\n\n"),
    "\n\n---\n\n# Fiche n° 002 : Nanomites",
    "Des nanomites.\n",
  ];

  for (const fragment of cases) {
    it(`contains ${fragment.slice(0, 40)}`, () => {
      expect(text).toContain(fragment);
    });
  }

  it("never carries a frontmatter", () => {
    expect(text).not.toContain("published:");
  });
});
