<script lang="ts">
  import type { Snippet } from "svelte";

  interface ButtonProps {
    children: Snippet;
    href?: string | null;
    onclick?: (event: MouseEvent) => void;
    class?: string | null;
  }

  const { children, href, onclick, class: className }: ButtonProps = $props();

  const classes = $derived(
    `bg-purple-500 text-white shadow-purple-500 px-4 py-2 shadow-pixel-art text-center flex items-center gap-2 transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0.5 ${className ?? ""}`,
  );
</script>

{#if href}
  <a {href} target="_blank" rel="noopener noreferrer" class={classes}>
    {@render children()}
  </a>
{:else if onclick}
  <button type="button" {onclick} class={classes}>
    {@render children()}
  </button>
{:else}
  <h3 class={classes}>
    {@render children()}
  </h3>
{/if}
