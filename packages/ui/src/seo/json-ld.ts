export type JsonLd = { "@context"?: string; "@type": string | string[] } & Record<string, unknown>;

export const SCHEMA_CONTEXT = "https://schema.org";

const SCRIPT_UNSAFE = /[<>&\u{2028}\u{2029}]/gu;

function unicodeEscape(character: string): string {
  const code = character.codePointAt(0) ?? 0;

  return `\\u${code.toString(16).padStart(4, "0")}`;
}

function withoutContext(node: JsonLd): Record<string, unknown> {
  return Object.fromEntries(Object.entries(node).filter(([key]) => key !== "@context"));
}

/**
 * Wraps structured data in a single document: one node gets the schema.org context, several go in an @graph.
 */
export function jsonLdDocument(data: JsonLd | JsonLd[]): Record<string, unknown> {
  if (Array.isArray(data)) {
    return { "@context": SCHEMA_CONTEXT, "@graph": data.map(withoutContext) };
  }

  return { "@context": SCHEMA_CONTEXT, ...withoutContext(data) };
}

/**
 * Serializes structured data so it can sit inside a script tag without closing it or being re-escaped.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(jsonLdDocument(data)).replace(SCRIPT_UNSAFE, unicodeEscape);
}

/**
 * A reference to a node described elsewhere, by its @id.
 */
export function nodeReference(id: string): { "@id": string } {
  return { "@id": id };
}
