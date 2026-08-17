import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  Shield, Users, Layers, FileText, Mail, GraduationCap, ArrowLeft,
  BookOpen, Calendar, CheckCircle2, AlertTriangle, ExternalLink, Info
} from 'lucide-react';

const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };

/*
 * CoordinatorFacultyDetail — per-teacher page (coordinator view).
 * Shows everything about one faculty member:
 *   - how many batches they take and the batch details
 *   - how many students they take care of, with student details + progress
 *   - the plans and assignments THEY created (createdBy = this teacher)
 * All data comes from existing coordinator endpoints, filtered client-side.
 */
export default function CoordinatorFacultyDetail() {
  const { userId } = useParams();
  const [faculties, setFaculties] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Fetch everything in parallel, then derive the teacher's sections ── */
  useEffect(() => {
    console.log('[COORD] Loading faculty detail for:', userId);
    let cancelled = false;
    const load = async () => {
      try {
        const [fRes, sRes, pRes, aRes] = await Promise.all([
          apiRequest('/coordinator/faculties'),
          apiRequest('/coordinator/students'),
          apiRequest('/coordinator/plans'),
          apiRequest('/coordinator/assignments')
        ]);
        if (cancelled) return;
        setFaculties(fRes.data || []);
        setAllStudents(sRes.data?.students || []);
        setPlans(pRes.data || []);
        setAssignments(aRes.data || []);
      } catch (err) {
        console.error('[COORD] Faculty detail error:', err.message);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  /* The teacher's own doc (from the Manage Faculty list) */
  const teacher = faculties.find(f => f._id === userId) || null;

  /* Batches the teacher takes care of — their facultyBatches scope, populated with name/code/status/expectedStudents */
  const teacherBatches = teacher?.facultyBatches || [];

  /* Students under the teacher's care = non-faculty roster members whose batch is in the scope */
  const scopeIds = teacherBatches.map(b => (typeof b === 'object' && b._id) || b);
  const caredStudents = useMemo(() => {
    return allStudents.filter(s => {
      if (s.isFaculty) return false;
      const sb = s.batch?._id || s.batch;
      return scopeIds.includes(sb);
    });
  }, [allStudents, scopeIds]);

  /* Enrich cared students with computed progress (same math as the roster page) */
  const enrichedStudents = useMemo(() => {
    return caredStudents.map(s => {
      const prog = s.progress;
      let total = 0, completed = 0;
      for (const sub of ['dsa', 'dbms', 'os', 'programming', 'aptitude']) {
        const so = prog?.[sub]?.overall;
        if (so) { total += so.total; completed += so.completed; }
      }
      const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const pp = prog?.planProgress;
      const planCompletionPct = pp?.expectedCount > 0 ? Math.round((pp.completedCount / pp.expectedCount) * 100) : 0;
      return { ...s, _ov: overallPct, _pp: planCompletionPct };
    });
  }, [caredStudents]);

  /* Plans + assignments authored by THIS teacher */
  const plansCreated = plans.filter(p => p.createdBy?._id === userId);
  const assignmentsCreated = assignments.filter(a => a.createdBy?._id === userId);

  /* Per-batch student counts (students under care, grouped by batch) */
  const batchCounts = {};
  for (const s of caredStudents) {
    const sb = s.batch?._id || s.batch;
    batchCounts[sb] = (batchCounts[sb] || 0) + 1;
  }

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading teacher..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;
  if (!teacher) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD }}>Faculty member not found.</div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>{teacher.displayName || teacher.username} — Faculty — Coordinator — TheWebytes</title></Helmet>

      {/* ── Back link ── */}
      <Link to="/coordinator/faculties"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
        <ArrowLeft size={14} /> Back to Manage Faculty
      </Link>

      {/* ═══ TEACHER HEADER ═══ */}
      <div style={{ ...CARD, padding: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
          {teacher.avatar ? (
            <img src={teacher.avatar} alt="" style={{ width: 64, height: 64, border: '3px solid #000', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 64, height: 64, border: '3px solid #000', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={30} color="#fff" />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {teacher.displayName || teacher.username}
              <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', border: '2px solid #0f766e', background: '#ccfbf1', color: '#0f766e', textTransform: 'uppercase' }}>Faculty</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Mail size={11} /> @{teacher.username}{teacher.email ? ` · ${teacher.email}` : ''}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <GraduationCap size={11} />
              {teacher.batch ? `Their own batch: ${typeof teacher.batch === 'object' && teacher.batch.name ? teacher.batch.name : '—'}` : 'No personal batch'}
              {teacher.coachingCenterJoinedAt ? ` · joined ${new Date(teacher.coachingCenterJoinedAt).toLocaleDateString()}` : ''}
            </div>
          </div>
        </div>
        <Link to={`/coordinator/students/${teacher._id}`} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '7px 12px', border: '2px solid #000', boxShadow: '2px 2px 0 #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Users size={13} /> View as Student
        </Link>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 'var(--space-xl)' }}>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)', borderColor: '#0f766e' }}>
          <Layers size={22} style={{ color: '#0f766e', marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{teacherBatches.length}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Batches They Take</div>
        </div>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <Users size={22} style={{ marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{caredStudents.length}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Students in Care</div>
        </div>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <FileText size={22} style={{ marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{plansCreated.length}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plans Created</div>
        </div>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <CheckCircle2 size={22} style={{ marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{assignmentsCreated.length}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assignments Created</div>
        </div>
      </div>

      {/* ═══ BATCHES THEY TAKE ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-md)' }}>
          <Layers size={18} style={{ color: '#0f766e' }} /> Batches They Take ({teacherBatches.length})
        </h2>
        {teacherBatches.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} /> No batches assigned. Set their scope from the Manage Faculty page.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-sm)' }}>
            {teacherBatches.map(b => {
              const bid = (typeof b === 'object' && b._id) || b;
              const count = batchCounts[bid] || 0;
              return (
                <Link key={bid} to={`/coordinator/batches/${bid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '2px solid #000', padding: 'var(--space-sm)', background: 'var(--bg-tertiary)', transition: 'transform 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof b === 'object' ? b.name : 'Unknown batch'}
                      </strong>
                      <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', border: '2px solid #000', background: (typeof b === 'object' && b.status) === 'active' ? '#f0fdf4' : 'var(--bg-surface)', whiteSpace: 'nowrap' }}>
                        {typeof b === 'object' ? (b.status || '—') : '—'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{count} student{count !== 1 ? 's' : ''}</span>
                      {typeof b === 'object' && b.code && <span style={{ fontFamily: 'monospace' }}>{b.code}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ STUDENTS IN CARE ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-md)' }}>
          <Users size={18} /> Students Under Care ({enrichedStudents.length})
        </h2>
        {enrichedStudents.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} /> No students in the assigned batches yet.
          </p>
        ) : (
          <div style={{ border: '3px solid #000', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '3px solid #000', textAlign: 'left', background: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Name</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Batch</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Course</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Plan Pace</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}
                      title="Share of the student's total course content (DSA, DBMS, OS, Programming & Aptitude lessons, subtopics and problems) completed so far — across the whole platform, not just the current plan.">
                      Overall %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedStudents.map(s => {
                    const pp = s.progress?.planProgress;
                    const paceColors = { ahead: '#16a34a', 'on-track': '#2563eb', behind: '#dc2626', 'just-started': 'var(--text-tertiary)' };
                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid var(--gray-300)' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>
                          <Link to={`/coordinator/students/${s._id}`} style={{ textDecoration: 'none', color: 'inherit' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; }}>
                            {s.displayName || s.username}
                          </Link>
                        </td>
                        <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{s.batch?.name || '—'}</td>
                        <td style={{ padding: '6px 10px' }}>
                          {s.courseOffering?.name ? (
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', border: '2px solid #000', background: 'var(--bg-tertiary)', whiteSpace: 'nowrap' }}>
                              {s.courseOffering.name}
                            </span>
                          ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          {pp ? (
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', border: '2px solid #000', color: pp.status === 'completed' ? '#065f46' : (paceColors[pp.paceStatus] || 'var(--text-tertiary)') }}>
                              {pp.status === 'completed' ? 'Completed' : (pp.paceStatus === 'just-started' ? 'Started' : (pp.paceStatus || '—'))}
                            </span>
                          ) : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>—</span>}
                        </td>
                        <td style={{ padding: '6px 10px', fontWeight: 800 }}>{s._ov}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Legend for the Overall % column — what it actually means */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '8px 12px', borderTop: '3px solid #000',
              background: 'var(--bg-tertiary)', fontSize: '0.68rem',
              color: 'var(--text-tertiary)', lineHeight: 1.5
            }}>
              <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Overall %</strong> = share of the student&apos;s total course
                content completed so far (lessons, subtopics and problems across DSA, DBMS, OS, Programming
                &amp; Aptitude). It reflects overall platform progress, not just progress in the plan shown
                beside it.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ PLANS THEY CREATED ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-md)' }}>
          <BookOpen size={18} /> Plans Created ({plansCreated.length})
        </h2>
        {plansCreated.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>No plans created by this teacher yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {plansCreated.map(p => (
              <Link key={p._id} to={`/coordinator/plans/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '2px solid #000', background: 'var(--bg-tertiary)', transition: 'transform 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <FileText size={14} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{p.name}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                      {p.durationDays} day{p.durationDays !== 1 ? 's' : ''} · {p.items?.length || 0} items · created {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', border: '2px solid #000', background: p.status === 'published' ? '#f0fdf4' : 'var(--bg-surface)', whiteSpace: 'nowrap' }}>
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ASSIGNMENTS THEY CREATED ═══ */}
      <div style={{ ...CARD }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-md)' }}>
          <CheckCircle2 size={18} /> Assignments Created ({assignmentsCreated.length})
        </h2>
        {assignmentsCreated.length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>No assignments created by this teacher yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assignmentsCreated.map(a => {
              const stats = a._submissionStats || {};
              return (
                <Link key={a._id} to={`/coordinator/assignments/${a._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '2px solid #000', background: 'var(--bg-tertiary)', transition: 'transform 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <ExternalLink size={14} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{a.title}</span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                        {a.batch?.name ? `for ${a.batch.name} · ` : ''}{a.startDate ? new Date(a.startDate).toLocaleDateString() : ''} → {a.endDate ? new Date(a.endDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '2px 8px', border: '2px solid #000', background: 'var(--bg-surface)', whiteSpace: 'nowrap' }}>
                      {stats.total || 0}/{stats.totalStudents || 0} submitted
                    </span>
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', border: '2px solid #000', background: a.status === 'active' ? '#f0fdf4' : 'var(--bg-surface)', whiteSpace: 'nowrap' }}>
                      {a.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}