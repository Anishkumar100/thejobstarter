import { useMemo } from 'react';
import { HelpCircle, Lightbulb, ThumbsUp, Award } from 'lucide-react';

/*
 * HowItWorks — Section 6 of the homepage
 *
 * Accepts an optional `sectionData` prop with shape { steps: [...] }.
 * Falls back to hardcoded DEFAULT_STEPS if sectionData is not provided
 * or lacks the expected structure (e.g., when VITE_USE_MOCK is true or
 * the backend hasn't stored the section yet).
 *
 * Two-column layout on all screen sizes:
 *   Left  — sticky circle reading "How it Works"
 *   Right — stacked cards that reveal-on-scroll, each with a portrait illustration
 *
 * Mobile keeps the exact same structure (circle left, cards right) scaled down.
 * The left circle stays sticky on desktop so it remains visible while cards scroll.
 */

const DEFAULT_STEPS = [
  {
    number: 1,
    id: 'confusion',
    quote: '"There\'s so much to study. DSA, DBMS, OS... where do I even start?"',
    response: 'Structured roadmaps for each subject. Start with what matters most, track your progress.',
    accent: '#ff4f00',
    Icon: HelpCircle,
    image: ''
  },
  {
    number: 2,
    id: 'clarity',
    quote: '"I finally understand how arrays work, but how do I apply this in an interview?"',
    response: 'Curated problem sets with company tags, difficulty levels, and video explanations.',
    accent: '#0066ff',
    Icon: Lightbulb,
    image: ''
  },
  {
    number: 3,
    id: 'confidence',
    quote: '"I\'m solving medium problems now. But am I ready for the actual interview?"',
    response: 'Mock interview questions, community Q&A, and trusted answers from placed seniors.',
    accent: '#10b981',
    Icon: ThumbsUp,
    image: ''
  },
  {
    number: 4,
    id: 'result',
    quote: '"I got the offer. TCS Digital. And I used TheJobStarter every single day."',
    response: 'Join 10,000+ students who placed using TheJobStarter.',
    accent: '#ff4f00',
    Icon: Award,
    image: ''
  }
];

const CARD_BORDER = 5;
const CARD_SHADOW = '20px 20px 0 var(--shadow-color)';
const CARD_SHADOW_HOVER = '28px 28px 0 var(--shadow-color)';

export default function HowItWorks({ sectionData }) {

  /*
   * Merge saved data (from backend) with DEFAULT_STEPS.
   * Falls back to hardcoded defaults when sectionData is absent
   * (mock mode, first load, or partial DB document).
   */
  const steps = useMemo(() => {
    const saved = sectionData?.steps;
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      return DEFAULT_STEPS;
    }
    return DEFAULT_STEPS.map(def => {
      const match = saved.find(s => s.id === def.id);
      if (!match) return { ...def };
      return {
        ...def,
        quote: match.quote || def.quote,
        response: match.response || def.response,
        accent: match.accent || def.accent,
        image: match.image || def.image
      };
    });
  }, [sectionData]);

  const liftIn = e => {
    e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER;
    e.currentTarget.style.transform = 'translate(-8px, -8px)';
  };
  const liftOut = e => {
    e.currentTarget.style.boxShadow = CARD_SHADOW;
    e.currentTarget.style.transform = 'translate(0, 0)';
  };

  return (
    <section
      className="py-24 md:py-32"
      style={{
        borderTop: '10px solid var(--border-color)',
        borderBottom: '10px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative'
      }}
    >
      {/* Crosshatch bg (clipped to section via absolute + inset) */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.08,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundImage: [
          'repeating-linear-gradient(45deg, transparent, transparent 20px, var(--border-color) 20px, var(--border-color) 21px)',
          'repeating-linear-gradient(-45deg, transparent, transparent 20px, var(--border-color) 20px, var(--border-color) 21px)'
        ].join(',')
      }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══ HEADER ═══════════════════════════════════════ */}
        <header className="mb-16 md:mb-20" style={{ position: 'relative' }}>
          <div style={{
            width: '80px', height: '10px',
            backgroundColor: 'var(--accent)',
            marginBottom: '24px'
          }} />

          <div
            className="inline-flex items-center gap-2 mb-6 px-5 py-3"
            style={{
              border: '5px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '8px 8px 0 var(--shadow-color)',
              fontWeight: 900,
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <span style={{ width: 10, height: 10, backgroundColor: 'var(--accent)', display: 'inline-block' }} />
            The Journey
          </div>

          <h2
            className="font-black uppercase m-0"
            style={{
              fontSize: 'clamp(2.8rem, 12vw, 7rem)',
              lineHeight: 0.85,
              letterSpacing: '-0.07em',
              color: 'var(--text-primary)',
              wordBreak: 'break-word'
            }}
          >
            From<br />Confused<br />to Placed
          </h2>

          <div style={{
            width: '100%', height: '6px',
            backgroundColor: 'var(--border-color)',
            marginTop: '20px',
            marginBottom: '20px'
          }} />

          <p
            className="max-w-lg"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
              lineHeight: 1.6,
              fontWeight: 600
            }}
          >
            Four stages. One platform. From the first search to the offer letter.
          </p>
        </header>

        {/*
         * ═══ TWO-COLUMN LAYOUT ═══════════════════════════
         * Left: sticky circle "How it Works"
         * Right: scroll-reveal cards with portraits
         * Same structure at every breakpoint.
         */}
        <div className="flex items-start gap-6 sm:gap-10 lg:gap-16">

          {/* ── LEFT COLUMN — sticky circle ── */}
          <div
            className="
              flex-shrink-0 flex items-center justify-center
              lg:sticky lg:top-[18vh]
            "
            style={{
              width: 'clamp(80px, 20vw, 200px)',
              minHeight: 'clamp(80px, 20vw, 200px)',
              zIndex: 5
            }}
          >
            {/* The circle */}
            <div
              className="flex-shrink-0 flex flex-col items-center justify-center text-center"
              style={{
                width: 'clamp(80px, 20vw, 200px)',
                height: 'clamp(80px, 20vw, 200px)',
                borderRadius: '50%',
                border: '6px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: '14px 14px 0 var(--shadow-color)',
                padding: 'clamp(10px, 2vw, 24px)',
                position: 'relative'
              }}
            >
              {/* Outer ring */}
              <div style={{
                position: 'absolute', inset: '-4px',
                borderRadius: '50%',
                border: '3px solid var(--accent)',
                opacity: 0.3,
                pointerEvents: 'none'
              }} />

              <span
                className="font-black uppercase leading-tight"
                style={{
                  fontSize: 'clamp(0.6rem, 2.8vw, 1.5rem)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15
                }}
              >
                How it<br />Works
              </span>

              <div className="flex gap-[3px]" style={{ marginTop: 'clamp(4px, 1vw, 10px)' }}>
                <span style={{ width: 'clamp(3px, 0.6vw, 5px)', height: 'clamp(3px, 0.6vw, 5px)', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }} />
                <span style={{ width: 'clamp(3px, 0.6vw, 5px)', height: 'clamp(3px, 0.6vw, 5px)', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-block' }} />
                <span style={{ width: 'clamp(3px, 0.6vw, 5px)', height: 'clamp(3px, 0.6vw, 5px)', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }} />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — cards ── */}
          <div className="flex-1 flex flex-col gap-8 sm:gap-10 lg:gap-14 min-w-0">
            {steps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                liftIn={liftIn}
                liftOut={liftOut}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

/*
 * StepCard — One journey-stage card.
 * Contains: portrait illustration | step number + quote + response.
 * Reveals with motion on scroll.
 */
function StepCard({ step, index, liftIn, liftOut }) {
  const { number, id, quote, response, accent, image } = step;
  const Icon = step.Icon || ICON_MAP[id] || HelpCircle;

  return (
    <div
      className="flex gap-3 sm:gap-4 lg:gap-6 w-full"
      style={{
        border: `${CARD_BORDER}px solid var(--border-color)`,
        backgroundColor: 'var(--bg-surface)',
        boxShadow: CARD_SHADOW,
        transform: 'translate(0, 0)',
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={liftIn}
      onMouseLeave={liftOut}
    >
        {/* ── Portrait section ── */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 'clamp(90px, 22vw, 160px)',
            minHeight: 'clamp(90px, 22vw, 160px)',
            backgroundColor: `${accent}11`,
            borderRight: `${CARD_BORDER}px solid var(--border-color)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative corner bracket */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '12px', height: '12px',
            borderTop: `${CARD_BORDER}px solid ${accent}`,
            borderRight: `${CARD_BORDER}px solid ${accent}`,
            zIndex: 2
          }} />

          {/* Decorative dots */}
          <div className="absolute" style={{ top: '6px', left: '6px', display: 'flex', gap: '3px', opacity: 0.3 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: accent, display: 'inline-block' }} />
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-block' }} />
          </div>

          {/* Portrait illustration — uploaded image or fallback SVG */}
          {image ? (
            <img
              src={image}
              alt={`Step ${number}`}
              className="w-full h-full"
              style={{
                objectFit: 'cover',
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          ) : (
            <PortraitIllustration id={id} accent={accent} />
          )}
        </div>

        {/* ── Content section ── */}
        <div className="flex flex-col flex-1 py-3 pr-3 sm:py-4 sm:pr-4 lg:py-6 lg:pr-6 min-w-0">

          {/* Header row: step number + icon badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-black leading-none select-none"
              style={{
                fontSize: 'clamp(1.2rem, 4vw, 2.8rem)',
                color: accent,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.1em'
              }}
            >
              {String(number).padStart(2, '0')}
            </span>
            <span
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 'clamp(20px, 4vw, 32px)',
                height: 'clamp(20px, 4vw, 32px)',
                borderRadius: '50%',
                backgroundColor: accent,
                color: '#fff'
              }}
            >
              <Icon style={{ width: 'clamp(12px, 2.5vw, 18px)', height: 'clamp(12px, 2.5vw, 18px)' }} />
            </span>
          </div>

          {/* Separator */}
          <div style={{
            width: '100%', height: 'clamp(2px, 0.4vw, 4px)',
            backgroundColor: 'var(--border-color)',
            marginBottom: 'clamp(4px, 0.8vw, 10px)'
          }} />

          {/* Quote */}
          <p
            className="font-bold flex-1"
            style={{
              fontSize: 'clamp(0.5rem, 1.5vw, 0.92rem)',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              fontStyle: 'italic',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {quote}
          </p>

          {/* Accent bar */}
          <div style={{
            width: 'clamp(30px, 8vw, 60px)', height: 'clamp(2px, 0.4vw, 4px)',
            backgroundColor: accent,
            marginTop: 'clamp(4px, 0.8vw, 10px)',
            marginBottom: 'clamp(4px, 0.6vw, 8px)',
            opacity: 0.6
          }} />

          {/* Response */}
          <p style={{
            fontSize: 'clamp(0.42rem, 1.2vw, 0.8rem)',
            lineHeight: 1.4,
            color: 'var(--text-secondary)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            <span className="font-black uppercase tracking-wide" style={{ color: accent }}>
              TheJobStarter:{' '}
            </span>
            {response}
          </p>
        </div>
      </div>
  );
}

/*
 * PortraitIllustration — Inline SVG portrait for each journey stage.
 * Self-contained vector illustration in a viewBox="0 0 100 120".
 */
function PortraitIllustration({ id, accent }) {
  switch (id) {
    case 'confusion':
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          {/* Bg glow */}
          <circle cx="50" cy="55" r="42" fill={`${accent}18`} />
          {/* Head */}
          <ellipse cx="50" cy="60" rx="20" ry="22" fill="#f5f0e8" stroke="var(--border-color)" strokeWidth="2.5" />
          {/* Hair */}
          <path d="M28 50 Q30 30 50 28 Q70 30 72 50 Q68 42 50 40 Q32 42 28 50Z" fill="var(--border-color)" opacity="0.8" />
          {/* Eyes */}
          <circle cx="41" cy="58" r="3" fill="var(--border-color)" />
          <circle cx="59" cy="58" r="3" fill="var(--border-color)" />
          {/* Furrowed brows */}
          <path d="M36 50 L44 53" stroke="var(--border-color)" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 50 L56 53" stroke="var(--border-color)" strokeWidth="2" strokeLinecap="round" />
          {/* Wavy mouth */}
          <path d="M42 72 Q47 68 50 72 Q53 76 58 72" stroke="var(--border-color)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Question marks */}
          <text x="22" y="30" fontSize="16" fontWeight="900" fill={accent} opacity="0.5">?</text>
          <text x="70" y="26" fontSize="13" fontWeight="900" fill={accent} opacity="0.35">?</text>
          <text x="74" y="96" fontSize="11" fontWeight="900" fill={accent} opacity="0.25">?</text>
        </svg>
      );

    case 'clarity':
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <circle cx="50" cy="55" r="42" fill={`${accent}18`} />
          {/* Lightbulb glow */}
          <circle cx="50" cy="22" r="14" fill={`${accent}25`} />
          {/* Head */}
          <ellipse cx="50" cy="60" rx="20" ry="22" fill="#f5f0e8" stroke="var(--border-color)" strokeWidth="2.5" />
          <path d="M28 50 Q30 30 50 28 Q70 30 72 50 Q68 42 50 40 Q32 42 28 50Z" fill="var(--border-color)" opacity="0.8" />
          {/* Eyes — wide open */}
          <circle cx="41" cy="57" r="4" fill="var(--border-color)" />
          <circle cx="59" cy="57" r="4" fill="var(--border-color)" />
          <circle cx="41" cy="57" r="1.5" fill="var(--bg-surface)" />
          <circle cx="59" cy="57" r="1.5" fill="var(--bg-surface)" />
          {/* Smile */}
          <path d="M43 70 Q50 76 57 70" stroke="var(--border-color)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Lightbulb shape above */}
          <path d="M43 18 Q47 10 50 10 Q53 10 57 18 L58 26 Q58 30 55 32 L45 32 Q42 30 42 26Z" fill={accent} opacity="0.7" />
          <rect x="47" y="32" width="6" height="6" rx="1" fill={accent} opacity="0.5" />
          {/* Light rays */}
          <line x1="50" y1="8" x2="50" y2="4" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <line x1="62" y1="14" x2="65" y2="11" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="38" y1="14" x2="35" y2="11" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      );

    case 'confidence':
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <circle cx="50" cy="55" r="42" fill={`${accent}18`} />
          {/* Head */}
          <ellipse cx="50" cy="60" rx="20" ry="22" fill="#f5f0e8" stroke="var(--border-color)" strokeWidth="2.5" />
          <path d="M28 50 Q30 30 50 28 Q70 30 72 50 Q68 42 50 40 Q32 42 28 50Z" fill="var(--border-color)" opacity="0.8" />
          {/* Eyes — confident squint */}
          <path d="M37 56 L44 58" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M56 58 L63 56" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Smirk */}
          <path d="M44 72 Q50 76 58 72" stroke="var(--border-color)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Checkmark badge */}
          <circle cx="50" cy="14" r="12" fill={accent} />
          <path d="M44 14 L48 18 L56 10" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'result':
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <circle cx="50" cy="55" r="42" fill={`${accent}18`} />
          {/* Head */}
          <ellipse cx="50" cy="60" rx="20" ry="22" fill="#f5f0e8" stroke="var(--border-color)" strokeWidth="2.5" />
          <path d="M28 50 Q30 30 50 28 Q70 30 72 50 Q68 42 50 40 Q32 42 28 50Z" fill="var(--border-color)" opacity="0.8" />
          {/* Eyes — happy ^ ^ */}
          <path d="M39 55 L43 59 L47 55" stroke="var(--border-color)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M53 55 L57 59 L61 55" stroke="var(--border-color)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Big smile */}
          <path d="M40 70 Q50 80 60 70" stroke="var(--border-color)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Graduation cap */}
          <path d="M36 26 L50 18 L64 26 L50 34Z" fill={accent} opacity="0.8" stroke="var(--border-color)" strokeWidth="1.5" />
          <path d="M50 18 L50 28" stroke="var(--border-color)" strokeWidth="1.5" />
          <line x1="28" y1="21" x2="22" y2="18" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="72" y1="21" x2="78" y2="18" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );

    default:
      return null;
  }
}
