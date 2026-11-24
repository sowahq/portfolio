export type SeoType = "website" | "article" | "profile";

export interface SeoArticle {
  /** ISO date. */
  publishedTime: string;
  /** ISO date, the publication date when the page never changed. */
  modifiedTime?: string;
  tags: string[];
  section?: string;
}

export interface SeoProfile {
  firstName: string;
  lastName: string;
}
