import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import Loader from '../components/ui/Loader.jsx';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';
import {
  ArrowLeft01Icon, AiVideoIcon, DocumentAttachmentIcon,
  PlayIcon, Clock01Icon, BookOpen01Icon,
  AiChat01Icon, UserGroupIcon
} from 'hugeicons-react';

function estimateReadingTime(text) {
  if (!text) return 2;
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

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

export default function ProgrammingSubtopic() {
  const { lessonSlug, subtopicSlug } = useParams();
  const { currentSubtopic, loading, fetchSubtopicBySlug } = useProgrammingStore();

  useEffect(() => {
    fetchSubtopicBySlug(subtopicSlug);
  }, [subtopicSlug]);

  const readingTime = useMemo(
    () => estimateReadingTime(currentSubtopic?.explanation),
    [currentSubtopic?.explanation]
  );

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Loader text="LOADING..." />
      </div>
    );
  }

  if (!currentSubtopic) return null;

  const { youtubeUrl, pdfUrl, pptxUrl, title, description, explanation } = currentSubtopic;

  return (
    <div className="subtopic-page">
      <Helmet>
        <title>{title} — Programming — TheJobStarter</title>
        <meta name="description" content={description || ''} />
      </Helmet>

      <div className="subtopic-back-bar">
        <Link to={`/programming/${lessonSlug}`} className="subtopic-back-link">
          <ArrowLeft01Icon size={16} />
          <span>Back to {lessonSlug}</span>
        </Link>
      </div>

      <motion.div
        className="subtopic-layout"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="subtopic-main">
          <header className="subtopic-header">
            <h1 className="subtopic-title">{title}</h1>
            <div className="subtopic-meta">
              <span className="subtopic-meta__item">
                <BookOpen01Icon size={14} />
                Programming
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

          <MarkdownRenderer content={explanation} />

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

          <Link to={`/programming/${lessonSlug}/${subtopicSlug}/problems`} className="subtopic-sidebar__cta">
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
