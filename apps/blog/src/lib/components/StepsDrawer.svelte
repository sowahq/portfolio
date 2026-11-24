<script lang="ts">
  import type { TocEntry } from "#lib/content/types.js";

  interface Props {
    steps: TocEntry[];
  }

  const { steps }: Props = $props();

  const summary = [
    "list-none px-4 py-3 font-pixel text-[15px] font-semibold text-ink",
    "[&::-webkit-details-marker]:hidden",
  ].join(" ");

  const list = "m-0 list-none border-t-2 border-dashed border-grid pt-1 pr-4 pb-3.5 pl-9";
</script>

{#if steps.length > 0}
  <details class="group -mt-4 mb-7 border-2 border-ink bg-card split:hidden">
    <summary class={summary}>
      étapes de l'intervention <span class="text-violet group-open:hidden">↓</span><span
        class="hidden text-violet group-open:inline"
      >
        ↑
      </span>
    </summary>

    <ol class={list}>
      {#each steps as step (step.id)}
        <li class="my-2">
          <a href="#{step.id}" class="text-[15px] text-text no-underline">{step.text}</a>
        </li>
      {/each}
    </ol>
  </details>
{/if}
