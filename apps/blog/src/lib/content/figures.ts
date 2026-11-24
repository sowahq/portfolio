import type { ContentNode, ImageNode } from "./types.js";

function isBlank(node: ContentNode): boolean {
  return node.kind === "text" && node.value.trim() === "";
}

/**
 * The image of a paragraph that holds nothing else, which is rendered as a captioned figure.
 */
export function figureImage(node: ContentNode): ImageNode | null {
  if (node.kind !== "element" || node.tag !== "p") {
    return null;
  }

  const meaningful = node.children.filter((child) => !isBlank(child));
  const [only] = meaningful;

  return meaningful.length === 1 && only?.kind === "image" ? only : null;
}

function childNodes(node: ContentNode): ContentNode[] {
  if (node.kind === "ref-grid") {
    return node.cards;
  }

  return "children" in node ? node.children : [];
}

function collectFigures(nodes: ContentNode[]): ImageNode[] {
  return nodes.flatMap((node) => {
    const image = figureImage(node);

    return image ? [image] : collectFigures(childNodes(node));
  });
}

/**
 * Every image of an article, figures and inline images alike, in reading order.
 */
export function contentImages(nodes: ContentNode[]): ImageNode[] {
  return nodes.flatMap((node) => (node.kind === "image" ? [node] : contentImages(childNodes(node))));
}

/**
 * Numbers the figures of an article in reading order, starting at 1.
 */
export function numberFigures(nodes: ContentNode[]): Map<ImageNode, number> {
  return new Map(collectFigures(nodes).map((image, index) => [image, index + 1]));
}

/**
 * Formats a figure number on two digits, e.g. "pièce 01".
 */
export function figureLabel(number: number): string {
  return `pièce ${String(number).padStart(2, "0")}`;
}
