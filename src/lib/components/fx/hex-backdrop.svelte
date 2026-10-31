<script lang="ts">
  import { prefersReducedMotion } from "svelte/motion";
  import { encode, fitCanvas, getTicker, hexRows, token, type FittedCanvas, type HexRow } from "#lib/fx/index.js";

  interface HexBackdropProps {
    text: string;
    rowMs?: number;
    tile?: boolean;
    class?: string;
  }

  const { text, rowMs = 900, tile = false, class: className = "" }: HexBackdropProps = $props();

  const LINE_HEIGHT = 18;
  const FONT_SIZE = 12;
  const BYTES_PER_ROW = 16;
  const BLOCK_GAP_CHARS = 4;
  const BLOCK_ROW_OFFSET = 7;

  let canvas: HTMLCanvasElement;

  const rows = $derived(hexRows(encode(text), BYTES_PER_ROW));

  interface Layout {
    byteX: (index: number) => number;
    asciiX: number;
    blockWidth: number;
  }

  const layoutFor = (context: CanvasRenderingContext2D): Layout => {
    const charWidth = context.measureText("0").width;
    const offsetWidth = charWidth * 10;
    const byteX = (index: number): number => offsetWidth + index * charWidth * 3 + (index >= 8 ? charWidth : 0);
    const asciiX = byteX(BYTES_PER_ROW) + charWidth * 2;
    return { byteX, asciiX, blockWidth: asciiX + charWidth * (BYTES_PER_ROW + BLOCK_GAP_CHARS) };
  };

  $effect(() => {
    const source = rows;
    if (source.length === 0) return;

    const fontFamily = getComputedStyle(canvas).fontFamily;
    const colors = {
      ink: token("accent-soft"),
      strong: token("accent"),
      highlight: token("highlight"),
    };
    let fitted: FittedCanvas = fitCanvas(canvas);
    let pointer: { x: number; y: number } | null = null;
    let position = 0;
    let visible = false;
    let stop: (() => void) | null = null;

    const drawRow = (row: HexRow, x: number, y: number, hot: boolean, layout: Layout): void => {
      const { context } = fitted;
      if (hot) {
        context.fillStyle = colors.highlight;
        const rowWidth = layout.asciiX + context.measureText(row.ascii).width;
        context.fillRect(x, y - LINE_HEIGHT + 4, rowWidth, LINE_HEIGHT);
      }
      context.fillStyle = hot ? colors.strong : colors.ink;
      context.fillText(row.offset, x, y);
      row.bytes.forEach((byte, index) => context.fillText(byte, x + layout.byteX(index), y));
      context.fillText(row.ascii, x + layout.asciiX, y);
    };

    const draw = (): void => {
      const { context, width, height } = fitted;
      context.clearRect(0, 0, width, height);
      context.font = `${FONT_SIZE}px ${fontFamily}`;
      context.textBaseline = "alphabetic";
      const layout = layoutFor(context);
      const visibleRows = Math.ceil(height / LINE_HEIGHT) + 2;
      const first = Math.floor(position);
      const shift = (position - first) * LINE_HEIGHT;
      const blocks = tile ? Math.ceil(width / layout.blockWidth) : 1;
      const hotLine = !tile && pointer ? Math.floor((pointer.y + shift) / LINE_HEIGHT) : -1;
      Array.from({ length: blocks }).forEach((_, block) => {
        Array.from({ length: visibleRows }).forEach((_, line) => {
          const row = source[(line + first + block * BLOCK_ROW_OFFSET) % source.length];
          if (row) drawRow(row, block * layout.blockWidth, (line + 1) * LINE_HEIGHT - shift, line === hotLine, layout);
        });
      });
    };

    const start = (): void => {
      if (prefersReducedMotion.current) {
        draw();
        return;
      }
      stop ??= getTicker().add((_, delta) => {
        position = (position + Math.min(delta, 48) / rowMs) % source.length;
        draw();
      });
    };

    const pause = (): void => {
      stop?.();
      stop = null;
    };

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      pointer = inside ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : null;
      if (prefersReducedMotion.current && visible) draw();
    };

    const onResize = (): void => {
      fitted = fitCanvas(canvas);
      draw();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
      else pause();
    });
    observer.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    draw();

    return () => {
      pause();
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none absolute inset-0 h-full w-full font-mono {className}"
></canvas>
