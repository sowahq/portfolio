import { describe, expect, it } from "vitest";
import { developmentSites, productionSites, resolveSites, type SiteOverrides, type Sites } from "./sites.js";

describe("resolveSites", () => {
  const cases: { name: string; development: boolean; overrides?: SiteOverrides; expected: Sites }[] = [
    { name: "development points at the local servers", development: true, expected: developmentSites },
    { name: "a build points at the real domains", development: false, expected: productionSites },
    {
      name: "an override wins over the mode",
      development: false,
      overrides: { blog: "https://staging-blog.example.dev" },
      expected: { portfolio: "https://mth.lc", blog: "https://staging-blog.example.dev" },
    },
    {
      name: "trailing slashes and spaces are dropped",
      development: true,
      overrides: { portfolio: " http://localhost:4173/ " },
      expected: { portfolio: "http://localhost:4173", blog: "http://localhost:5174" },
    },
    {
      name: "an empty override is ignored",
      development: false,
      overrides: { portfolio: "", blog: "   " },
      expected: productionSites,
    },
  ];

  for (const { name, development, overrides, expected } of cases) {
    it(name, () => {
      expect(resolveSites(development, overrides)).toEqual(expected);
    });
  }
});
