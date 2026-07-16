import User from '../models/User.js';
import clerk from '../config/clerk.js';
import imagekit from '../config/imagekit.js';

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

      await User.findOneAndUpdate(
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
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[USER] Webhook error:', error.message);
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
    let user = await User.findOne({ username: req.params.username });
    /* Auto-create if the authenticated user is requesting their own profile */
    if (!user && req.userId) {
      const clerkUser = await clerk.users.getUser(req.userId);
      const clerkUsername = clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0];
      if (clerkUsername === req.params.username) {
        user = await User.create({
          clerkId: req.userId,
          username: clerkUsername,
          displayName: clerkUser.fullName || clerkUsername,
          avatar: clerkUser.imageUrl || '',
          email: clerkUser.primaryEmailAddress?.emailAddress || ''
        });
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
