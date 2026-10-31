export type Easing = (t: number) => number;

const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

export const linear: Easing = (t) => clamp01(t);

export const easeOutCubic: Easing = (t) => 1 - (1 - clamp01(t)) ** 3;

export const easeInCubic: Easing = (t) => clamp01(t) ** 3;

export const easeOutBack: Easing = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = clamp01(t) - 1;
  return 1 + c3 * x ** 3 + c1 * x ** 2;
};

/**
 * Samples an easing on `count` discrete frames, giving animations a sprite-like cadence
 * while keeping the shape (and overshoot) of the base curve.
 * Compatible with svelte-motion's `ease` option.
 */
export function steps(count: number, base: Easing = linear): Easing {
  const frames = Math.max(1, Math.floor(count));
  return (t) => {
    if (t >= 1) return base(1);
    return base(Math.floor(clamp01(t) * frames) / frames);
  };
}

export const pixelPop: Easing = steps(5, easeOutBack);

export const pixelSlide: Easing = steps(6, easeOutCubic);
