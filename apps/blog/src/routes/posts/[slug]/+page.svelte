<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { Seo } from "@mth/ui/seo";
  import ContentRenderer from "#lib/components/ContentRenderer.svelte";
  import FicheEnd from "#lib/components/FicheEnd.svelte";
  import FicheHeader from "#lib/components/FicheHeader.svelte";
  import ReadProgress from "#lib/components/ReadProgress.svelte";
  import StepsDrawer from "#lib/components/StepsDrawer.svelte";
  import StepsRail from "#lib/components/StepsRail.svelte";
  import TopBar from "#lib/components/TopBar.svelte";
  import ZoomableImage from "#lib/components/ZoomableImage.svelte";
  import { postPageJsonLd } from "#lib/content/json-ld.js";
  import { proseTextClasses } from "#lib/content/prose.js";
  import { COLUMN_SIZES, imageSources } from "#lib/content/responsive-image.js";
  import { topLevelSteps } from "#lib/content/steps.js";
  import { SITE, absoluteUrl, postHeadline, postOgImage, postPath, postTitle } from "#lib/site.js";
  import { pageWrap } from "#lib/ui/classes.js";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const post = $derived(data.post);
  const steps = $derived(topLevelSteps(post.toc));

  const coverPreload = $derived(imageSources(post.cover.src, post.cover.width)[0]);

  let prose = $state<HTMLElement>();

  const trackProse: Attachment<HTMLElement> = (element) => {
    prose = element;

    return () => {
      prose = undefined;
    };
  };

  const reading = [
    "mt-8.5 grid grid-cols-[minmax(0,--spacing(184))_minmax(--spacing(60),1fr)] gap-16",
    "max-split:grid-cols-[minmax(0,1fr)]",
  ].join(" ");
</script>

<Seo
  title={postTitle(postHeadline(post))}
  description={post.description}
  siteName={SITE.siteName}
  url={absoluteUrl(postPath(post.slug))}
  image={postOgImage(post)}
  type="article"
  article={{ publishedTime: post.publishedAt, tags: post.tags, section: post.workshops[0] }}
  jsonLd={postPageJsonLd(post)}
/>

<svelte:head>
  {#if coverPreload}
    <link
      rel="preload"
      as="image"
      type={coverPreload.type}
      imagesrcset={coverPreload.srcset}
      imagesizes={COLUMN_SIZES}
      fetchpriority="high"
    />
  {/if}
</svelte:head>

<TopBar back />

<ReadProgress {prose} />

<main class={pageWrap}>
  <div class={reading}>
    <div class="max-w-184 min-w-0">
      <FicheHeader {post} />

      <StepsDrawer {steps} />

      <article class={proseTextClasses} {@attach trackProse}>
        <figure class="mb-10">
          <ZoomableImage
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            wide
            priority
            class="border-2 border-ink"
          />
        </figure>

        <div>
          <ContentRenderer nodes={post.body} />
        </div>
      </article>
    </div>

    <StepsRail {steps} minutes={post.readingMinutes} {prose} />
  </div>

  <FicheEnd neighbor={data.neighbor} />
</main>
