<script lang="ts">
  import Contact from "#lib/sections/Contact.svelte";
  import Depot from "#lib/sections/Depot.svelte";
  import Hero from "#lib/sections/Hero.svelte";
  import Line from "#lib/sections/Line.svelte";
  import Missions from "#lib/sections/Missions.svelte";
  import Network from "#lib/sections/Network.svelte";
  import { PAGE, portfolioJsonLd, portfolioOgImage } from "#lib/seo.js";
  import { AUTHOR, Seo } from "@mth/ui/seo";
</script>

<Seo
  title={PAGE.title}
  description={PAGE.description}
  siteName={PAGE.siteName}
  url={PAGE.url}
  image={portfolioOgImage()}
  type="profile"
  profile={AUTHOR}
  jsonLd={portfolioJsonLd()}
/>

<Hero />

<main>
  <Missions />
  <Line />
  <Network />
  <Depot />
  <Contact />
</main>
