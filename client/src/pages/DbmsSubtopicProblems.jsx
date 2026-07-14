import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import Loader from '../components/ui/Loader.jsx';
import { ArrowLeft01Icon, AiIdeaIcon, AiChat01Icon } from 'hugeicons-react';

/*
 * DbmsSubtopicProblems — lists all problems for a given DBMS subtopic.
 * Supports difficulty filtering and displays problem cards with stats.
 */
export default function DbmsSubtopicProblems() {
  const { lessonSlug, subtopicSlug } = useParams();
  const {
    problems, problemsLoading, problemsError,
    fetchSubtopicProblems, currentSubtopic, fetchSubtopicBySlug
  } = useDbmsStore();

  const [difficultyFilter, setDifficultyFilter] = useState('all');

  /* Fetch subtopic details and its problems on mount */
  useEffect(() => {
    console.log('[DBMS] Fetching subtopic by slug:', subtopicSlug);
    fetchSubtopicBySlug(subtopicSlug);
    console.log('[DBMS] Fetching problems for subtopic:', subtopicSlug);
    fetchSubtopicProblems(subtopicSlug);
  }, [subtopicSlug]);

  /* Compute difficulty counts from all problems (before filter) */
  const stats = useMemo(() => {
    const all = problems || [];
    return {
      total: all.length,
      easy: all.filter(p => p.difficulty === 'easy').length,
      medium: all.filter(p => p.difficulty === 'medium').length,
      hard: all.filter(p => p.difficulty === 'hard').length,
    };
  }, [problems]);

  /* Apply difficulty filter locally */
  const filtered = useMemo(() => {
    if (difficultyFilter === 'all') return problems || [];
    return (problems || []).filter(p => p.difficulty === difficultyFilter);
  }, [problems, difficultyFilter]);

  const subtitle = currentSubtopic?.description || `Practice problems to master ${subtopicSlug}.`;

  return (
    <div className="probs-page">
      <Helmet>
        <title>{currentSubtopic?.title || 'Problems'} — DBMS — TheJobStarter</title>
        <meta name="description" content={`Practice problems for ${currentSubtopic?.title || subtopicSlug}`} />
      </Helmet>

      {/* ═════ HERO ═════ */}
      <div className="probs-hero">
        <Link to={`/dbms/${lessonSlug}/${subtopicSlug}`} className="probs-back-link">
          <ArrowLeft01Icon size={16} />
          <span>Back to {currentSubtopic?.title || subtopicSlug}</span>
        </Link>

        <div className="probs-hero__body">
          <div className="probs-hero__info">
            <span className="probs-hero__supertitle">Practice Problems</span>
            <h1 className="probs-hero__title">{currentSubtopic?.title} — Problems</h1>
            <p className="probs-hero__desc">{subtitle}</p>
          </div>

          {/* Stats cards */}
          <div className="probs-hero__stats">
            <div className="probs-stat probs-stat--total">
              <span className="probs-stat__num">{stats.total}</span>
              <span className="probs-stat__label">Total</span>
            </div>
            <div className="probs-stat probs-stat--easy">
              <span className="probs-stat__num">{stats.easy}</span>
              <span className="probs-stat__label">Easy</span>
            </div>
            <div className="probs-stat probs-stat--medium">
              <span className="probs-stat__num">{stats.medium}</span>
              <span className="probs-stat__label">Medium</span>
            </div>
            <div className="probs-stat probs-stat--hard">
              <span className="probs-stat__num">{stats.hard}</span>
              <span className="probs-stat__label">Hard</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═════ FILTER + COMMUNITY LINKS ═════ */}
      <div className="probs-toolbar">
        <div className="probs-filters">
          {['all', 'easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              className={`probs-filter-btn ${difficultyFilter === d ? 'probs-filter-btn--active' : ''} probs-filter-btn--${d}`}
              onClick={() => setDifficultyFilter(d)}
            >
              {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
              {d !== 'all' && <span className={`badge-dot badge-dot--${d}`} />}
            </button>
          ))}
        </div>

        <div className="probs-toolbar__actions">
          <Link to="/qa" className="probs-toolbar__btn probs-toolbar__btn--primary">
            <AiChat01Icon size={14} />
            Community
          </Link>
          <Link to={`/dbms/${lessonSlug}/${subtopicSlug}`} className="probs-toolbar__btn">
            <AiIdeaIcon size={14} />
            Study Notes
          </Link>
        </div>
      </div>

      {/* ═════ PROBLEMS LIST ═════ */}
      <div className="probs-content">
        {problemsLoading && <Loader text="LOADING PROBLEMS..." />}
        {problemsError && <div className="error-text">{problemsError}</div>}

        {!problemsLoading && !problemsError && filtered.length > 0 && (
          <div className="probs-grid">
            {filtered.map((problem, i) => (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
              >
                <Link
                  to={`/dbms/${lessonSlug}/${subtopicSlug}/${problem.slug}`}
                  className="prob-card"
                >
                  <span className={`prob-card__stripe prob-card__stripe--${problem.difficulty}`} />
                  <div className="prob-card__body">
                    <div className="prob-card__header">
                      <h3 className="prob-card__title">{problem.title}</h3>
                      <span className={`prob-card__badge prob-card__badge--${problem.difficulty}`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {problem.topics && problem.topics.length > 0 && (
                      <div className="prob-card__tags">
                        {problem.topics.map(topic => (
                          <span key={topic} className="prob-card__tag">{topic}</span>
                        ))}
                      </div>
                    )}

                    {problem.companies && problem.companies.length > 0 && (
                      <div className="prob-card__companies">
                        {problem.companies.slice(0, 5).map(company => (
                          <span key={company} className="prob-card__company">{company}</span>
                        ))}
                      </div>
                    )}

                    <div className="prob-card__footer">
                      <span className="prob-card__views">
                        <span className="prob-card__views-icon">▲</span>
                        {problem.views?.toLocaleString() || 0} views
                      </span>
                      <span className="prob-card__arrow">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!problemsLoading && !problemsError && filtered.length === 0 && (
          <div className="probs-empty">
            <AiIdeaIcon size={48} />
            {difficultyFilter !== 'all' ? (
              <>
                <h3 className="probs-empty__title">No {difficultyFilter} problems yet</h3>
                <p className="probs-empty__desc">
                  Try a different difficulty filter or check back later for new problems.
                </p>
              </>
            ) : (
              <>
                <h3 className="probs-empty__title">No problems yet</h3>
                <p className="probs-empty__desc">
                  Problems for this topic are being added. Check back soon!
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
