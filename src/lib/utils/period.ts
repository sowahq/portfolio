export interface Period {
  start?: number | null;
  end?: number | null;
}

/**
 * Formats a period as "2024 - présent", using UTC years.
 */
export function formatPeriod({ start, end }: Period): string {
  const from = start ? new Date(start).getUTCFullYear().toString() : "";
  const to = end ? new Date(end).getUTCFullYear().toString() : "présent";
  return `${from} - ${to}`;
}
