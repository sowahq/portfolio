<script lang="ts">
  import Handles from "./Handles.svelte";

  interface Props {
    id: string;
    number: string;
    title: string;
    kicker?: string;
    tilt?: number;
  }

  const { id, number, title, kicker, tilt = -2 }: Props = $props();

  const badge = ["handles inline-flex items-center gap-3", "bg-highlight py-2 pr-5 pl-2"].join(" ");

  const numberBadge = [
    "grid size-10 shrink-0 place-items-center",
    "bg-ink font-pixel text-2xl leading-none font-semibold text-highlight pixel-corners-4",
  ].join(" ");

  const titleText = "text-[clamp(30px,3.6vw,46px)] leading-none lowercase monocraft-center";

  const kickerText = [
    "pl-3 font-led text-[clamp(15px,1.3vw,17px)] font-normal tracking-[0.08em] text-muted lowercase",
    "before:mr-2 before:text-violet before:content-['↳']",
  ].join(" ");
</script>

<h2 {id} class="inline-grid justify-items-start gap-4.5">
  <span class={badge} style:rotate="{tilt}deg">
    <Handles />

    <span class={numberBadge} aria-hidden="true">
      <span class="monocraft-center">{number}</span>
    </span>

    <span class={titleText}>{title}</span>
  </span>

  {#if kicker}
    <span class={kickerText}>{kicker}</span>
  {/if}
</h2>
