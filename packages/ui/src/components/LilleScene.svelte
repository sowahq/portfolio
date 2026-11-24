<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { prefersReducedMotion } from "svelte/motion";
  import { keepPainted, paintCityScene, paintedCity, paintedEarly } from "../early/paint.js";
  import { KONAMI, onSequence } from "../fx/sequence.js";
  import { axolotlAt, paintAxolotl } from "../scene/axolotl.js";
  import { flickerWindow, paintCity } from "../scene/lille.js";
  import { SCENE_PIXEL } from "../scene/pixels.js";

  const FLICKER_EVERY_MS = 2600;

  let root: HTMLDivElement | undefined;
  let summoned = false;

  const city: Attachment<HTMLDivElement> = (element) => {
    root = element;
    const stopPainting = paintedEarly(element) ? undefined : keepPainted(element, paintCityScene);

    const flicker = setInterval(() => {
      const painted = paintedCity(element);

      if (painted && !summoned && !prefersReducedMotion.current) {
        flickerWindow(painted.canvas, painted.scene);
      }
    }, FLICKER_EVERY_MS);

    return () => {
      stopPainting?.();
      clearInterval(flicker);
      root = undefined;
    };
  };

  /**
   * The giant axolotl rises from behind the rooftops, cries, then sinks back, and the city is repainted as it was.
   */
  const summon = (): void => {
    const element = root;
    const canvas = element?.querySelector<HTMLCanvasElement>("[data-city-scene]");
    if (!element || !canvas || summoned) return;

    summoned = true;
    const reduced = prefersReducedMotion.current;
    const start = performance.now();

    const frame = (now: number): void => {
      const width = Math.ceil(canvas.clientWidth / SCENE_PIXEL);
      const height = Math.ceil(canvas.clientHeight / SCENE_PIXEL);
      const pose = axolotlAt((now - start) / 1000, width, height, reduced);

      if (!pose) {
        canvas.style.translate = "";
        paintCityScene(element);
        summoned = false;
        return;
      }

      paintCity(canvas, 11, { creature: (paint, ground) => paintAxolotl(paint, pose.x, pose.top, pose.mouth, ground) });
      const dx = pose.shake ? ((Math.floor(now / 40) % 3) - 1) * pose.shake * SCENE_PIXEL : 0;
      canvas.style.translate = dx ? `${dx}px 0` : "";
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };
</script>

<div
  class="pointer-events-none absolute inset-0"
  aria-hidden="true"
  data-city
  {@attach city}
  {@attach onSequence(KONAMI, summon)}
>
  <canvas class="absolute inset-0 size-full pixel-render" data-city-scene></canvas>
  <div class="absolute inset-0 overflow-hidden" data-city-cloud-box>
    <canvas
      class="absolute top-0 left-0 h-full w-[200%] animate-[drift_160s_linear_infinite] pixel-render"
      data-city-clouds
    ></canvas>
  </div>
  <canvas
    class="invisible absolute left-0 z-1 h-11 w-64 animate-[ride_15s_cubic-bezier(0.45,0,0.55,1)_infinite] pixel-render motion-reduce:translate-x-[30vw]"
    data-city-train
  ></canvas>
</div>
