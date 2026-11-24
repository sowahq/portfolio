import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { earlyPaint } from "@mth/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const BUILT_AT = new Date().toISOString();

export default defineConfig({
  define: {
    __BUILT_AT__: JSON.stringify(BUILT_AT),
  },

  plugins: [
    earlyPaint(),
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
      inlineStyleThreshold: Number.POSITIVE_INFINITY,
    }),
  ],

  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ["../../packages/ui"],
    },
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  test: {
    include: ["src/**/*.test.ts"],
    environment: "jsdom",
    server: {
      deps: {
        inline: [/@fontsource-variable/],
      },
    },
  },
});
