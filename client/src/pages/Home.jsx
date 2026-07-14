import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useDsaStore } from '../stores/useDsaStore.js';
import Badge from '../components/ui/Badge.jsx';
import { apiRequest } from '../api/client.js';
import WhyTheseThree from '../components/home/WhyTheseThree.jsx';
import WhyTheJobStarter from '../components/home/WhyTheJobStart.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';
import Reviews from '../components/home/Reviews.jsx';
import JoinCommunityCta from '../components/home/JoinCommunityCta.jsx';

export default function Home() {
  const { problems, fetchProblems } = useDsaStore();
  const [videoError, setVideoError] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const handleVideoError = useCallback(() => setVideoError(true), []);

  useEffect(() => { fetchProblems(); }, []);

  /* WhyTheseThree section data from SiteConfig */
  const [whySectionData, setWhySectionData] = useState(null);

  /* WhyTheJobStarter section data from SiteConfig */
  const [whyTheJobStarterData, setWhyTheJobStarterData] = useState(null);

  /* HowItWorks section data from SiteConfig */
  const [howItWorksData, setHowItWorksData] = useState(null);

  /* Fetch live stats + why section data from the public endpoint */
  useEffect(() => {
    console.log('[HOME] Fetching live stats...');
    apiRequest('/site-config/public')
      .then(res => {
        console.log('[HOME] Stats fetched:', res.data);
        setLiveStats(res.data);
        if (res.data?.homepageWhySection) {
          console.log('[HOME] Why section data found');
          setWhySectionData(res.data.homepageWhySection);
        }
        if (res.data?.homepageWhyTheJobStarter) {
          console.log('[HOME] WhyTheJobStarter section data found');
          setWhyTheJobStarterData(res.data.homepageWhyTheJobStarter);
        }
        if (res.data?.homepageHowItWorks) {
          console.log('[HOME] HowItWorks section data found');
          setHowItWorksData(res.data.homepageHowItWorks);
        }
      })
      .catch(err => {
        console.error('[HOME] Stats fetch failed:', err.message);
      });
  }, []);

  const [topics, setTopics] = useState([]);

  /* Fetch topics from API */
  useEffect(() => {
    console.log('[HOME] Fetching topics...');
    apiRequest('/topics')
      .then(res => {
        console.log('[HOME] Topics fetched:', res.data?.length);
        if (res.data && res.data.length > 0) setTopics(res.data);
      })
      .catch(err => {
        console.error('[HOME] Topics fetch failed:', err.message);
      });
  }, []);

  const featured = problems.slice(0, 6);

  const stats = liveStats?.homepageStats ? [
    { number: liveStats.homepageStats.problems, label: 'Problems', to: '/dsa' },
    { number: liveStats.homepageStats.articles, label: 'Articles', to: '/dbms' },
    { number: liveStats.homepageStats.users, label: 'Users', to: '/users' },
    { number: liveStats.homepageStats.questions, label: 'Questions', to: '/qa' }
  ] : [];

  return (
    <div>
      <Helmet>
        <title>TheJobStarter — Master DSA, DBMS & OS for Placements</title>
        <meta name="description" content="Master DSA, Databases and Operating Systems for placement interviews. Curated problems, in-depth articles, community Q&A." />
      </Helmet>

      <motion.section
        className="home-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!videoError ? (
          <video
            className="hero-bg-video"
            src="/hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            onError={handleVideoError}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="hero-bg-placeholder" />
        )}
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1 className="home-hero__title">
            Master Placements.<br />
            Crack the Code.<br />
            Land Your Dream Job.
          </h1>
          <p className="home-hero__subtitle">
            180+ curated DSA problems, in-depth DBMS & OS articles, and a
            thriving community — all in one brutalist package.
          </p>
          <div className="home-hero__actions">
            <Link to="/dsa" className="btn btn--primary">Browse DSA</Link>
            <Link to="/qa" className="btn">Join Community</Link>
          </div>
        </div>
      </motion.section>

      {/* ═════ LIVE STATS BAR ═════ */}
      {liveStats && (
        <section className="container" style={{ marginBottom: 'var(--space-2xl)' }}>
          <motion.div
            className="home-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {stats.map((stat, i) => (
              <Link key={stat.label} to={stat.to} className="stat-card">
                <div className="stat-card__number">
                  {stat.number.toLocaleString()}
                </div>
                <div className="stat-card__label">{stat.label}</div>
                <div className="stat-card__arrow">→</div>
              </Link>
            ))}
          </motion.div>
        </section>
      )}

      {/* ═════ TOPICS SHOWCASE — STICKY STACK ═════ */}
      <section className="home-topics">
        <div className="home-topics__header">
          <div className="container">
            <p className="home-topics__supertitle">MASTER EVERY DOMAIN</p>
            <h2 className="home-topics__title">Three Pillars.<br />One Mission.</h2>
          </div>
        </div>
        <div className="home-topics__scroll">
          {topics.map((topic, i) => (
            <Link
              key={topic._id || i}
              to={topic.link}
              className="home-topics__card"
              style={{ '--accent-color': topic.accentColor || '#e11d48' }}
            >
              <div
                className="home-topics__card-bg"
                style={topic.image ? { backgroundImage: `url(${topic.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              />
              <div className="home-topics__card-accent" />
              <div className="home-topics__card-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="home-topics__card-body">
                {topic.category && <div className="home-topics__card-category">{topic.category}</div>}
                <h3 className="home-topics__card-title">{topic.title}</h3>
                <p className="home-topics__card-desc">{topic.description}</p>
                <span className="home-topics__card-cta">
                  {topic.cta || 'EXPLORE'} <span className="home-topics__card-arrow">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════ WHY YOU NEED DSA, DBMS & OS ═════ */}
      <div className="container">
        <WhyTheseThree sectionData={whySectionData} />
      </div>

      {/* ═════ WHY THEJOBSTARTER IS BETTER ═════ */}
      <WhyTheJobStarter sectionData={whyTheJobStarterData} />

      {/* ═════ HOW IT WORKS — STUDENT JOURNEY ═════ */}
      <HowItWorks sectionData={howItWorksData} />

   {/* ═════ JOIN COMMUNITY CTA ═════ */}
      <JoinCommunityCta />
      
      {/* ═════ RAW REVIEWS ═════ */}
      <Reviews />

   

   
    </div>
  );
}
