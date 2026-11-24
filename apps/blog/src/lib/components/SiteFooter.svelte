<script lang="ts">
  import { profileLinks, sites } from "@mth/ui";
  import { pageWrap, pixelLink } from "#lib/ui/classes.js";

  const year = new Date().getFullYear();

  const footer = [
    "mt-27.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3",
    "border-t-2 border-dashed border-lavender pt-7 pb-10",
    "font-pixel text-[14px] font-semibold text-ink",
  ].join(" ");
</script>

<footer class="{pageWrap} {footer}">
  <span>© {year} Mathis Lutic · le dépôt</span>

  <nav aria-label="Liens" class="flex flex-wrap gap-5">
    <a class={pixelLink} href={sites.portfolio}>portfolio</a>
    <a class={pixelLink} href="/rss.xml">rss</a>
    <a class={pixelLink} href={profileLinks.github}>github</a>
    <a class={pixelLink} href={profileLinks.linkedin}>linkedin</a>
  </nav>
</footer>
