import { describe, expect, it } from "vitest";
import { ogColors, readColorTokens, themeColor } from "./tokens.js";

describe("readColorTokens", () => {
  const cases: { name: string; css: string; expected: Record<string, string> }[] = [
    {
      name: "hex tokens",
      css: "--color-ink: #24123f;\n--color-paper:#f6f1fd ;",
      expected: { ink: "#24123f", paper: "#f6f1fd" },
    },
    { name: "non hex values are skipped", css: "--color-weld-core: rgb(255 255 255 / 0.95);", expected: {} },
    {
      name: "other variables are skipped",
      css: "--font-pixel: Monocraft; --shadow-ink: 4px 4px 0 #000;",
      expected: {},
    },
  ];

  for (const { name, css, expected } of cases) {
    it(name, () => {
      expect(readColorTokens(css)).toEqual(expected);
    });
  }
});

describe("themeColor", () => {
  it("throws on a missing token", () => {
    expect(() => themeColor("missing", {})).toThrow("--color-missing");
  });

  it("reads the real theme", () => {
    expect(ogColors.ink).toBe("#24123f");
    expect(ogColors.highlight).toBe("#fde047");
    expect(ogColors.paper).toBe("#f6f1fd");
  });
});
