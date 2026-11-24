declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component<Record<string, unknown>>;
  export default component;
}

declare module "*?url" {
  const url: string;
  export default url;
}

declare module "*?raw" {
  const source: string;
  export default source;
}

declare module "*?inline" {
  const dataUrl: string;
  export default dataUrl;
}
