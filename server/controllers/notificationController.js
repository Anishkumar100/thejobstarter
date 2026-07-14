/*
 * Notification Controller — Fetch, mark read, and delete notifications
 * Notifications are created when users interact with each other's content
 */
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import clerk from '../config/clerk.js';

console.log('[NOTIF CTRL] Notification controller loaded');

/*
 * GET /api/notifications
 * Fetch all notifications for the current user, newest first
 */
/*
 * Helper: Find or auto-create a User doc from Clerk session
 */
async function findOrCreateUser(clerkId) {
  let user = await User.findOne({ clerkId });
  if (!user) {
    console.log('[NOTIFICATION] User doc not found — creating from Clerk:', clerkId);
    try {
      const clerkUser = await clerk.users.getUser(clerkId);
      user = await User.create({
        clerkId,
        username: clerkUser.username || `user_${clerkId.slice(-6)}`,
        displayName: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.emailAddresses?.[0]?.emailAddress || 'User',
        avatar: clerkUser.imageUrl || '',
        joinDate: new Date()
      });
      console.log('[NOTIFICATION] Created User doc:', user._id);
    } catch (clerkErr) {
      console.error('[NOTIFICATION] Failed to fetch Clerk user:', clerkErr.message);
      return null;
    }
  }
  return user;
}

export async function getNotifications(req, res) {
  try {
    console.log('[NOTIFICATION] Fetching notifications for user:', req.userId);
    const currentUser = await findOrCreateUser(req.userId);
    if (!currentUser) return res.status(404).json({ error: 'User not found in DB: ' + req.userId });

    const userId = currentUser._id;

    /* Fetch Notification documents */
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('from', 'displayName username avatar')
      .limit(50);

    /* Also fetch approved questions by this user directly from the Question collection */
    /* This ensures approved questions always show up even if Notification.create failed */
    const approvedQuestions = await Question.find({
      'author._id': userId,
      status: 'approved'
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('title status updatedAt createdAt author._id')
      .lean();

    /* Build a set of question IDs that already have Notification docs */
    const existingNotifQuestionIds = new Set(
      notifications
        .filter(n => n.questionId)
        .map(n => n.questionId.toString())
    );

    /* Shape approved questions into notification-like objects */
    const questionNotifs = approvedQuestions
      .filter(q => !existingNotifQuestionIds.has(q._id.toString()))
      .map(q => ({
        _id: `q_${q._id}`,
        user: userId,
        from: userId,
        type: 'question_approved',
        questionId: q._id,
        questionTitle: q.title,
        read: true, /* Pre-read — won't reappear as unread on refresh */
        createdAt: q.updatedAt || q.createdAt,
        updatedAt: q.updatedAt || q.createdAt,
        _directQuery: true /* flag to distinguish from Notification docs */
      }));

    /* Check if referenced questions still exist for orphaned notifications */
    const questionIds = [...new Set(notifications.map(n => n.questionId).filter(Boolean))];
    const existingQuestions = await Question.find({ _id: { $in: questionIds } }).select('_id').lean();
    const existingIds = new Set(existingQuestions.map(q => q._id.toString()));
    const enriched = notifications.map(n => ({
      ...n.toObject(),
      questionDeleted: !existingIds.has(n.questionId?.toString())
    }));

    /* Merge: Notification docs + question-sourced notifs, sort by createdAt desc, limit to 50 */
    const merged = [...enriched, ...questionNotifs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    const unreadCount = merged.filter(n => !n.read).length;
    console.log('[NOTIFICATION] Fetched:', merged.length, '(Notification docs:', enriched.length, '+ direct questions:', questionNotifs.length, ') Unread:', unreadCount);
    res.json({
      data: merged,
      unreadCount,
      _debug: {
        userId: req.userId,
        userDocId: userId.toString(),
        userDocName: currentUser.displayName || currentUser.username,
        totalNotifsInDb: await Notification.countDocuments({}),
        notifDocs: enriched.length,
        directQuestions: questionNotifs.length
      }
    });
  } catch (error) {
    console.error('[NOTIFICATION] Error fetching notifications:', error.message);
    res.status(500).json({ error: error.message, _debug: { userId: req.userId } });
  }
}

/*
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
export async function markNotificationRead(req, res) {
  try {
    console.log('[NOTIFICATION] Marking as read:', req.params.id);
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    console.log('[NOTIFICATION] Marked as read:', req.params.id);
    res.json({ data: notification });
  } catch (error) {
    console.error('[NOTIFICATION] Error marking as read:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the current user
 */
export async function markAllRead(req, res) {
  try {
    console.log('[NOTIFICATION] Marking all as read for user:', req.userId);
    const currentUser = await findOrCreateUser(req.userId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });
    const result = await Notification.updateMany(
      { user: currentUser._id, read: false },
      { read: true }
    );
    console.log('[NOTIFICATION] Marked all as read:', result.modifiedCount);
    res.json({ success: true, count: result.modifiedCount });
  } catch (error) {
    console.error('[NOTIFICATION] Error marking all as read:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function deleteNotification(req, res) {
  try {
    console.log('[NOTIFICATION] Deleting:', req.params.id);
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    console.log('[NOTIFICATION] Deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATION] Error deleting:', error.message);
    res.status(500).json({ error: error.message });
  }
}
