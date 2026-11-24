import { describe, expect, it } from "vitest";
import { buildPosts, toSummary, type PostFile } from "./collection.js";
import { stubMarkdownServices } from "../../../test/stub-markdown-services.js";

function postFile(slug: string, pubDate: string, published: boolean): PostFile {
  const source = [
    "---",
    `title: "${slug}"`,
    "description: Une description.",
    `pubDate: ${pubDate}`,
    `image: /blog-img/${slug}/header.png`,
    'tags: ["reverse engineering"]',
    `slug: ${slug}`,
    `published: ${published}`,
    'cible: "un objet"',
    'outils: ["frida"]',
    'ateliers: ["mobile"]',
    `court: "${slug} court"`,
    "---",
    "",
    "# Introduction",
    "",
    "Quelques mots.",
  ].join("\n");

  return { file: `/content/posts/${slug}.md`, source };
}

describe("buildPosts", () => {
  const cases: { name: string; files: PostFile[]; slugs: string[] }[] = [
    { name: "no files", files: [], slugs: [] },
    {
      name: "drafts are left out",
      files: [postFile("publie", "01/10/2025", true), postFile("brouillon", "02/10/2025", false)],
      slugs: ["publie"],
    },
    {
      name: "newest first",
      files: [
        postFile("ancien", "01/10/2025", true),
        postFile("recent", "08/20/2026", true),
        postFile("milieu", "03/23/2026", true),
      ],
      slugs: ["recent", "milieu", "ancien"],
    },
  ];

  for (const { name, files, slugs } of cases) {
    it(name, async () => {
      const posts = await buildPosts(files, stubMarkdownServices());

      expect(posts.map((post) => post.slug)).toEqual(slugs);
    });
  }

  it("fills reading time, table of contents and cover", async () => {
    const [post] = await buildPosts([postFile("publie", "01/10/2025", true)], stubMarkdownServices());

    expect(post).toMatchObject({
      publishedAt: "2025-01-10",
      wordCount: 3,
      readingMinutes: 1,
      toc: [{ id: "introduction", text: "Introduction", depth: 1, children: [] }],
      cover: { kind: "image", src: "/blog-img/publie/header.png", alt: "publie", width: 800, height: 600 },
    });
  });

  it("numbers fiches from the oldest post", async () => {
    const files = [
      postFile("ancien", "01/10/2025", true),
      postFile("recent", "08/20/2026", true),
      postFile("brouillon", "05/01/2026", false),
      postFile("milieu", "03/23/2026", true),
    ];
    const posts = await buildPosts(files, stubMarkdownServices());

    expect(posts.map(({ slug, ficheNumber }) => [slug, ficheNumber])).toEqual([
      ["recent", "003"],
      ["milieu", "002"],
      ["ancien", "001"],
    ]);
  });

  it("maps the frontmatter fields of the fiche", async () => {
    const [post] = await buildPosts([postFile("publie", "01/10/2025", true)], stubMarkdownServices());

    expect(post).toMatchObject({
      target: "un objet",
      tools: ["frida"],
      workshops: ["mobile"],
      shortLabel: "publie court",
    });
    expect(post).not.toHaveProperty("protocol");
  });

  it("refuses two posts with the same slug", async () => {
    const files = [postFile("double", "01/10/2025", true), postFile("double", "02/10/2025", true)];

    await expect(buildPosts(files, stubMarkdownServices())).rejects.toThrow(/Slug en double/);
  });
});

describe("toSummary", () => {
  it("drops the heavy fields", async () => {
    const [post] = await buildPosts([postFile("publie", "01/10/2025", true)], stubMarkdownServices());

    if (!post) {
      throw new Error("post attendu");
    }

    expect(Object.keys(toSummary(post)).sort()).toEqual(
      [
        "description",
        "ficheNumber",
        "image",
        "publishedAt",
        "readingMinutes",
        "shortLabel",
        "slug",
        "tags",
        "target",
        "title",
        "tools",
        "wordCount",
        "workshops",
      ].sort(),
    );
  });
});
