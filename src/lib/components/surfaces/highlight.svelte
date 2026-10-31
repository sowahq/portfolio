<script lang="ts">
  import type { Snippet } from "svelte";

  interface HighlightProps {
    children: Snippet;
  }

  const { children }: HighlightProps = $props();
</script>

<span class="bg-gradient-to-b from-transparent from-55% to-yellow-300 to-55% px-0.5 text-purple-700">
  {@render children()}
</span>
