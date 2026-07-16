import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import { useToastStore } from '../stores/useToastStore.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/**
 * AdminAboutPage — Full-page editor for the /about page content
 * Route: /admin/about-page
 * Manages: hero, principles (3), philosophy (4), manifesto, cta
 * All stored in SiteConfig.aboutPage as a Mixed document.
 */

/* ── Default values matching About.jsx constants ── */
const DEFAULT_ABOUT = {
  hero: {
    subtitle: 'THEJOBSTARTER / FIELD NOTE 001',
    title: 'STOP\nPREPARING\nTO PREPARE.',
    description:
      'TheJobStarter is a focused operating system for placement preparation. Learn the foundations. Train under pressure. Build visible proof that you can solve difficult problems.',
  },
  principles: [
    {
      id: '01',
      label: 'Focus Over Noise',
      title: 'LEARN WHAT\nACTUALLY MATTERS.',
      body: 'Every section is built around the concepts that repeatedly shape technical interviews: problem solving, database thinking, operating-system fundamentals, and clear communication.',
      accent: '#e11d48',
      route: '/dsa',
      action: 'ENTER DSA',
    },
    {
      id: '02',
      label: 'Practice With Intent',
      title: 'REPETITION\nBUILDS INSTINCT.',
      body: 'Reading is only the start. Confidence comes from recognising patterns, making mistakes, reviewing them, and solving the next problem with more clarity.',
      accent: '#0066ff',
      route: '/dbms',
      action: 'EXPLORE DBMS',
    },
    {
      id: '03',
      label: 'Progress Together',
      title: 'QUESTIONS ARE\nPART OF THE WORK.',
      body: 'Ask better questions. Compare approaches. Explain what you learned. Growth moves faster when your effort connects with a community moving in the same direction.',
      accent: '#ff4f00',
      route: '/qa',
      action: 'OPEN Q&A',
    },
  ],
  philosophy: [
    {
      id: '01',
      title: 'BUILD. BREAK. REBUILD.',
      body: 'We are builders first. The fastest path to understanding is to create something, push it until it fails, inspect why it failed, and make it stronger.',
    },
    {
      id: '02',
      title: 'CLARITY BEATS HYPE.',
      body: 'Students do not need louder promises. They need a clearer path, useful material, practical direction, and the confidence to face difficult questions.',
    },
    {
      id: '03',
      title: 'THE WORK MUST SHOW.',
      body: 'A strong career is not built in one night. It is built through small wins: one solved problem, one understood concept, one better explanation at a time.',
    },
    {
      id: '04',
      title: 'START BEFORE YOU FEEL READY.',
      body: 'Nobody begins fully prepared. The difference is choosing to begin, staying consistent when progress feels slow, and returning tomorrow with more intent.',
    },
  ],
  manifesto: {
    quote:
      'TALENT GETS\nATTENTION.\nWORK GETS RESULTS.',
    description:
      'You do not need to know everything today. You need to return tomorrow with one more solved problem, one clearer concept, and one stronger attempt than yesterday.',
    watermark: 'WORK',
  },
  cta: {
    title: 'STOP WAITING\nFOR THE PERFECT\nMOMENT.',
    description:
      'Pick a starting point. Stay with it. Build proof of your growth one focused session at a time.',
    watermark: 'GO',
  },
};

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* Entire about page data object */
  const [aboutData, setAboutData] = useState(structuredClone(DEFAULT_ABOUT));

  /* ── Load existing config ── */
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    apiRequest('/site-config/public')
      .then((res) => {
        const data = res.data || {};
        const about = data.aboutPage;
        if (about && typeof about === 'object' && Object.keys(about).length > 0) {
          /* Merge so missing fields fall back to defaults */
          setAboutData(mergeDeep(structuredClone(DEFAULT_ABOUT), about));
        } else {
          setAboutData(structuredClone(DEFAULT_ABOUT));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[ADMIN] Failed to load About Page config:', err.message);
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  /* Deep merge helper — target gets source values where source has defined ones */
  function mergeDeep(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = mergeDeep(target[key] || {}, source[key]);
      } else if (Array.isArray(source[key])) {
        output[key] = source[key].map((item, i) => {
          if (item && typeof item === 'object' && target[key]?.[i]) {
            return { ...target[key][i], ...item };
          }
          return item;
        });
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  /* ── Helpers to update nested fields ── */
  const setHero = (field, value) =>
    setAboutData((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));

  const setPrinciple = (index, field, value) =>
    setAboutData((prev) => {
      const principles = [...prev.principles];
      principles[index] = { ...principles[index], [field]: value };
      return { ...prev, principles };
    });

  const setPhilosophy = (index, field, value) =>
    setAboutData((prev) => {
      const philosophy = [...prev.philosophy];
      philosophy[index] = { ...philosophy[index], [field]: value };
      return { ...prev, philosophy };
    });

  const setManifesto = (field, value) =>
    setAboutData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, [field]: value } }));

  const setCta = (field, value) =>
    setAboutData((prev) => ({ ...prev, cta: { ...prev.cta, [field]: value } }));

  /* ── Save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await apiRequest('/site-config/about-page', {
        method: 'PUT',
        body: JSON.stringify({ aboutPage: aboutData }),
      });
      useToastStore.getState().success('About page content saved successfully!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[ADMIN] Error saving About Page:', err.message);
      setSaveError(err.message);
      useToastStore.getState().error(err.message || 'Failed to save about page config');
    }
    setSaving(false);
  };

  if (loading) return <Loader text="LOADING ABOUT PAGE CONFIG..." />;

  if (fetchError) {
    return (
      <div>
        <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>
          Failed to load config: {fetchError}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>About Page — Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">About Page Editor</h1>
        <span className="listing-header__count">
          Hero &middot; Principles &middot; Philosophy &middot; Manifesto &middot; CTA
        </span>
      </div>

      {saved && (
        <div className="success-text" style={{ marginBottom: 'var(--space-md)' }}>
          About page config saved!
        </div>
      )}
      {saveError && (
        <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>
          Save failed: {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="admin-form">
        {/* ── HERO ── */}
        <fieldset
          style={{
            border: '3px solid var(--border-color)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <legend
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Hero Section
          </legend>

          <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
            <label>Subtitle / Label</label>
            <input
              className="input"
              value={aboutData.hero.subtitle}
              onChange={(e) => setHero('subtitle', e.target.value)}
              placeholder="THEJOBSTARTER / FIELD NOTE 001"
            />
          </div>

          <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
            <label>Hero Title <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(use \n for line breaks)</span></label>
            <textarea
              className="input"
              rows={4}
              value={aboutData.hero.title}
              onChange={(e) => setHero('title', e.target.value)}
              placeholder="STOP\nPREPARING\nTO PREPARE."
            />
          </div>

          <div className="input-group">
            <label>Hero Description</label>
            <textarea
              className="input"
              rows={4}
              value={aboutData.hero.description}
              onChange={(e) => setHero('description', e.target.value)}
              placeholder="TheJobStarter is a focused operating system..."
            />
          </div>
        </fieldset>

        {/* ── PRINCIPLES ── */}
        <fieldset
          style={{
            border: '3px solid var(--border-color)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <legend
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Principles (3 cards)
          </legend>

          {aboutData.principles.map((principle, index) => (
            <div
              key={principle.id}
              style={{
                border: '2px solid var(--border-color)',
                padding: 'var(--space-sm)',
                marginBottom: 'var(--space-md)',
                background: 'var(--bg-tertiary)',
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Principle {principle.id}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                <div className="input-group">
                  <label>Label</label>
                  <input
                    className="input"
                    value={principle.label}
                    onChange={(e) => setPrinciple(index, 'label', e.target.value)}
                    placeholder="Focus Over Noise"
                  />
                </div>
                <div className="input-group">
                  <label>Accent Color</label>
                  <input
                    className="input"
                    value={principle.accent}
                    onChange={(e) => setPrinciple(index, 'accent', e.target.value)}
                    placeholder="#e11d48"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <div className="input-group">
                  <label>Route</label>
                  <input
                    className="input"
                    value={principle.route}
                    onChange={(e) => setPrinciple(index, 'route', e.target.value)}
                    placeholder="/dsa"
                  />
                </div>
                <div className="input-group">
                  <label>Action Label</label>
                  <input
                    className="input"
                    value={principle.action}
                    onChange={(e) => setPrinciple(index, 'action', e.target.value)}
                    placeholder="ENTER DSA"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
                <label>Title <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(use \n for line breaks)</span></label>
                <textarea
                  className="input"
                  rows={2}
                  value={principle.title}
                  onChange={(e) => setPrinciple(index, 'title', e.target.value)}
                  placeholder="LEARN WHAT\nACTUALLY MATTERS."
                />
              </div>

              <div className="input-group">
                <label>Body</label>
                <textarea
                  className="input"
                  rows={3}
                  value={principle.body}
                  onChange={(e) => setPrinciple(index, 'body', e.target.value)}
                  placeholder="Description text..."
                />
              </div>
            </div>
          ))}
        </fieldset>

        {/* ── PHILOSOPHY ── */}
        <fieldset
          style={{
            border: '3px solid var(--border-color)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <legend
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Philosophy (4 entries)
          </legend>

          {aboutData.philosophy.map((entry, index) => (
            <div
              key={entry.id}
              style={{
                border: '2px solid var(--border-color)',
                padding: 'var(--space-sm)',
                marginBottom: 'var(--space-md)',
                background: 'var(--bg-tertiary)',
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Philosophy {entry.id}
              </p>

              <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
                <label>Title</label>
                <input
                  className="input"
                  value={entry.title}
                  onChange={(e) => setPhilosophy(index, 'title', e.target.value)}
                  placeholder="BUILD. BREAK. REBUILD."
                />
              </div>

              <div className="input-group">
                <label>Body</label>
                <textarea
                  className="input"
                  rows={3}
                  value={entry.body}
                  onChange={(e) => setPhilosophy(index, 'body', e.target.value)}
                  placeholder="We are builders first..."
                />
              </div>
            </div>
          ))}
        </fieldset>

        {/* ── MANIFESTO ── */}
        <fieldset
          style={{
            border: '3px solid var(--border-color)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <legend
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Manifesto Section
          </legend>

          <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
            <label>Quote <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(use \n for line breaks)</span></label>
            <textarea
              className="input"
              rows={4}
              value={aboutData.manifesto.quote}
              onChange={(e) => setManifesto('quote', e.target.value)}
              placeholder="TALENT GETS\nATTENTION.\nWORK GETS RESULTS."
            />
          </div>

          <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
            <label>Description</label>
            <textarea
              className="input"
              rows={3}
              value={aboutData.manifesto.description}
              onChange={(e) => setManifesto('description', e.target.value)}
              placeholder="You do not need to know everything today..."
            />
          </div>

          <div className="input-group">
            <label>Watermark Text</label>
            <input
              className="input"
              value={aboutData.manifesto.watermark}
              onChange={(e) => setManifesto('watermark', e.target.value)}
              placeholder="WORK"
            />
          </div>
        </fieldset>

        {/* ── CTA ── */}
        <fieldset
          style={{
            border: '3px solid var(--border-color)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <legend
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Call to Action Section
          </legend>

          <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
            <label>Title <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(use \n for line breaks)</span></label>
            <textarea
              className="input"
              rows={3}
              value={aboutData.cta.title}
              onChange={(e) => setCta('title', e.target.value)}
              placeholder="STOP WAITING\nFOR THE PERFECT\nMOMENT."
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              className="input"
              rows={3}
              value={aboutData.cta.description}
              onChange={(e) => setCta('description', e.target.value)}
              placeholder="Pick a starting point..."
            />
          </div>

          <div className="input-group">
            <label>Watermark Text <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(large background word)</span></label>
            <input
              className="input"
              value={aboutData.cta.watermark}
              onChange={(e) => setCta('watermark', e.target.value)}
              placeholder="GO"
            />
          </div>
        </fieldset>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Saving...' : 'Save About Page Configuration'}
        </Button>
      </form>
    </div>
  );
}
