<script lang="ts">
  import type { Snippet } from "svelte";
  import Handles from "./Handles.svelte";

  interface Props {
    children: Snippet;
    tilt?: number;
    class?: string;
  }

  const { children, tilt = -4, class: className = "" }: Props = $props();
</script>

<span
  class="handles inline-flex items-center bg-highlight px-4 py-1.5 font-pixel text-xl font-semibold tracking-[-0.03em] text-ink {className}"
  style:rotate="{tilt}deg"
>
  <Handles />
  {@render children()}
</span>
