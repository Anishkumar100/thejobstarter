import { Router } from 'express';
import { getPublicConfig, updateConfig, updateWhySection, updateWhyTheJobStarter, updateHowItWorks, updateAboutPage } from '../controllers/siteConfigController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/public', getPublicConfig);
router.put('/', requireAuth, requireAdmin, updateConfig);
router.put('/why-section', requireAuth, requireAdmin, updateWhySection);
router.put('/why-the-job-starter', requireAuth, requireAdmin, updateWhyTheJobStarter);
router.put('/how-it-works', requireAuth, requireAdmin, updateHowItWorks);
router.put('/about-page', requireAuth, requireAdmin, updateAboutPage);

export default router;
