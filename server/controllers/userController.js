import User from '../models/User.js';
import Notification from '../models/Notification.js';
import CoachingCenter from '../models/CoachingCenter.js';
import Batch from '../models/Batch.js';
import CourseOffering from '../models/CourseOffering.js';
import Progress from '../models/Progress.js';
import clerk from '../config/clerk.js';
import imagekit from '../config/imagekit.js';

/* Simple in-memory rate limiter: userId → timestamps[] */
const linkRateMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; /* 1 hour */

/*
 * POST /api/users/webhook
 * Clerk webhook handler — creates/updates User document on signup/update
 */
export async function handleClerkWebhook(req, res) {
  try {
    const event = req.body;
    console.log('[USER] Clerk webhook received:', event.type);

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const { id, username, first_name, last_name, email_addresses, image_url } = event.data;
      const displayName = [first_name, last_name].filter(Boolean).join(' ') || username;
      const email = email_addresses?.[0]?.email_address;

      const user = await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          username: username || `user_${id.substring(0, 8)}`,
          displayName,
          email,
          avatar: image_url
        },
        { upsert: true, new: true }
      );

      /* Fire-and-forget: check if profile is incomplete for new users */
      console.log('[USER] Webhook processed, user._id:', user._id, 'displayName:', displayName, 'college:', user.college, 'year:', user.year);
      if (event.type === 'user.created') {
        console.log('[USER] user.created — triggering completeness check for:', user._id);
        checkAndNotifyProfileIncomplete(user._id).catch(err => {
          console.error('[USER] Error checking profile completeness on sign-up:', err.message);
        });
      } else {
        console.log('[USER] Webhook type is', event.type, '— skipping completeness check');
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[USER] Webhook error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/users/link-coaching-center
 * User: Link themselves to a coaching center via join code.
 * Rate-limited: max 10 attempts per hour per user.
 */
export async function linkCoachingCenter(req, res) {
  try {
    console.log('[USER] Link coaching center request for user:', req.userId);
    const { code } = req.body;

    /* Validate input */
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Join code is required' });
    }

    /* Rate limit check */
    const now = Date.now();
    const attempts = linkRateMap.get(req.userId) || [];
    const recent = attempts.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
      console.log('[USER] Rate limit hit for link-coaching-center:', req.userId);
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }
    recent.push(now);
    linkRateMap.set(req.userId, recent);

    /* Find the center by code (active or trial only — no suspended) */
    const center = await CoachingCenter.findOne({ code: code.trim(), status: { $ne: 'suspended' } });
    if (!center) {
      console.log('[USER] Invalid coaching center code:', code);
      return res.status(404).json({ error: 'Invalid or expired code' });
    }

    /* Link the authenticated user to this center */
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    user.coachingCenter = center._id;
    user.coachingCenterJoinedAt = new Date();
    await user.save();

    console.log('[USER] User linked to center:', center._id, 'code:', code);
    res.json({ data: { coachingCenter: center._id, coachingCenterJoinedAt: user.coachingCenterJoinedAt } });
  } catch (error) {
    console.error('[USER] Error linking coaching center:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/users/link-batch
 * User: Link themselves to a batch within their existing center via batch code.
 * The user must already be linked to the batch's coachingCenter.
 * Rate-limited: max 10 attempts per hour per user.
 */
export async function linkBatch(req, res) {
  try {
    console.log('[USER] Link batch request for user:', req.userId);
    const { code } = req.body;

    /* Validate input */
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Batch code is required' });
    }

    /* Rate limit check (reuse the same rate map) */
    const now = Date.now();
    const attempts = linkRateMap.get(req.userId) || [];
    const recent = attempts.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
      console.log('[USER] Rate limit hit for link-batch:', req.userId);
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }
    recent.push(now);
    linkRateMap.set(req.userId, recent);

    /* Find the batch by code */
    const batch = await Batch.findOne({ code: code.trim(), status: 'active' });
    if (!batch) {
      console.log('[USER] Invalid batch code:', code);
      return res.status(404).json({ error: 'Invalid or expired batch code' });
    }

    /* Find the authenticated user */
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    /* Guard: user must already be linked to the batch's center */
    if (!user.coachingCenter || user.coachingCenter.toString() !== batch.coachingCenter.toString()) {
      console.log('[USER] User', req.userId, 'is not linked to batch\'s center');
      return res.status(403).json({
        error: 'You must join the coaching centre first before joining a batch. Ask your centre for their join code.'
      });
    }

    /* Link the user to this batch */
    user.batch = batch._id;
    await user.save();

    console.log('[USER] User linked to batch:', batch._id, 'code:', code);
    res.json({ data: { batch: batch._id, batchName: batch.name } });
  } catch (error) {
    console.error('[USER] Error linking batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/users/select-course
 * User: Select a course offering from their linked center.
 * Body: { courseOfferingId }
 * Verifies the course belongs to the user's own coachingCenter.
 */
export async function selectCourse(req, res) {
  try {
    console.log('[USER] Select course request for user:', req.userId);
    const { courseOfferingId } = req.body;

    if (!courseOfferingId) {
      return res.status(400).json({ error: 'courseOfferingId is required' });
    }

    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    /* Guard: user must be linked to a center first */
    if (!user.coachingCenter) {
      return res.status(400).json({ error: 'You must join a coaching centre first before selecting a course.' });
    }

    /* Verify the course offering belongs to the user's center */
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }
    if (offering.coachingCenter.toString() !== user.coachingCenter.toString()) {
      return res.status(403).json({ error: 'Course offering does not belong to your centre' });
    }

    user.courseOffering = offering._id;
    await user.save();

    /* Fire-and-forget: re-check profile completeness now that courseOffering is set */
    checkAndNotifyProfileIncomplete(user._id).catch(err => {
      console.error('[USER] Failed to check profile completeness after selecting course:', err.message);
    });

    console.log('[USER] Course selected:', offering.name, 'for user:', user._id);
    res.json({ data: { courseOffering: offering._id, courseOfferingName: offering.name } });
  } catch (error) {
    console.error('[USER] Error selecting course:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * Check if the user's profile is complete (displayName, college, year).
 * If incomplete and no unread profile_incomplete notification exists, create one.
 * If complete and an unread profile_incomplete notification exists, mark it read.
 * Called from updateProfile after save, and can be called independently.
 */
export async function checkAndNotifyProfileIncomplete(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    /*
     * Profile completeness: displayName, college, year are always required.
     * courseOffering is conditionally required — only if the user has joined a coaching center.
     */
    const hasRequiredFields = user.displayName && user.college && user.year;
    const hasCourseIfNeeded = !user.coachingCenter || user.courseOffering;
    const isComplete = hasRequiredFields && hasCourseIfNeeded;

    if (isComplete) {
      /* Mark any unread profile_incomplete notifications as read */
      const result = await Notification.updateMany(
        { user: userId, type: 'profile_incomplete', read: false },
        { read: true }
      );
      if (result.modifiedCount > 0) {
        console.log('[USER] Resolved profile_incomplete notification for user:', userId);
      }
    } else {
      /* Check if there's already an unread profile_incomplete notification */
      const existing = await Notification.findOne({ user: userId, type: 'profile_incomplete', read: false });
      if (!existing) {
        await Notification.create({
          user: userId,
          type: 'profile_incomplete',
          read: false
        });
        console.log('[USER] Created profile_incomplete notification for user:', userId);
      }
    }
  } catch (error) {
    console.error('[USER] Error checking profile completeness:', error.message);
  }
}

/*
 * POST /api/users/check-profile-completeness
 * User (own): Check if own profile is complete and manage profile_incomplete notification.
 * Called on profile load to ensure the notification bell reflects current state.
 */
export async function checkProfileCompleteness(req, res) {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log('[USER] checkProfileCompleteness called for user:', user._id, '| displayName:', user.displayName, '| college:', user.college, '| year:', user.year);

    await checkAndNotifyProfileIncomplete(user._id);

    const isComplete = !!(user.displayName && user.college && user.year);
    console.log('[USER] checkProfileCompleteness result — isComplete:', isComplete);
    res.json({ data: { isComplete } });
  } catch (error) {
    console.error('[USER] Error checking profile completeness:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/users
 * Search users by username or display name
 */
export async function getUsers(req, res) {
  try {
    console.log('[USER] Fetching users with search:', req.query.search);
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const users = await User.find(query).skip(skip).limit(Number(limit)).sort({ joinDate: -1 });
    const total = await User.countDocuments(query);
    console.log('[USER] Users fetched:', total);
    res.json({ data: users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[USER] Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/users/:username
 * Get a user's public profile by username.
 * If not found but matches the authenticated user, auto-create the User document.
 * Includes isFollowing flag when the requester is authenticated.
 */
export async function getUserByUsername(req, res) {
  try {
    let user = await User.findOne({ username: req.params.username })
      .populate('coachingCenter', 'name')
      .populate('batch')
      .populate('courseOffering', 'name');
    /* Auto-create or update username if the authenticated user is requesting their own profile */
    if (!user && req.userId) {
      const clerkUser = await clerk.users.getUser(req.userId);
      const clerkUsername = clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0];
      if (clerkUsername === req.params.username) {
        /* Check if a user with this clerkId already exists (webhook may have created it with a different username) */
        const existing = await User.findOne({ clerkId: req.userId });
        if (existing) {
          /* Update username to match the URL in case it changed */
          existing.username = req.params.username;
          if (clerkUser.fullName) existing.displayName = clerkUser.fullName;
          if (clerkUser.imageUrl) existing.avatar = clerkUser.imageUrl;
          await existing.save();
          user = existing;
        } else {
          user = await User.create({
            clerkId: req.userId,
            username: clerkUsername,
            displayName: clerkUser.fullName || clerkUsername,
            avatar: clerkUser.imageUrl || '',
            email: clerkUser.primaryEmailAddress?.emailAddress || ''
          });
        }
      }
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    /* Determine if the authenticated user follows this profile */
    let isFollowing = false;
    if (req.userId && user.followers?.length > 0) {
      const currentUser = await User.findOne({ clerkId: req.userId });
      if (currentUser) {
        isFollowing = user.followers.some(f => f.toString() === currentUser._id.toString());
      }
    }
    /* Backward compat: convert old links object to externalLinks array */
    const userObj = user.toObject();
    if ((!userObj.externalLinks || userObj.externalLinks.length === 0) && userObj.links) {
      const linkArray = [];
      if (userObj.links.leetcode) linkArray.push({ platform: 'leetcode', url: userObj.links.leetcode, label: 'LeetCode' });
      if (userObj.links.github) linkArray.push({ platform: 'github', url: userObj.links.github, label: 'GitHub' });
      if (userObj.links.linkedin) linkArray.push({ platform: 'linkedin', url: userObj.links.linkedin, label: 'LinkedIn' });
      if (userObj.links.website) linkArray.push({ platform: 'website', url: userObj.links.website, label: 'Website' });
      userObj.externalLinks = linkArray;
    }
    res.json({ data: { ...userObj, isFollowing } });
  } catch (error) {
    console.error('[USER] Error fetching user:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/users/:username
 * User (owner): Update own profile.
 * Authorization: the req.userId must match the user's clerkId,
 * or if no clerkId (seeded user), allow update if user is admin.
 */
export async function updateProfile(req, res) {
  try {
    let user = await User.findOne({ username: req.params.username });
    /* Fallback: if not found by username but matches authenticated user's clerkId, find by clerkId */
    if (!user && req.userId) {
      user = await User.findOne({ clerkId: req.userId });
      if (user && req.params.username !== user.username) {
        /* Update username to match the URL */
        user.username = req.params.username;
        await user.save();
        console.log('[USER] Updated username to:', req.params.username);
      }
    }
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.clerkId && user.clerkId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { displayName, bio, links, skills, college, year, avatar } = req.body;
    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (year !== undefined) user.year = year;
    if (avatar) {
      /* If base64 data URL, upload to ImageKit first */
      if (avatar.startsWith('data:')) {
        const result = await imagekit.upload({
          file: avatar,
          fileName: `avatar-${user.username}-${Date.now()}`,
          folder: '/thewebytes/avatars/'
        });
        user.avatar = result.url;
        console.log('[USER] Avatar uploaded to ImageKit:', result.url);
      } else {
        user.avatar = avatar;
      }
    }
    if (links) {
      /* Convert object format { leetcode, github, linkedin } to externalLinks array */
      if (!Array.isArray(links)) {
        const linkArray = [];
        if (links.leetcode) linkArray.push({ platform: 'leetcode', url: links.leetcode, label: 'LeetCode' });
        if (links.github) linkArray.push({ platform: 'github', url: links.github, label: 'GitHub' });
        if (links.linkedin) linkArray.push({ platform: 'linkedin', url: links.linkedin, label: 'LinkedIn' });
        if (links.website) linkArray.push({ platform: 'website', url: links.website, label: 'Website' });
        user.externalLinks = linkArray;
      } else {
        user.externalLinks = links;
      }
    }
    if (skills) user.skills = skills;
    await user.save();

    /* Fire-and-forget: check profile completeness and notify if needed */
    checkAndNotifyProfileIncomplete(user._id).catch(err => {
      console.error('[USER] Failed to check profile completeness:', err.message);
    });

    res.json({ data: user });
  } catch (error) {
    console.error('[USER] Error updating profile:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/users/:id
 * Admin: Delete a user
 */
export async function deleteUser(req, res) {
  try {
    console.log('[USER] Deleting user:', req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log('[USER] User deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[USER] Error deleting user:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/users/:id/follow
 * User: Follow another user
 */
export async function followUser(req, res) {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    /* Find the current user's MongoDB _id from their Clerk ID */
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });
    if (currentUser._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    if (targetUser.followers.some(f => f.toString() === currentUser._id.toString())) {
      return res.status(400).json({ error: 'Already following' });
    }
    targetUser.followers.push(currentUser._id);
    await targetUser.save();
    /* Also add to current user's following list */
    currentUser.following.push(targetUser._id);
    await currentUser.save();
    console.log('[USER] Followed user:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[USER] Error following user:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/users/:id/follow
 * User: Unfollow a user
 */
export async function unfollowUser(req, res) {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });

    targetUser.followers.pull(currentUser._id);
    await targetUser.save();
    currentUser.following.pull(targetUser._id);
    await currentUser.save();
    console.log('[USER] Unfollowed user:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[USER] Error unfollowing user:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/users/:id/followers
 * Get the list of users who follow this user.
 */
export async function getFollowers(req, res) {
  try {
    console.log('[USER] Fetching followers for:', req.params.id);
    const user = await User.findById(req.params.id).populate('followers', 'username displayName avatar bio');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user.followers });
  } catch (error) {
    console.error('[USER] Error fetching followers:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/users/:id/following
 * Get the list of users this user follows.
 */
export async function getFollowing(req, res) {
  try {
    console.log('[USER] Fetching following for:', req.params.id);
    const user = await User.findById(req.params.id).populate('following', 'username displayName avatar bio');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user.following });
  } catch (error) {
    console.error('[USER] Error fetching following:', error.message);
    res.status(500).json({ error: error.message });
  }
}

import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Bookmark from '../models/Bookmark.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Quiz from '../models/Quiz.js';
import DsaLesson from '../models/DsaLesson.js';
import DbmsLesson from '../models/DbmsLesson.js';
import OsLesson from '../models/OsLesson.js';
import Subtopic from '../models/Subtopic.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import OsSubtopic from '../models/OsSubtopic.js';
import Problem from '../models/Problem.js';
import DbmsProblem from '../models/DbmsProblem.js';
import OsProblem from '../models/OsProblem.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import { getProgressSummary } from '../services/progressService.js';

/*
 * GET /api/users/export-csv
 * User: Export all progress, quiz attempts, and user data as a CSV file.
 */
export async function exportUserCsv(req, res) {
  try {
    console.log('[USER] CSV export requested for user:', req.userId);
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    /* Fetch progress summary */
    const summary = await getProgressSummary(user._id);

    /* Fetch all quiz attempts with quiz data */
    const attempts = await QuizAttempt.find({ user: user._id })
      .populate('quiz')
      .sort({ attemptedAt: -1 })
      .lean();

    /* Fetch all progress records */
    const allProgress = await Progress.find({ user: user._id }).sort({ subject: 1, targetType: 1 }).lean();

    const rows = [];

    /* ── Section 1: User info ── */
    rows.push(['SECTION: USER INFO']);
    rows.push(['Username', user.username || '']);
    rows.push(['Display Name', user.displayName || '']);
    rows.push(['Email', user.email || '']);
    rows.push(['College', user.college || '']);
    rows.push(['Year', user.year || '']);
    rows.push(['Joined', user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : '']);
    rows.push(['']);

    /* ── Section 2: Progress Summary ── */
    rows.push(['SECTION: PROGRESS SUMMARY']);
    rows.push(['Subject', 'Lessons Completed', 'Lessons Total', 'Subtopics Completed', 'Subtopics Total',
      'Problems Completed', 'Problems Total', 'Overall Completed', 'Overall Total', 'Overall %',
      'Quizzes Taken', 'Avg Quiz Score']);

    for (const subject of ['dsa', 'dbms', 'os', 'programming']) {
      const d = summary[subject];
      if (d) {
        const pct = d.overall.total > 0 ? Math.round((d.overall.completed / d.overall.total) * 100) : 0;
        rows.push([
          subject.toUpperCase(),
          d.lessons.completed, d.lessons.total,
          d.subtopics.completed, d.subtopics.total,
          d.problems.completed, d.problems.total,
          d.overall.completed, d.overall.total,
          `${pct}%`,
          d.quizzes.quizzesTaken, `${d.quizzes.avgScore}%`
        ]);
      }
    }
    rows.push(['']);

    /* ── Build name lookup maps ── */
    const LESSON_MODELS = { dsa: DsaLesson, dbms: DbmsLesson, os: OsLesson, programming: ProgrammingLesson };
    const SUBTOPIC_MODELS = { dsa: Subtopic, dbms: DbmsSubtopic, os: OsSubtopic, programming: ProgrammingSubtopic };
    const PROBLEM_MODELS = { dsa: Problem, dbms: DbmsProblem, os: OsProblem, programming: ProgrammingProblem };

    /* Fetch all lesson/subtopic/problem names in batch */
    const [dsaLessons, dsaSubtopics, dbmsLessons, dbmsSubtopics, osLessons, osSubtopics, dsaProblems, dbmsProblems, osProblems] = await Promise.all([
      DsaLesson.find({}).select('slug title').lean(),
      Subtopic.find({}).select('slug title lessonSlug').lean(),
      DbmsLesson.find({}).select('slug title').lean(),
      DbmsSubtopic.find({}).select('slug title lessonSlug').lean(),
      OsLesson.find({}).select('slug title').lean(),
      OsSubtopic.find({}).select('slug title lessonSlug').lean(),
      ProgrammingLesson.find({}).select('slug title').lean(),
      ProgrammingSubtopic.find({}).select('slug title lessonSlug').lean(),
      Problem.find({}).select('slug title lessonSlug subtopicSlug').lean(),
      DbmsProblem.find({}).select('slug title lessonSlug subtopicSlug').lean(),
      OsProblem.find({}).select('slug title lessonSlug subtopicSlug').lean(),
      ProgrammingProblem.find({}).select('slug title lessonSlug subtopicSlug').lean()
    ]);

    /* Build quick lookup maps */
    const lessonNames = {};
    const subtopicNames = {};
    const problemNames = {};
    const subtopicLessonMap = {}; /* subtopicSlug → lessonSlug */
    const problemSubtopicMap = {}; /* problemSlug → subtopicSlug */
    const problemLessonMap = {}; /* problemSlug → lessonSlug */

    for (const l of [...dsaLessons, ...dbmsLessons, ...osLessons]) lessonNames[l.slug] = l.title;
    for (const s of [...dsaSubtopics, ...dbmsSubtopics, ...osSubtopics]) {
      subtopicNames[s.slug] = s.title;
      subtopicLessonMap[s.slug] = s.lessonSlug;
    }
    for (const p of [...dsaProblems, ...dbmsProblems, ...osProblems]) {
      problemNames[p.slug] = p.title;
      problemSubtopicMap[p.slug] = p.subtopicSlug;
      problemLessonMap[p.slug] = p.lessonSlug;
    }

    /* ── Section 3: Detailed Progress Records ── */
    rows.push(['SECTION: PROGRESS RECORDS']);
    rows.push(['Subject', 'Type', 'Name', 'Slug', 'Lesson', 'Subtopic', 'Completed At']);
    for (const p of allProgress) {
      let name = p.targetSlug;
      let lessonName = '';
      let subtopicName = '';
      if (p.targetType === 'lesson') {
        name = lessonNames[p.targetSlug] || p.targetSlug;
      } else if (p.targetType === 'subtopic') {
        name = subtopicNames[p.targetSlug] || p.targetSlug;
        lessonName = lessonNames[subtopicLessonMap[p.targetSlug]] || '';
      } else if (p.targetType === 'problem') {
        name = problemNames[p.targetSlug] || p.targetSlug;
        subtopicName = subtopicNames[problemSubtopicMap[p.targetSlug]] || '';
        lessonName = lessonNames[problemLessonMap[p.targetSlug]] || '';
      }
      rows.push([
        p.subject.toUpperCase(),
        p.targetType,
        name,
        p.targetSlug,
        lessonName,
        subtopicName,
        p.completedAt ? new Date(p.completedAt).toISOString() : ''
      ]);
    }
    rows.push(['']);

    /* ── Section 4: Quiz Attempts ── */
    rows.push(['SECTION: QUIZ ATTEMPTS']);
    rows.push(['Subject', 'Score', 'Questions', 'Correct', 'Attempted At', 'Problem Name', 'Problem Slug']);
    for (const att of attempts) {
      const correct = att.quiz.questions.filter((q, i) => att.answers[i] === q.correctIndex).length;
      const subject = { Problem: 'dsa', DbmsProblem: 'dbms', OsProblem: 'os', ProgrammingProblem: 'programming' }[att.quiz.problemModel] || '';
      const probModel = { Problem, DbmsProblem, OsProblem, ProgrammingProblem }[att.quiz.problemModel];
      let probName = '';
      if (probModel) {
        const prob = await probModel.findById(att.quiz.problemId).select('title slug').lean();
        probName = prob?.title || '';
      }
      rows.push([
        subject.toUpperCase(),
        `${att.score}%`,
        att.quiz.questions.length,
        correct,
        att.attemptedAt ? new Date(att.attemptedAt).toISOString() : '',
        probName,
        (att.quiz.problemId?.toString() || '')
      ]);
    }
    rows.push(['']);

    rows.push(['Generated on', new Date().toISOString()]);
    rows.push(['TheJobStarter — TheWebytes']);

    /* Build CSV string */
    const csv = rows.map(r => r.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell === null || cell === undefined ? '' : String(cell);
    }).join(',')).join('\r\n');

    const filename = `${user.username || 'user'}_thejobstarter_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log('[USER] CSV export sent:', filename);
  } catch (error) {
    console.error('[USER] Error exporting CSV:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/users/:id/activity
 * Get recent activity for a user (questions asked, answers given, bookmarks)
 */
export async function getUserActivity(req, res) {
  try {
    console.log('[USER] Fetching activity for:', req.params.id);
    const userId = req.params.id;
    const activities = [];

    /* Questions asked by this user */
    const questions = await Question.find({ 'author._id': userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title tags createdAt')
      .lean();

    questions.forEach(q => {
      activities.push({
        type: 'asked',
        title: q.title,
        category: (q.tags || [])[0] || 'General',
        date: q.createdAt,
        link: `/qa/${q._id}`
      });
    });

    /* Answers given by this user */
    const answers = await Answer.find({ 'author._id': userId })
      .populate('question', 'title tags')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    answers.forEach(a => {
      activities.push({
        type: 'answered',
        title: a.question?.title || 'Unknown',
        category: (a.question?.tags || [])[0] || 'General',
        date: a.createdAt,
        link: `/qa/${a.question?._id}`
      });
    });

    /* Sort combined by date, newest first, limit to 10 */
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limited = activities.slice(0, 10);

    console.log('[USER] Activity fetched:', limited.length, 'items');
    res.json({ data: limited });
  } catch (error) {
    console.error('[USER] Error fetching activity:', error.message);
    res.status(500).json({ error: error.message });
  }
}
