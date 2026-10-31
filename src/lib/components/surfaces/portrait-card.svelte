<script lang="ts">
  import Portrait from "#lib/components/images/portrait.png?enhanced";
  import { motion } from "@humanspeak/svelte-motion";

  interface PortraitCardProps {
    class?: string;
  }

  const { class: className = "" }: PortraitCardProps = $props();

  let hovered = $state(false);
  let mx = $state(0);
  let my = $state(0);

  function onMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }

  function onLeave() {
    hovered = false;
    mx = 0;
    my = 0;
  }
</script>

<motion.div
  class="relative h-64 w-64 {className}"
  initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
  onmouseenter={() => (hovered = true)}
  onmouseleave={onLeave}
  onmousemove={onMove}
>
  <motion.div
    class="absolute left-0 top-0 z-10 h-full w-full origin-center cursor-pointer"
    animate={hovered ? { scale: 1.08, x: mx * 8, y: my * 8 - 4 } : { scale: 1, x: 0, y: 0 }}
    transition={{
      x: { type: "spring", stiffness: 320, damping: 22 },
      y: { type: "spring", stiffness: 320, damping: 22 },
      scale: { type: "spring", stiffness: 300, damping: 14 },
    }}
  >
    <enhanced:img
      src={Portrait}
      alt="avatar"
      class="h-full w-full object-cover shadow-yellow-400 transition-shadow duration-300 {hovered
        ? 'shadow-pixel'
        : ''}"
    />
  </motion.div>
  <motion.div
    class="absolute left-0 top-0 z-0 h-44 w-44 border-2 border-solid border-yellow-400"
    animate={hovered
      ? { rotate: 28 + mx * 6, x: -56 + mx * -10, y: -56 + my * -10, scale: 1.05 }
      : { rotate: 12, x: -32, y: -32, scale: 1 }}
    transition={{ type: "spring", stiffness: 220, damping: 16 }}
  ></motion.div>
  <motion.div
    class="absolute bottom-0 right-0 h-12 w-12 border-2 border-solid border-yellow-400"
    animate={hovered
      ? { rotate: 135 + mx * 20, x: 32 + mx * 12, y: 32 + my * 12, scale: 1.4 }
      : { rotate: 45, x: 12, y: 12, scale: 1 }}
    transition={{ type: "spring", stiffness: 220, damping: 14 }}
  ></motion.div>
</motion.div>
