import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Users, Search, User as UserIcon, Trash2, Layers, BookOpen, Download } from 'lucide-react';

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

  /*
   * Filtered + sorted + enriched — single useMemo.
   * Enriches each student with pre-computed progress values during the map,
   * so the render loop never recalculates them.
   */
  const filteredStudents = useMemo(() => {
    let list = students.map(s => {
      const prog = s.progress;
      /* Overall % across all subjects */
      let total = 0, completed = 0;
      for (const sub of ['dsa', 'dbms', 'os', 'programming']) {
        const so = prog?.[sub]?.overall;
        if (so) { total += so.total; completed += so.completed; }
      }
      const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      /* Per-subject counts */
      const subjectCounts = {};
      for (const sub of ['dsa', 'dbms', 'os', 'programming']) {
        const so = prog?.[sub]?.overall;
        subjectCounts[sub] = { completed: so?.completed || 0, total: so?.total || 0 };
      }

      /* Plan progress */
      const pp = prog?.planProgress;
      const planCompletionPct = pp?.expectedCount > 0 ? Math.round((pp.completedCount / pp.expectedCount) * 100) : 0;
      const behindItems = pp?.itemsBehind?.length || 0;

      return { ...s, _ov: overallPct, _sc: subjectCounts, _pp: planCompletionPct, _bi: behindItems };
    });

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
        case 'progress': va = a._ov; vb = b._ov; break;
        case 'joined': va = new Date(a.coachingCenterJoinedAt || 0).getTime(); vb = new Date(b.coachingCenterJoinedAt || 0).getTime(); break;
        default: va = a.displayName || ''; vb = b.displayName || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [students, searchTerm, sortKey, sortDir, courseFilter]);

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

  /*
   * Export filtered students to CSV with all details
   */
  const exportCSV = () => {
    const esc = v => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = [['Name','Username','Email','College','Joined Date','Batch','Course Offerinng','Plan Name','Plan Day','Plan Duration','Plan Progress %','Plan Completed','Plan Expected','Pending Items','DSA %','DSA Completed','DSA Total','DBMS %','DBMS Completed','DBMS Total','OS %','OS Completed','OS Total','Programming %','Programming Completed','Programming Total','Overall %']];
    for (const s of filteredStudents) {
      const pp = s.progress?.planProgress;
      const subC = s._sc;
      const ds = subC.dsa, db = subC.dbms, os = subC.os, pr = subC.programming;
      const dsaP = ds.total > 0 ? Math.round((ds.completed / ds.total) * 100) : 0;
      const dbmsP = db.total > 0 ? Math.round((db.completed / db.total) * 100) : 0;
      const osP = os.total > 0 ? Math.round((os.completed / os.total) * 100) : 0;
      const progP = pr.total > 0 ? Math.round((pr.completed / pr.total) * 100) : 0;
      rows.push([
        s.displayName || s.username || '', s.username || '', s.email || '',
        s.college || '', s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toLocaleDateString() : '',
        s.batch?.name || '', s.courseOffering?.name || '',
        pp?.planName || '', pp?.currentDayOffset ?? '', pp?.durationDays ?? '',
        s._pp, pp?.completedCount ?? 0, pp?.expectedCount ?? 0, s._bi,
        dsaP, ds.completed, ds.total,
        dbmsP, db.completed, db.total,
        osP, os.completed, os.total,
        progP, pr.completed, pr.total,
        s._ov
      ]);
    }
    const csv = rows.map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `students_${center?.name || 'center'}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <button onClick={exportCSV} title="Export filtered students to CSV" style={{ padding: '6px 12px', border: '2px solid #000', background: 'var(--bg-surface)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}>
            <Download size={14} /> CSV
          </button>
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

      {/* Metric explanations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--space-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '10px 14px', border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
        <div><strong style={{ color: 'var(--text-primary)' }}>[Plan-Specific] Plan Progress</strong> — cumulative from Day 1 through today. Items completed ÷ all items assigned so far. Bar: <span style={{ color: '#16a34a', fontWeight: 700 }}>green ≥60%</span>, <span style={{ color: '#eab308', fontWeight: 700 }}>yellow 30-59%</span>, <span style={{ color: '#dc2626', fontWeight: 700 }}>red &lt;30%</span>. Pace badge: ahead ≥90%, on-track ≥60%, behind &lt;60%.</div>
        <div><strong style={{ color: 'var(--text-primary)' }}>[Plan-Specific] Pending Items</strong> — items assigned from Day 1 through today that the student has NOT completed yet. Count shown in red.</div>
        <div><strong style={{ color: 'var(--text-primary)' }}>[Not Plan-Specific] Subject Progress</strong> — all content ever completed in that subject across all topics (lessons, subtopics, problems). Not tied to the plan.</div>
        <div><strong style={{ color: 'var(--text-primary)' }}>[Not Plan-Specific] Overall</strong> — % of ALL content completed across all 4 subjects (DSA, DBMS, OS, Programming). Not tied to the plan.</div>
      </div>

      {/* Student Roster Table */}
      <div style={{ ...CARD }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', border: '2px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>{searchTerm ? 'No students match your search.' : 'No students linked yet.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 900 }}>
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
                    { key: null, label: 'Batch / Course' },
                    { key: null, label: 'Plan', width: '130px' },
                    { key: null, label: 'Plan Progress', width: '280px', title: '[Plan-Specific] Cumulative from Day 1 through today. Items completed ÷ all items assigned so far. Bar: green >=60%, yellow 30-59%, red <30%. Pace: ahead >=90%, on-track >=60%, behind <60%.' },
                    { key: null, label: 'Pending Items', width: '90px', title: '[Plan-Specific] Items assigned from Day 1 through today not yet completed. Cumulative.' },
                    { key: null, label: 'Subject Progress', width: '200px', title: 'Not plan-specific. All content completed in that subject.' },
                    { key: 'progress', label: 'Overall', width: '70px', title: 'Not plan-specific. % of ALL content completed across all subjects.' },
                    { key: null, label: 'Action', width: '70px' },
                  ].map(col => (
                    <th key={col.label} title={col.title || ''} style={{ padding: '8px 10px', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: col.key ? 'pointer' : col.title ? 'help' : 'default', userSelect: 'none', whiteSpace: 'nowrap', width: col.width || undefined }}
                      onClick={() => col.key && toggleSort(col.key)}>
                      {col.label} {col.key && <SortArrow col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const pp = student.progress?.planProgress;
                  const paceColors = { ahead: '#16a34a', 'on-track': '#2563eb', behind: '#dc2626', 'just-started': 'var(--text-tertiary)' };
                  const subC = student._sc;
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
                        <Link to={`/coordinator/students/${student._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {student.avatar ? (
                            <img src={student.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, border: '2px solid #000', background: 'var(--bg-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {student.displayName?.[0] || student.username?.[0] || '?'}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{student.displayName || student.username || 'Unknown'}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>@{student.username} · {student.college || '—'}</div>
                          </div>
                        </Link>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {student.college ? (
                          <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span>{student.college}</span>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.62rem' }}>
                              {student.coachingCenterJoinedAt ? `Joined ${new Date(student.coachingCenterJoinedAt).toLocaleDateString()}` : ''}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {student.batch?.name ? (
                            <span style={{ padding: '1px 5px', border: '2px solid #000', background: student.batch.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)', fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
                              {student.batch.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>No batch</span>
                          )}
                          {student.courseOffering?.name && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{student.courseOffering.name}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {pp ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link to={`/coordinator/plans/${pp.planId}`} style={{ fontSize: '0.65rem', fontWeight: 600, textDecoration: 'none', color: 'var(--accent)' }}
                              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}>
                              {pp.planName || 'Plan'}
                            </Link>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                              Day {pp.currentDayOffset}/{pp.durationDays}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px' }} title={pp ? `[Plan-Specific] Cumulative from Day 1 through today. Plan: ${pp.planName || ''}, Day ${pp.currentDayOffset}/${pp.durationDays}. Completed ${pp.completedCount} of ${pp.expectedCount} items assigned so far (${student._pp}%). Pace: ${pp.paceStatus}. Pending: ${student._bi} items.` : 'No plan assigned to this student.'}>
                        {pp ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <div style={{ flex: 1, height: 8, background: '#e5e7eb', border: '2px solid #000', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${student._pp}%`, background: student._pp >= 60 ? '#16a34a' : student._pp >= 30 ? '#eab308' : '#dc2626', transition: 'width 0.3s' }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 30, textAlign: 'right' }}>{student._pp}%</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}>
                              <span style={{
                                fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                                padding: '1px 5px', border: '2px solid #000',
                                color: paceColors[pp.paceStatus] || 'var(--text-tertiary)'
                              }}>
                                {pp.paceStatus === 'just-started' ? 'Started' : pp.paceStatus}
                              </span>
                              <span style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>
                                {pp.completedCount}/{pp.expectedCount} done
                              </span>
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                              Cumulative: {pp.completedCount}/{pp.expectedCount} items since Day 1
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }} title={pp && student._bi > 0 ? `[Plan-Specific] Items assigned from Day 1 through today that ${student.displayName || student.username} has not completed yet.` : pp && student._bi === 0 ? 'All items assigned so far are completed.' : ''}>
                        {pp && student._bi > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626' }}>
                              {student._bi} overdue
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                              since Day 1 (cumulative)
                            </span>
                          </div>
                        ) : pp ? (
                          <span style={{ fontSize: '0.6rem', color: '#16a34a', fontWeight: 600 }} title="All items assigned so far are completed.">All caught up</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 120 }}>
                          {[
                            { label: 'DSA', key: 'dsa', color: '#6366f1' },
                            { label: 'DBMS', key: 'dbms', color: '#14b8a6' },
                            { label: 'OS', key: 'os', color: '#f59e0b' },
                            { label: 'PROG', key: 'programming', color: '#a855f7' },
                          ].map(sub => {
                            const sc = subC[sub.key] || { completed: 0, total: 0 };
                            const p = sc.total > 0 ? Math.round((sc.completed / sc.total) * 100) : 0;
                            return (
                              <div key={sub.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontSize: '0.5rem', fontWeight: 700, width: 24, flexShrink: 0, textAlign: 'right' }}>{sub.label}</span>
                                <div style={{ flex: 1, height: 4, background: '#e5e7eb', border: '1px solid #000' }}>
                                  <div style={{ height: '100%', width: `${p}%`, background: sub.color }} />
                                </div>
                                <span style={{ fontSize: '0.52rem', fontWeight: 700, minWidth: 22, textAlign: 'right' }}>{p}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>{student._ov}%</td>
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
