import { useMemo } from 'react';
import { Link } from 'react-router-dom';

/*
 * WhyTheJobStarter — Section 5
 * MAX BRUTALIST visual treatment.
 * Data (PILLARS + COMPARISON) unchanged — only visual layer enhanced.
 */

const PILLARS = [
  {
    title: 'Structured Navigation,\nNot One Long Scroll',
    body: "GFG packs an entire topic — theory, examples, edge cases, related problems — into one long article, which is why developers commonly describe it as hard to navigate. We split every subject into Lessons → Subtopics → Problems as separate pages, so you focus on one concept at a time instead of endless scrolling."
  },
  {
    title: 'One Architecture,\nThree Subjects',
    body: 'DSA, DBMS, and OS were designed together from day one, sharing the same structure. GeeksforGeeks, LeetCode, and HackerRank each grew around one subject and never rebuilt around a shared model — their DBMS/OS content, where it exists, doesn\'t even navigate like their DSA content does.'
  },
  {
    title: 'Four Ways Into\nEvery Topic',
    body: 'Article, embedded video, downloadable PDF, and optional PPTX — on every single subtopic. No competitor ships native downloadable slide decks as a platform feature; any PPT tied to their names online is third-party, not theirs.'
  },
  {
    title: 'Built to Teach,\nNot Just Judge',
    body: "Every problem walks through the approach and reasoning before the code. LeetCode hands you a blank editor. HackerRank is built around timed pass/fail assessments for employers. We're built to teach how to think, not just check if you solved it."
  },
  {
    title: 'Q&A Designed\nfor Signal',
    body: "Moderator approval, accepted answers, and voting are built in from the start — not a comment section retrofitted later. HackerRank's own users describe its discussion tabs as leaning toward code-dumping rather than real Q&A."
  },
  {
    title: 'Tagged for the Companies\nThat Actually Hire You',
    body: 'Company tags span global product companies alongside the mass-recruiting service companies that dominate most placement drives — one system covering the full range of who\'s actually in the room.'
  },
  {
    title: 'One Profile,\nYour Whole Trail',
    body: "LeetCode and HackerRank profiles are stat trackers. Ours links LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, and CodeForces into a single profile — built to be the link a recruiter actually clicks, not an internal leaderboard only you see."
  },
  {
    title: 'Aptitude &\nReasoning, Coming Soon',
    body: "DSA, DBMS, and OS are just the start. Aptitude and reasoning — the fourth pillar of campus placement prep — is already on the roadmap, built to slot into the exact same Lessons → Subtopics → Problems structure as everything else here."
  }
];

const COMPARISON = [
  {
    feat: 'DBMS Content',
    ours: 'In-depth articles covering SQL, normalization, transactions, indexing, concurrency control, and query optimization — placement-focused',
    gfg: 'Basic tutorials on database fundamentals and SQL syntax — no placement-focused structure',
    lc: 'SQL query practice only — no conceptual DBMS theory track',
    hr: 'A short skill-quiz on DBMS basics — no structured lesson track or theory explanations'
  },
  {
    feat: 'OS Content',
    ours: 'Articles covering process management, CPU scheduling, memory management, deadlocks, file systems, and disk scheduling — placement-focused',
    gfg: 'Basic reference pages on operating system concepts — not organized as a learning track',
    lc: 'Not available in platform',
    hr: 'No dedicated OS track — appears only inside bundled assessment tests for employers'
  },
  {
    feat: 'Code Language Support',
    ours: 'Python, JavaScript, Java, and C++ — tabbed switching on every solution, one-click copy, consistent across all problems',
    gfg: 'Multiple language solutions in community-contributed posts — inconsistent quality, no tabbed switching',
    lc: 'Multi-language online judge for running and submitting code — no built-in explanation of approach',
    hr: 'Multi-language code editor built for timed assessments, not conceptual learning'
  },
  {
    feat: 'Video Walkthroughs',
    ours: 'Embedded YouTube walkthroughs on key problems — watch the approach explained while reading the solution, all on the same page',
    gfg: 'Some articles include embedded video from external creators — inconsistent, not a platform-wide feature',
    lc: 'Video solutions gated behind a Premium subscription',
    hr: 'No embedded conceptual video walkthroughs on problems'
  },
  {
    feat: 'Community Q&A',
    ours: 'Built-in Q&A with tag-based organization, voting, accepted answers, and a moderator approval workflow',
    gfg: 'Comment sections below articles — no voting, no accepted-answer system, no moderation',
    lc: 'Open discuss forum with voting and sorting — unmoderated, so answer quality varies',
    hr: 'Limited discussion tabs, with users noting they lean toward posting full code rather than structured Q&A'
  },
  {
    feat: 'Downloadable Study Material',
    ours: 'PDF reference on every subtopic, plus optional PPTX slide decks and category-filtered cheatsheets — all downloadable and tracked',
    gfg: 'Some cheatsheet PDFs available — not per-topic, and no slide-deck format',
    lc: 'Not available in platform',
    hr: 'Not available in platform'
  },
  {
    feat: 'User Profiles & Social',
    ours: 'Custom profiles with bio, college, skills, external platform links (LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, CodeForces), follower system, activity feed, and direct messaging',
    gfg: 'Basic profile with activity history — no follower system, no messaging, no external platform linking',
    lc: 'Internal-only stat tracker — solved-problem count, ranking, and contest history, visible mainly within the platform itself',
    hr: 'Profiles centered on badges and certifications — no social layer, no follow system, no messaging'
  }
];
const BORDER_W = 5;
const SHADOW = '18px 18px 0 var(--shadow-color)';
const SHADOW_HOVER = '26px 26px 0 var(--shadow-color)';
const TRANS = 'all 0.1s ease';

export default function WhyTheJobStarter({ sectionData }) {

  /*
   * Use API data if available, otherwise fall back to hardcoded defaults
   */
  const pillars = useMemo(() => {
    if (sectionData?.pillars && Array.isArray(sectionData.pillars) && sectionData.pillars.length > 0) {
      return sectionData.pillars;
    }
    return PILLARS;
  }, [sectionData]);

  const comparison = useMemo(() => {
    if (sectionData?.comparison && Array.isArray(sectionData.comparison) && sectionData.comparison.length > 0) {
      return sectionData.comparison;
    }
    return COMPARISON;
  }, [sectionData]);

  const subtitle = sectionData?.subtitle || "DSA, DBMS, and OS in one platform. Consistent structure across every subject. Built for how Indian campuses actually hire.";

  const liftIn = e => {
    e.currentTarget.style.boxShadow = SHADOW_HOVER;
    e.currentTarget.style.transform = 'translate(-8px, -8px)';
  };
  const liftOut = e => {
    e.currentTarget.style.boxShadow = SHADOW;
    e.currentTarget.style.transform = 'translate(0, 0)';
  };

  return (
    <section
      className="py-20 md:py-28"
      style={{
        borderTop: '8px solid var(--border-color)',
        borderBottom: '8px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background noise pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.07,
        pointerEvents: 'none',
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 24px, var(--border-color) 24px, var(--border-color) 25px),
          repeating-linear-gradient(-45deg, transparent, transparent 24px, var(--border-color) 24px, var(--border-color) 25px)
        `
      }} />

      <div className="max-w-6xl mx-auto px-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══ HEADER ═════════════════════════════════ */}
        <header className="mb-16 md:mb-24" style={{ position: 'relative' }}>
          {/* Decorative top bar */}
          <div style={{
            width: '80px', height: '8px',
            backgroundColor: 'var(--accent)',
            marginBottom: '20px'
          }} />

          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 mb-5 px-4 py-2"
            style={{
              border: `${BORDER_W - 1}px solid var(--border-color)`,
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '6px 6px 0 var(--shadow-color)',
              fontWeight: 900,
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}
          >
            <span style={{ width: 8, height: 8, backgroundColor: 'var(--accent)', display: 'inline-block' }} />
            Why TheJobStarter
          </div>

          <h2
            className="font-black uppercase m-0"
            style={{
              fontSize: 'clamp(3.5rem,12vw,7rem)',
              lineHeight: 0.8,
              letterSpacing: '-0.06em',
              color: 'var(--text-primary)',
              wordBreak: 'break-word'
            }}
          >
            Why<br />TheJobStarter?
          </h2>

          {/* Decorative slash */}
          <div style={{
            width: '100%', height: '5px',
            backgroundColor: 'var(--border-color)',
            marginTop: '16px',
            marginBottom: '16px'
          }} />

          <p
            className="text-base md:text-lg max-w-2xl leading-relaxed"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500
            }}
          >
            {subtitle}
          </p>
        </header>

        {/* ═══ 8 PILLAR CARDS ═════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 md:mb-32">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="flex flex-col p-8 md:p-10"
              style={{
                border: `${BORDER_W}px solid var(--border-color)`,
                backgroundColor: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-tertiary)',
                boxShadow: SHADOW,
                transform: 'translate(0, 0)',
                transition: TRANS,
                position: 'relative'
              }}
              onMouseEnter={liftIn}
              onMouseLeave={liftOut}
            >
              {/* Decorative corner bracket — top-right */}
              <div style={{
                position: 'absolute',
                top: `-${BORDER_W}px`,
                right: `-${BORDER_W}px`,
                width: '28px',
                height: '28px',
                borderTop: `${BORDER_W}px solid var(--accent)`,
                borderRight: `${BORDER_W}px solid var(--accent)`,
                backgroundColor: 'transparent',
                zIndex: 2
              }} />

              {/* Decorative corner bracket — bottom-left */}
              <div style={{
                position: 'absolute',
                bottom: `-${BORDER_W}px`,
                left: `-${BORDER_W}px`,
                width: '28px',
                height: '28px',
                borderBottom: `${BORDER_W}px solid var(--accent)`,
                borderLeft: `${BORDER_W}px solid var(--accent)`,
                backgroundColor: 'transparent',
                zIndex: 2
              }} />

              {/* Massive number */}
              <div
                className="leading-none mb-2"
                style={{
                  fontSize: 'clamp(3.5rem,6vw,5rem)',
                  fontWeight: 900,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.1em',
                  userSelect: 'none'
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Thick separator */}
              <div style={{
                width: '100%',
                height: '5px',
                backgroundColor: 'var(--border-color)',
                marginBottom: '20px'
              }} />

              {/* Title */}
              <h3
                className="font-black uppercase mb-4"
                style={{
                  fontSize: 'clamp(1.1rem,2vw,1.5rem)',
                  lineHeight: 1.15,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                {p.title.split('\n').map((l, j) => (<span key={j}>{l}<br /></span>))}
              </h3>

              {/* Body */}
              <p
                className="text-sm md:text-base leading-relaxed flex-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {p.body}
              </p>

              {/* Bottom accent bar (positioned) */}
              <div style={{
                width: '50%',
                height: '4px',
                backgroundColor: 'var(--accent)',
                marginTop: '20px',
                alignSelf: 'flex-start'
              }} />
            </div>
          ))}
        </div>

        {/* ═══ COMPARISON TABLE ═══════════════════════ */}
        <div
          className="mb-16 md:mb-24"
          style={{ position: 'relative' }}
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 6, height: 30, backgroundColor: 'var(--accent)' }} />
            <span
              className="font-black tracking-[0.15em]"
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)'
              }}
            >
              Feature Comparison
            </span>
          </div>

          {/* Table container */}
          <div
            className="overflow-x-auto"
            style={{
              border: `${BORDER_W}px solid var(--border-color)`,
              boxShadow: SHADOW,
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            {/* Top accent stripe */}
            <div style={{
              height: '8px',
              backgroundColor: 'var(--accent)',
              width: '100%'
            }} />

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '700px'
            }}>
              {/* ─── HEAD ─── */}
              <thead>
                <tr style={{ borderBottom: '4px solid var(--border-color)' }}>
                  <th
                    className="p-4 text-left text-xs md:text-sm font-black uppercase tracking-[0.1em] whitespace-nowrap"
                    style={{
                      color: 'var(--text-primary)',
                      borderRight: '3px solid var(--border-color)',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}
                  >
                    Feature
                  </th>
                  <th
                    className="p-4 text-left text-xs md:text-sm font-black uppercase tracking-[0.1em]"
                    style={{
                      color: '#fff',
                      backgroundColor: 'var(--accent)',
                      minWidth: '220px',
                      position: 'relative'
                    }}
                  >
                    TheJobStarter
                    {/* Corner accent */}
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 0, height: 0,
                      borderLeft: '12px solid transparent',
                      borderBottom: '12px solid var(--bg-surface)'
                    }} />
                  </th>
                  {['GeeksforGeeks', 'LeetCode', 'HackerRank'].map((name, j) => (
                    <th
                      key={name}
                      className="p-4 text-left text-xs md:text-sm font-black uppercase tracking-[0.1em] whitespace-nowrap"
                      style={{
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderLeft: j === 0 ? '3px solid var(--border-color)' : 'none',
                        borderRight: j < 2 ? '3px solid var(--border-color)' : 'none'
                      }}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ─── BODY ─── */}
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < comparison.length - 1 ? '3px solid var(--border-color)' : 'none',
                      backgroundColor: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-tertiary)'
                    }}
                  >
                    {/* Feature name */}
                    <td
                      className="p-4 text-xs md:text-sm font-black whitespace-nowrap"
                      style={{
                        color: 'var(--text-primary)',
                        borderRight: '3px solid var(--border-color)'
                      }}
                    >
                      {row.feat}
                    </td>

                    {/* TheJobStarter */}
                    <td
                      className="p-4 text-xs md:text-sm leading-relaxed"
                      style={{
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        minWidth: '220px'
                      }}
                    >
                      {row.ours}
                    </td>

                    {/* GFG */}
                    <td
                      className="p-4 text-xs md:text-sm leading-relaxed"
                      style={{
                        color: 'var(--text-tertiary)',
                        borderLeft: '3px solid var(--border-color)',
                        borderRight: '3px solid var(--border-color)'
                      }}
                    >
                      {row.gfg}
                    </td>

                    {/* LeetCode */}
                    <td
                      className="p-4 text-xs md:text-sm leading-relaxed"
                      style={{
                        color: 'var(--text-tertiary)',
                        borderRight: '3px solid var(--border-color)'
                      }}
                    >
                      {row.lc}
                    </td>

                    {/* InterviewBit */}
                    <td
                      className="p-4 text-xs md:text-sm leading-relaxed"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {row.hr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ CTA ════════════════════════════════════ */}
        <div className="text-center" style={{ position: 'relative' }}>
          {/* Decorative line art behind CTA */}
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%', height: '4px',
              backgroundColor: 'var(--border-color)',
              zIndex: 0,
              opacity: 0.15
            }}
          />

          <Link
            to="/dsa"
            className="inline-block text-base font-black uppercase tracking-[0.15em] no-underline"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '20px 60px',
              border: `${BORDER_W}px solid var(--border-color)`,
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-surface)',
              boxShadow: SHADOW,
              transform: 'translate(0, 0)',
              transition: TRANS,
              fontSize: 'clamp(0.85rem,1.5vw,1rem)'
            }}
            onMouseEnter={liftIn}
            onMouseLeave={liftOut}
          >
            Start Learning Today
          </Link>

          {/* Decorative corner brackets around CTA */}
          <div className="hidden md:block" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(calc(-50% - 140px), calc(-50% - 45px))',
            width: '30px', height: '30px',
            borderTop: `4px solid var(--accent)`,
            borderLeft: `4px solid var(--accent)`,
            zIndex: 0,
            opacity: 0.4
          }} />
          <div className="hidden md:block" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(calc(50% + 110px), calc(-50% - 45px))',
            width: '30px', height: '30px',
            borderTop: `4px solid var(--accent)`,
            borderRight: `4px solid var(--accent)`,
            zIndex: 0,
            opacity: 0.4
          }} />
          <div className="hidden md:block" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(calc(-50% - 140px), calc(50% + 25px))',
            width: '30px', height: '30px',
            borderBottom: `4px solid var(--accent)`,
            borderLeft: `4px solid var(--accent)`,
            zIndex: 0,
            opacity: 0.4
          }} />
          <div className="hidden md:block" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(calc(50% + 110px), calc(50% + 25px))',
            width: '30px', height: '30px',
            borderBottom: `4px solid var(--accent)`,
            borderRight: `4px solid var(--accent)`,
            zIndex: 0,
            opacity: 0.4
          }} />
        </div>

      </div>
    </section>
  );
}
