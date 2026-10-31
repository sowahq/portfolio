<script lang="ts">
  import { DitherGlow } from "#lib/components/fx/index.js";
  import Link from "#lib/components/icons/link.svelte";
  import { Button, Highlight, PortraitCard } from "#lib/components/surfaces/index.js";
  import { motion } from "@humanspeak/svelte-motion";
</script>

<section class="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden">
  <DitherGlow
    class="opacity-40 [mask-composite:intersect] [mask-image:radial-gradient(ellipse_45%_40%_at_60%_50%,rgb(0_0_0/0.25),black_100%),linear-gradient(to_bottom,black_60%,transparent)]"
  />
  <div
    class="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-14 px-8 py-16 md:flex-row md:justify-center md:gap-20"
  >
    <PortraitCard class="shrink-0 md:h-72 md:w-72" />

    <motion.div
      class="flex w-full max-w-xl flex-col text-center max-md:items-center md:text-left"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h1 class="mb-4 text-4xl font-light text-purple-600 md:text-5xl">
        Salut,<br />moi c'est Mathis!
      </h1>
      <p class="mb-8 leading-relaxed text-gray-600">
        Je code depuis 2016, surtout en
        <Highlight>Golang et l'écosystème JavaScript</Highlight>. Ce qui me branche vraiment, c'est la
        <Highlight>rétro-ingénierie</Highlight> : démonter des <Highlight>jeux vidéos</Highlight> ou des
        <Highlight>applications</Highlight> pour comprendre comment ça tourne, dénicher des bugs, faire des mods. À côté,
        je bricole de l'open source, entre autres
        <a class="transition-opacity duration-150 hover:opacity-70" href="https://goscord.dev"
          ><Highlight>Goscord</Highlight></a
        >, une API Discord en Go.
      </p>
      <div class="flex flex-wrap gap-4 max-md:justify-center">
        <Button href="https://blog.mth.lc"><Link size="1.2rem" color="white" />Mon Blog</Button>
      </div>
    </motion.div>
  </div>
</section>
