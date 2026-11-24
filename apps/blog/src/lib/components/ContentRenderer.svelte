<script lang="ts">
  import { withoutWarningSigns } from "#lib/content/callout.js";
  import { figureImage, figureLabel, numberFigures } from "#lib/content/figures.js";
  import {
    calloutClasses,
    calloutLabelClasses,
    figureCaptionClasses,
    figureClasses,
    figureImageClasses,
    figureNumberClasses,
    headingClasses,
    inlineImageClasses,
    proseClasses,
    refGridClasses,
    ruleClasses,
    stepBadgeClasses,
    substepNumberClasses,
    tableWrapperClasses,
    toneClasses,
  } from "#lib/content/prose.js";
  import { splitStepNumber } from "#lib/content/steps.js";
  import type { ContentNode, HeadingLevel } from "#lib/content/types.js";
  import CodeBlock from "./CodeBlock.svelte";
  import ProseLink from "./ProseLink.svelte";
  import RefCard from "./RefCard.svelte";
  import ZoomableImage from "./ZoomableImage.svelte";

  interface Props {
    nodes: ContentNode[];
  }

  const { nodes }: Props = $props();

  const LAST_HEADING_LEVEL = 6;

  const figures = $derived(numberFigures(nodes));

  function headingTag(level: HeadingLevel): string {
    return `h${Math.min(level + 1, LAST_HEADING_LEVEL)}`;
  }
</script>

{#snippet content(children: ContentNode[])}
  {#each children as node, index (index)}
    {@const figure = figureImage(node)}

    {#if figure}
      <figure class={figureClasses}>
        <ZoomableImage
          src={figure.src}
          alt={figure.alt}
          width={figure.width}
          height={figure.height}
          displayWidth={figure.displayWidth}
          wide
          class={figureImageClasses}
        />

        <figcaption class={figureCaptionClasses}>
          <b class={figureNumberClasses}>{figureLabel(figures.get(figure) ?? 0)}</b>

          {#if figure.alt}
            <span>{figure.alt}</span>
          {/if}
        </figcaption>
      </figure>
    {:else if node.kind === "text"}
      {node.value}
    {:else if node.kind === "break"}
      <br />
    {:else if node.kind === "rule"}
      <hr class={ruleClasses} />
    {:else if node.kind === "heading"}
      {@const heading = splitStepNumber(node.children, node.level)}

      <svelte:element this={headingTag(node.level)} id={node.id} class={headingClasses[node.level]}>
        {#if node.level === 1}
          {#if heading.number}
            <span class={stepBadgeClasses}>{heading.number}</span>
          {/if}

          <span>{@render content(heading.children)}</span>
        {:else}
          {#if heading.number}<span class={substepNumberClasses}>{`${heading.number} `}</span>{/if}{@render content(
            heading.children,
          )}
        {/if}
      </svelte:element>
    {:else if node.kind === "link"}
      <ProseLink href={node.href} external={node.external} preview={node.preview}>
        {@render content(node.children)}
      </ProseLink>
    {:else if node.kind === "image"}
      <ZoomableImage
        src={node.src}
        alt={node.alt}
        width={node.width}
        height={node.height}
        displayWidth={node.displayWidth}
        class={inlineImageClasses}
      />
    {:else if node.kind === "code"}
      <CodeBlock code={node} />
    {:else if node.kind === "ref-grid"}
      <div class={refGridClasses}>
        {#each node.cards as card, cardIndex (cardIndex)}
          <RefCard {card} {content} />
        {/each}
      </div>
    {:else if node.kind === "ref-card"}
      <RefCard card={node} {content} />
    {:else if node.kind === "tone"}
      <span class={toneClasses[node.tone]}>{@render content(node.children)}</span>
    {:else if node.kind === "callout"}
      <aside class={calloutClasses}>
        <b class={calloutLabelClasses}>consigne de sécurité</b>

        {@render content(withoutWarningSigns(node.children))}
      </aside>
    {:else if node.tag === "table"}
      <div class={tableWrapperClasses}>
        <table class={proseClasses.table}>
          {@render content(node.children)}
        </table>
      </div>
    {:else}
      <svelte:element this={node.tag} class={proseClasses[node.tag]} style:text-align={node.align} start={node.start}>
        {@render content(node.children)}
      </svelte:element>
    {/if}
  {/each}
{/snippet}

{@render content(nodes)}
