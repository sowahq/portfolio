import { describe, expect, it } from "vitest";
import { codeText, terminalLabel } from "./terminal.js";

describe("terminalLabel", () => {
  const cases: { lang: string; expected: string }[] = [
    { lang: "python", expected: "DIAG · PYTHON" },
    { lang: "javascript", expected: "DIAG · FRIDA · JAVASCRIPT" },
    { lang: "js", expected: "DIAG · FRIDA · JAVASCRIPT" },
    { lang: "plaintext", expected: "DIAG · SORTIE" },
    { lang: "text", expected: "DIAG · SORTIE" },
    { lang: "", expected: "DIAG · SORTIE" },
    { lang: "cpp", expected: "DIAG · C++" },
    { lang: "asm", expected: "DIAG · ASM" },
    { lang: "json", expected: "DIAG · JSON" },
    { lang: "Rust", expected: "DIAG · RUST" },
  ];

  for (const { lang, expected } of cases) {
    it(`labels "${lang}"`, () => {
      expect(terminalLabel(lang)).toBe(expected);
    });
  }
});

describe("codeText", () => {
  const cases: { name: string; lines: { content: string; color?: string }[][]; expected: string }[] = [
    { name: "no line", lines: [], expected: "" },
    {
      name: "one line of tokens",
      lines: [[{ content: "import", color: "#7DCFFF" }, { content: " os" }]],
      expected: "import os",
    },
    { name: "empty line kept", lines: [[{ content: "a" }], [], [{ content: "b" }]], expected: "a\n\nb" },
  ];

  for (const { name, lines, expected } of cases) {
    it(name, () => {
      expect(codeText(lines)).toBe(expected);
    });
  }
});
