import type { Attachment } from "svelte/attachments";
import { prefersReducedMotion } from "svelte/motion";
import { quantizeTime } from "./quantize.js";
import { pick, type Random } from "./random.js";
import { getTicker, type Ticker } from "./ticker.js";

export const HEX_CHARSET = "0123456789ABCDEF";
export const GLYPH_CHARSET = "!<>-_\\/[]{}=+*^?#░▒▓";

/**
 * Text at a given progress: characters lock in from left to right, the rest is noise.
 * Whitespace is always preserved so the layout does not jump.
 */
export function scrambleFrame(
  target: string,
  progress: number,
  random: Random,
  charset: string = HEX_CHARSET,
): string {
  const chars = [...target];
  const revealed = Math.floor(Math.min(1, Math.max(0, progress)) * chars.length);
  return chars
    .map((char, index) => {
      if (index < revealed || /\s/.test(char)) return char;
      return pick(random, [...charset]);
    })
    .join("");
}

export type ScrambleTrigger = "mount" | "view" | "hover";

export interface ScrambleOptions {
  trigger?: ScrambleTrigger;
  duration?: number;
  fps?: number;
  delay?: number;
  charset?: string;
  random?: Random;
  ticker?: Ticker;
}

/**
 * Decodes an element's text like a hex dump resolving into readable bytes.
 */
export function scramble(options: ScrambleOptions = {}): Attachment<HTMLElement> {
  const {
    trigger = "view",
    duration = 900,
    fps = 20,
    delay = 0,
    charset = HEX_CHARSET,
    random = Math.random,
    ticker = getTicker(),
  } = options;

  return (element) => {
    const original = element.textContent ?? "";
    let stop: (() => void) | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const play = (): void => {
      stop?.();
      if (prefersReducedMotion.current) {
        element.textContent = original;
        return;
      }
      let start = -1;
      stop = ticker.add((time) => {
        if (start < 0) start = time;
        const progress = quantizeTime(time - start, fps) / duration;
        element.textContent = scrambleFrame(original, progress, random, charset);
        if (progress >= 1) {
          element.textContent = original;
          stop?.();
          stop = null;
        }
      });
    };

    const schedule = (): void => {
      clearTimeout(timeout);
      timeout = setTimeout(play, delay);
    };

    let observer: IntersectionObserver | undefined;
    if (trigger === "mount") {
      if (!prefersReducedMotion.current) element.textContent = scrambleFrame(original, 0, random, charset);
      schedule();
    }
    if (trigger === "hover") element.addEventListener("pointerenter", play);
    if (trigger === "view") {
      element.textContent = scrambleFrame(original, 0, random, charset);
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer?.disconnect();
          schedule();
        },
        { threshold: 0.6 },
      );
      observer.observe(element);
    }

    return () => {
      clearTimeout(timeout);
      stop?.();
      observer?.disconnect();
      element.removeEventListener("pointerenter", play);
      element.textContent = original;
    };
  };
}
