/*
 * Notification Routes
 * System notifications for user interactions (answers, etc.)
 */
import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

const router = Router();

console.log('[NOTIF ROUTE] Registering notification routes...');

router.get('/', requireAuth, (req, res, next) => {
  console.log('[NOTIF ROUTE] GET / called');
  next();
}, getNotifications);

router.put('/:id/read', requireAuth, (req, res, next) => {
  console.log('[NOTIF ROUTE] PUT /:id/read called, id:', req.params.id);
  next();
}, markNotificationRead);

router.put('/read-all', requireAuth, (req, res, next) => {
  console.log('[NOTIF ROUTE] PUT /read-all called');
  next();
}, markAllRead);

router.delete('/:id', requireAuth, deleteNotification);

/*
 * POST /api/notifications/test
 * Self-test: create a test notification for the current user.
 * Also returns debug info about the user's notification state.
 */
router.post('/test', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'No User doc with clerkId=' + req.userId + '. The webhook may not have synced your account. Check Clerk dashboard → Webhooks.' });

    /* Count existing notifications for this user */
    const existingCount = await Notification.countDocuments({ user: currentUser._id });

    /* Create a test notification */
    const notif = await Notification.create({
      user: currentUser._id,
      from: currentUser._id,
      type: 'answer',
      questionId: currentUser._id,
      questionTitle: 'Test notification — delete me'
    });

    console.log('[NOTIF ROUTE] Test notification created:', notif._id, 'for user:', currentUser._id);
    res.json({
      data: notif,
      user: { _id: currentUser._id, name: currentUser.displayName || currentUser.username, clerkId: currentUser.clerkId },
      existingNotifications: existingCount,
      message: `Test notification created. You now have ${existingCount + 1} notifications. Refresh the page to see the badge.`
    });
  } catch (error) {
    console.error('[NOTIF ROUTE] Test notification error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/*
 * GET /api/notifications/debug
 * Debug: Show raw data used by the notification system
 */
router.get('/debug', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findOne({ clerkId: req.userId });
    const debug = {
      userFound: !!currentUser,
      user: currentUser ? { _id: currentUser._id.toString(), name: currentUser.displayName || currentUser.username, clerkId: currentUser.clerkId } : null,
      notificationDocs: 0,
      approvedQuestions: 0,
      approvedQuestionsList: [],
      notificationDocuments: []
    };

    if (currentUser) {
      const notifs = await Notification.find({ user: currentUser._id }).sort({ createdAt: -1 }).limit(10).lean();
      debug.notificationDocs = notifs.length;
      debug.notificationDocuments = notifs.map(n => ({ _id: n._id.toString(), type: n.type, questionTitle: n.questionTitle, createdAt: n.createdAt }));

      const qs = await Question.find({ 'author._id': currentUser._id, status: 'approved' }).sort({ updatedAt: -1 }).limit(10).lean();
      debug.approvedQuestions = qs.length;
      debug.approvedQuestionsList = qs.map(q => ({ _id: q._id.toString(), title: q.title, status: q.status, authorId: q.author?._id?.toString(), updatedAt: q.updatedAt }));
    }

    res.json(debug);
  } catch (error) {
    console.error('[NOTIF ROUTE] Debug error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
