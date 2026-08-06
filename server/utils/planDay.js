/*
 * planDay.js — Timezone-safe plan day computation
 *
 * PROBLEM: Plan day (currentDay / currentDayOffset) was previously computed
 * with `date.setHours(0, 0, 0, 0)` which resolves in the SERVER's timezone.
 * On a UTC server (common for deployments) the day rolls over 5.5h after IST
 * midnight, so between 00:00–05:30 IST the app reports the PREVIOUS plan day
 * (e.g. Day 1 when the coordinator expects Day 2).
 *
 * FIX: Normalise every date to the IST calendar day (India — the product's
 * audience) before computing whole-day differences. IST has no DST, so the
 * +05:30 offset is constant and this works on any server timezone.
 */

/* IST = UTC + 5:30 (no DST in India) */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/*
 * toIstMidnightMs(date)
 * Returns the UTC-midnight timestamp of the IST calendar day that `date` falls on.
 * Example: 2026-08-07T02:16 IST and 2026-08-07T18:00 IST both → Aug 7 00:00 IST.
 */
export function toIstMidnightMs(date) {
  const shifted = new Date(new Date(date).getTime() + IST_OFFSET_MS);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

/*
 * getPlanDayOffset(startDate, now = new Date())
 * Whole IST-calendar days between startDate and now, plus 1 (Day 1 = start day).
 * Returns 0 if `now` is before the start date (future-dated plan), and
 * 1 for the start day itself.
 */
export function getPlanDayOffset(startDate, now = new Date()) {
  const startMs = toIstMidnightMs(new Date(startDate));
  const nowMs = toIstMidnightMs(now);
  const diffDays = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays + 1);
}
