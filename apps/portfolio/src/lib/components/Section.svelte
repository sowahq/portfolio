<script lang="ts">
  import type { Snippet } from "svelte";
  import { StationTitle } from "@mth/ui";

  interface Props {
    id: string;
    number: string;
    title: string;
    kicker?: string;
    lead: Snippet;
    tilt?: number;
    children: Snippet;
  }

  const { id, number, title, kicker, lead, tilt, children }: Props = $props();
</script>

<section {id} aria-labelledby="{id}-title" class="relative pt-30">
  <div class="page-wrap">
    <StationTitle id="{id}-title" {number} {title} {kicker} {tilt} />

    <p class="mt-7 mb-14 max-w-[44ch] text-[22px] leading-normal text-ink">{@render lead()}</p>

    {@render children()}
  </div>
</section>
