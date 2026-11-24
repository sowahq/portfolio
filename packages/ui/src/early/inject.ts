const MARKER = /(<span data-early-paint[^>]*>)(<\/span>)/;

/**
 * Puts the early paint script inside its marker span, so Svelte still finds the span it rendered when it hydrates.
 */
export function injectEarlyPaint(html: string, code: string): string {
  const script = `<script>${code.replaceAll("</script", "<\\/script")}</script>`;

  return html.replace(MARKER, (_, open: string, close: string) => `${open}${script}${close}`);
}
