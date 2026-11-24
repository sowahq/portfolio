import { describe, expect, it } from "vitest";
import { jsonLdDocument, nodeReference, serializeJsonLd, type JsonLd } from "./json-ld.js";

describe("serializeJsonLd", () => {
  const cases: { name: string; value: string; forbidden: string }[] = [
    { name: "closing script tag", value: "</script><script>alert(1)</script>", forbidden: "</script" },
    { name: "html comment", value: "<!-- x -->", forbidden: "<!--" },
    { name: "ampersand", value: "a & b", forbidden: "&" },
    { name: "line separator", value: "a\u{2028}b", forbidden: "\u{2028}" },
  ];

  for (const { name, value, forbidden } of cases) {
    it(`neutralizes ${name}`, () => {
      const serialized = serializeJsonLd({ "@type": "Thing", name: value });

      expect(serialized).not.toContain(forbidden);
      expect(JSON.parse(serialized)).toEqual({ "@context": "https://schema.org", "@type": "Thing", name: value });
    });
  }
});

describe("jsonLdDocument", () => {
  const thing: JsonLd = { "@context": "https://example.org", "@type": "Thing", name: "a" };
  const other: JsonLd = { "@type": "Person", "@id": "https://mth.lc/#person" };

  const cases: { name: string; input: JsonLd | JsonLd[]; expected: Record<string, unknown> }[] = [
    {
      name: "one node gets the schema.org context",
      input: thing,
      expected: { "@context": "https://schema.org", "@type": "Thing", name: "a" },
    },
    {
      name: "several nodes go in a graph without their own context",
      input: [thing, other],
      expected: {
        "@context": "https://schema.org",
        "@graph": [{ "@type": "Thing", name: "a" }, other],
      },
    },
  ];

  for (const { name, input, expected } of cases) {
    it(name, () => {
      expect(jsonLdDocument(input)).toEqual(expected);
    });
  }
});

describe("nodeReference", () => {
  it("points at a node by id", () => {
    expect(nodeReference("https://mth.lc/#person")).toEqual({ "@id": "https://mth.lc/#person" });
  });
});
