import { describe, expect, it } from "vitest";
import { parsePostSource, splitFrontmatter } from "./frontmatter.js";

const VALID = [
  "---",
  'title: "Steamworks : le jeu vous croit sur parole"',
  "description: Une description.",
  "pubDate: 08/05/2026",
  "image: /blog-img/steamworks/header.png",
  'tags: ["reverse engineering", "steam"]',
  "slug: steamworks-le-jeu-vous-croit-sur-parole",
  "published: true",
  'cible: "les interfaces Steamworks"',
  'protocole: "Steamworks API"',
  'outils: ["MinHook"]',
  'ateliers: ["jeux", "protections"]',
  'court: "Steamworks"',
  "---",
  "",
  "# Introduction",
].join("\n");

describe("splitFrontmatter", () => {
  const cases: { name: string; source: string; yaml: string; content: string }[] = [
    { name: "frontmatter and body", source: "---\na: 1\n---\nbody", yaml: "a: 1", content: "body" },
    { name: "windows line endings", source: "---\r\na: 1\r\n---\r\nbody", yaml: "a: 1", content: "body" },
    { name: "frontmatter only", source: "---\na: 1\n---", yaml: "a: 1", content: "" },
    { name: "no frontmatter", source: "# Title", yaml: "", content: "# Title" },
    { name: "horizontal rule later", source: "text\n---\nmore", yaml: "", content: "text\n---\nmore" },
  ];

  for (const { name, source, yaml, content } of cases) {
    it(name, () => {
      expect(splitFrontmatter(source)).toEqual({ yaml, content });
    });
  }
});

describe("parsePostSource", () => {
  it("parses a valid post", () => {
    const { frontmatter, content } = parsePostSource(VALID, "steamworks.md");

    expect(frontmatter).toEqual({
      title: "Steamworks : le jeu vous croit sur parole",
      description: "Une description.",
      pubDate: "2026-08-05",
      image: "/blog-img/steamworks/header.png",
      tags: ["reverse engineering", "steam"],
      slug: "steamworks-le-jeu-vous-croit-sur-parole",
      published: true,
      cible: "les interfaces Steamworks",
      protocole: "Steamworks API",
      outils: ["MinHook"],
      ateliers: ["jeux", "protections"],
      court: "Steamworks",
    });

    expect(content).toBe("\n# Introduction");
  });

  const optional: {
    name: string;
    replace: [string, string];
    check: (source: ReturnType<typeof parsePostSource>) => void;
  }[] = [
    {
      name: "a post with an SEO title",
      replace: [
        'title: "Steamworks : le jeu vous croit sur parole"\n',
        'title: "Steamworks : le jeu vous croit sur parole"\nseoTitle: "Steamworks et DLC"\n',
      ],
      check: ({ frontmatter }) => expect(frontmatter.seoTitle).toBe("Steamworks et DLC"),
    },
    {
      name: "a post without protocol",
      replace: ['protocole: "Steamworks API"\n', ""],
      check: ({ frontmatter }) => expect(frontmatter.protocole).toBeUndefined(),
    },
    {
      name: "a post without tools",
      replace: ['outils: ["MinHook"]', "outils: []"],
      check: ({ frontmatter }) => expect(frontmatter.outils).toEqual([]),
    },
  ];

  for (const { name, replace, check } of optional) {
    it(`accepts ${name}`, () => {
      check(parsePostSource(VALID.replace(...replace), "steamworks.md"));
    });
  }

  it("treats a missing published flag as a draft", () => {
    const draft = VALID.replace("published: true\n", "");

    expect(parsePostSource(draft, "draft.md").frontmatter.published).toBe(false);
  });

  const invalid: { name: string; replace: [string, string]; field: string }[] = [
    { name: "impossible date", replace: ["08/05/2026", "02/31/2026"], field: "pubDate" },
    { name: "uppercase slug", replace: ["slug: steamworks", "slug: Steamworks"], field: "slug" },
    { name: "slug with accent", replace: ["slug: steamworks", "slug: é-steamworks"], field: "slug" },
    { name: "relative image", replace: ["image: /blog-img", "image: blog-img"], field: "image" },
    { name: "tags as a string", replace: ['tags: ["reverse engineering", "steam"]', "tags: steam"], field: "tags" },
    { name: "missing title", replace: ['title: "Steamworks : le jeu vous croit sur parole"\n', ""], field: "title" },
    { name: "missing target", replace: ['cible: "les interfaces Steamworks"\n', ""], field: "cible" },
    { name: "empty target", replace: ['cible: "les interfaces Steamworks"', 'cible: ""'], field: "cible" },
    { name: "missing tools", replace: ['outils: ["MinHook"]\n', ""], field: "outils" },
    { name: "tools as a string", replace: ['outils: ["MinHook"]', "outils: MinHook"], field: "outils" },
    {
      name: "unknown workshop",
      replace: ['ateliers: ["jeux", "protections"]', 'ateliers: ["cuisine"]'],
      field: "ateliers",
    },
    { name: "no workshop", replace: ['ateliers: ["jeux", "protections"]', "ateliers: []"], field: "ateliers" },
    { name: "missing short label", replace: ['court: "Steamworks"\n', ""], field: "court" },
    { name: "empty protocol", replace: ['protocole: "Steamworks API"', 'protocole: ""'], field: "protocole" },
  ];

  for (const { name, replace, field } of invalid) {
    it(`rejects ${name}`, () => {
      const source = VALID.replace(...replace);

      expect(() => parsePostSource(source, "broken.md")).toThrow(new RegExp(`broken\\.md.*${field}`));
    });
  }
});
