import { Link } from 'react-router-dom';

/*
 * WhyTheseThree — "Why DSA, DBMS & OS" homepage section
 * Renders content exclusively from the sectionData prop (fetched from SiteConfig API).
 * No fallback data — if sectionData is missing, the section is hidden.
 */

// ─── pill tag ─────────────────────────────────────────────────
function Tag({ children, className = '' }) {
  return (
    <span
      className={`inline-block px-3 py-1 border text-[0.6rem] font-black uppercase tracking-[0.18em] ${className}`}
    >
      {children}
    </span>
  );
}

// ─── inline blockquote ────────────────────────────────────────
function Quote({ text, cite, borderColor = 'border-white/30', bgColor = 'bg-white/10', textColor = 'text-white/80', citeColor = 'text-white/45' }) {
  return (
    <blockquote className={`border-l-[4px] ${borderColor} ${bgColor} py-3 px-4 m-0`}>
      <p className={`text-[0.72rem] italic leading-relaxed ${textColor} m-0`}>&ldquo;{text}&rdquo;</p>
      <cite className={`block mt-1.5 text-[0.55rem] not-italic font-black uppercase tracking-[0.12em] ${citeColor}`}>
        &mdash; {cite}
      </cite>
    </blockquote>
  );
}



// ══════════════════════════════════════════════════════════════
export default function WhyTheseThree({ sectionData }) {

  /* Don't render if no data from backend */
  if (!sectionData) return null;

  const H = sectionData.header;
  const DSA = sectionData.dsaCard;
  const CONF = sectionData.confessionCard;
  const DBMS = sectionData.dbmsCard;
  const OS = sectionData.osCard;
  const FOOTER = sectionData.statsFooter;

  return (
    <section className="py-20">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className="border-y-[3px] border-black py-8 mb-16">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-[3px] w-8 bg-black/30" />
          <Tag className="border-black/20 text-[var(--text-tertiary)]">{H?.tag}</Tag>
        </div>
        <h2 className="text-[clamp(2.6rem,8vw,6rem)] font-black leading-[0.85] tracking-[-0.04em] uppercase text-[var(--text-primary)] m-0">
          {H?.title}
        </h2>
        <p className="text-[0.8rem] font-bold tracking-[0.08em] text-[var(--text-tertiary)] mt-3 m-0">
          &mdash;&nbsp;{H?.subtitle}
        </p>
      </header>

      {/* ─── BENTO GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* ════════════════════════════════════════════════════
            DSA — POSTER CARD  (red, col-7, row-span-2)
            Big number, gatekeeper framing.
        ════════════════════════════════════════════════════ */}
        <div className="
          md:col-span-7 md:row-span-2 border-[3px] border-black
          bg-[#e11d48] text-white
          shadow-[14px_14px_0_#000] relative overflow-hidden
          transition-all duration-200
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[18px_18px_0_#000]
          flex flex-col
        ">
          {/* accent stripe */}
          <div className="h-3.5 bg-[#b91c1c] shrink-0" />

          {/* noise-style overlay for depth */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '200px'
            }}
          />

          <div className="p-7 md:p-9 flex flex-col flex-1 gap-5 relative z-10">

            {/* tag row */}
            <div className="flex items-center justify-between">
              <Tag className="border-white/25 text-white/60">{DSA?.tag}</Tag>
              <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-white/40">01 / 03</span>
            </div>

            {/* giant number */}
            <div className="flex items-end gap-3 my-2">
              <span className="text-[clamp(8rem,22vw,17rem)] font-black leading-[0.75] tracking-[-0.08em] text-white">
                {DSA?.number}
              </span>
              <div className="flex flex-col gap-1 pb-4">
                <span className="text-[clamp(1.8rem,4vw,3.5rem)] font-black leading-none text-white/70">%</span>

              </div>
            </div>

            {/* descriptor — "before" gets <em> for emphasis */}
            <p className="text-[1rem] font-bold leading-[1.4] text-white/85 m-0 max-w-[38ch]">
              {DSA?.description.split('before').map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<em>before</em></span>
                  : <span key={i}>{part}</span>
              )}
            </p>

            {/* quote */}
            <Quote
              text={DSA?.quoteText}
              cite={DSA?.quoteCite}
            />

            {/* what you get */}
            <div className="grid grid-cols-3 gap-3 border-[2px] border-white/15 p-4 bg-white/5">
              {DSA?.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <strong className="block text-[1.6rem] font-black leading-none text-white">{s.number}</strong>
                  <span className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white/50 mt-1 block">{s.label}</span>
                </div>
              ))}
            </div>

            <Link
              to={DSA?.ctaLink}
              className="block w-full px-6 py-3 text-center text-xs font-bold uppercase tracking-wider no-underline why-btn-dsa"
            >
              {DSA?.ctaLabel}
              <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            CONFESSION — amber quote card (col-5)
        ════════════════════════════════════════════════════ */}
        <div className="
          md:col-span-5 border-[3px] border-black
          bg-[#fef3c7] relative overflow-hidden
          shadow-[10px_10px_0_#000]
          transition-all duration-200
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[13px_13px_0_#000]
        ">
          {/* folded corner */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-r-[32px] border-t-black border-r-[#fef3c7] z-10" />
          {/* faint bg label */}
          <span className="absolute bottom-4 right-4 text-[0.45rem] font-black uppercase tracking-[0.2em] text-[#d97706]/20 select-none">
            REAL STORY
          </span>

          <div className="p-7 md:p-8 flex flex-col gap-4 min-h-[240px] justify-center relative z-[1]">
            <span className="text-[4rem] font-black leading-none text-[#d97706]/20 -mb-4 block">&ldquo;</span>

            <p className="text-[1.05rem] font-black italic leading-[1.6] text-[#1c1917] m-0">
              {CONF?.quote.split('\n').map((line, i) => (
                <span key={i}>{line}{i < CONF?.quote.split('\n').length - 1 && <br />}</span>
              ))}
            </p>

            <div className="flex items-center gap-2">
              <span className="h-[3px] w-6 bg-[#d97706]/50" />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#92400e]">
                {CONF?.attribution}
              </span>
            </div>

            <span className="text-[4rem] font-black leading-none text-[#d97706]/20 self-end -mt-3 block">&rdquo;</span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            DBMS — data card (col-5, blue)
        ════════════════════════════════════════════════════ */}
        <div className="
          md:col-span-5 border-[3px] border-black
          bg-[#0066ff] text-white
          shadow-[10px_10px_0_#000] relative overflow-hidden
          transition-all duration-200
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[13px_13px_0_#000]
        ">
          <div className="h-3.5 bg-[#0052cc] shrink-0" />

          <div className="p-6 md:p-7 flex flex-col gap-4">
            {/* header row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <Tag className="border-white/30 text-white/70 mb-2">{DBMS?.tag}</Tag>
                <p className="text-[1rem] font-bold leading-[1.35] text-white/90 m-0 max-w-[28ch]">
                  {DBMS?.description}
                </p>
              </div>
              <span className="text-[clamp(3rem,5vw,5rem)] font-black leading-none text-white/10 tracking-[-0.06em] shrink-0">
                #2
              </span>
            </div>


            <Quote
              text={DBMS?.quoteText}
              cite={DBMS?.quoteCite}
            />

            {/* mini stats */}
            <div className="flex items-center gap-4 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white/45">
              {DBMS?.stats.flatMap((stat, i) => {
                const items = [];
                if (i > 0) items.push(<span key={`sep-${i}`} className="w-1 h-1 bg-white/30 rotate-45 block" />);
                items.push(<span key={stat}>{stat}</span>);
                return items;
              })}
            </div>

            <Link
              to={DBMS?.ctaLink}
              className="block w-full px-6 py-3 text-center text-xs font-bold uppercase tracking-wider no-underline why-btn-dbms"
            >
              {DBMS?.ctaLabel}
              <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            OS — FULL-WIDTH warning card (col-12, black)
        ════════════════════════════════════════════════════ */}
        <div className="
          md:col-span-12 border-[3px] border-black
          bg-black text-white
          shadow-[14px_14px_0_#000] relative overflow-hidden
          transition-all duration-200
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[18px_18px_0_#000]
        ">
          {/* bg orb */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#ff4f00] rotate-45 opacity-[0.07] pointer-events-none" />
          {/* left accent stripe */}
          <div className="absolute top-0 left-0 w-[5px] h-full bg-[#ff4f00]" />

          <div className="p-7 md:p-9 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">

            {/* left — headline */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-5 h-[3px] bg-[#ff4f00]" />
                <Tag className="border-white/20 text-gray-400">{OS?.tag}</Tag>
                <Tag className="border-[#ff4f00]/40 text-[#ff4f00]/80 ml-auto">{OS?.subTag}</Tag>
              </div>

              <h3
                className="
    !text-white
    text-[clamp(1.5rem,3.5vw,2.6rem)]
    font-black
    uppercase
    leading-[1.05]
    tracking-[-0.02em]
    m-0
    mt-2
  "
                style={{ color: '#ffffff' }}
              >
                {OS?.headlineLine1}<br />

                <span
                  className="!text-[#ff4f00] underline decoration-[#ff4f00] underline-offset-4"
                  style={{ color: '#ff4f00' }}
                >
                  {OS?.headlineLine2}
                </span>

                <br />
                {OS?.headlineLine3}
              </h3>

              <p className="text-[0.8rem] text-gray-400 leading-[1.6] m-0 max-w-[42ch]">
                {OS?.body}
              </p>
            </div>

            {/* right — quote + pills + CTA */}
            <div className="md:col-span-5 flex flex-col gap-4 justify-end">
              <Quote
                text={OS?.quoteText}
                cite={OS?.quoteCite}
                borderColor="border-white/15"
                bgColor="bg-white/5"
                textColor="text-gray-400"
                citeColor="text-gray-600"
              />



              <Link
                to={OS?.ctaLink}
                className="block w-full px-6 py-3 text-center text-xs font-bold uppercase tracking-wider no-underline why-btn-os"
              >
                {OS?.ctaLabel}
                <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

      </div>{/* end bento */}

      {/* ─── STATS FOOTER ───────────────────────────────────── */}
      <footer className="border-y-[3px] border-black py-8 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {FOOTER?.map((item, i) => (
          <div key={i} className="border-l-[4px] border-black pl-5 flex flex-col gap-1">
            <strong className="text-[var(--text-primary)] text-[clamp(2rem,3.5vw,3rem)] font-black leading-none block">
              {item.stat}
            </strong>
            <p className="text-[0.8rem] leading-[1.5] text-[var(--text-secondary)] m-0">
              {item.text}
            </p>
            <cite className="text-[0.55rem] not-italic font-bold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
              &mdash; {item.cite}
            </cite>
          </div>
        ))}
      </footer>

    </section>
  );
}