import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Layers, Users, ArrowLeft, Save, Edit3, X, Trash2, Copy, Search, BookOpen, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: 'var(--shadow)',
};

export default function CoordinatorBatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCode, setEditingCode] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [enrolledSelected, setEnrolledSelected] = useState([]);
  const [unassignedSelected, setUnassignedSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  /* confirmAction: { type: 'assign'|'remove'|'removeCenter', ids: [] } */

  /*
   * Fetch batch metadata and full centre student roster
   */
  const fetchData = async () => {
    console.log('[BATCH DETAIL] Loading batch:', id);
    setLoading(true);
    setError(null);
    try {
      const [batchesRes, rosterRes] = await Promise.all([
        apiRequest('/coordinator/batches'),
        apiRequest('/coordinator/students')
      ]);
      const found = (batchesRes.data || []).find(b => b._id === id);
      if (!found) {
        setError('Batch not found');
        setLoading(false);
        return;
      }
      setBatch(found);
      setAllStudents(rosterRes.data?.students || []);
    } catch (err) {
      console.error('[BATCH DETAIL] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  /* Filter helper — match name, email, and course filter */
  const matchesSearch = (s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (s.displayName || s.username || '').toLowerCase().includes(q)
      || (s.email || '').toLowerCase().includes(q);
  };

  const matchesCourse = (s) => {
    if (!courseFilter) return true;
    const sc = s.courseOffering?._id || s.courseOffering;
    return sc === courseFilter;
  };

  const matchesDate = (s) => {
    if (!dateFilter) return true;
    const raw = s.coachingCenterJoinedAt || s.joinDate;
    if (!raw) return false;
    const joined = new Date(raw);
    if (isNaN(joined.getTime())) return false;
    const now = new Date();
    switch (dateFilter) {
      case 'year': return joined >= new Date(now.getFullYear(), 0, 1);
      case '6months': return joined >= new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case '1month': return joined >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case 'today': return joined >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      default: return true;
    }
  };

  
  /* Derive enrolled vs unassigned student lists */
  const batchStudentIds = batch
    ? allStudents.filter(s => (s.batch?._id || s.batch) === batch._id).map(s => s._id)
    : [];
  const enrolledStudents = allStudents
    .filter(s => batchStudentIds.includes(s._id))
    .filter(s => matchesSearch(s))
    .filter(s => matchesCourse(s))
    .filter(s => matchesDate(s));
  const unassignedStudents = allStudents
    .filter(s => !batchStudentIds.includes(s._id))
    .filter(s => matchesSearch(s))
    .filter(s => matchesCourse(s))
    .filter(s => matchesDate(s));



  /* ── Code editing ── */

  const handleSaveCode = async () => {
    if (!codeValue.trim()) return;
    setSavingCode(true);
    try {
      await apiRequest(`/coordinator/batches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ code: codeValue.trim() })
      });
      setBatch(prev => ({ ...prev, code: codeValue.trim() }));
      setEditingCode(false);
      console.log('[BATCH DETAIL] Code updated');
    } catch (err) {
      console.error('[BATCH DETAIL] Code update error:', err.message);
      alert(err.message || 'Failed to update code');
    }
    setSavingCode(false);
  };

  /* ── Name editing ── */

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setSavingName(true);
    try {
      await apiRequest(`/coordinator/batches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: nameValue.trim() })
      });
      setBatch(prev => ({ ...prev, name: nameValue.trim() }));
      setEditingName(false);
      console.log('[BATCH DETAIL] Name updated');
    } catch (err) {
      console.error('[BATCH DETAIL] Name update error:', err.message);
      alert(err.message || 'Failed to update name');
    }
    setSavingName(false);
  };

  /* ── Assign unassigned students to this batch ── */

  const handleAssign = async (ids) => {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      await apiRequest(`/coordinator/batches/${id}/assign-students`, {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
      });
      setAllStudents(prev => prev.map(s => ids.includes(s._id)
        ? { ...s, batch: { _id: id, name: batch.name, status: batch.status } } : s));
      setUnassignedSelected([]);
    } catch (err) {
      alert(err.message || 'Failed to assign students');
    }
    setBusy(false);
  };

  /* ── Remove enrolled students from this batch ── */

  const handleRemoveFromBatch = async (ids) => {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      await apiRequest(`/coordinator/batches/${id}/remove-students`, {
        method: 'POST',
        body: JSON.stringify({ userIds: ids })
      });
      setAllStudents(prev => prev.map(s => ids.includes(s._id) ? { ...s, batch: null } : s));
      setEnrolledSelected([]);
    } catch (err) {
      alert(err.message || 'Failed to remove students from batch');
    }
    setBusy(false);
  };

  /* ── Remove students from centre entirely ── */

  const handleRemoveFromCenter = async (ids) => {
    setBusy(true);
    try {
      for (const sid of ids) {
        await apiRequest(`/coordinator/students/${sid}/remove`, { method: 'PATCH' });
      }
      setAllStudents(prev => prev.filter(s => !ids.includes(s._id)));
      setEnrolledSelected([]);
      setUnassignedSelected([]);
    } catch (err) {
      alert(err.message || 'Failed to remove students');
    }
    setBusy(false);
  };

  /* ── Delete batch ── */

  const handleDelete = async () => {
    if (enrolledStudents.length > 0) {
      if (!confirm(`This batch has ${enrolledStudents.length} student(s) who will be unassigned. Delete anyway?`)) return;
    } else if (!confirm('Delete this batch permanently?')) return;
    try {
      await apiRequest(`/coordinator/batches/${id}`, { method: 'DELETE' });
      navigate('/coordinator/batches');
    } catch (err) {
      console.error('[BATCH DETAIL] Delete error:', err.message);
      alert(err.message || 'Failed to delete batch');
    }
  };

  /* ── Single-student remove from batch (per-row action) ── */

  const handleSingleRemove = async (student) => {
    if (!confirm(`Remove ${student.displayName || student.username} from this batch?`)) return;
    try {
      await apiRequest(`/coordinator/students/${student._id}/batch/remove`, { method: 'PATCH' });
      setAllStudents(prev => prev.map(s => s._id === student._id ? { ...s, batch: null } : s));
    } catch (err) { alert(err.message || 'Failed'); }
  };

  /* ── Confirm-action processor ── */

  const executeConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'assign') await handleAssign(confirmAction.ids);
    else if (confirmAction.type === 'remove') await handleRemoveFromBatch(confirmAction.ids);
    else if (confirmAction.type === 'removeCenter') await handleRemoveFromCenter(confirmAction.ids);
    setConfirmAction(null);
  };

  if (loading) return <Loader text="LOADING BATCH..." />;
  if (error) return <div className="error-text">{error}</div>;
  if (!batch) return <div className="error-text">Batch not found</div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>{batch.name} — Batch — Coordinator — TheWebytes</title></Helmet>

      {/* ── Back link ── */}
      <Link to="/coordinator/batches"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-md)',
          fontSize: '0.85rem', color: 'var(--text-secondary)'
        }}>
        <ArrowLeft size={14} /> Back to all batches
      </Link>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 'var(--space-sm)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900,
            display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)'
          }}>
            <Layers size={28} />
            {editingName ? (
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input className="input" style={{
                  fontSize: '1rem', padding: '4px 8px', minWidth: 240, fontWeight: 800
                }} value={nameValue} onChange={e => setNameValue(e.target.value)} autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
                <button className="btn btn--sm" onClick={handleSaveName} disabled={savingName}>
                  <Save size={14} />
                </button>
                <button className="btn btn--sm btn--ghost" onClick={() => setEditingName(false)}>
                  <X size={14} />
                </button>
              </span>
            ) : (
              <span style={{ cursor: 'pointer' }}
                onClick={() => { setNameValue(batch.name); setEditingName(true); }}
                title="Click to edit name">
                {batch.name}
                <Edit3 size={16} style={{ verticalAlign: 'middle', marginLeft: 6, opacity: 0.4 }} />
              </span>
            )}
          </h1>
          <div style={{
            display: 'flex', gap: 16, fontSize: '0.85rem',
            color: 'var(--text-tertiary)', flexWrap: 'wrap', alignItems: 'center', marginTop: 4
          }}>
            <span>
              <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''}
            </span>
            {batch.expectedStudents && <span>Expected: {batch.expectedStudents}</span>}
            <span style={{
              padding: '2px 6px', border: '2px solid var(--border-color)',
              background: batch.status === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
              color: batch.status === 'active' ? 'var(--success-text)' : 'var(--text-secondary)',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase'
            }}>
              {batch.status}
            </span>
          </div>
        </div>
        <button className="btn btn--sm btn--danger" onClick={handleDelete}>
          <Trash2 size={14} /> Delete Batch
        </button>
      </div>

      {/* ── Code / Info Card ── */}
      <div style={{ ...CARD, marginTop: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
              display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Batch Code
            </span>
            {editingCode ? (
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input className="input" style={{
                  width: 120, fontSize: '0.9rem', padding: '4px 8px', fontFamily: 'monospace'
                }} value={codeValue} onChange={e => setCodeValue(e.target.value)} autoFocus />
                <button className="btn btn--sm" onClick={handleSaveCode} disabled={savingCode}>
                  <Save size={12} /> Save
                </button>
                <button className="btn btn--sm btn--ghost" onClick={() => setEditingCode(false)}>
                  <X size={12} />
                </button>
              </span>
            ) : (
              <span>
                <strong style={{
                  fontFamily: 'monospace', letterSpacing: '0.12em', fontSize: '1.2rem',
                  cursor: 'pointer', color: 'var(--text-primary)'
                }} onClick={() => { setCodeValue(batch.code); setEditingCode(true); }}
                  title="Click to edit code">
                  {batch.code}
                  <Edit3 size={13} style={{ verticalAlign: 'middle', marginLeft: 4, opacity: 0.5 }} />
                </strong>
                <button className="btn btn--sm btn--ghost" style={{
                  marginLeft: 6, padding: '2px 6px', fontSize: '0.65rem', verticalAlign: 'middle'
                }} onClick={() => { navigator.clipboard.writeText(batch.code); alert('Code copied!'); }}>
                  <Copy size={12} /> Copy
                </button>
              </span>
            )}
          </div>
          {batch.courseOffering && (
            <div>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
                display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                Course
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={14} /> {batch.courseOffering.name}
              </span>
            </div>
          )}
          <div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
              display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Created
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {new Date(batch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div style={{
        ...CARD, marginBottom: 'var(--space-md)',
        padding: 'var(--space-sm) var(--space-md)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'
      }}>
        <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input className="input" placeholder="Search by name or email..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: 180, border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', padding: 0 }} />
        {searchQuery && (
          <button className="btn btn--sm btn--ghost" onClick={() => setSearchQuery('')}
            style={{ padding: '2px 6px', fontSize: '0.65rem', flexShrink: 0 }}>
            <X size={12} /> Clear
          </button>
        )}
        <select className="input" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          style={{ width: 180, fontSize: '0.78rem', padding: '4px 6px' }}>
          <option value="">All courses</option>
          {allStudents.reduce((acc, s) => {
            const co = s.courseOffering;
            if (co && co._id && !acc.find(a => a._id === co._id)) acc.push(co);
            return acc;
          }, []).map(co => (
            <option key={co._id} value={co._id}>{co.name}</option>
          ))}
        </select>
        <select className="input" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ width: 150, fontSize: '0.78rem', padding: '4px 6px' }}>
          <option value="">All time</option>
          <option value="year">This year</option>
          <option value="6months">Within 6 months</option>
          <option value="1month">Within 1 month</option>
          <option value="today">Today</option>
        </select>
        {(searchQuery || courseFilter || dateFilter) && (
          <button className="btn btn--sm btn--ghost" onClick={() => { setSearchQuery(''); setCourseFilter(''); setDateFilter(''); }}
            style={{ fontSize: '0.65rem', padding: '2px 8px', flexShrink: 0 }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ═══ NEEDS ATTENTION ═══ */}
      {(() => {
        const flagged = enrolledStudents.filter(s => s.needsAttention);
        if (flagged.length === 0) return null;
        return (
          <div style={{ marginBottom: 'var(--space-xl)', ...CARD, borderLeft: '6px solid #dc2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} style={{ color: '#dc2626' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Needs Attention
                </h2>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 10px', border: '2px solid #000',
                  background: '#dc2626', color: '#fff'
                }}>
                  {flagged.length} flagged
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {flagged.sort((a, b) => (b.attentionReasons?.length || 0) - (a.attentionReasons?.length || 0)).map(s => (
                <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', border: '2px solid #000',
                  background: 'var(--surface)', textDecoration: 'none', color: 'inherit',
                  fontSize: '0.82rem', transition: 'transform 0.12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {s.avatar ? (
                    <img src={s.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 28, height: 28, border: '2px solid #000', background: 'var(--gray-300)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>{s.college || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {(s.attentionReasons || []).map((reason, i) => (
                      <span key={i} style={{
                        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                        padding: '2px 6px', border: '2px solid #000',
                        background: reason.includes('Inactive') ? '#fee2e2' : reason.includes('Bottom') ? '#fef3c7' : '#e0e7ff'
                      }}>
                        {reason}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════ */}
      {/* ENROLLED STUDENTS — in this batch       */}
      {/* ═══════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '1rem', fontWeight: 800, marginBottom: 'var(--space-sm)',
          display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)'
        }}>
          <Users size={16} /> Enrolled in this batch ({enrolledStudents.length})
        </h2>

        {/* Bulk bar — enrolled */}
        {enrolledSelected.length > 0 && (
          <div style={{
            ...CARD, marginBottom: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)',
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginRight: 4 }}>
              {enrolledSelected.length} selected
            </span>
            <button className="btn btn--sm"
              onClick={() => setConfirmAction({ type: 'remove', ids: enrolledSelected })}
              disabled={busy}>
              Remove from this Batch
            </button>
            <button className="btn btn--sm btn--danger"
              onClick={() => setConfirmAction({ type: 'removeCenter', ids: enrolledSelected })}
              disabled={busy}>
              <Trash2 size={12} /> Remove from Centre
            </button>
            <button className="btn btn--sm btn--ghost" onClick={() => setEnrolledSelected([])} disabled={busy}>
              Clear
            </button>
          </div>
        )}

        {/* Table — enrolled */}
        <div style={{ border: '3px solid var(--border-color)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '3px solid var(--border-color)',
                  textAlign: 'left', background: 'var(--bg-tertiary)'
                }}>
                  <th style={{ padding: '8px 10px', width: 36 }}>
                    <input type="checkbox"
                      checked={enrolledSelected.length === enrolledStudents.length && enrolledStudents.length > 0}
                      onChange={e => setEnrolledSelected(
                        e.target.checked ? enrolledStudents.map(s => s._id) : []
                      )} />
                  </th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Name</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Email</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>College</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <BookOpen size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} /> Course
                  </th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{
                      padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-tertiary)'
                    }}>
                      No students in this batch yet.
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 10px' }}>
                        <input type="checkbox"
                          checked={enrolledSelected.includes(s._id)}
                          onChange={e => setEnrolledSelected(prev =>
                            e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                          )} />
                      </td>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.displayName || s.username}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                        {s.email || '—'}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-primary)' }}>
                        {s.college || '—'}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        {s.courseOffering?.name ? (
                          <span style={{
                            padding: '2px 6px', border: '2px solid var(--border-color)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                            fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap'
                          }}>
                            {s.courseOffering.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <button className="btn btn--sm btn--danger"
                          onClick={() => handleSingleRemove(s)}
                          style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          <X size={10} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* UNASSIGNED — not in this batch          */}
      {/* ═══════════════════════════════════════ */}
      <section>
        <h2 style={{
          fontSize: '1rem', fontWeight: 800, marginBottom: 'var(--space-sm)',
          display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)'
        }}>
          <Users size={16} /> Students not in this batch ({unassignedStudents.length})
        </h2>

        {/* Bulk bar — unassigned */}
        {unassignedSelected.length > 0 && (
          <div style={{
            ...CARD, marginBottom: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)',
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginRight: 4 }}>
              {unassignedSelected.length} selected
            </span>
            <button className="btn btn--sm"
              onClick={() => setConfirmAction({ type: 'assign', ids: unassignedSelected })}
              disabled={busy}>
              Assign to {batch.name}
            </button>
            <button className="btn btn--sm btn--danger"
              onClick={() => setConfirmAction({ type: 'removeCenter', ids: unassignedSelected })}
              disabled={busy}>
              <Trash2 size={12} /> Remove from Centre
            </button>
            <button className="btn btn--sm btn--ghost" onClick={() => setUnassignedSelected([])} disabled={busy}>
              Clear
            </button>
          </div>
        )}

        {/* Table — unassigned */}
        <div style={{ border: '3px solid var(--border-color)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '3px solid var(--border-color)',
                  textAlign: 'left', background: 'var(--bg-tertiary)'
                }}>
                  <th style={{ padding: '8px 10px', width: 36 }}>
                    <input type="checkbox"
                      checked={unassignedSelected.length === unassignedStudents.length && unassignedStudents.length > 0}
                      onChange={e => setUnassignedSelected(
                        e.target.checked ? unassignedStudents.map(s => s._id) : []
                      )} />
                  </th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Name</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Email</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>College</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <BookOpen size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} /> Course
                  </th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Current Batch</th>
                </tr>
              </thead>
              <tbody>
                {unassignedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{
                      padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-tertiary)'
                    }}>
                      All centre students are already in this batch.
                    </td>
                  </tr>
                ) : (
                  unassignedStudents.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 10px' }}>
                        <input type="checkbox"
                          checked={unassignedSelected.includes(s._id)}
                          onChange={e => setUnassignedSelected(prev =>
                            e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                          )} />
                      </td>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.displayName || s.username}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                        {s.email || '—'}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-primary)' }}>
                        {s.college || '—'}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        {s.courseOffering?.name ? (
                          <span style={{
                            padding: '2px 6px', border: '2px solid var(--border-color)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                            fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap'
                          }}>
                            {s.courseOffering.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        {s.batch?.name ? (
                          <span style={{
                            padding: '2px 6px', border: '2px solid var(--border-color)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                            fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap'
                          }}>
                            {s.batch.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
                            Not assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Confirmation Modal ── */}
      {confirmAction && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--overlay)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-md)'
        }} onClick={() => setConfirmAction(null)}>
          <div style={{
            background: 'var(--bg-surface)', border: '4px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)', padding: 'var(--space-lg)', maxWidth: 460, width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {confirmAction.type === 'assign'
                ? 'Assign to Batch'
                : confirmAction.type === 'remove'
                  ? 'Remove from Batch'
                  : 'Remove from Centre'}
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
              {confirmAction.type === 'assign'
                ? `Assign ${confirmAction.ids.length} student(s) to ${batch.name}?`
                : confirmAction.type === 'remove'
                  ? `Remove ${confirmAction.ids.length} student(s) from ${batch.name}? They will become unassigned.`
                  : `Remove ${confirmAction.ids.length} student(s) from the centre? This cannot be undone.`}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={executeConfirm} disabled={busy}>
                {busy ? 'Working...' : confirmAction.type === 'assign'
                  ? 'Assign'
                  : confirmAction.type === 'remove'
                    ? 'Yes, remove from batch'
                    : 'Yes, remove from centre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
