import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { ClipboardList, Plus, Trash2, Users, CheckCircle2, Clock, ArrowRight, Filter, X } from 'lucide-react';

const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };
const STATUS_STYLES = {
  draft: { bg: '#fef3c7', text: '#92400e' },
  active: { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#f3f4f6', text: '#374151' }
};

/*
 * FacultyAssignments — Batch-scoped assignment management.
 * Faculty can create (own batches only), view, and delete assignments.
 * Grading happens on the per-assignment detail page.
 */
export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* Create form state */
  const [form, setForm] = useState({
    title: '', instructions: '', attachmentLink: '', batchId: '',
    startDate: '', endDate: '', status: 'draft'
  });

  const fetchAssignments = () => {
    const params = new URLSearchParams();
    if (batchFilter) params.set('batchId', batchFilter);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    apiRequest(`/faculty/assignments${qs ? `?${qs}` : ''}`)
      .then(res => {
        console.log('[FACULTY] Assignments fetched:', res.data?.length);
        setAssignments(res.data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiRequest('/faculty/batches'),
      apiRequest('/faculty/assignments')
    ])
      .then(([batchRes, assignRes]) => {
        console.log('[FACULTY] Assignments + batches loaded');
        setBatches((batchRes.data || []).filter(b => b.status === 'active'));
        setAssignments(assignRes.data || []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => { fetchAssignments(); }, [batchFilter, statusFilter]);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    setCreateError(null);
    if (!form.title.trim() || !form.startDate || !form.endDate || !form.batchId) {
      setCreateError('Title, batch, start date, and end date are required.');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setCreateError('End date must be after start date.');
      return;
    }
    setCreating(true);
    try {
      await apiRequest('/faculty/assignments', { method: 'POST', body: JSON.stringify(form) });
      console.log('[FACULTY] Assignment created');
      setShowCreate(false);
      setForm({ title: '', instructions: '', attachmentLink: '', batchId: '', startDate: '', endDate: '', status: 'draft' });
      fetchAssignments();
    } catch (err) {
      console.error('[FACULTY] Create failed:', err.message);
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment? All student submissions will also be deleted.')) return;
    setDeletingId(id);
    try {
      await apiRequest(`/faculty/assignments/${id}`, { method: 'DELETE' });
      console.log('[FACULTY] Assignment deleted:', id);
      setAssignments(a => a.filter(x => x._id !== id));
    } catch (err) {
      console.error('[FACULTY] Delete failed:', err.message);
      window.alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading assignments..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
      <Helmet><title>Assignments — Faculty — TheWebytes</title></Helmet>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={22} /> Assignments
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{assignments.length} assignment{assignments.length !== 1 ? 's' : ''} in your batches</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ fontSize: '0.8rem', fontWeight: 800, padding: '10px 16px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', cursor: 'pointer', background: '#000', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* ═══ FILTERS ═══ */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-lg)', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />
        <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} style={{ border: '2px solid #000', padding: '6px 8px', background: 'var(--bg-surface)', fontSize: '0.78rem' }}>
          <option value="">All batches</option>
          {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '2px solid #000', padding: '6px 8px', background: 'var(--bg-surface)', fontSize: '0.78rem' }}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {assignments.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>No assignments yet.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Create your first assignment for one of your batches.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {assignments.map(a => {
            const st = STATUS_STYLES[a.status] || STATUS_STYLES.draft;
            const stats = a._submissionStats || {};
            const submittedPct = stats.totalStudents > 0 ? Math.round((stats.total / stats.totalStudents) * 100) : 0;
            return (
              <div key={a._id} style={{ ...CARD, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{a.title}</h3>
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', border: '2px solid #000', background: st.bg, color: st.text }}>{a.status}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    <Link to={`/faculty/batches/${a.batch?._id}`} style={{ fontWeight: 700 }}>{a.batch?.name || 'Unknown batch'}</Link>
                    {' · '}{a.startDate ? new Date(a.startDate).toLocaleDateString() : '—'} → {a.endDate ? new Date(a.endDate).toLocaleDateString() : '—'}
                  </div>
                  {a.instructions && <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-tertiary)' }}>{a.instructions.length > 140 ? a.instructions.slice(0, 140) + '\u2026' : a.instructions}</p>}
                </div>

                {/* Submission stats */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ border: '2px solid #000', padding: '6px 10px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 70 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Users size={12} /> {stats.total || 0}
                    </div>
                    <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Submitted</div>
                  </div>
                  <div style={{ border: '2px solid #000', padding: '6px 10px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 70 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> {stats.approved || 0}
                    </div>
                    <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Approved</div>
                  </div>
                  <div style={{ border: '2px solid #000', padding: '6px 10px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 70 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Clock size={12} /> {stats.pending || 0}
                    </div>
                    <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Pending</div>
                  </div>
                  {stats.totalStudents > 0 && (
                    <div style={{ minWidth: 90 }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, marginBottom: 2 }}>{submittedPct}% submitted</div>
                      <div style={{ height: 8, border: '2px solid #000', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: `${submittedPct}%`, background: '#2563eb' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Link to={`/faculty/assignments/${a._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '2px solid #000', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, background: 'var(--bg-surface)', boxShadow: '2px 2px 0 #000' }}>
                    Review <ArrowRight size={13} />
                  </Link>
                  <button onClick={() => handleDelete(a._id)} disabled={deletingId === a._id} title="Delete assignment"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: '#fee2e2', color: '#991b1b', boxShadow: '2px 2px 0 #000' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ CREATE MODAL ═══ */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)', zIndex: 100 }}>
          <div style={{ ...CARD, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900 }}>New Assignment</h2>
              <button onClick={() => setShowCreate(false)} style={{ border: '2px solid #000', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-surface)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Title *</label>
                <input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Arrays — Two Sum variants" style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Instructions</label>
                <textarea value={form.instructions} onChange={e => setField('instructions', e.target.value)} rows={3} placeholder="What should students do? (optional)" style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Attachment Link</label>
                <input value={form.attachmentLink} onChange={e => setField('attachmentLink', e.target.value)} placeholder="https://... (optional)" style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Batch *</label>
                <select value={form.batchId} onChange={e => setField('batchId', e.target.value)} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}>
                  <option value="">Select batch...</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.studentCount} students)</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setField('endDate', e.target.value)} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value)} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}>
                  <option value="draft">Draft (students don't see it yet)</option>
                  <option value="active">Active (students are notified immediately)</option>
                </select>
              </div>

              {createError && <div style={{ border: '2px solid #dc2626', background: '#fef2f2', color: '#991b1b', padding: '8px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{createError}</div>}

              <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
                <button onClick={() => setShowCreate(false)} style={{ border: '2px solid #000', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', background: 'var(--bg-surface)' }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating} style={{ border: '3px solid #000', padding: '8px 16px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', background: '#000', color: '#fff', boxShadow: '3px 3px 0 #000' }}>
                  {creating ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}