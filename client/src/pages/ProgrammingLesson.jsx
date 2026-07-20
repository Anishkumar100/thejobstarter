import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import Loader from '../components/ui/Loader.jsx';
import { ArrowLeft01Icon } from 'hugeicons-react';

export default function ProgrammingLesson() {
  const { lessonSlug } = useParams();
  const { lessons, fetchLessons, subtopics, loading, fetchSubtopics } = useProgrammingStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLessons();
    fetchSubtopics(lessonSlug);
  }, [lessonSlug]);

  const filtered = search.trim()
    ? subtopics.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : subtopics;

  const lesson = lessons.find(l => l.slug === lessonSlug);

  if (!lesson && !loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Link to="/programming" className="detail-back"><ArrowLeft01Icon size={16} /> Back to Programming</Link>
        <p style={{ textAlign: 'center', padding: '2rem' }}>Lesson not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{lesson?.title || 'Lesson'} — Programming — TheJobStarter</title>
        <meta name="description" content={lesson?.description} />
      </Helmet>

      <section className="dsa-hero">
        <div
          className="dsa-hero__bg"
          style={lesson?.image ? { backgroundImage: `url(${lesson.image})` } : {}}
        />
        <div className="container dsa-hero__content">
          <Link to="/programming" className="detail-back" style={{ marginBottom: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fff', textShadow: '1px 1px 0 #000' }}>
            <ArrowLeft01Icon size={16} /> Back to Programming
          </Link>
          <h1 className="dsa-hero__title">{lesson?.title}</h1>
          <p className="dsa-hero__desc">{lesson?.description}</p>
          <div className="dsa-hero__actions">
            <Link to="/qa" className="btn btn--primary">Ask in Community</Link>
            <Link to="/users" className="btn">Explore Community</Link>
          </div>
        </div>
      </section>

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

        {loading && <Loader text="LOADING TOPICS..." />}

        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
            {search ? 'No topics match your search.' : 'No topics available yet.'}
          </p>
        )}

        {!loading && (
          <div className="listing-grid">
            {filtered.map((subtopic, i) => (
              <motion.div
                key={subtopic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link to={`/programming/${lessonSlug}/${subtopic.slug}`} className="dsa-lesson-card">
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
