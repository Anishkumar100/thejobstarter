import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';

export default function ProgrammingList() {
  const { lessons, loading, error, fetchLessons } = useProgrammingStore();
  const [search, setSearch] = useState('');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => { fetchLessons(); }, []);

  /* Fetch hero image from homepage topic with category 'PROG' */
  useEffect(() => {
    apiRequest('/topics')
      .then(res => {
        const progTopic = (res.data || []).find(t => t.category === 'PROG');
        if (progTopic?.image) setHeroImage(progTopic.image);
      })
      .catch(err => console.error('[PROG] Topics fetch failed:', err.message));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase();
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    );
  }, [lessons, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(l => {
      const cat = l.category || 'core';
      if (!map[cat]) map[cat] = [];
      map[cat].push(l);
    });
    return Object.entries(map).map(([value, items]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      lessons: items
    }));
  }, [filtered]);

  return (
    <div>
      <Helmet>
        <title>Programming Concepts — TheJobStarter</title>
        <meta name="description" content="Master Programming Concepts for placement interviews. Curated problems with detailed solutions." />
      </Helmet>

      <section className="dsa-hero">
        <div
          className="dsa-hero__bg"
          style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="container dsa-hero__content">
          <h1 className="dsa-hero__title">Programming Concepts</h1>
          <p className="dsa-hero__desc">
            Master the building blocks of programming. From variables and loops to
            OOP, concurrency, and design patterns — every topic broken down into
            structured lessons with curated problems and detailed solutions.
          </p>
          <div className="dsa-hero__actions">
            <Link to="/qa" className="btn btn--primary">Ask in Community</Link>
            <Link to="/users" className="btn">Explore Community</Link>
          </div>
        </div>
      </section>

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

        {loading && <Loader text="LOADING LESSONS..." />}

        {!loading && !error && grouped.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
            {search ? 'No lessons match your search.' : 'No lessons available yet.'}
          </p>
        )}

        {!loading && grouped.map(section => (
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
                  <Link to={`/programming/${lesson.slug}`} className="dsa-lesson-card">
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
