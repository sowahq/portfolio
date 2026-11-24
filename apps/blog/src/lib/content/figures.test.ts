import { describe, expect, it } from "vitest";
import { contentImages, figureImage, figureLabel, numberFigures } from "./figures.js";
import type { ContentNode, ImageNode } from "./types.js";

const image = (src: string): ImageNode => ({ kind: "image", src, alt: src });

const text = (value: string): ContentNode => ({ kind: "text", value });

const paragraph = (...children: ContentNode[]): ContentNode => ({ kind: "element", tag: "p", children });

describe("figureImage", () => {
  const solo = image("/a.png");

  const cases: { name: string; node: ContentNode; expected: ImageNode | null }[] = [
    { name: "paragraph holding only an image", node: paragraph(solo), expected: solo },
    { name: "image surrounded by blank text", node: paragraph(text("\n"), solo, text(" ")), expected: solo },
    { name: "image inside a sentence", node: paragraph(text("Voir "), solo), expected: null },
    { name: "two images", node: paragraph(solo, image("/b.png")), expected: null },
    { name: "not a paragraph", node: { kind: "element", tag: "li", children: [solo] }, expected: null },
    { name: "bare image", node: solo, expected: null },
  ];

  for (const { name, node, expected } of cases) {
    it(name, () => {
      expect(figureImage(node)).toBe(expected);
    });
  }
});

describe("numberFigures", () => {
  it("numbers figures in reading order, skipping inline images", () => {
    const first = image("/1.png");
    const inline = image("/inline.png");
    const nested = image("/2.png");
    const last = image("/3.png");

    const nodes: ContentNode[] = [
      paragraph(first),
      paragraph(text("Un schéma "), inline),
      { kind: "element", tag: "blockquote", children: [paragraph(nested)] },
      paragraph(last),
    ];

    const figures = numberFigures(nodes);

    expect([first, inline, nested, last].map((node) => figures.get(node))).toEqual([1, undefined, 2, 3]);
  });
});

describe("figureLabel", () => {
  const cases: { number: number; expected: string }[] = [
    { number: 1, expected: "pièce 01" },
    { number: 12, expected: "pièce 12" },
  ];

  for (const { number, expected } of cases) {
    it(expected, () => {
      expect(figureLabel(number)).toBe(expected);
    });
  }
});

describe("contentImages", () => {
  const figure = image("/figure.png");
  const inline = image("/inline.png");
  const carded = image("/card.png");

  const cases: { name: string; nodes: ContentNode[]; expected: ImageNode[] }[] = [
    { name: "no image", nodes: [paragraph(text("rien"))], expected: [] },
    {
      name: "figures and inline images",
      nodes: [paragraph(figure), paragraph(text("voir "), inline)],
      expected: [figure, inline],
    },
    {
      name: "images inside reference cards",
      nodes: [{ kind: "ref-grid", cards: [{ kind: "ref-card", url: "https://a.b", title: "a", children: [carded] }] }],
      expected: [carded],
    },
  ];

  for (const { name, nodes, expected } of cases) {
    it(name, () => {
      expect(contentImages(nodes)).toEqual(expected);
    });
  }
});
