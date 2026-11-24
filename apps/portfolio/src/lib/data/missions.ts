import type { Mission } from "./types.js";

export const missionsLead =
  "Une idée à lancer, un projet en panne ou un code à faire relire. Je fais le trajet seul ou je monte dans votre équipe, et vous avez le devis avant le départ.";

export const missions: Mission[] = [
  {
    kind: "aller simple",
    title: "une application sur mesure",
    description:
      "Vous avez une idée, ou un vieil outil à remplacer. Je fais tout : le serveur, le site, l'appli mobile et la mise en ligne.",
    from: "une idée",
    to: "en ligne",
    tilt: -2,
  },
  {
    kind: "correspondance",
    title: "la reprise d'un projet",
    description:
      "Un projet commencé par quelqu'un d'autre, à moitié fini ou bloqué. Je monte à bord, je ne casse rien de ce qui roule, et je l'amène au terminus.",
    from: "un projet bloqué",
    to: "livré",
    tilt: 1.5,
    taped: true,
  },
  {
    kind: "contrôle",
    title: "un audit du code",
    description: "Je lis votre code et je vous dis ce qui tient, ce qui va casser, et dans quel ordre le réparer.",
    from: "votre code",
    to: "un plan",
    tilt: -1,
  },
];
