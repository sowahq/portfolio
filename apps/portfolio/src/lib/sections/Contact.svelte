<script lang="ts">
  import { profileLinks as links, sites } from "@mth/ui";

  const year = new Date().getFullYear();
</script>

<section id="contact" aria-labelledby="contact-title" class="pt-30">
  <div class="page-wrap">
    <div
      class="grid -rotate-[0.6deg] grid-cols-[minmax(0,1fr)_260px] bg-card shadow-[8px_8px_0_var(--color-ink)] max-lg:grid-cols-1"
    >
      <div class="p-11 max-lg:px-6.5 max-lg:py-8">
        <h2 id="contact-title" class="text-[clamp(40px,5vw,64px)] leading-[0.98]">
          Un aller simple pour votre projet.
        </h2>

        <p class="mt-5.5 mb-7 max-w-[30em] text-lg">
          Dites-moi en quelques lignes ce que vous voulez faire, ou ce qui bloque. Je vous réponds avec ce que j'en
          pense et comment je m'y prendrais.
        </p>

        <div class="flex flex-wrap items-center gap-x-5.5 gap-y-4">
          <a class="btn max-sm:px-4 max-sm:text-base" href="mailto:{links.email}">Écrire à {links.email}</a>
          <a class="btn btn-ghost" href={links.linkedin}>LinkedIn</a>
        </div>

        <small class="mt-5.5 block text-[15px] text-muted">Un poste en CDI ? J'étudie ça au cas par cas.</small>
      </div>

      <div
        class="flex flex-col justify-between border-l-3 border-dashed border-lavender px-7 py-11 font-pixel font-semibold text-ink max-lg:flex-row max-lg:flex-wrap max-lg:justify-start max-lg:gap-x-7 max-lg:gap-y-4 max-lg:border-t-3 max-lg:border-l-0 max-lg:py-5"
        aria-hidden="true"
      >
        <div>
          <b class="text-xl">départ</b><br />
          <span class="text-[15px] text-muted">Lille</span>
        </div>

        <div>
          <b class="text-xl">arrivée</b><br />
          <span class="text-[15px] text-muted">votre projet</span>
        </div>

        <span class="text-[13px] tracking-[0.2em] text-violet max-lg:hidden">MTH · LC · {year}</span>
      </div>
    </div>

    <footer
      class="mt-24 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-2 border-dashed border-lavender pt-7 pb-10 font-pixel text-sm font-semibold tracking-[-0.02em] text-ink"
    >
      <span>
        © {year} Mathis Lutic · Lille
      </span>

      <nav aria-label="Liens" class="flex gap-5">
        <a class="link-pixel" href={links.github}>github</a>
        <a class="link-pixel" href={links.linkedin}>linkedin</a>
        <a class="link-pixel" href={sites.blog}>blog</a>
      </nav>
    </footer>
  </div>
</section>
