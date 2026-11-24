export const WORKSHOPS = ["matériel", "mobile", "jeux", "protections"] as const;

export type Workshop = (typeof WORKSHOPS)[number];
