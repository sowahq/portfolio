export type ExperienceType = "OPEN SOURCE" | "PRO";

export type Experience = {
  title: string;
  company: string;
  date: {
    start?: number | null;
    end?: number | null;
  };
  href?: string | null;
  description: string[];
  skills: string[];
};

export const experiences: Experience[] = [
  {
    company: "Fondation CGénial",
    title: "Développement Frontend & Consulting Tech",
    date: {
      start: Date.parse("2026-04-01"),
      end: null,
    },
    description: [
      "Accompagnement de la Fondation CGénial dans la modernisation critique de leur écosystème numérique, avec un focus particulier sur la transition vers les technologies de pointe.",
      "Participation active et conseil stratégique sur le passage vers Svelte 5 (Runes, Snippets). Optimisation de la réactivité et simplification de la base de code pour une meilleure maintenabilité.",
      "Refonte des composants pour exploiter les nouveaux paradigmes de Svelte, garantissant des performances accrues et une expérience utilisateur fluide.",
      "Audit de l'existant et définition de la roadmap technique pour assurer la pérennité des outils digitaux de la Fondation.",
      "Refonte des process de développement et du process de déploiement"
    ],
    skills: ["Svelte", "MariaDB", "Docker", "PHP", "Symfony"],
    href: "https://cgenial-connect.fr/",
  },
  {
    company: "Startup logistique",
    title: "Développement Full-Stack & Mobile (A à Z)",
    date: {
      start: Date.parse("2025-09-01"),
      end: Date.parse("2026-02-01"),
    },
    description: [
      "Conception et développement de A à Z de l'ensemble de la stack",
      "Landing page et panel d'administration en SvelteKit",
      "Back-end en Go",
      "Applications mobiles en Flutter (iOS & Android)",
      "DevOps : conteneurisation Docker, CI/CD et déploiement",
    ],
    skills: ["Svelte", "SvelteKit", "Go", "Flutter", "Docker", "CI/CD", "DevOps"],
  },
  {
    company: "Ongamecloud",
    title: "Création d'une plateforme d'hébergement",
    date: {
      start: Date.parse("2024-03-01"),
      end: null,
    },
    description: [
      "Mise en place d'un back-end en Go",
      "Mise en place d'un front-end (Svelte/SvelteKit)",
      "Mise en place d'une base de donnée PostgreSQL & Redis",
      "Gestion automatique de containers avec Docker",
      "Conception et développement d'une application mobile avec Flutter",
    ],
    skills: ["Go", "Svelte", "Redis", "PostgreSQL", "Docker", "Flutter"],
    href: "https://ongamecloud.com",
  },
  {
    company: "Anclave",
    title: "Collectif open source & entreprise",
    date: {
      start: Date.parse("2024-03-01"),
      end: null,
    },
    description: [
      "Mise en place d'un back-end en Go",
      "Mise en place d'un serveur OAuth 2.0 en Rust",
      "Mise en place d'un front-end (Svelte/SvelteKit)",
      "Mise en place d'un dashboard en Svelte/SvelteKit",
      "Gestion automatique de containers avec Docker",
      "Mise en place d'une base de donnée PostgreSQL & Redis",
    ],
    skills: ["Go", "Rust", "Svelte", "Redis", "PostgreSQL", "Docker", "Mikrotik"],
    href: "https://github.com/anhostfr"
  },
  {
    company: "Hangar",
    title: "Object storage léger en Go",
    date: {
      start: Date.parse("2025-08-19"),
      end: null,
    },
    description: [
      "Conception d'un service de stockage objet en Go",
      "API compatible S3, déploiement auto-hébergeable",
      "Focus sur la simplicité et la faible empreinte",
    ],
    href: "https://github.com/sowahq/hangar",
    skills: ["Go", "S3", "Object Storage"],
  },
  {
    company: "LitePay",
    title: "Processeur de paiement crypto self-hosted",
    date: {
      start: Date.parse("2024-12-17"),
      end: null,
    },
    description: [
      "Processeur de paiement crypto self-hosted (Bitcoin, Litecoin, Solana)",
      "Sans intermédiaire, sans frais, sans garde tierce",
      "Architecture orientée souveraineté et auto-hébergement",
    ],
    href: "https://github.com/sowahq/litepay",
    skills: ["Go", "Bitcoin", "Litecoin", "Solana", "Self-hosted"],
  },
  {
    company: "Goscord",
    title: "Intégration de l'API Discord en Go",
    date: {
      start: Date.parse("2020-10-11"),
      end: null,
    },
    description: [
      "Gestion d'événements WebSocket",
      "Découverte des défis liés à l'intégration de l'API Discord en Go",
      "Review de code et contribution à l'open source",
    ],
    href: "https://goscord.dev",
    skills: ["Golang", "UDP", "WebSocket", "Docker"],
  },
  {
    company: "MoonlyClient",
    title: "Développement d'un client Minecraft Bedrock",
    date: {
      start: Date.parse("2021-01-16"),
      end: Date.parse("2022-02-02"),
    },
    description: [
      "Développement d'un client Minecraft Bedrock en C++",
      "Développement d'un launcher Minecraft Bedrock en C#",
      "Rétro-ingénierie du client Minecraft Bedrock",
    ],
    href: "https://github.com/MoonlyClient",
    skills: ["C++", "C#", "Reverse Engineering"],
  },
];
