/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ["Minecraft", "sans-serif"],
      },
      boxShadow: {
        "pixel-art": "-3px 0 0 0, 3px 0 0 0, 0 -3px 0 0, 0 3px 0 0",
        pixel: "6px 6px 0 0",
        "pixel-sm": "3px 3px 0 0",
      },
    },
  },
  plugins: [],
};
