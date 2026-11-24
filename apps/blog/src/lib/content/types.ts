import type { Workshop } from "./workshops.js";

export interface LinkPreview {
  url: string;
  host: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
  children: TocEntry[];
}

export interface HeadingEntry {
  id: string;
  text: string;
  depth: number;
}

export type ProseTag =
  | "p"
  | "strong"
  | "em"
  | "del"
  | "code"
  | "blockquote"
  | "ul"
  | "ol"
  | "li"
  | "table"
  | "thead"
  | "tbody"
  | "tr"
  | "th"
  | "td";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type CellAlign = "left" | "center" | "right";

export interface TextNode {
  kind: "text";
  value: string;
}

export interface BreakNode {
  kind: "break";
}

export interface RuleNode {
  kind: "rule";
}

export interface ElementNode {
  kind: "element";
  tag: ProseTag;
  align?: CellAlign;
  start?: number;
  children: ContentNode[];
}

export interface HeadingNode {
  kind: "heading";
  level: HeadingLevel;
  id: string;
  children: ContentNode[];
}

export interface LinkNode {
  kind: "link";
  href: string;
  external: boolean;
  preview?: LinkPreview;
  children: ContentNode[];
}

export interface ImageNode {
  kind: "image";
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  /** Width the article asks for, relative to the column, e.g. "50%". */
  displayWidth?: string;
}

export interface CodeToken {
  content: string;
  color?: string;
  fontStyle?: number;
}

export interface CodeBlockNode {
  kind: "code";
  lang: string;
  background: string;
  foreground: string;
  lines: CodeToken[][];
}

export interface RefCardNode {
  kind: "ref-card";
  url: string;
  title: string;
  children: ContentNode[];
}

export interface RefGridNode {
  kind: "ref-grid";
  cards: RefCardNode[];
}

export type Tone = "danger" | "safe";

export interface ToneNode {
  kind: "tone";
  tone: Tone;
  children: ContentNode[];
}

export interface CalloutNode {
  kind: "callout";
  children: ContentNode[];
}

export type ContentNode =
  | TextNode
  | BreakNode
  | RuleNode
  | ElementNode
  | HeadingNode
  | LinkNode
  | ImageNode
  | CodeBlockNode
  | RefGridNode
  | RefCardNode
  | CalloutNode
  | ToneNode;

export interface PostMeta {
  slug: string;
  title: string;
  /** Title for search results and shares when it differs from the displayed one. */
  seoTitle?: string;
  description: string;
  publishedAt: string;
  image: string;
  tags: string[];
  target: string;
  protocol?: string;
  tools: string[];
  workshops: Workshop[];
  shortLabel: string;
}

export interface PostSummary extends PostMeta {
  wordCount: number;
  readingMinutes: number;
  ficheNumber: string;
}

export interface Post extends PostSummary {
  cover: ImageNode;
  body: ContentNode[];
  toc: TocEntry[];
}
