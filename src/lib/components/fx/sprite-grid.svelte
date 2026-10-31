<script lang="ts">
  import { onMount } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { animateWhileVisible, cellAt, fitCanvas, GlowGrid, pick, token, tokens, type FittedCanvas, type GridCell } from "#lib/fx/index.js";

  interface SpriteGridProps {
    cell?: number;
    fadeMs?: number;
    ambientMs?: number;
    class?: string;
  }

  const { cell = 24, fadeMs = 1100, ambientMs = 420, class: className = "" }: SpriteGridProps = $props();

  const NEIGHBOURS: readonly GridCell[] = [
    { col: -1, row: 0 },
    { col: 1, row: 0 },
    { col: 0, row: -1 },
    { col: 0, row: 1 },
  ];

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const dotColor = token("accent-soft");
    const glowColors = tokens(["accent-soft", "highlight"]);
    const glow = new GlowGrid(fadeMs);
    const dots = document.createElement("canvas");
    let fitted: FittedCanvas = fitCanvas(canvas);
    let cols = 0;
    let rows = 0;
    let sinceAmbient = 0;

    const paintDots = (): void => {
      const ratio = window.devicePixelRatio || 1;
      cols = Math.ceil(fitted.width / cell);
      rows = Math.ceil(fitted.height / cell);
      dots.width = canvas.width;
      dots.height = canvas.height;
      const context = dots.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = dotColor;
      Array.from({ length: (cols + 1) * (rows + 1) }).forEach((_, index) => {
        const x = (index % (cols + 1)) * cell;
        const y = Math.floor(index / (cols + 1)) * cell;
        context.fillRect(x - 1, y - 1, 2, 2);
      });
    };

    const draw = (): void => {
      const { context, width, height } = fitted;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      context.drawImage(dots, 0, 0, width, height);
      glow.entries().forEach((lit) => {
        context.globalAlpha = lit.intensity * 0.5;
        context.fillStyle = lit.color;
        context.fillRect(lit.col * cell + 2, lit.row * cell + 2, cell - 4, cell - 4);
      });
      context.globalAlpha = 1;
    };

    const lightAround = (target: GridCell): void => {
      glow.light(target, pick(Math.random, glowColors));
      const offset = pick(Math.random, NEIGHBOURS);
      const neighbour = { col: target.col + offset.col, row: target.row + offset.row };
      if (neighbour.col >= 0 && neighbour.row >= 0 && neighbour.col < cols && neighbour.row < rows) {
        glow.light(neighbour, pick(Math.random, glowColors), 0.45);
      }
    };

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const target = cellAt(event.clientX - rect.left, event.clientY - rect.top, cell, cols, rows);
      if (target) lightAround(target);
    };

    const frame = (_: number, delta: number): void => {
      const step = Math.min(delta, 48);
      sinceAmbient += step;
      if (sinceAmbient >= ambientMs) {
        sinceAmbient = 0;
        glow.light(
          { col: Math.floor(Math.random() * cols), row: Math.floor(Math.random() * rows) },
          pick(Math.random, glowColors),
          0.6,
        );
      }
      glow.update(step);
      draw();
    };

    const onResize = (): void => {
      fitted = fitCanvas(canvas);
      paintDots();
      draw();
    };

    paintDots();
    draw();
    window.addEventListener("resize", onResize);
    if (prefersReducedMotion.current) return () => window.removeEventListener("resize", onResize);

    const stopAnimation = animateWhileVisible(canvas, frame);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      stopAnimation();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full {className}"
></canvas>
