import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import {
  Users, BarChart3, PieChart as PieChartIcon, TrendingUp,
  BookOpen, Database, Cpu, CheckCircle2, Award, Target,
  Calendar, ClipboardList, GraduationCap, ArrowRight, Lightbulb, Download, Code2, Layers,
  AlertCircle, CheckCircle
} from 'lucide-react';

const PIE_COLORS = ['var(--success)', 'var(--error)', 'var(--text-tertiary)'];
const SUBJECT_COLORS = { DSA: '#6366f1', DBMS: '#14b8a6', OS: '#f59e0b', PROG: '#a855f7' };

/*
 * BRUTALIST CARD — sharp corners, thick solid border, hard offset shadow
 */
const CARD = {
  border: '4px solid #000',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: '8px 8px 0 #000'
};

const CHART_TOOLTIP = {
  background: 'var(--bg-surface)',
  border: '4px solid #000',
  padding: '12px 16px',
  fontSize: '0.82rem',
  boxShadow: '6px 6px 0 #000'
};

export default function CoordinatorDashboard() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [center, setCenter] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [studentsRes, statsRes, batchesRes] = await Promise.all([
        apiRequest('/coordinator/students'),
        apiRequest('/coordinator/stats'),
        apiRequest('/coordinator/batches')
      ]);
      const roster = studentsRes.data;
      setStudents(roster.students || []);
      setCenter(roster.center);
      setStats(statsRes.data);
      setBatches(batchesRes.data || []);
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

  const getScoreGrade = (score) => {
    if (score === null || score === undefined) return { label: 'N/A', color: 'var(--text-tertiary)' };
    if (score >= 90) return { label: 'Excellent', color: '#059669' };
    if (score >= 70) return { label: 'Good', color: '#15803d' };
    if (score >= 50) return { label: 'Average', color: '#d97706' };
    return { label: 'Needs Work', color: '#dc2626' };
  };

  /* ── Chart data ── */

  const subjectChartData = useMemo(() => {
    if (!students.length) return [];
    let dsaT = 0, dsaD = 0, dbmsT = 0, dbmsD = 0, osT = 0, osD = 0, progT = 0, progD = 0;
    for (const s of students) {
      const p = s.progress;
      if (!p) continue;
      if (p.dsa?.overall) { dsaT += p.dsa.overall.total; dsaD += p.dsa.overall.completed; }
      if (p.dbms?.overall) { dbmsT += p.dbms.overall.total; dbmsD += p.dbms.overall.completed; }
      if (p.os?.overall) { osT += p.os.overall.total; osD += p.os.overall.completed; }
      if (p.programming?.overall) { progT += p.programming.overall.total; progD += p.programming.overall.completed; }
    }
    return [
      { key: 'dsa', subject: 'DSA', done: dsaD, total: dsaT, pct: dsaT > 0 ? Math.round((dsaD / dsaT) * 100) : 0, left: Math.max(0, dsaT - dsaD) },
      { key: 'dbms', subject: 'DBMS', done: dbmsD, total: dbmsT, pct: dbmsT > 0 ? Math.round((dbmsD / dbmsT) * 100) : 0, left: Math.max(0, dbmsT - dbmsD) },
      { key: 'os', subject: 'OS', done: osD, total: osT, pct: osT > 0 ? Math.round((osD / osT) * 100) : 0, left: Math.max(0, osT - osD) },
      { key: 'programming', subject: 'PROG', done: progD, total: progT, pct: progT > 0 ? Math.round((progD / progT) * 100) : 0, left: Math.max(0, progT - progD) },
    ];
  }, [students]);

  const overallChartData = useMemo(() => {
    if (!stats?.aggregate) return [];
    const total = stats.aggregate.overall.total;
    const done = stats.aggregate.overall.completed;
    const left = total - done;
    if (total === 0) return [{ name: 'No data yet', value: 1, fill: 'var(--text-tertiary)' }];
    return [
      { name: `Done (${done})`, value: done, fill: '#059669' },
      { name: `Remaining (${left})`, value: left, fill: '#dc2626' },
    ];
  }, [stats]);

  const distributionData = useMemo(() => {
    const brackets = [
      { range: '0–10%', min: 0, max: 10, count: 0, color: '#991b1b', desc: 'Just starting out' },
      { range: '11–25%', min: 11, max: 25, count: 0, color: '#b45309', desc: 'Beginning to explore' },
      { range: '26–50%', min: 26, max: 50, count: 0, color: '#d97706', desc: 'Building momentum' },
      { range: '51–75%', min: 51, max: 75, count: 0, color: '#15803d', desc: 'Making solid progress' },
      { range: '76–90%', min: 76, max: 90, count: 0, color: '#166534', desc: 'Almost there' },
      { range: '91–100%', min: 91, max: 100, count: 0, color: '#059669', desc: 'Fully on track' },
    ];
    for (const s of students) {
      const pct = computeOverallPct(s.progress);
      for (const b of brackets) {
        if (pct >= b.min && pct <= b.max) { b.count++; break; }
      }
    }
    return brackets;
  }, [students]);

  const weeklyActivity = useMemo(() => {
    const dayBuckets = {};
    for (const s of students) {
      if (!s.coachingCenterJoinedAt) continue;
      const d = new Date(s.coachingCenterJoinedAt);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayBuckets[key] = (dayBuckets[key] || 0) + 1;
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => ({ day: d, joins: dayBuckets[d] || 0 }));
  }, [students]);

  /* States */
  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING DASHBOARD..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: 'var(--error-bg)' }}><strong style={{ fontSize: '0.9rem' }}>Error loading dashboard</strong><p style={{ marginTop: 4, fontSize: '0.82rem' }}>{error}</p></div></div>;
  if (!center) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}><h2>No Center Assigned</h2><p style={{ color: 'var(--text-tertiary)', marginTop: 4 }}>You are not yet assigned as a coordinator for any centre. Contact your admin to set this up.</p></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1440, margin: '0 auto' }}>
      <Helmet><title>Dashboard — {center.name} — Coordinator</title></Helmet>

      {/* ═══ HEADER ═══ */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: 4, letterSpacing: '-0.02em' }}>
              <GraduationCap size={24} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              {center.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '3px 12px', border: '3px solid #000',
                background: center.status === 'active' ? 'var(--success-bg)' : center.status === 'trial' ? 'var(--warning-bg)' : 'var(--error-bg)',
                boxShadow: '3px 3px 0 #000'
              }}>
                {center.status}
              </span>
              {center.code && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Join Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.15em', color: '#000' }}>{center.code}</strong>
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-tertiary)' }}>
              <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              <strong style={{ color: '#000' }}>{students.length}</strong> student{students.length !== 1 ? 's' : ''} enrolled
            </div>
            <button
              onClick={async () => {
                try {
                  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                  const token = await window.Clerk?.session?.getToken();
                  const res = await fetch(`${API_BASE}/coordinator/export`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  });
                  if (!res.ok) throw new Error('Export failed');
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  const slug = (center?.name || 'center').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  a.download = `${slug}_student_progress_${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('[COORD] Export error:', err.message);
                }
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 14px',
                border: '3px solid #000',
                background: 'var(--bg-surface)',
                boxShadow: '3px 3px 0 #000',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'inherit',
                transition: 'transform 0.12s, box-shadow 0.12s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #000'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ═══ NEEDS ATTENTION ═══ */}
      {(() => {
        const flagged = students.filter(s => s.needsAttention);
        return (
          <div style={{ marginBottom: 'var(--space-xl)', ...CARD, borderLeft: '8px solid #dc2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={20} style={{ color: '#dc2626' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Needs Attention
                </h2>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 10px', border: '2px solid #000',
                  background: flagged.length > 0 ? '#dc2626' : 'var(--success)',
                  color: '#fff'
                }}>
                  {flagged.length} flagged
                </span>
              </div>
            </div>

            {flagged.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--text-tertiary)' }}>
                <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No students need attention right now</span>
              </div>
            ) : (
              <>
                {/* Batch breakdown mini bar */}
                {(() => {
                  const batchCounts = {};
                  flagged.forEach(s => {
                    const name = s.batch?.name || 'Unassigned';
                    batchCounts[name] = (batchCounts[name] || 0) + 1;
                  });
                  const total = flagged.length;
                  return (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                      {Object.entries(batchCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                        <span key={name} style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
                          border: '2px solid #000', background: name === 'Unassigned' ? 'var(--surface-alt)' : 'var(--surface)'
                        }}>
                          {name} <strong>({count})</strong>
                        </span>
                      ))}
                    </div>
                  );
                })()}

                {/* Student rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {flagged.sort((a, b) => (b.attentionReasons?.length || 0) - (a.attentionReasons?.length || 0)).map(s => (
                    <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', border: '2px solid #000',
                      background: 'var(--surface)', textDecoration: 'none', color: 'inherit',
                      transition: 'transform 0.12s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {s.avatar ? (
                        <img src={s.avatar} alt="" style={{ width: 32, height: 32, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, border: '2px solid #000', background: 'var(--gray-300)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.displayName || s.username}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                          {s.batch?.name || 'No batch'} · {s.college || '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: '0 1 auto', maxWidth: '50%', justifyContent: 'flex-end' }}>
                        {(s.attentionReasons || []).map((reason, i) => (
                          <span key={i} style={{
                            fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 8px', border: '2px solid #000',
                            background: reason.includes('Inactive') ? '#fee2e2' : reason.includes('Bottom') ? '#fef3c7' : '#e0e7ff',
                            whiteSpace: 'nowrap'
                          }}>
                            {reason}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* ═══ STATS CARDS ═══ */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          {[
            { icon: Users, label: 'Total Students', value: stats.totalStudents, sub: 'enrolled in this centre', color: '#000' },
            { icon: BarChart3, label: 'Overall Progress', value: `${stats.aggregate?.overall?.percentage || 0}%`, sub: `${stats.aggregate?.overall?.completed || 0} of ${stats.aggregate?.overall?.total || 0} items completed`, color: (stats.aggregate?.overall?.percentage || 0) >= 50 ? 'var(--success)' : 'var(--error)' },
            { icon: Target, label: 'Average Quiz Score', value: stats.quizzes?.averageScore !== null ? `${stats.quizzes.averageScore}%` : 'N/A', sub: `Based on ${stats.quizzes?.totalTaken || 0} quiz attempts across all students`, color: getScoreGrade(stats.quizzes?.averageScore).color },
            { icon: CheckCircle2, label: 'Items Completed', value: stats.aggregate?.overall?.completed || 0, sub: `out of ${stats.aggregate?.overall?.total || 0} total (lessons + topics + problems)`, color: '#000' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ ...CARD, boxShadow: '6px 6px 0 #000' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.4 }}>{card.sub}</div>
              </div>
            );
          })}
          <div style={{ ...CARD, boxShadow: '6px 6px 0 #000' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><TrendingUp size={18} /><span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>Quiz Participation</span></div>
            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#14b8a6', lineHeight: 1 }}>{Math.round((stats.studentsWithQuizzes / (stats.totalStudents || 1)) * 100)}%</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{stats.studentsWithQuizzes} of {stats.totalStudents} students have attempted quizzes</div>
          </div>
        </div>
      )}

      {/* ═══ BATCHES SECTION ═══ */}
      {batches.length > 0 && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={20} /> Batches ({batches.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
            {batches.map(b => {
              const studentCount = students.filter(s => {
                const bid = s.batch?._id || s.batch;
                return bid === b._id;
              }).length;
              return (
                <div key={b._id} style={{ border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{b.name}</h3>
                    <span style={{
                      padding: '2px 6px', border: '2px solid var(--black)',
                      background: b.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                      fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>
                      Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{b.code}</strong>
                    </span>
                    <span>
                      <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      <strong>{studentCount}</strong> student{studentCount !== 1 ? 's' : ''}
                      {b.expectedStudents ? ` / ${b.expectedStudents} expected` : ''}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      Created {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CHARTS ROW 1 ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>

        {/* ─── CHART 1: Subject Completion (Stacked Bar) ─── */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <BarChart3 size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Subject Completion — Who Has Done What?</h3>
          </div>
          <div style={{
            marginBottom: 'var(--space-md)', fontSize: '0.8rem', lineHeight: 1.6,
            padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)'
          }}>
            <p>
              <strong>What this shows:</strong> This stacked bar chart compares how many learning items (lessons, topics, and problems combined) your students have completed across each subject — <strong>DSA</strong> (Data Structures & Algorithms), <strong>DBMS</strong> (Database Management Systems), <strong>OS</strong> (Operating Systems), and <strong>PROG</strong> (Programming Concepts).
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>How to read it:</strong> The <span style={{ color: 'var(--success)', fontWeight: 700 }}>green</span> section of each bar shows items that have been completed by all your students combined. The <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>gray</span> section shows items still remaining. The number written <em>inside</em> the green bar is the count of completed items. Hover over a bar to see the exact numbers.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Why it matters:</strong> A subject where the green bar is much shorter than the gray bar tells you that students are falling behind in that area. If DSA is mostly gray while DBMS is mostly green, you may want to encourage more DSA practice sessions.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Items completed', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <RechartTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload;
                return (
                  <div style={CHART_TOOLTIP}>
                    <p style={{ fontWeight: 800, marginBottom: 4, fontSize: '0.85rem' }}>{p.subject}</p>
                    <p style={{ color: 'var(--success)', fontWeight: 600 }}>Done: {p.done} items</p>
                    <p style={{ color: 'var(--error)', fontWeight: 600 }}>Remaining: {p.left} items</p>
                    <p style={{ fontWeight: 700, marginTop: 4, borderTop: '2px solid #000', paddingTop: 4 }}>{p.pct}% complete</p>
                  </div>
                );
              }} />
              <Bar dataKey="done" name="Completed" stackId="a" fill="var(--success)" stroke="#000" strokeWidth={1}>
                <LabelList dataKey="done" position="inside" fill="var(--text-inverse)" fontSize={12} fontWeight={800} />
              </Bar>
              <Bar dataKey="left" name="Remaining" stackId="a" fill="var(--bg-tertiary)" stroke="#000" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8, flexWrap: 'wrap', gap: 6 }}>
            {subjectChartData.map(d => (
              <div key={d.subject} style={{ textAlign: 'center', padding: '4px 14px', border: '3px solid #000', background: 'var(--bg-tertiary)', boxShadow: '3px 3px 0 #000' }}>
                <span style={{ fontWeight: 800, color: SUBJECT_COLORS[d.subject] }}>{d.subject}: {d.pct}%</span>
                <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.68rem' }}>({d.done}/{d.total} items)</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CHART 2: Overall Completion (Donut) ─── */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <PieChartIcon size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Overall Completion — The Big Picture</h3>
          </div>
          <div style={{
            marginBottom: 'var(--space-md)', fontSize: '0.8rem', lineHeight: 1.6,
            padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)'
          }}>
            <p>
              <strong>What this shows:</strong> This donut chart takes everything your students are learning — across <strong>all four subjects (DSA, DBMS, OS, and PROG)</strong> and all content types (lessons, topics, problems) — and shows you how much has been completed in total.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>How to read it:</strong> The <span style={{ color: 'var(--success)', fontWeight: 700 }}>green</span> slice represents the total number of items that have been completed across your entire batch of students. The <span style={{ color: 'var(--error)', fontWeight: 700 }}>red</span> slice is what still needs to be done. The larger the green slice, the more progress your batch has made overall. Hover over each slice to see the exact count.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Why it matters:</strong> This is your at-a-glance health check. If the green slice is noticeably smaller than the red one, your batch needs more structured study time. A batch that is 70%+ complete is in great shape for placements.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={overallChartData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={4} dataKey="value" stroke="#000" strokeWidth={2}>
                {overallChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill || PIE_COLORS[i]} />
                ))}
              </Pie>
              <RechartTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                return (
                  <div style={CHART_TOOLTIP}>
                    <p style={{ color: p.color || p.fill, fontWeight: 800, fontSize: '0.85rem' }}>{p.name}</p>
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
          {stats?.aggregate?.overall?.total > 0 && (
            <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, marginTop: 6, padding: '6px 0', border: '3px solid #000', background: 'var(--bg-tertiary)', boxShadow: '3px 3px 0 #000' }}>
              Overall completion across all students: <span style={{ color: (stats.aggregate.overall.percentage || 0) >= 50 ? 'var(--success)' : 'var(--error)' }}>{stats.aggregate.overall.percentage}%</span>
            </div>
          )}
        </div>

        {/* ─── CHART 3: Student Distribution ─── */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <TrendingUp size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Where Your Students Stand — Progress Breakdown</h3>
          </div>
          <div style={{
            marginBottom: 'var(--space-md)', fontSize: '0.8rem', lineHeight: 1.6,
            padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)'
          }}>
            <p>
              <strong>What this shows:</strong> This horizontal bar chart divides your students into <strong>6 progress brackets</strong> based on their overall completion percentage. It helps you quickly see whether most of your batch is ahead, behind, or spread across different levels.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>How to read it:</strong> Each bracket (0–10%, 11–25%, 26–50%, 51–75%, 76–90%, 91–100%) shows the number of students currently in that range. The color gets <span style={{ fontWeight: 700 }}>darker green</span> as progress increases. A bracket with many students tells you where the majority of your batch stands right now. Hover over any bar to see the percentage of your total batch that bracket represents.
            </p>
            <p style={{ marginTop: 6, fontWeight: 600, color: 'var(--success)' }}>
              <strong>Quick action:</strong> If most students are in the 0–25% range, they need structured revision. If most are in 51–75%, they are on track. If a few are stuck at 0–10% while others are at 90%+, consider peer mentoring.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distributionData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'Number of students', position: 'insideBottom', offset: -3, style: { fontSize: 11 } }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fontWeight: 600 }} width={65} />
              <RechartTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                const pct = students.length > 0 ? Math.round((d.count / students.length) * 100) : 0;
                return (
                  <div style={CHART_TOOLTIP}>
                    <p style={{ fontWeight: 800, marginBottom: 2 }}>Progress: {d.range}</p>
                    <p style={{ color: d.color || 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{d.count} student{d.count !== 1 ? 's' : ''}</p>
                    <p style={{ marginTop: 4, borderTop: '2px solid #000', paddingTop: 4 }}>{d.desc}</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', marginTop: 2 }}>{pct}% of your batch</p>
                  </div>
                );
              }} />
              <Bar dataKey="count" name="Students" maxBarSize={22}>
                <LabelList dataKey="count" position="right" fontSize={11} fontWeight={700} />
                {distributionData.map((entry, i) => (<Cell key={i} fill={entry.color} stroke="#000" strokeWidth={1} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ CHARTS ROW 2 ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>

        {/* ─── Content Breakdown ─── */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <ClipboardList size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Content Breakdown — Lessons, Topics &amp; Problems</h3>
          </div>
          <div style={{
            marginBottom: 'var(--space-md)', fontSize: '0.8rem', lineHeight: 1.6,
            padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)'
          }}>
            <p>
              <strong>What this shows:</strong> This panel breaks down the total completion numbers by content type — <strong>lessons</strong> (the main chapters), <strong>topics</strong> (subsections within each lesson), and <strong>problems</strong> (practice questions). All numbers are summed across DSA, DBMS, OS, and PROG.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>How to read it:</strong> Each row shows the count of items done versus the total available, along with a percentage bar. A high percentage on lessons but low on problems means students are reading the material but not practising enough.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Why it matters:</strong> In placement preparation, solving problems is more important than just reading lessons. If the Problems progress bar is lagging behind Lessons, encourage your students to attempt more coding questions.
            </p>
          </div>
          {stats?.aggregate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { label: 'Lessons', done: stats.aggregate.lessons.completed, total: stats.aggregate.lessons.total, icon: BookOpen, color: '#6366f1', tip: 'Main chapters read' },
                { label: 'Topics', done: stats.aggregate.subtopics.completed, total: stats.aggregate.subtopics.total, icon: ClipboardList, color: '#14b8a6', tip: 'Subsections studied' },
                { label: 'Problems', done: stats.aggregate.problems.completed, total: stats.aggregate.problems.total, icon: Database, color: '#f59e0b', tip: 'Practice questions solved' },
              ].map(item => {
                const Icon = item.icon;
                const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={16} /> <span style={{ fontWeight: 700 }}>{item.label}</span></span>
                      <span style={{ fontWeight: 600 }}>{item.done} / {item.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: 14, background: 'var(--bg-tertiary)', border: '3px solid #000' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.tip}</div>
                  </div>
                );
              })}
            </div>
          ) : <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>No content data available yet.</p>}
        </div>

        {/* ─── Join Activity ─── */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Calendar size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Enrollment Pattern — When Students Joined</h3>
          </div>
          <div style={{
            marginBottom: 'var(--space-md)', fontSize: '0.8rem', lineHeight: 1.6,
            padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)'
          }}>
            <p>
              <strong>What this shows:</strong> This bar chart groups your students by the <strong>day of the week</strong> they joined your centre. It reveals enrollment trends — for example, whether most students sign up on weekends or on specific weekdays.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>How to read it:</strong> The taller the bar for a particular day, the more students enrolled on that weekday. For example, if Monday has a tall bar but Wednesday is short, most new students joined early in the week. The number on top of each bar shows the exact count.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Why it matters:</strong> Understanding enrollment patterns helps you plan onboarding sessions. If most join on Mondays, schedule orientation for Tuesdays. If weekends are popular, consider weekend catch-up batches or introductory workshops.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 600 }} label={{ value: 'Day of the week', position: 'insideBottom', offset: -3, style: { fontSize: 11 } }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} label={{ value: 'Students who joined', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <RechartTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload;
                return (
                  <div style={CHART_TOOLTIP}>
                    <p style={{ fontWeight: 800 }}>{p.day}</p>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.joins} student{p.joins !== 1 ? 's' : ''} joined</p>
                  </div>
                );
              }} />
              <Bar dataKey="joins" name="Students joined" fill="#6366f1" stroke="#000" strokeWidth={1}>
                <LabelList dataKey="joins" position="top" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ─── Quiz Performance ─── */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Target size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Quiz Performance — How Well Are Students Scoring?</h3>
          </div>
          <div style={{
            marginBottom: 'var(--space-md)', fontSize: '0.8rem', lineHeight: 1.6,
            padding: 'var(--space-sm)', border: '2px solid #000', background: 'var(--bg-tertiary)'
          }}>
            <p>
              <strong>What this shows:</strong> This section displays the <strong>average quiz score</strong> for each subject (DSA, DBMS, OS, PROG) across all students who have attempted quizzes. A coloured progress bar shows how close the batch average is to 100%.
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>How to read it:</strong> Each bar shows the average score for that subject. <span style={{ color: 'var(--success)', fontWeight: 700 }}>Green</span> = 70%+ (good), <span style={{ color: 'var(--warning)', fontWeight: 700 }}>amber</span> = 50–69% (needs improvement), <span style={{ color: 'var(--error)', fontWeight: 700 }}>red</span> = below 50% (needs serious attention). Subjects with no attempts will show "No attempts yet."
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Why it matters:</strong> Quiz scores reveal conceptual understanding. A subject with high content completion but low quiz scores means students are going through the material but not truly understanding it. Consider revision workshops or doubt-clearing sessions for low-scoring subjects.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {subjectChartData.map(d => {
              let totalScore = 0, count = 0;
              for (const s of students) {
                const q = s.progress?.[d.key]?.quizzes;
                if (q?.quizzesTaken > 0) { totalScore += q.avgScore * q.quizzesTaken; count += q.quizzesTaken; }
              }
              const avg = count > 0 ? Math.round(totalScore / count) : null;
              const grade = getScoreGrade(avg);
              return (
                <div key={d.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: SUBJECT_COLORS[d.subject], display: 'flex', alignItems: 'center', gap: 4 }}>
                      {d.key === 'dsa' ? <Cpu size={14} /> : d.key === 'dbms' ? <Database size={14} /> : d.key === 'os' ? <BookOpen size={14} /> : <Code2 size={14} />}
                      {d.subject}
                    </span>
                    <span style={{ fontWeight: 800, color: grade.color, fontSize: '0.82rem' }}>{avg !== null ? `${avg}% — ${grade.label}` : 'No attempts yet'}</span>
                  </div>
                  {avg !== null && (
                    <div style={{ height: 14, background: 'var(--bg-tertiary)', border: '3px solid #000' }}>
                      <div style={{ height: '100%', width: `${avg}%`, background: grade.color, transition: 'width 0.5s ease' }} />
                    </div>
                  )}
                  {count > 0 && (
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      Based on {count} quiz attempt{count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ QUICK LOOK: RECENTLY JOINED ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} /> Recently Joined Students
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6, borderLeft: '2px solid #000', paddingLeft: 8 }}>{students.length} total enrolled</span>
          </h2>
          <Link to="/coordinator/students" className="btn btn--sm" style={{ fontSize: '0.68rem', border: '3px solid #000', boxShadow: '3px 3px 0 #000', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            View All Students <ArrowRight size={12} />
          </Link>
        </div>

        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', border: '3px dashed var(--border-color)' }}>
            <Lightbulb size={24} style={{ marginBottom: 8, color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No students have joined your centre yet. Share your join code with students to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: 600, border: '3px solid #000' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000', background: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>Student Name</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>College</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Overall Progress</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 8).map((s, idx) => {
                  const pct = computeOverallPct(s.progress);
                  return (
                    <tr key={s._id} style={{ borderBottom: '2px solid #000', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.displayName || s.username || 'Unknown'}</td>
                      <td style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.college || '—'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: pct >= 50 ? 'var(--success)' : 'var(--error)' }}>{pct}%</span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <Link to={`/coordinator/students/${s._id}`} className="btn btn--sm" style={{ fontSize: '0.65rem', padding: '4px 12px', border: '3px solid #000', boxShadow: '2px 2px 0 #000', fontWeight: 700 }}>
                          View Profile
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
