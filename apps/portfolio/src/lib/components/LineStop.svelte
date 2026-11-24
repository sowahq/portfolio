<script lang="ts">
  import type { Stop } from "#lib/data/types.js";
  import RichText from "./RichText.svelte";

  interface Props {
    stop: Stop;
    side: "left" | "right";
    tilt: number;
  }

  const { stop, side, tilt }: Props = $props();

  const placement = $derived(side === "left" ? "lg:col-start-1" : "lg:col-start-2 lg:mt-30");

  const dot = $derived([
    "metro-stop absolute top-7 size-5.5 [--stop-ring:5px] transition-[background,scale] duration-250",
    "group-hover:scale-125 group-hover:bg-highlight",
    "max-lg:-left-[43px]",
    side === "left" ? "lg:-right-[59px]" : "lg:-left-[59px]",
    stop.ongoing ? "bg-highlight" : "",
  ]);
</script>

<article class="group relative min-w-0 {placement}">
  {#if stop.note}
    <span
      class={[
        "font-pixel text-[15px] font-semibold tracking-[-0.03em] text-violet lg:whitespace-nowrap",
        "max-lg:mb-1.5 max-lg:block lg:absolute lg:-top-7.5",
        side === "left" ? "lg:right-0" : "lg:left-0",
      ]}
      aria-hidden="true"
    >
      {stop.note}
    </span>
  {/if}

  <div class="relative">
    <span class={dot} aria-hidden="true"></span>

    <div
      class="paper-card p-6 transition-[transform,box-shadow] duration-250 group-hover:-translate-y-0.75 group-hover:!rotate-0"
      style:rotate="{tilt}deg"
    >
      <span class="font-pixel text-sm font-semibold tracking-[-0.02em] text-violet">{stop.period}</span>

      <h3 class="mt-1 mb-1.5 text-[clamp(25px,2.4vw,31px)] leading-none">
        {#if stop.href}
          <a
            href={stop.href}
            class="bg-[linear-gradient(var(--color-ink),var(--color-ink))] bg-[length:0_3px] bg-left-bottom bg-no-repeat no-underline transition-[background-size] duration-300 hover:bg-[length:100%_3px]"
          >
            {stop.title}
          </a>
        {:else}
          {stop.title}
        {/if}
      </h3>

      <span class="mb-3 block text-[17px] font-semibold text-muted">{stop.role}</span>

      <p class="mb-3.5 text-base"><RichText text={stop.summary} /></p>

      <ul class="flex flex-wrap gap-x-3 gap-y-1.5 text-[13px] font-semibold text-ink">
        {#each stop.stack as tech (tech)}
          <li class="flex items-center gap-1.5">
            <span class="metro-stop size-2.5 [--stop-ring:2px]" aria-hidden="true"></span>
            {tech}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</article>
