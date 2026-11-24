const PARIS_CLOCK = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

/**
 * Current time in Lille, as the departure board shows it.
 */
export function parisTime(date: Date = new Date()): string {
  return PARIS_CLOCK.format(date);
}
