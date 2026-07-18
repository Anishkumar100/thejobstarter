import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Users, Search, User as UserIcon } from 'lucide-react';

const CARD = {
  border: '3px solid #000',
  padding: 'var(--space-md)',
  background: 'var(--bg-surface)',
  boxShadow: '4px 4px 0 #000'
};

export default function CoordinatorStudentsList() {
  const [students, setStudents] = useState([]);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiRequest('/coordinator/students');
      const roster = res.data;
      setStudents(roster.students || []);
      setCenter(roster.center);
    } catch (err) {
      console.error('[COORD] Error:', err.message);
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const computeOverallPct = (progress) => {
    if (!progress) return 0;
    let total = 0, completed = 0;
    for (const sub of ['dsa', 'dbms', 'os']) {
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
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search name, username, college..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '6px 10px 6px 28px', border: '2px solid #000', background: 'var(--bg-surface)', fontSize: '0.8rem', fontFamily: 'inherit', minWidth: 200, outline: 'none' }}
          />
        </div>
      </div>

      {/* Student Roster Table */}
      <div style={{ ...CARD }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', border: '2px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>{searchTerm ? 'No students match your search.' : 'No students linked yet.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000' }}>
                  {[
                    { key: 'name', label: 'Student' },
                    { key: 'college', label: 'College' },
                    { key: 'joined', label: 'Joined' },
                    { key: null, label: 'DSA / DBMS / OS', width: '200px' },
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
                  return (
                    <tr key={student._id} style={{ borderBottom: '2px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
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
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 130 }}>
                          {[
                            { label: 'DSA', c: dsaC, color: '#6366f1' },
                            { label: 'DBMS', c: dbmsC, color: '#14b8a6' },
                            { label: 'OS', c: osC, color: '#f59e0b' },
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
