<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { readFraction } from "#lib/content/route.js";

  interface Props {
    prose: HTMLElement | undefined;
  }

  const { prose }: Props = $props();

  const READING_LINE = 0.5;

  let read = $state(0);

  const follow: Attachment<HTMLElement> = () => {
    let frame = 0;

    const update = (): void => {
      if (!prose) {
        return;
      }

      const box = prose.getBoundingClientRect();

      read = readFraction(window.innerHeight * READING_LINE, box.top, box.height);
    };

    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  };
</script>

<div class="fixed inset-x-0 top-0 z-10 h-1 bg-grid split:hidden" aria-hidden="true" {@attach follow}>
  <span class="block size-full origin-left bg-violet" style:transform="scaleX({read})"></span>
</div>
