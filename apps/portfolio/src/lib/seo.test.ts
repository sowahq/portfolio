import { describe, expect, it } from "vitest";
import { personJsonLd } from "@mth/ui/seo";
import { stack } from "#lib/data/stack.js";
import {
  PAGE,
  mainTechnologies,
  missionLink,
  portfolioJsonLd,
  portfolioLlmsTxt,
  portfolioOgImage,
  portfolioSitemap,
} from "./seo.js";

describe("page metadata", () => {
  const cases: { name: string; value: string; expected: string }[] = [
    { name: "title", value: PAGE.title, expected: "Mathis Lutic · développeur freelance à Lille" },
    { name: "canonical", value: PAGE.url, expected: "https://mth.lc/" },
    { name: "host", value: PAGE.host, expected: "mth.lc" },
  ];

  for (const { name, value, expected } of cases) {
    it(name, () => {
      expect(value).toBe(expected);
    });
  }

  it("keeps the description short enough for result snippets", () => {
    expect(PAGE.description.length).toBeLessThanOrEqual(165);
  });

  it("points the Open Graph image at the generated card", () => {
    expect(portfolioOgImage()).toMatchObject({
      url: "https://mth.lc/og.png",
      width: 1200,
      height: 630,
      type: "image/png",
    });
  });
});

const BUILT_AT = "2026-11-24T10:30:00.000Z";

describe("portfolioJsonLd", () => {
  const [person, website, profilePage] = portfolioJsonLd(BUILT_AT);

  const cases: { name: string; node: Record<string, unknown> | undefined; expected: Record<string, unknown> }[] = [
    {
      name: "the Person",
      node: person,
      expected: personJsonLd(),
    },
    {
      name: "the WebSite",
      node: website,
      expected: {
        "@type": "WebSite",
        url: "https://mth.lc/",
        inLanguage: "fr-FR",
        publisher: { "@id": "https://mth.lc/#person" },
      },
    },
    {
      name: "the ProfilePage",
      node: profilePage,
      expected: {
        "@type": "ProfilePage",
        dateCreated: BUILT_AT,
        dateModified: BUILT_AT,
        isPartOf: { "@id": "https://mth.lc/#website" },
        mainEntity: { "@id": "https://mth.lc/#person" },
      },
    },
  ];

  for (const { name, node, expected } of cases) {
    it(name, () => {
      expect(node).toMatchObject(expected);
    });
  }

  it("never publishes a phone number", () => {
    expect(JSON.stringify(portfolioJsonLd())).not.toMatch(/telephone/i);
  });

  it("describes the Person with the meta description of the page", () => {
    expect(person?.description).toBe(PAGE.description);
  });

  it("names the technologies of the stack map", () => {
    expect(person?.knowsAbout).toEqual(expect.arrayContaining(mainTechnologies()));
    expect(mainTechnologies()).toHaveLength(stack.reduce((total, line) => total + line.stations.length, 0));
  });
});

describe("discovery files", () => {
  it("lists the home page in the sitemap, last changed on the build day", () => {
    expect(portfolioSitemap(BUILT_AT)).toEqual([{ url: "https://mth.lc/", lastModified: "2026-11-24" }]);
  });

  const fragments = [
    "# Mathis Lutic\n",
    `> ${PAGE.description}`,
    "## Liens",
    "- [Blog, le dépôt](https://blog.mth.lc/)",
    "- [Contact](mailto:contact@mth.lc)",
    "## Services\n\n- une application sur mesure: Vous avez une idée",
    "## Missions\n\n- [Fondation CGénial](https://cgenial-connect.fr): développeur full-stack & consultant tech · freelance, 2026",
    "- Start-up logistique: CTO & développeur · freelance, 2025 – 2026",
    "- [compress.lol](https://compress.lol): créateur, 2025",
  ];

  for (const fragment of fragments) {
    it(`llms.txt contains ${fragment.slice(0, 30)}`, () => {
      expect(portfolioLlmsTxt()).toContain(fragment);
    });
  }
});

describe("missionLink", () => {
  const cases: { name: string; stop: Parameters<typeof missionLink>[0]; expected: ReturnType<typeof missionLink> }[] = [
    {
      name: "a mission with a site is linked",
      stop: {
        title: "OnGameCloud",
        href: "https://ongamecloud.com",
        period: "2024",
        role: "cofondateur",
        summary: [],
        stack: [],
      },
      expected: { title: "OnGameCloud", url: "https://ongamecloud.com", description: "cofondateur, 2024" },
    },
    {
      name: "a mission without a site is plain text",
      stop: { title: "Goscord", period: "2020 – 2024", role: "mainteneur principal", summary: "", open: false },
      expected: { title: "Goscord", description: "mainteneur principal, 2020 – 2024" },
    },
  ];

  for (const { name, stop, expected } of cases) {
    it(name, () => {
      expect(missionLink(stop)).toEqual(expected);
    });
  }
});
