<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import ResponsiveImage from "./ResponsiveImage.svelte";

  interface Props {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    displayWidth?: string;
    wide?: boolean;
    priority?: boolean;
    class?: string;
  }

  const {
    src,
    alt,
    width,
    height,
    displayWidth,
    wide = false,
    priority = false,
    class: className = "",
  }: Props = $props();

  let opened = $state(false);

  const label = $derived(alt ? `Agrandir : ${alt}` : "Agrandir l'image");

  const relativeWidth = $derived(
    displayWidth ?? (typeof width === "string" && width.endsWith("%") ? width : undefined),
  );

  const intrinsic = $derived(typeof width === "number");

  const trigger = "block max-w-full cursor-zoom-in transition-opacity hover:opacity-90";

  const overlay = "m-0 size-full max-h-none max-w-none bg-transparent p-4 backdrop:bg-ink/85";

  const closeArea = "flex size-full cursor-zoom-out flex-col items-center justify-center gap-4";

  const presentModal: Attachment<HTMLDialogElement> = (dialog) => {
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  };
</script>

<button
  type="button"
  class={[trigger, !relativeWidth && (wide ? "w-full" : "w-fit")]}
  style:width={relativeWidth}
  aria-label={label}
  onclick={() => (opened = true)}
>
  <ResponsiveImage
    {src}
    {alt}
    width={relativeWidth && !intrinsic ? undefined : width}
    height={relativeWidth && !intrinsic ? undefined : height}
    {priority}
    class={["block h-auto w-full", className]}
  />
</button>

{#if opened}
  <dialog class={overlay} aria-label={label} onclose={() => (opened = false)} {@attach presentModal}>
    <button type="button" class={closeArea} aria-label="Fermer l'image" onclick={() => (opened = false)}>
      <img {src} {alt} class="max-h-[85svh] max-w-full object-contain" />

      {#if alt}
        <span class="max-w-3xl text-center text-sm text-paper">{alt}</span>
      {/if}
    </button>
  </dialog>
{/if}
