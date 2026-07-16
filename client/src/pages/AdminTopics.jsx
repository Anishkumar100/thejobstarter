import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';

const DEFAULT_TOPICS = [
  { title: 'DATA STRUCTURES\n& ALGORITHMS', subtitle: '', category: 'DSA', description: '180+ curated problems from easy to hard. Arrays, Trees, Graphs, DP — every topic covered.', cta: 'EXPLORE', link: '/dsa', accentColor: '#e11d48', order: 1, image: '' },
  { title: 'DATABASE\nMANAGEMENT SYSTEMS', subtitle: '', category: 'DBMS', description: 'In-depth articles on SQL, NoSQL, indexing, normalization, transactions & more.', cta: 'EXPLORE', link: '/dbms', accentColor: '#3b82f6', order: 2, image: '' },
  { title: 'OPERATING\nSYSTEMS', subtitle: '', category: 'OS', description: 'Process scheduling, memory management, file systems, and synchronization.', cta: 'EXPLORE', link: '/os', accentColor: '#22c55e', order: 3, image: '' }
];

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/topics');
      if (res.data && res.data.length > 0) {
        setTopics(res.data);
      } else {
        setTopics(DEFAULT_TOPICS);
      }
    } catch (err) {
      console.error('[ADMIN] Topics fetch failed:', err.message);
      setTopics(DEFAULT_TOPICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleField = (index, field, value) => {
    setTopics(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      /* Delete all existing, then create fresh */
      const existing = await apiRequest('/topics');
      if (existing.data) {
        for (const t of existing.data) {
          await apiRequest(`/topics/${t._id}`, { method: 'DELETE' });
        }
      }
      for (const t of topics) {
        await apiRequest('/topics', { method: 'POST', body: JSON.stringify(t) });
      }
      setMsg('SAVED');
    } catch (err) {
      console.error('[ADMIN] Save failed:', err.message);
      setMsg('FAILED');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <Helmet>
        <title>Homepage Topics — TheJobStarter Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Homepage Topics</h1>
        <span className="listing-header__count">3 cards</span>
      </div>

      {loading && <Loader text="LOADING TOPICS..." />}

      {!loading && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-2xl)' }}>
          {topics.map((topic, i) => (
            <div key={i} style={{ marginBottom: i < topics.length - 1 ? 'var(--space-xl)' : 0, paddingBottom: i < topics.length - 1 ? 'var(--space-xl)' : 0, borderBottom: i < topics.length - 1 ? '3px solid var(--border-color)' : 'none' }}>
              <p style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-md)', color: 'var(--accent)' }}>
                Card {i + 1} — {topic.category || 'Topic'}
              </p>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div className="input-group">
                  <label>Title (use \n for line breaks)</label>
                  <textarea className="input" rows={2} value={topic.title} onChange={e => handleField(i, 'title', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea className="input" rows={2} value={topic.description} onChange={e => handleField(i, 'description', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Category Badge</label>
                  <input className="input" value={topic.category} onChange={e => handleField(i, 'category', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>CTA Text</label>
                  <input className="input" value={topic.cta} onChange={e => handleField(i, 'cta', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Link (path)</label>
                  <input className="input" value={topic.link} onChange={e => handleField(i, 'link', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Accent Color</label>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <input className="input" style={{ flex: 1 }} value={topic.accentColor} onChange={e => handleField(i, 'accentColor', e.target.value)} />
                    <input type="color" value={topic.accentColor} onChange={e => handleField(i, 'accentColor', e.target.value)} style={{ width: 40, height: 40, border: '3px solid var(--border-color)', padding: 0, cursor: 'pointer' }} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Order</label>
                  <input className="input" type="number" value={topic.order} onChange={e => handleField(i, 'order', Number(e.target.value))} />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Background Image</label>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', width: '100%' }}>
                      <input
                        className="input"
                        value={topic.image}
                        onChange={e => handleField(i, 'image', e.target.value)}
                        placeholder="ImageKit URL or upload below"
                        style={{ flex: 1 }}
                      />
                      <label className="btn btn--secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        UPLOAD
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              try {
                                const res = await apiRequest('/media/upload', {
                                  method: 'POST',
                                  body: JSON.stringify({ file: reader.result, fileName: `topic-${i + 1}-${Date.now()}` })
                                });
                                handleField(i, 'image', res.url);
                              } catch (err) {
                                console.error('[ADMIN] Upload failed:', err.message);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                    {/* Small preview if image exists */}
                    {topic.image && (
                      <img
                        src={topic.image}
                        alt="preview"
                        style={{ width: 120, height: 68, objectFit: 'cover', border: '3px solid var(--border-color)' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'SAVING...' : 'SAVE ALL TOPICS'}
            </button>
            {msg && (
              <span style={{ fontWeight: 700, fontSize: '0.75rem', color: msg === 'SAVED' ? 'var(--success-text)' : 'var(--error-text)' }}>
                {msg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
