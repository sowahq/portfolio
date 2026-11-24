<script lang="ts">
  import { page } from "$app/state";
  import { Sticker } from "@mth/ui";
  import { Seo } from "@mth/ui/seo";
  import { siteJsonLd } from "#lib/content/json-ld.js";
  import { SITE } from "#lib/site.js";
</script>

<Seo
  title="{page.status} · {SITE.title}"
  description="Cette page n'existe pas ou plus sur {SITE.title}."
  siteName={SITE.siteName}
  jsonLd={siteJsonLd()}
  noindex
/>

<main class="page-wrap enter pt-24">
  <Sticker tilt={-4}>{page.status}</Sticker>

  <h1 class="mt-6 mb-5 text-4xl leading-tight">Cette page n'existe pas.</h1>

  <a href="/" class="link-pixel">← Retour à l'accueil</a>
</main>
