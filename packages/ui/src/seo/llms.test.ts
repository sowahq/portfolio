import { describe, expect, it } from "vitest";
import { buildLlmsTxt, type LlmsDocument } from "./llms.js";

describe("buildLlmsTxt", () => {
  const cases: { name: string; document: LlmsDocument; expected: string }[] = [
    {
      name: "title and summary only",
      document: { title: "le dépôt", summary: "Des démontages.", sections: [] },
      expected: "# le dépôt\n\n> Des démontages.\n",
    },
    {
      name: "notes and links with and without description",
      document: {
        title: "Mathis Lutic",
        summary: "Développeur\nfreelance.",
        details: ["Basé à Lille."],
        sections: [
          {
            title: "Liens",
            links: [
              { title: "Blog", url: "https://blog.mth.lc/", description: "Les fiches." },
              { title: "GitHub", url: "https://github.com/sowahq" },
            ],
          },
        ],
      },
      expected: [
        "# Mathis Lutic",
        "",
        "> Développeur freelance.",
        "",
        "Basé à Lille.",
        "",
        "## Liens",
        "",
        "- [Blog](https://blog.mth.lc/): Les fiches.",
        "- [GitHub](https://github.com/sowahq)",
        "",
      ].join("\n"),
    },
    {
      name: "an item without url is a plain list entry",
      document: {
        title: "t",
        summary: "s",
        sections: [{ title: "Missions", links: [{ title: "Start-up logistique", description: "CTO, 2025 – 2026" }] }],
      },
      expected: "# t\n\n> s\n\n## Missions\n\n- Start-up logistique: CTO, 2025 – 2026\n",
    },
    {
      name: "a long description is never cut",
      document: {
        title: "t",
        summary: "s",
        sections: [
          {
            title: "Fiches",
            links: [{ title: "a", url: "https://blog.mth.lc/posts/a", description: "mot ".repeat(80) }],
          },
        ],
      },
      expected: `# t\n\n> s\n\n## Fiches\n\n- [a](https://blog.mth.lc/posts/a): ${"mot ".repeat(80).trim()}\n`,
    },
    {
      name: "empty sections are dropped and brackets escaped",
      document: {
        title: "t",
        summary: "s",
        sections: [
          { title: "Vide", links: [] },
          { title: "Fiches", links: [{ title: "[oui]", url: "https://blog.mth.lc/posts/a" }] },
        ],
      },
      expected: "# t\n\n> s\n\n## Fiches\n\n- [\\[oui\\]](https://blog.mth.lc/posts/a)\n",
    },
  ];

  for (const { name, document, expected } of cases) {
    it(name, () => {
      expect(buildLlmsTxt(document)).toBe(expected);
    });
  }
});
