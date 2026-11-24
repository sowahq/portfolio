<script lang="ts">
  import { DepartureBoard, EarlyPaint, LilleScene, Sticker, profileLinks as links, sites } from "@mth/ui";
  import { departures } from "#lib/data/profile.js";
</script>

<header class="relative min-h-[max(100svh,780px)] overflow-hidden bg-[#cabaf2]">
  <LilleScene />

  <div class="page-wrap relative grid grid-cols-[minmax(0,1fr)_360px] items-start gap-10 max-lg:grid-cols-1">
    <div class="enter relative z-2 max-w-[660px] pt-[clamp(48px,10vh,110px)]">
      <Sticker tilt={-8} class="-ml-1.5">salut, moi c'est</Sticker>

      <h1 class="my-5 text-[clamp(52px,7.4vw,104px)] leading-[0.92] tracking-[-0.05em]">Mathis Lutic</h1>

      <p class="mb-7 max-w-[33em] text-xl leading-normal text-ink">
        Je code depuis 2016, et je suis freelance à Lille. Je fais des <mark>applis web et mobiles</mark> pour des PME, des
        start-ups et des assos, et je reprends celles qui sont restées à quai.
      </p>

      <div class="flex flex-wrap items-center gap-x-5.5 gap-y-4">
        <a class="btn" href="#contact">Parler de votre projet →</a>
        <a class="link-pixel" href="#ligne">voir ce que j'ai livré</a>
      </div>

      <div class="mt-5.5 flex flex-wrap gap-x-4.5 gap-y-2 text-base">
        <a class="link-pixel" href={links.github}>github</a>
        <a class="link-pixel" href={links.linkedin}>linkedin</a>
        <a class="link-pixel" href={sites.blog}>blog</a>
        <a class="link-pixel" href="mailto:{links.email}">{links.email}</a>
      </div>
    </div>

    <DepartureBoard {departures} class="mt-[clamp(56px,12vh,130px)] max-lg:mt-1 max-lg:mb-52 max-lg:max-w-[420px]" />
  </div>

  <EarlyPaint />
</header>
