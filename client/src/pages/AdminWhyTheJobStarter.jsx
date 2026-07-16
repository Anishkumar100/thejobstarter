import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/*
 * AdminWhyTheJobStarter — Edit the "Why TheJobStarter" homepage section content.
 * Route: /admin/why-the-job-starter
 *
 * Manages:
 *   - subtitle
 *   - pillars (8 items: title + body)
 *   - comparison (7 items: feat, ours, gfg, lc, hr)
 */

/* Default data matching the component's hardcoded PILLARS + COMPARISON */
const DEFAULT_DATA = {
  subtitle: 'DSA, DBMS, and OS in one platform. Consistent structure across every subject. Built for how Indian campuses actually hire.',
  pillars: [
    { title: 'Structured Navigation,\nNot One Long Scroll', body: "GFG packs an entire topic \u2014 theory, examples, edge cases, related problems \u2014 into one long article, which is why developers commonly describe it as hard to navigate. We split every subject into Lessons \u2192 Subtopics \u2192 Problems as separate pages, so you focus on one concept at a time instead of endless scrolling." },
    { title: 'One Architecture,\nThree Subjects', body: 'DSA, DBMS, and OS were designed together from day one, sharing the same structure. GeeksforGeeks, LeetCode, and HackerRank each grew around one subject and never rebuilt around a shared model \u2014 their DBMS/OS content, where it exists, doesn\u2019t even navigate like their DSA content does.' },
    { title: 'Four Ways Into\nEvery Topic', body: 'Article, embedded video, downloadable PDF, and optional PPTX \u2014 on every single subtopic. No competitor ships native downloadable slide decks as a platform feature; any PPT tied to their names online is third-party, not theirs.' },
    { title: 'Built to Teach,\nNot Just Judge', body: "Every problem walks through the approach and reasoning before the code. LeetCode hands you a blank editor. HackerRank is built around timed pass/fail assessments for employers. We\u2019re built to teach how to think, not just check if you solved it." },
    { title: 'Q&A Designed\nfor Signal', body: "Moderator approval, accepted answers, and voting are built in from the start \u2014 not a comment section retrofitted later. HackerRank\u2019s own users describe its discussion tabs as leaning toward code-dumping rather than real Q&A." },
    { title: 'Tagged for the Companies\nThat Actually Hire You', body: 'Company tags span global product companies alongside the mass-recruiting service companies that dominate most campus placement drives \u2014 the full spectrum of who\u2019s actually in the room, not just a FAANG-first list built for a different hiring market.' },
    { title: 'One Profile,\nYour Whole Trail', body: "LeetCode and HackerRank profiles are stat trackers. Ours links LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, and CodeForces into a single profile \u2014 built to be the link a recruiter actually clicks, not an internal leaderboard only you see." },
    { title: 'Aptitude &\nReasoning, Coming Soon', body: "DSA, DBMS, and OS are just the start. Aptitude and reasoning \u2014 the fourth pillar of campus placement prep \u2014 is already on the roadmap, built to slot into the exact same Lessons \u2192 Subtopics \u2192 Problems structure as everything else here." }
  ],
  comparison: [
    { feat: 'DBMS Content', ours: 'In-depth articles covering SQL, normalization, transactions, indexing, concurrency control, and query optimization \u2014 placement-focused', gfg: 'Tutorials on database fundamentals and SQL syntax', lc: 'SQL query practice only \u2014 no conceptual DBMS theory track', hr: 'A short skill-quiz on DBMS basics \u2014 no structured lesson track or theory explanations' },
    { feat: 'OS Content', ours: 'Articles covering process management, CPU scheduling, memory management, deadlocks, file systems, and disk scheduling \u2014 placement-focused', gfg: 'Reference pages on operating system concepts and algorithms', lc: 'Not available in platform', hr: 'No dedicated OS track \u2014 appears only inside bundled assessment tests for employers' },
    { feat: 'Code Language Support', ours: 'Python, JavaScript, Java, and C++ \u2014 tabbed switching on every solution, one-click copy, consistent across all problems', gfg: 'Multiple language solutions in community-contributed posts', lc: 'Built-in code editor supporting multiple languages with run and submit', hr: 'Multiple languages supported in its code editor and test environment' },
    { feat: 'Video Walkthroughs', ours: 'Embedded YouTube walkthroughs on key problems \u2014 watch the approach explained while reading the solution, all on the same page', gfg: 'Some articles include embedded video content from external creators', lc: 'Video solutions available for Premium subscribers', hr: 'No embedded conceptual video walkthroughs on problems' },
    { feat: 'Community Q&A', ours: 'Built-in Q&A with tag-based organization, voting, accepted answers, and a moderator approval workflow', gfg: 'Comment sections below articles for discussion', lc: 'Discuss forum with voting, sorting, and topic categories', hr: 'Limited discussion tabs, with users noting they lean toward posting full code rather than structured Q&A' },
    { feat: 'Downloadable Study Material', ours: 'PDF reference on every subtopic, plus optional PPTX slide decks and category-filtered cheatsheets \u2014 all downloadable and tracked', gfg: 'Some cheatsheet/quick-reference PDFs available', lc: 'Not available in platform', hr: 'Not available in platform' },
    { feat: 'User Profiles & Social', ours: 'Custom profiles with bio, college, skills, external platform links (LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, CodeForces), follower system, activity feed, and direct messaging', gfg: 'User profiles with activity history and discussion participation', lc: 'User profiles with solved problems, ranking, and contest history', hr: 'Profiles centered on badges and certifications rather than social/community features' }
  ]
};

export default function AdminWhyTheJobStarter() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* Form state */
  const [subtitle, setSubtitle] = useState(DEFAULT_DATA.subtitle);
  const [pillars, setPillars] = useState(DEFAULT_DATA.pillars.map(p => ({ ...p })));
  const [comparison, setComparison] = useState(DEFAULT_DATA.comparison.map(c => ({ ...c })));

  /* Load existing config on mount */
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    apiRequest('/site-config/public')
      .then(res => {
        const section = res.data?.homepageWhyTheJobStarter;
        if (!section || !section.pillars || !section.comparison) {
          setLoading(false);
          return;
        }
        if (section.subtitle) setSubtitle(section.subtitle);
        if (section.pillars && Array.isArray(section.pillars)) setPillars(section.pillars.map(p => ({ title: p.title || '', body: p.body || '' })));
        if (section.comparison && Array.isArray(section.comparison)) setComparison(section.comparison.map(c => ({ feat: c.feat || '', ours: c.ours || '', gfg: c.gfg || '', lc: c.lc || '', hr: c.hr || '' })));
        setLoading(false);
      })
      .catch(err => {
        console.error('[ADMIN] Failed to load WhyTheJobStarter section:', err.message);
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
      await apiRequest('/site-config/why-the-job-starter', {
        method: 'PUT',
        body: JSON.stringify({
          homepageWhyTheJobStarter: { subtitle, pillars, comparison }
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[ADMIN] Error saving WhyTheJobStarter section:', err.message);
      setSaveError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <Loader text="LOADING WHY THEJOBSTARTER SECTION..." />;

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
        <title>Why TheJobStarter — Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Why TheJobStarter — Content Editor</h1>
        <span className="listing-header__count">Edit all text content for the homepage "Why TheJobStarter" section</span>
      </div>

      {saved && <div className="success-text" style={{ marginBottom: 'var(--space-md)' }}>Section content saved!</div>}
      {saveError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Save failed: {saveError}</div>}

      <form onSubmit={handleSave} className="admin-form">

        {/* ═══ SUBTITLE ═══ */}
        <fieldset style={{ border: '3px solid var(--border-color)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subtitle</legend>
          <div className="input-group">
            <label>Subtitle text</label>
            <input className="input" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="DSA, DBMS, and OS in one platform..." />
          </div>
        </fieldset>

        {/* ═══ PILLARS — 8 CARDS ═══ */}
        <fieldset style={{ border: '3px solid #e11d48', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e11d48' }}>
            Pillar Cards (8 items)
          </legend>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            Each pillar is a feature card displayed in the grid. Use \n for line breaks in titles.
          </p>

          {pillars.map((pillar, i) => (
            <div key={i} style={{
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-md)',
              border: '2px solid var(--border-color)',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                Pillar {i + 1}
              </p>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-sm)' }}>
                <div className="input-group">
                  <label>Title (use \n for line break)</label>
                  <input className="input" value={pillar.title} onChange={e => {
                    const newPillars = [...pillars];
                    newPillars[i] = { ...newPillars[i], title: e.target.value };
                    setPillars(newPillars);
                  }} placeholder="Structured Navigation,\nNot One Long Scroll" />
                </div>
                <div className="input-group">
                  <label>Body text</label>
                  <textarea className="input" rows={4} value={pillar.body} onChange={e => {
                    const newPillars = [...pillars];
                    newPillars[i] = { ...newPillars[i], body: e.target.value };
                    setPillars(newPillars);
                  }} placeholder="Describe this pillar..." />
                </div>
              </div>
            </div>
          ))}
        </fieldset>

        {/* ═══ COMPARISON TABLE — 7 ROWS ═══ */}
        <fieldset style={{ border: '3px solid #0066ff', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0066ff' }}>
            Comparison Table (7 rows)
          </legend>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            Each row compares one feature across TheJobStarter, GeeksforGeeks, LeetCode, and InterviewBit.
          </p>

          {comparison.map((row, i) => (
            <div key={i} style={{
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-md)',
              border: '2px solid var(--border-color)',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                Row {i + 1} — {row.feat || '(no feature name)'}
              </p>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-sm)' }}>
                <div className="input-group">
                  <label>Feature name</label>
                  <input className="input" value={row.feat} onChange={e => {
                    const newRows = [...comparison];
                    newRows[i] = { ...newRows[i], feat: e.target.value };
                    setComparison(newRows);
                  }} placeholder="e.g. DBMS Content" />
                </div>
                <div className="input-group">
                  <label>TheJobStarter</label>
                  <textarea className="input" rows={2} value={row.ours} onChange={e => {
                    const newRows = [...comparison];
                    newRows[i] = { ...newRows[i], ours: e.target.value };
                    setComparison(newRows);
                  }} placeholder="Our offering..." />
                </div>
                <div className="input-group">
                  <label>GeeksforGeeks</label>
                  <textarea className="input" rows={2} value={row.gfg} onChange={e => {
                    const newRows = [...comparison];
                    newRows[i] = { ...newRows[i], gfg: e.target.value };
                    setComparison(newRows);
                  }} placeholder="GFG offering..." />
                </div>
                <div className="input-group">
                  <label>LeetCode</label>
                  <textarea className="input" rows={2} value={row.lc} onChange={e => {
                    const newRows = [...comparison];
                    newRows[i] = { ...newRows[i], lc: e.target.value };
                    setComparison(newRows);
                  }} placeholder="LeetCode offering..." />
                </div>
                <div className="input-group">
                  <label>InterviewBit</label>
                  <textarea className="input" rows={2} value={row.hr} onChange={e => {
                    const newRows = [...comparison];
                    newRows[i] = { ...newRows[i], hr: e.target.value };
                    setComparison(newRows);
                  }} placeholder="InterviewBit offering..." />
                </div>
              </div>
            </div>
          ))}
        </fieldset>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Saving...' : 'Save Why TheJobStarter Content'}
        </Button>
      </form>
    </div>
  );
}
