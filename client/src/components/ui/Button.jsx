import { motion } from 'motion/react';

export default function Button({ children, variant = 'primary', size = '', fullWidth, disabled, onClick, type = 'button', className = '', ...props }) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : '',
    variant === 'accent' ? 'btn--accent' : '',
    variant === 'danger' ? 'btn--danger' : '',
    variant === 'secondary' ? '' : '',
    size ? `btn--${size}` : '',
    fullWidth ? 'btn--full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
