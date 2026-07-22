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

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: '8px 8px 0 var(--border-color)'
};

const EXPLAIN_BOX = {
  fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)',
  marginBottom: 10, lineHeight: 1.5,
  background: 'var(--bg-surface)',
  padding: '12px 16px',
  border: '3px solid var(--border-color)',
  boxShadow: '4px 4px 0 var(--border-color)'
};

const CHART_TOOLTIP = {
  background: 'var(--bg-surface)',
  border: '4px solid var(--border-color)',
  padding: '12px 16px',
  fontSize: '0.82rem',
  boxShadow: '6px 6px 0 var(--border-color)'
};

export default function CoordinatorGeneralStats() {
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

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING STATS..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: 'var(--error-bg)' }}><strong style={{ fontSize: '0.9rem' }}>Error loading stats</strong><p style={{ marginTop: 4, fontSize: '0.82rem' }}>{error}</p></div></div>;
  if (!center) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}><h2>No Center Assigned</h2><p style={{ color: 'var(--text-tertiary)', marginTop: 4 }}>You are not yet assigned as a coordinator for any centre.</p></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1440, margin: '0 auto' }}>
      <Helmet><title>General Stats — {center.name} — Coordinator</title></Helmet>

      {/* ═══ HEADER ═══ */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, marginBottom: 4, letterSpacing: '-0.02em' }}>
              <BarChart3 size={24} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              General Stats
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              {center.name} — Overview of student progress and performance
            </p>
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
              padding: '5px 14px', border: '3px solid var(--border-color)',
              background: 'var(--bg-inverse)', color: 'var(--text-inverse)', boxShadow: '3px 3px 0 var(--border-color)',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.65rem',
              textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'inherit',
              transition: 'transform 0.12s, box-shadow 0.12s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border-color)'; }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ═══ NEEDS ATTENTION ═══ */}
      {(() => {
        const flagged = students.filter(s => s.needsAttention);
        return (
          <div style={{ marginBottom: 'var(--space-xl)', ...CARD, borderLeft: '8px solid var(--error)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={20} style={{ color: 'var(--error)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Needs Attention</h2>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 10px', border: '2px solid var(--border-color)',
                  background: flagged.length > 0 ? 'var(--error)' : 'var(--success)', color: 'var(--text-inverse)'
                }}>{flagged.length} flagged</span>
              </div>
            </div>
            {flagged.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--text-tertiary)' }}>
                <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No students need attention right now</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                  {Object.entries(flagged.reduce((acc, s) => {
                    const name = s.batch?.name || 'Unassigned';
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                  }, {})).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                    <span key={name} style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
                      border: '2px solid var(--border-color)', background: name === 'Unassigned' ? 'var(--bg-tertiary)' : 'var(--bg-surface)'
                    }}>{name} <strong>({count})</strong></span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {flagged.sort((a, b) => (b.attentionReasons?.length || 0) - (a.attentionReasons?.length || 0)).map(s => (
                    <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', border: '2px solid var(--border-color)',
                      background: 'var(--bg-surface)', textDecoration: 'none', color: 'var(--text-primary)',
                      transition: 'transform 0.12s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border-color)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt="" style={{ width: 32, height: 32, border: '2px solid var(--border-color)', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.displayName || s.username}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{s.batch?.name || 'No batch'} · {s.college || '—'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
                        {(s.attentionReasons || []).map((reason, i) => (
                          <span key={i} style={{
                            fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 8px', border: '2px solid var(--border-color)',
                            background: reason.includes('Inactive') ? 'var(--error-bg)' : reason.includes('Bottom') ? 'var(--warning-bg)' : 'var(--accent-light)',
                            whiteSpace: 'nowrap'
                          }}>{reason}</span>
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
            { icon: Users, label: 'Total Students', value: stats.totalStudents, sub: 'enrolled in this centre', color: 'var(--text-primary)' },
            { icon: BarChart3, label: 'Overall Progress', value: `${stats.aggregate?.overall?.percentage || 0}%`, sub: `${stats.aggregate?.overall?.completed || 0} of ${stats.aggregate?.overall?.total || 0} items completed`, color: (stats.aggregate?.overall?.percentage || 0) >= 50 ? 'var(--success)' : 'var(--error)' },
            { icon: Target, label: 'Average Quiz Score', value: stats.quizzes?.averageScore !== null ? `${stats.quizzes.averageScore}%` : 'N/A', sub: `Based on ${stats.quizzes?.totalTaken || 0} quiz attempts`, color: getScoreGrade(stats.quizzes?.averageScore).color },
            { icon: CheckCircle2, label: 'Items Completed', value: stats.aggregate?.overall?.completed || 0, sub: `out of ${stats.aggregate?.overall?.total || 0} total`, color: 'var(--text-primary)' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ ...CARD, boxShadow: '6px 6px 0 var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.4 }}>{card.sub}</div>
              </div>
            );
          })}
          <div style={{ ...CARD, boxShadow: '6px 6px 0 var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><TrendingUp size={18} /><span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>Quiz Participation</span></div>
            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#14b8a6', lineHeight: 1 }}>{Math.round((stats.studentsWithQuizzes / (stats.totalStudents || 1)) * 100)}%</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{stats.studentsWithQuizzes} of {stats.totalStudents} students have attempted quizzes</div>
          </div>
        </div>
      )}

      {/* ═══ CHARTS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        {/* Subject Completion */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <BarChart3 size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Subject Completion</h3>
          </div>
          <div style={EXPLAIN_BOX}>
            Total items (lessons + topics + problems) completed per subject by all students. <strong>Green</strong> = done, <strong>grey</strong> = remaining. Compare subjects — a large grey section means that subject needs more focus. Allocate extra tutorials or practice to the weakest subject.
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RechartTooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload;
                return (
                  <div style={CHART_TOOLTIP}>
                    <p style={{ fontWeight: 800, marginBottom: 4, fontSize: '0.85rem' }}>{p.subject}</p>
                    <p style={{ color: 'var(--success)', fontWeight: 600 }}>Done: {p.done} items</p>
                    <p style={{ color: 'var(--error)', fontWeight: 600 }}>Remaining: {p.left} items</p>
                    <p style={{ fontWeight: 700, marginTop: 4, borderTop: '2px solid var(--border-color)', paddingTop: 4 }}>{p.pct}% complete</p>
                  </div>
                );
              }} />
              <Bar dataKey="done" name="Completed" stackId="a" fill="var(--success)" stroke="var(--border-color)" strokeWidth={1}>
                <LabelList dataKey="done" position="inside" fill="var(--text-inverse)" fontSize={12} fontWeight={800} />
              </Bar>
              <Bar dataKey="left" name="Remaining" stackId="a" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overall Completion */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <PieChartIcon size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Overall Completion</h3>
          </div>
          <div style={EXPLAIN_BOX}>
            Combined completion across <strong>all subjects</strong>. <strong>Green</strong> = done, <strong>red</strong> = remaining. As the cohort progresses, green should grow. If red stays dominant for weeks, review the pace or investigate which subjects are dragging performance down. Best high-level indicator of cohort-wide progress.
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={overallChartData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={4} dataKey="value" stroke="var(--border-color)" strokeWidth={2}>
                {overallChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill || PIE_COLORS[i]} />
                ))}
              </Pie>
              <RechartTooltip />
              <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student Distribution */}
        <div style={{ ...CARD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <TrendingUp size={20} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Student Progress Distribution</h3>
          </div>
          <div style={EXPLAIN_BOX}>
            Each bar shows <strong>how many students</strong> fall into each completion bracket (0–10% to 91–100%). Most students should be in 51%+ ranges. A <strong>spike in 0–10%</strong> is a red flag — those students may have disengaged. These map directly to the "Needs Attention" section below. Intervene early.
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={distributionData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fontWeight: 600 }} width={65} />
              <Bar dataKey="count" name="Students" maxBarSize={22}>
                <LabelList dataKey="count" position="right" fontSize={11} fontWeight={700} />
                {distributionData.map((entry, i) => (<Cell key={i} fill={entry.color} stroke="var(--border-color)" strokeWidth={1} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ Content Breakdown + Quiz Performance ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ ...CARD }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={20} /> Content Breakdown
          </h3>
          <div style={{ ...EXPLAIN_BOX, marginBottom: 'var(--space-md)' }}>
            Aggregated completions for <strong>lessons</strong> (curriculum coverage), <strong>topics</strong> (depth), and <strong>problems</strong> (practice). If problems trail behind lessons/topics, students are <strong>skipping practice</strong> — emphasise problem-solving in your next session.
          </div>
          {stats?.aggregate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { label: 'Lessons', done: stats.aggregate.lessons.completed, total: stats.aggregate.lessons.total, icon: BookOpen, color: '#6366f1' },
                { label: 'Topics', done: stats.aggregate.subtopics.completed, total: stats.aggregate.subtopics.total, icon: ClipboardList, color: '#14b8a6' },
                { label: 'Problems', done: stats.aggregate.problems.completed, total: stats.aggregate.problems.total, icon: Database, color: '#f59e0b' },
              ].map(item => {
                const Icon = item.icon;
                const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={16} /> <span style={{ fontWeight: 700 }}>{item.label}</span></span>
                      <span style={{ fontWeight: 600 }}>{item.done} / {item.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: 14, background: 'var(--bg-tertiary)', border: '3px solid var(--border-color)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>No content data available yet.</p>}
        </div>

        <div style={{ ...CARD }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={20} /> Quiz Performance
          </h3>
          <div style={{ ...EXPLAIN_BOX, marginBottom: 'var(--space-md)' }}>
            Average quiz score per subject, weighted by attempt count. Grade scale: <strong>≥90%</strong> Excellent, <strong>≥70%</strong> Good, <strong>≥50%</strong> Average, <strong>{'<'}50%</strong> Needs Work. Compare to Subject Completion above — if completion is high but quiz scores are low, students are <strong>rushing without learning</strong>.
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
                    <div style={{ height: 14, background: 'var(--bg-tertiary)', border: '3px solid var(--border-color)' }}>
                      <div style={{ height: '100%', width: `${avg}%`, background: grade.color, transition: 'width 0.5s ease' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ RECENTLY JOINED ═══ */}
      <div style={{ ...CARD }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} /> Recently Joined
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-tertiary)', borderLeft: '2px solid var(--border-color)', paddingLeft: 8 }}>{students.length} total</span>
          </h2>
          <Link to="/coordinator/students" className="btn btn--sm" style={{ fontSize: '0.68rem', border: '3px solid var(--border-color)', boxShadow: '3px 3px 0 var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--accent)', color: 'var(--text-inverse)' }}>
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', border: '3px dashed var(--border-color)' }}>
            <Lightbulb size={24} style={{ marginBottom: 8, color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No students have joined yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: 600, border: '3px solid var(--border-color)' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>College</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Progress</th>
                  <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 8).map((s, idx) => {
                  const pct = computeOverallPct(s.progress);
                  return (
                    <tr key={s._id} style={{ borderBottom: '2px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.displayName || s.username || 'Unknown'}</td>
                      <td style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.college || '—'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: pct >= 50 ? 'var(--success)' : 'var(--error)' }}>{pct}%</span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <Link to={`/coordinator/students/${s._id}`} className="btn btn--sm" style={{ fontSize: '0.65rem', padding: '4px 12px', border: '3px solid var(--border-color)', boxShadow: '2px 2px 0 var(--border-color)', fontWeight: 700, background: 'var(--accent)', color: 'var(--text-inverse)' }}>
                          View
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
