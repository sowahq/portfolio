<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    tag?: "nav" | "div" | "aside";
    hangerInset?: string;
    class?: string;
    children: Snippet;
  }

  const {
    label,
    tag = "div",
    hangerInset = "calc(var(--spacing) * 10)",
    class: className = "",
    children,
  }: Props = $props();

  const frame = [
    "relative bg-board font-led text-board-text",
    "shadow-[6px_6px_0_var(--color-ink),inset_0_0_0_3px_var(--color-board-edge)]",
  ].join(" ");

  const hangers = [
    "before:absolute before:-top-10 before:left-(--hanger-inset) before:h-10 before:w-1 before:bg-ink",
    "after:absolute after:-top-10 after:right-(--hanger-inset) after:h-10 after:w-1 after:bg-ink",
  ].join(" ");
</script>

<svelte:element this={tag} aria-label={label} class="{frame} {hangers} {className}" style:--hanger-inset={hangerInset}>
  {@render children()}
</svelte:element>
