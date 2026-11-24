<script lang="ts">
  import { DepotScene, EarlyPaint, StationTitle, Sticker } from "@mth/ui";
  import { Seo } from "@mth/ui/seo";
  import ArrivalsBoard from "#lib/components/ArrivalsBoard.svelte";
  import FeaturedFiche from "#lib/components/FeaturedFiche.svelte";
  import TimetableRow from "#lib/components/TimetableRow.svelte";
  import TopBar from "#lib/components/TopBar.svelte";
  import WorkshopFilters from "#lib/components/WorkshopFilters.svelte";
  import { homePageJsonLd } from "#lib/content/json-ld.js";
  import type { PostSummary } from "#lib/content/types.js";
  import type { Workshop } from "#lib/content/workshops.js";
  import { SITE, absoluteUrl, homeOgImage, postPath } from "#lib/site.js";
  import { pageWrap, pixelButton, pixelGhostButton } from "#lib/ui/classes.js";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const ARRIVALS = 4;

  let workshop = $state<Workshop | "tout">("tout");

  const latest = $derived(data.posts[0]);
  const arrivals = $derived(data.posts.slice(0, ARRIVALS));
  const others = $derived(data.posts.slice(1).filter(onTrack));
  const latestOnTrack = $derived(latest !== undefined && onTrack(latest));

  function onTrack(post: PostSummary): boolean {
    return workshop === "tout" || post.workshops.includes(workshop);
  }

  const hero = [
    "relative z-2 grid grid-cols-[minmax(0,1fr)_--spacing(105)] items-end gap-12 pt-10 pb-9",
    "max-split:grid-cols-1 max-split:gap-15 max-sm:pt-5",
  ].join(" ");

  const masthead = "flex min-h-[max(100svh,780px)] flex-col";

  const sticker = "text-[22px]! tracking-normal! max-sm:px-3! max-sm:py-1! max-sm:text-[17px]!";

  const title = "mt-5.5 text-[clamp(56px,8vw,104px)] leading-[0.9] max-sm:text-[60px]";

  const subtitle =
    "mt-4 block font-pixel text-[26px] leading-tight font-semibold tracking-normal text-muted max-sm:text-[21px]";

  const lead = "mt-6 mb-7 max-w-[33em] text-[19px] max-sm:text-[17px]";

  const stationRow = "mb-9 flex flex-wrap items-center justify-between gap-x-7 gap-y-4.5 max-sm:mb-6.5";
</script>

<Seo
  title={SITE.homeTitle}
  description={SITE.description}
  siteName={SITE.siteName}
  url={absoluteUrl("/")}
  image={homeOgImage()}
  jsonLd={homePageJsonLd(data.posts)}
/>

<header class={masthead}>
  <TopBar />

  <div class="{pageWrap} {hero}">
    <div>
      <Sticker tilt={-7} class={sticker}>le blog de mathis</Sticker>

      <h1 class={title}>
        le dépôt
        <span class={subtitle}>fiches de reverse engineering</span>
      </h1>

      <p class={lead}>
        Ici je démonte ce qui me tombe sous la main : <mark>un frigo Bluetooth</mark>, une appli de salle de sport, un
        protecteur des années 2000. Chaque fiche raconte l'intervention, impasses comprises.
      </p>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-4">
        {#if latest}
          <a class={pixelButton} href={postPath(latest.slug)}>lire la dernière fiche</a>
        {/if}

        <a class={pixelGhostButton} href="/rss.xml">s'abonner (rss)</a>
      </div>
    </div>

    <ArrivalsBoard posts={arrivals} />
  </div>

  <DepotScene tracks={data.posts.length} class="-mt-32.5 min-h-107.5 flex-1 max-split:-mt-10 max-split:min-h-90" />

  <EarlyPaint />
</header>

<main>
  <section class="{pageWrap} pt-22 max-sm:pt-14" aria-labelledby="fiches-title">
    <div class={stationRow}>
      <StationTitle id="fiches-title" number="1" title="sur les voies" />

      <WorkshopFilters bind:value={workshop} />
    </div>

    {#if latest && latestOnTrack}
      <FeaturedFiche post={latest} cover={data.latestCover} />
    {/if}

    {#if others.length > 0}
      <div class="paper-card mt-10">
        {#each others as post (post.slug)}
          <TimetableRow {post} />
        {/each}
      </div>
    {/if}
  </section>
</main>
