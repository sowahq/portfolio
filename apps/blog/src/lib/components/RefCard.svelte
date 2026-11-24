<script lang="ts">
  import type { Snippet } from "svelte";
  import { displayHost } from "#lib/content/link-preview.js";
  import type { ContentNode, RefCardNode } from "#lib/content/types.js";

  interface Props {
    card: RefCardNode;
    content: Snippet<[ContentNode[]]>;
  }

  const { card, content }: Props = $props();

  const internal = $derived(card.url.startsWith("/"));
  const source = $derived(internal ? "sur ce blog" : displayHost(card.url) || card.url);

  const cardClasses = [
    "grid gap-1 border-2 border-ink bg-card px-4 py-3.5",
    "text-[15.5px] leading-[1.5] text-text no-underline",
    "transition-[translate,box-shadow] duration-200",
    "hover:-translate-0.5 hover:shadow-ink",
  ].join(" ");
</script>

{#snippet body()}
  <small class="font-led text-[13px] text-muted">{source}</small>

  <b class="font-pixel text-[15px] font-semibold text-ink">{card.title}</b>

  {#if card.children.length > 0}
    <span class="[&_p]:m-0">{@render content(card.children)}</span>
  {/if}
{/snippet}

{#if internal}
  <a href={card.url} class={cardClasses}>{@render body()}</a>
{:else}
  <a href={card.url} target="_blank" rel="noopener noreferrer" class={cardClasses}>{@render body()}</a>
{/if}
