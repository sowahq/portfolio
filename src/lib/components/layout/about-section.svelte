<script lang="ts">
  import AboutText from "#lib/components/surfaces/about-text.svelte";
  import { experiences } from "#lib/config/experience/index.js";
  import { skills } from "#lib/config/skill/index.js";
  import Link from "../icons/link.svelte";
  import { Button } from "../surfaces";
  import TimelineTitle from "../surfaces/timeline-title.svelte";
  import { profile } from "#lib/config/profile/index.js";
  import { formatPeriod } from "#lib/utils/index.js";
  import { easeOutBack, easeOutCubic, popIn, riseIn, slideIn } from "#lib/fx/index.js";
  import { motion } from "@humanspeak/svelte-motion";
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let stickerShown = $state(false);
  let openExperience = $state<string | null>(null);

  const toggleExperience = (company: string): void => {
    openExperience = openExperience === company ? null : company;
  };

  const detailsId = (company: string): string => `experience-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
</script>

<section class="relative min-h-screen w-full px-4 flex flex-col items-center pb-4">
  <div class="flex flex-col items-center mb-4 space-y-2">
    <motion.div class="border-purple-400 border-2 border-solid h-10 w-10" {...popIn(0)}></motion.div>
    <motion.div {...popIn(1)}>
      <div class="border-purple-400 border-[3px] border-solid h-8 w-28 transform -translate-x-14"></div>
    </motion.div>
  </div>

  <motion.div
    class="relative z-10"
    initial={{ opacity: 0, scale: 0.3, rotate: 40 }}
    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: easeOutBack }}
    onInViewStart={() => (stickerShown = true)}
  >
    <AboutText />
  </motion.div>

  <div class="-mt-8 h-16 md:h-24" aria-hidden="true"></div>

  <div class="w-full">
    <div class="md:w-3/4 mx-auto rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 md:gap-8">
        <div class="pb-12">
          <TimelineTitle>technologies</TimelineTitle>
          <div class="flex flex-wrap gap-4">
            {#each skills as sk, i (sk.name)}
              <motion.div {...riseIn(i, 20)}>
                <Button href={sk.href}>
                  {sk.name}
                </Button>
              </motion.div>
            {/each}
          </div>
        </div>

        <div class="relative border-l-2 border-purple-600 pl-4 pb-8 max-md:row-start-3 md:-ml-[17px]">
          <motion.div
            class="absolute -left-0.5 bottom-full h-36 w-0.5 bg-purple-600 origin-top max-md:hidden"
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: stickerShown ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: easeOutCubic }}
          ></motion.div>
          <TimelineTitle>formations</TimelineTitle>
          {#each profile.education as edu, i (edu.title)}
            <motion.div class="mb-4 relative pl-6" {...slideIn(i)}>
              <motion.div
                class="absolute top-2 -left-[1.3rem] h-2 w-2 bg-white border border-purple-600"
                {...popIn(i)}
              ></motion.div>
              <p class="text-purple-600 font-semibold">{edu.period}</p>
              <p class="font-bold">{edu.title}</p>
              <p class="text-sm text-gray-600">{edu.detail}</p>
            </motion.div>
          {/each}
        </div>

        <div class="flex flex-col gap-8 pb-12 md:pb-0">
          <div class="md:-mt-12">
            <TimelineTitle>me contacter</TimelineTitle>
            <div class="flex flex-wrap gap-4 text-sm md:text-lg">
              {#each profile.contacts as sw, i (sw.name)}
                <motion.div {...riseIn(i, 20)}>
                  <Button href={sw.link}>
                    {#if sw.icon}
                      <sw.icon color="white" class="h-5 w-5 md:h-6 md:w-6" />
                    {/if}
                    {sw.name}
                  </Button>
                </motion.div>
              {/each}
            </div>
          </div>

          <div>
            <TimelineTitle>mes passions</TimelineTitle>
            <div class="flex flex-wrap gap-4 text-sm md:text-lg">
              {#each profile.interests as pa, i (pa)}
                <motion.div {...riseIn(i, 20)}>
                  <Button>
                    {pa}
                  </Button>
                </motion.div>
              {/each}
            </div>
          </div>
        </div>

        <div class="border-l-2 border-purple-600 pl-4 pb-12 max-md:row-start-4 md:-ml-[17px] md:-mt-12">
          <TimelineTitle>mes experiences</TimelineTitle>
          {#each experiences as exp, i (exp.company)}
            {@const open = openExperience === exp.company}
            <motion.div class="mb-4 relative pl-6" {...slideIn(i)}>
              <motion.div
                class="absolute top-2 -left-[1.3rem] h-2 w-2 border border-purple-600 {exp.date.end ? 'bg-white' : 'bg-yellow-300'}"
                {...popIn(i)}
              ></motion.div>
              <p class="text-purple-600 font-semibold">
                {formatPeriod(exp.date)}
              </p>

              {#if exp.href}
                <a class="text-md md:text-lg flex gap-2 group" href={exp.href} rel="external">
                  <p class="font-bold">
                    {exp.company}
                    <span
                      class="-mt-1 block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-black"
                    ></span>
                  </p>
                  <Link size="1.2rem" color="black" class="mt-0.5" />
                </a>
              {:else}
                <h2 class="text-md md:text-lg flex gap-2 group">
                  <p class="font-bold">
                    {exp.company}
                  </p>
                </h2>
              {/if}

              <p class="text-sm text-gray-600">{exp.title}</p>
              <p class="text-sm text-gray-600">{exp.skills.join(", ")}</p>

              {#if exp.description.length > 0}
                <button
                  type="button"
                  class="mt-1 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                  aria-expanded={open}
                  aria-controls={detailsId(exp.company)}
                  onclick={() => toggleExperience(exp.company)}
                >
                  <span
                    class="block h-2 w-2 border border-purple-600 transition-colors duration-200 {open
                      ? 'bg-purple-600'
                      : 'bg-transparent'}"
                    aria-hidden="true"
                  ></span>
                  {open ? "masquer le détail" : "voir le détail"}
                </button>
              {/if}

              {#if open}
                <ul
                  id={detailsId(exp.company)}
                  class="mt-2 flex flex-col gap-1 border-l border-purple-200 pl-3 text-sm text-gray-600"
                  transition:slide={{ duration: 260, easing: cubicOut }}
                >
                  {#each exp.description as line (line)}
                    <li class="flex gap-2">
                      <span class="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-yellow-400" aria-hidden="true"></span>
                      {line}
                    </li>
                  {/each}
                </ul>
              {/if}
            </motion.div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
