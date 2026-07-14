import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTestimonialStore } from '../../stores/useTestimonialStore.js';

/*
 * Reviews — Homepage testimonial grid
 * MAX BRUTALIST — 8px borders, 10px shadows, decorative cut corners, oversized quote marks
 * Fetches active testimonials from the store (reads from DB or mock data)
 */

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}

export default function Reviews() {
  const { testimonials, loading, fetchTestimonials } = useTestimonialStore();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  if (loading && testimonials.length === 0) {
    return (
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderTop: '12px solid var(--border-color)',
          borderBottom: '12px solid var(--border-color)',
          paddingTop: 'clamp(3rem, 7vh, 5.5rem)',
          paddingBottom: 'clamp(3rem, 7vh, 5.5rem)'
        }}
      >
        <div className="container text-center">
          <span className="loading-text">LOADING TESTIMONIALS...</span>
        </div>
      </section>
    );
  }

  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderTop: '12px solid var(--border-color)',
        borderBottom: '12px solid var(--border-color)',
        paddingTop: 'clamp(3rem, 7vh, 5.5rem)',
        paddingBottom: 'clamp(3rem, 7vh, 5.5rem)'
      }}
    >
      <div className="container relative" style={{ zIndex: 1 }}>
        {/* ═══ HEADER ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mb-14"
        >
          <span
            className="inline-block font-black text-xs tracking-[0.3em] mb-5 select-none"
            style={{
              border: '6px solid var(--accent)',
              padding: '10px 22px',
              color: 'var(--accent)',
              letterSpacing: '0.3em',
              boxShadow: '6px 6px 0 var(--shadow-color)'
            }}
          >
            TESTIMONIALS
          </span>
          <h2
            className="font-black leading-[0.8]"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase'
            }}
          >
            Real Talk.<br />
            <span style={{ color: 'var(--accent)' }}>No Filter.</span>
          </h2>
        </motion.div>

        {/* ═══ GLOBAL STYLES ═══ */}
        <style>{`
          /* ─── Card base ─── */
          .review-card {
            border: 8px solid var(--border-color);
            background-color: var(--bg-surface);
            box-shadow: 10px 10px 0 var(--shadow-color);
            transition: all 0.15s ease;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          /* ─── Diagonal cut-corner accent ─── */
          .review-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 40px 40px 0;
            border-color: transparent var(--accent) transparent transparent;
            z-index: 2;
            pointer-events: none;
          }

          /* ─── Hover: aggressive lift ─── */
          .review-card:hover {
            border-color: var(--accent) !important;
            background-color: color-mix(in srgb, var(--accent) 5%, var(--bg-surface)) !important;
            box-shadow: 16px 16px 0 var(--shadow-color) !important;
            transform: translate(-6px, -6px);
          }

          /* ─── Huge decorative quote mark ─── */
          .review-card__big-quote {
            position: absolute;
            top: -8px;
            left: 12px;
            font-size: clamp(6rem, 12vw, 10rem);
            font-weight: 900;
            line-height: 1;
            color: color-mix(in srgb, var(--accent) 12%, transparent);
            pointer-events: none;
            z-index: 0;
            user-select: none;
          }
          .review-card:hover .review-card__big-quote {
            color: color-mix(in srgb, var(--accent) 20%, transparent);
          }
          /* ─── Order badge ─── */
          .review-card__order {
            position: absolute;
            bottom: 12px;
            right: 12px;
            font-size: 0.55rem;
            font-weight: 900;
            letter-spacing: 0.15em;
            color: color-mix(in srgb, var(--accent) 50%, transparent);
            z-index: 1;
            pointer-events: none;
            user-select: none;
          }
          .review-card:hover .review-card__order {
            color: var(--accent);
          }
        `}</style>

        {/* ═══ GRID ═══ */}
        <div
          className="grid gap-10"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))'
          }}
        >
          {testimonials.map((review, i) => (
            <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <div className="review-card">
                  {/* Huge decorative opening quote */}
                  <span className="review-card__big-quote" aria-hidden="true">&rdquo;</span>

                  {/* Order badge */}
                  <span className="review-card__order">#{i + 1}</span>

                  {/* ═══ QUOTE ═══ */}
                  <div className="flex-1 relative" style={{ padding: 'clamp(1.25rem, 2.5vw, 1.75rem)', zIndex: 1 }}>
                    <p
                      className="review-card__quote leading-relaxed font-medium"
                      style={{
                        fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
                        color: 'var(--text-primary)',
                        lineHeight: 1.75
                      }}
                    >
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>

                  {/* ═══ AUTHOR ═══ */}
                  <div
                    className="review-card__author-bg flex items-center gap-4 select-none"
                    style={{
                      borderTop: '6px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.25rem, 2.5vw, 1.75rem)',
                      zIndex: 1
                    }}
                  >
                    {review.avatar ? (
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: '56px',
                          height: '56px',
                          border: '5px solid var(--border-color)',
                          boxShadow: '5px 5px 0 var(--shadow-color)',
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={review.avatar}
                          alt={review.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center font-black select-none flex-shrink-0"
                        style={{
                          width: '56px',
                          height: '56px',
                          border: '5px solid var(--border-color)',
                          color: 'var(--accent)',
                          fontSize: '1.15rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          boxShadow: '5px 5px 0 var(--shadow-color)'
                        }}
                      >
                        {getInitials(review.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div
                        className="review-card__name font-black leading-tight truncate"
                        style={{ fontSize: '1rem', color: 'var(--text-primary)' }}
                      >
                        {review.name}
                      </div>
                      <div
                        className="review-card__role font-mono font-bold truncate"
                        style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}
                      >
                        {review.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
