import { describe, expect, it } from "vitest";
import { decodeEntities, displayHost, extractMeta, previewFromHtml } from "./link-preview.js";
import type { LinkPreview } from "./types.js";

describe("decodeEntities", () => {
  const cases: { input: string; expected: string }[] = [
    { input: "Tom &amp; Jerry", expected: "Tom & Jerry" },
    { input: "&lt;b&gt;", expected: "<b>" },
    { input: "l&#39;app", expected: "l'app" },
    { input: "l&#x27;app", expected: "l'app" },
    { input: "&unknown;", expected: "&unknown;" },
  ];

  for (const { input, expected } of cases) {
    it(input, () => {
      expect(decodeEntities(input)).toBe(expected);
    });
  }
});

describe("displayHost", () => {
  const cases: { url: string; expected: string }[] = [
    { url: "https://www.oreans.com/Themida.php", expected: "oreans.com" },
    { url: "https://github.com/skylot/jadx", expected: "github.com" },
    { url: "pas une url", expected: "" },
  ];

  for (const { url, expected } of cases) {
    it(url, () => {
      expect(displayHost(url)).toBe(expected);
    });
  }
});

describe("extractMeta", () => {
  it("keeps the first value of each key and reads the title", () => {
    const html = [
      "<title>\n  Frida  </title>",
      '<meta property="og:title" content="Frida &amp; co">',
      '<meta property="og:title" content="ignored">',
      "<meta name='description' content='Dynamic instrumentation'>",
    ].join("");

    expect(extractMeta(html)).toEqual({
      "og:title": "Frida & co",
      description: "Dynamic instrumentation",
      title: "Frida",
    });
  });
});

describe("previewFromHtml", () => {
  const url = "https://www.example.com/page";

  const cases: { name: string; html: string; expected: LinkPreview | null }[] = [
    {
      name: "open graph wins",
      html: '<title>T</title><meta property="og:title" content="OG"><meta property="og:description" content="D"><meta property="og:image" content="/img.png">',
      expected: { url, host: "example.com", title: "OG", description: "D", image: "https://www.example.com/img.png" },
    },
    {
      name: "falls back to title and description",
      html: '<title>T</title><meta name="description" content="D">',
      expected: { url, host: "example.com", title: "T", description: "D" },
    },
    { name: "nothing useful", html: "<p>rien</p>", expected: null },
  ];

  for (const { name, html, expected } of cases) {
    it(name, () => {
      expect(previewFromHtml(html, url)).toEqual(expected);
    });
  }
});
