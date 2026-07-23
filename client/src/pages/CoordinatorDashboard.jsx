import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  Users, Layers, FileText, Plus, ArrowRight, AlertCircle,
  CheckCircle, Clock, GraduationCap, Building2, TrendingUp, Download,
  BookOpen, Database, Monitor, Terminal, BarChart3, Activity,
  Zap, UserMinus, Eye, Edit3, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: 'var(--shadow)'
};

const CHART_COLORS = { dsa: '#e11d48', dbms: '#3b82f6', os: '#22c55e', programming: '#a855f7' };
const SUBJECT_LABELS = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'PROG' };

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /* Lagging students */
  const [allStudents, setAllStudents] = useState([]);
  const [laggingStudents, setLaggingStudents] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [showTopStudents, setShowTopStudents] = useState(false);
  const [topFilter, setTopFilter] = useState('all');
  const [studentsLoading, setStudentsLoading] = useState(false);

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

  /* Fetch all students to find lagging ones */
  useEffect(() => {
    const fetchStudents = async () => {
      if (!center) return;
      setStudentsLoading(true);
      try {
        const res = await apiRequest('/coordinator/students');
        setAllStudents(res.data?.students || []);
        /* Students with needsAttention flag or behind pace */
        const lagging = (res.data?.students || [])
          .filter(s => s.needsAttention || s.progress?.planProgress?.paceStatus === 'behind')
          .sort((a, b) => {
            const aReasons = a.attentionReasons?.length || 0;
            const bReasons = b.attentionReasons?.length || 0;
            return bReasons - aReasons;
          });
        setLaggingStudents(lagging);

        /* Top performers: all students not flagged for attention, sorted by completion % */
        const top = (res.data?.students || [])
          .filter(s => {
            if (s.needsAttention) return false;
            const pp = s.progress?.planProgress;
            return pp && (pp.completedCount > 0 || pp.paceStatus !== 'behind');
          })
          .map(s => {
            const pp = s.progress?.planProgress || {};
            const completionPct = pp.expectedCount > 0
              ? Math.round((pp.completedCount / pp.expectedCount) * 100)
              : 0;
            return { ...s, _completionPct: completionPct };
          })
          .sort((a, b) => b._completionPct - a._completionPct);
        setTopStudents(top);
      } catch (err) {
        console.error('[COORD DASH] Error fetching students:', err.message);
      }
      setStudentsLoading(false);
    };
    fetchStudents();
  }, [center]);

  /* Score range filter options for top performers */
  const FILTER_RANGES = [
    { label: 'All', value: 'all', min: 0, max: 100 },
    { label: '90-100%', value: '90-100', min: 90, max: 100 },
    { label: '75-89%', value: '75-89', min: 75, max: 89 },
    { label: '50-74%', value: '50-74', min: 50, max: 74 },
    { label: '<50%', value: '0-49', min: 0, max: 49 }
  ];

  /* Filtered top students by score range (using _completionPct from the map above) */
  const filteredTopStudents = topStudents.filter(s => {
    if (topFilter === 'all') return true;
    const range = FILTER_RANGES.find(r => r.value === topFilter);
    if (!range) return true;
    return s._completionPct >= range.min && s._completionPct <= range.max;
  });

  /* Derived stats */
  const totalStudents = batches.reduce((sum, b) => sum + (b.studentCount || 0), 0);
  const totalPlans = new Set(batches.filter(b => b.plan).map(b => b.plan.planId)).size;
  const activeBatches = batches.filter(b => b.status === 'active').length;
  const behindBatches = batches.filter(b => b.plan?.behind).length;
  const onTrackBatches = batches.filter(b => b.plan && !b.plan.behind).length;

  /* Aggregate subject completion for chart */
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

  /* Per-batch subject breakdown for chart */
  const batchSubjectData = batches.filter(b => b.plan && b.studentCount > 0).map(b => ({
    name: b.name?.length > 12 ? b.name.slice(0, 12) + '…' : b.name || 'Unknown',
    _id: b._id,
    dayPct: b.plan ? Math.min(100, Math.round((b.plan.currentDay / b.plan.totalDays) * 100)) : 0,
    behind: b.plan?.behind || false,
    fullName: b.name,
    studentCount: b.studentCount
  }));

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING DASHBOARD..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, borderLeft: '6px solid #dc2626' }}><strong style={{ color: '#dc2626', fontSize: '0.9rem' }}>Error</strong><p style={{ marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{error}</p></div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1300, margin: '0 auto' }}>
      <Helmet><title>Dashboard — {center?.name || 'Coordinator'} — TheWebytes</title></Helmet>

      {/* ═══ WELCOME HEADER ═══ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)'
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
            <GraduationCap size={28} />
            Welcome back{stats?.coordinatorName ? `, ${stats.coordinatorName}` : ''}
          </h1>
          {center && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Building2 size={16} /> {center.name}
              {center.status && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                  padding: '2px 8px', border: '2px solid var(--border-color)',
                  background: center.status === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                  color: center.status === 'active' ? 'var(--success-text)' : 'var(--text-secondary)'
                }}>
                  {center.status}
                </span>
              )}
            </p>
          )}
        </div>
        {/* Quick Stats Row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '8px 16px', border: '3px solid var(--border-color)', background: 'var(--bg-surface)', minWidth: 80 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{totalStudents}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>Students</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 16px', border: '3px solid var(--border-color)', background: 'var(--bg-surface)', minWidth: 80 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{activeBatches}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>Batches</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 16px', border: '3px solid var(--border-color)', background: 'var(--bg-surface)', minWidth: 80 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: behindBatches > 0 ? '#dc2626' : 'inherit' }}>{behindBatches}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>Behind</div>
          </div>
        </div>
      </div>

      {/* ═══ STATS GRID (Top row) ═══ */}
      <div className="admin-stats" style={{ marginBottom: 'var(--space-xl)' }}>
        <Link to="/coordinator/students" className="admin-stats__card" style={{ textDecoration: 'none', display: 'block' }}>
          <Users size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
          <div className="admin-stats__num">{totalStudents}</div>
          <div className="admin-stats__label">Total Students</div>
        </Link>
        <Link to="/coordinator/batches" className="admin-stats__card" style={{ textDecoration: 'none', display: 'block' }}>
          <Layers size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
          <div className="admin-stats__num">{activeBatches}</div>
          <div className="admin-stats__label">Active Batches</div>
        </Link>
        <Link to="/coordinator/plans" className="admin-stats__card" style={{ textDecoration: 'none', display: 'block' }}>
          <FileText size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
          <div className="admin-stats__num">{totalPlans}</div>
          <div className="admin-stats__label">Active Plans</div>
        </Link>
        <div className="admin-stats__card" style={{ border: `3px solid ${behindBatches > 0 ? '#dc2626' : 'var(--border-color)'}` }}>
          <TrendingUp size={24} style={{ color: behindBatches > 0 ? '#dc2626' : 'var(--success)', marginBottom: 8 }} />
          <div className="admin-stats__num" style={{ color: behindBatches > 0 ? '#dc2626' : 'inherit' }}>{behindBatches}</div>
          <div className="admin-stats__label">Behind Schedule</div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.35, borderTop: '2px solid var(--gray-300)', paddingTop: 4 }}>
            <strong>Behind Schedule:</strong> Batches that started a plan ≥3 days ago but have covered less than 40% of the plan duration. Early-stage batches flagged for attention — not a measure of student performance.
          </p>
        </div>
        {stats?.aggregate?.overall?.percentage !== undefined && (
          <div className="admin-stats__card">
            <BarChart3 size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
            <div className="admin-stats__num">{stats.aggregate.overall.percentage}%</div>
            <div className="admin-stats__label">Overall Completion</div>
          </div>
        )}
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {/* Subject completion bar chart */}
        <div style={{ ...CARD }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} /> Content Progress
          </h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-300)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(value, name) => [value, name]} />
                <Bar dataKey="Completed" fill="#16a34a" stackId="a" radius={[0, 2, 2, 0]} />
                <Bar dataKey="Pending" fill="#d4d4d4" stackId="a" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>No data yet</p>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#16a34a', marginRight: 4 }} /> Completed</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#d4d4d4', marginRight: 4 }} /> Pending</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6, borderTop: '2px solid var(--gray-300)', paddingTop: 6 }}>
            <strong>What this shows:</strong> Completed (green) vs pending (gray) lessons, subtopics, and problems across all your students. This reflects content mastery, not time elapsed.
          </p>
        </div>

        {/* Batch progress bar chart */}
        <div style={{ ...CARD }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} /> Batch Plan Progress
          </h3>
          {batchSubjectData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {batchSubjectData.map(b => (
                <Link key={b.name} to={`/coordinator/batches/${b._id}`} style={{ textDecoration: 'none', color: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 700, minWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.fullName}
                    </span>
                    <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${b.dayPct}%`,
                        background: b.behind ? '#dc2626' : 'var(--success)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.7rem', minWidth: 40, textAlign: 'right', color: b.behind ? '#dc2626' : 'inherit' }}>
                      {b.dayPct}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>No active plans yet</p>
          )}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6, borderTop: '2px solid var(--gray-300)', paddingTop: 6 }}>
            <strong>What this shows:</strong> How far through its plan each batch has progressed (days elapsed ÷ total days). Red = flagged behind schedule (running ≥3 days but still early-stage). Click any bar to see batch details.
          </p>
        </div>
      </div>

      {/* ═══ BATCH CARDS ═══ */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
            <Layers size={20} /> Batch Progress Details
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/coordinator/batches" className="btn btn--sm" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Layers size={14} /> View All Batches
            </Link>
            <Link to="/coordinator/students" className="btn btn--sm" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} /> All Students
            </Link>
          </div>
        </div>

        {batches.length === 0 ? (
          <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
            <Layers size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 6 }}>No batches yet</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
              Create a batch and assign a plan to start tracking progress.
            </p>
            <Link to="/coordinator/batches" className="btn" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Create Batch
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-md)' }}>
            {batches.map(batch => {
              const plan = batch.plan;
              const progressPct = plan ? Math.round((plan.currentDay / plan.totalDays) * 100) : 0;
              const isBehind = plan?.behind;
              const dayCompletionRatio = { completed: 0, expected: 0 };

              return (
                <div key={batch._id} style={{
                  border: '3px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  boxShadow: isBehind ? '6px 6px 0 #dc2626' : 'var(--shadow)',
                  padding: 'var(--space-md)',
                  borderTop: isBehind ? '6px solid #dc2626' : '6px solid var(--success)',
                  transition: 'transform 0.12s',
                  cursor: 'pointer'
                }} onClick={() => navigate(`/coordinator/batches/${batch._id}`)}
                  onMouseEnter={e => { if (!isBehind) { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 var(--border-color)'; } }}
                  onMouseLeave={e => { if (!isBehind) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; } }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{batch.name}</h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        Code: <strong style={{ fontFamily: 'monospace' }}>{batch.code}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
                        padding: '2px 6px', border: '2px solid var(--border-color)',
                        background: batch.status === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)'
                      }}>
                        {batch.status}
                      </span>
                      {isBehind && (
                        <span style={{
                          fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
                          padding: '2px 6px', border: '2px solid #dc2626',
                          background: '#fee2e2', color: '#dc2626'
                        }}>
                          <AlertCircle size={10} style={{ verticalAlign: 'middle' }} /> Behind
                        </span>
                      )}
                    </div>
                  </div>

                  {plan ? (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', marginBottom: 6 }}>
                        <FileText size={12} />
                        <strong>{plan.planName}</strong>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
                          · Day {plan.currentDay}/{plan.totalDays}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ flex: 1, height: 10, background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: isBehind ? '#dc2626' : 'var(--success)', transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{progressPct}%</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '6px 10px', border: '2px dashed var(--border-color)', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} /> No plan assigned yet
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    <span>
                      <Users size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {batch.studentCount} student{batch.studentCount !== 1 ? 's' : ''}
                      {batch.expectedStudents ? ` / ${batch.expectedStudents}` : ''}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Eye size={12} /> View Details <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ LAGGING STUDENTS ═══ */}
      {laggingStudents.length > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-xl)', borderLeft: '6px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} style={{ color: '#dc2626' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Students Needing Attention</h2>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 10px', border: '2px solid #000', background: '#dc2626', color: '#fff' }}>
                {laggingStudents.length} flagged
              </span>
            </div>
            <Link to="/coordinator/students" className="btn btn--sm" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} /> View All Students
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
            {laggingStudents.slice(0, 20).map(s => (
              <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', border: '2px solid #000',
                background: 'var(--bg-surface)', textDecoration: 'none', color: 'inherit',
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
                  <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: '0.75rem' }}>
                    {s.batch?.name || 'No batch'} · {s.college || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {(s.attentionReasons || []).slice(0, 2).map((reason, i) => (
                    <span key={i} style={{
                      fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                      padding: '2px 6px', border: '2px solid #000',
                      background: reason.includes('Inactive') ? '#fee2e2' : reason.includes('Bottom') ? '#fef3c7' : '#e0e7ff'
                    }}>
                      {reason.length > 25 ? reason.slice(0, 25) + '…' : reason}
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
        <div
          onClick={() => setShowTopStudents(v => !v)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} style={{ color: '#16a34a' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>
              Top Performing Students
              <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                ({topStudents.length})
              </span>
            </h2>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', transition: 'transform 0.2s', display: 'inline-block', transform: showTopStudents ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>

        {showTopStudents && (
          <>
            {/* Score range filter chips */}
            <div style={{ display: 'flex', gap: 6, marginTop: 'var(--space-sm)', marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
              {FILTER_RANGES.map(fr => (
                <button key={fr.value}
                  onClick={() => setTopFilter(fr.value)}
                  style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px',
                    border: '2px solid var(--border-color)',
                    background: topFilter === fr.value ? '#16a34a' : 'var(--bg-surface)',
                    color: topFilter === fr.value ? '#fff' : 'inherit',
                    cursor: 'pointer', transition: 'all 0.1s'
                  }}>
                  {fr.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
              {filteredTopStudents.slice(0, 30).map(s => (
                <Link key={s._id} to={`/coordinator/students/${s._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', border: '2px solid #000',
                  background: 'var(--bg-surface)', textDecoration: 'none', color: 'inherit',
                  fontSize: '0.82rem', transition: 'transform 0.12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {s.avatar ? (
                    <img src={s.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid #000', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 28, height: 28, border: '2px solid #000', background: '#16a34a20', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: 6, fontSize: '0.75rem' }}>
                      {s.batch?.name || 'No batch'} · {s.college || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                      padding: '2px 6px', border: '2px solid #000',
                      background: s.progress?.planProgress?.paceStatus === 'ahead' ? '#dcfce7' : '#f0fdf4',
                      color: '#166534'
                    }}>
                    {s.progress?.planProgress?.paceStatus === 'ahead' ? 'Ahead' : s.progress?.planProgress?.paceStatus === 'on-track' ? 'On Track' : 'Active'}
                  </span>
                  {s._completionPct > 0 && (
                    <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#16a34a', minWidth: 40, textAlign: 'right' }}>
                      {s._completionPct}%
                    </span>
                  )}
                  </div>
                </Link>
              ))}
              {filteredTopStudents.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', padding: 8 }}>
                  {topStudents.length === 0 ? 'No top performers data yet. Students will appear here once they start making progress.' : 'No students match the selected score range.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div style={{ ...CARD }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={18} /> Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <Link to="/coordinator/plans/new" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <FileText size={16} /> Create Plan
          </Link>
          <Link to="/coordinator/batches" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <Layers size={16} /> New Batch
          </Link>
          <Link to="/coordinator/students" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <Users size={16} /> View Students
          </Link>
          <Link to="/coordinator/plans" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <FileText size={16} /> Manage Plans
          </Link>
          <Link to="/coordinator/general-stats" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <TrendingUp size={16} /> Detailed Stats
          </Link>
        </div>
      </div>
    </div>
  );
}
