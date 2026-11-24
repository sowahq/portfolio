/**
 * When the site was built, as an ISO timestamp fixed once by the Vite config.
 */
export const BUILT_AT: string = __BUILT_AT__;

/**
 * The calendar day (YYYY-MM-DD) of an ISO timestamp.
 */
export function isoDay(timestamp: string): string {
  return timestamp.slice(0, 10);
}
