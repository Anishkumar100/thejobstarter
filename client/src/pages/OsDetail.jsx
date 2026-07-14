import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useOsStore } from '../stores/useOsStore.js';
import ProblemView from '../components/dsa/ProblemView.jsx';
import Loader from '../components/ui/Loader.jsx';
import { ArrowLeft01Icon, DocumentAttachmentIcon, AiChat01Icon, UserGroupIcon } from 'hugeicons-react';

/*
 * OsDetail — displays a single OS problem's full detail with
 * problem statement, approach, examples, constraints, complexity analysis,
 * and download links. NO code section (conceptual only).
 */
export default function OsDetail() {
  const { lessonSlug, subtopicSlug, problemSlug } = useParams();
  const slug = problemSlug || lessonSlug;
  const { currentProblem, currentLesson, problemsLoading, problemsError, fetchProblemBySlug } = useOsStore();

  /* Fetch problem by slug on mount */
  useEffect(() => {
    console.log('[OS] Fetching problem by slug:', slug);
    fetchProblemBySlug(slug);
  }, [slug]);

  /*
   * Determine the back link based on which segments are present in the URL.
   * Full path: /os/:lessonSlug/:subtopicSlug/:problemSlug
   */
  const backLink = lessonSlug && subtopicSlug
    ? `/os/${lessonSlug}/${subtopicSlug}/problems`
    : lessonSlug
      ? `/os/${lessonSlug}`
      : '/os';

  const backText = lessonSlug && subtopicSlug
    ? 'Back to Problems'
    : lessonSlug
      ? 'Back to Lesson'
      : 'Back to OS';

  if (problemsLoading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Loader text="LOADING PROBLEM..." />
      </div>
    );
  }

  if (problemsError) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="error-text">{problemsError}</div>
      </div>
    );
  }

  if (!currentProblem) return null;

  const p = currentProblem;

  return (
    <div className="pdetail-page">
      <Helmet>
        <title>{p.title} — OS — TheJobStarter</title>
        <meta name="description" content={p.problemStatement?.substring(0, 160)} />
      </Helmet>

      {/* ═════ HERO ═════ */}
      <div className="pdetail-hero">
        <Link to={backLink} className="pdetail-back-link">
          <ArrowLeft01Icon size={16} />
          <span>{backText}</span>
        </Link>

        <div className="pdetail-hero__body">
          <div className="pdetail-hero__info">
            <span className={`pdetail-diff-badge pdetail-diff-badge--${p.difficulty}`}>
              {p.difficulty}
            </span>
            <h1 className="pdetail-hero__title">{p.title}</h1>

            {p.topics?.length > 0 && (
              <div className="pdetail-hero__tags">
                {p.topics.map(t => <span key={t} className="pdetail-tag">{t}</span>)}
              </div>
            )}

            {p.companies?.length > 0 && (
              <div className="pdetail-hero__companies">
                {p.companies.map(c => <span key={c} className="pdetail-company">{c}</span>)}
              </div>
            )}
          </div>

          <div className="pdetail-hero__stats">
            <div className="pdetail-stat">
              <span className="pdetail-stat__num">{p.views?.toLocaleString()}</span>
              <span className="pdetail-stat__label">Views</span>
            </div>
            <div className="pdetail-stat">
              <span className="pdetail-stat__num">{p.bookmarks?.toLocaleString()}</span>
              <span className="pdetail-stat__label">Bookmarks</span>
            </div>
            {p.timeComplexity && (
              <div className="pdetail-stat pdetail-stat--wide">
                <span className="pdetail-stat__num-sm">{p.timeComplexity}</span>
                <span className="pdetail-stat__label">Time</span>
              </div>
            )}
            {p.spaceComplexity && (
              <div className="pdetail-stat pdetail-stat--wide">
                <span className="pdetail-stat__num-sm">{p.spaceComplexity}</span>
                <span className="pdetail-stat__label">Space</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═════ COMMUNITY LINKS ═════ */}
      <div className="pdetail-toolbar">
        <Link to="/qa" className="pdetail-toolbar__btn pdetail-toolbar__btn--primary">
          <AiChat01Icon size={14} />
          Ask in Community
        </Link>
        <Link to="/users" className="pdetail-toolbar__btn">
          <UserGroupIcon size={14} />
          Explore Community
        </Link>
      </div>

      {/* ═════ MAIN LAYOUT — 60/40 ═════ */}
      <motion.div
        className="pdetail-layout"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left (60%): Problem content */}
        <div className="pdetail-main">
          <ProblemView problem={p} />
        </div>

        {/* Right (40%): Downloads only — no code section for OS */}
        <aside className="pdetail-codeside">
          <div className="pdetail-codeside-downloads">
            {p.pdfUrl && (
              <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="pdetail-download">
                <DocumentAttachmentIcon size={22} />
                <div className="pdetail-download__text">
                  <span className="pdetail-download__label">Download PDF</span>
                  <span className="pdetail-download__hint">Problem notes &amp; solution</span>
                </div>
                <span className="pdetail-download__arrow">↓</span>
              </a>
            )}

            {p.pptxUrl && (
              <a href={p.pptxUrl} target="_blank" rel="noopener noreferrer" className="pdetail-download">
                <DocumentAttachmentIcon size={22} />
                <div className="pdetail-download__text">
                  <span className="pdetail-download__label">Download PPTX</span>
                  <span className="pdetail-download__hint">Presentation slides</span>
                </div>
                <span className="pdetail-download__arrow">↓</span>
              </a>
            )}

            {lessonSlug && (
              <Link to={`/os/${lessonSlug}`} className="pdetail-sidebar-link">
                <span className="pdetail-sidebar-link__text">More in {currentLesson?.title || lessonSlug}</span>
                <span className="pdetail-sidebar-link__arrow">→</span>
              </Link>
            )}
          </div>
        </aside>
      </motion.div>
    </div>
  );
}
