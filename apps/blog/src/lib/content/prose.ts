import type { HeadingLevel, ProseTag, Tone } from "./types.js";

const inlineCode = [
  "border border-code-edge bg-code-bg px-1.5 py-px",
  "font-led text-[0.9em] text-violet-deep",
  "[overflow-wrap:anywhere]",
].join(" ");

const blockquote = "my-6 border-l-4 border-violet pl-5 text-text italic";

const list = "mt-0 mb-[1.25em] pl-[1.3em] marker:text-violet";

export const proseClasses: Record<ProseTag, string> = {
  p: "mt-0 mb-[1.25em]",
  strong: "font-[650] text-ink",
  em: "italic",
  del: "line-through",
  code: inlineCode,
  blockquote,
  ul: `${list} list-disc`,
  ol: `${list} list-decimal`,
  li: "my-[0.35em]",
  table: "w-full border-collapse text-base",
  thead: "border-b-2 border-ink",
  tbody: "",
  tr: "border-b border-grid",
  th: "px-3 py-2 font-semibold text-ink",
  td: "px-3 py-2 align-top",
};

const headingBase = "scroll-mt-7.5 first:mt-0";

const minorHeading = [
  headingBase,
  "mt-[1.6em] mb-[0.6em] text-[19px] leading-[1.25]",
  "font-pixel font-bold tracking-[-0.04em] text-ink",
].join(" ");

export const headingClasses: Record<HeadingLevel, string> = {
  1: [
    headingBase,
    "mt-[2.6em] mb-[0.9em] flex items-start gap-4",
    "text-[30px] leading-[1.15] max-sm:text-[24px]",
  ].join(" "),
  2: `${headingBase} mt-[2em] mb-[0.7em] text-[22px] leading-[1.2]`,
  3: minorHeading,
  4: minorHeading,
  5: minorHeading,
  6: minorHeading,
};

export const stepBadgeClasses = [
  "grid h-10.5 min-w-10.5 flex-none place-items-center px-1.5",
  "bg-ink text-[22px] text-highlight pixel-corners-3",
].join(" ");

export const substepNumberClasses = "mr-1 font-led text-[18px] tracking-normal text-violet";

export const toneClasses: Record<Tone, string> = {
  danger: "font-semibold text-line-low",
  safe: "font-semibold text-line-prod",
};

export const linkClasses = "text-violet-deep decoration-2 underline-offset-4";

export const ruleClasses = "my-10 border-0 border-t-2 border-dashed border-lavender";

export const tableWrapperClasses = "my-6 overflow-x-auto";

export const refGridClasses = "mt-0 mb-[1.5em] grid grid-cols-2 gap-3.5 max-sm:grid-cols-1";

export const calloutClasses = [
  "relative my-[1.8em] px-5.5 py-4.5",
  "safety-stripes bg-safety text-[17px] text-ink not-italic",
  "[&_p]:m-0",
].join(" ");

export const calloutLabelClasses = "mb-1 block font-pixel text-[15px] tracking-[0.04em]";

export const figureClasses = "my-[2em]";

export const figureImageClasses = "block w-full border-2 border-ink bg-card";

export const figureCaptionClasses = "mt-2.5 flex gap-2.5 text-[15px] text-muted";

export const figureNumberClasses = "shrink-0 font-pixel text-[13px] font-semibold text-violet";

export const inlineImageClasses = "my-6 border-2 border-ink";

export const proseTextClasses = "text-[18.5px] leading-[1.75] text-text max-sm:text-[17.5px]";
