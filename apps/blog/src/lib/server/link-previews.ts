import { previewFromHtml } from "#lib/content/link-preview.js";
import type { LinkPreview } from "#lib/content/types.js";

const FETCH_TIMEOUT = 6000;

const MAX_BYTES = 512 * 1024;

const MAX_CONCURRENT_REQUESTS = 6;

const USER_AGENT = "Mozilla/5.0 (compatible; blog.mth.lc link preview)";

const previews = new Map<string, Promise<LinkPreview | null>>();

const waiting: (() => void)[] = [];

let running = 0;

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }

  running += 1;

  try {
    return await task();
  } finally {
    running -= 1;
    waiting.shift()?.();
  }
}

async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();

  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let size = 0;

  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    size += value.byteLength;
    chunks.push(decoder.decode(value, { stream: true }));
  }

  await reader.cancel().catch(() => undefined);

  return chunks.join("");
}

async function fetchPreview(url: string): Promise<LinkPreview | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "fr,en;q=0.8",
      },
    });

    const isHtml = (response.headers.get("content-type") ?? "").includes("html");

    if (!response.ok || !isHtml) {
      await response.body?.cancel();
      return null;
    }

    return previewFromHtml(await readCapped(response), url);
  } catch {
    return null;
  }
}

/**
 * Fetches the OpenGraph preview of an external link once per build.
 * Replaces the runtime /api/link-preview endpoint of the Nuxt blog: a failed fetch simply means no preview.
 */
export function loadLinkPreview(url: string): Promise<LinkPreview | null> {
  const cached = previews.get(url);

  if (cached) {
    return cached;
  }

  const pending = withSlot(() => fetchPreview(url));
  previews.set(url, pending);

  return pending;
}
