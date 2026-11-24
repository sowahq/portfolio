<script lang="ts">
  import onest from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
  import departureMono from "../fonts/departure-mono.woff2?url";
  import monocraftSemibold from "../fonts/monocraft-600.woff2?url";
  import monocraftBold from "../fonts/monocraft-700.woff2?url";

  const fonts = [monocraftBold, monocraftSemibold, departureMono, onest];
</script>

<svelte:head>
  {#each fonts as href (href)}
    <link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" {href} />
  {/each}
</svelte:head>
