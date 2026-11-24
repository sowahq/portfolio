<script lang="ts">
  import type { StackLine } from "#lib/data/types.js";

  interface Props {
    line: StackLine;
  }

  const { line }: Props = $props();

  const track = [
    "relative m-0 flex list-none justify-between p-0",
    "max-lg:flex-wrap max-lg:justify-start max-lg:gap-x-4.5 max-lg:gap-y-2.5",
    "lg:before:absolute lg:before:top-1.75 lg:before:right-0 lg:before:left-0 lg:before:h-1.5 lg:before:bg-(--line)",
    "lg:before:origin-left lg:before:scale-x-0 lg:before:transition-transform lg:before:duration-1100",
    "group-data-revealed:lg:before:scale-x-100 motion-reduce:lg:before:scale-x-100",
  ];

  const station = [
    "relative flex-1 text-sm font-semibold text-ink",
    "lg:pt-6.5 lg:text-center max-lg:flex-none max-lg:pl-5",
    "opacity-0 transition-opacity duration-300 group-data-revealed:opacity-100 motion-reduce:opacity-100",
  ];

  const dot = [
    "metro-stop absolute [--stop-ring:3px]",
    "lg:top-0 lg:left-1/2 lg:-ml-2.5 lg:size-5",
    "max-lg:top-0.75 max-lg:left-0 max-lg:size-3 max-lg:bg-(--line) max-lg:[--stop-ring:2px]",
  ];
</script>

<div
  class="grid grid-cols-[170px_minmax(0,1fr)] items-start gap-5 max-lg:grid-cols-1 max-lg:gap-3"
  style:--line={line.color}
  style:--line-label={line.labelColor}
>
  <span
    class="w-fit self-start bg-(--line) px-2.5 py-0.5 font-pixel text-[15px] font-semibold whitespace-nowrap text-(--line-label)"
  >
    {line.name}
  </span>

  <div class="min-w-0">
    <ol class={track}>
      {#each line.stations as name (name)}
        <li class={station}>
          <span class={dot} aria-hidden="true"></span>
          {name}
        </li>
      {/each}
    </ol>

    <p class="mt-3.5 text-sm text-muted">aussi : {line.more.join(", ")}</p>
  </div>
</div>
