import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useQaStore } from '../stores/useQaStore.js';
import QuestionCard from '../components/qa/QuestionCard.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { Search01Icon, PlusSignIcon, MessageQuestionIcon, FireIcon, StarsIcon } from 'hugeicons-react';

/*
 * Get all unique tags from the questions list
 */
function extractTags(questions) {
  const tagSet = new Set();
  questions.forEach(q => q.tags?.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export default function QaList() {
  const { questions, loading, error, fetchQuestions } = useQaStore();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeTag, setActiveTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { fetchQuestions({ search: debouncedSearch }); }, [debouncedSearch]);

  const tags = useMemo(() => extractTags(questions), [questions]);

  /*
   * Filter + sort in memory
   */
  const filtered = useMemo(() => {
    let result = [...questions];
    if (activeTag) result = result.filter(q => q.tags?.includes(activeTag));
    if (sortBy === 'votes') result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    else if (sortBy === 'answers') result.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [questions, activeTag, sortBy]);

  const totalVotes = useMemo(() => questions.reduce((s, q) => s + (q.votes || 0), 0), [questions]);
  const totalAnswers = useMemo(() => questions.reduce((s, q) => s + (q.answerCount || 0), 0), [questions]);

  return (
    <div className="qa-page">
      <Helmet>
        <title>Q&A — TheJobStarter Community</title>
        <meta name="description" content="Ask questions and get answers on DSA, DBMS, and OS topics." />
      </Helmet>

      {/* ═════ HERO ═════ */}
      <div className="qa-hero">
        <div className="qa-hero__body">
          <div className="qa-hero__info">
            <span className="qa-hero__supertitle">Community</span>
            <h1 className="qa-hero__title">Questions & Answers</h1>
            <p className="qa-hero__desc">
              Get help, share knowledge, and level up together. Ask questions about DSA, DBMS, OS, and everything tech.
            </p>
            <div className="qa-hero__actions">
              <Link to="/qa/ask" className="qa-hero__btn qa-hero__btn--primary">
                <PlusSignIcon size={16} />
                Ask a Question
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className="qa-hero__stats">
            <div className="qa-stat">
              <MessageQuestionIcon size={22} />
              <span className="qa-stat__num">{questions.length}</span>
              <span className="qa-stat__label">Questions</span>
            </div>
            <div className="qa-stat">
              <StarsIcon size={22} />
              <span className="qa-stat__num">{totalAnswers}</span>
              <span className="qa-stat__label">Answers</span>
            </div>
            <div className="qa-stat">
              <FireIcon size={22} />
              <span className="qa-stat__num">{totalVotes}</span>
              <span className="qa-stat__label">Votes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═════ TOOLBAR ═════ */}
      <div className="qa-toolbar">
        {/* Search */}
        <div className="qa-search">
          <Search01Icon size={16} />
          <input
            className="qa-search__input"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="qa-sort">
          <button
            className={`qa-sort__btn ${sortBy === 'newest' ? 'qa-sort__btn--active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            Newest
          </button>
          <button
            className={`qa-sort__btn ${sortBy === 'votes' ? 'qa-sort__btn--active' : ''}`}
            onClick={() => setSortBy('votes')}
          >
            Top Voted
          </button>
          <button
            className={`qa-sort__btn ${sortBy === 'answers' ? 'qa-sort__btn--active' : ''}`}
            onClick={() => setSortBy('answers')}
          >
            Most Answered
          </button>
        </div>
      </div>

      {/* ═════ TAG FILTERS ═════ */}
      {tags.length > 0 && (
        <div className="qa-tags-bar">
          <button
            className={`qa-tag-btn ${!activeTag ? 'qa-tag-btn--active' : ''}`}
            onClick={() => setActiveTag('')}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              className={`qa-tag-btn ${activeTag === tag ? 'qa-tag-btn--active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ═════ CONTENT ═════ */}
      <div className="qa-content">
        {loading && <Loader text="LOADING QUESTIONS..." />}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="qa-empty">
                <MessageQuestionIcon size={48} />
                <h3 className="qa-empty__title">No questions found</h3>
                <p className="qa-empty__desc">
                  {search
                    ? `No results for "${search}". Try different keywords.`
                    : 'Be the first to ask a question in this topic!'}
                </p>
                <Link to="/qa/ask" className="qa-hero__btn qa-hero__btn--primary">
                  <PlusSignIcon size={16} />
                  Ask a Question
                </Link>
              </div>
            ) : (
              <div className="qa-grid">
                {filtered.map((q, i) => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <QuestionCard question={q} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
