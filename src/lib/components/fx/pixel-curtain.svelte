<script lang="ts">
  import { prefersReducedMotion } from "svelte/motion";
  import { easeOutCubic, pixelWipe, token, type Point } from "#lib/fx/index.js";

  interface PixelCurtainProps {
    cell?: number;
    duration?: number;
  }

  const { cell = 40, duration = 420 }: PixelCurtainProps = $props();

  let canvas: HTMLCanvasElement;
  let active = $state(false);

  const run = async (mode: "cover" | "reveal", origin?: Point): Promise<void> => {
    if (prefersReducedMotion.current) return;
    active = true;
    await pixelWipe(canvas, {
      mode,
      origin,
      cell,
      duration,
      fps: 60,
      ease: easeOutCubic,
      color: token("accent"),
    });
    if (mode === "reveal") active = false;
  };

  export function cover(origin?: Point): Promise<void> {
    return run("cover", origin);
  }

  export function reveal(origin?: Point): Promise<void> {
    return run("reveal", origin);
  }
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-40 h-screen w-screen {active ? 'visible' : 'invisible'}"
></canvas>
