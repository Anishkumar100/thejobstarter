/*
 * ImageKit URL builder for client-side image transformations
 */
const IMAGEKIT_URL = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

/*
 * Build an optimized ImageKit URL with transformations
 * Usage: buildImageUrl('/path/to/image.jpg', { width: 800, height: 600 })
 */
export function buildImageUrl(path, transformations = {}) {
  const { width, height, quality = 80, format = 'webp' } = transformations;
  const tr = [];
  if (width) tr.push(`w-${width}`);
  if (height) tr.push(`h-${height}`);
  tr.push(`q-${quality}`);
  tr.push(`f-${format}`);
  if (width || height) tr.push('fo-auto');

  const trString = tr.join(',');
  return `${IMAGEKIT_URL}${path}?tr=${trString}`;
}

/*
 * Build a YouTube embed URL from video ID
 */
export function buildYouTubeEmbed(videoId, title) {
  return `https://www.youtube.com/embed/${videoId}`;
}
