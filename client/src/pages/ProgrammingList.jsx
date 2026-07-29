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
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    return Object.entries(map)
      .filter(([value]) => !selectedCategory || value === selectedCategory)
      .map(([value, items]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        lessons: items
      }));
  }, [filtered, selectedCategory]);

  /* Category filter pills */
  const categoryPills = useMemo(() => {
    const seen = {};
    lessons.forEach(l => { const cat = l.category || 'core'; if (!seen[cat]) seen[cat] = true; });
    return Object.entries(seen).map(([value]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1)
    }));
  }, [lessons]);

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

        {/* Category filter pills */}
        {categoryPills.length > 1 && (
          <div style={{
            display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '6px 16px', cursor: 'pointer',
                border: '3px solid #000',
                background: !selectedCategory ? '#000' : 'var(--bg-surface)',
                color: !selectedCategory ? '#fff' : 'var(--text-primary)',
                transition: 'transform 0.12s'
              }}
            >All</button>
            {categoryPills.map(c => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '6px 16px', cursor: 'pointer',
                  border: '3px solid #000',
                  background: selectedCategory === c.value ? '#000' : 'var(--bg-surface)',
                  color: selectedCategory === c.value ? '#fff' : 'var(--text-primary)',
                  transition: 'transform 0.12s'
                }}
              >{c.label}</button>
            ))}
          </div>
        )}

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
                  {lesson.locked ? (
                    <div className="dsa-lesson-card dsa-lesson-card--locked">
                      <div className="dsa-lesson-card__lock dsa-lesson-card__lock--visible">
                        <div className="dsa-lesson-card__lock-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                        <span className="dsa-lesson-card__lock-text">Premium Lesson</span>
                        <Link to="/pricing" className="dsa-lesson-card__lock-cta">
                          Subscribe
                        </Link>
                      </div>
                      <div className="dsa-lesson-card__lock-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
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
                    </div>
                  ) : (
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
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}
