import { describe, expect, it } from "vitest";
import type { CodeToken } from "#lib/content/types.js";
import { mergeTokens } from "./highlighter.js";

describe("mergeTokens", () => {
  const cases: { name: string; line: CodeToken[]; expected: CodeToken[] }[] = [
    { name: "empty line", line: [], expected: [] },
    {
      name: "same color merges",
      line: [
        { content: "foo", color: "#fff" },
        { content: "bar", color: "#fff" },
      ],
      expected: [{ content: "foobar", color: "#fff" }],
    },
    {
      name: "whitespace folds into the previous token",
      line: [
        { content: "a", color: "#f00" },
        { content: "  ", color: "#fff" },
        { content: "b", color: "#0f0" },
      ],
      expected: [
        { content: "a  ", color: "#f00" },
        { content: "b", color: "#0f0" },
      ],
    },
    {
      name: "different style stays apart",
      line: [
        { content: "x", color: "#fff" },
        { content: "y", color: "#fff", fontStyle: 1 },
      ],
      expected: [
        { content: "x", color: "#fff" },
        { content: "y", color: "#fff", fontStyle: 1 },
      ],
    },
  ];

  for (const { name, line, expected } of cases) {
    it(name, () => {
      expect(mergeTokens(line)).toEqual(expected);
    });
  }
});
