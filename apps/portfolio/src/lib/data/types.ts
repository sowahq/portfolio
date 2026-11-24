export type { StackLine } from "@mth/ui";

/** Plain text with optional highlighted fragments, rendered without {@html}. */
export type RichText = (string | { mark: string })[];

export interface Mission {
  kind: string;
  title: string;
  description: string;
  from: string;
  to: string;
  tilt: number;
  taped?: boolean;
}

export interface Stop {
  title: string;
  href?: string;
  period: string;
  role: string;
  summary: RichText;
  stack: string[];
  ongoing?: boolean;
  note?: string;
}

export interface OpenSourceStop {
  title: string;
  href?: string;
  period: string;
  role: string;
  summary: string;
  open: boolean;
  badge?: string;
}

export interface Teardown {
  title: string;
  href: string;
  tags: string[];
  target: string;
  tilt: number;
}
