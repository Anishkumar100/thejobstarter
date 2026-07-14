const IMAGEKIT_URL = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/thejobstarter';

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

export function buildYouTubeEmbed(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}
