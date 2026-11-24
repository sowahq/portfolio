import { sites } from "@mth/ui";
import type { Teardown } from "./types.js";

const BLOG = `${sites.blog}/posts`;

export const teardowns: Teardown[] = [
  {
    title: "J'ai reverse un frigo de voiture (oui.)",
    href: `${BLOG}/reverse-frigo-de-voiture-tuya-ble`,
    tags: ["bluetooth", "tuya"],
    target: "frigo Tuya",
    tilt: -1.5,
  },
  {
    title: "Steamworks : le jeu vous croit sur parole",
    href: `${BLOG}/steamworks-le-jeu-vous-croit-sur-parole`,
    tags: ["dlc", "vtable hooking"],
    target: "steam_api64",
    tilt: 1,
  },
  {
    title: "Les nanomites d'Armadillo",
    href: `${BLOG}/les-nanomites-d-armadillo`,
    tags: ["anti-debug", "asm"],
    target: "CC INT3 NM",
    tilt: -0.5,
  },
];
