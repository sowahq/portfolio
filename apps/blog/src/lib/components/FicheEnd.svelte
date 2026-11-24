<script lang="ts">
  import { profileLinks, sites } from "@mth/ui";
  import { AUTHOR_NAME } from "@mth/ui/seo";
  import type { FicheNeighbor } from "#lib/content/fiche.js";
  import { linkClasses } from "#lib/content/prose.js";
  import { postPath } from "#lib/site.js";
  import { pixelButton, pixelGhostButton } from "#lib/ui/classes.js";

  interface Props {
    neighbor: FicheNeighbor | null;
  }

  const { neighbor }: Props = $props();

  const end = [
    "mt-22.5 grid grid-cols-[minmax(0,1fr)_--spacing(65)] -rotate-[0.5deg]",
    "bg-card shadow-[8px_8px_0_var(--color-ink)]",
    "max-sm:grid-cols-1",
  ].join(" ");

  const side = [
    "grid content-between gap-4.5 border-l-3 border-dashed border-lavender px-6.5 py-8.5",
    "max-sm:border-t-3 max-sm:border-l-0 max-sm:p-5.5",
  ].join(" ");

  const sideLabel = "block font-led text-[13px] tracking-[0.1em] text-muted uppercase";

  const sideLink = "font-pixel text-[15px] font-semibold text-ink no-underline hover:text-violet";
</script>

<section class={end} aria-labelledby="end-title">
  <div class="px-10 py-8.5 max-sm:px-5.5 max-sm:py-7">
    <h2 id="end-title" class="text-[clamp(30px,3.6vw,44px)] leading-none">fin d'intervention.</h2>

    <p class="mt-3.5 max-w-[32em]">
      Écrit par <a class={linkClasses} href={sites.portfolio} rel="author">{AUTHOR_NAME}</a>, développeur freelance à
      Lille. Je code depuis 2016, et je démonte ce que j'utilise pour comprendre comment ça marche.
    </p>

    <p class="mt-3.5 mb-5.5 max-w-[32em]">
      Une question, une correction, ou un objet qui mériterait sa fiche ? Écrivez-moi, je lis tout.
    </p>

    <div class="flex flex-wrap gap-4">
      <a class={pixelButton} href="mailto:{profileLinks.email}">{profileLinks.email}</a>
      <a class={pixelGhostButton} href="/">retour au dépôt</a>
    </div>
  </div>

  <div class={side}>
    {#if neighbor}
      <div>
        <small class={sideLabel}>{neighbor.direction} · {neighbor.post.ficheNumber}</small>
        <a class={sideLink} href={postPath(neighbor.post.slug)}>{neighbor.post.title} →</a>
      </div>
    {/if}

    <div>
      <small class={sideLabel}>côté pro</small>
      <a class={sideLink} href="{sites.portfolio}/#missions">votre code mérite un audit ? mth.lc →</a>
    </div>
  </div>
</section>
