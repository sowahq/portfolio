<script lang="ts">
  import PixelCurtain from "./pixel-curtain.svelte";
  import { KONAMI, onSequence } from "#lib/fx/index.js";

  let curtain: ReturnType<typeof PixelCurtain>;
  let enabled = $state(false);

  const toggle = async (): Promise<void> => {
    const origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    await curtain.cover(origin);
    enabled = !enabled;
    await curtain.reveal(origin);
  };

  $effect(() => {
    if (enabled) document.documentElement.dataset.debug = "";
    else delete document.documentElement.dataset.debug;
    return () => {
      delete document.documentElement.dataset.debug;
    };
  });

  const onEscape = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && enabled) void toggle();
  };
</script>

<svelte:window onkeydown={onEscape} />

<div class="contents" {@attach onSequence(KONAMI, toggle)}></div>
<PixelCurtain bind:this={curtain} cell={32} />

{#if enabled}
  <div
    class="fixed bottom-4 left-4 z-50 border-2 border-yellow-300 bg-purple-950 px-3 py-2 font-mono text-xs text-yellow-300 shadow-pixel-sm shadow-yellow-300"
    role="status"
  >
    DEBUG MODE · layout outlines on · ESC pour quitter
  </div>
{/if}
