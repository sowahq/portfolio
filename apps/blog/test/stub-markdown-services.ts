import type { LinkPreview } from "#lib/content/types.js";
import type { MarkdownServices } from "#lib/server/markdown.js";

/**
 * Test-only markdown services that never touch the network nor the disk.
 * Production wires the real shiki, image-size and link-preview services in src/lib/server/posts.ts.
 */
export function stubMarkdownServices(previews: Record<string, LinkPreview> = {}): MarkdownServices {
  return {
    highlight: async (code) => ({
      background: "var(--color-board)",
      foreground: "var(--color-board-text)",
      lines: code.split("\n").map((line) => [{ content: line }]),
    }),
    linkPreview: async (url) => previews[url] ?? null,
    imageDimensions: async () => ({ width: 800, height: 600 }),
  };
}
