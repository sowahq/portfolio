<script lang="ts">
  import { sites } from "@mth/ui";
  import { pageWrap, pixelLink } from "#lib/ui/classes.js";

  interface Props {
    back?: boolean;
  }

  const { back = false }: Props = $props();
</script>

<div class="{pageWrap} flex items-center justify-between gap-4 py-5.5">
  {#if back}
    <a class={pixelLink} href="/">← le dépôt</a>
  {:else}
    <span class={pixelLink}>le dépôt · blog</span>
  {/if}

  <a class={pixelLink} href={sites.portfolio}>mth.lc ↗</a>
</div>
