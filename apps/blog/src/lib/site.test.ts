import { describe, expect, it } from "vitest";
import { SITE, homeOgImage, postHeadline, postOgImage, postOgPath, postTitle } from "./site.js";

describe("home metadata", () => {
  const cases: { name: string; value: string; min: number; max: number }[] = [
    { name: "title", value: SITE.homeTitle, min: 50, max: 60 },
    { name: "description", value: SITE.description, min: 140, max: 160 },
  ];

  for (const { name, value, min, max } of cases) {
    it(`${name} is between ${min} and ${max} characters`, () => {
      expect(value.length).toBeGreaterThanOrEqual(min);
      expect(value.length).toBeLessThanOrEqual(max);
    });
  }

  it("names the blog after its author", () => {
    expect(SITE.title).toBe("le dépôt");
    expect(SITE.siteName).toBe("le dépôt · Mathis Lutic");
    expect(SITE.host).toBe("blog.mth.lc");
  });
});

describe("postTitle", () => {
  const cases: { title: string; expected: string }[] = [
    {
      title: "Steamworks : le jeu vous croit sur parole",
      expected: "Steamworks : le jeu vous croit sur parole · le dépôt",
    },
    {
      title: "J'ai reverse un frigo de voiture (oui.)",
      expected: "J'ai reverse un frigo de voiture (oui.) · le dépôt",
    },
  ];

  for (const { title, expected } of cases) {
    it(title, () => {
      expect(postTitle(title)).toBe(expected);
    });
  }
});

describe("postHeadline", () => {
  const cases: { name: string; post: { title: string; seoTitle?: string }; expected: string }[] = [
    { name: "without SEO title", post: { title: "Steamworks" }, expected: "Steamworks" },
    {
      name: "with an SEO title",
      post: { title: "Steamworks", seoTitle: "Steamworks et DLC" },
      expected: "Steamworks et DLC",
    },
  ];

  for (const { name, post, expected } of cases) {
    it(name, () => {
      expect(postHeadline(post)).toBe(expected);
    });
  }
});

describe("Open Graph images", () => {
  const cases: { name: string; image: ReturnType<typeof homeOgImage>; url: string }[] = [
    { name: "home", image: homeOgImage(), url: "https://blog.mth.lc/og/home.png" },
    {
      name: "fiche",
      image: postOgImage({ slug: "steamworks-le-jeu-vous-croit-sur-parole", title: "Steamworks", ficheNumber: "004" }),
      url: "https://blog.mth.lc/og/steamworks-le-jeu-vous-croit-sur-parole.png",
    },
  ];

  for (const { name, image, url } of cases) {
    it(name, () => {
      expect(image).toMatchObject({ url, width: 1200, height: 630, type: "image/png" });
      expect(image.alt.length).toBeGreaterThan(0);
    });
  }

  it("serves fiche images next to the fiche slug", () => {
    expect(postOgPath("a-b")).toBe("/og/a-b.png");
  });
});
