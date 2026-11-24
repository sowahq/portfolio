<script lang="ts">
  import { productionSites } from "../sites.js";
  import type { SeoImage } from "./image.js";
  import { serializeJsonLd, type JsonLd } from "./json-ld.js";
  import { AUTHOR_NAME, OG_LOCALE } from "./person.js";
  import type { SeoArticle, SeoProfile, SeoType } from "./types.js";

  interface Props {
    title: string;
    description: string;
    siteName: string;
    url?: string;
    image?: SeoImage;
    type?: SeoType;
    article?: SeoArticle;
    profile?: SeoProfile;
    jsonLd?: JsonLd | JsonLd[];
    noindex?: boolean;
  }

  const {
    title,
    description,
    siteName,
    url,
    image,
    type = "website",
    article,
    profile,
    jsonLd,
    noindex = false,
  }: Props = $props();

  const canonical = $derived(noindex ? undefined : url);
  const structuredData = $derived(jsonLd ? serializeJsonLd(jsonLd) : undefined);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="author" content={AUTHOR_NAME} />

  {#if noindex}
    <meta name="robots" content="noindex" />
  {/if}

  {#if canonical}
    <link rel="canonical" href={canonical} />
    <meta property="og:url" content={canonical} />
  {/if}

  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content={OG_LOCALE} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />

  {#if image}
    <meta property="og:image" content={image.url} />
    <meta property="og:image:type" content={image.type} />
    <meta property="og:image:width" content={String(image.width)} />
    <meta property="og:image:height" content={String(image.height)} />
    <meta property="og:image:alt" content={image.alt} />
  {/if}

  {#if article}
    <meta property="article:author" content={productionSites.portfolio} />
    <meta property="article:published_time" content={article.publishedTime} />
    <meta property="article:modified_time" content={article.modifiedTime ?? article.publishedTime} />

    {#if article.section}
      <meta property="article:section" content={article.section} />
    {/if}

    {#each article.tags as tag (tag)}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  {#if profile}
    <meta property="profile:first_name" content={profile.firstName} />
    <meta property="profile:last_name" content={profile.lastName} />
  {/if}

  <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />

  {#if image}
    <meta name="twitter:image" content={image.url} />
    <meta name="twitter:image:alt" content={image.alt} />
  {/if}

  {#if structuredData}
    <svelte:element this={"script"} type="application/ld+json">{structuredData}</svelte:element>
  {/if}
</svelte:head>
