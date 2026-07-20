import { Router } from 'express';
import {
  getUsers, getUserByUsername, updateProfile, deleteUser,
  followUser, unfollowUser, getFollowers, getFollowing, getUserActivity, handleClerkWebhook,
  linkCoachingCenter, checkProfileCompleteness, exportUserCsv, linkBatch, selectCourse
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Clerk webhook must be raw body — handled in app.js */
router.post('/webhook', handleClerkWebhook);

router.get('/', requireAuth, getUsers);
router.post('/link-coaching-center', requireAuth, linkCoachingCenter);
router.post('/link-batch', requireAuth, linkBatch);
router.post('/select-course', requireAuth, selectCourse);
router.post('/check-profile-completeness', requireAuth, checkProfileCompleteness);
router.get('/export-csv', requireAuth, exportUserCsv);
router.get('/:username', requireAuth, getUserByUsername);
router.put('/:username', requireAuth, updateProfile);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);
router.post('/:id/follow', requireAuth, followUser);
router.delete('/:id/follow', requireAuth, unfollowUser);
router.get('/:id/followers', requireAuth, getFollowers);
router.get('/:id/following', requireAuth, getFollowing);
router.get('/:id/activity', requireAuth, getUserActivity);

export default router;
