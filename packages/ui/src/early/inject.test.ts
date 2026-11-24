import { describe, expect, it } from "vitest";
import { injectEarlyPaint } from "./inject.js";

describe("injectEarlyPaint", () => {
  const cases: { name: string; html: string; code: string; expected: string }[] = [
    {
      name: "fills the marker",
      html: '<header><span data-early-paint="" hidden=""></span></header>',
      code: "paint()",
      expected: '<header><span data-early-paint="" hidden=""><script>paint()</script></span></header>',
    },
    {
      name: "leaves a page without marker untouched",
      html: "<main></main>",
      code: "paint()",
      expected: "<main></main>",
    },
    {
      name: "escapes a closing script tag in the code",
      html: "<span data-early-paint></span>",
      code: 'a("</script>")',
      expected: '<span data-early-paint><script>a("<\\/script>")</script></span>',
    },
    {
      name: "keeps replacement patterns in the code literal",
      html: "<span data-early-paint></span>",
      code: "s.replace(/x/, '$&')",
      expected: "<span data-early-paint><script>s.replace(/x/, '$&')</script></span>",
    },
  ];

  for (const { name, html, code, expected } of cases) {
    it(name, () => {
      expect(injectEarlyPaint(html, code)).toBe(expected);
    });
  }
});
