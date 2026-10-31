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
    title: "Développeur frontend & consultant technique",
    date: {
      start: Date.parse("2026-04-01"),
      end: null,
    },
    description: [
      "Coûts d'hébergement de CGénial Connect fortement réduits.",
      "Mise en place d'Ark UI sur l'ensemble du projet : une base de composants accessibles et cohérents pour toute l'interface.",
      "Base de code simplifiée et plus facile à maintenir grâce à la migration vers Svelte 5 (runes, snippets), que j'ai recommandée et menée.",
      "Feuille de route technique établie à partir d'un audit de l'existant.",
      "Processus de développement et chaîne de déploiement remis à plat.",
    ],
    skills: ["Svelte", "Ark UI", "PHP", "Symfony", "MariaDB", "Docker"],
    href: "https://cgenial-connect.fr/",
  },
  {
    company: "Start-up logistique & transport",
    title: "Lead développeur full-stack · refonte logistique",
    date: {
      start: Date.parse("2025-09-01"),
      end: Date.parse("2026-02-01"),
    },
    description: [
      "Base technique obsolète remplacée : audit, puis pilotage de la migration complète vers une architecture maintenable.",
      "Back-end en Go pour la gestion des flux logistiques.",
      "Plateforme web et back-office en SvelteKit, applications mobiles iOS et Android en Flutter.",
      "Produit livré documenté et prêt pour la production, avec conteneurisation Docker et CI/CD.",
    ],
    skills: ["Go", "SvelteKit", "Flutter", "Docker", "CI/CD"],
  },
  {
    company: "OnGameCloud",
    title: "Architecte cloud & développeur full-stack",
    date: {
      start: Date.parse("2024-03-01"),
      end: null,
    },
    description: [
      "Déploiement des services d'hébergement entièrement automatisé grâce à l'orchestration des conteneurs Docker.",
      "Back-end en Go conçu pour tenir une charge utilisateur importante.",
      "Données persistées dans PostgreSQL, avec Redis en cache pour accélérer les accès.",
      "Plateforme web en SvelteKit et application mobile en Flutter.",
    ],
    skills: ["Go", "SvelteKit", "PostgreSQL", "Redis", "Docker", "Flutter"],
    href: "https://ongamecloud.com",
  },
  {
    company: "Anclave",
    title: "Architecte cloud & développeur full-stack · collectif open source",
    date: {
      start: Date.parse("2024-03-01"),
      end: null,
    },
    description: [
      "Services déployés sans intervention manuelle : back-end en Go et gestion automatisée des conteneurs Docker.",
      "Gestion des utilisateurs en temps réel sur PostgreSQL et Redis.",
      "Serveur d'authentification OAuth 2.0 développé en Rust.",
      "Supervision des services depuis le web (SvelteKit) et le mobile (Flutter).",
      "Réseau configuré sur équipements MikroTik.",
    ],
    skills: ["Go", "Rust", "SvelteKit", "Flutter", "PostgreSQL", "Redis", "Docker", "MikroTik"],
    href: "https://github.com/anhostfr",
  },
  {
    company: "compress.lol",
    title: "Créateur · compression vidéo dans le navigateur",
    date: {
      start: Date.parse("2025-09-10"),
      end: null,
    },
    description: [
      "Outil open source adopté par la communauté : plus de 300 étoiles sur GitHub.",
      "Aucun coût serveur et aucune donnée envoyée : la compression se fait entièrement dans le navigateur grâce à FFmpeg.wasm.",
      "Interface SvelteKit qui traite des fichiers volumineux directement côté client.",
      "Pensé d'abord pour faire passer des vidéos sous les limites d'envoi de Discord.",
    ],
    href: "https://compress.lol",
    skills: ["SvelteKit", "FFmpeg.wasm", "WebAssembly"],
  },
  {
    company: "Hangar",
    title: "Créateur · stockage objet compatible S3",
    date: {
      start: Date.parse("2025-08-19"),
      end: null,
    },
    description: [
      "Stockage objet auto-hébergeable, compatible avec les outils et SDK S3 existants.",
      "Déploiement simple et faible empreinte, écrit en Go.",
    ],
    href: "https://github.com/sowahq/hangar",
    skills: ["Go", "S3", "Auto-hébergement"],
  },
  {
    company: "LitePay",
    title: "Créateur · processeur de paiement crypto auto-hébergé",
    date: {
      start: Date.parse("2024-12-17"),
      end: null,
    },
    description: [
      "Paiements en Bitcoin, Litecoin et Solana encaissés directement par le marchand : aucun intermédiaire, aucuns frais, aucune garde des fonds par un tiers.",
      "Processeur auto-hébergé, écrit en Go.",
    ],
    href: "https://github.com/sowahq/litepay",
    skills: ["Go", "Bitcoin", "Litecoin", "Solana"],
  },
  {
    company: "Goscord",
    title: "Lead maintainer · bibliothèque Go pour l'API Discord",
    date: {
      start: Date.parse("2020-10-11"),
      end: null,
    },
    description: [
      "Bibliothèque open source qui permet à d'autres développeurs de créer leurs bots Discord en Go.",
      "Consommation CPU et mémoire réduite pour un usage dans des environnements à forte charge.",
      "Connexion temps réel à la gateway Discord (WebSocket) et gestion de ses événements.",
      "Stabilité assurée par les tests et la revue des contributions de la communauté.",
      "Adoption facilitée par une documentation complète et des exemples d'implémentation.",
    ],
    href: "https://goscord.dev",
    skills: ["Go", "WebSocket", "UDP", "Docker"],
  },
  {
    company: "Virtual Royaume",
    title: "Développeur & coordinateur open source",
    date: {
      start: Date.parse("2021-01-01"),
      end: Date.parse("2023-10-01"),
    },
    description: [
      "Équipe de développeurs bénévoles coordonnée pour maintenir les projets open source de la communauté.",
      "API GraphQL conçue avec NestJS et MongoDB pour servir l'ensemble des projets de la communauté.",
      "Stabilité des outils assurée par la revue de code des contributions et des tests unitaires et E2E.",
      "Site de la communauté en Next.js et bot Discord de gestion en Discord.js.",
    ],
    href: "https://github.com/Royaume-Group",
    skills: ["TypeScript", "NestJS", "GraphQL", "MongoDB", "Next.js", "Discord.js"],
  },
  {
    company: "MoonlyClient",
    title: "Ingénieur logiciel · rétro-ingénierie",
    date: {
      start: Date.parse("2021-01-16"),
      end: Date.parse("2022-02-02"),
    },
    description: [
      "Fonctionnalités personnalisées injectées dans Minecraft Bedrock grâce à la rétro-ingénierie du client.",
      "Latence logicielle analysée et réduite pour améliorer l'expérience des joueurs.",
      "Client écrit en C++, avec une attention particulière à la mémoire et aux performances.",
      "Distribution et mises à jour automatiques via un launcher en C# / .NET.",
    ],
    href: "https://github.com/MoonlyClient",
    skills: ["C++", "C#", ".NET", "Rétro-ingénierie"],
  },
];
