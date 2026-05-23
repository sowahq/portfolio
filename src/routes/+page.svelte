<script lang="ts">
  import { AboutSection, HelloSection } from "$lib/components/layout";
</script>

<svelte:head>
  <title>Mathis LUTIC - Développement full-stack</title>
  <meta
    name="description"
    content="Bienvenue sur mon portfolio. Je fais du développement full-stack depuis 2016, principalement avec Svelte et Go."
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://szeroki.fr" />
  <meta property="og:title" content="Mathis LUTIC - Développement full-stack" />
  <meta
    property="og:description"
    content="Bienvenue sur mon portfolio. Je fais du développement full-stack depuis 2016, principalement avec Svelte et Go."
  />
  <meta property="og:image" content="https://szeroki.fr/images/og-image.png" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://szeroki.fr" />
  <meta
    property="twitter:title"
    content="Mathis LUTIC - Développement full-stack"
  />
  <meta
    property="twitter:description"
    content="Bienvenue sur mon portfolio. Je fais du développement full-stack depuis 2016, principalement avec Svelte et Go."
  />
  <meta
    property="twitter:image"
    content="https://szeroki.fr/images/og-image.png"
  />
</svelte:head>

<main class="min-h-screen scroll-smooth">
  <HelloSection />
  <AboutSection />
</main>
