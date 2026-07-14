import { useState, useEffect } from 'react';

/*
 * Extract initials from a name string
 * e.g. "Anish Kumar" → "AK", "rahul" → "R"
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.substring(0, 2).toUpperCase() || '?';
}

/*
 * Deterministic color from a string — generates a vibrant hue
 * Uses a simple hash to pick from a curated palette of brutalist colors
 */
const AVATAR_COLORS = [
  '#e11d48', // rose
  '#dc2626', // red
  '#ea580c', // orange
  '#d97706', // amber
  '#ca8a04', // yellow
  '#65a30d', // lime
  '#16a34a', // green
  '#0d9488', // teal
  '#2563eb', // blue
  '#7c3aed', // violet
  '#a21caf', // fuchsia
  '#be123c', // pink
  '#1d4ed8', // blue-700
  '#0e7490', // cyan
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Avatar({ src, alt, name = '', size = '', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size ? `avatar--${size}` : '';

  /* Reset error state when src changes (e.g. user uploads a new avatar) */
  useEffect(() => { setImgError(false); }, [src]);

  const label = alt || name || 'Avatar';
  const initials = getInitials(name || alt);
  const bgColor = getAvatarColor(name || alt);

  /* Show the image if src exists and hasn't errored */
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={label}
        className={`avatar ${sizeClass} ${className}`}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  /* Placeholder with initials when no image or image fails to load */
  return (
    <div
      className={`avatar avatar--placeholder ${sizeClass} ${className}`}
      style={{ background: bgColor }}
      aria-label={label}
      title={label}
    >
      <span className="avatar__initials">{initials}</span>
      {/* Decorative brutalist corner accent */}
      <span className="avatar__corner" />
    </div>
  );
}
