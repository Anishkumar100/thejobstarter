import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProgressMessageStore } from '../stores/useProgressMessageStore.js';
import { Plus, Pencil, Trash2, CircleCheck, CircleX } from 'lucide-react';
import Loader from '../components/ui/Loader.jsx';

const CONTEXTS = ['per-subject', 'overall', 'celebration', 'streak'];
const SUBJECTS = ['all', 'dsa', 'dbms', 'os'];
const TIERS = [0, 10, 25, 50, 75, 90, 100];

const EMPTY_FORM = { message: '', tier: 50, context: 'per-subject', subject: 'all', active: true };

export default function AdminProgressMessages() {
  const { allMessages, loading, fetchAllMessages, createMessage, updateMessage, deleteMessage } = useProgressMessageStore();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAllMessages(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (msg) => {
    setEditingId(msg._id);
    setForm({ message: msg.message, tier: msg.tier, context: msg.context, subject: msg.subject || 'all', active: msg.active });
  };

  const handleNew = () => {
    setEditingId('new');
    setForm(EMPTY_FORM);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.message.trim()) return alert('Message is required');
    setSaving(true);
    try {
      if (editingId === 'new') {
        await createMessage(form);
      } else {
        await updateMessage(editingId, form);
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <Helmet><title>Progress Messages — Admin — TheJobStarter</title></Helmet>

      <div className="listing-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="listing-header__title">Progress Messages</h1>
        <button className="btn btn--primary" onClick={handleNew} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New Message
        </button>
      </div>

      {/* ── Edit/Create Form ── */}
      {editingId && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
            {editingId === 'new' ? 'New Message' : 'Edit Message'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Message Text</label>
            <textarea className="input" name="message" value={form.message} onChange={handleChange} rows={3} placeholder="e.g. Keep going! You're doing great." />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Tier (max %)</label>
                <select className="input" name="tier" value={form.tier} onChange={handleChange}>
                  {TIERS.map(t => <option key={t} value={t}>{t}%</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Context</label>
                <select className="input" name="context" value={form.context} onChange={handleChange}>
                  {CONTEXTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Subject</label>
                <select className="input" name="subject" value={form.subject} onChange={handleChange}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All subjects' : s.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
              Active
            </label>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-sm)' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading && <Loader text="LOADING MESSAGES..." />}
      {!loading && allMessages.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No messages yet. Create one to get started.</p>
      )}
      {!loading && allMessages.length > 0 && (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '3px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Message</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Tier</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Context</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Subject</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Active</th>
                <th style={{ padding: '8px 12px', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allMessages.map(msg => (
                <tr key={msg._id} style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.message}
                  </td>
                  <td style={{ padding: '8px 12px' }}>{msg.tier}%</td>
                  <td style={{ padding: '8px 12px' }}>{msg.context}</td>
                  <td style={{ padding: '8px 12px' }}>{msg.subject === 'all' ? 'All' : msg.subject.toUpperCase()}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {msg.active ? <CircleCheck size={16} color="var(--success)" /> : <CircleX size={16} color="var(--error)" />}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn--sm" onClick={() => handleEdit(msg)} title="Edit">
                        <Pencil size={12} />
                      </button>
                      <button className="btn btn--sm btn--danger" onClick={() => handleDelete(msg._id)} title="Delete">
                        <Trash2 size={12} />
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
