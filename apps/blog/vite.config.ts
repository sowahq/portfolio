/// <reference types="vitest/config" />
import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { earlyPaint } from "@mth/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
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
    port: 5174,
    strictPort: true,
    fs: {
      allow: ["../../packages/ui"],
    },
  },

  preview: {
    port: 4174,
    strictPort: true,
  },

  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    css: { include: [/theme\.css/] },
    server: {
      deps: {
        inline: [/@fontsource-variable/],
      },
    },
  },
});
