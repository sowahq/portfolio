import { depotSignLabel } from "@mth/ui";
import type { FicheCard } from "@mth/ui/og";
import { SITE } from "#lib/site.js";
import { formatPostDate } from "./dates.js";
import { readingLabel } from "./reading-time.js";
import type { PostSummary } from "./types.js";

/**
 * What the Open Graph card of a fiche shows, the same facts as the fiche header.
 */
export function ficheCardData(post: PostSummary, tracks: number): FicheCard {
  return {
    number: post.ficheNumber,
    date: formatPostDate(post.publishedAt),
    title: post.title,
    details: [
      { term: "cible", value: post.target },
      { term: "durée", value: readingLabel(post.readingMinutes) },
    ],
    host: SITE.host,
    sign: depotSignLabel(tracks),
  };
}
