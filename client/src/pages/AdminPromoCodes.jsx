import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

const PROMO_TYPES = [
  { value: 'free_month', label: 'Free Month' },
  { value: 'discount_percent', label: 'Discount %' },
  { value: 'discount_fixed', label: 'Discount ₹' }
];

const initialForm = { code: '', type: 'free_month', value: '', maxUses: '', expiresAt: '', description: '' };

export default function AdminPromoCodes() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/promos');
      setPromos(res.data);
    } catch (err) {
      console.error('[ADMIN] Error fetching promos:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        description: form.description
      };
      await apiRequest('/admin/promos', { method: 'POST', body: JSON.stringify(payload) });
      showMsg('success', `Promo code "${form.code.toUpperCase()}" created`);
      setForm(initialForm);
      setShowForm(false);
      fetchPromos();
    } catch (err) {
      showMsg('error', err.message);
    }
    setSaving(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        type: form.type,
        value: Number(form.value),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        active: form.active,
        description: form.description
      };
      await apiRequest(`/admin/promos/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showMsg('success', 'Promo code updated');
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchPromos();
    } catch (err) {
      showMsg('error', err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete promo code "${code}" permanently?`)) return;
    try {
      await apiRequest(`/admin/promos/${id}`, { method: 'DELETE' });
      showMsg('success', `Promo code "${code}" deleted`);
      fetchPromos();
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  const openEdit = (promo) => {
    setForm({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      maxUses: promo.maxUses || '',
      expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '',
      active: promo.active,
      description: promo.description || ''
    });
    setEditingId(promo._id);
    setShowForm(true);
  };

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const typeLabel = (type) => {
    const t = PROMO_TYPES.find(t => t.value === type);
    return t ? t.label : type;
  };

  return (
    <div>
      <Helmet><title>Promo Codes — Admin TheJobStarter</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Promo Codes</h1>
        <span className="listing-header__count">Create and manage discount codes</span>
      </div>

      {/* ── Toast Message ── */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.8rem',
          border: '3px solid #000',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2'
        }}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn--primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Promo Code
        </button>
        <button className="btn btn--sm" onClick={fetchPromos} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Create/Edit Form ── */}
      {showForm && (
        <div style={{
          marginBottom: '2rem', padding: '1.5rem', border: '3px solid #000',
          background: 'var(--bg-surface)', boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
          </h3>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Code field (only editable on create) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Code</label>
                {editingId ? (
                  <div style={{ padding: '8px 12px', border: '3px solid #000', background: 'var(--gray-100)', fontSize: '0.85rem', fontWeight: 700 }}>
                    {form.code}
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Code cannot be changed after creation</p>
                  </div>
                ) : (
                  <input
                    required
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. WELCOME20"
                    style={{ width: '100%', padding: '8px 12px', border: '3px solid #000', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem' }}
                  />
                )}
              </div>

              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Type</label>
                <select
                  required
                  value={form.type}
                  onChange={e => {
                    const newType = e.target.value;
                    setForm(f => ({
                      ...f,
                      type: newType,
                      /* Auto-set value to 0 for free_month since it's ignored */
                      value: newType === 'free_month' ? '0' : f.value
                    }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', border: '3px solid #000', fontWeight: 600, fontSize: '0.85rem', background: 'var(--bg-surface)' }}
                >
                  {PROMO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Value */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                  Value {form.type === 'discount_percent' ? '(%)' : form.type === 'discount_fixed' ? '(₹)' : ''}
                </label>
                <input
                  required={form.type !== 'free_month'}
                  disabled={form.type === 'free_month'}
                  type="number"
                  min={form.type === 'discount_percent' ? 1 : 0}
                  max={form.type === 'discount_percent' ? 100 : undefined}
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === 'free_month' ? 'Auto (free month)' : 'e.g. 20'}
                  style={{ width: '100%', padding: '8px 12px', border: '3px solid #000', fontSize: '0.85rem', opacity: form.type === 'free_month' ? 0.5 : 1 }}
                />
                {form.type === 'free_month' && (
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Value is ignored for free month promotion</p>
                )}
              </div>

              {/* Max Uses */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Max Uses (leave empty = unlimited)</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  placeholder="Unlimited"
                  style={{ width: '100%', padding: '8px 12px', border: '3px solid #000', fontSize: '0.85rem' }}
                />
              </div>

              {/* Expires At */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Expires At (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '3px solid #000', fontSize: '0.85rem' }}
                />
              </div>

              {/* Active (edit only) */}
              {editingId && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Active</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.active !== false}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: '0.8rem' }}>Promo code is active</span>
                  </label>
                </div>
              )}

              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Description (optional)</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Internal note about this promo code"
                  style={{ width: '100%', padding: '8px 12px', border: '3px solid #000', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn--primary" disabled={saving} style={{ fontSize: '0.8rem' }}>
                {saving ? 'Saving...' : editingId ? 'Update Promo Code' : 'Create Promo Code'}
              </button>
              <button type="button" className="btn" onClick={() => { setShowForm(false); setEditingId(null); setForm(initialForm); }} style={{ fontSize: '0.8rem' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Promo Code List ── */}
      {loading && <Loader text="LOADING PROMO CODES..." />}

      {error && !loading && (
        <div style={{ padding: '1rem', border: '3px solid #dc2626', background: '#fee2e2', marginBottom: '1.5rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!loading && promos.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '3rem' }}>
          No promo codes yet. Create one to start offering discounts.
        </p>
      )}

      {!loading && promos.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '3px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 700 }}>Code</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 700 }}>Type</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Value</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Uses</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Expires</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Active</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Created By</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(promo => (
                <tr key={promo._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {promo.code}
                    {promo.description && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>{promo.description}</div>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>{typeLabel(promo.type)}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>
                    {promo.type === 'free_month' ? '—' : promo.type === 'discount_percent' ? `${promo.value}%` : `₹${promo.value}`}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {promo.usedCount || 0}{promo.maxUses !== null ? ` / ${promo.maxUses}` : ''}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', width: 10, height: 10,
                      background: promo.active ? '#16a34a' : '#dc2626',
                      border: '2px solid #000'
                    }} />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem' }}>
                    {promo.createdBy?.displayName || promo.createdBy?.username || '—'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="btn btn--sm" onClick={() => openEdit(promo)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button className="btn btn--sm btn--danger" onClick={() => handleDelete(promo._id, promo.code)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
