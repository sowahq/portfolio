<script lang="ts">
  import { onMount } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { animateWhileVisible } from "#lib/fx/index.js";
  import HexBackdrop from "./hex-backdrop.svelte";

  interface HexFlashlightProps {
    text: string;
    idleMs?: number;
    class?: string;
  }

  const { text, idleMs = 2500, class: className = "" }: HexFlashlightProps = $props();

  let host: HTMLDivElement;
  let spot = $state({ x: -400, y: -400 });

  onMount(() => {
    const target = { x: host.clientWidth / 2, y: host.clientHeight / 2 };
    let elapsed = 0;
    let lastPointer = -Infinity;

    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      lastPointer = elapsed;
    };

    if (prefersReducedMotion.current) {
      spot = { ...target };
      return;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    const stopAnimation = animateWhileVisible(host, (_, delta) => {
      elapsed += Math.min(delta, 48);
      if (elapsed - lastPointer > idleMs) {
        target.x = host.clientWidth * (0.5 + 0.35 * Math.sin(elapsed * 0.0004));
        target.y = host.clientHeight * (0.5 + 0.3 * Math.sin(elapsed * 0.00057));
      }
      spot = { x: spot.x + (target.x - spot.x) * 0.08, y: spot.y + (target.y - spot.y) * 0.08 };
    });

    return () => {
      stopAnimation();
      window.removeEventListener("pointermove", onMove);
    };
  });
</script>

<div
  bind:this={host}
  aria-hidden="true"
  class="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_170px_at_var(--spot-x)_var(--spot-y),black,transparent)] {className}"
  style:--spot-x="{spot.x}px"
  style:--spot-y="{spot.y}px"
>
  <HexBackdrop {text} tile rowMs={2600} />
</div>
