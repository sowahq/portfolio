import { describe, expect, it } from "vitest";
import { withoutWarningSigns } from "./callout.js";
import type { ContentNode } from "./types.js";

const text = (value: string): ContentNode => ({ kind: "text", value });

const paragraph = (...children: ContentNode[]): ContentNode => ({ kind: "element", tag: "p", children });

const strong = (value: string): ContentNode => ({ kind: "element", tag: "strong", children: [text(value)] });

describe("withoutWarningSigns", () => {
  const cases: { name: string; children: ContentNode[]; expected: ContentNode[] }[] = [
    {
      name: "signs around a single paragraph",
      children: [paragraph(text("⚠️ Ce post ne vous apprendra pas à frauder. ⚠️"))],
      expected: [paragraph(text("Ce post ne vous apprendra pas à frauder."))],
    },
    {
      name: "signs around formatted text",
      children: [paragraph(text("⚠️ "), strong("Pas un tuto."), text(" ⚠️"))],
      expected: [paragraph(text(""), strong("Pas un tuto."), text(""))],
    },
    {
      name: "sign without variation selector",
      children: [paragraph(text("⚠ Attention"))],
      expected: [paragraph(text("Attention"))],
    },
    {
      name: "no sign",
      children: [paragraph(text("Rien à signaler."))],
      expected: [paragraph(text("Rien à signaler."))],
    },
    {
      name: "a sign in the middle stays",
      children: [paragraph(text("avant ⚠️ après"))],
      expected: [paragraph(text("avant ⚠️ après"))],
    },
    { name: "empty", children: [], expected: [] },
  ];

  for (const { name, children, expected } of cases) {
    it(name, () => {
      expect(withoutWarningSigns(children)).toEqual(expected);
    });
  }

  it("leaves its input untouched", () => {
    const children = [paragraph(text("⚠️ Attention ⚠️"))];

    withoutWarningSigns(children);

    expect(children).toEqual([paragraph(text("⚠️ Attention ⚠️"))]);
  });
});
