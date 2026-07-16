import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/**
 * AdminWhySection — Edit the "Why DSA, DBMS & OS" homepage section text content.
 * Route: /admin/why-section
 */
export default function AdminWhySection() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* ─── Form state — initialized with real defaults so the form shows content even without API data ─── */
  const [header, setHeader] = useState({ tag: 'Why You Need', title: 'DSA, DBMS & OS', subtitle: 'The three subjects that decide your placement outcome.' });

  const [dsaCard, setDsaCard] = useState({
    tag: 'DSA \u2014 GATEKEEPER', number: 70,
    description: 'Companies screen candidates purely on DSA before your resume reaches a human recruiter.',
    quoteText: 'The gatekeeper of nearly every software engineering interview.',
    quoteCite: 'OnJob.io, 2026',
    stats: [{ number: '180', label: 'Problems' }, { number: '12', label: 'Patterns' }, { number: '6', label: 'Difficulty bands' }],
    ctaLabel: 'Start DSA \u2014 180 Problems', ctaLink: '/dsa'
  });

  const [confessionCard, setConfessionCard] = useState({
    quote: 'I spent 6 months learning React.\nGot to the interview.\nThey asked me to reverse a linked list.',
    attribution: 'Every placement student, ever'
  });

  const [dbmsCard, setDbmsCard] = useState({
    tag: 'DBMS',
    description: 'Second most-asked subject after DSA in every tech placement cycle.',
    quoteText: 'Second most important subject after DSA.',
    quoteCite: 'GeeksforGeeks',
    stats: ['45+ Articles', '10 Core Topics'],
    ctaLabel: 'Explore DBMS \u2014 45+ Articles', ctaLink: '/dbms'
  });

  const [osCard, setOsCard] = useState({
    tag: 'Operating Systems', subTag: 'MOST IGNORED',
    headlineLine1: 'One OS round', headlineLine2: 'can make or break', headlineLine3: 'your shortlisting.',
    body: "Service companies test OS concepts heavily. Product companies are now joining in. Most candidates skip it entirely \u2014 that's your edge.",
    quoteText: 'CS fundamentals are tested heavily at service companies and increasingly at product companies too.',
    quoteCite: "Let's Code, 2026",
    ctaLabel: 'Explore OS \u2014 40+ Articles', ctaLink: '/os'
  });

  const [statsFooter, setStatsFooter] = useState([
    { stat: '93%', text: 'of job postings required data structures knowledge', cite: 'hackajob, 2025' },
    { stat: '80\u201390%', text: 'of candidates fail technical coding rounds', cite: 'Karat, 2026' },
    { stat: 'Big 3', text: 'Algorithms \u00b7 SQL \u00b7 Data Structures \u2014 top 3 by volume', cite: 'HackerEarth CEO, 2026' }
  ]);

  /* Load existing config on mount */
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    apiRequest('/site-config/public')
      .then(res => {
        const section = res.data?.homepageWhySection;
        if (!section) {
          setLoading(false);
          return;
        }
        if (section.header) setHeader(section.header);
        if (section.dsaCard) setDsaCard(section.dsaCard);
        if (section.confessionCard) setConfessionCard(section.confessionCard);
        if (section.dbmsCard) setDbmsCard(section.dbmsCard);
        if (section.osCard) setOsCard(section.osCard);
        if (section.statsFooter) setStatsFooter(section.statsFooter);
        setLoading(false);
      })
      .catch(err => {
        console.error('[ADMIN] Failed to load WhyTheseThree section:', err.message);
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  /* Save the entire section */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await apiRequest('/site-config/why-section', {
        method: 'PUT',
        body: JSON.stringify({
          homepageWhySection: { header, dsaCard, confessionCard, dbmsCard, osCard, statsFooter }
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[ADMIN] Error saving WhyTheseThree section:', err.message);
      setSaveError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <Loader text="LOADING WHY SECTION..." />;

  if (fetchError) {
    return (
      <div>
        <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>
          Failed to load: {fetchError}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Why Section — Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Why DSA, DBMS &amp; OS — Content Editor</h1>
        <span className="listing-header__count">Edit all text content for the homepage "Why These Three" section</span>
      </div>

      {saved && <div className="success-text" style={{ marginBottom: 'var(--space-md)' }}>Section content saved!</div>}
      {saveError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Save failed: {saveError}</div>}

      <form onSubmit={handleSave} className="admin-form">

        {/* ═══ HEADER ═══ */}
        <fieldset style={{ border: '3px solid var(--border-color)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Header</legend>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Tag label</label>
              <input className="input" value={header.tag} onChange={e => setHeader(h => ({ ...h, tag: e.target.value }))} placeholder="Why You Need" />
            </div>
            <div className="input-group">
              <label>Subtitle</label>
              <input className="input" value={header.subtitle} onChange={e => setHeader(h => ({ ...h, subtitle: e.target.value }))} placeholder="The three subjects that decide your placement outcome." />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Title</label>
              <input className="input" value={header.title} onChange={e => setHeader(h => ({ ...h, title: e.target.value }))} placeholder="DSA, DBMS & OS" />
            </div>
          </div>
        </fieldset>

        {/* ═══ DSA CARD ═══ */}
        <fieldset style={{ border: '3px solid #e11d48', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e11d48' }}>DSA Card</legend>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Tag</label>
              <input className="input" value={dsaCard.tag} onChange={e => setDsaCard(d => ({ ...d, tag: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Big Number</label>
              <input className="input" type="number" value={dsaCard.number} onChange={e => setDsaCard(d => ({ ...d, number: Number(e.target.value) }))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea className="input" rows={2} value={dsaCard.description} onChange={e => setDsaCard(d => ({ ...d, description: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quote text</label>
              <input className="input" value={dsaCard.quoteText} onChange={e => setDsaCard(d => ({ ...d, quoteText: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quote cite</label>
              <input className="input" value={dsaCard.quoteCite} onChange={e => setDsaCard(d => ({ ...d, quoteCite: e.target.value }))} />
            </div>
            <div className="input-group input-group" style={{ gridColumn: 'span 2' }}>
              <label>Stats (3 items)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                {dsaCard.stats.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <input className="input" style={{ width: 80 }} value={s.number} onChange={e => {
                      const newStats = [...dsaCard.stats];
                      newStats[i] = { ...newStats[i], number: e.target.value };
                      setDsaCard(d => ({ ...d, stats: newStats }));
                    }} placeholder="Number" />
                    <input className="input" value={s.label} onChange={e => {
                      const newStats = [...dsaCard.stats];
                      newStats[i] = { ...newStats[i], label: e.target.value };
                      setDsaCard(d => ({ ...d, stats: newStats }));
                    }} placeholder="Label" />
                  </div>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>CTA label</label>
              <input className="input" value={dsaCard.ctaLabel} onChange={e => setDsaCard(d => ({ ...d, ctaLabel: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>CTA link</label>
              <input className="input" value={dsaCard.ctaLink} onChange={e => setDsaCard(d => ({ ...d, ctaLink: e.target.value }))} />
            </div>
          </div>
        </fieldset>

        {/* ═══ CONFESSION CARD ═══ */}
        <fieldset style={{ border: '3px solid #d97706', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d97706' }}>Confession Card</legend>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Quote text (use \n for line breaks)</label>
              <textarea className="input" rows={3} value={confessionCard.quote} onChange={e => setConfessionCard(c => ({ ...c, quote: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Attribution</label>
              <input className="input" value={confessionCard.attribution} onChange={e => setConfessionCard(c => ({ ...c, attribution: e.target.value }))} />
            </div>
          </div>
        </fieldset>

        {/* ═══ DBMS CARD ═══ */}
        <fieldset style={{ border: '3px solid #0066ff', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0066ff' }}>DBMS Card</legend>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Tag</label>
              <input className="input" value={dbmsCard.tag} onChange={e => setDbmsCard(d => ({ ...d, tag: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea className="input" rows={2} value={dbmsCard.description} onChange={e => setDbmsCard(d => ({ ...d, description: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quote text</label>
              <input className="input" value={dbmsCard.quoteText} onChange={e => setDbmsCard(d => ({ ...d, quoteText: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quote cite</label>
              <input className="input" value={dbmsCard.quoteCite} onChange={e => setDbmsCard(d => ({ ...d, quoteCite: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Stats (comma separated, e.g. "45+ Articles,10 Core Topics")</label>
              <input className="input" value={dbmsCard.stats.join(', ')} onChange={e => setDbmsCard(d => ({ ...d, stats: e.target.value.split(',').map(s => s.trim()) }))} />
            </div>
            <div className="input-group">
              <label>CTA label</label>
              <input className="input" value={dbmsCard.ctaLabel} onChange={e => setDbmsCard(d => ({ ...d, ctaLabel: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>CTA link</label>
              <input className="input" value={dbmsCard.ctaLink} onChange={e => setDbmsCard(d => ({ ...d, ctaLink: e.target.value }))} />
            </div>
          </div>
        </fieldset>

        {/* ═══ OS CARD ═══ */}
        <fieldset style={{ border: '3px solid #ff4f00', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ff4f00' }}>OS Card</legend>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Tag</label>
              <input className="input" value={osCard.tag} onChange={e => setOsCard(o => ({ ...o, tag: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Sub-tag</label>
              <input className="input" value={osCard.subTag} onChange={e => setOsCard(o => ({ ...o, subTag: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Headline line 1</label>
              <input className="input" value={osCard.headlineLine1} onChange={e => setOsCard(o => ({ ...o, headlineLine1: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Headline line 2 (accent)</label>
              <input className="input" value={osCard.headlineLine2} onChange={e => setOsCard(o => ({ ...o, headlineLine2: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Headline line 3</label>
              <input className="input" value={osCard.headlineLine3} onChange={e => setOsCard(o => ({ ...o, headlineLine3: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Body text</label>
              <textarea className="input" rows={2} value={osCard.body} onChange={e => setOsCard(o => ({ ...o, body: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quote text</label>
              <input className="input" value={osCard.quoteText} onChange={e => setOsCard(o => ({ ...o, quoteText: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quote cite</label>
              <input className="input" value={osCard.quoteCite} onChange={e => setOsCard(o => ({ ...o, quoteCite: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>CTA label</label>
              <input className="input" value={osCard.ctaLabel} onChange={e => setOsCard(o => ({ ...o, ctaLabel: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>CTA link</label>
              <input className="input" value={osCard.ctaLink} onChange={e => setOsCard(o => ({ ...o, ctaLink: e.target.value }))} />
            </div>
          </div>
        </fieldset>

        {/* ═══ STATS FOOTER ═══ */}
        <fieldset style={{ border: '3px solid var(--border-color)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stats Footer (3 items)</legend>
          {statsFooter.map((item, i) => (
            <div key={i} style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', border: '2px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                Stat {i + 1}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 'var(--space-sm)' }}>
                <input className="input" value={item.stat} onChange={e => {
                  const newItems = [...statsFooter];
                  newItems[i] = { ...newItems[i], stat: e.target.value };
                  setStatsFooter(newItems);
                }} placeholder="Stat value (e.g. 93%)" />
                <input className="input" value={item.text} onChange={e => {
                  const newItems = [...statsFooter];
                  newItems[i] = { ...newItems[i], text: e.target.value };
                  setStatsFooter(newItems);
                }} placeholder="Description text" />
                <input className="input" value={item.cite} onChange={e => {
                  const newItems = [...statsFooter];
                  newItems[i] = { ...newItems[i], cite: e.target.value };
                  setStatsFooter(newItems);
                }} placeholder="Citation" />
              </div>
            </div>
          ))}
        </fieldset>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Saving...' : 'Save Why Section Content'}
        </Button>
      </form>
    </div>
  );
}
