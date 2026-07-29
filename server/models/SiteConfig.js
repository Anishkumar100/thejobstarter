import mongoose from 'mongoose';

/*
 * SiteConfig Schema — Single document storing configurable site-wide values
 * Use findOneAndUpdate with upsert to maintain a single document
 */
const siteConfigSchema = new mongoose.Schema({
  /* Homepage stats (manually set for marketing purposes) */
  homepageStats: {
    problems: { type: Number, default: 0 },
    articles: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
    questions: { type: Number, default: 0 }
  },
  /* DSA landing page hero background image */
  dsaHeroImage: { type: String, default: '' },
  /* Blog listing page hero background image */
  blogHeroImage: { type: String, default: '' },
  /*
   * homepageWhySection — All text content for the "Why DSA, DBMS & OS" homepage section
   * Using Mixed type to avoid Mongoose deeply-nested schema stripping.
   * Structure: { header, dsaCard, confessionCard, dbmsCard, osCard, statsFooter }
   * Frontend DEFAULT_DATA in WhyTheseThree.jsx acts as the schema with defaults.
   */
  homepageWhySection: { type: mongoose.Schema.Types.Mixed, default: {} },
  /*
   * homepageWhyTheJobStarter — All text content for the "Why TheJobStarter" homepage section
   * Structure: { subtitle, pillars, comparison }
   *   pillars: [{ title, body }]  (8 items)
   *   comparison: [{ feat, ours, gfg, lc, hr }]  (7 items)
   * Frontend PILLARS + COMPARISON in WhyTheJobStart.jsx act as the schema with defaults.
   */
  homepageWhyTheJobStarter: { type: mongoose.Schema.Types.Mixed, default: {} },
  /*
   * homepageHowItWorks — Steps for the "How it Works" homepage section
   * Structure: { steps: [{ number, id, quote, response, accent }] }
   * Frontend STEPS array in HowItWorks.jsx acts as the schema with defaults.
   */
  homepageHowItWorks: { type: mongoose.Schema.Types.Mixed, default: {} },
  /*
   * aboutPage — All text content for the /about page
   * Structure:
   *   hero: { subtitle, title, description }
   *   principles: [{ id, label, title, body, accent, route, action }]
   *   philosophy: [{ id, title, body }]
   *   manifesto: { quote, description, watermark }
   *   cta: { title, description }
   * Frontend About.jsx DEFAULT_ABOUT_DATA acts as the schema with defaults.
   */
  aboutPage: { type: mongoose.Schema.Types.Mixed, default: {} },
  /* homepageHero — Hero section content for the homepage */
  homepageHero: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    ctaPrimary: { type: String, default: '' },
    ctaPrimaryLink: { type: String, default: '' },
    ctaSecondary: { type: String, default: '' },
    ctaSecondaryLink: { type: String, default: '' },
    videoUrl: { type: String, default: '' }
  },
  /*
   * subscriptionSettings — Configurable subscription price and duration.
   * Admin can change these via the Subscription Settings admin page.
   */
  subscriptionSettings: {
    price: { type: Number, default: 99 },
    durationDays: { type: Number, default: 30 }
  },
  /*
   * pricingPlans — Array of pricing plans for the public /pricing page.
   * Fully customizable from the admin dashboard under Payments > Pricing Plans.
   * Each plan has: id, name, description, price, interval, features[], ctaText,
   * highlighted (boolean), badge (optional string), and active (boolean).
   */
  pricingPlans: {
    type: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, default: '' },
      price: { type: Number, required: true },
      interval: { type: String, default: 'monthly' },
      features: [{ type: String }],
      ctaText: { type: String, default: 'Get Started' },
      ctaLink: { type: String, default: '' },
      highlighted: { type: Boolean, default: false },
      badge: { type: String, default: '' },
      active: { type: Boolean, default: true }
    }],
    default: [
      {
        id: 'free',
        name: 'Free',
        description: 'Get started with basic access to the platform.',
        price: 0,
        interval: 'forever',
        features: [
          'Access to DSA problems',
          'Community Q&A read-only',
          'Basic articles & blog posts',
          'Public profile'
        ],
        ctaText: 'Get Started',
        ctaLink: '/sign-up',
        highlighted: false,
        badge: '',
        active: true
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Full access to everything TheJobStarter offers.',
        price: 99,
        interval: 'monthly',
        features: [
          'Everything in Free',
          'Unlimited code submissions',
          'Premium articles & cheatsheets',
          'Direct messaging',
          'Download PDFs & PPTX',
          'Priority community support'
        ],
        ctaText: 'Subscribe Now',
        ctaLink: '/subscribe',
        highlighted: true,
        badge: 'Most Popular',
        active: true
      },
      {
        id: 'lifetime',
        name: 'Lifetime',
        description: 'One-time payment. Access forever.',
        price: 999,
        interval: 'once',
        features: [
          'Everything in Premium',
          'All future premium content',
          'Lifetime updates',
          'Exclusive Discord access',
          'Priority email support',
          'Early access to new features'
        ],
        ctaText: 'Get Lifetime',
        ctaLink: '/subscribe',
        highlighted: false,
        badge: '',
        active: true
      }
    ]
  }
}, { timestamps: true });

export default mongoose.model('SiteConfig', siteConfigSchema);
