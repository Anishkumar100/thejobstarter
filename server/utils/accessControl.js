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
import clerk from '../config/clerk.js';

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

    /*
     * Lazy expiry check — if the user's paid period ended but their status is
     * still 'active' (e.g. the last request came before the period ended), flip
     * them to 'expired' right here. This is a one-time self-healing write; the
     * hourly sweep in utils/subscriptionExpiry.js keeps the DB clean in bulk.
     */
    if (user?.subscription?.status === 'active'
      && user.subscription.currentPeriodEnd
      && new Date(user.subscription.currentPeriodEnd) < new Date()) {
      console.log('[ACCESS] resolveUser: expiring', user.username, '| period ended:', user.subscription.currentPeriodEnd);
      await User.updateOne(
        { _id: user._id },
        { $set: { 'subscription.status': 'expired', 'subscription.currentPeriodEnd': null } }
      );
      user.subscription.status = 'expired';
      user.subscription.currentPeriodEnd = null;
    }

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
 * hasAdminAccess(req, user)
 *
 * Async fallback for admin-only views (e.g. "all subtopics" without a lesson filter).
 * First tries the Mongo User doc via canAccessSubject(). If that fails, checks the
 * Clerk publicMetadata.role directly — this covers the case where the Mongo role is
 * stale (webhook synced before the role was set in Clerk) or the User doc is missing.
 *
 * Self-healing: when Clerk confirms admin/coordinator, the Mongo role is corrected
 * (or a minimal User doc is created) so the next request passes via the fast path.
 *
 * @param {Object} req - Express request (needs req.userId from requireAuth)
 * @param {Object|null} user - Resolved Mongo User doc (or null)
 * @returns {boolean}
 */
export async function hasAdminAccess(req, user) {
  /* Fast path — Mongo doc already has full access */
  if (canAccessSubject(user)) {
    return true;
  }

  /* Fallback — verify via Clerk publicMetadata (only when we have a session) */
  if (!req.userId) {
    console.log('[ACCESS] hasAdminAccess: no req.userId — cannot verify via Clerk');
    return false;
  }

  try {
    const clerkUser = await clerk.users.getUser(req.userId);
    const clerkRole = clerkUser.publicMetadata?.role;
    const isStaff = clerkRole === 'admin' || clerkRole === 'coordinator';
    console.log('[ACCESS] hasAdminAccess: Clerk role:', clerkRole, '->', isStaff ? 'granted' : 'denied');

    if (!isStaff) {
      return false;
    }

    /* Self-heal the Mongo doc so the next request uses the fast path */
    if (user) {
      if (user.role !== clerkRole) {
        await User.findByIdAndUpdate(user._id, { role: clerkRole });
        console.log('[ACCESS] hasAdminAccess: role self-healed for', user.username, '->', clerkRole);
      }
    } else {
      /* No User doc at all — create a minimal one from Clerk data */
      const clerkUsername = clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0];
      await User.create({
        clerkId: req.userId,
        username: clerkUsername || `user_${req.userId.substring(0, 8)}`,
        displayName: clerkUser.fullName || clerkUsername || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        avatar: clerkUser.imageUrl || '',
        role: clerkRole
      });
      console.log('[ACCESS] hasAdminAccess: User doc created for clerkId:', req.userId, 'role:', clerkRole);
    }

    return true;
  } catch (error) {
    console.error('[ACCESS] hasAdminAccess error:', error.message);
    return false;
  }
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
