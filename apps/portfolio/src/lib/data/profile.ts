import type { Departure } from "@mth/ui";

export const departures: Departure[] = [
  { code: "1", label: "ce que je fais", hint: "3 tickets au choix", href: "#missions" },
  { code: "2", label: "mes projets", hint: "ligne 1 pro · ligne 2 open source", href: "#ligne" },
  { code: "3", label: "ma stack", hint: "web, serveur, mobile, données", href: "#reseau" },
  { code: "4", label: "le blog", hint: "mes démontages", href: "#depot" },
  { code: "T", label: "me contacter", hint: "terminus : votre projet", href: "#contact", terminus: true },
];
