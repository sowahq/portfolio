<script lang="ts">
  import type { Mission } from "#lib/data/types.js";

  interface Props {
    mission: Mission;
  }

  const { mission }: Props = $props();
</script>

<article
  class="relative flex drop-shadow-[5px_5px_0_var(--color-lavender)] transition-transform duration-250 hover:-translate-y-1 hover:!rotate-0"
  style:rotate="{mission.tilt}deg"
>
  {#if mission.taped}
    <span class="tape" aria-hidden="true"></span>
  {/if}

  <div class="ticket-paper flex w-full flex-col bg-card px-6 pt-6 pb-0">
    <small class="font-pixel text-sm font-semibold tracking-[-0.02em] text-violet">{mission.kind}</small>

    <h3 class="mt-2 mb-3 text-[23px] leading-[1.05] lowercase">{mission.title}</h3>

    <p class="mb-6 text-base text-muted">{mission.description}</p>

    <footer
      class="mt-auto flex h-23 flex-col justify-center gap-1.5 border-t-2 border-dashed border-lavender font-pixel text-[13px] font-semibold tracking-[-0.02em]"
    >
      <span class="text-ink">départ : {mission.from}</span>
      <span class="text-violet">arrivée : {mission.to}</span>
    </footer>
  </div>
</article>
