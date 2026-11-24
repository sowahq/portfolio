import { describe, expect, it } from "vitest";
import { createHeadingIds } from "./heading-id.js";

describe("createHeadingIds", () => {
  const cases: { name: string; headings: string[]; expected: string[] }[] = [
    { name: "plain text", headings: ["Introduction"], expected: ["introduction"] },
    { name: "accents are kept", headings: ["Références"], expected: ["références"] },
    {
      name: "punctuation collapses into one dash",
      headings: ["Steamworks : le jeu vous croit sur parole"],
      expected: ["steamworks-le-jeu-vous-croit-sur-parole"],
    },
    {
      name: "leading digit gets an underscore",
      headings: ["1. Une analyse initiale : ce que révèle un simple scan"],
      expected: ["_1-une-analyse-initiale-ce-que-révèle-un-simple-scan"],
    },
    {
      name: "duplicates are numbered",
      headings: ["Conclusion", "Conclusion"],
      expected: ["conclusion", "conclusion-1"],
    },
    { name: "trailing punctuation", headings: ["Pourquoi ?"], expected: ["pourquoi"] },
  ];

  for (const { name, headings, expected } of cases) {
    it(name, () => {
      const headingId = createHeadingIds();

      expect(headings.map(headingId)).toEqual(expected);
    });
  }
});
