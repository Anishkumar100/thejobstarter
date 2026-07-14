import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';

/*
 * SuccessStories — Section 8 of the homepage
 *
 * Shows real placement stories as social proof.
 * Layout: one featured (larger) card + grid of smaller cards.
 * Data is hardcoded for now; backend integration planned.
 */

const STORIES = [
  {
    id: 's1',
    name: 'Priya Sharma',
    college: 'MIT World Peace University, Pune',
    company: 'Google',
    role: 'SDE-1',
    package: '45 LPA',
    quote: 'I started with zero knowledge of DSA. The structured roadmaps and company-tagged problems made all the difference. Landed Google in my 7th semester.',
    avatar: null,
    featured: true
  },
  {
    id: 's2',
    name: 'Rahul Verma',
    college: 'NSUT, Delhi',
    company: 'Microsoft',
    role: 'SDE',
    package: '32 LPA',
    quote: 'TheJobStarter&apos;s DBMS and OS articles are gold. I didn&apos;t need any other resource for my interview prep.',
    avatar: null,
    featured: false
  },
  {
    id: 's3',
    name: 'Ananya Patel',
    college: 'BITS Pilani',
    company: 'Amazon',
    role: 'SDE-1',
    package: '36 LPA',
    quote: 'The community Q&A saved me countless hours. Every question I had was already answered by someone who&apos;d been through the same.',
    avatar: null,
    featured: false
  },
  {
    id: 's4',
    name: 'Vikram Singh',
    college: 'VIT, Vellore',
    company: 'TCS Digital',
    role: 'System Engineer',
    package: '11 LPA',
    quote: 'From not knowing what Big O is to clearing TCS Digital — this platform took me step by step. The mock questions were spot on.',
    avatar: null,
    featured: false
  }
];

const FALLBACK_INITIALS = ['PS', 'RV', 'AP', 'VS'];
const FALLBACK_COLORS = ['#ff4f00', '#0066ff', '#10b981', '#8b5cf6'];

export default function SuccessStories() {
  const featured = STORIES.find(s => s.featured);
  const others = STORIES.filter(s => !s.featured);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '8px solid var(--border-color)',
        borderBottom: '8px solid var(--border-color)',
        paddingTop: 'clamp(3rem, 6vh, 5rem)',
        paddingBottom: 'clamp(3rem, 6vh, 5rem)'
      }}
    >
      <div className="container">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <span
            className="inline-block font-black text-xs tracking-[0.2em] mb-3 select-none"
            style={{
              border: '3px solid var(--border-color)',
              padding: '4px 10px',
              color: 'var(--gray-700)'
            }}
          >
            TESTIMONIALS
          </span>
          <h2
            className="font-black leading-[0.9]"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4.5rem)',
              color: 'var(--border-color)',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase'
            }}
          >
            Success<br />
            <span style={{ color: 'var(--accent)' }}>Stories</span>
          </h2>
          <p
            className="font-bold mt-2"
            style={{
              fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
              color: 'var(--gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Real students. Real offers.
          </p>
        </motion.div>

        {/* ── Featured Story ── */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div
              className="flex flex-col md:flex-row"
              style={{
                border: '4px solid var(--border-color)',
                boxShadow: '10px 10px 0 var(--border-color)',
                backgroundColor: '#fff',
                overflow: 'hidden'
              }}
            >
              {/* Avatar side */}
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: 'clamp(100%, 100%, 200px)',
                  minHeight: '200px',
                  backgroundColor: '#f5f0e8',
                  borderRight: '4px solid var(--border-color)'
                }}
              >
                <div
                  className="flex items-center justify-center font-black select-none"
                  style={{
                    width: 'clamp(80px, 16vw, 120px)',
                    height: 'clamp(80px, 16vw, 120px)',
                    border: '4px solid var(--border-color)',
                    backgroundColor: FALLBACK_COLORS[0],
                    color: '#fff',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    boxShadow: '6px 6px 0 var(--border-color)'
                  }}
                >
                  {FALLBACK_INITIALS[0]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3
                      className="font-black"
                      style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: 'var(--border-color)' }}
                    >
                      {featured.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {featured.college}
                    </p>
                  </div>
                  <div
                    className="flex-shrink-0 text-center px-4 py-2 select-none"
                    style={{
                      border: '3px solid var(--border-color)',
                      backgroundColor: '#000',
                      color: '#fff',
                      boxShadow: '4px 4px 0 var(--border-color)'
                    }}
                  >
                    <div className="font-black" style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {featured.company}
                    </div>
                    <div className="font-mono font-bold" style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                      {featured.role} · {featured.package}
                    </div>
                  </div>
                </div>

                <Quote
                  size={24}
                  style={{ color: 'var(--accent)', marginBottom: '8px', opacity: 0.5 }}
                />
                <p
                  className="font-medium leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', color: 'var(--gray-700)' }}
                >
                  "{featured.quote}"
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Other Stories Grid ── */}
        <div
          className="grid gap-6 mb-10"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
          }}
        >
          {others.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div
                className="flex flex-col h-full"
                style={{
                  border: '3px solid var(--border-color)',
                  boxShadow: '6px 6px 0 var(--border-color)',
                  backgroundColor: '#fff',
                  transition: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '10px 10px 0 var(--border-color)';
                  e.currentTarget.style.transform = 'translate(-4px, -4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '6px 6px 0 var(--border-color)';
                  e.currentTarget.style.transform = 'translate(0, 0)';
                }}
              >
                {/* Top: Avatar + name + company */}
                <div
                  className="flex items-center gap-3 p-4"
                  style={{
                    borderBottom: '3px solid var(--border-color)',
                    backgroundColor: `${FALLBACK_COLORS[i + 1]}08`
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center font-black select-none"
                    style={{
                      width: '44px',
                      height: '44px',
                      border: '3px solid var(--border-color)',
                      backgroundColor: FALLBACK_COLORS[i + 1],
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  >
                    {FALLBACK_INITIALS[i + 1]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black" style={{ fontSize: '0.95rem', color: 'var(--border-color)' }}>
                      {story.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {story.company} · {story.package}
                    </div>
                  </div>
                </div>

                {/* Bottom: Quote */}
                <div className="flex-1 p-4">
                  <p
                    className="font-medium leading-relaxed"
                    style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}
                  >
                    "{story.quote}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Link
            to="/users"
            className="inline-flex items-center gap-2 font-bold select-none"
            style={{
              padding: '12px 28px',
              border: '3px solid var(--border-color)',
              backgroundColor: 'var(--border-color)',
              color: '#fff',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              boxShadow: '6px 6px 0 rgba(0,0,0,0.15)',
              transition: 'none'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '10px 10px 0 rgba(0,0,0,0.2)';
              e.currentTarget.style.transform = 'translate(-4px, -4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translate(0, 0)';
            }}
          >
            Meet More Students
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
