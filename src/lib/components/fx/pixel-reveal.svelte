<script lang="ts">
  import type { Snippet } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { fitCanvas, pixelWipe, token, type PaletteToken, type Point } from "#lib/fx/index.js";

  interface PixelRevealProps {
    children: Snippet;
    cell?: number;
    duration?: number;
    color?: PaletteToken;
    from?: "center" | "top-left" | "random";
    class?: string;
  }

  const {
    children,
    cell = 12,
    duration = 700,
    color = "accent",
    from = "top-left",
    class: className = "",
  }: PixelRevealProps = $props();

  let host: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let covered = $state(true);

  const originFor = (width: number, height: number): Point | undefined => {
    if (from === "center") return { x: width / 2, y: height / 2 };
    if (from === "top-left") return { x: 0, y: 0 };
    return undefined;
  };

  export async function play(): Promise<void> {
    if (prefersReducedMotion.current) {
      covered = false;
      return;
    }
    covered = true;
    await pixelWipe(canvas, {
      mode: "reveal",
      cell,
      duration,
      fps: 18,
      color: token(color),
      origin: originFor(host.clientWidth, host.clientHeight),
    });
    covered = false;
  }

  $effect(() => {
    if (!prefersReducedMotion.current) {
      const { context, width, height } = fitCanvas(canvas);
      context.fillStyle = token(color);
      context.fillRect(0, 0, width, height);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void play();
      },
      { threshold: 0.4 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  });
</script>

<div bind:this={host} class="relative {className}">
  {@render children()}
  <canvas
    bind:this={canvas}
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 h-full w-full {covered ? 'visible' : 'invisible'}"
  ></canvas>
</div>
