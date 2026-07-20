import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/*
 * AdminProgrammingMeta — CRUD management for Programming categories, topics, and companies
 * Mirrors AdminDbmsMeta but uses /api/programming-meta endpoint
 */
export default function AdminProgrammingMeta() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('category');
  const [editingId, setEditingId] = useState(null);
  const [formLabel, setFormLabel] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/programming-meta');
      setItems(res.data || []);
    } catch (err) {
      console.error('[PROG-META] Fetch failed:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 2500);
  };

  const autoSlug = (label) => {
    return label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleLabelChange = (val) => {
    setFormLabel(val);
    if (!formValue || formValue === autoSlug(formLabel)) {
      setFormValue(autoSlug(val));
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setFormLabel('');
    setFormValue('');
    setFormOrder(0);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormLabel(item.label);
    setFormValue(item.value);
    setFormOrder(item.order ?? 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formLabel.trim() || !formValue.trim()) return;
    setSaving(true);
    try {
      const payload = { type: activeTab, label: formLabel.trim(), value: formValue.trim(), order: Number(formOrder) };
      if (editingId) {
        await apiRequest(`/programming-meta/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showMsg('Updated!');
      } else {
        await apiRequest('/programming-meta', { method: 'POST', body: JSON.stringify(payload) });
        showMsg('Created!');
      }
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      console.error('[PROG-META] Save failed:', err.message);
      showMsg('Failed: ' + err.message, 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.label}"?`)) return;
    try {
      await apiRequest(`/programming-meta/${item._id}`, { method: 'DELETE' });
      showMsg('Deleted!');
      if (editingId === item._id) setEditingId(null);
      await fetchItems();
    } catch (err) {
      console.error('[PROG-META] Delete failed:', err.message);
      showMsg('Delete failed', 'error');
    }
  };

  const handleSeed = async () => {
    if (!confirm('Replace all Programming categories, topics, and companies with defaults?')) return;
    setSeeding(true);
    try {
      await apiRequest('/programming-meta/seed', { method: 'POST' });
      showMsg('Seeded with defaults!');
      await fetchItems();
    } catch (err) {
      console.error('[PROG-META] Seed failed:', err.message);
      showMsg('Seed failed', 'error');
    }
    setSeeding(false);
  };

  const filteredItems = items
    .filter(i => i.type === activeTab)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const typeLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  const tabs = [
    { key: 'category', label: 'Categories' },
    { key: 'topic', label: 'Topics' },
    { key: 'company', label: 'Companies' }
  ];

  if (loading && items.length === 0) {
    return <Loader text="LOADING PROGRAMMING META..." />;
  }

  if (error && items.length === 0) {
    return (
      <div>
        <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Failed to load: {error}</div>
        <Button onClick={fetchItems}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Helmet><title>Programming Meta — Admin</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Programming Categories, Topics &amp; Companies</h1>
        <span className="listing-header__count">{filteredItems.length} {typeLabel}s</span>
      </div>

      {msg.text && (
        <div style={{
          fontWeight: 700, fontSize: '0.8rem', marginBottom: 'var(--space-md)',
          color: msg.type === 'error' ? 'var(--error-text)' : 'var(--success-text)'
        }}>
          {msg.text}
        </div>
      )}

      <div className="listing-filters" style={{ marginBottom: 'var(--space-lg)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`listing-filters__btn ${activeTab === tab.key ? 'listing-filters__btn--active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setEditingId(null); }}
          >
            {tab.label} ({items.filter(i => i.type === tab.key).length})
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="btn btn--sm" onClick={startCreate}>+ New {typeLabel}</button>
          <button className="btn btn--sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Seed Defaults'}
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-md)' }}>
          {editingId ? `Edit ${typeLabel}` : `New ${typeLabel}`}
        </p>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 'var(--space-sm)', alignItems: 'end' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Label (display name)</label>
              <input className="input" value={formLabel} onChange={e => handleLabelChange(e.target.value)} placeholder="e.g. OOPs" required />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Value (slug/key)</label>
              <input className="input" value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="e.g. oops" required />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Order</label>
              <input className="input" type="number" min="0" value={formOrder} onChange={e => setFormOrder(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            <Button type="submit" disabled={saving || !formLabel.trim() || !formValue.trim()}>
              {saving ? 'Saving...' : editingId ? `Update ${typeLabel}` : `Create ${typeLabel}`}
            </Button>
            {editingId && (
              <button type="button" className="btn btn--sm" onClick={() => setEditingId(null)}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        {filteredItems.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No {typeLabel.toLowerCase()}s yet.</p>
        )}
        {filteredItems.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Order</th>
                <th>Label</th>
                <th>Value</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item._id}>
                  <td>{item.order ?? '-'}</td>
                  <td style={{ fontWeight: 700 }}>{item.label}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.value}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn--sm" onClick={() => startEdit(item)}>Edit</button>
                      <button className="btn btn--sm btn--danger" onClick={() => handleDelete(item)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
