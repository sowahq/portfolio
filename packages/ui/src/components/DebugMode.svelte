<script lang="ts">
  import { KONAMI, onSequence } from "../fx/sequence.js";

  let enabled = $state(false);

  $effect(() => {
    if (enabled) document.documentElement.dataset.debug = "";
    else delete document.documentElement.dataset.debug;
    return () => {
      delete document.documentElement.dataset.debug;
    };
  });

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") enabled = false;
  };
</script>

<svelte:window onkeydown={onKeydown} />

<div class="contents" {@attach onSequence(KONAMI, () => (enabled = !enabled))}></div>

{#if enabled}
  <div
    class="fixed bottom-4 left-4 z-50 bg-board px-3 py-2 font-led text-xs text-board-text shadow-ink outline-2 outline-highlight"
    role="status"
  >
    mode debug · contours affichés · Échap pour quitter
  </div>
{/if}
