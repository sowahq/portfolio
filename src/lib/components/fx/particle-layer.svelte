<script lang="ts">
  import { onMount } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { fitCanvas, getTicker, ParticleSystem, tokens, type FittedCanvas } from "#lib/fx/index.js";

  interface ParticleLayerProps {
    trail?: boolean;
    burst?: boolean;
  }

  const { trail = true, burst = true }: ParticleLayerProps = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    if (prefersReducedMotion.current) return;

    const system = new ParticleSystem({ pixel: 1, sizeSteps: 0, max: 400 });
    const trailColors = tokens(["highlight", "accent-soft"]);
    const burstColors = tokens(["accent", "highlight-strong", "highlight"]);
    const ticker = getTicker();
    let fitted: FittedCanvas = fitCanvas(canvas);
    let stop: (() => void) | null = null;
    let lastX = 0;
    let lastY = 0;

    const wake = (): void => {
      stop ??= ticker.add((_, delta) => {
        system.update(Math.min(delta, 48));
        fitted.context.clearRect(0, 0, fitted.width, fitted.height);
        system.draw(fitted.context);
        if (!system.alive) {
          stop?.();
          stop = null;
        }
      });
    };

    const onMove = (event: PointerEvent): void => {
      if (!trail || event.pointerType !== "mouse") return;
      if (Math.hypot(event.clientX - lastX, event.clientY - lastY) < 14) return;
      lastX = event.clientX;
      lastY = event.clientY;
      system.emit(event.clientX, event.clientY, {
        count: 1,
        colors: trailColors,
        speed: [0.01, 0.05],
        life: [280, 520],
        size: [4, 8],
      });
      wake();
    };

    const onDown = (event: PointerEvent): void => {
      if (!burst) return;
      system.emit(event.clientX, event.clientY, {
        count: 18,
        colors: burstColors,
        speed: [0.15, 0.45],
        life: [380, 700],
        size: [4, 12],
        angle: -Math.PI / 2,
        spread: Math.PI * 1.2,
      });
      wake();
    };

    const onResize = (): void => {
      fitted = fitCanvas(canvas);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      stop?.();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-50 h-screen w-screen"
></canvas>
