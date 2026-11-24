<script lang="ts">
  import { BoardFrame } from "@mth/ui";
  import { formatDayMonth } from "#lib/content/dates.js";
  import type { PostSummary } from "#lib/content/types.js";
  import { postPath } from "#lib/site.js";

  interface Props {
    posts: PostSummary[];
  }

  const { posts }: Props = $props();

  const board = "px-5.75 pt-5.25 pb-4.25 max-split:hidden";

  const head = ["mb-1 flex justify-between border-b-2 border-board-line pb-2.5", "text-[15px] text-lavender"].join(" ");

  const row = [
    "group grid grid-cols-[--spacing(13)_minmax(0,1fr)_auto] items-baseline gap-3 py-2.25",
    "border-b border-dashed border-board-line last:border-b-0",
    "text-[17px] no-underline",
    "max-sm:grid-cols-[--spacing(11.5)_minmax(0,1fr)_auto] max-sm:text-[15px]",
  ].join(" ");
</script>

<BoardFrame label="Dernières arrivées" hangerInset="18%" class={board}>
  <div class={head}>
    <span>ARRIVÉES</span>
    <span>DÉPÔT · LILLE</span>
  </div>

  {#each posts as post (post.slug)}
    <a href={postPath(post.slug)} class={row}>
      <span class="bg-board-text py-px text-center text-ink">{post.ficheNumber}</span>
      <span class="truncate group-hover:text-white">{post.shortLabel}</span>
      <span class="text-[14px] text-signal">{formatDayMonth(post.publishedAt)}</span>
    </a>
  {/each}
</BoardFrame>
