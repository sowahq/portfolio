import { bundledLanguages, createHighlighter, type BundledLanguage, type Highlighter } from "shiki";
import { ensureContrast } from "@mth/ui";
import { themeColor } from "@mth/ui/og";
import type { CodeBlockNode, CodeToken } from "#lib/content/types.js";

const THEME = "tokyo-night";

const TERMINAL_BACKGROUND = themeColor("board");

const PLAIN_LANGUAGES = new Set(["", "text", "plaintext", "plain", "txt"]);

let highlighter: Promise<Highlighter> | undefined;

export type HighlightedCode = Pick<CodeBlockNode, "background" | "foreground" | "lines">;

function isBundledLanguage(lang: string): lang is BundledLanguage {
  return Object.hasOwn(bundledLanguages, lang);
}

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [THEME], langs: [] });

  return highlighter;
}

async function resolveLanguage(instance: Highlighter, lang: string): Promise<BundledLanguage | "text"> {
  const normalized = lang.toLowerCase();

  if (PLAIN_LANGUAGES.has(normalized)) {
    return "text";
  }

  if (!isBundledLanguage(normalized)) {
    throw new Error(`Langage de code inconnu de shiki : "${lang}"`);
  }

  if (!instance.getLoadedLanguages().includes(normalized)) {
    await instance.loadLanguage(normalized);
  }

  return normalized;
}

function sameLook(a: CodeToken, b: CodeToken): boolean {
  return a.color === b.color && a.fontStyle === b.fontStyle;
}

/**
 * Merges neighbouring tokens that render the same, and folds whitespace into the token before it,
 * so a code block produces as few DOM nodes as possible.
 */
export function mergeTokens(line: CodeToken[]): CodeToken[] {
  return line.reduce<CodeToken[]>((merged, token) => {
    const previous = merged.at(-1);

    if (previous && (sameLook(previous, token) || token.content.trim() === "")) {
      merged[merged.length - 1] = { ...previous, content: previous.content + token.content };

      return merged;
    }

    merged.push(token);

    return merged;
  }, []);
}

/**
 * Highlights a code block at build time with shiki and returns serializable tokens.
 */
export async function highlightCode(code: string, lang: string): Promise<HighlightedCode> {
  const instance = await getHighlighter();
  const language = await resolveLanguage(instance, lang);

  const result = instance.codeToTokens(code, { lang: language, theme: THEME });

  const lines = result.tokens.map((line) =>
    mergeTokens(
      line.map((token): CodeToken => {
        const style = token.fontStyle ?? 0;

        return {
          content: token.content,
          ...(token.color ? { color: ensureContrast(token.color, TERMINAL_BACKGROUND) } : {}),
          ...(style > 0 ? { fontStyle: style } : {}),
        };
      }),
    ),
  );

  return {
    background: result.bg ?? "",
    foreground: result.fg ?? "",
    lines,
  };
}
