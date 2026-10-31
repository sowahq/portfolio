import { easeOutBack, easeOutCubic } from "./easing.js";

/**
 * svelte-motion props for a rise-in when the element enters the viewport.
 * Spread them on a motion component: `<motion.div {...riseIn(index)}>`.
 */
export function riseIn(index = 0, distance = 24) {
  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.5, delay: index * 0.07, ease: easeOutCubic },
  };
}

/**
 * svelte-motion props for a pop (scale with a slight overshoot).
 */
export function popIn(index = 0) {
  return {
    initial: { opacity: 0, scale: 0.4 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, amount: 0.5 },
    transition: { duration: 0.45, delay: index * 0.05, ease: easeOutBack },
  };
}

/**
 * svelte-motion props for a slide from the left, used for timeline entries.
 */
export function slideIn(index = 0, distance = 24) {
  return {
    initial: { opacity: 0, x: -distance },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.5, delay: index * 0.08, ease: easeOutCubic },
  };
}
