/// <reference types="vitest/config" />
import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { svelteMotionOptimize } from "@humanspeak/svelte-motion/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    enhancedImages(),
    svelteMotionOptimize(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
    environment: "jsdom",
  },
});
