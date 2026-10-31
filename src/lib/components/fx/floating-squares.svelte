<script lang="ts">
  import { onMount } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { animateWhileVisible, createDrifters, fitCanvas, stepDrifter, tokens, type Drifter, type FittedCanvas } from "#lib/fx/index.js";

  interface FloatingSquaresProps {
    count?: number;
    parallax?: number;
    class?: string;
  }

  const { count = 12, parallax = 24, class: className = "" }: FloatingSquaresProps = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    let fitted: FittedCanvas = fitCanvas(canvas);
    const colors = tokens(["accent-soft", "highlight-strong"]);
    let drifters: Drifter[] = createDrifters(
      fitted.width,
      fitted.height,
      { count, colors, size: [12, 56], speed: [0.004, 0.012], spin: [0.00005, 0.0002] },
      Math.random,
    );
    const target = { x: 0, y: 0 };
    const offset = { x: 0, y: 0 };

    const draw = (): void => {
      const { context, width, height } = fitted;
      context.clearRect(0, 0, width, height);
      context.lineWidth = 2;
      drifters.forEach((drifter) => {
        context.save();
        context.translate(drifter.x + offset.x * drifter.depth, drifter.y + offset.y * drifter.depth);
        context.rotate(drifter.rotation);
        context.strokeStyle = drifter.color;
        context.strokeRect(-drifter.size / 2, -drifter.size / 2, drifter.size, drifter.size);
        context.restore();
      });
    };

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      target.x = (event.clientX / window.innerWidth - 0.5) * -parallax;
      target.y = (event.clientY / window.innerHeight - 0.5) * -parallax;
    };

    const onResize = (): void => {
      const previous = fitted;
      fitted = fitCanvas(canvas);
      drifters = drifters.map((drifter) => ({
        ...drifter,
        x: (drifter.x / previous.width) * fitted.width,
        y: (drifter.y / previous.height) * fitted.height,
      }));
      draw();
    };

    draw();
    window.addEventListener("resize", onResize);
    if (prefersReducedMotion.current) return () => window.removeEventListener("resize", onResize);

    window.addEventListener("pointermove", onMove, { passive: true });
    const stopAnimation = animateWhileVisible(canvas, (_, delta) => {
      const step = Math.min(delta, 48);
      drifters.forEach((drifter) => stepDrifter(drifter, step, fitted.height));
      offset.x += (target.x - offset.x) * 0.05;
      offset.y += (target.y - offset.y) * 0.05;
      draw();
    });

    return () => {
      stopAnimation();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full {className}"
></canvas>
