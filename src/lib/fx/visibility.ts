import { getTicker, type TickCallback } from "./ticker.js";

/**
 * Runs `onFrame` on the shared ticker only while `element` intersects the viewport.
 * Returns a cleanup function that stops the loop and the observer.
 */
export function animateWhileVisible(element: Element, onFrame: TickCallback): () => void {
  let stop: (() => void) | null = null;
  const pause = (): void => {
    stop?.();
    stop = null;
  };
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) stop ??= getTicker().add(onFrame);
    else pause();
  });
  observer.observe(element);
  return () => {
    pause();
    observer.disconnect();
  };
}
