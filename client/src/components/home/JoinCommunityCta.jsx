import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Zap } from 'lucide-react';

/*
 * JoinCommunityCta — Section 10 of the homepage
 * Max-brutalist full-width CTA. Heavy borders, massive type,
 * aggressive hover states. Theme-aware CSS vars.
 */

export default function JoinCommunityCta() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderTop: '12px solid var(--border-color)',
        borderBottom: '12px solid var(--border-color)',
        paddingTop: 'clamp(4rem, 10vh, 7rem)',
        paddingBottom: 'clamp(4rem, 10vh, 7rem)'
      }}
    >
      <style>{`
        .cta-primary {
          border: 6px solid var(--text-primary);
          background-color: var(--text-primary);
          color: var(--bg-primary);
          box-shadow: 12px 12px 0 var(--accent);
          transition: all 0.12s ease;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
        }
        .cta-primary:hover {
          background-color: var(--accent) !important;
          border-color: var(--accent) !important;
          color: var(--text-inverse) !important;
          box-shadow: 18px 18px 0 var(--accent) !important;
          transform: translate(-6px, -6px);
        }
        .cta-secondary {
          border: 6px solid var(--border-subtle);
          background-color: transparent;
          color: var(--text-tertiary);
          transition: all 0.12s ease;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }
        .cta-secondary:hover {
          border-color: var(--text-primary) !important;
          color: var(--text-primary) !important;
        }
      `}</style>

      {/* Heavy corner brackets */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 'clamp(60px, 12vw, 140px)', height: 'clamp(60px, 12vw, 140px)', borderTop: '14px solid var(--accent)', borderLeft: '14px solid var(--accent)', zIndex: 3 }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 'clamp(60px, 12vw, 140px)', height: 'clamp(60px, 12vw, 140px)', borderBottom: '14px solid var(--accent)', borderRight: '14px solid var(--accent)', zIndex: 3 }} />

      <div className="container relative" style={{ zIndex: 1 }}>
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-3 px-4 py-2 mb-10 font-black text-xs tracking-[0.25em] uppercase select-none"
          style={{
            border: '5px solid var(--accent)',
            color: 'var(--accent)',
            backgroundColor: 'transparent',
            letterSpacing: '0.25em'
          }}
        >
          <Zap size={16} />
          The Community
        </motion.div>

        {/* Headline — massive */}
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-black leading-[0.8] mb-8"
          style={{
            fontSize: 'clamp(3.5rem, 15vw, 10rem)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.07em',
            textTransform: 'uppercase',
            maxWidth: 'none',
            width: '100%'
          }}
        >
          Stop<br />
          <span style={{ color: 'var(--accent)', textDecoration: 'underline var(--accent) 8px', textUnderlineOffset: '8px' }}>Studying</span><br />
          Alone.
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-12 font-bold"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
            color: 'var(--text-secondary)',
            maxWidth: 'none',
            width: '100%',
            lineHeight: 1.4,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          Ask. Answer. Grow. Join our students community.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-start gap-6"
        >
          <Link to="/qa" className="cta-primary inline-flex items-center gap-3 select-none no-underline" style={{ padding: '18px 44px', fontSize: '1.1rem' }}>
            <MessageSquare size={22} />
            Join Now
            <ArrowRight size={22} />
          </Link>

          <Link to="/qa/ask" className="cta-secondary inline-flex items-center gap-2 select-none no-underline" style={{ padding: '18px 36px', fontSize: '0.9rem' }}>
            Post a Question
          </Link>
        </motion.div>

        {/* Bottom hash tags */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            marginTop: 'clamp(3.5rem, 7vh, 5rem)',
            borderTop: '5px solid var(--border-subtle)',
            paddingTop: 'clamp(1.2rem, 2.5vh, 1.8rem)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(0.75rem, 2vw, 1.5rem)',
            alignItems: 'center'
          }}
        >
          {['#dsa', '#dbms', '#os', '#placements', '#interviewprep'].map(tag => (
            <span key={tag} className="font-mono font-bold select-none" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
