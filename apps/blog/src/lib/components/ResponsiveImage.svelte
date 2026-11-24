<script lang="ts">
  import { COLUMN_SIZES, imageSources } from "#lib/content/responsive-image.js";

  interface Props {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    sizes?: string;
    priority?: boolean;
    class?: string | (string | false | undefined)[];
  }

  const { src, alt, width, height, sizes = COLUMN_SIZES, priority = false, class: className = "" }: Props = $props();

  const sources = $derived(imageSources(src, width));
</script>

{#snippet image()}
  <img
    {src}
    {alt}
    {width}
    {height}
    loading={priority ? "eager" : "lazy"}
    fetchpriority={priority ? "high" : undefined}
    decoding={priority ? undefined : "async"}
    class={className}
  />
{/snippet}

{#if sources.length > 0}
  <picture class="contents">
    {#each sources as source (source.type)}
      <source type={source.type} srcset={source.srcset} {sizes} />
    {/each}

    {@render image()}
  </picture>
{:else}
  {@render image()}
{/if}
