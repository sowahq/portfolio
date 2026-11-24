<script lang="ts">
  import Section from "#lib/components/Section.svelte";
  import Ticket from "#lib/components/Ticket.svelte";
  import { missions, missionsLead } from "#lib/data/missions.js";
</script>

<Section id="missions" number="1" title="trois tickets possibles" kicker="ce que je fais" tilt={-3}>
  {#snippet lead()}{missionsLead}{/snippet}

  <span class="absolute top-20 right-[12%] size-8.5 border-2 border-lavender max-lg:hidden" aria-hidden="true"></span>
  <span class="absolute top-44 right-[16%] h-7 w-24 border-3 border-lavender max-lg:hidden" aria-hidden="true"></span>

  <div class="grid grid-cols-3 gap-8 pt-3 max-lg:max-w-[520px] max-lg:grid-cols-1">
    {#each missions as mission (mission.title)}
      <Ticket {mission} />
    {/each}
  </div>
</Section>
