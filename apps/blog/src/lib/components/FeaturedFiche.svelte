<script lang="ts">
  import { Sticker } from "@mth/ui";
  import { formatPostDate } from "#lib/content/dates.js";
  import { readingLabel } from "#lib/content/reading-time.js";
  import { FEATURED_SIZES } from "#lib/content/responsive-image.js";
  import type { ImageNode, PostSummary } from "#lib/content/types.js";
  import { postPath } from "#lib/site.js";
  import ResponsiveImage from "./ResponsiveImage.svelte";

  interface Props {
    post: PostSummary;
    cover: Pick<ImageNode, "width" | "height"> | null;
  }

  const { post, cover }: Props = $props();

  const card = [
    "group relative grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-9 p-6.5",
    "bg-card text-inherit no-underline shadow-[6px_6px_0_var(--color-ink)]",
    "transition-[translate,box-shadow] duration-250",
    "hover:-translate-0.75 hover:shadow-[9px_9px_0_var(--color-ink)]",
    "max-sm:grid-cols-1 max-sm:gap-5 max-sm:p-5",
  ].join(" ");

  const arrived = "absolute -top-4.5 right-5.5 px-3! py-0.75! text-[16px]! tracking-normal!";

  const title = "text-[clamp(26px,3vw,36px)] leading-[1.1] max-sm:text-[24px]";

  const arrow = "inline-block transition-transform duration-250 group-hover:translate-x-1.5";
</script>

<a href={postPath(post.slug)} class={card}>
  <Sticker tilt={3} class={arrived}>dernière arrivée</Sticker>

  <ResponsiveImage
    src={post.image}
    alt={post.title}
    width={cover?.width}
    height={cover?.height}
    sizes={FEATURED_SIZES}
    class="block aspect-video w-full border-2 border-ink object-cover"
  />

  <span class="grid gap-3">
    <span class="font-led text-[15px] text-muted">
      fiche {post.ficheNumber} · {formatPostDate(post.publishedAt)} · {readingLabel(post.readingMinutes)}
    </span>

    <h3 class={title}>{post.title}</h3>

    <span class="text-[17px]">{post.description}</span>

    <span class="mt-1.5 font-pixel text-[16px] font-semibold text-ink">
      ouvrir la fiche <span class={arrow}>→</span>
    </span>
  </span>
</a>
