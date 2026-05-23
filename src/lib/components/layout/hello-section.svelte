<script lang="ts">
  import Portrait from "$lib/components/images/portrait.png?enhanced";
    import Download from "$lib/components/icons/download.svelte";
    import Button from "$lib/components/surfaces/button.svelte";
</script>

<section
  class="min-h-screen flex flex-col items-center justify-between relative"
>
  <div
    class="w-5/6 lg:w-3/4 mx-auto px-4 py-16 md:flex items-center justify-between flex-grow"
  >
    <div class="relative w-64 h-64 mx-auto md:mx-0 mb-8 md:mb-0">
      <enhanced:img
        src={Portrait}
        alt="avatar"
        class="absolute top-0 left-0 w-full h-full object-cover z-10 rounded-lg hover:scale-110 hover:rotate-12 transition-transform duration-300"
      />
      <div
        class="border-yellow-400 border-2 border-solid absolute top-0 left-0 w-44 h-44 rotate-12 z-0 transform -translate-x-8 -translate-y-8"
      ></div>
      <div
        class="border-yellow-400 border-2 border-solid absolute bottom-0 right-0 w-12 h-12 rotate-45 transform translate-x-3 translate-y-3"
      ></div>
    </div>

    <div class="md:w-1/2 text-center md:text-left flex flex-col max-md:items-center">
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
    </div>
  </div>
</section>
