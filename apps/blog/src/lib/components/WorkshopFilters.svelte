<script lang="ts">
  import { WORKSHOPS, type Workshop } from "#lib/content/workshops.js";

  type Filter = Workshop | "tout";

  interface Props {
    value: Filter;
  }

  let { value = $bindable() }: Props = $props();

  const options: Filter[] = ["tout", ...WORKSHOPS];

  const button = [
    "border-2 border-ink px-3.5 py-1.75 font-pixel text-[14px] font-semibold",
    "transition-[background-color,color,translate] duration-200 hover:-translate-y-0.5",
    "max-sm:px-2.75 max-sm:py-1.5 max-sm:text-[13px]",
  ].join(" ");
</script>

<div class="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par atelier">
  {#each options as option (option)}
    <button
      type="button"
      class={[button, value === option ? "bg-ink text-highlight" : "bg-card text-ink"]}
      aria-pressed={value === option}
      onclick={() => (value = option)}
    >
      {option}
    </button>
  {/each}
</div>
