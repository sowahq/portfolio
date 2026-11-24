<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { readFraction, remainingLabel, remainingMinutes, routePosition } from "#lib/content/route.js";
  import type { TocEntry } from "#lib/content/types.js";

  interface Props {
    steps: TocEntry[];
    minutes: number;
    prose: HTMLElement | undefined;
  }

  const { steps, minutes, prose }: Props = $props();

  const READING_LINE = 0.3;
  const RAME_LIFT_PX = 4;

  let current = $state(0);
  let offset = $state(0);
  let lastStop = $state(0);
  let remaining = $derived(minutes);

  const doneHeight = $derived(Math.min(lastStop, Math.max(0, offset)));

  const atTerminus = $derived(remaining === 0 || current === steps.length - 1);

  const label = $derived(remainingLabel(remaining, atTerminus));

  const follow: Attachment<HTMLElement> = (rail) => {
    const headings = steps.map((step) => document.getElementById(step.id));
    let frame = 0;

    const update = (): void => {
      const readingLine = window.innerHeight * READING_LINE;
      const headingTops = headings.map((heading) =>
        heading ? heading.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY,
      );
      const stops = rail.querySelectorAll<HTMLLIElement>("li[data-stop]");
      const stopTops = Array.from(stops, (stop) => stop.offsetTop);
      const position = routePosition(window.scrollY + readingLine, headingTops, stopTops);

      current = position.current;
      offset = position.offset;
      lastStop = stopTops.at(-1) ?? 0;

      if (prose) {
        const box = prose.getBoundingClientRect();

        remaining = remainingMinutes(minutes, readFraction(readingLine, box.top, box.height));
      }
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

  const railClasses = "sticky top-7 max-h-[calc(100vh-56px)] self-start overflow-y-auto max-split:hidden";

  const line = "absolute top-2 left-2 w-1";

  const doneLine = `${line} bg-violet transition-[height] duration-150 ease-linear`;

  const rame = "absolute top-0 left-0.5 z-2 h-6.5 w-4 rame transition-transform duration-150 ease-linear";

  const stop = [
    "relative mb-3.5",
    "before:absolute before:top-0.75 before:-left-6.75 before:size-4 before:border-3",
    "before:transition-colors before:duration-250",
  ].join(" ");

  const stopLink = [
    "block font-pixel text-[14px] leading-[1.35] font-semibold no-underline",
    "transition-colors duration-250 hover:text-violet",
  ].join(" ");

  function stopState(index: number): string {
    if (index < current) {
      return "before:border-violet before:bg-violet";
    }

    return index === current ? "before:border-violet before:bg-highlight" : "before:border-lavender before:bg-card";
  }
</script>

{#if steps.length > 0}
  <aside class={railClasses} aria-label="Étapes de l'intervention" {@attach follow}>
    <p class="mb-4.5 font-pixel text-[18px] font-bold tracking-[-0.04em] text-ink">étapes</p>

    <div class="relative pl-7.5">
      <span class="{line} bg-grid" style:height="{lastStop}px"></span>
      <span class={doneLine} style:height="{doneHeight}px"></span>
      <span class={rame} style:transform="translateY({offset - RAME_LIFT_PX}px)" aria-hidden="true"></span>

      <ol class="m-0 list-none p-0">
        {#each steps as step, index (step.id)}
          <li class="{stop} {stopState(index)}" data-stop>
            <a
              href="#{step.id}"
              class={[stopLink, index <= current ? "text-ink" : "text-muted"]}
              aria-current={index === current ? "step" : undefined}
            >
              {step.text}
            </a>
          </li>
        {/each}
      </ol>
    </div>

    <p
      class={["mt-4.5 font-led text-[14px] transition-colors duration-250", atTerminus ? "text-violet" : "text-muted"]}
    >
      {label}
    </p>
  </aside>
{/if}
