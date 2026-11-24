<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { fade } from "svelte/transition";
  import { faviconUrl } from "#lib/content/link-preview.js";
  import type { LinkPreview } from "#lib/content/types.js";

  interface Props {
    preview: LinkPreview;
    children: Snippet;
  }

  const { preview, children }: Props = $props();

  const OPEN_DELAY_MS = 250;
  const CARD_WIDTH_PX = 320;

  let visible = $state(false);
  let alignRight = $state(false);
  let imageFailed = $state(false);

  const card = [
    "absolute top-full z-50 mt-2 block w-80 p-3",
    "border-2 border-lavender bg-card shadow-paper",
    "text-left font-sans font-normal not-italic normal-case",
    "max-md:hidden",
  ].join(" ");

  const hoverIntent: Attachment<HTMLElement> = (wrapper) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const open = (): void => {
      alignRight = wrapper.getBoundingClientRect().left + CARD_WIDTH_PX > window.innerWidth;

      clearTimeout(timer);
      timer = setTimeout(() => {
        visible = true;
      }, OPEN_DELAY_MS);
    };

    const close = (): void => {
      clearTimeout(timer);
      visible = false;
    };

    wrapper.addEventListener("mouseenter", open);
    wrapper.addEventListener("mouseleave", close);
    wrapper.addEventListener("focusin", open);
    wrapper.addEventListener("focusout", close);

    return () => {
      clearTimeout(timer);
      wrapper.removeEventListener("mouseenter", open);
      wrapper.removeEventListener("mouseleave", close);
      wrapper.removeEventListener("focusin", open);
      wrapper.removeEventListener("focusout", close);
    };
  };
</script>

<span class="relative" {@attach hoverIntent}>
  {@render children()}

  {#if visible}
    <span class={[card, alignRight ? "right-0" : "left-0"]} aria-hidden="true" transition:fade={{ duration: 150 }}>
      {#if preview.image && !imageFailed}
        <img
          src={preview.image}
          alt=""
          loading="lazy"
          class="mb-2 block h-32 w-full border border-grid object-cover"
          onerror={() => (imageFailed = true)}
        />
      {/if}

      <span class="mb-1 flex items-center gap-2">
        <img src={faviconUrl(preview.host)} alt="" width="16" height="16" loading="lazy" class="size-4" />
        <span class="truncate text-xs tracking-wide text-muted uppercase">{preview.host}</span>
      </span>

      {#if preview.title}
        <span class="line-clamp-2 block text-sm leading-snug font-semibold text-violet">{preview.title}</span>
      {/if}

      {#if preview.description}
        <span class="mt-1 line-clamp-3 block text-xs leading-snug text-muted">{preview.description}</span>
      {/if}
    </span>
  {/if}
</span>
