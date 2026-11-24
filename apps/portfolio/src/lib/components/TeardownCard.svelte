<script lang="ts">
  import type { Teardown } from "#lib/data/types.js";
  import { hexdumpLine } from "#lib/utils/hexdump.js";

  interface Props {
    teardown: Teardown;
    number: number;
  }

  const { teardown, number }: Props = $props();

  const label = $derived(`fiche de démontage n° ${String(number).padStart(2, "0")}`);
</script>

<a
  href={teardown.href}
  class="paper-card relative block px-6 pt-7 pb-6 no-underline transition-transform duration-250 hover:animate-[swing_0.6s_ease-in-out]"
  style:rotate="{teardown.tilt}deg"
>
  <span
    class="absolute -top-3.5 left-5.5 h-6 w-13.5 bg-ink pixel-corners-3 after:absolute after:top-1.5 after:left-3.75 after:h-2 after:w-6 after:bg-card"
    aria-hidden="true"
  ></span>

  <small class="font-pixel text-sm font-semibold tracking-[-0.02em] text-violet">{label}</small>

  <code
    class="my-2.5 mb-3.5 block overflow-hidden bg-ink px-2.5 py-2 text-xs whitespace-nowrap text-[#cdbeef]"
    aria-hidden="true"
  >
    {hexdumpLine(teardown.target)}
  </code>

  <h3 class="mb-2.5 text-xl leading-tight">{teardown.title}</h3>

  <span class="text-sm text-muted">{teardown.tags.join(" · ")}</span>
</a>
