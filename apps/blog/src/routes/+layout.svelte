<script lang="ts">
  import "../app.css";

  import { ClickSparks, FontPreload } from "@mth/ui";
  import SiteFooter from "#lib/components/SiteFooter.svelte";
  import { SITE, absoluteUrl } from "#lib/site.js";

  const { children } = $props();
</script>

<svelte:head>
  <link rel="alternate" type="application/rss+xml" title={SITE.title} href={absoluteUrl("/rss.xml")} />
</svelte:head>

<FontPreload />
<ClickSparks />

{@render children()}

<SiteFooter />
