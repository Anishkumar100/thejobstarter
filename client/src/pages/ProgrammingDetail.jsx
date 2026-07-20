import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import ProblemView from '../components/dsa/ProblemView.jsx';
import CodeBlock from '../components/ui/CodeBlock.jsx';
import Loader from '../components/ui/Loader.jsx';
import { ArrowLeft01Icon, DocumentAttachmentIcon, AiChat01Icon, UserGroupIcon, CodeIcon, EyeIcon } from 'hugeicons-react';
import QuizEmbed from '../components/quiz/QuizEmbed.jsx';

export default function ProgrammingDetail() {
  const { lessonSlug, subtopicSlug, problemSlug } = useParams();
  const slug = problemSlug || lessonSlug;
  const { currentProblem, currentLesson, loading, fetchProblemBySlug } = useProgrammingStore();

  useEffect(() => {
    fetchProblemBySlug(slug);
  }, [slug]);

  const backLink = lessonSlug && subtopicSlug
    ? `/programming/${lessonSlug}/${subtopicSlug}/problems`
    : lessonSlug
      ? `/programming/${lessonSlug}`
      : '/programming';

  const backText = lessonSlug && subtopicSlug
    ? 'Back to Problems'
    : lessonSlug
      ? 'Back to Lesson'
      : 'Back to Programming';

  const [codeRevealed, setCodeRevealed] = useState(false);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Loader text="LOADING PROBLEM..." />
      </div>
    );
  }

  if (!currentProblem) return null;

  const p = currentProblem;
  const hasCode = p.codeBlocks?.length > 0;

  return (
    <div className="pdetail-page">
      <Helmet>
        <title>{p.title} — Programming — TheJobStarter</title>
        <meta name="description" content={p.problemStatement?.substring(0, 160)} />
      </Helmet>

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

      <motion.div
        className="pdetail-layout"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pdetail-main">
          <ProblemView problem={p} />
          <QuizEmbed problemModel="ProgrammingProblem" slug={slug} subjectName="Programming" subject="programming" />
        </div>

        <aside className="pdetail-codeside">
          {hasCode && (
            <div className="pdetail-reveal">
              <button
                className={`pdetail-reveal__btn ${codeRevealed ? 'pdetail-reveal__btn--active' : ''}`}
                onClick={() => setCodeRevealed(v => !v)}
              >
                {codeRevealed ? (
                  <><EyeIcon size={18} /><span>Hide Solutions</span></>
                ) : (
                  <><CodeIcon size={18} /><span>Reveal Solutions</span></>
                )}
              </button>
              <span className="pdetail-reveal__count">{p.codeBlocks.length} language{p.codeBlocks.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {hasCode && (
            <motion.div
              className={`pdetail-code-panel ${codeRevealed ? 'pdetail-code-panel--open' : ''}`}
              initial={false}
              animate={{
                height: codeRevealed ? 'auto' : 0,
                opacity: codeRevealed ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="pdetail-code-panel__inner">
                <CodeBlock codeBlocks={p.codeBlocks} />
              </div>
            </motion.div>
          )}

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
              <Link to={`/programming/${lessonSlug}`} className="pdetail-sidebar-link">
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
