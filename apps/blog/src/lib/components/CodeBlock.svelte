<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { codeText, terminalLabel } from "#lib/content/terminal.js";
  import type { CodeBlockNode, CodeToken } from "#lib/content/types.js";

  interface Props {
    code: CodeBlockNode;
  }

  const { code }: Props = $props();

  const ITALIC = 1;
  const BOLD = 2;
  const UNDERLINE = 4;

  const LINE_BREAK = "\n";

  const COPIED_DURATION_MS = 1600;

  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  const terminal = "my-[1.8em] border-3 border-board-edge bg-board shadow-[5px_5px_0_var(--color-ink)]";

  const header = [
    "flex items-center justify-between border-b-2 border-board-line px-3.5 py-2",
    "font-led text-[14px] tracking-[0.08em] text-lavender",
    "max-sm:px-3 max-sm:py-1.5 max-sm:text-[12.5px]",
  ].join(" ");

  const copyButton = [
    "border-2 border-board-edge bg-transparent px-2.5 py-0.5 text-board-text",
    "transition-colors duration-200 hover:bg-board-text hover:text-board",
  ].join(" ");

  const block = [
    "m-0 overflow-x-auto px-5 pt-4.5 pb-5",
    "font-led text-[15.5px] leading-[1.6] text-terminal-text",
    "max-sm:px-4 max-sm:pt-3.5 max-sm:pb-4 max-sm:text-[13.5px]",
  ].join(" ");

  function tokenClasses(token: CodeToken): Record<string, boolean> {
    const style = token.fontStyle ?? 0;

    return {
      italic: (style & ITALIC) !== 0,
      "font-bold": (style & BOLD) !== 0,
      underline: (style & UNDERLINE) !== 0,
    };
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(codeText(code.lines));
    } catch {
      return;
    }

    copied = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied = false;
    }, COPIED_DURATION_MS);
  }

  const cancelResetOnDestroy: Attachment = () => {
    return () => clearTimeout(resetTimer);
  };
</script>

<figure class={terminal}>
  <header class={header}>
    <span>{terminalLabel(code.lang)}</span>

    <button type="button" class={copyButton} onclick={copy} {@attach cancelResetOnDestroy}>
      {copied ? "copié" : "copier"}
    </button>
  </header>

  <pre class={block} data-lang={code.lang}><code
      >{#each code.lines as line, lineIndex (lineIndex)}{#if lineIndex > 0}{LINE_BREAK}{/if}{#each line as token, tokenIndex (tokenIndex)}<span
            style:color={token.color}
            class={tokenClasses(token)}>{token.content}</span
          >{/each}{/each}</code
    ></pre>
</figure>
