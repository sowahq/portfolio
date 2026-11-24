export interface StackLine {
  name: string;
  color: string;
  /** Text color readable on the line color, at least 4.5:1. */
  labelColor: string;
  stations: string[];
  more: string[];
}

export const stackLead =
  "Mes trajets les plus fréquents : Go pour l'API, SvelteKit pour le web, Flutter ou React Native pour le mobile, selon ce que votre équipe connaît déjà. Votre projet tourne sur une autre ligne ? Je prends la correspondance.";

export const stack: StackLine[] = [
  {
    name: "web",
    color: "var(--color-line-web)",
    labelColor: "var(--color-card)",
    stations: ["TypeScript", "Svelte", "SvelteKit", "React", "Next.js", "Vue"],
    more: ["JavaScript", "HTML", "CSS", "Nuxt", "Astro", "Tailwind CSS"],
  },
  {
    name: "serveur",
    color: "var(--color-line-server)",
    labelColor: "var(--color-ink)",
    stations: ["Go", "Node.js", "Bun", "NestJS", "PHP", "Symfony"],
    more: ["Fiber", "Gin", "Hono", "REST", "GraphQL", "WebSockets", "OAuth 2.0"],
  },
  {
    name: "mobile & bureau",
    color: "var(--color-line-mobile)",
    labelColor: "var(--color-ink)",
    stations: ["Flutter", "React Native", "Expo", "Tauri", "Electron"],
    more: ["Capacitor", "Swift", "Wails"],
  },
  {
    name: "données",
    color: "var(--color-line-data)",
    labelColor: "var(--color-card)",
    stations: ["PostgreSQL", "MySQL", "MariaDB", "Redis", "MongoDB", "SQLite"],
    more: ["SQL", "Prisma", "Drizzle"],
  },
  {
    name: "prod",
    color: "var(--color-line-prod)",
    labelColor: "var(--color-ink)",
    stations: ["Docker", "Linux", "Git", "GitHub Actions", "Vercel"],
    more: ["Docker Compose", "CI/CD", "Cloudflare Workers"],
  },
  {
    name: "bas niveau",
    color: "var(--color-line-low)",
    labelColor: "var(--color-card)",
    stations: ["Rust", "C++", "C#", "WebAssembly"],
    more: ["C", ".NET"],
  },
];

/**
 * The technologies on the main lines of the stack map, the ones worth naming in structured data.
 */
export function stackTechnologies(): string[] {
  return stack.flatMap((line) => line.stations);
}
