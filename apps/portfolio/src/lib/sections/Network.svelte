<script lang="ts">
  import { reveal } from "#lib/attachments/reveal.js";
  import Section from "#lib/components/Section.svelte";
  import StackLine from "#lib/components/StackLine.svelte";
  import { stack, stackLead } from "#lib/data/stack.js";
</script>

<Section id="reseau" number="3" title="le réseau" kicker="ma stack" tilt={-2}>
  {#snippet lead()}{stackLead}{/snippet}

  <div class="group paper-card flex -rotate-[0.6deg] flex-col gap-8.5 px-9 pt-8 pb-7 max-lg:px-5.5" {@attach reveal()}>
    {#each stack as line (line.name)}
      <StackLine {line} />
    {/each}

    <span class="font-pixel text-sm font-semibold text-muted">plan non contractuel, mis à jour à chaque projet</span>
  </div>
</Section>
