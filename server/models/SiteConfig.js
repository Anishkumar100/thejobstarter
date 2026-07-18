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
  }
}, { timestamps: true });

export default mongoose.model('SiteConfig', siteConfigSchema);
