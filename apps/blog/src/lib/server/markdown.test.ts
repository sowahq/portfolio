import { describe, expect, it } from "vitest";
import type { ContentNode } from "#lib/content/types.js";
import { stubMarkdownServices } from "../../../test/stub-markdown-services.js";
import { renderMarkdown } from "./markdown.js";

const services = stubMarkdownServices({
  "https://frida.re": { url: "https://frida.re", host: "frida.re", title: "Frida" },
});

async function render(markdown: string): Promise<ContentNode[]> {
  return (await renderMarkdown(markdown, services)).nodes;
}

describe("renderMarkdown", () => {
  const cases: { name: string; markdown: string; expected: ContentNode[] }[] = [
    {
      name: "paragraph with inline code and strong",
      markdown: "Un `F5` **magique**.",
      expected: [
        {
          kind: "element",
          tag: "p",
          children: [
            { kind: "text", value: "Un " },
            { kind: "element", tag: "code", children: [{ kind: "text", value: "F5" }] },
            { kind: "text", value: " " },
            { kind: "element", tag: "strong", children: [{ kind: "text", value: "magique" }] },
            { kind: "text", value: "." },
          ],
        },
      ],
    },
    {
      name: "heading with the Nuxt id",
      markdown: "# 1. Une analyse : ça marche ?",
      expected: [
        {
          kind: "heading",
          level: 1,
          id: "_1-une-analyse-ça-marche",
          children: [{ kind: "text", value: "1. Une analyse : ça marche ?" }],
        },
      ],
    },
    {
      name: "external link with its build-time preview",
      markdown: "[Frida](https://frida.re)",
      expected: [
        {
          kind: "element",
          tag: "p",
          children: [
            {
              kind: "link",
              href: "https://frida.re",
              external: true,
              preview: { url: "https://frida.re", host: "frida.re", title: "Frida" },
              children: [{ kind: "text", value: "Frida" }],
            },
          ],
        },
      ],
    },
    {
      name: "internal link",
      markdown: "[la suite](/posts/les-nanomites-d-armadillo)",
      expected: [
        {
          kind: "element",
          tag: "p",
          children: [
            {
              kind: "link",
              href: "/posts/les-nanomites-d-armadillo",
              external: false,
              children: [{ kind: "text", value: "la suite" }],
            },
          ],
        },
      ],
    },
    {
      name: "image keeps its MDC width",
      markdown: '![QR Code](/blog-img/qr.webp){ width="50%" }',
      expected: [
        {
          kind: "element",
          tag: "p",
          children: [
            {
              kind: "image",
              src: "/blog-img/qr.webp",
              alt: "QR Code",
              width: 800,
              height: 600,
              displayWidth: "50%",
            },
          ],
        },
      ],
    },
    {
      name: "image without size gets its intrinsic size",
      markdown: "![PKCE](/blog-img/pkce.webp)",
      expected: [
        {
          kind: "element",
          tag: "p",
          children: [{ kind: "image", src: "/blog-img/pkce.webp", alt: "PKCE", width: 800, height: 600 }],
        },
      ],
    },
    {
      name: "code block",
      markdown: "```asm\nint 3\nret\n```",
      expected: [
        {
          kind: "code",
          lang: "asm",
          background: "var(--color-board)",
          foreground: "var(--color-board-text)",
          lines: [[{ content: "int 3" }], [{ content: "ret" }]],
        },
      ],
    },
    {
      name: "warning paragraph becomes a callout",
      markdown: "⚠️ Ce post ne vous apprendra pas à frauder. ⚠️",
      expected: [
        {
          kind: "callout",
          children: [
            {
              kind: "element",
              tag: "p",
              children: [{ kind: "text", value: "⚠️ Ce post ne vous apprendra pas à frauder. ⚠️" }],
            },
          ],
        },
      ],
    },
    {
      name: "warning blockquote becomes a callout",
      markdown: "> ⚠️ **Pas un tuto.** ⚠️",
      expected: [
        {
          kind: "callout",
          children: [
            {
              kind: "element",
              tag: "p",
              children: [
                { kind: "text", value: "⚠️ " },
                { kind: "element", tag: "strong", children: [{ kind: "text", value: "Pas un tuto." }] },
                { kind: "text", value: " ⚠️" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "ref grid with cards",
      markdown: [
        ":::ref-grid",
        '::ref-card{url="https://github.com/skylot/jadx" title="Jadx"}',
        "Décompilation de l'APK.",
        "::",
        "",
        '::ref-card{url="/posts/les-nanomites-d-armadillo" title="Les Nanomites"}',
        "::",
        ":::",
      ].join("\n"),
      expected: [
        {
          kind: "ref-grid",
          cards: [
            {
              kind: "ref-card",
              url: "https://github.com/skylot/jadx",
              title: "Jadx",
              children: [{ kind: "element", tag: "p", children: [{ kind: "text", value: "Décompilation de l'APK." }] }],
            },
            { kind: "ref-card", url: "/posts/les-nanomites-d-armadillo", title: "Les Nanomites", children: [] },
          ],
        },
      ],
    },
    {
      name: "table with alignment",
      markdown: "| a | b |\n| :-- | --: |\n| 1 | 2 |",
      expected: [
        {
          kind: "element",
          tag: "table",
          children: [
            {
              kind: "element",
              tag: "thead",
              children: [
                {
                  kind: "element",
                  tag: "tr",
                  children: [
                    { kind: "element", tag: "th", align: "left", children: [{ kind: "text", value: "a" }] },
                    { kind: "element", tag: "th", align: "right", children: [{ kind: "text", value: "b" }] },
                  ],
                },
              ],
            },
            {
              kind: "element",
              tag: "tbody",
              children: [
                {
                  kind: "element",
                  tag: "tr",
                  children: [
                    { kind: "element", tag: "td", align: "left", children: [{ kind: "text", value: "1" }] },
                    { kind: "element", tag: "td", align: "right", children: [{ kind: "text", value: "2" }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "MDC span with a tone class",
      markdown: "Il faut [retourner un booléen]{.text-red-600.font-semibold}, ou [signer]{.text-emerald-600}.",
      expected: [
        {
          kind: "element",
          tag: "p",
          children: [
            { kind: "text", value: "Il faut " },
            { kind: "tone", tone: "danger", children: [{ kind: "text", value: "retourner un booléen" }] },
            { kind: "text", value: ", ou " },
            { kind: "tone", tone: "safe", children: [{ kind: "text", value: "signer" }] },
            { kind: "text", value: "." },
          ],
        },
      ],
    },
    {
      name: "horizontal rule",
      markdown: "a\n\n---\n\nb",
      expected: [
        { kind: "element", tag: "p", children: [{ kind: "text", value: "a" }] },
        { kind: "rule" },
        { kind: "element", tag: "p", children: [{ kind: "text", value: "b" }] },
      ],
    },
  ];

  for (const { name, markdown, expected } of cases) {
    it(name, async () => {
      expect(await render(markdown)).toEqual(expected);
    });
  }

  it("collects headings in document order with unique ids", async () => {
    const { headings } = await renderMarkdown("# Intro\n\n## Détail\n\n# Intro", services);

    expect(headings).toEqual([
      { id: "intro", text: "Intro", depth: 1 },
      { id: "détail", text: "Détail", depth: 2 },
      { id: "intro-1", text: "Intro", depth: 1 },
    ]);
  });

  it("counts words of text and code", async () => {
    const markdown = "# Deux mots\n\nTrois **mots ici** encore\n\n```c\nint main\n```";
    const { wordCount } = await renderMarkdown(markdown, services);

    expect(wordCount).toBe(8);
  });

  const rejected: { name: string; markdown: string; message: RegExp }[] = [
    { name: "raw HTML", markdown: "<div>brut</div>", message: /HTML brut/ },
    { name: "ref-card without title", markdown: '::ref-card{url="https://a.b"}\n::', message: /ref-card/ },
    { name: "span without a known tone", markdown: "[texte]{.text-blue-600}", message: /Span MDC/ },
  ];

  for (const { name, markdown, message } of rejected) {
    it(`refuses ${name} instead of dropping it`, async () => {
      await expect(renderMarkdown(markdown, services)).rejects.toThrow(message);
    });
  }
});
