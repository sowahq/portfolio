<script lang="ts">
  import type { RichText } from "#lib/data/types.js";

  interface Props {
    text: RichText;
  }

  const { text }: Props = $props();
</script>

{#each text as part, index (index)}
  {#if typeof part === "string"}
    {part}
  {:else}
    <mark>{part.mark}</mark>
  {/if}
{/each}
