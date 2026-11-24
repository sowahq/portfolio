<script lang="ts">
  import { prefersReducedMotion } from "svelte/motion";

  const COLORS = ["var(--color-violet)", "var(--color-highlight)", "var(--color-coral)", "var(--color-lavender)"];

  const burst = (event: MouseEvent): void => {
    if (prefersReducedMotion.current) return;
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    for (let index = 0; index < 10; index++) {
      const spark = document.createElement("i");
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 50;
      spark.className = "pixel-spark";
      spark.style.left = `${event.clientX - 4}px`;
      spark.style.top = `${event.clientY - 4}px`;
      spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
      spark.style.setProperty("--spark-color", COLORS[index % COLORS.length]);
      document.body.append(spark);
      spark.addEventListener("animationend", () => spark.remove(), { once: true });
    }
  };
</script>

<svelte:window onclick={burst} />
