export interface LlmsLink {
  title: string;
  url?: string;
  description?: string;
}

export interface LlmsSection {
  title: string;
  links: LlmsLink[];
}

export interface LlmsDocument {
  title: string;
  summary: string;
  details?: string[];
  sections: LlmsSection[];
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function markdownLinkText(text: string): string {
  return oneLine(text).replace(/[[\]]/g, "\\$&");
}

function linkLine({ title, url, description }: LlmsLink): string {
  const label = url ? `[${markdownLinkText(title)}](${url})` : oneLine(title);
  const item = `- ${label}`;

  return description ? `${item}: ${oneLine(description)}` : item;
}

/**
 * Renders an llms.txt file (llmstxt.org): a title, a quoted summary, optional notes, then sections of links.
 */
export function buildLlmsTxt({ title, summary, details = [], sections }: LlmsDocument): string {
  const blocks = [
    `# ${oneLine(title)}`,
    `> ${oneLine(summary)}`,
    ...details.map(oneLine),
    ...sections
      .filter((section) => section.links.length > 0)
      .map((section) => [`## ${oneLine(section.title)}`, "", ...section.links.map(linkLine)].join("\n")),
  ];

  return `${blocks.join("\n\n")}\n`;
}

/**
 * Response of a prerendered plain-text file.
 */
export function textResponse(body: string, type = "text/plain"): Response {
  return new Response(body, { headers: { "content-type": `${type}; charset=utf-8` } });
}
