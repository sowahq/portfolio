import type { Component } from "svelte";
import type { IconProps } from "#lib/components/icons/index.js";

export interface Skill {
  name: string;
  href?: string | null;
  icon: Component<IconProps> | null;
}

export const skills: Skill[] = [
  { name: "Svelte", href: "https://svelte.dev", icon: null },
  { name: "Next.js", href: "https://nextjs.org", icon: null },
  { name: "Node.js", href: "https://nodejs.org", icon: null },
  { name: "Golang", href: "https://go.dev", icon: null },
  { name: "TypeScript", href: "https://www.typescriptlang.org", icon: null },
  { name: "Docker", href: "https://www.docker.com", icon: null },
  { name: "PostgreSQL", href: "https://www.postgresql.org", icon: null },
];
