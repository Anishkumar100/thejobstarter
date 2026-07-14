import { motion } from 'motion/react';

export default function Card({ children, hoverable, alt, className = '', ...props }) {
  const classes = [
    'card',
    hoverable ? 'card--hover' : '',
    alt ? 'card--alt' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={classes}
      whileHover={hoverable ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
