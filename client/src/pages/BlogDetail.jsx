import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useBlogStore } from '../stores/useBlogStore.js';
import Loader from '../components/ui/Loader.jsx';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';
import { ArrowLeft01Icon, Clock01Icon, UserIcon, FileDownloadIcon } from 'hugeicons-react';

export default function BlogDetail() {
  const { slug } = useParams();
  const { currentPost, loading, error, fetchPostBySlug } = useBlogStore();

  useEffect(() => { fetchPostBySlug(slug); }, [slug]);

  return (
    <div className="blog-detail-page">
      <Helmet>
        <title>{currentPost?.title || 'Blog Post'} — TheJobStarter</title>
        <meta name="description" content={currentPost?.excerpt} />
        {currentPost?.coverImage && <meta property="og:image" content={currentPost.coverImage} />}
      </Helmet>

      <div className="blog-detail-back">
        <Link to="/blog" className="blog-detail-back__link">
          <ArrowLeft01Icon size={16} />
          <span>Back to Blog</span>
        </Link>
      </div>

      {loading && <div className="container" style={{ paddingTop: 'var(--space-xl)' }}><Loader text="LOADING POST..." /></div>}
      {error && <div className="container" style={{ paddingTop: 'var(--space-xl)' }}><div className="error-text">{error}</div></div>}

      {!loading && !error && currentPost && (
        <motion.div
          className="blog-detail-layout"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Cover Image */}
          {currentPost.coverImage && (
            <div className="blog-detail-cover">
              <img src={currentPost.coverImage} alt={currentPost.title} />
            </div>
          )}

          {/* Header */}
          <header className="blog-detail-header">
            <h1 className="blog-detail-title">{currentPost.title}</h1>
            <div className="blog-detail-meta">
              <span className="blog-detail-meta__item">
                <UserIcon size={16} />
                {currentPost.author?.name || 'TheWebytes'}
              </span>
              <span className="blog-detail-meta__item">
                <Clock01Icon size={16} />
                {currentPost.readTime || 5} min read
              </span>
            </div>
          </header>

          {/* Divider */}
          <div className="blog-detail-divider" />

          {/* Content */}
          <div className="blog-detail-content">
            <MarkdownRenderer content={currentPost.content} />
          </div>

          {/* Attached document — appears when admin uploads a PDF / notes */}
          {currentPost.document?.url && (
            <>
              <div className="blog-detail-divider" />
              <div className="blog-detail-doc">
                <div className="blog-detail-doc__icon">📄</div>
                <div className="blog-detail-doc__info">
                  <span className="blog-detail-doc__label">
                    {currentPost.document.title || 'Attached Document'}
                  </span>
                  <a
                    href={currentPost.document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-detail-doc__link"
                  >
                    <FileDownloadIcon size={16} />
                    <span>Download / View</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
