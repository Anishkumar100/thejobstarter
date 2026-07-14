import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useOsStore } from '../stores/useOsStore.js';
import { useOsMetaStore } from '../stores/useOsMetaStore.js';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';

/*
 * OsList — landing page for OS subject area.
 * Shows all lessons grouped by category (from OS meta).
 */
export default function OsList() {
  const { lessons, lessonsLoading, lessonsError, fetchLessons } = useOsStore();
  const { categories, fetchAllMeta } = useOsMetaStore();
  const [search, setSearch] = useState('');
  const [heroImage, setHeroImage] = useState('');

  /* Fetch all OS lessons on mount */
  useEffect(() => {
    console.log('[OS] Fetching lessons on mount...');
    fetchLessons();
  }, []);

  /* Fetch OS categories from backend */
  useEffect(() => {
    fetchAllMeta();
  }, []);

  /* Fetch hero image from homepage topic with category badge "OS" */
  useEffect(() => {
    console.log('[OS] Fetching hero image from topics...');
    apiRequest('/topics')
      .then(res => {
        const osTopic = (res.data || []).find(t => t.category === 'OS');
        if (osTopic?.image) {
          console.log('[OS] Hero image found from OS topic');
          setHeroImage(osTopic.image);
        }
      })
      .catch(err => console.error('[OS] Topics fetch failed:', err.message));
  }, []);

  /* Debug: log state */
  console.log('[OS-DEBUG] lessons:', lessons?.length, 'categories:', categories?.length, 'lessonsLoading:', lessonsLoading, 'lessonsError:', lessonsError);
  if (lessons?.length > 0) console.log('[OS-DEBUG] lesson categories:', lessons.map(l => l.category));
  if (categories?.length > 0) console.log('[OS-DEBUG] category values:', categories.map(c => c.value));

  /* Filter lessons by search query */
  const filtered = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase();
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    );
  }, [lessons, search]);

  /* Group filtered lessons by category */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(l => {
      if (!map[l.category]) map[l.category] = [];
      map[l.category].push(l);
    });
    console.log('[OS-DEBUG] category map keys:', Object.keys(map));
    const result = categories
      .filter(c => {
        const match = map[c.value];
        if (!match) console.log('[OS-DEBUG] category not matched:', c.value, 'key in map:', c.value in map);
        return match;
      })
      .map(c => ({ value: c.value, label: c.label, lessons: map[c.value] }));
    console.log('[OS-DEBUG] grouped sections:', result.length);
    return result;
  }, [filtered, categories]);

  return (
    <div>
      <Helmet>
        <title>OS — TheJobStarter</title>
        <meta name="description" content="Master Operating Systems for placement interviews. Curated topics with detailed explanations." />
      </Helmet>

      {/* ═════ HERO SECTION ═════ */}
      <section className="dsa-hero">
        {heroImage && (
          <div
            className="dsa-hero__bg"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className="container dsa-hero__content">
          <h1 className="dsa-hero__title">Operating Systems</h1>
          <p className="dsa-hero__desc">
            Master the fundamentals of Operating Systems. From Process Management to Memory
            Management, File Systems to deadlocks — every topic broken down into structured
            lessons with curated conceptual problems.
          </p>
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
                  <Link to={`/os/${lesson.slug}`} className="dsa-lesson-card">
                    <div className="dsa-lesson-card__img">
                      <img
                        src={lesson.image || `https://picsum.photos/seed/${lesson.slug}/400/200`}
                        alt={lesson.title}
                      />
                    </div>
                    <div className="dsa-lesson-card__body">
                      <h3 className="dsa-lesson-card__title">{lesson.title}</h3>
                      <p className="dsa-lesson-card__desc">{lesson.description}</p>
                      <div className="dsa-lesson-card__footer">
                        <span>{lesson.problemCount || 0} problems</span>
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
