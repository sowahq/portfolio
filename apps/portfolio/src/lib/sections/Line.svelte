<script lang="ts">
  import LineStop from "#lib/components/LineStop.svelte";
  import OpenSourceStop from "#lib/components/OpenSourceStop.svelte";
  import Section from "#lib/components/Section.svelte";
  import { lineLead, openSource, stops } from "#lib/data/line.js";

  const STOP_TILTS = [-1, 1.2, -0.8, 0.6];

  const mainLine = [
    "relative grid gap-y-7 pt-2 pb-6 lg:grid-cols-2 lg:gap-x-24",
    "max-lg:pl-11",
    "before:absolute before:top-0 before:bottom-0 before:w-2.5 before:bg-violet",
    "before:left-3 lg:before:left-1/2 lg:before:-ml-1.25",
  ];

  const branchLine = [
    "relative grid list-none gap-4.5 pt-[34px] lg:grid-cols-5",
    "max-lg:gap-4 max-lg:pt-0 max-lg:pl-11",
    "before:absolute before:bg-coral",
    "lg:before:top-2.25 lg:before:right-0 lg:before:left-0 lg:before:h-2.5",
    "max-lg:before:top-0 max-lg:before:bottom-0 max-lg:before:left-1.75 max-lg:before:w-2.5",
  ];
</script>

<Section id="ligne" number="2" title="la ligne" kicker="mes projets" tilt={2}>
  {#snippet lead()}{lineLead}{/snippet}

  <div class={mainLine}>
    {#each stops as stop, index (stop.title)}
      <LineStop {stop} side={index % 2 === 0 ? "left" : "right"} tilt={STOP_TILTS[index % STOP_TILTS.length]} />
    {/each}
  </div>

  <div class="relative pt-28 max-lg:pt-38">
    <div
      class="absolute top-0 left-1/2 -ml-1.25 h-31 w-2.5 bg-[linear-gradient(var(--color-violet)_0_22%,var(--color-coral)_50%)] max-lg:left-3 max-lg:h-38"
      aria-hidden="true"
    >
      <span
        class="metro-stop absolute top-7.5 left-1/2 -ml-3.5 size-7 shadow-[0_0_0_5px_var(--color-ink),0_0_0_9px_var(--color-coral)]"
      ></span>
      <span
        class="absolute top-8 left-8.5 font-pixel text-[15px] font-semibold tracking-[-0.03em] whitespace-nowrap text-[#c4614f]"
      >
        correspondance ↓ ligne 2
      </span>
    </div>

    <h3 class="absolute top-9.5 left-0 text-2xl lowercase max-lg:top-24 max-lg:left-11">ligne 2 · open source</h3>

    <ol class={branchLine}>
      {#each openSource as stop, index (stop.title)}
        <OpenSourceStop {stop} tilt={index % 2 === 0 ? -0.8 : 0.7} />
      {/each}
    </ol>
  </div>
</Section>
