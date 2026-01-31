/**
 * Formats a date string for display in the given locale.
 * @param dateString - ISO date string or date parseable value
 * @param locale - BCP 47 language tag (e.g. 'es', 'en-US')
 * @param format - 'short' (day, month short, year) or 'long' (weekday, day, month long, year)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  locale: string,
  format: 'short' | 'long' = 'short'
): string {
  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      : {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        };
  return new Date(dateString).toLocaleDateString(locale, options);
}
