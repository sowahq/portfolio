<script lang="ts">
  import { onMount } from "svelte";
  import { parisTime } from "../clock.js";
  import type { Departure } from "../types.js";
  import BoardFrame from "./BoardFrame.svelte";

  interface Props {
    departures: Departure[];
    class?: string;
  }

  const { departures, class: className = "" }: Props = $props();

  let time = $state(typeof window === "undefined" ? "--:--" : parisTime());

  onMount(() => {
    const tick = (): void => {
      time = parisTime();
    };

    tick();
    const timer = setInterval(tick, 15_000);

    return () => clearInterval(timer);
  });

  const board = [
    "z-2 min-w-0 rotate-[1.5deg] max-lg:rotate-[0.8deg]",
    "px-4.5 pt-4 pb-3",
    "max-lg:before:hidden max-lg:after:hidden",
  ].join(" ");

  const row = [
    "group -mx-2.5 grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1",
    "border-b border-board-line px-3 py-2 max-lg:py-1.5",
    "text-board-text no-underline transition-colors",
    "hover:bg-board-line focus-visible:bg-board-line",
  ].join(" ");
</script>

<BoardFrame tag="nav" label="Plan du site" class="{board} {className}">
  <div class="mb-1 flex justify-between border-b-2 border-dashed border-board-edge pb-2 text-xs text-lavender">
    <span>prochains départs</span>
    <span class="tabular-nums" aria-hidden="true" data-paris-clock>{time}</span>
  </div>

  {#each departures as departure (departure.href)}
    <a href={departure.href} class={row}>
      <b
        class="grid size-6 place-items-center bg-highlight text-sm text-board pixel-corners-3 max-lg:size-5 max-lg:text-xs"
        aria-hidden="true"
      >
        {departure.code}
      </b>

      <span class="truncate text-[17px] group-hover:animate-[blink_0.8s_ease-in-out_2] max-lg:text-base">
        {departure.label}
      </span>

      <span class="text-xl text-highlight transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>

      <span class={["col-span-2 col-start-2 text-xs", departure.terminus ? "text-highlight" : "text-signal"]}>
        {departure.hint}
      </span>
    </a>
  {/each}
</BoardFrame>
