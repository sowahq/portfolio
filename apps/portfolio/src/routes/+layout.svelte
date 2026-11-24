<script lang="ts">
  import "../app.css";

  import { onMount } from "svelte";
  import { ClickSparks, DebugMode, FontPreload } from "@mth/ui";
  import wappalyzer from "#lib/utils/wappalyzer.js";

  const { children } = $props();

  onMount(() => {
    void wappalyzer({ value: true });
  });
</script>

<FontPreload />
<ClickSparks />
<DebugMode />

{@render children()}
