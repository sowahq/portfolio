import type { Element, ElementContent, Properties, Root, RootContent } from "hast";
import type { Image, Root as MdastRoot } from "mdast";
import { toString } from "hast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkMdc from "remark-mdc";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { createHeadingIds } from "#lib/content/heading-id.js";
import { countWords } from "#lib/content/reading-time.js";
import type {
  CellAlign,
  ContentNode,
  HeadingEntry,
  HeadingLevel,
  ImageDimensions,
  LinkPreview,
  ProseTag,
  RefCardNode,
  Tone,
} from "#lib/content/types.js";
import type { HighlightedCode } from "./highlighter.js";

export interface MarkdownServices {
  highlight: (code: string, lang: string) => Promise<HighlightedCode>;
  linkPreview: (url: string) => Promise<LinkPreview | null>;
  imageDimensions: (src: string) => Promise<ImageDimensions | null>;
}

export interface RenderedMarkdown {
  nodes: ContentNode[];
  headings: HeadingEntry[];
  wordCount: number;
}

interface MdcImage extends Image {
  attributes?: Record<string, unknown>;
}

type ParentTag = ProseTag | "root" | "ref-grid" | "ref-card" | "callout";

const PROSE_TAGS: ReadonlySet<string> = new Set<ProseTag>([
  "p",
  "strong",
  "em",
  "del",
  "code",
  "blockquote",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const BLOCK_PARENTS: ReadonlySet<ParentTag> = new Set<ParentTag>([
  "root",
  "blockquote",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "ref-grid",
  "ref-card",
  "callout",
]);

const HEADING_TAG = /^h([1-6])$/;

const EXTERNAL_URL = /^https?:\/\//;

const WARNING_SIGN = "⚠";

const LANGUAGE_PREFIX = "language-";

const TONE_CLASSES: { pattern: RegExp; tone: Tone }[] = [
  { pattern: /^text-red-\d+$/, tone: "danger" },
  { pattern: /^text-(?:emerald|green)-\d+$/, tone: "safe" },
];

function isProseTag(tag: string): tag is ProseTag {
  return PROSE_TAGS.has(tag);
}

function isHeadingLevel(level: number): level is HeadingLevel {
  return Number.isInteger(level) && level >= 1 && level <= 6;
}

function isCellAlign(value: string | undefined): value is CellAlign {
  return value === "left" || value === "center" || value === "right";
}

function stringProperty(properties: Properties, key: string): string | undefined {
  const value = properties[key];

  if (typeof value === "string") {
    return value;
  }

  return typeof value === "number" ? String(value) : undefined;
}

function sizeProperty(properties: Properties, key: string): number | string | undefined {
  const value = properties[key];

  return typeof value === "number" || typeof value === "string" ? value : undefined;
}

function classNames(element: Element): string[] {
  const { className, class: classAttribute } = element.properties;

  if (Array.isArray(className)) {
    return className.map(String);
  }

  return typeof classAttribute === "string" ? classAttribute.split(/\s+/).filter(Boolean) : [];
}

function codeLanguage(code: Element): string {
  const languageClass = classNames(code).find((name) => name.startsWith(LANGUAGE_PREFIX));

  return languageClass ? languageClass.slice(LANGUAGE_PREFIX.length) : "";
}

function toneOf(element: Element): Tone | undefined {
  const classes = classNames(element);

  return TONE_CLASSES.find(({ pattern }) => classes.some((name) => pattern.test(name)))?.tone;
}

function startsWithWarning(element: Element): boolean {
  return toString(element).trimStart().startsWith(WARNING_SIGN);
}

function isIgnorableWhitespace(node: RootContent, parent: ParentTag): boolean {
  if (node.type !== "text" || !BLOCK_PARENTS.has(parent)) {
    return false;
  }

  return node.value.trim() === "" && node.value.includes("\n");
}

function remarkImageAttributes(): (tree: MdastRoot) => void {
  return (tree: MdastRoot): void => {
    visit(tree, "image", (node: MdcImage) => {
      const attributes = Object.entries(node.attributes ?? {}).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      );

      if (attributes.length === 0) {
        return;
      }

      node.data = {
        ...node.data,
        hProperties: { ...node.data?.hProperties, ...Object.fromEntries(attributes) },
      };
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMdc)
  .use(remarkImageAttributes)
  .use(remarkRehype, { allowDangerousHtml: true });

class ContentConverter {
  constructor(private readonly services: MarkdownServices) {}

  async children(nodes: (RootContent | ElementContent)[], parent: ParentTag): Promise<ContentNode[]> {
    const converted = await Promise.all(nodes.map((node) => this.node(node, parent)));

    return converted.flat();
  }

  private async node(node: RootContent, parent: ParentTag): Promise<ContentNode[]> {
    if (isIgnorableWhitespace(node, parent)) {
      return [];
    }

    switch (node.type) {
      case "text":
        return [{ kind: "text", value: node.value }];

      case "element":
        return this.element(node, parent);

      case "comment":
      case "doctype":
        return [];

      case "raw":
        throw new Error(`HTML brut non pris en charge dans un article : ${node.value.slice(0, 80)}`);
    }
  }

  private async element(element: Element, parent: ParentTag): Promise<ContentNode[]> {
    const tag = element.tagName;
    const heading = HEADING_TAG.exec(tag);

    if (heading) {
      return [await this.heading(element, Number(heading[1]))];
    }

    switch (tag) {
      case "a":
        return [await this.link(element)];

      case "img":
        return [await this.image(element)];

      case "pre":
        return [await this.code(element)];

      case "br":
        return [{ kind: "break" }];

      case "hr":
        return [{ kind: "rule" }];

      case "ref-grid":
        return [await this.refGrid(element)];

      case "ref-card":
        return [await this.refCard(element)];

      case "span":
        return [await this.tone(element)];
    }

    if (!isProseTag(tag)) {
      throw new Error(`Élément markdown non pris en charge : <${tag}>`);
    }

    const isWarning = (tag === "p" || tag === "blockquote") && startsWithWarning(element);

    if (isWarning && parent !== "callout") {
      return [await this.callout(element, tag)];
    }

    return [await this.prose(element, tag)];
  }

  private async prose(element: Element, tag: ProseTag): Promise<ContentNode> {
    const align = stringProperty(element.properties, "align");
    const start = element.properties.start;

    return {
      kind: "element",
      tag,
      ...(isCellAlign(align) ? { align } : {}),
      ...(typeof start === "number" ? { start } : {}),
      children: await this.children(element.children, tag),
    };
  }

  private async callout(element: Element, tag: "p" | "blockquote"): Promise<ContentNode> {
    const children =
      tag === "blockquote" ? await this.children(element.children, "callout") : [await this.prose(element, tag)];

    return { kind: "callout", children };
  }

  private async tone(element: Element): Promise<ContentNode> {
    const tone = toneOf(element);

    if (!tone) {
      throw new Error(`Span MDC sans ton reconnu : ${classNames(element).join(" ")}`);
    }

    return { kind: "tone", tone, children: await this.children(element.children, "p") };
  }

  private async heading(element: Element, depth: number): Promise<ContentNode> {
    if (!isHeadingLevel(depth)) {
      throw new Error(`Niveau de titre invalide : ${depth}`);
    }

    const id = stringProperty(element.properties, "id") ?? "";

    return {
      kind: "heading",
      level: depth,
      id,
      children: await this.children(element.children, "p"),
    };
  }

  private async link(element: Element): Promise<ContentNode> {
    const href = stringProperty(element.properties, "href") ?? "";
    const external = EXTERNAL_URL.test(href);
    const preview = external ? await this.services.linkPreview(href) : null;

    return {
      kind: "link",
      href,
      external,
      ...(preview ? { preview } : {}),
      children: await this.children(element.children, "p"),
    };
  }

  private async image(element: Element): Promise<ContentNode> {
    const src = stringProperty(element.properties, "src") ?? "";
    const alt = stringProperty(element.properties, "alt") ?? "";

    const width = sizeProperty(element.properties, "width");
    const height = sizeProperty(element.properties, "height");

    if (typeof width === "string" && width.endsWith("%") && height === undefined) {
      const intrinsic = await this.services.imageDimensions(src);

      return { kind: "image", src, alt, ...intrinsic, displayWidth: width };
    }

    if (width !== undefined || height !== undefined) {
      return {
        kind: "image",
        src,
        alt,
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
      };
    }

    const dimensions = await this.services.imageDimensions(src);

    return { kind: "image", src, alt, ...dimensions };
  }

  private async code(element: Element): Promise<ContentNode> {
    const code = element.children.find(
      (child): child is Element => child.type === "element" && child.tagName === "code",
    );

    if (!code) {
      throw new Error("Bloc <pre> sans <code>");
    }

    const lang = codeLanguage(code);
    const source = toString(code).replace(/\n$/, "");

    return { kind: "code", lang: lang || "text", ...(await this.services.highlight(source, lang)) };
  }

  private async refGrid(element: Element): Promise<ContentNode> {
    const cards = await this.children(element.children, "ref-grid");

    return {
      kind: "ref-grid",
      cards: cards.filter((card): card is RefCardNode => card.kind === "ref-card"),
    };
  }

  private async refCard(element: Element): Promise<RefCardNode> {
    const url = stringProperty(element.properties, "url");
    const title = stringProperty(element.properties, "title");

    if (!url || !title) {
      throw new Error("Composant ref-card sans url ou sans title");
    }

    return {
      kind: "ref-card",
      url,
      title,
      children: await this.children(element.children, "ref-card"),
    };
  }
}

function assignHeadingIds(tree: Root): HeadingEntry[] {
  const headingId = createHeadingIds();
  const headings: HeadingEntry[] = [];

  visit(tree, "element", (element) => {
    const depth = HEADING_TAG.exec(element.tagName)?.[1];

    if (!depth) {
      return;
    }

    const text = toString(element);
    const id = headingId(text);

    element.properties.id = id;
    headings.push({ id, text: text.trim(), depth: Number(depth) });
  });

  return headings;
}

function countTextWords(tree: Root): number {
  const texts: string[] = [];

  visit(tree, "text", (node) => {
    texts.push(node.value);
  });

  return countWords(texts.join(" "));
}

/**
 * Parses an article body (markdown with Nuxt MDC components) into a serializable content tree,
 * with heading ids, highlighted code, link previews and image sizes resolved at build time.
 */
export async function renderMarkdown(markdown: string, services: MarkdownServices): Promise<RenderedMarkdown> {
  const tree = await processor.run(processor.parse(markdown));

  const headings = assignHeadingIds(tree);
  const nodes = await new ContentConverter(services).children(tree.children, "root");

  return {
    nodes,
    headings,
    wordCount: countTextWords(tree),
  };
}
