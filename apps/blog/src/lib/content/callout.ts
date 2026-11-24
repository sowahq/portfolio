import type { ContentNode } from "./types.js";

const LEADING_WARNING = /^\s*⚠\u{FE0F}?\s*/u;

const TRAILING_WARNING = /\s*⚠\u{FE0F}?\s*$/u;

type Edge = "start" | "end";

function trimEdge(nodes: ContentNode[], edge: Edge): ContentNode[] {
  const index = edge === "start" ? 0 : nodes.length - 1;
  const node = nodes[index];

  if (!node) {
    return nodes;
  }

  let trimmed: ContentNode = node;

  if (node.kind === "text") {
    trimmed = { ...node, value: node.value.replace(edge === "start" ? LEADING_WARNING : TRAILING_WARNING, "") };
  } else if (node.kind === "element") {
    trimmed = { ...node, children: trimEdge(node.children, edge) };
  }

  return nodes.with(index, trimmed);
}

/**
 * Removes the warning signs that open and close a callout, the "consigne de sécurité" label replacing them.
 */
export function withoutWarningSigns(children: ContentNode[]): ContentNode[] {
  return trimEdge(trimEdge(children, "start"), "end");
}
