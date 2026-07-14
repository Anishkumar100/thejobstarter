import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useOsStore } from '../stores/useOsStore.js';
import Loader from '../components/ui/Loader.jsx';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';
import {
  ArrowLeft01Icon, AiVideoIcon, DocumentAttachmentIcon,
  Download01Icon, PlayIcon, Clock01Icon, BookOpen01Icon
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
 * Handles various YouTube URL formats.
 */
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.pathname.startsWith('/embed/')) {
      return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
    if (u.pathname.startsWith('/shorts/')) {
      return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
    if (u.pathname.startsWith('/live/')) {
      return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
    }
    return url;
  } catch {
    return url;
  }
}

/*
 * OsSubtopic — displays a single OS subtopic with explanation,
 * embedded video, downloadable resources, and a link to practice problems.
 */
export default function OsSubtopic() {
  const { lessonSlug, subtopicSlug } = useParams();
  const { currentSubtopic, subtopicsLoading, subtopicsError, fetchSubtopicBySlug } = useOsStore();

  /* Fetch subtopic by slug on mount */
  useEffect(() => {
    console.log('[OS] Fetching subtopic by slug:', subtopicSlug);
    fetchSubtopicBySlug(subtopicSlug);
  }, [subtopicSlug]);

  /* Compute reading time from explanation text */
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
        <title>{title} — OS — TheJobStarter</title>
        <meta name="description" content={description || ''} />
      </Helmet>

      {/* ═════ BACK LINK ═════ */}
      <div className="subtopic-back-bar">
        <Link to={`/os/${lessonSlug}`} className="subtopic-back-link">
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
                OS Subtopic
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

          <Link to={`/os/${lessonSlug}/${subtopicSlug}/problems`} className="subtopic-sidebar__cta">
            <div className="subtopic-sidebar__cta-icon">
              <PlayIcon size={28} />
            </div>
            <div className="subtopic-sidebar__cta-body">
              <span className="subtopic-sidebar__cta-heading">Solve Problems</span>
              <span className="subtopic-sidebar__cta-sub">Test your understanding</span>
            </div>
            <span className="subtopic-sidebar__cta-arrow">→</span>
            <span className="subtopic-sidebar__cta-corner" />
          </Link>
        </aside>
      </motion.div>
    </div>
  );
}
