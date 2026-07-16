import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import Loader from '../components/ui/Loader.jsx';
import { ArrowLeft01Icon } from 'hugeicons-react';

/*
 * DbmsLesson — displays a single DBMS lesson and its subtopics.
 * Fetches the lesson by slug and its subtopics in parallel.
 */
export default function DbmsLesson() {
  const { lessonSlug } = useParams();
  const {
    currentLesson, lessonsLoading, fetchLessonBySlug,
    subtopics, subtopicsLoading, fetchSubtopics
  } = useDbmsStore();
  const [search, setSearch] = useState('');

  /* Fetch lesson details and subtopics on mount or when slug changes */
  useEffect(() => {
    fetchLessonBySlug(lessonSlug);
    fetchSubtopics({ lesson: lessonSlug });
  }, [lessonSlug]);

  /* Filter subtopics by search query */
  const filtered = search.trim()
    ? subtopics.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : subtopics;

  if (!currentLesson && !lessonsLoading && !subtopicsLoading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Link to="/dbms" className="detail-back"><ArrowLeft01Icon size={16} /> Back to DBMS</Link>
        <p style={{ textAlign: 'center', padding: '2rem' }}>Lesson not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{currentLesson?.title || 'Lesson'} — DBMS — TheJobStarter</title>
        <meta name="description" content={currentLesson?.description} />
      </Helmet>

      {/* ═════ HERO SECTION ═════ */}
      <section className="dsa-hero">
        <div
          className="dsa-hero__bg"
          style={currentLesson?.image ? { backgroundImage: `url(${currentLesson.image})` } : {}}
        />
        <div className="container dsa-hero__content">
          <Link
            to="/dbms"
            className="detail-back"
            style={{
              marginBottom: 'var(--space-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#fff',
              textShadow: '1px 1px 0 #000'
            }}
          >
            <ArrowLeft01Icon size={16} /> Back to DBMS
          </Link>
          <h1 className="dsa-hero__title">{currentLesson?.title}</h1>
          <p className="dsa-hero__desc">{currentLesson?.description}</p>
        </div>
      </section>

      {/* ═════ SEARCH + SUBTOPIC CARDS ═════ */}
      <section className="container" style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div className="dsa-search">
          <input
            className="input"
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {subtopicsLoading && <Loader text="LOADING TOPICS..." />}

        {!subtopicsLoading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
            {search ? 'No topics match your search.' : 'No topics available yet.'}
          </p>
        )}

        {!subtopicsLoading && (
          <div className="listing-grid">
            {filtered.map((subtopic, i) => (
              <motion.div
                key={subtopic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link to={`/dbms/${lessonSlug}/${subtopic.slug}`} className="dsa-lesson-card">
                  {subtopic.image && (
                    <div className="dsa-lesson-card__img">
                      <img src={subtopic.image} alt={subtopic.title} />
                    </div>
                  )}
                  <div className="dsa-lesson-card__body">
                    <h3 className="dsa-lesson-card__title">{subtopic.title}</h3>
                    <p className="dsa-lesson-card__desc">{subtopic.description}</p>
                    <div className="dsa-lesson-card__footer">
                      <span className="dsa-lesson-card__arrow">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
