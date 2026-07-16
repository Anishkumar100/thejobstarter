import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useDsaStore } from '../stores/useDsaStore.js';
import { useMetaStore } from '../stores/useMetaStore.js';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';

export default function DsaList() {
  const { lessons, lessonsLoading, lessonsError, fetchLessons } = useDsaStore();
  const { categories, fetchAllMeta } = useMetaStore();
  const [search, setSearch] = useState('');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => { fetchLessons(); }, []);

  /* Fetch DSA categories from backend */
  useEffect(() => {
    fetchAllMeta();
  }, []);

  /* Fetch DSA hero image from homepage topic with category badge "DSA" */
  useEffect(() => {
    apiRequest('/topics')
      .then(res => {
        const dsaTopic = (res.data || []).find(t => t.category === 'DSA');
        if (dsaTopic?.image) setHeroImage(dsaTopic.image);
      })
      .catch(err => console.error('[DSA] Topics fetch failed:', err.message));
  }, []);

  /* Filter lessons by search */
  const filtered = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase();
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    );
  }, [lessons, search]);

  /* Group by category */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(l => {
      if (!map[l.category]) map[l.category] = [];
      map[l.category].push(l);
    });
    return categories
      .filter(c => map[c.value])
      .map(c => ({ value: c.value, label: c.label, lessons: map[c.value] }));
  }, [filtered]);

  return (
    <div>
      <Helmet>
        <title>DSA — TheJobStarter</title>
        <meta name="description" content="Master Data Structures & Algorithms for placement interviews. Curated problems with detailed solutions." />
      </Helmet>

      {/* ═════ HERO SECTION ═════ */}
      <section className="dsa-hero">
        <div
          className="dsa-hero__bg"
          style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="container dsa-hero__content">
          <h1 className="dsa-hero__title">Data Structures & Algorithms</h1>
          <p className="dsa-hero__desc">
            Master the core of technical interviews. From arrays to graphs,
            recursion to DP — every topic broken down into structured lessons
            with curated problems and detailed solutions.
          </p>
          <div className="dsa-hero__actions">
            <Link to="/qa" className="btn btn--primary">Ask in Community</Link>
            <Link to="/users" className="btn">Explore Community</Link>
          </div>
        </div>
      </section>

      {/* ═════ SEARCH + LESSON CARDS ═════ */}
      <section className="container dsa-content">
        <div className="dsa-search-wrapper">
          <div className="dsa-search">
            <input
              className="input"
              type="text"
              placeholder="Search lessons..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {lessonsLoading && <Loader text="LOADING LESSONS..." />}
        {lessonsError && <div className="error-text">{lessonsError}</div>}

        {!lessonsLoading && !lessonsError && grouped.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
            {search ? 'No lessons match your search.' : 'No lessons available yet.'}
          </p>
        )}

        {!lessonsLoading && !lessonsError && grouped.map(section => (
          <section key={section.value} className="category-section mb-xl">
            <h2 className="category-heading">{section.label}</h2>
            <div className="listing-grid dsa-card-wrapper">
              {section.lessons.map((lesson, i) => (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link to={`/dsa/${lesson.slug}`} className="dsa-lesson-card">
                  <div className="dsa-lesson-card__img">
                    <img src={lesson.image || `https://picsum.photos/seed/${lesson.slug}/400/200`} alt={lesson.title} />
                  </div>
                  <div className="dsa-lesson-card__body">
                    <h3 className="dsa-lesson-card__title">{lesson.title}</h3>
                    <p className="dsa-lesson-card__desc">{lesson.description}</p>
                    <div className="dsa-lesson-card__footer">
                      <span>{lesson.problemCount} problems</span>
                      <span className="dsa-lesson-card__arrow">→</span>
                    </div>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}
