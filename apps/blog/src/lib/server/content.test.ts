import { describe, expect, it } from "vitest";
import { flattenToc } from "#lib/content/toc.js";
import type { ContentNode } from "#lib/content/types.js";
import { postPath, postTitle } from "#lib/site.js";
import { buildPosts, type PostFile } from "./collection.js";
import { highlightCode } from "./highlighter.js";
import { readImageDimensions } from "./images.js";

const sources = import.meta.glob<string>("/content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const files: PostFile[] = Object.entries(sources).map(([file, source]) => ({ file, source }));

const posts = await buildPosts(files, {
  highlight: highlightCode,
  linkPreview: async () => null,
  imageDimensions: readImageDimensions,
});

function internalTargets(nodes: ContentNode[]): string[] {
  return nodes.flatMap((node) => {
    if (node.kind === "ref-card" && node.url.startsWith("/")) {
      return [node.url];
    }

    if (node.kind === "link" && node.href.startsWith("/")) {
      return [node.href];
    }

    if (node.kind === "ref-grid") {
      return internalTargets(node.cards);
    }

    return "children" in node ? internalTargets(node.children) : [];
  });
}

describe("published posts", () => {
  it("are all there", () => {
    expect(posts.map((post) => post.slug).sort()).toEqual([
      "l-obfuscation-via-la-virtualisation",
      "les-nanomites-d-armadillo",
      "les-qr-codes-de-basic-fit-comment-ca-fonctionne",
      "reverse-frigo-de-voiture-tuya-ble",
      "steamworks-le-jeu-vous-croit-sur-parole",
    ]);
  });

  for (const post of posts) {
    describe(post.slug, () => {
      it("keeps the file name as its URL slug", () => {
        expect(files.some(({ file }) => file === `/content/posts/${post.slug}.md`)).toBe(true);
      });

      it("has a table of contents and a reading time", () => {
        expect(flattenToc(post.toc).length).toBeGreaterThan(0);
        expect(post.readingMinutes).toBeGreaterThan(0);
      });

      it("keeps its description short enough for result snippets", () => {
        expect(post.description.length).toBeLessThanOrEqual(160);
      });

      it("keeps its SEO title short enough for result titles", () => {
        expect(postTitle(post.seoTitle ?? post.title).length).toBeLessThanOrEqual(70);
      });

      it("only links to published posts", () => {
        const published = new Set(posts.map(({ slug }) => postPath(slug)));

        for (const target of internalTargets(post.body)) {
          expect(published).toContain(target.split("#")[0]);
        }
      });
    });
  }
});
