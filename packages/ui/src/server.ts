import earlyPaintScript from "virtual:mth-early-paint";
import { injectEarlyPaint } from "./early/inject.js";

interface ResolveOptions {
  transformPageChunk?: (input: { html: string; done: boolean }) => string | undefined;
}

interface HandleInput<Event, Rendered> {
  event: Event;
  resolve: (event: Event, options?: ResolveOptions) => Rendered;
}

/**
 * SvelteKit `handle` hook that inlines the early paint script into every rendered page.
 */
export function earlyPaintHandle<Event, Rendered>({ event, resolve }: HandleInput<Event, Rendered>): Rendered {
  return resolve(event, {
    transformPageChunk: ({ html }) => injectEarlyPaint(html, earlyPaintScript),
  });
}
