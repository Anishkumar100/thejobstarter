import SiteConfig from '../models/SiteConfig.js';

/* Default steps for the How it Works section */
const DEFAULT_HOW_IT_WORKS_STEPS = [
  {
    number: 1, id: 'confusion',
    quote: '"There\'s so much to study. DSA, DBMS, OS... where do I even start?"',
    response: 'Structured roadmaps for each subject. Start with what matters most, track your progress.',
    accent: '#ff4f00'
  },
  {
    number: 2, id: 'clarity',
    quote: '"I finally understand how arrays work, but how do I apply this in an interview?"',
    response: 'Curated problem sets with company tags, difficulty levels, and video explanations.',
    accent: '#0066ff'
  },
  {
    number: 3, id: 'confidence',
    quote: '"I\'m solving medium problems now. But am I ready for the actual interview?"',
    response: 'Mock interview questions, community Q&A, and trusted answers from placed seniors.',
    accent: '#10b981'
  },
  {
    number: 4, id: 'result',
    quote: '"I got the offer. TCS Digital. And I used TheJobStarter every single day."',
    response: 'Join 10,000+ students who placed using TheJobStarter.',
    accent: '#ff4f00'
  }
];

/*
 * GET /api/site-config/public
 * Public: Get the current site config (used by homepage)
 */
export async function getPublicConfig(req, res) {
  try {
    console.log('[SITE_CONFIG] Fetching public config...');
    let config = await SiteConfig.findOne();
    if (!config) {
      console.log('[SITE_CONFIG] No config found, creating default...');
      config = await SiteConfig.create({
        homepageStats: { problems: 0, articles: 0, users: 0, questions: 0 },
        homepageHero: {
          title: 'Master Placements.<br />Crack the Code.<br />Land Your Dream Job.',
          subtitle: '180+ curated DSA problems, in-depth DBMS & OS articles, and a thriving community \u2014 all in one brutalist package.',
          ctaPrimary: 'Browse DSA',
          ctaPrimaryLink: '/dsa',
          ctaSecondary: 'Join Community',
          ctaSecondaryLink: '/qa',
          videoUrl: '/hero-video.mp4'
        },
        dsaHeroImage: '',
        blogHeroImage: '',
        homepageWhySection: {
          header: { tag: 'Why You Need', title: 'DSA, DBMS & OS', subtitle: 'The three subjects that decide your placement outcome.' },
          dsaCard: {
            tag: 'DSA \u2014 GATEKEEPER', number: 70,
            description: 'Companies screen candidates purely on DSA before your resume reaches a human recruiter.',
            quoteText: 'The gatekeeper of nearly every software engineering interview.',
            quoteCite: 'OnJob.io, 2026',
            stats: [{ number: '180', label: 'Problems' }, { number: '12', label: 'Patterns' }, { number: '6', label: 'Difficulty bands' }],
            ctaLabel: 'Start DSA \u2014 180 Problems', ctaLink: '/dsa'
          },
          confessionCard: {
            quote: 'I spent 6 months learning React.\nGot to the interview.\nThey asked me to reverse a linked list.',
            attribution: 'Every placement student, ever'
          },
          dbmsCard: {
            tag: 'DBMS',
            description: 'Second most-asked subject after DSA in every tech placement cycle.',
            quoteText: 'Second most important subject after DSA.',
            quoteCite: 'GeeksforGeeks',
            stats: ['45+ Articles', '10 Core Topics'],
            ctaLabel: 'Explore DBMS \u2014 45+ Articles', ctaLink: '/dbms'
          },
          osCard: {
            tag: 'Operating Systems', subTag: 'MOST IGNORED',
            headlineLine1: 'One OS round', headlineLine2: 'can make or break', headlineLine3: 'your shortlisting.',
            body: "Service companies test OS concepts heavily. Product companies are now joining in. Most candidates skip it entirely \u2014 that's your edge.",
            quoteText: 'CS fundamentals are tested heavily at service companies and increasingly at product companies too.',
            quoteCite: "Let's Code, 2026",
            ctaLabel: 'Explore OS \u2014 40+ Articles', ctaLink: '/os'
          },
          statsFooter: [
            { stat: '93%', text: 'of job postings required data structures knowledge', cite: 'hackajob, 2025' },
            { stat: '80\u201390%', text: 'of candidates fail technical coding rounds', cite: 'Karat, 2026' },
            { stat: 'Big 3', text: 'Algorithms \u00b7 SQL \u00b7 Data Structures \u2014 top 3 by volume', cite: 'HackerEarth CEO, 2026' }
          ]
        },
        homepageWhyTheJobStarter: {
          subtitle: 'DSA, DBMS, and OS in one platform. Consistent structure across every subject. Built for how Indian campuses actually hire.',
          pillars: [
            {
              title: 'Structured Navigation,\nNot One Long Scroll',
              body: "GFG packs an entire topic \u2014 theory, examples, edge cases, related problems \u2014 into one long article, which is why developers commonly describe it as hard to navigate. We split every subject into Lessons \u2192 Subtopics \u2192 Problems as separate pages, so you focus on one concept at a time instead of endless scrolling."
            },
            {
              title: 'One Architecture,\nThree Subjects',
              body: 'DSA, DBMS, and OS were designed together from day one, sharing the same structure. GeeksforGeeks, LeetCode, and HackerRank each grew around one subject and never rebuilt around a shared model \u2014 their DBMS/OS content, where it exists, doesn\u2019t even navigate like their DSA content does.'
            },
            {
              title: 'Four Ways Into\nEvery Topic',
              body: 'Article, embedded video, downloadable PDF, and optional PPTX \u2014 on every single subtopic. No competitor ships native downloadable slide decks as a platform feature; any PPT tied to their names online is third-party, not theirs.'
            },
            {
              title: 'Built to Teach,\nNot Just Judge',
              body: "Every problem walks through the approach and reasoning before the code. LeetCode hands you a blank editor. HackerRank is built around timed pass/fail assessments for employers. We\u2019re built to teach how to think, not just check if you solved it."
            },
            {
              title: 'Q&A Designed\nfor Signal',
              body: "Moderator approval, accepted answers, and voting are built in from the start \u2014 not a comment section retrofitted later. HackerRank\u2019s own users describe its discussion tabs as leaning toward code-dumping rather than real Q&A."
            },
            {
              title: 'Tagged for the Companies\nThat Actually Hire You',
              body: 'Company tags span global product companies alongside the mass-recruiting service companies that dominate most campus placement drives \u2014 the full spectrum of who\u2019s actually in the room, not just a FAANG-first list built for a different hiring market.'
            },
            {
              title: 'One Profile,\nYour Whole Trail',
              body: "LeetCode and HackerRank profiles are stat trackers. Ours links LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, and CodeForces into a single profile \u2014 built to be the link a recruiter actually clicks, not an internal leaderboard only you see."
            },
            {
              title: 'Aptitude &\nReasoning, Coming Soon',
              body: "DSA, DBMS, and OS are just the start. Aptitude and reasoning \u2014 the fourth pillar of campus placement prep \u2014 is already on the roadmap, built to slot into the exact same Lessons \u2192 Subtopics \u2192 Problems structure as everything else here."
            }
          ],
          comparison: [
            {
              feat: 'DBMS Content',
              ours: 'In-depth articles covering SQL, normalization, transactions, indexing, concurrency control, and query optimization \u2014 placement-focused',
              gfg: 'Tutorials on database fundamentals and SQL syntax',
              lc: 'SQL query practice only \u2014 no conceptual DBMS theory track',
              hr: 'A short skill-quiz on DBMS basics \u2014 no structured lesson track or theory explanations'
            },
            {
              feat: 'OS Content',
              ours: 'Articles covering process management, CPU scheduling, memory management, deadlocks, file systems, and disk scheduling \u2014 placement-focused',
              gfg: 'Reference pages on operating system concepts and algorithms',
              lc: 'Not available in platform',
              hr: 'No dedicated OS track \u2014 appears only inside bundled assessment tests for employers'
            },
            {
              feat: 'Code Language Support',
              ours: 'Python, JavaScript, Java, and C++ \u2014 tabbed switching on every solution, one-click copy, consistent across all problems',
              gfg: 'Multiple language solutions in community-contributed posts',
              lc: 'Built-in code editor supporting multiple languages with run and submit',
              hr: 'Multiple languages supported in its code editor and test environment'
            },
            {
              feat: 'Video Walkthroughs',
              ours: 'Embedded YouTube walkthroughs on key problems \u2014 watch the approach explained while reading the solution, all on the same page',
              gfg: 'Some articles include embedded video content from external creators',
              lc: 'Video solutions available for Premium subscribers',
              hr: 'No embedded conceptual video walkthroughs on problems'
            },
            {
              feat: 'Community Q&A',
              ours: 'Built-in Q&A with tag-based organization, voting, accepted answers, and a moderator approval workflow',
              gfg: 'Comment sections below articles for discussion',
              lc: 'Discuss forum with voting, sorting, and topic categories',
              hr: 'Limited discussion tabs, with users noting they lean toward posting full code rather than structured Q&A'
            },
            {
              feat: 'Downloadable Study Material',
              ours: 'PDF reference on every subtopic, plus optional PPTX slide decks and category-filtered cheatsheets \u2014 all downloadable and tracked',
              gfg: 'Some cheatsheet/quick-reference PDFs available',
              lc: 'Not available in platform',
              hr: 'Not available in platform'
            },
            {
              feat: 'User Profiles & Social',
              ours: 'Custom profiles with bio, college, skills, external platform links (LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, CodeForces), follower system, activity feed, and direct messaging',
              gfg: 'User profiles with activity history and discussion participation',
              lc: 'User profiles with solved problems, ranking, and contest history',
              hr: 'Profiles centered on badges and certifications rather than social/community features'
            }
          ],
          homepageHowItWorks: {
            steps: DEFAULT_HOW_IT_WORKS_STEPS.map(s => ({ ...s }))
          }
        }
      });
    }
    console.log('[SITE_CONFIG] Public config fetched');
    /*
     * If homepageHero is missing (legacy doc created before schema update),
     * seed it with defaults so the admin form always has values to edit.
     */
    if (!config.homepageHero || !config.homepageHero.title) {
      console.log('[SITE_CONFIG] Seeding homepageHero defaults...');
      config.homepageHero = {
        title: 'Master Placements.<br />Crack the Code.<br />Land Your Dream Job.',
        subtitle: '180+ curated DSA problems, in-depth DBMS & OS articles, and a thriving community \u2014 all in one brutalist package.',
        ctaPrimary: 'Browse DSA',
        ctaPrimaryLink: '/dsa',
        ctaSecondary: 'Join Community',
        ctaSecondaryLink: '/qa',
        videoUrl: '/hero-video.mp4'
      };
      /* Persist defaults so next load doesn't need to re-seed */
      await SiteConfig.findOneAndUpdate({}, { $set: { homepageHero: config.homepageHero } });
    }
    res.json({
      data: {
        homepageStats: config.homepageStats,
        dsaHeroImage: config.dsaHeroImage || '',
        blogHeroImage: config.blogHeroImage || '',
        homepageWhySection: config.homepageWhySection,
        homepageWhyTheJobStarter: config.homepageWhyTheJobStarter,
        homepageHowItWorks: config.homepageHowItWorks,
        aboutPage: config.aboutPage,
        homepageHero: config.homepageHero
      }
    });
  } catch (error) {
    console.error('[SITE_CONFIG] Error fetching config:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/site-config
 * Admin: Update site config values
 * Supports: homepageStats, dsaHeroImage, blogHeroImage, homepageWhySection, homepageWhyTheJobStarter, homepageHowItWorks, aboutPage, homepageHero
 */
export async function updateConfig(req, res) {
  try {
    console.log('[SITE_CONFIG] Updating config with:', req.body);
    const { homepageStats, dsaHeroImage, blogHeroImage, homepageWhySection, homepageWhyTheJobStarter, homepageHowItWorks, aboutPage, homepageHero } = req.body;

    const update = { $set: {} };

    if (homepageStats && typeof homepageStats === 'object') {
      update.$set.homepageStats = homepageStats;
    }
    if (typeof dsaHeroImage === 'string') {
      update.$set.dsaHeroImage = dsaHeroImage;
    }
    if (typeof blogHeroImage === 'string') {
      update.$set.blogHeroImage = blogHeroImage;
    }
    if (aboutPage && typeof aboutPage === 'object') {
      update.$set.aboutPage = aboutPage;
    }
    if (homepageWhySection && typeof homepageWhySection === 'object') {
      update.$set.homepageWhySection = homepageWhySection;
    }
    if (homepageWhyTheJobStarter && typeof homepageWhyTheJobStarter === 'object') {
      update.$set.homepageWhyTheJobStarter = homepageWhyTheJobStarter;
    }
    if (homepageHowItWorks && typeof homepageHowItWorks === 'object') {
      update.$set.homepageHowItWorks = homepageHowItWorks;
    }
    if (homepageHero && typeof homepageHero === 'object') {
      update.$set.homepageHero = homepageHero;
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      update,
      { upsert: true, new: true }
    );
    console.log('[SITE_CONFIG] Config updated');
    res.json({
      data: {
        homepageStats: config.homepageStats,
        dsaHeroImage: config.dsaHeroImage || '',
        blogHeroImage: config.blogHeroImage || '',
        homepageWhySection: config.homepageWhySection,
        homepageWhyTheJobStarter: config.homepageWhyTheJobStarter,
        homepageHowItWorks: config.homepageHowItWorks,
        homepageHero: config.homepageHero || {}
      }
    });
  } catch (error) {
    console.error('[SITE_CONFIG] Error updating config:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/site-config/why-section
 * Admin: Update just the homepageWhySection field (lightweight endpoint for the admin form)
 */
export async function updateWhySection(req, res) {
  try {
    console.log('[SITE_CONFIG] Updating WhyTheseThree section...');
    const { homepageWhySection } = req.body;
    if (!homepageWhySection || typeof homepageWhySection !== 'object') {
      return res.status(400).json({ error: 'homepageWhySection object is required' });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: { homepageWhySection } },
      { upsert: true, new: true }
    );
    console.log('[SITE_CONFIG] WhyTheseThree section updated');
    res.json({ data: { homepageWhySection: config.homepageWhySection } });
  } catch (error) {
    console.error('[SITE_CONFIG] Error updating WhyTheseThree section:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/site-config/why-the-job-starter
 * Admin: Update just the homepageWhyTheJobStarter field
 */
export async function updateWhyTheJobStarter(req, res) {
  try {
    console.log('[SITE_CONFIG] Updating WhyTheJobStarter section...');
    const { homepageWhyTheJobStarter } = req.body;
    if (!homepageWhyTheJobStarter || typeof homepageWhyTheJobStarter !== 'object') {
      return res.status(400).json({ error: 'homepageWhyTheJobStarter object is required' });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: { homepageWhyTheJobStarter } },
      { upsert: true, new: true }
    );
    console.log('[SITE_CONFIG] WhyTheJobStarter section updated');
    res.json({ data: { homepageWhyTheJobStarter: config.homepageWhyTheJobStarter } });
  } catch (error) {
    console.error('[SITE_CONFIG] Error updating WhyTheJobStarter section:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/site-config/how-it-works
 * Admin: Update just the homepageHowItWorks field
 */
export async function updateHowItWorks(req, res) {
  try {
    console.log('[SITE_CONFIG] Updating HowItWorks section...');
    const { homepageHowItWorks } = req.body;
    if (!homepageHowItWorks || typeof homepageHowItWorks !== 'object') {
      return res.status(400).json({ error: 'homepageHowItWorks object is required' });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: { homepageHowItWorks } },
      { upsert: true, new: true }
    );
    console.log('[SITE_CONFIG] HowItWorks section updated');
    res.json({ data: { homepageHowItWorks: config.homepageHowItWorks } });
  } catch (error) {
    console.error('[SITE_CONFIG] Error updating HowItWorks section:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/site-config/about-page
 * Admin: Update the aboutPage field (full About page content)
 * Body: { aboutPage: { hero, principles, philosophy, manifesto, cta } }
 */
export async function updateAboutPage(req, res) {
  try {
    console.log('[SITE_CONFIG] Updating About Page content...');
    const { aboutPage } = req.body;
    if (!aboutPage || typeof aboutPage !== 'object') {
      return res.status(400).json({ error: 'aboutPage object is required' });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: { aboutPage } },
      { upsert: true, new: true }
    );
    console.log('[SITE_CONFIG] About Page content updated');
    res.json({ data: { aboutPage: config.aboutPage } });
  } catch (error) {
    console.error('[SITE_CONFIG] Error updating About Page:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/site-config/hero-section
 * Admin: Update just the homepageHero field (title, subtitle, CTAs, video URL)
 * Body: { homepageHero: { title, subtitle, ctaPrimary, ctaPrimaryLink, ctaSecondary, ctaSecondaryLink, videoUrl } }
 */
export async function updateHeroSection(req, res) {
  try {
    console.log('[SITE_CONFIG] Updating Hero section...');
    const { homepageHero } = req.body;
    if (!homepageHero || typeof homepageHero !== 'object') {
      return res.status(400).json({ error: 'homepageHero object is required' });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: { homepageHero } },
      { upsert: true, new: true }
    );
    console.log('[SITE_CONFIG] Hero section updated');
    res.json({ data: { homepageHero: config.homepageHero } });
  } catch (error) {
    console.error('[SITE_CONFIG] Error updating Hero section:', error.message);
    res.status(500).json({ error: error.message });
  }
}
