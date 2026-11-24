import { describe, expect, it } from "vitest";
import { ficheCardData } from "./og-card.js";
import type { PostSummary } from "./types.js";

const post: PostSummary = {
  slug: "reverse-frigo-de-voiture-tuya-ble",
  title: "J'ai reverse un frigo de voiture (oui.)",
  description: "Un frigo.",
  publishedAt: "2026-08-20",
  image: "/blog-img/reverse-frigo-de-voiture-tuya-ble/header.png",
  tags: [],
  target: "frigo de voiture",
  tools: [],
  workshops: ["matériel"],
  shortLabel: "frigo",
  wordCount: 1800,
  readingMinutes: 9,
  ficheNumber: "005",
};

describe("ficheCardData", () => {
  const card = ficheCardData(post, 5);

  const cases: { field: keyof typeof card; expected: unknown }[] = [
    { field: "number", expected: "005" },
    { field: "date", expected: "20 août 2026" },
    { field: "title", expected: post.title },
    {
      field: "details",
      expected: [
        { term: "cible", value: "frigo de voiture" },
        { term: "durée", value: "9 min" },
      ],
    },
    { field: "host", expected: "blog.mth.lc" },
    { field: "sign", expected: "ATELIER · VOIES 1–5" },
  ];

  for (const { field, expected } of cases) {
    it(field, () => {
      expect(card[field]).toEqual(expected);
    });
  }
});
