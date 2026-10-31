<script lang="ts">
  import "#lib/app.css";

  import { onMount } from "svelte";
  import { wappalyzer } from "#lib/utils/index.js";

  const { children } = $props();

  onMount(() => {
    wappalyzer({
      value: true,
      debug: false,
    });
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#e9d5ff" />
  <link rel="canonical" href="https://szeroki.fr" />

  <meta name="darkreader-lock">
</svelte:head>

<main
  class="min-h-screen scroll-smooth relative overflow-hidden bg-gradient-to-br from-purple-200 to-white font-minecraft"
>
  {@render children()}
</main>
