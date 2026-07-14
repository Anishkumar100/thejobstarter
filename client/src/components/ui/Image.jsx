import { buildImageUrl } from '../../utils/imageKit.js';

export default function Image({ src, alt, caption, width, height, className = '' }) {
  const optimizedSrc = buildImageUrl(src, { width, height });

  return (
    <figure>
      <img
        src={optimizedSrc}
        alt={alt || ''}
        width={width}
        height={height}
        loading="lazy"
        className={`brutal-image ${className}`}
      />
      {caption && <figcaption className="image__caption">{caption}</figcaption>}
    </figure>
  );
}
