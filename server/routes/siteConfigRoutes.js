import { Router } from 'express';
import { getPublicConfig, updateConfig, updateWhySection, updateWhyTheJobStarter, updateHowItWorks, updateAboutPage, updateHeroSection, getSubscriptionConfig, updateSubscriptionConfig, getPricingPlans, getPricingPlansAdmin, updatePricingPlans, getPublicSubscriptionConfig } from '../controllers/siteConfigController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/public', getPublicConfig);
router.put('/', requireAuth, requireAdmin, updateConfig);
router.put('/why-section', requireAuth, requireAdmin, updateWhySection);
router.put('/why-the-job-starter', requireAuth, requireAdmin, updateWhyTheJobStarter);
router.put('/how-it-works', requireAuth, requireAdmin, updateHowItWorks);
router.put('/about-page', requireAuth, requireAdmin, updateAboutPage);
router.put('/hero-section', requireAuth, requireAdmin, updateHeroSection);
router.get('/subscription', requireAuth, requireAdmin, getSubscriptionConfig);
router.put('/subscription', requireAuth, requireAdmin, updateSubscriptionConfig);
/* Pricing plans — public GET for /pricing page, admin GET/PUT for management */
router.get('/pricing', getPricingPlans);
router.get('/pricing/admin', requireAuth, requireAdmin, getPricingPlansAdmin);
router.put('/pricing/plans', requireAuth, requireAdmin, updatePricingPlans);
/* Public subscription config — price & duration for checkout page */
router.get('/subscription/public', getPublicSubscriptionConfig);

export default router;
