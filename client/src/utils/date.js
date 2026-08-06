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

/* IST = UTC + 5:30 (no DST in India) */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/*
 * toIstMidnightMs(date)
 * UTC-midnight timestamp of the IST calendar day that `date` falls on.
 * Mirrors server/utils/planDay.js so the browser and server compute identical
 * day boundaries regardless of the browser's own timezone.
 */
export function toIstMidnightMs(date) {
  const shifted = new Date(new Date(date).getTime() + IST_OFFSET_MS);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

/*
 * getIstDayStart(date)
 * Start of the IST calendar day containing `date` (IST 00:00) as an absolute
 * UTC timestamp. Assignment window opens here.
 * NOTE: subtract IST_OFFSET_MS because Date.UTC(y,m,d) yields 05:30 IST, which
 * would otherwise make absolute deadlines 5.5h late.
 */
export function getIstDayStart(date) {
  return toIstMidnightMs(new Date(date)) - IST_OFFSET_MS;
}

/*
 * getIstNextDayStart(date)
 * Start of the IST day AFTER `date` — the end-of-day IST deadline for `date`.
 * Assignments are considered overdue when `now >=` this timestamp.
 */
export function getIstNextDayStart(date) {
  return getIstDayStart(date) + 24 * 60 * 60 * 1000;
}
