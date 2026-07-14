import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useDsaStore } from '../stores/useDsaStore.js';
import Loader from '../components/ui/Loader.jsx';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';
import {
  ArrowLeft01Icon, AiVideoIcon, DocumentAttachmentIcon,
  Download01Icon, PlayIcon, Clock01Icon, BookOpen01Icon,
  AiIdeaIcon, AiChat01Icon, UserGroupIcon
} from 'hugeicons-react';

/*
 * Estimate reading time based on explanation length
 */
function estimateReadingTime(text) {
  if (!text) return 2;
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/*
 * Normalise any YouTube URL to embed format.
 * Handles:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID (already correct)
 *   - https://www.youtube.com/live/VIDEO_ID
 */
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    /* youtube.com/watch?v=XXXX */
    if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    /* youtu.be/XXXX */
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    /* Already /embed/ — strip extra params like ?t=... */
    if (u.pathname.startsWith('/embed/')) {
      return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
    /* youtube.com/shorts/XXXX */
    if (u.pathname.startsWith('/shorts/')) {
      return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
    /* youtube.com/live/XXXX */
    if (u.pathname.startsWith('/live/')) {
      return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
    return url;
  } catch {
    return url;
  }
}

export default function DsaSubtopic() {
  const { lessonSlug, subtopicSlug } = useParams();
  const { currentSubtopic, subtopicsLoading, subtopicsError, fetchSubtopicBySlug } = useDsaStore();

  useEffect(() => {
    fetchSubtopicBySlug(subtopicSlug);
  }, [subtopicSlug]);

  const readingTime = useMemo(
    () => estimateReadingTime(currentSubtopic?.explanation),
    [currentSubtopic?.explanation]
  );

  if (subtopicsLoading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Loader text="LOADING..." />
      </div>
    );
  }

  if (subtopicsError) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="error-text">{subtopicsError}</div>
      </div>
    );
  }

  if (!currentSubtopic) return null;

  const { youtubeUrl, pdfUrl, pptxUrl, title, description, explanation } = currentSubtopic;

  return (
    <div className="subtopic-page">
      <Helmet>
        <title>{title} — DSA — TheJobStarter</title>
        <meta name="description" content={description || ''} />
      </Helmet>

      {/* ═════ BACK LINK ═════ */}
      <div className="subtopic-back-bar">
        <Link to={`/dsa/${lessonSlug}`} className="subtopic-back-link">
          <ArrowLeft01Icon size={16} />
          <span>Back to {lessonSlug}</span>
        </Link>
      </div>

      <motion.div
        className="subtopic-layout"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* ═════ LEFT: CONTENT ═════ */}
        <div className="subtopic-main">
          {/* Title section */}
          <header className="subtopic-header">
            <h1 className="subtopic-title">{title}</h1>
            <div className="subtopic-meta">
              <span className="subtopic-meta__item">
                <BookOpen01Icon size={14} />
                DSA Subtopic
              </span>
              <span className="subtopic-meta__item">
                <Clock01Icon size={14} />
                {readingTime} min read
              </span>
            </div>
            {description && (
              <p className="subtopic-description">{description}</p>
            )}
          </header>

          <div className="subtopic-divider" />

          {/* Explanation — rendered via MarkdownRenderer */}
          <MarkdownRenderer content={explanation} />

          {/* Community CTA */}
          <div className="subtopic-community-cta">
            <div className="subtopic-community-cta__content">
              <h3 className="subtopic-community-cta__title">
                <AiChat01Icon size={20} />
                <span>Still have questions?</span>
              </h3>
              <p className="subtopic-community-cta__desc">
                Ask the community for help, or explore profiles of fellow learners.
              </p>
              <div className="subtopic-community-cta__actions">
                <Link to="/qa" className="btn btn--primary">
                  <AiChat01Icon size={16} />
                  Ask in Community
                </Link>
                <Link to="/users" className="btn">
                  <UserGroupIcon size={16} />
                  Explore Community
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═════ RIGHT: SIDEBAR ═════ */}
        <aside className="subtopic-sidebar">
          {youtubeUrl && (
            <div className="subtopic-sidebar__box">
              <div className="subtopic-sidebar__box-header">
                <AiVideoIcon size={18} />
                <span>Video Tutorial</span>
              </div>
              <div className="subtopic-sidebar__box-body subtopic-sidebar__box-body--video">
                <div className="subtopic-video-wrapper">
                  <iframe
                    src={getYouTubeEmbedUrl(youtubeUrl)}
                    title="Video tutorial"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}

          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="subtopic-sidebar__download">
              <DocumentAttachmentIcon size={22} />
              <div className="subtopic-sidebar__download-text">
                <span className="subtopic-sidebar__download-label">Download PDF</span>
                <span className="subtopic-sidebar__download-hint">Printable reference guide</span>
              </div>
              <span className="subtopic-sidebar__download-arrow">↓</span>
            </a>
          )}

          {pptxUrl && (
            <a href={pptxUrl} target="_blank" rel="noopener noreferrer" className="subtopic-sidebar__download">
              <DocumentAttachmentIcon size={22} />
              <div className="subtopic-sidebar__download-text">
                <span className="subtopic-sidebar__download-label">Download PPTX</span>
                <span className="subtopic-sidebar__download-hint">Presentation slides</span>
              </div>
              <span className="subtopic-sidebar__download-arrow">↓</span>
            </a>
          )}

          <Link to={`/dsa/${lessonSlug}/${subtopicSlug}/problems`} className="subtopic-sidebar__cta">
            <div className="subtopic-sidebar__cta-icon">
              <PlayIcon size={28} />
            </div>
            <div className="subtopic-sidebar__cta-body">
              <span className="subtopic-sidebar__cta-heading">Solve Problems</span>
              <span className="subtopic-sidebar__cta-sub">Test your understanding</span>
            </div>
            <span className="subtopic-sidebar__cta-arrow">→</span>
            {/* Corner decoration */}
            <span className="subtopic-sidebar__cta-corner" />
          </Link>
        </aside>
      </motion.div>
    </div>
  );
}
