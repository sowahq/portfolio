export { default as Seo } from "./Seo.svelte";
export { OG_IMAGE, ogImage, type SeoImage } from "./image.js";
export { jsonLdDocument, nodeReference, serializeJsonLd, SCHEMA_CONTEXT, type JsonLd } from "./json-ld.js";
export { buildLlmsTxt, textResponse, type LlmsDocument, type LlmsLink, type LlmsSection } from "./llms.js";
export { buildWebManifest, SITE_ICONS, type ManifestIcon, type WebManifest } from "./manifest.js";
export {
  AUTHOR,
  AUTHOR_NAME,
  LANGUAGE,
  OG_LOCALE,
  PERSON_DESCRIPTION,
  PERSON_ID,
  PERSON_JOB_TITLE,
  PORTFOLIO_OG_PATH,
  personJsonLd,
  personSameAs,
} from "./person.js";
export type { SeoArticle, SeoProfile, SeoType } from "./types.js";
export { buildSitemap, escapeXml, xmlResponse, type SitemapEntry } from "./xml.js";
