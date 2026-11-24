const US_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const frenchDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const frenchDayMonth = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function isRealDate(iso: string): boolean {
  const date = new Date(`${iso}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(iso);
}

/**
 * Reads a frontmatter date written as MM/DD/YYYY (the Nuxt blog format) or YYYY-MM-DD,
 * and returns it as an ISO calendar date, or null when it is not a real date.
 */
export function toIsoDate(value: string): string | null {
  const trimmed = value.trim();
  const us = US_DATE.exec(trimmed);

  if (us) {
    const [, month, day, year] = us;
    const iso = `${year}-${month}-${day}`;

    return isRealDate(iso) ? iso : null;
  }

  if (ISO_DATE.test(trimmed) && isRealDate(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Formats an ISO calendar date in French with the year, e.g. "5 août 2026".
 */
export function formatPostDate(iso: string): string {
  return frenchDate.format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Formats an ISO calendar date in French without the year, e.g. "20 août".
 */
export function formatDayMonth(iso: string): string {
  return frenchDayMonth.format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Formats an ISO calendar date as an RFC 822 date for RSS.
 */
export function toRfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}
