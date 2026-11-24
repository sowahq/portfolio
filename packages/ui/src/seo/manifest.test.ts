import { describe, expect, it } from "vitest";
import { buildWebManifest, SITE_ICONS } from "./manifest.js";

describe("buildWebManifest", () => {
  const manifest = JSON.parse(
    buildWebManifest({
      name: "le dépôt · Mathis Lutic",
      shortName: "le dépôt",
      description: "Des démontages.",
      themeColor: "#f6f1fd",
      backgroundColor: "#f6f1fd",
      lang: "fr-FR",
    }),
  );

  const cases: { field: string; expected: unknown }[] = [
    { field: "name", expected: "le dépôt · Mathis Lutic" },
    { field: "short_name", expected: "le dépôt" },
    { field: "start_url", expected: "/" },
    { field: "theme_color", expected: "#f6f1fd" },
    { field: "background_color", expected: "#f6f1fd" },
    { field: "lang", expected: "fr-FR" },
    { field: "icons", expected: [SITE_ICONS.svg, SITE_ICONS.appleTouch] },
  ];

  for (const { field, expected } of cases) {
    it(field, () => {
      expect(manifest[field]).toEqual(expected);
    });
  }
});
