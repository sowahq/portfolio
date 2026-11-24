import { profileLinks } from "../profile.js";
import { productionSites } from "../sites.js";
import { stackTechnologies } from "../stack.js";
import type { JsonLd } from "./json-ld.js";
import type { SeoProfile } from "./types.js";

export const AUTHOR: SeoProfile = { firstName: "Mathis", lastName: "Lutic" };

export const AUTHOR_NAME = `${AUTHOR.firstName} ${AUTHOR.lastName}`;

export const PERSON_ID = `${productionSites.portfolio}/#person`;

export const LANGUAGE = "fr-FR";

export const OG_LOCALE = "fr_FR";

export const PORTFOLIO_OG_PATH = "/og.png";

export const PERSON_JOB_TITLE = "Développeur full-stack freelance";

/**
 * How the author presents himself, also the meta description of the portfolio.
 */
export const PERSON_DESCRIPTION =
  "Développeur full-stack freelance à Lille : applications web et mobiles sur mesure, reprises de projets et audits pour les PME, les start-ups et les associations.";

const PERSON_SKILLS = ["Reverse engineering", "Sécurité logicielle"];

/**
 * The profiles that identify the same person elsewhere: GitHub and LinkedIn.
 */
export const personSameAs: readonly string[] = [profileLinks.github, profileLinks.linkedin];

/**
 * The full Person node, the same on both sites. Carries the public contact address, never a phone number.
 */
export function personJsonLd(): JsonLd {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR_NAME,
    url: `${productionSites.portfolio}/`,
    email: profileLinks.email,
    jobTitle: PERSON_JOB_TITLE,
    description: PERSON_DESCRIPTION,
    image: `${productionSites.portfolio}${PORTFOLIO_OG_PATH}`,
    address: { "@type": "PostalAddress", addressLocality: "Lille", addressCountry: "FR" },
    knowsLanguage: ["fr", "en"],
    sameAs: [...personSameAs],
    knowsAbout: [...stackTechnologies(), ...PERSON_SKILLS],
  };
}
