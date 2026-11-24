import { describe, expect, it } from "vitest";
import { depotHomeCard, ficheCard, profileCard } from "./cards.js";
import { readPngHeader } from "./png-reader.js";
import { pixelAt } from "./raster.js";
import { renderOgPng } from "./render.js";
import { cityBackdrop, depotStrip } from "./scene.js";

describe("scenes", () => {
  it("fades the depot into the paper at the top", () => {
    const { image, placement } = depotStrip(1200, 240);

    expect([image.width, image.height]).toEqual([1200, 240]);
    expect(pixelAt(image, 600, 0)[3]).toBeLessThan(8);
    expect(pixelAt(image, 600, 239)[3]).toBe(255);
    expect(placement.sign.left).toBeGreaterThan(0);
  });

  it("covers the whole card with the city", () => {
    const image = cityBackdrop(1200, 630);

    expect([image.width, image.height]).toEqual([1200, 630]);
    expect(pixelAt(image, 0, 0)[3]).toBe(255);
    expect(pixelAt(image, 1199, 629)[3]).toBe(255);
  });
});

describe("renderOgPng", () => {
  const sign = "ATELIER · VOIES 1–5";

  const cases = [
    {
      name: "a fiche",
      card: ficheCard({
        number: "005",
        date: "20 août 2026",
        title: "L'obfuscation via la virtualisation : comment ça marche ?",
        details: [{ term: "cible", value: "un virtualiseur de code" }],
        host: "blog.mth.lc",
        sign,
      }),
    },
    {
      name: "the blog home",
      card: depotHomeCard({
        sticker: "le blog de mathis",
        title: "le dépôt",
        lead: "Démontages.",
        host: "blog.mth.lc",
        sign,
      }),
    },
    {
      name: "the portfolio",
      card: profileCard({ sticker: "salut, moi c'est", name: "Mathis Lutic", role: "développeur", host: "mth.lc" }),
    },
  ];

  for (const { name, card } of cases) {
    it(`renders ${name} as a 1200x630 PNG`, async () => {
      const png = await renderOgPng(card);
      const header = readPngHeader(png);

      expect([header.width, header.height]).toEqual([1200, 630]);
    }, 30_000);
  }
});
