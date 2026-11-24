import type { PostSummary } from "./types.js";

const FICHE_DIGITS = 3;

export type NeighborDirection = "précédente" | "suivante";

export interface FicheNeighbor {
  direction: NeighborDirection;
  post: PostSummary;
}

/**
 * Formats a fiche rank (1 for the oldest post) on three digits, e.g. "005".
 */
export function formatFicheNumber(rank: number): string {
  return String(rank).padStart(FICHE_DIGITS, "0");
}

/**
 * Numbers posts by publication date, oldest first, and returns them newest first.
 * Posts published the same day are ordered by slug so the numbering never moves between builds.
 */
export function numberFiches<T extends { slug: string; publishedAt: string }>(
  posts: T[],
): (T & { ficheNumber: string })[] {
  const oldestFirst = [...posts].sort(
    (left, right) => left.publishedAt.localeCompare(right.publishedAt) || left.slug.localeCompare(right.slug),
  );

  return oldestFirst.map((post, index) => ({ ...post, ficheNumber: formatFicheNumber(index + 1) })).reverse();
}

/**
 * The fiche published just before the given one, or the one just after when it is the oldest.
 * Expects posts newest first.
 */
export function ficheNeighbor(posts: PostSummary[], slug: string): FicheNeighbor | null {
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) {
    return null;
  }

  const older = posts[index + 1];

  if (older) {
    return { direction: "précédente", post: older };
  }

  const newer = posts[index - 1];

  return newer ? { direction: "suivante", post: newer } : null;
}
