<script lang="ts">
  import type { OpenSourceStop } from "#lib/data/types.js";

  interface Props {
    stop: OpenSourceStop;
    tilt: number;
  }

  const { stop, tilt }: Props = $props();

  const card = $derived([
    "flex h-full flex-col gap-1.5 p-4.5 transition-transform duration-250",
    "group-hover:!rotate-0 group-hover:-translate-y-0.75",
    stop.open
      ? "bg-card shadow-[4px_4px_0_var(--color-coral-soft)]"
      : "bg-closed shadow-[4px_4px_0_var(--color-grid)] outline-2 -outline-offset-2 outline-grid outline-dashed",
  ]);
</script>

<li class="group relative">
  <span
    class={[
      "metro-stop absolute -top-[34px] left-4.5 size-6 max-lg:top-4 max-lg:-left-[49px]",
      stop.open ? "bg-highlight" : "",
    ]}
    aria-hidden="true"
  ></span>

  <div class={card} style:rotate="{tilt}deg">
    <div class="flex justify-between gap-2 font-pixel text-xs font-semibold">
      <span class={stop.open ? "text-line-prod" : "text-muted"}>{stop.open ? "● en service" : "fermée"}</span>
      <span class="text-muted">{stop.period}</span>
    </div>

    <b class={["font-pixel text-[19px] leading-tight font-semibold", stop.open ? "text-ink" : "text-muted"]}>
      {#if stop.href}
        <a href={stop.href} class="decoration-coral underline-offset-4">{stop.title}</a>
      {:else}
        {stop.title}
      {/if}
    </b>

    <span class="text-[15px] font-semibold text-muted">{stop.role}</span>

    <p class={["text-sm leading-snug", stop.open ? "text-text" : "text-muted"]}>{stop.summary}</p>

    {#if stop.badge}
      <span class="mt-auto self-start bg-highlight px-2 py-0.5 font-pixel text-[13px] font-semibold text-ink">
        {stop.badge}
      </span>
    {/if}
  </div>
</li>
