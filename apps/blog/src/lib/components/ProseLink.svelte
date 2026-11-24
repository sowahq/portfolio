<script lang="ts">
  import type { Snippet } from "svelte";
  import { linkClasses } from "#lib/content/prose.js";
  import type { LinkPreview as Preview } from "#lib/content/types.js";
  import LinkPreview from "./LinkPreview.svelte";

  interface Props {
    href: string;
    external: boolean;
    preview?: Preview;
    children: Snippet;
  }

  const { href, external, preview, children }: Props = $props();
</script>

{#snippet anchor()}
  {#if external}
    <a {href} target="_blank" rel="noopener noreferrer" class={linkClasses}>{@render children()}</a>
  {:else}
    <a {href} class={linkClasses}>{@render children()}</a>
  {/if}
{/snippet}

{#if preview}
  <LinkPreview {preview}>{@render anchor()}</LinkPreview>
{:else}
  {@render anchor()}
{/if}
