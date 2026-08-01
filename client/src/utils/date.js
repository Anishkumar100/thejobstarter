/*
 * date.js — Local date helpers
 *
 * Date-only strings (YYYY-MM-DD) for <input type="date"> must be built from
 * LOCAL time components. Using new Date().toISOString().split('T')[0] returns
 * the UTC date, which for timezones ahead of UTC (e.g. IST, UTC+5:30) shows
 * YESTERDAY between 12:00 AM and 5:29 AM local — silently pushing plan start
 * dates (and similar defaults) a full day early.
 */

/*
 * getLocalDateString(date)
 * Returns a YYYY-MM-DD string using the LOCAL date components of the given
 * date (defaults to now). Safe to use as a default for <input type="date">.
 */
export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
