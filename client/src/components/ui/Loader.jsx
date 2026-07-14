import { motion } from 'motion/react';

export default function Loader({ text = 'LOADING...' }) {
  return (
    <motion.div
      className="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="loader__dots">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="loader__dot"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="loading-text">{text}</span>
    </motion.div>
  );
}
