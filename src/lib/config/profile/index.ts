import { Discord, Email, LinkedIn } from "#lib/components/icons/index.js";

interface EducationItem {
  period: string;
  title: string;
  detail: string;
}

interface ContactItem {
  name: string;
  link: string;
  icon: any; // TODO: add icon
}

export interface Profile {
  education: EducationItem[];
  contacts: ContactItem[];
  interests: string[];
}

export const profile: Profile = {
  education: [
    {
      period: "2020 - 2023",
      title: "Baccalauréat technologique STI2D",
      detail: "Lycée Polyvalent Louis Pasteur",
    },
  ],
  contacts: [
    {
      name: "Discord",
      link: "https://discord.com/users/810596177857871913",
      icon: Discord,
    },
    {
      name: "Email",
      link: "mailto:contact@szeroki.fr",
      icon: Email,
    },
    {
      name: "LinkedIn",
      link: "https://www.linkedin.com/in/mathis-lutic-604a3a265",
      icon: LinkedIn,
    },
    {
      name: "GitHub",
      link: "https://github.com/szerookii",
      icon: null,
    },
  ],
  interests: [
    "développement",
    "rétro-ingénierie",
    "jeux-vidéo",
    "open-source",
    "musique",
  ],
};
