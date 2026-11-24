import type { OpenSourceStop, Stop } from "./types.js";

export const lineLead =
  "Quatre arrêts en pro depuis 2024, et une ligne 2 pour l'open source, ouverte en 2020. Sous chaque arrêt, les correspondances : les technos du trajet.";

export const stops: Stop[] = [
  {
    title: "Fondation CGénial",
    href: "https://cgenial-connect.fr",
    period: "2026",
    role: "développeur full-stack & consultant tech · freelance",
    summary: [
      "CGénial Connect fait se rencontrer des profs et des entreprises. La migration vers Svelte 5 était à moitié faite quand je suis arrivé : ",
      { mark: "je l'ai finie et mise en ligne sans couper le site" },
      ".",
    ],
    stack: ["Svelte", "PHP", "Symfony", "MariaDB"],
    ongoing: true,
    note: "← toujours en cours",
  },
  {
    title: "Start-up logistique",
    period: "2025 – 2026",
    role: "CTO & développeur · freelance",
    summary: [
      "Leur outil interne datait. ",
      { mark: "Je l'ai refait en entier" },
      " : une API en Go pour les flux logistiques, un back-office web, une appli mobile, et une doc pour que l'équipe s'en sorte sans moi.",
    ],
    stack: ["Go", "SvelteKit", "Flutter", "CI/CD"],
  },
  {
    title: "Plateforme de streaming",
    period: "2024 – 2025",
    role: "développeur full-stack",
    summary: [
      "De la vidéo à la demande sur ordi, téléphone et tablette. ",
      { mark: "La qualité baisse toute seule quand la connexion rame" },
      ", et les vidéos sont protégées par DRM.",
    ],
    stack: ["Go", "SvelteKit", "Flutter", "HLS"],
  },
  {
    title: "OnGameCloud",
    href: "https://ongamecloud.com",
    period: "2024",
    role: "cofondateur · architecte cloud & full-stack",
    summary: [
      "Un hébergeur de serveurs Minecraft, Palworld, Rust et d'autres. On choisit son jeu, et ",
      { mark: "le serveur tourne quelques secondes après" },
      ".",
    ],
    stack: ["Go", "PostgreSQL", "Redis", "Docker"],
    ongoing: true,
    note: "cofondé ↓",
  },
];

export const openSource: OpenSourceStop[] = [
  {
    title: "compress.lol",
    href: "https://compress.lol",
    period: "2025",
    role: "créateur",
    summary: "Compresser une vidéo dans le navigateur, sans l'envoyer nulle part.",
    open: true,
    badge: "300+ étoiles",
  },
  {
    title: "Anclave",
    period: "2024",
    role: "architecte cloud",
    summary: "Un collectif qui fabrique et partage des logiciels libres, dont compress.lol.",
    open: true,
  },
  {
    title: "Goscord",
    period: "2020 – 2024",
    role: "mainteneur principal",
    summary: "Une boîte à outils en Go pour créer des bots Discord.",
    open: false,
  },
  {
    title: "Virtual Royaume",
    period: "2020 – 2023",
    role: "dev & coordinateur",
    summary: "Une communauté de devs bénévoles : API GraphQL, sites et bots.",
    open: false,
  },
  {
    title: "MoonlyClient",
    period: "2021 – 2022",
    role: "ingénieur logiciel",
    summary: "Un client Minecraft Bedrock amélioré, par rétro-ingénierie.",
    open: false,
  },
];
