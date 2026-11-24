import { describe, expect, it } from "vitest";
import { imageSources, imageVariants, isResizable, variantPath, variantWidths } from "./responsive-image.js";

describe("variantWidths", () => {
  const cases: { original: number; expected: number[] }[] = [
    { original: 600, expected: [600] },
    { original: 800, expected: [800] },
    { original: 1000, expected: [800, 1000] },
    { original: 1200, expected: [800, 1200] },
    { original: 2120, expected: [800, 1200, 2120] },
  ];

  for (const { original, expected } of cases) {
    it(`${original}px`, () => {
      expect(variantWidths(original)).toEqual(expected);
    });
  }
});

describe("isResizable", () => {
  const cases: { src: string; expected: boolean }[] = [
    { src: "/blog-img/frigo/header.png", expected: true },
    { src: "/blog-img/basic-fit/pkce.webp", expected: true },
    { src: "/blog-img/frigo/photo.JPG", expected: true },
    { src: "/blog-img/frigo/header.svg", expected: false },
    { src: "https://example.com/blog-img/a/b.png", expected: false },
    { src: "/cursor/default.png", expected: false },
    { src: "/blog-img/../secret/a.png", expected: false },
  ];

  for (const { src, expected } of cases) {
    it(src, () => {
      expect(isResizable(src)).toBe(expected);
    });
  }
});

describe("variantPath", () => {
  it("sits next to the original", () => {
    expect(variantPath("/blog-img/frigo/header.png", 800, "webp")).toBe("/blog-img/frigo/header-800.webp");
  });

  it("refuses an image without variants", () => {
    expect(() => variantPath("/cursor/default.png", 800, "webp")).toThrow();
  });
});

describe("imageVariants", () => {
  const cases: { name: string; src: string; width: number | string | undefined; paths: string[] }[] = [
    {
      name: "a wide cover",
      src: "/blog-img/frigo/header.png",
      width: 2120,
      paths: [
        "/blog-img/frigo/header-800.avif",
        "/blog-img/frigo/header-1200.avif",
        "/blog-img/frigo/header-2120.avif",
        "/blog-img/frigo/header-800.webp",
        "/blog-img/frigo/header-1200.webp",
        "/blog-img/frigo/header-2120.webp",
      ],
    },
    { name: "a relative width", src: "/blog-img/frigo/header.png", width: "50%", paths: [] },
    { name: "an unknown size", src: "/blog-img/frigo/header.png", width: undefined, paths: [] },
    { name: "a vector image", src: "/blog-img/frigo/header.svg", width: 800, paths: [] },
  ];

  for (const { name, src, width, paths } of cases) {
    it(name, () => {
      expect(imageVariants(src, width).map((variant) => variant.path)).toEqual(paths);
    });
  }
});

describe("imageSources", () => {
  it("offers AVIF then WebP, each with every width", () => {
    expect(imageSources("/blog-img/frigo/handshake.png", 1590)).toEqual([
      {
        type: "image/avif",
        srcset:
          "/blog-img/frigo/handshake-800.avif 800w, /blog-img/frigo/handshake-1200.avif 1200w, /blog-img/frigo/handshake-1590.avif 1590w",
      },
      {
        type: "image/webp",
        srcset:
          "/blog-img/frigo/handshake-800.webp 800w, /blog-img/frigo/handshake-1200.webp 1200w, /blog-img/frigo/handshake-1590.webp 1590w",
      },
    ]);
  });

  it("offers nothing for an image without variants", () => {
    expect(imageSources("https://example.com/a.png", 800)).toEqual([]);
  });
});
