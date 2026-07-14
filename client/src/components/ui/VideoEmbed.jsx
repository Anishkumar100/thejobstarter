export default function VideoEmbed({ url, caption }) {
  /*
   * Extract video ID from any YouTube URL format:
   *   youtube.com/watch?v=ID
   *   youtu.be/ID
   *   youtube.com/embed/ID
   *   youtube.com/shorts/ID
   *   youtube.com/live/ID
   */
  let embedSrc = '';
  try {
    /* Prepend https:// if missing so new URL() doesn't throw */
    const raw = url && /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const u = new URL(raw);
    if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      embedSrc = `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    } else if (u.hostname === 'youtu.be') {
      embedSrc = `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    } else if (u.pathname.startsWith('/embed/')) {
      embedSrc = `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    } else if (u.pathname.startsWith('/shorts/')) {
      embedSrc = `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    } else if (u.pathname.startsWith('/live/')) {
      embedSrc = `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
  } catch { /* invalid URL — embedSrc stays '' */ }

  /* Don't render anything if we can't produce a valid embed URL */
  if (!embedSrc) return null;

  return (
    <figure>
      <div className="video-embed">
        <iframe
          src={embedSrc}
          title={caption || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption && <figcaption className="video-embed__caption">{caption}</figcaption>}
    </figure>
  );
}
