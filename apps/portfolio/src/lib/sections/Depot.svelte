<script lang="ts">
  import Section from "#lib/components/Section.svelte";
  import TeardownCard from "#lib/components/TeardownCard.svelte";
  import { sites } from "@mth/ui";
  import { teardowns } from "#lib/data/teardowns.js";

  const [latest] = teardowns;
</script>

<Section id="depot" number="4" title="le dépôt" kicker="le blog" tilt={3}>
  {#snippet lead()}
    Au dépôt, on démonte les rames pour voir ce qui coince. Je fais pareil avec des applis et des jeux, à coups d'IDA,
    Ghidra, x64dbg et Frida. Dernier passage à l'atelier :
    <a class="no-underline" href={latest.href}><mark>un frigo de voiture (oui.)</mark></a>
    Les fiches complètes sont sur <a href={sites.blog}>le blog</a>.
  {/snippet}

  <span class="absolute top-24 left-[46%] size-6.5 border-2 border-lavender max-lg:hidden" aria-hidden="true"></span>

  <div class="grid grid-cols-3 gap-8 pt-4 max-lg:max-w-[520px] max-lg:grid-cols-1">
    {#each teardowns as teardown, index (teardown.href)}
      <TeardownCard {teardown} number={index + 1} />
    {/each}
  </div>
</Section>
