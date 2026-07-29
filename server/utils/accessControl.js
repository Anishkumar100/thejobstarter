/*
 * Access Control Utility
 *
 * Shared helpers used by DSA, DBMS, OS, and Programming controllers
 * to determine whether a user can access premium (locked) content.
 *
 * Free tier rule:
 *   First 2 lessons (by `order` field) in each subject are free.
 *   Lessons 3+ and everything under them require an active subscription
 *   or enrollment in a coaching center.
 *
 * USAGE:
 *   import { resolveUser, canAccessSubject, getLockedLessons, isLessonFree }
 *     from '../utils/accessControl.js';
 *
 *   const user = await resolveUser(req);
 *   const enriched = getLockedLessons(lessons, user);
 */
import User from '../models/User.js';

/*
 * resolveUser(req)
 *
 * Looks up the authenticated user from MongoDB by Clerk session ID (req.userId).
 * Returns null if the user is not authenticated or not found in the database.
 *
 * Controllers call this at the top of every gated route handler.
 * req.userId is set by requireAuth or optionalAuth middleware.
 *
 * @param {Object} req - Express request object
 * @returns {Object|null} - Mongoose User doc (lean) or null
 */
export async function resolveUser(req) {
  /* No auth token — unauthenticated visitor */
  if (!req.userId) {
    console.log('[ACCESS] resolveUser: no req.userId — unauthenticated');
    return null;
  }

  try {
    const user = await User.findOne({ clerkId: req.userId }).lean();
    if (user) {
      console.log('[ACCESS] resolveUser: found', user.username, '| role:', user.role, '| coachingCenter:', !!user.coachingCenter, '| coordinatorFor:', !!user.coordinatorFor, '| sub status:', user.subscription?.status || 'not set (default: free)');
    } else {
      console.log('[ACCESS] resolveUser: no User doc found for clerkId:', req.userId);
    }
    return user || null;
  } catch (error) {
    console.error('[ACCESS] Error resolving user:', error.message);
    return null;
  }
}

/*
 * canAccessSubject(user)
 *
 * Checks if a user has full access to a subject's content.
 * Returns true if:
 *   - User is enrolled in a coaching center (centre pays — full access)
 *   - User has an active Cashfree subscription
 * Returns false for free-tier users and unauthenticated visitors.
 *
 * @param {Object|null} user - Mongoose User doc (or null if not logged in)
 * @returns {boolean}
 */
export function canAccessSubject(user) {
  /* No user object — unauthenticated visitor, free tier only */
  if (!user) {
    console.log('[ACCESS] canAccessSubject: no user → false');
    return false;
  }

  /* Admin users can access everything */
  if (user.role === 'admin') {
    console.log('[ACCESS] canAccessSubject: admin -> true');
    return true;
  }

  /* Coordinators manage a centre — full access */
  if (user.role === 'coordinator') {
    console.log('[ACCESS] canAccessSubject: coordinator -> true');
    return true;
  }
  if (user.coordinatorFor) {
    console.log('[ACCESS] canAccessSubject: has coordinatorFor -> true');
    return true;
  }

  /* Centre-enrolled students get full access regardless of subscription */
  if (user.coachingCenter) {
    console.log('[ACCESS] canAccessSubject: coachingCenter -> true');
    return true;
  }

  /* Paid subscriber with active subscription */
  if (user.subscription?.status === 'active') {
    console.log('[ACCESS] canAccessSubject: active subscription -> true');
    return true;
  }

  /* Just a regular user — no centre, no active sub → free tier only */
  console.log('[ACCESS] canAccessSubject: regular user -> false');
  return false;
}

/*
 * getLockedLessons(lessons, user, freeCount = 2)
 *
 * Takes an array of lessons (sorted by `order` asc) and adds a `locked` boolean
 * to each lesson indicating whether the user can view its content.
 *
 * If the user has full access (via subscription or coaching center),
 * all lessons are unlocked.
 *
 * Otherwise, only the first `freeCount` lessons are unlocked.
 * Lessons beyond that count are locked.
 *
 * Safe for both Mongoose documents (.lean()) and plain objects.
 *
 * @param {Array} lessons - Array of lesson objects (must have `slug`)
 * @param {Object|null} user - Mongoose User doc (or null)
 * @param {number} freeCount - Number of free lessons from the start (default: 2)
 * @returns {Array} - Same lessons with `locked: boolean` added
 */
export function getLockedLessons(lessons, user, freeCount = 2) {
  /* Full access — all lessons unlocked */
  if (canAccessSubject(user)) {
    console.log('[ACCESS] getLockedLessons: all', lessons.length, 'unlocked (full access)');
    return lessons.map(lesson => ({
      ...lesson,
      locked: false
    }));
  }

  /* Free tier — only first `freeCount` lessons are unlocked */
  const freeSlugs = lessons.slice(0, freeCount).map(lesson => lesson.slug);
  const freeTitles = lessons.filter(l => freeSlugs.includes(l.slug)).map(l => l.title);
  const lockedTitles = lessons.filter(l => !freeSlugs.includes(l.slug)).map(l => l.title);
  console.log('[ACCESS] getLockedLessons: free:', freeTitles.length, '(' + freeTitles.join(', ') + ') | locked:', lockedTitles.length, '(' + lockedTitles.join(', ') + ')');

  return lessons.map(lesson => ({
    ...lesson,
    locked: !freeSlugs.includes(lesson.slug)
  }));
}

/*
 * isLessonFree(lessonSlug, allLessons, freeCount = 2)
 *
 * Checks whether a specific lesson falls within the free tier.
 * Useful for lesson detail endpoints that need a quick boolean check
 * before deciding to gate the content or serve it.
 *
 * `allLessons` must be sorted by `order` ascending.
 * Controllers should use: const allLessons = await LessonModel.find().sort({ order: 1 }).lean();
 *
 * @param {string} lessonSlug - The slug of the lesson to check
 * @param {Array} allLessons - All lessons sorted by order asc
 * @param {number} freeCount - Number of free lessons from the start (default: 2)
 * @returns {boolean}
 */
export function isLessonFree(lessonSlug, allLessons, freeCount = 2) {
  const freeSlugs = allLessons.slice(0, freeCount).map(lesson => lesson.slug);
  const freeNames = allLessons.slice(0, freeCount).map(l => l.title);
  const isFree = freeSlugs.includes(lessonSlug);
  console.log('[ACCESS] isLessonFree:', lessonSlug, '->', isFree, '(free lessons:', freeNames.join(', ') + ')');
  return isFree;
}
