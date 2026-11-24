<script lang="ts">
  import { formatPostDate } from "#lib/content/dates.js";
  import { readingLabel } from "#lib/content/reading-time.js";
  import type { PostSummary } from "#lib/content/types.js";
  import { postPath } from "#lib/site.js";

  interface Props {
    post: PostSummary;
  }

  const { post }: Props = $props();

  const row = [
    "group grid grid-cols-[--spacing(16)_minmax(0,1fr)_auto_--spacing(6)] items-center gap-6 px-6.5 py-5.5",
    "border-t-2 border-dashed border-grid first:border-t-0",
    "text-inherit no-underline transition-colors duration-200 hover:bg-row-hover",
    "max-sm:grid-cols-[--spacing(13)_minmax(0,1fr)] max-sm:gap-x-4 max-sm:gap-y-1.5 max-sm:p-4.5",
  ].join(" ");

  const number = [
    "grid h-9 place-items-center bg-ink font-led text-[17px] text-highlight",
    "transition-colors duration-200 group-hover:bg-highlight group-hover:text-ink",
    "max-sm:row-span-2 max-sm:row-start-1 max-sm:h-7.5 max-sm:self-start max-sm:text-[15px]",
  ].join(" ");

  const title = [
    "text-[20px] leading-[1.25] transition-colors duration-200",
    "group-hover:text-violet max-sm:text-[17px]",
  ].join(" ");

  const description = "truncate text-[15.5px] text-muted max-sm:line-clamp-2 max-sm:whitespace-normal";

  const when = "font-led text-[15px] text-muted max-sm:col-start-2 max-sm:row-start-1 max-sm:text-[13px]";

  const arrow = [
    "inline-block font-pixel text-[18px] text-ink",
    "transition-transform duration-250 group-hover:translate-x-1.5 max-sm:hidden",
  ].join(" ");
</script>

<a class={row} href={postPath(post.slug)}>
  <span class={number}>{post.ficheNumber}</span>

  <span class="grid gap-1 max-sm:col-start-2">
    <h3 class={title}>{post.title}</h3>
    <span class={description}>{post.description}</span>
  </span>

  <span class={when}>{formatPostDate(post.publishedAt)} · {readingLabel(post.readingMinutes)}</span>

  <span class={arrow} aria-hidden="true">→</span>
</a>
