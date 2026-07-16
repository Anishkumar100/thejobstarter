import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/**
 * AdminHomepageConfig — Homepage Landing Page Editor
 * Manages the homepage stats (problems, articles, users, questions).
 * Route: /admin/homepage
 */
export default function AdminHomepageConfig() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* Stats displayed on the homepage */
  const [stats, setStats] = useState({
    problems: '',
    articles: '',
    users: '',
    questions: ''
  });

  /* Load existing site config on mount */
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    apiRequest('/site-config/public')
      .then(res => {
        const data = res.data || {};
        if (data.homepageStats) {
          setStats({
            problems: data.homepageStats.problems?.toString() || '',
            articles: data.homepageStats.articles?.toString() || '',
            users: data.homepageStats.users?.toString() || '',
            questions: data.homepageStats.questions?.toString() || ''
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[ADMIN] Failed to load homepage config:', err.message);
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  /* Save the homepage config */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await apiRequest('/site-config', {
        method: 'PUT',
        body: JSON.stringify({
          homepageStats: {
            problems: Number(stats.problems) || 0,
            articles: Number(stats.articles) || 0,
            users: Number(stats.users) || 0,
            questions: Number(stats.questions) || 0
          }
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[ADMIN] Error saving homepage config:', err.message);
      setSaveError(err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <Loader text="LOADING HOMEPAGE CONFIG..." />;
  }

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
        <title>Homepage Config — Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Homepage Configuration</h1>
        <span className="listing-header__count">Homepage statistics</span>
      </div>

      {saved && <div className="success-text" style={{ marginBottom: 'var(--space-md)' }}>Homepage config saved!</div>}
      {saveError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Save failed: {saveError}</div>}

      <form onSubmit={handleSave} className="admin-form">
        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          {/* Homepage Stats */}
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <p style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
              Homepage Stats (appear on the public homepage)
            </p>
          </div>
          <div className="input-group">
            <label>Problems Count</label>
            <input
              className="input"
              type="number"
              min="0"
              value={stats.problems}
              onChange={e => setStats(s => ({ ...s, problems: e.target.value }))}
              placeholder="e.g. 180"
            />
          </div>
          <div className="input-group">
            <label>Articles Count</label>
            <input
              className="input"
              type="number"
              min="0"
              value={stats.articles}
              onChange={e => setStats(s => ({ ...s, articles: e.target.value }))}
              placeholder="e.g. 85"
            />
          </div>
          <div className="input-group">
            <label>Users Count</label>
            <input
              className="input"
              type="number"
              min="0"
              value={stats.users}
              onChange={e => setStats(s => ({ ...s, users: e.target.value }))}
              placeholder="e.g. 500"
            />
          </div>
          <div className="input-group">
            <label>Questions Count</label>
            <input
              className="input"
              type="number"
              min="0"
              value={stats.questions}
              onChange={e => setStats(s => ({ ...s, questions: e.target.value }))}
              placeholder="e.g. 50"
            />
          </div>
        </div>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Saving...' : 'Save Homepage Config'}
        </Button>
      </form>
    </div>
  );
}
