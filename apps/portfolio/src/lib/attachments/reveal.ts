import type { Attachment } from "svelte/attachments";

/**
 * Marks the element with `data-revealed` the first time it scrolls into view, so CSS can play its entrance once.
 */
export function reveal(threshold = 0.15): Attachment<HTMLElement> {
  return (element) => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.dataset.revealed = "";
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  };
}
