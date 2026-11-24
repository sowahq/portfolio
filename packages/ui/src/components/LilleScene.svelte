<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { prefersReducedMotion } from "svelte/motion";
  import { keepPainted, paintCityScene, paintedCity, paintedEarly } from "../early/paint.js";
  import { flickerWindow } from "../scene/lille.js";

  const FLICKER_EVERY_MS = 2600;

  const city: Attachment<HTMLDivElement> = (root) => {
    const stopPainting = paintedEarly(root) ? undefined : keepPainted(root, paintCityScene);

    const flicker = setInterval(() => {
      const painted = paintedCity(root);

      if (painted && !prefersReducedMotion.current) {
        flickerWindow(painted.canvas, painted.scene);
      }
    }, FLICKER_EVERY_MS);

    return () => {
      stopPainting?.();
      clearInterval(flicker);
    };
  };
</script>

<div class="pointer-events-none absolute inset-0" aria-hidden="true" data-city {@attach city}>
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
