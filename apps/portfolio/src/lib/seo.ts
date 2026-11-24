import { productionSites, profileLinks, stackTechnologies } from "@mth/ui";
import {
  AUTHOR_NAME,
  LANGUAGE,
  PERSON_DESCRIPTION,
  PERSON_ID,
  PORTFOLIO_OG_PATH,
  buildLlmsTxt,
  nodeReference,
  ogImage,
  personJsonLd,
  type JsonLd,
  type LlmsLink,
  type SeoImage,
  type SitemapEntry,
} from "@mth/ui/seo";
import { BUILT_AT, isoDay } from "#lib/build.js";
import { openSource, stops } from "#lib/data/line.js";
import { missions } from "#lib/data/missions.js";
import type { OpenSourceStop, Stop } from "#lib/data/types.js";

const ORIGIN = productionSites.portfolio;

export const PAGE = {
  title: `${AUTHOR_NAME} · développeur freelance à Lille`,
  description: PERSON_DESCRIPTION,
  url: `${ORIGIN}/`,
  siteName: AUTHOR_NAME,
  host: new URL(ORIGIN).host,
  sticker: "salut, moi c'est",
  role: "développeur freelance à Lille",
} as const;

export const OG_PATH = PORTFOLIO_OG_PATH;

const WEBSITE_ID = `${ORIGIN}/#website`;

const PAGE_ID = `${ORIGIN}/#webpage`;

/**
 * The generated Open Graph image of the portfolio.
 */
export function portfolioOgImage(): SeoImage {
  return ogImage(
    `${ORIGIN}${OG_PATH}`,
    `${AUTHOR_NAME}, ${PAGE.role}, devant les toits de Lille, le beffroi et le VAL en pixel art`,
  );
}

/**
 * The technologies on the main lines of the stack map, the ones worth naming in structured data.
 */
export function mainTechnologies(): string[] {
  return stackTechnologies();
}

/**
 * Structured data of the portfolio: the Person, the WebSite and the ProfilePage linking them by @id.
 * The page dates are the build time, the last moment its content changed.
 */
export function portfolioJsonLd(builtAt: string = BUILT_AT): JsonLd[] {
  const image = portfolioOgImage();

  return [
    personJsonLd(),
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: AUTHOR_NAME,
      url: PAGE.url,
      inLanguage: LANGUAGE,
      publisher: nodeReference(PERSON_ID),
    },
    {
      "@type": "ProfilePage",
      "@id": PAGE_ID,
      url: PAGE.url,
      name: PAGE.title,
      description: PAGE.description,
      inLanguage: LANGUAGE,
      dateCreated: builtAt,
      dateModified: builtAt,
      isPartOf: nodeReference(WEBSITE_ID),
      about: nodeReference(PERSON_ID),
      mainEntity: nodeReference(PERSON_ID),
      primaryImageOfPage: { "@type": "ImageObject", url: image.url, width: image.width, height: image.height },
    },
  ];
}

/**
 * Sitemap entries of the portfolio, a single page last changed at build time.
 */
export function portfolioSitemap(builtAt: string = BUILT_AT): SitemapEntry[] {
  return [{ url: PAGE.url, lastModified: isoDay(builtAt) }];
}

/**
 * One mission of the line as an llms.txt entry: its name, linked when it has a site, its role and its years.
 */
export function missionLink({ title, href, role, period }: Stop | OpenSourceStop): LlmsLink {
  return { title, ...(href ? { url: href } : {}), description: `${role}, ${period}` };
}

/**
 * The llms.txt of the portfolio, written from the same data as the page.
 */
export function portfolioLlmsTxt(): string {
  return buildLlmsTxt({
    title: AUTHOR_NAME,
    summary: PAGE.description,
    details: [`Technologies principales : ${mainTechnologies().join(", ")}.`],
    sections: [
      {
        title: "Services",
        links: missions.map((mission) => ({ title: mission.title, description: mission.description })),
      },
      {
        title: "Missions",
        links: [...stops, ...openSource].map(missionLink),
      },
      {
        title: "Liens",
        links: [
          { title: "Portfolio", url: PAGE.url, description: "Missions, projets livrés, stack et contact." },
          {
            title: "Blog, le dépôt",
            url: `${productionSites.blog}/`,
            description: "Fiches de reverse engineering et de démontage.",
          },
          { title: "Contact", url: `mailto:${profileLinks.email}` },
        ],
      },
      {
        title: "Optional",
        links: [
          { title: "GitHub", url: profileLinks.github },
          { title: "LinkedIn", url: profileLinks.linkedin },
        ],
      },
    ],
  });
}
