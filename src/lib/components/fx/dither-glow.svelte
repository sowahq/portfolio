<script lang="ts">
  import { onMount } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { animateWhileVisible, bayerThreshold, blobField, blobPosition, fitCanvas, tokens, type FittedCanvas } from "#lib/fx/index.js";

  interface DitherGlowProps {
    pixel?: number;
    maxFps?: number;
    class?: string;
  }

  const { pixel = 8, maxFps = 30, class: className = "" }: DitherGlowProps = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const colors = tokens(["accent-soft", "highlight", "accent-soft"]);
    const frameMs = 1000 / maxFps;
    let fitted: FittedCanvas = fitCanvas(canvas);
    let elapsed = 0;
    let sinceDraw = frameMs;

    const draw = (): void => {
      const { context, width, height } = fitted;
      context.clearRect(0, 0, width, height);
      const radius = Math.max(width, height) * 0.28;
      const blobs = colors.map((color, index) => ({ ...blobPosition(elapsed, index, width, height), radius, color }));
      const cols = Math.ceil(width / pixel);
      const rows = Math.ceil(height / pixel);
      for (let row = 0; row < rows; row++) {
        const y = row * pixel + pixel / 2;
        for (let col = 0; col < cols; col++) {
          const x = col * pixel + pixel / 2;
          let field = 0;
          let color = "";
          for (const blob of blobs) {
            const value = blobField(x, y, blob);
            if (value > field) {
              field = value;
              color = blob.color;
            }
          }
          if (field * 0.85 <= bayerThreshold(col, row)) continue;
          context.fillStyle = color;
          context.fillRect(col * pixel, row * pixel, pixel, pixel);
        }
      }
    };

    const onResize = (): void => {
      fitted = fitCanvas(canvas);
      draw();
    };

    draw();
    window.addEventListener("resize", onResize);
    const stopAnimation = prefersReducedMotion.current
      ? () => {}
      : animateWhileVisible(canvas, (_, delta) => {
          const step = Math.min(delta, 48);
          elapsed += step;
          sinceDraw += step;
          if (sinceDraw < frameMs) return;
          sinceDraw = Math.min(sinceDraw - frameMs, frameMs);
          draw();
        });

    return () => {
      stopAnimation();
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full {className}"
></canvas>
