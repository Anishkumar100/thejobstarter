import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Users, Search, User as UserIcon, Trash2, Layers, BookOpen } from 'lucide-react';

const CARD = {
  border: '3px solid #000',
  padding: 'var(--space-md)',
  background: 'var(--bg-surface)',
  boxShadow: '4px 4px 0 #000'
};

export default function CoordinatorStudentsList() {
  const [students, setStudents] = useState([]);
  const [center, setCenter] = useState(null);
  const [batches, setBatches] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkBatchId, setBulkBatchId] = useState('');
  const [bulkAction, setBulkAction] = useState(null); /* 'assign' | 'remove' | 'removeCenter' */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [studentsRes, batchesRes, courseRes] = await Promise.all([
        apiRequest('/coordinator/students'),
        apiRequest('/coordinator/batches'),
        apiRequest('/coordinator/course-offerings')
      ]);
      const roster = studentsRes.data;
      setStudents(roster.students || []);
      setCenter(roster.center);
      setBatches(batchesRes.data || []);
      setCourseOfferings(courseRes.data || []);
    } catch (err) {
      console.error('[COORD] Error:', err.message);
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const computeOverallPct = (progress) => {
    if (!progress) return 0;
    let total = 0, completed = 0;
    for (const sub of ['dsa', 'dbms', 'os', 'programming']) {
      const s = progress[sub]?.overall;
      if (s) { total += s.total; completed += s.completed; }
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const computeSubjectCounts = (progress, subject) => {
    if (!progress?.[subject]) return { completed: 0, total: 0 };
    const s = progress[subject];
    return { completed: s.overall?.completed || 0, total: s.overall?.total || 0 };
  };

  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        (s.displayName || '').toLowerCase().includes(term) ||
        (s.username || '').toLowerCase().includes(term) ||
        (s.college || '').toLowerCase().includes(term)
      );
    }
    if (courseFilter) {
      list = list.filter(s => {
        const sc = s.courseOffering?._id || s.courseOffering;
        return sc === courseFilter;
      });
    }
    list.sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case 'name': va = (a.displayName || a.username || '').toLowerCase(); vb = (b.displayName || b.username || '').toLowerCase(); break;
        case 'college': va = (a.college || '').toLowerCase(); vb = (b.college || '').toLowerCase(); break;
        case 'progress': va = computeOverallPct(a.progress); vb = computeOverallPct(b.progress); break;
        case 'joined': va = new Date(a.coachingCenterJoinedAt || 0).getTime(); vb = new Date(b.coachingCenterJoinedAt || 0).getTime(); break;
        default: va = a.displayName || ''; vb = b.displayName || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [students, searchTerm, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const SortArrow = ({ col }) => sortKey !== col ? null : (
    <span style={{ marginLeft: 2, fontSize: '0.6rem' }}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  );

  /* ── Bulk actions ── */

  const handleBulkAssign = async () => {
    if (!bulkBatchId || selectedIds.length === 0) return;
    setBusy(true);
    try {
      await apiRequest(`/coordinator/batches/${bulkBatchId}/assign-students`, {
        method: 'POST',
        body: JSON.stringify({ userIds: selectedIds })
      });
      setStudents(prev => prev.map(s => selectedIds.includes(s._id) ? { ...s, batch: { _id: bulkBatchId } } : s));
      setSelectedIds([]);
      setBulkBatchId('');
    } catch (err) {
      alert(err.message || 'Failed to assign students');
    }
    setBusy(false);
  };

  const handleBulkRemoveFromBatch = async () => {
    const toRemove = selectedIds.filter(id => {
      const s = students.find(st => st._id === id);
      return s?.batch;
    });
    if (toRemove.length === 0) return;
    setBusy(true);
    try {
      /* Group by batch */
      const groups = {};
      for (const sid of toRemove) {
        const s = students.find(st => st._id === sid);
        const bid = s.batch?._id || s.batch;
        if (bid) {
          if (!groups[bid]) groups[bid] = [];
          groups[bid].push(sid);
        }
      }
      for (const [bid, userIds] of Object.entries(groups)) {
        await apiRequest(`/coordinator/batches/${bid}/remove-students`, {
          method: 'POST',
          body: JSON.stringify({ userIds })
        });
      }
      setStudents(prev => prev.map(s => toRemove.includes(s._id) ? { ...s, batch: null } : s));
      setSelectedIds([]);
    } catch (err) {
      alert(err.message || 'Failed to remove students from batch');
    }
    setBusy(false);
  };

  const handleBulkRemoveFromCenter = async () => {
    setBusy(true);
    try {
      for (const sid of selectedIds) {
        await apiRequest(`/coordinator/students/${sid}/remove`, { method: 'PATCH' });
      }
      setStudents(prev => prev.filter(s => !selectedIds.includes(s._id)));
      setSelectedIds([]);
    } catch (err) {
      alert(err.message || 'Failed to remove students');
    }
    setBusy(false);
  };

  const executeBulkAction = () => {
    if (bulkAction === 'assign') handleBulkAssign();
    else if (bulkAction === 'remove' && confirmOpen) handleBulkRemoveFromBatch();
    else if (bulkAction === 'removeCenter' && confirmOpen) handleBulkRemoveFromCenter();
    setConfirmOpen(false);
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING STUDENTS..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>All Students — Coordinator</title></Helmet>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} /> All Students
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {center?.name ? `${center.name} — ` : ''}{students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search name, username, college..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '6px 10px 6px 28px', border: '2px solid #000', background: 'var(--bg-surface)', fontSize: '0.8rem', fontFamily: 'inherit', minWidth: 200, outline: 'none' }}
            />
          </div>
          <select
            className="input"
            style={{ fontSize: '0.78rem', padding: '4px 8px', width: 180 }}
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
          >
            <option value="">All courses</option>
            {courseOfferings.filter(c => c.status === 'active').map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          ...CARD, marginBottom: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)',
          display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, marginRight: 4 }}>
            {selectedIds.length} selected
          </span>

          <select
            className="input"
            style={{ fontSize: '0.78rem', padding: '4px 8px', width: 160 }}
            value={bulkBatchId}
            onChange={e => setBulkBatchId(e.target.value)}
          >
            <option value="">— Assign to batch —</option>
            {batches.filter(b => b.status === 'active').map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          <button className="btn btn--sm" onClick={() => { setBulkAction('assign'); handleBulkAssign(); }} disabled={busy || !bulkBatchId}>
            {busy ? 'Working...' : `Assign to Batch`}
          </button>

          <button className="btn btn--sm" onClick={() => { setBulkAction('remove'); setConfirmOpen(true); }} disabled={busy}>
            Remove from Batch
          </button>

          <button className="btn btn--sm btn--danger" onClick={() => { setBulkAction('removeCenter'); setConfirmOpen(true); }} disabled={busy}>
            <Trash2 size={12} /> Remove from Centre
          </button>

          <button className="btn btn--sm btn--ghost" onClick={() => setSelectedIds([])} disabled={busy}>
            Clear
          </button>
        </div>
      )}

      {/* Confirmation modal for remove actions */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)'
        }} onClick={() => setConfirmOpen(false)}>
          <div style={{
            background: 'var(--bg-surface)', border: '4px solid #000',
            boxShadow: '8px 8px 0 #000', padding: 'var(--space-lg)',
            maxWidth: 460, width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800 }}>
              {bulkAction === 'remove' ? 'Remove from Batch' : 'Remove from Centre'}
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
              {bulkAction === 'remove'
                ? `Remove ${selectedIds.length} student(s) from their current batch?`
                : `Remove ${selectedIds.length} student(s) from ${center?.name || 'this centre'}? This cannot be undone.`
              }
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="btn btn--danger" onClick={executeBulkAction} disabled={busy}>
                {busy ? 'Removing...' : 'Yes, remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Roster Table */}
      <div style={{ ...CARD }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', border: '2px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>{searchTerm ? 'No students match your search.' : 'No students linked yet.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 750 }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000' }}>
                  <th style={{ padding: '8px 10px', width: 36 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={e => setSelectedIds(e.target.checked ? filteredStudents.map(s => s._id) : [])}
                    />
                  </th>
                  {[
                    { key: 'name', label: 'Student' },
                    { key: 'college', label: 'College' },
                    { key: 'joined', label: 'Joined' },
                  { key: null, label: 'Batch' },
                  { key: null, label: 'Course', width: '100px' },
                  { key: null, label: 'DSA / DBMS / OS / PROG', width: '260px' },
                    { key: 'progress', label: 'Overall', width: '80px' },
                    { key: null, label: 'Action', width: '80px' },
                  ].map(col => (
                    <th key={col.label} style={{ padding: '8px 10px', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: col.key ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap', width: col.width || undefined }}
                      onClick={() => col.key && toggleSort(col.key)}>
                      {col.label} {col.key && <SortArrow col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const pct = computeOverallPct(student.progress);
                  const dsaC = computeSubjectCounts(student.progress, 'dsa');
                  const dbmsC = computeSubjectCounts(student.progress, 'dbms');
                  const osC = computeSubjectCounts(student.progress, 'os');
                  const progC = computeSubjectCounts(student.progress, 'programming');
                  return (
                    <tr key={student._id} style={{ borderBottom: '2px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                      <td style={{ padding: '8px 10px' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(student._id)}
                          onChange={e => {
                            setSelectedIds(prev =>
                              e.target.checked ? [...prev, student._id] : prev.filter(id => id !== student._id)
                            );
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {student.avatar ? (
                            <img src={student.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, border: '2px solid #000', background: 'var(--bg-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {student.displayName?.[0] || student.username?.[0] || '?'}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{student.displayName || student.username || 'Unknown'}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>@{student.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.72rem', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.college || '\u2014'}</td>
                      <td style={{ padding: '8px 10px', fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{student.coachingCenterJoinedAt ? new Date(student.coachingCenterJoinedAt).toLocaleDateString() : '\u2014'}</td>
                      <td style={{ padding: '8px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {student.batch?.name ? (
                          <span style={{
                            padding: '2px 6px', border: '2px solid var(--black)',
                            background: student.batch.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                            fontSize: '0.68rem', whiteSpace: 'nowrap'
                          }}>
                            {student.batch.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {student.courseOffering?.name ? (
                          <span style={{
                            padding: '2px 6px', border: '2px solid var(--black)',
                            background: 'var(--bg-tertiary)',
                            fontSize: '0.68rem', whiteSpace: 'nowrap'
                          }}>
                            {student.courseOffering.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 130 }}>
                          {[
                            { label: 'DSA', c: dsaC, color: '#6366f1' },
                            { label: 'DBMS', c: dbmsC, color: '#14b8a6' },
                            { label: 'OS', c: osC, color: '#f59e0b' },
                            { label: 'PROG', c: progC, color: '#a855f7' },
                          ].map(sub => {
                            const p = sub.c.total > 0 ? Math.round((sub.c.completed / sub.c.total) * 100) : 0;
                            return (
                              <div key={sub.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: '0.58rem', fontWeight: 600, width: 28, flexShrink: 0 }}>{sub.label}</span>
                                <div style={{ flex: 1, height: 5, background: '#e5e7eb', border: '1px solid #000' }}>
                                  <div style={{ height: '100%', width: `${p}%`, background: sub.color }} />
                                </div>
                                <span style={{ fontSize: '0.58rem', fontWeight: 700, minWidth: 26, textAlign: 'right' }}>{p}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: '0.85rem' }}>{pct}%</td>
                      <td style={{ padding: '8px 10px' }}>
                        <Link to={`/coordinator/students/${student._id}`} className="btn btn--sm" style={{ fontSize: '0.6rem', padding: '3px 8px', border: '2px solid #000', whiteSpace: 'nowrap' }}>
                          <UserIcon size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
