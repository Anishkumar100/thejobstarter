import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePageLoadingStore } from '../../stores/usePageLoadingStore.js';

/*
 * PHRASES — rotating status messages shown below the spinner.
 * Each phrase is displayed for ~3 s before fading to the next.
 */
const STATUS_PHRASES = [
  'Compiling solutions…',
  'Indexing algorithms…',
  'Brewing coffee…',
  'Sharpening pencils…',
  'Warming up CPUs…',
  'Loading knowledge…',
  'Crunching numbers…',
  'Optimizing paths…'
];

/*
 * RANDOM_FACTS — shown on longer loads as a subtle secondary line.
 */
const RANDOM_FACTS = [
  'Big O notation was invented by Paul Bachmann in 1894.',
  'The first computer bug was a real moth found in 1947.',
  'There are only 10 types of people in the world — those who understand binary and those who don\'t.',
  'A single line of code can execute millions of CPU instructions.',
  'The first algorithm was written by Ada Lovelace in 1843.',
  'JavaScript was created in just 10 days in 1995.',
  'The world\'s first website is still online at info.cern.ch.',
  'There are over 700 programming languages in existence.',
  'Stack Overflow was created in 2008 by Jeff Atwood and Joel Spolsky.',
  'Python\'s name comes from Monty Python\'s Flying Circus.'
];

export default function PageLoader() {
  const count = usePageLoadingStore((s) => s.count);
  const activeLabels = usePageLoadingStore((s) => s.activeLabels);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [showFact, setShowFact] = useState(false);

  /* Rotate status phrases every 3 seconds */
  useEffect(() => {
    if (count === 0) return;
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % STATUS_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [count]);

  /* Show a random fact after 6 seconds of loading */
  useEffect(() => {
    if (count === 0) {
      setShowFact(false);
      return;
    }
    const timer = setTimeout(() => setShowFact(true), 6000);
    return () => clearTimeout(timer);
  }, [count]);

  /* Staggered bounce animation for the dots */
  const dotVariants = {
    animate: (i) => ({
      y: [0, -12, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.12,
        ease: 'easeInOut'
      }
    })
  };

  const statusMessage = activeLabels.length > 0
    ? `Loading ${activeLabels[activeLabels.length - 1]}…`
    : STATUS_PHRASES[phraseIdx];

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="pageloader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="pageloader__backdrop" />

          {/* Content box */}
          <div className="pageloader__box">
            {/* Brutalist spinner: 3 bouncing dots */}
            <div className="pageloader__spinner">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="pageloader__dot"
                  custom={i}
                  variants={dotVariants}
                  animate="animate"
                />
              ))}
            </div>

            {/* Status message */}
            <motion.p
              key={phraseIdx}
              className="pageloader__status"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {statusMessage}
            </motion.p>

            {/* Random fact (appears after 6 s) */}
            <AnimatePresence>
              {showFact && (
                <motion.p
                  key={factIdx}
                  className="pageloader__fact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {RANDOM_FACTS[factIdx]}
                  <button
                    className="pageloader__fact-btn"
                    onClick={() => setFactIdx((i) => (i + 1) % RANDOM_FACTS.length)}
                    aria-label="Show another fact"
                  >
                    ↻
                  </button>
                </motion.p>
              )}
            </AnimatePresence>

            {/* Bottom bar — label + progress pulse */}
            <div className="pageloader__bar">
              <span className="pageloader__bar-label">
                {activeLabels.length > 0 ? activeLabels.join(', ') : 'thewebytes'}
              </span>
              <span className="pageloader__bar-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
