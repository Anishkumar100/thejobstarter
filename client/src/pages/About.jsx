import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client.js';
import '../styles/about.css';

const EASE = [0.16, 1, 0.3, 1];

/* ── Default about page data (fallback when API is unavailable) ── */
const DEFAULT_ABOUT = {
  hero: {
    subtitle: 'THEJOBSTARTER / FIELD NOTE 001',
    title: 'STOP\nPREPARING\nTO PREPARE.',
    description: 'TheJobStarter is a focused operating system for placement preparation. Learn the foundations. Train under pressure. Build visible proof that you can solve difficult problems.',
  },
  principles: [
    { id: '01', label: 'Focus Over Noise', title: 'LEARN WHAT\nACTUALLY MATTERS.', body: 'Every section is built around the concepts that repeatedly shape technical interviews: problem solving, database thinking, operating-system fundamentals, and clear communication.', accent: '#e11d48', route: '/dsa', action: 'ENTER DSA' },
    { id: '02', label: 'Practice With Intent', title: 'REPETITION\nBUILDS INSTINCT.', body: 'Reading is only the start. Confidence comes from recognising patterns, making mistakes, reviewing them, and solving the next problem with more clarity.', accent: '#0066ff', route: '/dbms', action: 'EXPLORE DBMS' },
    { id: '03', label: 'Progress Together', title: 'QUESTIONS ARE\nPART OF THE WORK.', body: 'Ask better questions. Compare approaches. Explain what you learned. Growth moves faster when your effort connects with a community moving in the same direction.', accent: '#ff4f00', route: '/qa', action: 'OPEN Q&A' },
  ],
  philosophy: [
    { id: '01', title: 'BUILD. BREAK. REBUILD.', body: 'We are builders first. The fastest path to understanding is to create something, push it until it fails, inspect why it failed, and make it stronger.' },
    { id: '02', title: 'CLARITY BEATS HYPE.', body: 'Students do not need louder promises. They need a clearer path, useful material, practical direction, and the confidence to face difficult questions.' },
    { id: '03', title: 'THE WORK MUST SHOW.', body: 'A strong career is not built in one night. It is built through small wins: one solved problem, one understood concept, one better explanation at a time.' },
    { id: '04', title: 'START BEFORE YOU FEEL READY.', body: 'Nobody begins fully prepared. The difference is choosing to begin, staying consistent when progress feels slow, and returning tomorrow with more intent.' },
  ],
  manifesto: {
    quote: 'TALENT GETS\nATTENTION.\nWORK GETS RESULTS.',
    description: 'You do not need to know everything today. You need to return tomorrow with one more solved problem, one clearer concept, and one stronger attempt than yesterday.',
    watermark: 'WORK',
  },
  cta: {
    title: 'STOP WAITING\nFOR THE PERFECT\nMOMENT.',
    description: 'Pick a starting point. Stay with it. Build proof of your growth one focused session at a time.',
    watermark: 'GO',
  },
};

function SectionLabel({ children, inverse = false, className = '' }) {
  return (
    <div
      className={[
        'about-label',
        inverse ? 'about-label--inverse' : '',
        '!border-[var(--about-accent)] !text-[var(--about-accent)]',
        'shadow-[3px_3px_0_var(--about-accent)]',
        className,
      ].join(' ')}
    >
      <span className="about-label__dot !bg-[var(--about-accent)]" />
      {children}
    </div>
  );
}

function ArrowLink({ to, children, primary = false, inverse = false, className = '' }) {
  return (
    <Link
      to={to}
      className={[
        'about-action group',
        primary ? 'about-action--primary' : '',
        inverse ? 'about-action--inverse' : '',
        '!rounded-none !font-black !tracking-[0.14em]',
        'hover:!translate-x-[-5px] hover:!translate-y-[-5px]',
        className,
      ].join(' ')}
    >
      <span>{children}</span>
      <span className="about-action__arrow group-hover:translate-x-1.5">→</span>
    </Link>
  );
}

function GridPattern({ inverse = false, size = '64px', className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'about-grid',
        inverse ? 'about-grid--inverse' : '',
        className,
      ].join(' ')}
      style={{ '--grid-size': size }}
    />
  );
}

function CornerMarks({ inverse = false }) {
  const color = inverse
    ? 'var(--about-inverse-text)'
    : 'var(--about-border)';

  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-5 z-20 hidden h-12 w-12 border-l-[3px] border-t-[3px] opacity-30 md:block"
        style={{ borderColor: color }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-5 right-5 z-20 hidden h-12 w-12 border-b-[3px] border-r-[3px] opacity-30 md:block"
        style={{ borderColor: color }}
      />
    </>
  );
}

export default function About() {
  const [liveStats, setLiveStats] = useState(null);
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    let mounted = true;

    apiRequest('/site-config/public')
      .then((response) => {
        if (!mounted) return;
        setLiveStats(response.data);
        /* Merge API aboutPage data with defaults so missing fields don't break rendering */
        if (response.data?.aboutPage && typeof response.data.aboutPage === 'object') {
          setAboutData((prev) => deepMerge(prev, response.data.aboutPage));
        }
      })
      .catch((error) => {
        console.error('[ABOUT] Failed to load site data:', error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* Deep merge helper — source values override target where source has a value */
  function deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else if (Array.isArray(source[key])) {
        output[key] = source[key].map((item, i) => {
          if (item && typeof item === 'object' && target[key]?.[i]) {
            return { ...target[key][i], ...item };
          }
          return item;
        });
      } else if (source[key] !== undefined && source[key] !== '') {
        output[key] = source[key];
      }
    }
    return output;
  }

  const stats = liveStats?.homepageStats
    ? [
        {
          number: liveStats.homepageStats.problems ?? 0,
          label: 'Problems',
          route: '/dsa',
          code: 'DSA-01',
          note: 'PATTERN TRAINING',
          accent: '#e11d48',
        },
        {
          number: liveStats.homepageStats.articles ?? 0,
          label: 'Articles',
          route: '/dbms',
          code: 'CS-02',
          note: 'CORE CONCEPTS',
          accent: '#0066ff',
        },
        {
          number: liveStats.homepageStats.users ?? 0,
          label: 'Learners',
          route: '/users',
          code: 'USR-03',
          note: 'IN MOTION',
          accent: '#7c3aed',
        },
        {
          number: liveStats.homepageStats.questions ?? 0,
          label: 'Questions',
          route: '/qa',
          code: 'QA-04',
          note: 'SOLVED TOGETHER',
          accent: '#ff4f00',
        },
      ]
    : [
        {
          number: 180,
          label: 'Problems',
          route: '/dsa',
          code: 'DSA-01',
          note: 'PATTERN TRAINING',
          accent: '#e11d48',
        },
        {
          number: 95,
          label: 'Articles',
          route: '/dbms',
          code: 'CS-02',
          note: 'CORE CONCEPTS',
          accent: '#0066ff',
        },
        {
          number: 3,
          label: 'Core Domains',
          route: '/dsa',
          code: 'DOM-03',
          note: 'INTERVIEW BASE',
          accent: '#7c3aed',
        },
        {
          number: 1,
          label: 'Shared Mission',
          route: '/qa',
          code: 'GO-04',
          note: 'KEEP MOVING',
          accent: '#ff4f00',
        },
      ];

  return (
    <main className="about-page !overflow-x-clip">
      <Helmet>
        <title>About — TheJobStarter</title>
        <meta
          name="description"
          content="TheJobStarter is a placement-preparation platform for DSA, DBMS, Operating Systems, and technical community learning."
        />
      </Helmet>

      {/* ═══════════════════════════════════════════════════════
          HERO — PLACEMENT FIELD MANUAL
      ═══════════════════════════════════════════════════════ */}
      <section className="about-hero !min-h-[100svh] !border-b-[5px]">
        <GridPattern inverse size="54px" className="opacity-90" />
        <CornerMarks inverse />

        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-[330px] w-[330px] rotate-45 border-[30px] opacity-15 md:h-[560px] md:w-[560px]"
          style={{ borderColor: 'var(--about-accent)' }}
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-5 left-[8%] h-16 w-[54%] rotate-[-3deg] border-y-[3px]"
          style={{
            borderColor: 'var(--about-inverse-text)',
            background:
              'repeating-linear-gradient(-45deg, var(--about-accent) 0 16px, transparent 16px 32px)',
            opacity: 0.9,
          }}
        />

        <div
          aria-hidden="true"
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 rotate-180 font-mono text-[0.46rem] font-black tracking-[0.24em] text-[var(--about-inverse-faint)] [writing-mode:vertical-rl] xl:block"
        >
          THEJOBSTARTER // PLACEMENT FIELD MANUAL // 001
        </div>

        <div
          aria-hidden="true"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 font-mono text-[0.46rem] font-black tracking-[0.24em] text-[var(--about-inverse-faint)] [writing-mode:vertical-rl] xl:block"
        >
          DSA // DBMS // OS // COMMUNITY // BUILD YOUR EDGE
        </div>

        <div className="about-shell about-hero__shell !grid-cols-1 !gap-10 !py-28 lg:!grid-cols-[minmax(0,1fr)_360px] lg:!items-end">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="about-hero__content !max-w-[950px]"
          >
            <SectionLabel inverse>
              {aboutData.hero.subtitle}
            </SectionLabel>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.57rem] font-black uppercase tracking-[0.14em] text-[var(--about-inverse-muted)]">
              <span className="inline-flex items-center gap-2">
                <i className="h-2 w-2 animate-pulse bg-[var(--about-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--about-accent)_18%,transparent)]" />
                Placement Mode: Active
              </span>
              <span className="h-[2px] w-8 bg-[var(--about-inverse-faint)]" />
              <span>Signal: High</span>
              <span className="h-[2px] w-8 bg-[var(--about-inverse-faint)]" />
              <span>Noise: Muted</span>
            </div>

            <h1 className="about-hero__title !mt-6 !max-w-[10ch] !text-[clamp(4.25rem,10.5vw,10rem)] !leading-[0.72] !tracking-[-0.01em]">
              {aboutData.hero.title.split('\n').map((line, i) => (
                <span key={i}>
                  {i === 1 && aboutData.hero.title.split('\n').length > 1 ? (
                    <span className="text-[var(--about-accent)]">{line}</span>
                  ) : line}
                  {i < aboutData.hero.title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h1>

            <div className="mt-10 grid max-w-[720px] grid-cols-[42px_minmax(0,1fr)] gap-4 border-t-[3px] border-[var(--about-inverse-line)] pt-5 md:grid-cols-[65px_minmax(0,1fr)]">
              <span className="font-mono text-2xl font-black tracking-[-0.08em] text-[var(--about-accent)]">
                01
              </span>

              <p className="!mt-0 !max-w-[58ch] !text-[1rem] !leading-[1.8] text-[var(--about-inverse-muted)] md:!text-[1.12rem]">
                {aboutData.hero.description}
              </p>
            </div>

            <div className="about-hero__actions !mt-10">
              <ArrowLink to="/dsa" primary className="!min-w-[205px]">
                Enter DSA Arena
              </ArrowLink>

              <ArrowLink to="/qa" inverse className="!min-w-[220px]">
                Open Community
              </ArrowLink>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 40, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: EASE }}
            className="about-hero__terminal !relative !max-w-none !overflow-hidden !border-[3px] !shadow-[12px_12px_0_color-mix(in_srgb,var(--about-inverse-text)_20%,transparent)]"
          >
            <div className="absolute -bottom-7 -right-2 select-none text-[9rem] font-black leading-none tracking-[-0.16em] text-[var(--about-inverse-text)] opacity-[0.05]">
              TJS
            </div>

            <div className="about-terminal__bar !relative !z-10">
              <span>READINESS_INDEX.EXE</span>
              <span className="about-terminal__live">
                <i />
                RUNNING
              </span>
            </div>

            <div className="relative z-10 border-b-[2px] border-[var(--about-inverse-line)] px-4 py-5">
              <span className="block font-mono text-[0.48rem] font-black tracking-[0.16em] text-[var(--about-inverse-faint)]">
                BUILD YOUR
              </span>
              <strong className="block pt-1 text-[clamp(3.8rem,7vw,5.3rem)] font-black leading-[0.72] tracking-[-0.12em] text-[var(--about-accent)]">
                EDGE
              </strong>
              <span className="mt-3 block font-mono text-[0.48rem] font-black tracking-[0.14em] text-[var(--about-inverse-faint)]">
                ONE SESSION AT A TIME
              </span>
            </div>

            <div className="about-terminal__body !relative !z-10">
              {[
                ['01', 'DSA PATTERNS', 'TRAIN'],
                ['02', 'DATABASE LOGIC', 'STUDY'],
                ['03', 'SYSTEM THINKING', 'MASTER'],
                ['04', 'COMMUNITY SIGNAL', 'ENGAGE'],
              ].map(([id, label, state]) => (
                <div key={id} className="about-terminal__line">
                  <span>{id}</span>
                  <strong>{label}</strong>
                  <b>{state}</b>
                </div>
              ))}
            </div>

            <div className="about-terminal__footer !relative !z-10">
              <span>STATUS</span>
              <strong>CONSISTENCY REQUIRED →</strong>
            </div>
          </motion.aside>
        </div>

        <div className="about-hero__bottomline !h-[8px] !w-[56%]" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE / INDUSTRIAL STRIP
      ═══════════════════════════════════════════════════════ */}
      <section
        aria-label="TheJobStarter learning areas"
        className="overflow-hidden border-b-[3px] border-[var(--about-border)] bg-[var(--about-accent)] py-3 text-[var(--about-accent-ink)]"
      >
        <motion.div
          className="flex w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 28,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div
              key={groupIndex}
              className="flex items-center gap-6 px-3 font-mono text-[0.67rem] font-black tracking-[0.14em] whitespace-nowrap"
            >
              <span>DSA PATTERNS</span>
              <b className="text-lg">✦</b>
              <span>DATABASE LOGIC</span>
              <b className="text-lg">✦</b>
              <span>OPERATING SYSTEMS</span>
              <b className="text-lg">✦</b>
              <span>BUILD CONSISTENCY</span>
              <b className="text-lg">✦</b>
              <span>SHOW YOUR WORK</span>
              <b className="text-lg">✦</b>
              <span>TAKE THE SHOT</span>
              <b className="text-lg">✦</b>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          IMPACT / LIVE STATS
      ═══════════════════════════════════════════════════════ */}
      <section className="about-stats-section !overflow-hidden !py-24 md:!py-32">
        <GridPattern size="72px" className="opacity-70" />
        <CornerMarks />

        <div className="about-shell relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="about-stats-heading !mb-12 !grid !grid-cols-1 !items-end gap-8 lg:!grid-cols-[1fr_340px]"
          >
            <div>
              <SectionLabel>Platform Snapshot / 002</SectionLabel>

              <h2 className="!mt-7 !text-[clamp(3.3rem,7vw,6.5rem)] !leading-[0.78] !tracking-[0.03em]">
                BUILT FOR
                <br />
                <span>MOMENTUM.</span>
              </h2>
            </div>

            <div className="border-l-[4px] border-[var(--about-accent)] pl-5">
              <p className="!max-w-[35ch] !text-[0.94rem] !leading-[1.8]">
                Every number is a signal: learners are doing the work instead
                of endlessly planning to begin it.
              </p>

              <div className="mt-5 flex items-center gap-2 font-mono text-[0.52rem] font-black tracking-[0.14em] text-[var(--about-faint)]">
                <span className="h-2 w-2 bg-[var(--about-accent)]" />
                LIVE PLATFORM DATA
              </div>
            </div>
          </motion.div>

          <div className="about-stats-grid !gap-4 lg:!grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: EASE,
                }}
              >
                <Link
                  to={stat.route}
                  className="about-stat-card group !min-h-[270px] !border-[3px] !p-5 !shadow-[10px_10px_0_var(--about-shadow)] hover:!translate-x-[-5px] hover:!translate-y-[-5px] hover:!shadow-[15px_15px_0_var(--about-shadow)]"
                  style={{ '--stat-accent': stat.accent }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute right-[-0.5rem] top-9 select-none text-[7rem] font-black leading-none tracking-[-0.14em] opacity-[0.05]"
                  >
                    0{index + 1}
                  </div>

                  <div className="about-stat-card__top !relative !z-10">
                    <span>{stat.code}</span>
                    <span className="text-lg text-[var(--stat-accent)] transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </div>

                  <strong
                    className="!relative !z-10 !mt-12 !text-[clamp(3.5rem,5vw,5rem)]"
                    style={{ color: 'var(--stat-accent)' }}
                  >
                    {Number(stat.number).toLocaleString()}+
                  </strong>

                  <p className="!relative !z-10 !text-[0.72rem] !tracking-[0.14em]">
                    {stat.label}
                  </p>

                  <span className="relative z-10 mt-5 block font-mono text-[0.48rem] font-black tracking-[0.13em] text-[var(--about-faint)]">
                    {stat.note}
                  </span>

                  <span
                    className="about-stat-card__line !h-[7px] !bg-[var(--stat-accent)]"
                    style={{ backgroundColor: 'var(--stat-accent)' }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRINCIPLES / STACKED BENTO
      ═══════════════════════════════════════════════════════ */}
      <section className="about-principles !overflow-hidden !py-24 md:!py-32">
        <GridPattern size="84px" className="opacity-50" />

        <div className="about-shell about-principles__shell relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="about-principles__intro !mb-14 !grid-cols-1 lg:!grid-cols-[1fr_350px]"
          >
            <div>
              <SectionLabel>Method / 003</SectionLabel>

              <h2 className="!mt-7 !text-[clamp(3.4rem,7vw,6.8rem)] !leading-[0.77] !tracking-[0.02em]">
                CUT THE
                <br />
                <span>USELESS NOISE.</span>
              </h2>
            </div>

            <p className="!self-end !border-l-[4px] !border-[var(--about-accent)] !pl-5 !text-[0.98rem] !leading-[1.8]">
              Less scrolling. Less second-guessing. More deliberate time spent
              on concepts, patterns, and practice that improve your interview
              performance.
            </p>
          </motion.div>

          <div className="about-principles__grid !grid-cols-1 !gap-7 lg:!grid-cols-3 lg:!gap-6">
            {aboutData.principles.map((principle, index) => (
              <motion.article
                key={principle.id}
                initial={{ opacity: 0, y: 42 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-45px' }}
                transition={{
                  duration: 0.52,
                  delay: index * 0.1,
                  ease: EASE,
                }}
                whileHover={{
                  x: -7,
                  y: -9,
                  transition: { duration: 0.2, ease: 'easeOut' },
                }}
                className={[
                  'about-principle-card group !min-h-[480px] !border-[3px] !p-6 !shadow-[13px_13px_0_var(--about-shadow)]',
                  index === 1 ? 'lg:translate-y-9' : '',
                  index === 2 ? 'lg:translate-y-[4.5rem]' : '',
                ].join(' ')}
                style={{ '--card-accent': principle.accent }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-3 top-11 z-0 select-none text-[10rem] font-black leading-none tracking-[-0.16em] opacity-[0.055]"
                >
                  {principle.id}
                </div>

                <div className="about-principle-card__head !relative !z-10">
                  <span>/{principle.id}</span>
                  <span
                    className="border px-2 py-1 text-[0.45rem]"
                    style={{
                      borderColor: principle.accent,
                      color: principle.accent,
                    }}
                  >
                    {principle.label}
                  </span>
                </div>

                <div className="relative z-10 mt-10 flex items-center gap-3">
                  <span
                    className="h-[4px] w-10"
                    style={{ background: principle.accent }}
                  />
                  <span className="font-mono text-[0.5rem] font-black tracking-[0.14em] text-[var(--about-faint)]">
                    THEJOBSTARTER METHOD
                  </span>
                </div>

                <h3 className="!relative !z-10 !mt-5 !text-[clamp(2.45rem,4vw,4rem)] !leading-[0.78] !tracking-[0.03em]">
                  {principle.title}
                </h3>

                <p className="!relative !z-10 !mt-8 !text-[0.96rem] !leading-[1.85]">
                  {principle.body}
                </p>

                <Link
                  to={principle.route}
                  className="relative z-10 mt-auto flex items-center justify-between border-t-[3px] border-[var(--about-border)] pt-5 font-mono text-[0.58rem] font-black tracking-[0.13em] text-[var(--about-text)] no-underline"
                >
                  <span>{principle.action}</span>
                  <span
                    className="text-2xl transition-transform duration-200 group-hover:translate-x-2"
                    style={{ color: principle.accent }}
                  >
                    →
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THEWEBYTES / LOGO + LEDGER
      ═══════════════════════════════════════════════════════ */}
      <section className="about-webytes !relative !overflow-hidden !py-24 md:!py-32">
        <GridPattern size="68px" className="opacity-40" />
        <CornerMarks />

        <div className="about-shell about-webytes__shell !relative !z-10 !grid-cols-1 lg:!grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="about-webytes__intro"
          >
            <SectionLabel>The People / 004</SectionLabel>

            <h2 className="!mt-7 !text-[clamp(3.4rem,6vw,6rem)] !leading-[0.77] !tracking-[0.02em]">
              BUILT BY
              <br />
              <span>THEWEBYTES.</span>
            </h2>

            <p className="!mt-8 !text-[1rem] !leading-[1.85]">
              A team of builders who believe practical learning should feel
              sharp, capable, and worth coming back to every day.
            </p>

            {/* Real logo image — no TW text fallback */}
            <div className="relative mt-10 overflow-hidden border-[3px] border-[var(--about-border)] bg-[var(--about-surface)] p-3 shadow-[12px_12px_0_var(--about-shadow)]">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-45deg, transparent 0 10px, var(--about-border) 10px 11px)',
                }}
              />

              <div className="relative z-10 flex min-h-[220px] items-center justify-center border-[3px] border-[var(--about-border)] bg-[var(--about-surface-alt)] p-7">
                <span className="absolute left-3 top-3 font-mono text-[0.48rem] font-black tracking-[0.14em] text-[var(--about-faint)]">
                  BUILT BY / THEWEBYTES
                </span>

                <a
                  href="https://thewebytes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="/thewebytes.png?v=2"
                    alt="TheWebytes"
                    className="block h-auto max-h-[135px] w-[min(320px,85%)] object-contain contrast-125"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                      console.error(
                        'TheWebytes logo missing: add public/thewebytes.png'
                      );
                    }}
                  />
                </a>

                <span className="absolute bottom-3 right-3 font-mono text-[0.48rem] font-black tracking-[0.14em] text-[var(--about-accent)]">
                  T.W / BUILDERS UNIT
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 font-mono text-[0.5rem] font-black tracking-[0.12em]">
              {['BUILDERS', 'ENGINEERS', 'PROBLEM SOLVERS'].map((item) => (
                <span
                  key={item}
                  className="border-[2px] border-[var(--about-border)] px-3 py-2 text-[var(--about-muted)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="about-webytes__ledger !mt-3 lg:!mt-0">
            <div className="flex items-center justify-between border-b-[3px] border-[var(--about-border)] pb-4 font-mono text-[0.54rem] font-black tracking-[0.15em] text-[var(--about-faint)]">
              <span>OPERATING PRINCIPLES</span>
              <span className="text-[var(--about-accent)]">04 ENTRIES</span>
            </div>

            {aboutData.philosophy.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-45px' }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: EASE,
                }}
                whileHover={{
                  x: 7,
                  transition: { duration: 0.18 },
                }}
                className="about-ledger-row group !grid-cols-[58px_1fr_auto] !gap-4 !py-8 hover:bg-[var(--about-surface-alt)]"
              >
                <span className="about-ledger-row__id !text-[1.6rem]">
                  {item.id}
                </span>

                <div>
                  <h3 className="!text-[1.2rem] !tracking-[0.03em]">
                    {item.title}
                  </h3>
                  <p className="!mt-3 !text-[0.94rem] !leading-[1.8]">
                    {item.body}
                  </p>
                </div>

                <span className="about-ledger-row__arrow !text-2xl transition-transform duration-200 group-hover:translate-x-2">
                  →
                </span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MANIFESTO / FULL POSTER WALL
      ═══════════════════════════════════════════════════════ */}
      <section className="about-manifesto !min-h-[82svh] !border-b-[5px] !py-28">
        <GridPattern inverse size="72px" className="opacity-80" />
        <CornerMarks inverse />

        <span className="absolute left-[8%] top-[14%] z-20 hidden -rotate-6 border-[2px] border-[var(--about-accent)] px-3 py-2 font-mono text-[0.5rem] font-black tracking-[0.13em] text-[var(--about-accent)] md:block">
          EARNED, NOT GIVEN
        </span>

        <span className="absolute bottom-[15%] right-[8%] z-20 hidden rotate-6 border-[2px] border-[var(--about-accent)] px-3 py-2 font-mono text-[0.5rem] font-black tracking-[0.13em] text-[var(--about-accent)] md:block">
          KEEP SHOWING UP
        </span>

        <div className="about-manifesto__watermark !top-[52%] !text-[clamp(9rem,29vw,29rem)] !tracking-[-0.16em] !opacity-[0.045]">
          {aboutData.manifesto.watermark || 'WORK'}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="about-manifesto__content !max-w-[1050px]"
        >
          <SectionLabel inverse>The Standard / 005</SectionLabel>

          <blockquote className="!mt-12 !text-[clamp(2.5rem,6vw,6rem)] !font-black !not-italic !leading-[0.84] !tracking-[0.02em] !uppercase">
            {aboutData.manifesto.quote.split('\n').map((line, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? (
                  <span className="text-[var(--about-accent)]">{line}</span>
                ) : line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </blockquote>

          <p className="mx-auto mt-9 max-w-[62ch] text-[0.95rem] leading-[1.85] text-[var(--about-inverse-muted)]">
            {aboutData.manifesto.description}
          </p>

          <div className="about-manifesto__author !mt-10">
            <i className="!w-16" />
            <strong>THEWEBYTES</strong>
            <span>BUILD WITH INTENT</span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA / RECRUITMENT POSTER
      ═══════════════════════════════════════════════════════ */}
      <section className="about-cta-section !relative !overflow-hidden !py-24 md:!py-32">
        <GridPattern size="88px" className="opacity-40" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: EASE }}
          className="about-cta-card !relative !border-[4px] !p-7 !shadow-[18px_18px_0_var(--about-shadow)] md:!p-14"
        >
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-5 w-48"
            style={{
              background:
                'repeating-linear-gradient(-45deg, var(--about-accent) 0 12px, var(--about-text) 12px 24px)',
            }}
          />

          <div className="about-cta-card__watermark !right-[-0.6rem] !top-[-2rem] !text-[clamp(12rem,25vw,25rem)] !tracking-[-0.18em]">
            {aboutData.cta.watermark || 'GO'}
          </div>

          <div className="about-cta-card__content !max-w-[840px]">
            <SectionLabel>Your Move / 006</SectionLabel>

            <h2 className="!mt-9 !text-[clamp(3.25rem,7vw,7rem)] !leading-[0.76] !tracking-[0.02em]">
              {aboutData.cta.title.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? (
                    <span className="text-[var(--about-accent)]">{line}</span>
                  ) : line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h2>

            <div className="mt-9 grid max-w-[680px] grid-cols-[42px_1fr] gap-4 border-t-[3px] border-[var(--about-line-soft)] pt-5">
              <span className="font-mono text-xl font-black text-[var(--about-accent)]">
                06
              </span>
              <p className="!mt-0 !text-[1rem] !leading-[1.85]">
                {aboutData.cta.description}
              </p>
            </div>

            <div className="about-cta-card__actions !mt-10">
              <ArrowLink to="/dsa" primary className="!min-w-[190px]">
                Explore DSA
              </ArrowLink>

              <ArrowLink to="/sign-up" className="!min-w-[230px]">
                Create Your Account
              </ArrowLink>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.5rem] font-black tracking-[0.14em] text-[var(--about-faint)]">
              <span>01 / PICK A DOMAIN</span>
              <span className="text-[var(--about-accent)]">✦</span>
              <span>02 / START WORKING</span>
              <span className="text-[var(--about-accent)]">✦</span>
              <span>03 / RETURN TOMORROW</span>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="about-footer !border-t-[4px]">
        <div className="about-shell about-footer__inner !py-1">
          <span>THEJOBSTARTER / PREP WITH PURPOSE</span>
          <span>THEWEBYTES — {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}