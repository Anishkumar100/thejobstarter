import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  Users, Layers, FileText, Plus, ArrowRight, AlertCircle,
  CheckCircle, Clock, GraduationCap, Building2, TrendingUp, Download,
  BookOpen, Database, Monitor, Terminal, BarChart3, Activity,
  Zap, Eye, ChevronLeft, ChevronRight, Calendar, UserPlus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CARD = {
  border: '3px solid #000',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: '6px 6px 0 #000'
};

const BATTLECARD = {
  border: '3px solid #000',
  padding: 'var(--space-md)',
  background: 'var(--bg-surface)',
  boxShadow: '6px 6px 0 #000',
  cursor: 'pointer',
  transition: 'transform 0.15s'
};

const PAGINATION_SIZE = 6;

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [laggingStudents, setLaggingStudents] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [showTopStudents, setShowTopStudents] = useState(false);
  const [topFilter, setTopFilter] = useState('all');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [batchPage, setBatchPage] = useState(1);
  const [recentlyJoinedPage, setRecentlyJoinedPage] = useState(1);
  const [laggingPage, setLaggingPage] = useState(1);
  const [topPage, setTopPage] = useState(1);
  const PER_PAGE = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchesRes, statsRes] = await Promise.all([
        apiRequest('/coordinator/batches/progress'),
        apiRequest('/coordinator/stats')
      ]);
      setBatches(batchesRes.data || []);
      setStats(statsRes.data);
      if (statsRes.data?.center) setCenter(statsRes.data.center);
    } catch (err) {
      console.error('[COORD DASH] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Fetch all students once, derive lagging + top performers client-side */
  useEffect(() => {
    if (!center) return;
    setStudentsLoading(true);
    const fetchAll = async () => {
      try {
        const res = await apiRequest('/coordinator/students');
        const students = res.data?.students || [];
        setAllStudents(students);

        /* Derive lagging students — needs attention or behind pace */
        const lagging = students
          .filter(s => s.needsAttention || s.progress?.planProgress?.paceStatus === 'behind')
          .sort((a, b) => (b.attentionReasons?.length || 0) - (a.attentionReasons?.length || 0));
        setLaggingStudents(lagging);

        /* Derive top performers — has plan progress, not flagged, sorted by completion % */
        const top = students
          .filter(s => {
            if (s.needsAttention) return false;
            const pp = s.progress?.planProgress;
            return pp && (pp.completedCount > 0 || pp.paceStatus !== 'behind');
          })
          .map(s => {
            const pp = s.progress?.planProgress || {};
            const pct = pp.expectedCount > 0 ? Math.round((pp.completedCount / pp.expectedCount) * 100) : 0;
            return { ...s, _cp: pct };
          })
          .sort((a, b) => b._cp - a._cp);
        setTopStudents(top);
      } catch (err) {
        console.error('[COORD DASH] Error fetching students:', err.message);
      }
      setStudentsLoading(false);
    };
    fetchAll();
  }, [center]);

  const FILTER_RANGES = [
    { label: 'All', value: 'all' },
    { label: '90-100%', value: '90-100' },
    { label: '75-89%', value: '75-89' },
    { label: '50-74%', value: '50-74' },
    { label: '<50%', value: '0-49' }
  ];

  const filteredTopStudents = (() => {
    if (topFilter === 'all') return topStudents;
    const [lo, hi] = topFilter.split('-').map(Number);
    if (topFilter === '0-49') return topStudents.filter(s => s._cp < 50);
    return topStudents.filter(s => s._cp >= lo && s._cp <= hi);
  })();

  /* Recently joined — sorted by join date */
  const recentlyJoined = [...allStudents]
    .filter(s => s.coachingCenterJoinedAt)
    .sort((a, b) => new Date(b.coachingCenterJoinedAt) - new Date(a.coachingCenterJoinedAt));

  /* Client-side pagination slices */
  const recentlyJoinedTotalPages = Math.max(1, Math.ceil(recentlyJoined.length / PER_PAGE));
  const paginatedRecentlyJoined = recentlyJoined.slice((recentlyJoinedPage - 1) * PER_PAGE, recentlyJoinedPage * PER_PAGE);
  const laggingTotalPages = Math.max(1, Math.ceil(laggingStudents.length / PER_PAGE));
  const paginatedLagging = laggingStudents.slice((laggingPage - 1) * PER_PAGE, laggingPage * PER_PAGE);
  const topTotalPages = Math.max(1, Math.ceil(filteredTopStudents.length / PER_PAGE));
  const paginatedTop = filteredTopStudents.slice((topPage - 1) * PER_PAGE, topPage * PER_PAGE);

  const totalStudents = batches.reduce((sum, b) => sum + (b.studentCount || 0), 0);
  const totalPlans = new Set(batches.filter(b => b.plan).map(b => b.plan.planId)).size;
  const activeBatches = batches.filter(b => b.status === 'active').length;
  const behindBatches = batches.filter(b => b.plan?.behind).length;

  const subjectData = [];
  if (stats?.aggregate) {
    const subjects = [
      { key: 'lessons', label: 'Lessons' },
      { key: 'subtopics', label: 'Subtopics' },
      { key: 'problems', label: 'Problems' }
    ];
    const agg = stats.aggregate;
    for (const sub of subjects) {
      const d = agg[sub.key];
      subjectData.push({
        name: sub.label,
        Completed: d?.completed || 0,
        Pending: (d?.total || 0) - (d?.completed || 0),
        pct: d?.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
      });
    }
  }

  const batchSubjectData = batches.map(b => ({
    name: b.name?.length > 14 ? b.name.slice(0, 14) + '\u2026' : b.name || 'Unknown',
    _id: b._id,
    dayPct: b.plan ? Math.min(100, Math.round((b.plan.currentDay / b.plan.totalDays) * 100)) : 0,
    behind: b.plan?.behind || false,
    hasPlan: !!b.plan,
    fullName: b.name,
    studentCount: b.studentCount
  }));

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(batches.length / PAGINATION_SIZE));
  const paginatedBatches = batches.slice((batchPage - 1) * PAGINATION_SIZE, batchPage * PAGINATION_SIZE);

  /* ── CSV Export ── */
  const exportCSV = () => {
    if (batches.length === 0) return;

    const rows = [];
    const push = (cells) => rows.push(cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));

    /* Section header */
    push(['THEWEYTES COORDINATOR DASHBOARD EXPORT']);
    push([`Centre: ${center?.name || 'N/A'}`, `Exported: ${new Date().toLocaleString()}`]);
    push([]);

     /* Legend — explain every column */
    push(['COLUMN EXPLANATIONS']);
    push(['Col 1-2: Centre information (name, location, status).']);
    push(['Col 3-7: Batch-specific info — name, code, status, student count, expected students.']);
    push(['Col 8-13: Plan assigned to the batch — plan name, start date, current day, total days, progress %, behind-flags. Behind = started >=3 days ago but <40% through plan.']);
    push(['Col 14: Student completion — (completed count) / (expected count). Expected = all plan items from Day 1 up to today.']);
    push(['Col 15-18: Subject-wise content completion across DSA, DBMS, OS, Programming (not plan-specific). Shows (completed / total).']);
    push(['Col 19: Overall completion % across all 4 subjects (not plan-specific).']);
    push([]);

    /* Column headers */
    push([
      'Centre Name', 'Centre Status',
      'Batch Name', 'Batch Code', 'Batch Status', 'Student Count', 'Expected Students',
      'Plan Name', 'Plan Start Date', 'Plan Current Day', 'Plan Total Days', 'Plan Progress %', 'Plan Behind?',
      'Plan Completed/Expected (Cumulative from Day 1)',
      'DSA (completed/total)', 'DBMS (completed/total)', 'OS (completed/total)', 'PROG (completed/total)',
      'Overall %'
    ]);

    for (const batch of batches) {
      const plan = batch.plan;
      const planSummary = plan
        ? `${plan.completedCount || 0}/${plan.expectedCount || 0}`
        : 'No plan';
      push([
        center?.name || '', center?.status || '',
        batch.name || '', batch.code || '', batch.status || '', batch.studentCount || 0, batch.expectedStudents || '',
        plan?.planName || '', plan?.startDate ? new Date(plan.startDate).toLocaleDateString() : '', plan?.currentDay || 0, plan?.totalDays || 0,
        plan ? Math.round((plan.currentDay / plan.totalDays) * 100) + '%' : '', plan?.behind ? 'Yes' : 'No',
        planSummary,
        '', '', '', '', '' /* Subject and overall are per-student, left empty at batch level */
      ]);
    }

    push([]);
    push(['NOTE: Day-by-day analysis is NOT included in this export. For day-level detail, visit the Batch Detail page.']);
    push(['Each row = one batch. Student-level subject progress is available in the Students page export.']);

    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${center?.name || 'coordinator'}_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING DASHBOARD..." /></div>;
  if (error) return (
    <div style={{ padding: 'var(--space-xl)' }}>
      <div style={{ ...CARD, borderLeft: '6px solid #dc2626' }}>
        <strong style={{ color: '#dc2626' }}>Error</strong>
        <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1300, margin: '0 auto' }}>
      <Helmet><title>Dashboard — {center?.name || 'Coordinator'} — TheWebytes</title></Helmet>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
            <GraduationCap size={28} />
            Welcome back{stats?.coordinatorName ? `, ${stats.coordinatorName}` : ''}
          </h1>
          {center && (
            <p style={{ color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <Building2 size={16} /> {center.name}
              {center.status && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                  padding: '2px 8px', border: '2px solid #000',
                  background: center.status === 'active' ? '#dcfce7' : 'var(--bg-tertiary)'
                }}>
                  {center.status}
                </span>
              )}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={exportCSV} className="btn btn--sm"
            style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: 4, border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ═══ STATS GRID ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 'var(--space-xl)' }}>
        <Link to="/coordinator/students" style={{ textDecoration: 'none', color: 'inherit', ...CARD, padding: 'var(--space-md)', textAlign: 'center', transition: 'transform 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 #000'; }}>
          <Users size={22} style={{ color: '#000', marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{totalStudents}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Students</div>
        </Link>
        <Link to="/coordinator/batches" style={{ textDecoration: 'none', color: 'inherit', ...CARD, padding: 'var(--space-md)', textAlign: 'center', transition: 'transform 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 #000'; }}>
          <Layers size={22} style={{ color: '#000', marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{activeBatches}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Batches</div>
        </Link>
        <Link to="/coordinator/plans" style={{ textDecoration: 'none', color: 'inherit', ...CARD, padding: 'var(--space-md)', textAlign: 'center', transition: 'transform 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 #000'; }}>
          <FileText size={22} style={{ color: '#000', marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{totalPlans}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Plans</div>
        </Link>
        <div style={{ ...CARD, padding: 'var(--space-md)', textAlign: 'center', borderColor: behindBatches > 0 ? '#dc2626' : '#000' }}>
          <TrendingUp size={22} style={{ color: behindBatches > 0 ? '#dc2626' : '#000', marginBottom: 6 }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: behindBatches > 0 ? '#dc2626' : 'inherit' }}>{behindBatches}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Behind Schedule</div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.3, borderTop: '2px solid #000', paddingTop: 4 }}>
            Batches on Day 3+ of their plan but less than 40% of plan days elapsed. Timeline flag, not student scores.
          </p>
        </div>
        {stats?.aggregate?.overall?.percentage !== undefined && (
          <div style={{ ...CARD, padding: 'var(--space-md)', textAlign: 'center' }}>
            <BarChart3 size={22} style={{ color: '#000', marginBottom: 6 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.aggregate.overall.percentage}%</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall Completion</div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.3, borderTop: '2px solid #000', paddingTop: 4 }}>
              % of all lessons, topics, and problems completed across all subjects. Not tied to any plan.
            </p>
          </div>
        )}
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ ...CARD }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} /> Content Progress
          </h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} width={65} />
                <Tooltip formatter={(value, name) => [value, name]} />
                <Bar dataKey="Completed" fill="#16a34a" stackId="a" />
                <Bar dataKey="Pending" fill="#d4d4d4" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-tertiary)' }}>No data yet</p>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.68rem' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#16a34a', marginRight: 4, border: '2px solid #000' }} /> Completed</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#d4d4d4', marginRight: 4, border: '2px solid #000' }} /> Pending</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 6, borderTop: '2px solid #000', paddingTop: 6, lineHeight: 1.4 }}>
            <strong>What this shows:</strong> For each subject, how much content students have actually completed (green) vs what's still left to do (gray). Lessons = theory read. Subtopics = concepts studied. Problems = practice solved. If problems are mostly gray, students are reading but not practising — flag this to them. This reflects real learning, not just time spent in the plan.
          </p>
        </div>

        <div style={{ ...CARD }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} /> Batch Plan Progress
          </h3>
          {batchSubjectData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {batchSubjectData.map(b => (
                <Link key={b.name} to={`/coordinator/batches/${b._id}`} style={{ textDecoration: 'none', color: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
                    <span style={{ fontWeight: 700, minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.fullName}{!b.hasPlan ? <span style={{ fontWeight: 400, fontSize: '0.6rem', color: '#9ca3af', marginLeft: 4 }}>(no plan)</span> : ''}
                    </span>
                    <div style={{ flex: 1, height: 10, background: '#e5e7eb', border: '2px solid #000', position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: b.hasPlan ? `${b.dayPct}%` : '100%',
                        background: !b.hasPlan ? '#d4d4d4' : b.behind ? '#dc2626' : '#16a34a',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.68rem', minWidth: 36, textAlign: 'right', color: b.behind ? '#dc2626' : 'inherit' }}>
                      {b.hasPlan ? `${b.dayPct}%` : '\u2014'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-tertiary)' }}>No active plans yet</p>
          )}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 6, borderTop: '2px solid #000', paddingTop: 6, lineHeight: 1.4 }}>
            <strong>What this shows:</strong> How much TIME has passed since each batch started its plan (days completed ÷ total plan days). This is NOT about student completion — a 20-day plan on Day 10 shows 50% even if no student has done any work. A bar turns <strong style={{ color: '#dc2626' }}>RED</strong> when the batch has been running at least 3 days but less than 40% of the plan days have elapsed — meaning time is running short. Click any bar to see that batch's day-by-day student progress.
          </p>
        </div>
      </div>

      {/* ═══ BATCH CARDS (paginated) ═══ */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={20} /> Batch Progress Details
            <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>
              ({batches.length} batch{batches.length !== 1 ? 'es' : ''})
            </span>
          </h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '2px solid #000', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                <button onClick={() => setBatchPage(p => Math.max(1, p - 1))} disabled={batchPage === 1}
                  style={{ background: 'none', border: 'none', cursor: batchPage === 1 ? 'default' : 'pointer', opacity: batchPage === 1 ? 0.4 : 1, padding: 0 }}>
                  <ChevronLeft size={14} />
                </button>
                <span>{batchPage}/{totalPages}</span>
                <button onClick={() => setBatchPage(p => Math.min(totalPages, p + 1))} disabled={batchPage === totalPages}
                  style={{ background: 'none', border: 'none', cursor: batchPage === totalPages ? 'default' : 'pointer', opacity: batchPage === totalPages ? 0.4 : 1, padding: 0 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
            <Link to="/coordinator/batches" style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Layers size={14} /> View All
            </Link>
          </div>
        </div>

        {batches.length === 0 ? (
          <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
            <Layers size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 6 }}>No batches yet</h3>
            <p style={{ color: 'var(--text-tertiary)' }}>Create a batch and assign a plan to track progress.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
            {paginatedBatches.map(batch => {
              const plan = batch.plan;
              const progressPct = plan ? Math.round((plan.currentDay / plan.totalDays) * 100) : 0;
              const isBehind = plan?.behind;
              return (
                <div key={batch._id} style={{
                  ...BATTLECARD,
                  boxShadow: isBehind ? '6px 6px 0 #dc2626' : '6px 6px 0 #000',
                  borderTop: isBehind ? '6px solid #dc2626' : '6px solid #16a34a'
                }} onClick={() => navigate(`/coordinator/batches/${batch._id}`)}
                  onMouseEnter={e => { if (!isBehind) { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 #000'; } }}
                  onMouseLeave={e => { if (!isBehind) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 #000'; } }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 900 }}>{batch.name}</h3>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Code: <strong style={{ fontFamily: 'monospace' }}>{batch.code}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', border: '2px solid #000', background: batch.status === 'active' ? '#dcfce7' : 'var(--bg-tertiary)' }}>
                        {batch.status}
                      </span>
                      {isBehind && (
                        <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', border: '2px solid #dc2626', background: '#fee2e2', color: '#dc2626' }}>
                          <AlertCircle size={10} style={{ verticalAlign: 'middle' }} /> Behind
                        </span>
                      )}
                    </div>
                  </div>

                  {plan ? (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', marginBottom: 6 }}>
                        <FileText size={12} />
                        <strong>{plan.planName}</strong>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>
                          · Day {plan.currentDay}/{plan.totalDays}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 10, background: '#e5e7eb', border: '2px solid #000', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: isBehind ? '#dc2626' : '#16a34a', transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '0.7rem' }}>{progressPct}%</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '6px 10px', border: '2px dashed #000', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} /> No plan assigned
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.68rem', color: 'var(--text-tertiary)', borderTop: '2px solid #e5e7eb', paddingTop: 6 }}>
                    <span><Users size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {batch.studentCount} student{batch.studentCount !== 1 ? 's' : ''}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={12} /> View <ArrowRight size={10} /></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ RECENTLY JOINED ═══ */}
      {recentlyJoined.length > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-xl)', borderLeft: '6px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserPlus size={18} style={{ color: '#2563eb' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>Recently Joined</h2>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 10px', border: '2px solid #000', background: '#dbeafe', color: '#1e40af' }}>
                {recentlyJoined.length} total
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {recentlyJoinedTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '2px solid #000', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                  <button onClick={() => setRecentlyJoinedPage(p => Math.max(1, p - 1))} disabled={recentlyJoinedPage === 1}
                    style={{ background: 'none', border: 'none', cursor: recentlyJoinedPage === 1 ? 'default' : 'pointer', opacity: recentlyJoinedPage === 1 ? 0.4 : 1, padding: 0 }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span>{recentlyJoinedPage}/{recentlyJoinedTotalPages}</span>
                  <button onClick={() => setRecentlyJoinedPage(p => Math.min(recentlyJoinedTotalPages, p + 1))} disabled={recentlyJoinedPage === recentlyJoinedTotalPages}
                    style={{ background: 'none', border: 'none', cursor: recentlyJoinedPage === recentlyJoinedTotalPages ? 'default' : 'pointer', opacity: recentlyJoinedPage === recentlyJoinedTotalPages ? 0.4 : 1, padding: 0 }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
              <Link to="/coordinator/students" style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', border: '2px solid #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Users size={14} /> All Students
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
            {paginatedRecentlyJoined.map(s => (
              <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                border: '2px solid #000', textDecoration: 'none', color: 'inherit',
                fontSize: '0.78rem', transition: 'transform 0.12s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                {s.avatar ? (
                  <img src={s.avatar} alt="" style={{ width: 26, height: 26, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 26, height: 26, border: '2px solid #000', background: '#dbeafe', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.65rem' }}>
                    {(s.displayName || s.username || '?')[0]}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.displayName || s.username}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                    {s.batch?.name || 'No batch'} · {new Date(s.coachingCenterJoinedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ LAGGING STUDENTS ═══ */}
      {laggingStudents.length > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-xl)', borderLeft: '6px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} style={{ color: '#dc2626' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>Students Needing Attention</h2>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 10px', border: '2px solid #000', background: '#dc2626', color: '#fff' }}>
                {laggingStudents.length} flagged
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {laggingTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '2px solid #000', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                  <button onClick={() => setLaggingPage(p => Math.max(1, p - 1))} disabled={laggingPage === 1}
                    style={{ background: 'none', border: 'none', cursor: laggingPage === 1 ? 'default' : 'pointer', opacity: laggingPage === 1 ? 0.4 : 1, padding: 0 }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span>{laggingPage}/{laggingTotalPages}</span>
                  <button onClick={() => setLaggingPage(p => Math.min(laggingTotalPages, p + 1))} disabled={laggingPage === laggingTotalPages}
                    style={{ background: 'none', border: 'none', cursor: laggingPage === laggingTotalPages ? 'default' : 'pointer', opacity: laggingPage === laggingTotalPages ? 0.4 : 1, padding: 0 }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
              <Link to="/coordinator/students" style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', border: '2px solid #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Users size={14} /> View All
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {paginatedLagging.map(s => (
              <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                border: '2px solid #000', background: 'var(--bg-surface)', textDecoration: 'none', color: 'inherit',
                fontSize: '0.78rem', transition: 'transform 0.12s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                {s.avatar ? (
                  <img src={s.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 28, height: 28, border: '2px solid #000', background: 'var(--gray-300)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                  <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: '0.72rem' }}>
                    {s.batch?.name || 'No batch'} · {s.college || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {(s.attentionReasons || []).slice(0, 2).map((reason, i) => (
                    <span key={i} style={{
                      fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase',
                      padding: '2px 6px', border: '2px solid #000',
                      background: reason.includes('Inactive') ? '#fee2e2' : reason.includes('Bottom') ? '#fef3c7' : '#e0e7ff'
                    }}>
                      {reason.length > 25 ? reason.slice(0, 25) + '\u2026' : reason}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TOP PERFORMERS (collapsible) ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-xl)', borderTop: '6px solid #16a34a' }}>
        <div onClick={() => setShowTopStudents(v => !v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} style={{ color: '#16a34a' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>
                  Top Performing Students
                  <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>({filteredTopStudents.length})</span>
                </h2>
          </div>
          <span style={{ fontWeight: 900, fontSize: '0.85rem', transition: 'transform 0.2s', display: 'inline-block', transform: showTopStudents ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>

        {showTopStudents && (
          <>
            <div style={{ display: 'flex', gap: 6, marginTop: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
              {FILTER_RANGES.map(fr => (
                <button key={fr.value} onClick={() => { setTopFilter(fr.value); setTopPage(1); }} style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px',
                    border: '2px solid #000', cursor: 'pointer',
                    background: topFilter === fr.value ? '#16a34a' : 'var(--bg-surface)',
                    color: topFilter === fr.value ? '#fff' : 'inherit'
                  }}>
                  {fr.label}
                </button>
              ))}
              {topTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '2px solid #000', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700, marginLeft: 'auto' }}>
                  <button onClick={() => setTopPage(p => Math.max(1, p - 1))} disabled={topPage === 1}
                    style={{ background: 'none', border: 'none', cursor: topPage === 1 ? 'default' : 'pointer', opacity: topPage === 1 ? 0.4 : 1, padding: 0 }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span>{topPage}/{topTotalPages}</span>
                  <button onClick={() => setTopPage(p => Math.min(topTotalPages, p + 1))} disabled={topPage === topTotalPages}
                    style={{ background: 'none', border: 'none', cursor: topPage === topTotalPages ? 'default' : 'pointer', opacity: topPage === topTotalPages ? 0.4 : 1, padding: 0 }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {paginatedTop.map(s => (
                <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  border: '2px solid #000', background: 'var(--bg-surface)', textDecoration: 'none', color: 'inherit',
                  fontSize: '0.78rem', transition: 'transform 0.12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {s.avatar ? (
                    <img src={s.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 28, height: 28, border: '2px solid #000', background: '#16a34a20', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: '0.72rem' }}>
                      {s.batch?.name || 'No batch'} · {s.college || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', border: '2px solid #000', background: s.progress?.planProgress?.paceStatus === 'ahead' ? '#dcfce7' : '#f0fdf4', color: '#166534' }}>
                      {s.progress?.planProgress?.paceStatus === 'ahead' ? 'Ahead' : s.progress?.planProgress?.paceStatus === 'on-track' ? 'On Track' : 'Active'}
                    </span>
                    {s._cp > 0 && (
                      <span style={{ fontWeight: 900, fontSize: '0.68rem', color: '#16a34a', minWidth: 36, textAlign: 'right' }}>{s._cp}%</span>
                    )}
                  </div>
                </Link>
              ))}
              {filteredTopStudents.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', padding: 8 }}>
                  {topStudents.length === 0 ? 'No top performers data yet.' : 'No students match the selected range.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══ QUICK ACTIONS + CSV ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
        <div style={{ ...CARD }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={18} /> Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Link to="/coordinator/plans/new" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '6px 12px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <FileText size={14} /> Create Plan
            </Link>
            <Link to="/coordinator/batches" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '6px 12px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Layers size={14} /> New Batch
            </Link>
            <Link to="/coordinator/students" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '6px 12px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} /> View Students
            </Link>
            <Link to="/coordinator/plans" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '6px 12px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <FileText size={14} /> Manage Plans
            </Link>
          </div>
        </div>

        <div style={{ ...CARD }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={18} /> Export Data
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
            Download centre, batch and plan data as CSV. Includes detailed column explanations. Day-by-day analysis is NOT included — visit each batch for day-level detail.
          </p>
          <button onClick={exportCSV} disabled={batches.length === 0} style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px',
            border: '3px solid #000', boxShadow: '3px 3px 0 #000',
            background: batches.length === 0 ? '#e5e7eb' : 'var(--bg-surface)',
            cursor: batches.length === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <Download size={14} /> {batches.length === 0 ? 'No data to export' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
