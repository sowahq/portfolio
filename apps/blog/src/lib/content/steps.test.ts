import { describe, expect, it } from "vitest";
import { splitStepNumber, topLevelSteps, type NumberedHeading } from "./steps.js";
import type { ContentNode, TocEntry } from "./types.js";

const text = (value: string): ContentNode => ({ kind: "text", value });

const code = (value: string): ContentNode => ({ kind: "element", tag: "code", children: [text(value)] });

describe("splitStepNumber", () => {
  const cases: { name: string; children: ContentNode[]; depth: number; expected: NumberedHeading }[] = [
    {
      name: "numbered step",
      children: [text("1. Reconnaissance : qui parle ?")],
      depth: 1,
      expected: { number: "1", children: [text("Reconnaissance : qui parle ?")] },
    },
    {
      name: "plain step",
      children: [text("Introduction")],
      depth: 1,
      expected: { number: null, children: [text("Introduction")] },
    },
    {
      name: "step whose title goes on with inline code",
      children: [text("2. Le mur : "), code("local_key")],
      depth: 1,
      expected: { number: "2", children: [text("Le mur : "), code("local_key")] },
    },
    {
      name: "step made of a number only before code",
      children: [text("3. "), code("main")],
      depth: 1,
      expected: { number: "3", children: [code("main")] },
    },
    {
      name: "year at depth 1 is not a step number",
      children: [text("2026 en bref")],
      depth: 1,
      expected: { number: null, children: [text("2026 en bref")] },
    },
    {
      name: "substep with a trailing dot",
      children: [text("1.1. Décoder l'annonce")],
      depth: 2,
      expected: { number: "1.1", children: [text("Décoder l'annonce")] },
    },
    {
      name: "substep without a trailing dot",
      children: [text("2.3 La VM Engine")],
      depth: 2,
      expected: { number: "2.3", children: [text("La VM Engine")] },
    },
    {
      name: "unnumbered substep",
      children: [text("Outils utilisés")],
      depth: 2,
      expected: { number: null, children: [text("Outils utilisés")] },
    },
    {
      name: "single number at depth 2 is kept",
      children: [text("1. Pas une sous-étape")],
      depth: 2,
      expected: { number: null, children: [text("1. Pas une sous-étape")] },
    },
    {
      name: "depth 3 is never numbered",
      children: [text("1.1.1 Détail")],
      depth: 3,
      expected: { number: null, children: [text("1.1.1 Détail")] },
    },
  ];

  for (const { name, children, depth, expected } of cases) {
    it(name, () => {
      expect(splitStepNumber(children, depth)).toEqual(expected);
    });
  }
});

describe("topLevelSteps", () => {
  const entry = (id: string, depth: number): TocEntry => ({ id, text: id, depth, children: [] });

  it("keeps only depth 1 entries", () => {
    expect(topLevelSteps([entry("intro", 1), entry("orphan", 2), entry("conclusion", 1)]).map(({ id }) => id)).toEqual([
      "intro",
      "conclusion",
    ]);
  });
});
