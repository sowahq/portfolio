<script lang="ts">
  import { motion } from "@humanspeak/svelte-motion";
  import Portrait from "#lib/components/images/portrait.png?enhanced";
  import {
    DitherGlow,
    FloatingSquares,
    HexBackdrop,
    HexFlashlight,
    ParticleLayer,
    PixelCurtain,
    PixelReveal,
    SpriteGrid,
  } from "#lib/components/fx/index.js";
  import { Button, TimelineTitle } from "#lib/components/surfaces/index.js";
  import { profile } from "#lib/config/profile/index.js";
  import { easeOutCubic, GLYPH_CHARSET, pixelPop, pixelSlide, scramble } from "#lib/fx/index.js";

  const CHIPS = ["golang", "svelte", "rétro-ingénierie", "open-source", "jeux-vidéo"];

  const BACKDROPS = [
    { id: "grid", title: "grille sprite (en place)", hint: "survole : les cases s'allument puis s'éteignent" },
    { id: "dither", title: "dégradé tramé", hint: "taches de couleur en pixels tramés qui dérivent lentement" },
    { id: "flashlight", title: "hexdump lampe torche", hint: "le hexdump n'apparaît que sous la souris" },
    { id: "squares", title: "carrés flottants", hint: "le motif des carrés, avec parallaxe à la souris" },
  ] as const;

  let curtain: ReturnType<typeof PixelCurtain>;
  let portrait: ReturnType<typeof PixelReveal>;
  let trail = $state(true);
  let burst = $state(true);
  let easingRun = $state(0);
  let decodeRun = $state(0);

  const playCurtain = async (event: MouseEvent): Promise<void> => {
    const origin = { x: event.clientX, y: event.clientY };
    await curtain.cover(origin);
    await curtain.reveal(origin);
  };
</script>

<svelte:head>
  <title>Lab - effets pixel</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<ParticleLayer {trail} {burst} />
<PixelCurtain bind:this={curtain} />

<div class="mx-auto flex w-5/6 max-w-5xl flex-col gap-24 py-16 lg:w-3/4">
  <header class="flex flex-col gap-4">
    {#key decodeRun}
      <h1 class="text-4xl text-purple-600 md:text-5xl" {@attach scramble({ trigger: "mount", duration: 1100 })}>
        lab.fx — effets pixel
      </h1>
    {/key}
    <p class="max-w-2xl leading-relaxed text-gray-600">
      Bac à sable de la couche FX : svelte-motion pour le mouvement d'interface, un moteur canvas maison pour tout ce qui
      est pixel. Chaque bloc est rejouable.
    </p>
    <Button class="w-fit" onclick={() => decodeRun++}>rejouer le titre</Button>
  </header>

  <section class="space-y-6">
    <TimelineTitle>00 · fonds du hero</TimelineTitle>
    <p class="max-w-2xl text-gray-600">Les quatre pistes de fond pour le hero, à comparer en vrai.</p>
    <div class="grid gap-6 md:grid-cols-2">
      {#each BACKDROPS as backdrop (backdrop.id)}
        <div class="relative flex h-80 flex-col items-center justify-center gap-2 overflow-hidden border-2 border-purple-600 bg-gradient-to-br from-purple-200 to-white p-6 text-center">
          {#if backdrop.id === "grid"}
            <SpriteGrid />
          {:else if backdrop.id === "dither"}
            <DitherGlow class="opacity-40" />
          {:else if backdrop.id === "flashlight"}
            <HexFlashlight text={profile.bio} class="opacity-60" />
          {:else}
            <FloatingSquares class="opacity-60" />
          {/if}
          <p class="relative text-2xl text-purple-600">{backdrop.title}</p>
          <p class="relative text-sm text-gray-600">{backdrop.hint}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="space-y-6">
    <TimelineTitle>01 · rideau pixel</TimelineTitle>
    <p class="max-w-2xl text-gray-600">
      Transition plein écran qui se propage depuis le point cliqué. Branchée sur <code>onNavigate</code>, elle remplace
      les transitions de page.
    </p>
    <Button class="w-fit" onclick={playCurtain}>lancer depuis le clic</Button>
  </section>

  <section class="space-y-6">
    <TimelineTitle>02 · apparition en pixels</TimelineTitle>
    <p class="max-w-2xl text-gray-600">Le contenu se « dessine » bloc par bloc à l'entrée dans l'écran.</p>
    <div class="flex flex-wrap items-center gap-8">
      <PixelReveal bind:this={portrait} class="h-64 w-64" cell={16} from="top-left">
        <enhanced:img src={Portrait} alt="avatar" class="h-full w-full object-cover" />
      </PixelReveal>
      <PixelReveal class="h-64 w-64" cell={8} color="highlight" from="center">
        <div class="flex h-full w-full items-center justify-center border-2 border-purple-600 bg-white p-6 text-center text-purple-600">
          carte projet révélée depuis le centre
        </div>
      </PixelReveal>
    </div>
    <Button class="w-fit" onclick={() => portrait.play()}>rejouer le portrait</Button>
  </section>

  <section class="space-y-6">
    <TimelineTitle>03 · texte décodé</TimelineTitle>
    <p class="max-w-2xl text-gray-600">
      Clin d'œil à la rétro-ingénierie : le texte se résout depuis de l'hexa. Au survol pour les tags, à l'entrée dans
      l'écran pour les titres.
    </p>
    <p class="text-2xl text-purple-600" {@attach scramble({ trigger: "view", duration: 1400 })}>
      0x2016 : premier commit, jamais arrêté depuis
    </p>
    <div class="flex flex-wrap gap-4">
      {#each CHIPS as chip (chip)}
        <span
          class="bg-purple-500 px-4 py-2 text-white shadow-pixel-art shadow-purple-500"
          {@attach scramble({ trigger: "hover", duration: 450, charset: GLYPH_CHARSET })}>{chip}</span
        >
      {/each}
    </div>
  </section>

  <section class="space-y-6">
    <TimelineTitle>04 · hexdump vivant</TimelineTitle>
    <p class="max-w-2xl text-gray-600">
      La bio du hero encodée en vrais octets, qui défile comme dans un éditeur hexa. La ligne sous le curseur
      s'allume. Pensé comme fond discret derrière le hero.
    </p>
    <div class="relative h-72 overflow-hidden border-2 border-purple-600 bg-white">
      <HexBackdrop text={profile.bio} class="p-4" />
    </div>
  </section>

  <section class="space-y-6">
    <TimelineTitle>05 · particules</TimelineTitle>
    <p class="max-w-2xl text-gray-600">
      Traînée de pixels derrière la souris et gerbe au clic, alignées sur une grille de 4px. Désactivées si
      <code>prefers-reduced-motion</code>.
    </p>
    <div class="flex flex-wrap gap-4">
      <Button onclick={() => (trail = !trail)}>traînée : {trail ? "on" : "off"}</Button>
      <Button onclick={() => (burst = !burst)}>gerbe au clic : {burst ? "on" : "off"}</Button>
    </div>
  </section>

  <section class="space-y-6">
    <TimelineTitle>06 · easing 8-bit</TimelineTitle>
    <p class="max-w-2xl text-gray-600">
      Même animation svelte-motion, courbe lisse en haut, échantillonnée en 6 images en bas (<code>steps()</code>).
      L'easing est réutilisable partout.
    </p>
    {#key easingRun}
      <div class="flex flex-col gap-4 border-2 border-purple-600 bg-white p-4">
        <motion.div
          class="h-10 w-10 bg-purple-300"
          initial={{ x: 0 }}
          animate={{ x: 320 }}
          transition={{ duration: 1.2, ease: easeOutCubic }}
        ></motion.div>
        <motion.div
          class="h-10 w-10 bg-purple-600"
          initial={{ x: 0 }}
          animate={{ x: 320 }}
          transition={{ duration: 1.2, ease: pixelSlide }}
        ></motion.div>
        <motion.div
          class="h-10 w-10 border-2 border-purple-600 bg-yellow-300"
          initial={{ scale: 0.2, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: pixelPop }}
        ></motion.div>
      </div>
    {/key}
    <Button class="w-fit" onclick={() => easingRun++}>rejouer</Button>
  </section>
</div>
