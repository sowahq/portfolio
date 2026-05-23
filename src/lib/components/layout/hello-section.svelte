<script lang="ts">
  import Portrait from "$lib/components/images/portrait.png?enhanced";
    import Download from "$lib/components/icons/download.svelte";
    import Button from "$lib/components/surfaces/button.svelte";
    import { motion } from "@humanspeak/svelte-motion";

    let hovered = $state(false);
    let mx = $state(0); // -1..1 (left..right)
    let my = $state(0); // -1..1 (top..bottom)

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

<section
  class="min-h-screen flex flex-col items-center justify-between relative"
>
  <div
    class="w-5/6 lg:w-3/4 mx-auto px-4 py-16 md:flex items-center justify-between flex-grow"
  >
    <motion.div
      class="relative w-64 h-64 mx-auto md:mx-0 mb-8 md:mb-0"
      initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
      onmouseenter={() => (hovered = true)}
      onmouseleave={onLeave}
      onmousemove={onMove}
    >
      <motion.div
        class="absolute top-0 left-0 w-full h-full z-10 origin-center cursor-pointer"
        animate={
          hovered
            ? { scale: 1.08, x: mx * 8, y: my * 8 - 4 }
            : { scale: 1, x: 0, y: 0 }
        }
        transition={{
          x: { type: "spring", stiffness: 320, damping: 22 },
          y: { type: "spring", stiffness: 320, damping: 22 },
          scale: { type: "spring", stiffness: 300, damping: 14 },
        }}
      >
        <enhanced:img
          src={Portrait}
          alt="avatar"
          class="w-full h-full object-cover rounded-lg {hovered
            ? 'shadow-[6px_6px_0_0_rgb(250_204_21)]'
            : ''} transition-shadow duration-300"
        />
      </motion.div>
      <motion.div
        class="border-yellow-400 border-2 border-solid absolute top-0 left-0 w-44 h-44 z-0"
        animate={
          hovered
            ? {
                rotate: 28 + mx * 6,
                x: -56 + mx * -10,
                y: -56 + my * -10,
                scale: 1.05,
              }
            : { rotate: 12, x: -32, y: -32, scale: 1 }
        }
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      ></motion.div>
      <motion.div
        class="border-yellow-400 border-2 border-solid absolute bottom-0 right-0 w-12 h-12"
        animate={
          hovered
            ? {
                rotate: 135 + mx * 20,
                x: 32 + mx * 12,
                y: 32 + my * 12,
                scale: 1.4,
              }
            : { rotate: 45, x: 12, y: 12, scale: 1 }
        }
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
      ></motion.div>
    </motion.div>

    <motion.div
      class="md:w-1/2 text-center md:text-left flex flex-col max-md:items-center"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h1 class="text-4xl md:text-5xl font-light text-purple-600 mb-4">
        Salut,<br />moi c'est Mathis!
      </h1>
      <p class="text-gray-600 mb-6 leading-relaxed">
        Je code depuis 2016, surtout en
        <span class="text-yellow-500">Golang et l'écosystème JavaScript</span>. Ce qui me branche
        vraiment, c'est la
        <span class="text-yellow-500">rétro-ingénierie</span> : démonter des
        <span class="text-yellow-500">jeux vidéos</span> ou des
        <span class="text-yellow-500">applications</span> pour comprendre
        comment ça tourne, dénicher des bugs, faire des mods. À côté, je
        bricole de l'open source — entre autres
        <a class="text-yellow-500 underline underline-offset-2" href="https://goscord.dev">Goscord</a>, une
        API Discord en Go.
      </p>
      <Button class="w-fit" href="https://blog.mth.lc"><Download
        color="white"
        class="h-7 w-7"
      />Mon Blog</Button>
    </motion.div>
  </div>
</section>
