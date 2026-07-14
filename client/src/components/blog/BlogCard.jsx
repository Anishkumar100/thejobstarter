import { Link } from 'react-router-dom';
import { Clock01Icon, ArrowRight01Icon } from 'hugeicons-react';

export default function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="blog-card">
      {post.coverImage && (
        <div className="blog-card__image-wrap">
          <img
            src={post.coverImage}
            alt={post.title}
            className="blog-card__image"
            loading="lazy"
          />
        </div>
      )}
      <div className="blog-card__body">
        <h3 className="blog-card__title">{post.title}</h3>
        {post.excerpt && (
          <p className="blog-card__excerpt">{post.excerpt}</p>
        )}
        <div className="blog-card__footer">
          <div className="blog-card__meta">
            <span className="blog-card__author">{post.author?.name || 'TheWebytes'}</span>
            <span className="blog-card__divider">·</span>
            <span className="blog-card__readtime">
              <Clock01Icon size={14} />
              {post.readTime} min
            </span>
          </div>
          <span className="blog-card__arrow">
            <ArrowRight01Icon size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
