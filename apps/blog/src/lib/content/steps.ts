import type { ContentNode, TocEntry } from "./types.js";

const STEP_NUMBER = /^(\d+)\.\s+/;

const SUBSTEP_NUMBER = /^(\d+(?:\.\d+)+)\.?\s+/;

export interface NumberedHeading {
  number: string | null;
  children: ContentNode[];
}

/**
 * Splits the leading "N. " (depth 1) or "N.M " (depth 2) of a heading from its text,
 * so the number can sit in its own badge. Other headings are returned unchanged.
 */
export function splitStepNumber(children: ContentNode[], depth: number): NumberedHeading {
  const pattern = depth === 1 ? STEP_NUMBER : depth === 2 ? SUBSTEP_NUMBER : null;
  const [first, ...rest] = children;

  if (!pattern || first?.kind !== "text") {
    return { number: null, children };
  }

  const match = pattern.exec(first.value);

  if (!match?.[1]) {
    return { number: null, children };
  }

  const remainder = first.value.slice(match[0].length);
  const head: ContentNode[] = remainder ? [{ kind: "text", value: remainder }] : [];

  return { number: match[1], children: [...head, ...rest] };
}

/**
 * The first-level steps of an article, in reading order.
 */
export function topLevelSteps(toc: TocEntry[]): TocEntry[] {
  return toc.filter((entry) => entry.depth === 1);
}
