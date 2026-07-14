import { motion } from 'motion/react';
import { useAuthStore } from '../../stores/useAuthStore.js';

export default function FollowButton({ isFollowing, onToggle }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;

  return (
    <motion.button
      className={`btn btn--sm ${isFollowing ? '' : 'btn--primary'}`}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </motion.button>
  );
}
