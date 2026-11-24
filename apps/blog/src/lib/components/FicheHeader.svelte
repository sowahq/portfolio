<script lang="ts">
  import { sites } from "@mth/ui";
  import { AUTHOR_NAME } from "@mth/ui/seo";
  import { formatPostDate } from "#lib/content/dates.js";
  import { readingLabel } from "#lib/content/reading-time.js";
  import type { PostSummary } from "#lib/content/types.js";

  interface Props {
    post: PostSummary;
  }

  const { post }: Props = $props();

  interface KitItem {
    term: string;
    value: string;
  }

  const kit: KitItem[] = $derived([
    { term: "cible", value: post.target },
    ...(post.protocol ? [{ term: "protocole", value: post.protocol }] : []),
    ...(post.tools.length > 0 ? [{ term: "outils", value: post.tools.join(", ") }] : []),
    { term: "durée", value: readingLabel(post.readingMinutes) },
  ]);

  const sheet = "relative mb-10 -rotate-[0.4deg] bg-card shadow-[6px_6px_0_var(--color-ink)]";

  const tape = "tape left-10 h-6 w-24 transform-none rotate-4 bg-highlight/75";

  const band = [
    "flex flex-wrap justify-between gap-x-4 gap-y-1 bg-board px-6 py-2",
    "font-led text-[13px] tracking-[0.12em] text-board-text uppercase",
    "max-sm:px-5 max-sm:text-[11.5px] max-sm:tracking-[0.05em]",
  ].join(" ");

  const authorLink = "text-inherit decoration-highlight underline-offset-4 hover:text-highlight";

  const inner = "px-7 pt-6.5 pb-6 max-sm:px-5 max-sm:pt-5.5 max-sm:pb-5";

  const title = "text-[clamp(30px,3.6vw,44px)] leading-[1.1] max-sm:text-[28px]";

  const lead = "mt-3.5 mb-0 text-[18px] max-sm:text-[17px]";

  const kitList = [
    "mt-5 mb-0 flex flex-wrap gap-y-2.5 border-t-2 border-dashed border-grid pt-4",
    "max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-3.5",
  ].join(" ");

  const kitItem = "border-l-2 border-grid px-5 first:border-l-0 first:pl-0 max-sm:border-l-0 max-sm:p-0";
</script>

<header class={sheet}>
  <span class={tape} aria-hidden="true"></span>

  <div class={band}>
    <span>FICHE <span class="max-sm:hidden">D'INTERVENTION</span> N° {post.ficheNumber}</span>
    <span>
      <time datetime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      · par <a class={authorLink} href={sites.portfolio} rel="author">{AUTHOR_NAME}</a>
    </span>
  </div>

  <div class={inner}>
    <h1 class={title}>{post.title}</h1>

    <p class={lead}>{post.description}</p>

    <dl class={kitList}>
      {#each kit as item (item.term)}
        <div class={kitItem}>
          <dt class="font-led text-[12px] tracking-[0.1em] text-muted uppercase">{item.term}</dt>
          <dd class="mt-0.5 font-pixel text-[14px] font-semibold text-ink">{item.value}</dd>
        </div>
      {/each}
    </dl>
  </div>
</header>
