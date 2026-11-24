<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { keepPainted, paintDepotScene, paintedEarly } from "../early/paint.js";
  import { depotSignLabel } from "../scene/depot.js";

  interface Props {
    tracks: number;
    class?: string;
  }

  const { tracks, class: className = "" }: Props = $props();

  const depot: Attachment<HTMLDivElement> = (root) =>
    paintedEarly(root) ? undefined : keepPainted(root, paintDepotScene);

  const sign = [
    "invisible absolute z-2 -translate-x-1/2 whitespace-nowrap",
    "border-2 border-board-edge bg-board px-3 py-1",
    "font-led text-[15px] tracking-[0.18em] text-board-text",
  ].join(" ");

  const weld = [
    "invisible absolute z-1 size-11 -translate-1/2 rounded-full",
    "weld-glow opacity-0 mix-blend-screen animate-weld",
  ].join(" ");

  const rame = "invisible absolute left-0 z-3 h-11 w-64 pixel-render animate-depot-ride";
</script>

<div class="relative overflow-hidden {className}" aria-hidden="true" data-depot {@attach depot}>
  <canvas class="absolute inset-0 size-full scene-sky depot-fade pixel-render" data-depot-scene></canvas>

  <span class={sign} data-depot-sign>{depotSignLabel(tracks)}</span>

  <span class={weld} data-depot-weld></span>

  <canvas class={rame} data-depot-train></canvas>
</div>
