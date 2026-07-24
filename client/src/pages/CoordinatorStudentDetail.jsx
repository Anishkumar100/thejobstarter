import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ArrowLeft, ExternalLink, Save, Trash2, TrendingUp, User, BookOpen, Database, Cpu, Target, Award, BarChart3, Brain, GraduationCap, Mail, Calendar, Edit3, ClipboardList, Layers, Clock, AlertCircle, CheckCircle, FileText, Download, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';

const SUBJECT_COLORS = { dsa: '#6366f1', dbms: '#14b8a6', os: '#f59e0b', programming: '#a855f7' };
const SUBJECT_NAMES_FULL = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Programming' };
const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };
const TOOLTIP = { background: 'var(--bg-surface)', border: '3px solid #000', padding: '8px 12px', fontSize: '0.78rem', boxShadow: '4px 4px 0 #000' };

const SUBJECT_BADGE_COLORS = {
  dsa: { bg: '#eef2ff', text: '#4338ca' },
  dbms: { bg: '#ccfbf1', text: '#0f766e' },
  os: { bg: '#fef3c7', text: '#b45309' },
  programming: { bg: '#f3e8ff', text: '#7e22ce' }
};

const TARGET_LABELS = {
  lesson: 'Lesson',
  subtopic: 'Subtopic',
  problem: 'Problem',
  topic: 'Topic'
};

export default function CoordinatorStudentDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  /* Plan day-by-day breakdown */
  const [planBreakdown, setPlanBreakdown] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    apiRequest(`/coordinator/students/${userId}`)
      .then(res => {
        setStudent(res.data);
        setForm({
          displayName: res.data.displayName || '',
          email: res.data.email || '',
          college: res.data.college || '',
          year: res.data.year || ''
        });
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [userId]);

  /* Fetch plan day-by-day breakdown with item-level details */
  useEffect(() => {
    if (!student?.progress?.planProgress?.planId || !student?.batch?._id) return;
    const pp = student.progress.planProgress;
    setBreakdownLoading(true);
    apiRequest(`/plans/${pp.planId}/day-progress/${student.batch._id}/${userId}`)
      .then(res => {
        setPlanBreakdown(res.data);
        /* Clear selected day on new data */
        setSelectedDayData(null);
      })
      .catch(err => console.error('[COORD] Day breakdown error:', err.message))
      .finally(() => setBreakdownLoading(false));
  }, [student?._id, student?.progress?.planProgress?.planId]);

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setSaveSuccess(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiRequest(`/coordinator/students/${userId}`, { method: 'PATCH', body: JSON.stringify(form) });
      setStudent(p => ({ ...p, ...res.data }));
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { alert('Failed: ' + err.message); }
    setSaving(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await apiRequest(`/coordinator/students/${userId}/remove`, { method: 'PATCH' });
      setRemoveOpen(false);
      navigate('/coordinator');
    } catch (err) { alert('Failed: ' + err.message); }
    setRemoving(false);
  };

  const getScoreGrade = (score) => {
    if (score === null || score === undefined) return { label: 'N/A', color: 'var(--text-tertiary)' };
    if (score >= 90) return { label: 'Excellent', color: '#16a34a' };
    if (score >= 70) return { label: 'Good', color: '#16a34a' };
    if (score >= 50) return { label: 'Average', color: '#eab308' };
    return { label: 'Needs Work', color: '#dc2626' };
  };

  const generateProgressStatements = () => {
    const statements = [];
    const subjList = ['dsa', 'dbms', 'os', 'programming'];
    const subjectNames = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Prog' };
    const p = student.progress || {};

    let totalLessons = 0, doneLessons = 0;
    let totalSubtopics = 0, doneSubtopics = 0;
    let totalProblems = 0, doneProblems = 0;
    let allQuizzes = 0, quizScoreSum = 0;

    for (const sub of subjList) {
      const s = p[sub];
      if (!s) continue;
      totalLessons += s.lessons?.total || 0;
      doneLessons += s.lessons?.completed || 0;
      totalSubtopics += s.subtopics?.total || 0;
      doneSubtopics += s.subtopics?.completed || 0;
      totalProblems += s.problems?.total || 0;
      doneProblems += s.problems?.completed || 0;
      const q = s.quizzes;
      if (q?.quizzesTaken > 0) {
        allQuizzes += q.quizzesTaken;
        quizScoreSum += (q.avgScore || 0) * q.quizzesTaken;
      }
    }

    const avgQuiz = allQuizzes > 0 ? Math.round(quizScoreSum / allQuizzes) : null;

    if (totalLessons > 0) {
      const pct = Math.round((doneLessons / totalLessons) * 100);
      const note = pct >= 90 ? 'Excellent progress on lessons.' : pct >= 70 ? 'Strong lesson completion rate.' : pct >= 50 ? 'Halfway through the lessons.' : pct >= 25 ? 'Making headway on the lessons.' : 'Getting started with the lessons.';
      statements.push({ icon: BookOpen, text: `Completed ${doneLessons} of ${totalLessons} lessons. ${note}`, color: pct >= 70 ? '#16a34a' : pct >= 50 ? '#eab308' : '#dc2626' });
    }
    if (totalSubtopics > 0) {
      const pct = Math.round((doneSubtopics / totalSubtopics) * 100);
      const note = pct >= 90 ? 'Nearly all topics covered.' : pct >= 70 ? 'Most topics studied.' : pct >= 50 ? 'Half of topics done.' : pct >= 25 ? 'Several topics completed.' : 'Still early in topic coverage.';
      statements.push({ icon: ClipboardList, text: `Studied ${doneSubtopics} of ${totalSubtopics} subtopics. ${note}`, color: pct >= 70 ? '#16a34a' : pct >= 50 ? '#eab308' : '#dc2626' });
    }
    if (totalProblems > 0) {
      const pct = Math.round((doneProblems / totalProblems) * 100);
      const note = pct >= 90 ? 'Outstanding problem-solving.' : pct >= 70 ? 'Strong practice.' : pct >= 50 ? 'Good amount solved.' : pct >= 25 ? 'Some problems attempted.' : 'Needs more practice.';
      statements.push({ icon: Database, text: `Solved ${doneProblems} of ${totalProblems} problems. ${note}`, color: pct >= 70 ? '#16a34a' : pct >= 50 ? '#eab308' : '#dc2626' });
    }
    if (allQuizzes > 0 && avgQuiz !== null) {
      const note = avgQuiz >= 90 ? 'Mastery level.' : avgQuiz >= 70 ? 'Good clarity.' : avgQuiz >= 50 ? 'Room for improvement.' : 'Concepts need revisiting.';
      statements.push({ icon: Target, text: `Attempted ${allQuizzes} quiz${allQuizzes !== 1 ? 'zes' : ''}, avg ${avgQuiz}%. ${note}`, color: avgQuiz >= 70 ? '#16a34a' : avgQuiz >= 50 ? '#eab308' : '#dc2626' });
    }
    for (const sub of subjList) {
      const s = p[sub];
      if (!s) continue;
      const q = s.quizzes;
      const subTotal = (s.lessons?.total || 0) + (s.subtopics?.total || 0) + (s.problems?.total || 0);
      const subDone = (s.lessons?.completed || 0) + (s.subtopics?.completed || 0) + (s.problems?.completed || 0);
      if (subTotal === 0) continue;
      const subPct = Math.round((subDone / subTotal) * 100);
      const SubIcon = sub === 'dsa' ? Cpu : sub === 'dbms' ? Database : BookOpen;
      const status = subPct >= 90 ? 'Strong.' : subPct >= 70 ? 'Good.' : subPct >= 50 ? 'Steady.' : subPct >= 25 ? 'Building.' : 'Starting.';
      const quizNote = q?.quizzesTaken > 0 ? ` | Quiz: ${q.avgScore}%` : ' | No quizzes';
      statements.push({ icon: SubIcon, text: `${subjectNames[sub]}: ${subPct}% (${subDone}/${subTotal}). ${status}${quizNote}`, color: SUBJECT_COLORS[sub] });
    }
    return statements;
  };

  const getFeedback = (pct, quizAvg) => {
    if (pct === 0) return { icon: GraduationCap, message: 'Every expert was once a beginner. Start your journey today!' };
    if (pct >= 90) return { icon: Award, message: quizAvg >= 70 ? 'Outstanding! On track to mastery.' : 'Great content progress. Focus on quizzes to solidify.' };
    if (pct >= 70) return { icon: TrendingUp, message: quizAvg >= 70 ? 'Strong progress and quiz scores. Keep momentum!' : 'Good progress. Revisit topics where quizzes dipped.' };
    if (pct >= 50) return { icon: Target, message: quizAvg >= 50 ? 'Halfway with solid quiz scores. Push through!' : 'Crossed halfway. Revisit earlier topics for better quiz scores.' };
    if (pct >= 30) return { icon: BarChart3, message: 'Making consistent progress. Keep going!' };
    return { icon: BookOpen, message: 'Every step counts. Start with one lesson today.' };
  };

  /* ── CSV Export for Plan Breakdown ── */
  const exportPlanCSV = () => {
    if (!planBreakdown?.days) return;
    const rows = [];
    const push = (cells) => rows.push(cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));
    push(['THEWEYTES — STUDENT PLAN PROGRESS EXPORT']);
    push([`Student: ${student?.displayName || student?.username || 'N/A'}`, `Plan: ${planBreakdown.planName}`, `Exported: ${new Date().toLocaleString()}`]);
    push([]);
    push(['DAY-BY-DAY BREAKDOWN']);
    push(['Day', 'Items Count', 'Completed', 'Completion %', 'Status', 'Item Subject', 'Item Type', 'Item Title', 'Instruction', 'Completed?']);
    for (const day of planBreakdown.days) {
      if (day.items.length === 0) {
        push([day.day, 0, 0, '0%', day.isFuture ? 'Future' : day.isCurrent ? 'Current' : 'Past', '', '', '', '', '']);
      } else {
        for (const item of day.items) {
          push([day.day, day.itemsCount, day.completedCount, `${day.completedPct}%`, day.isFuture ? 'Future' : day.isCurrent ? 'Current' : 'Past', item.subject, item.targetType, item.targetTitle, item.instruction, item.completed ? 'Yes' : 'No']);
        }
      }
    }
    push([]);
    push([`Overall: ${planBreakdown.overallPct}% (${planBreakdown.totalItemsCompleted}/${planBreakdown.totalItemsAssigned} items)`]);
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student?.username || 'student'}_${planBreakdown.planName.replace(/\s+/g, '_')}_progress.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading student..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;
  if (!student) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}><h2>Student not found</h2></div>;

  const progress = student.progress || {};
  const subjects = ['dsa', 'dbms', 'os', 'programming'];
  const subjectNames = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Prog' };

  const totalItems = subjects.reduce((sum, sub) => sum + (progress[sub]?.overall?.total || 0), 0);
  const completedItems = subjects.reduce((sum, sub) => sum + (progress[sub]?.overall?.completed || 0), 0);
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const allQuizzes = subjects.reduce((sum, sub) => sum + (progress[sub]?.quizzes?.quizzesTaken || 0), 0);
  const avgQuizScore = allQuizzes > 0
    ? Math.round(subjects.reduce((sum, sub) => {
        const q = progress[sub]?.quizzes;
        return sum + (q?.avgScore || 0) * (q?.quizzesTaken || 0);
      }, 0) / allQuizzes)
    : null;

  const feedback = getFeedback(overallPct, avgQuizScore);
  const FeedbackIcon = feedback.icon;
  const pp = student.progress?.planProgress;

  const subjectChartData = subjects.map(sub => {
    const s = progress[sub];
    const completed = s?.overall?.completed || 0;
    const total = s?.overall?.total || 0;
    return { subject: subjectNames[sub], completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0, fill: SUBJECT_COLORS[sub] };
  });

  const quizChartData = subjects.map(sub => {
    const q = progress[sub]?.quizzes;
    return { subject: subjectNames[sub], score: q?.avgScore || 0, taken: q?.quizzesTaken || 0, fill: SUBJECT_COLORS[sub] };
  }).filter(d => d.taken > 0);

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>{student.displayName || student.username} — Student — Coordinator</title></Helmet>

      {/* Back nav */}
      <div style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <Link to="/coordinator" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <Link to="/coordinator/students" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
          Students
        </Link>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{student.displayName || student.username}</span>
      </div>

      {/* ═══ PROFILE HEADER ═══ */}
      <div style={{ ...CARD, padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, minWidth: 250 }}>
          {student.avatar ? (
            <img src={student.avatar} alt="" style={{ width: 64, height: 64, border: '3px solid #000', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 64, height: 64, border: '3px solid #000', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={28} color="#fff" />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 2 }}>{student.displayName || student.username}</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={12} /> @{student.username}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
                <GraduationCap size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {student.college || 'No college'}
              </span>
              {student.year && (
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', border: '2px solid #000', background: 'var(--bg-tertiary)' }}>
                  Year {student.year}
                </span>
              )}
              {student.batch && (
                <Link to={`/coordinator/batches/${student.batch._id}`} style={{ fontSize: '0.7rem', padding: '2px 8px', border: '2px solid #000', background: '#dbeafe', textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
                  <Layers size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {student.batch.name}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {[
            { icon: BarChart3, label: 'Overall Progress', value: `${overallPct}%`, color: overallPct >= 50 ? '#16a34a' : '#dc2626' },
            { icon: Target, label: 'Quiz Average', value: avgQuizScore !== null ? `${avgQuizScore}%` : 'N/A', color: getScoreGrade(avgQuizScore).color },
            { icon: Calendar, label: 'Joined', value: student.coachingCenterJoinedAt ? new Date(student.coachingCenterJoinedAt).toLocaleDateString() : 'N/A', color: '#000' },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} style={{ textAlign: 'center', padding: '10px 18px', border: '3px solid #000', background: 'var(--bg-tertiary)', boxShadow: '3px 3px 0 #000', minWidth: 90 }}>
                <StatIcon size={16} style={{ marginBottom: 2 }} />
                <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ═══ 1. PLAN PROGRESS TRACKING (BATCH-SPECIFIC) ═══ */}
      {/* ════════════════════════════════════════════════════════ */}
      {pp && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid #000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} /> Plan Progress: {pp.planName}
            </h2>
            {planBreakdown?.days && (
              <button onClick={exportPlanCSV} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '6px 12px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', cursor: 'pointer', background: 'var(--bg-surface)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>

          {/* Plan summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 'var(--space-md)' }}>
            <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>Pace</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: pp.paceStatus === 'behind' ? '#dc2626' : pp.paceStatus === 'ahead' ? '#16a34a' : pp.paceStatus === 'on-track' ? '#2563eb' : 'var(--text-tertiary)' }}>
                {pp.paceStatus === 'just-started' ? 'Started' : pp.paceStatus}
              </div>
            </div>
            <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>Day</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>Day {pp.currentDayOffset}/{pp.durationDays}</div>
            </div>
            <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>Completed</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{pp.completedCount}/{pp.expectedCount} items</div>
            </div>
            {planBreakdown && (
              <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>Plan Progress</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: planBreakdown.overallPct >= 60 ? '#16a34a' : planBreakdown.overallPct >= 30 ? '#eab308' : '#dc2626' }}>{planBreakdown.overallPct}%</div>
              </div>
            )}
          </div>

          {/* Time-based progress bar */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              <span>Time elapsed</span>
              <span>{Math.round((pp.currentDayOffset / pp.durationDays) * 100)}%</span>
            </div>
            <div style={{ height: 12, background: '#e5e7eb', border: '2px solid #000', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((pp.currentDayOffset / pp.durationDays) * 100))}%`, background: pp.paceStatus === 'behind' ? '#dc2626' : '#16a34a', transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Plan started {new Date(pp.startDate || planBreakdown?.startDate).toLocaleDateString()}</p>
          </div>

          {/* ═══ Day-by-day grid with item drilldown ═══ */}
          {breakdownLoading ? (
            <div style={{ padding: 'var(--space-md)', textAlign: 'center' }}><Loader text="Loading day breakdown..." /></div>
          ) : planBreakdown?.days ? (
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} /> Day-by-Day Completion
                <span style={{ fontWeight: 400, fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>
                  ({planBreakdown.days.filter(d => !d.isFuture).length} active days)
                </span>
              </h3>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: 8, borderLeft: '3px solid #000', paddingLeft: 8 }}>
                <strong>How to read:</strong> Each square = one day of the plan. <strong>Green</strong> = all items completed. <strong>Yellow</strong> = some done. <strong>Red</strong> = nothing completed. <strong>Gray</strong> = no items or rest day. <strong>White</strong> = future day. <strong>Click any day</strong> to see exactly what was assigned and what the student did.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
                {planBreakdown.days.map(d => (
                  <div key={d.day} onClick={() => setSelectedDayData(selectedDayData?.day === d.day ? null : d)}
                    title={`Day ${d.day}: ${d.completedCount}/${d.itemsCount} items (${d.completedPct}%)${d.isCurrent ? ' — Current day' : d.isPast ? ' — Past' : ' — Future'}${d.items.length > 0 ? `. Click to see items.` : ''}`}
                    style={{
                      width: 30, height: 30, cursor: d.items?.length > 0 ? 'pointer' : 'default',
                      border: selectedDayData?.day === d.day ? '3px solid #2563eb' : d.isCurrent ? '3px solid #000' : '2px solid #000',
                      background: d.isFuture ? '#f9fafb'
                        : d.itemsCount === 0 ? '#e5e7eb'
                        : d.completedCount === d.itemsCount ? '#16a34a'
                        : d.completedCount > 0 ? '#eab308'
                        : '#fca5a5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700,
                      color: d.isFuture ? '#9ca3af' : d.itemsCount === 0 ? '#9ca3af' : '#000',
                      transition: 'transform 0.1s',
                      outline: selectedDayData?.day === d.day ? '2px solid #2563eb' : 'none',
                      outlineOffset: 1
                    }}
                    onMouseEnter={e => { if (d.items?.length > 0) e.currentTarget.style.transform = 'scale(1.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                    {d.day}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: '0.65rem', color: 'var(--text-tertiary)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#16a34a', marginRight: 3, border: '1px solid #000' }} /> All done</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#eab308', marginRight: 3, border: '1px solid #000' }} /> Partial</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fca5a5', marginRight: 3, border: '1px solid #000' }} /> None done</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#e5e7eb', marginRight: 3, border: '1px solid #000' }} /> Rest / No items</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f9fafb', marginRight: 3, border: '1px solid #000' }} /> Future</span>
              </div>

              {/* ═══ Selected Day — Item Drilldown ═══ */}
              {selectedDayData && (
                <div style={{ border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', boxShadow: '4px 4px 0 #000', marginBottom: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-sm)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={16} /> Day {selectedDayData.day} — Task Details
                      <span style={{
                        fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px',
                        border: '2px solid #000',
                        background: selectedDayData.isFuture ? '#f9fafb' : selectedDayData.isCurrent ? '#dbeafe' : selectedDayData.isPast ? '#f0fdf4' : '#f9fafb',
                        marginLeft: 4
                      }}>
                        {selectedDayData.isFuture ? 'Future' : selectedDayData.isCurrent ? 'Current' : 'Past'}
                      </span>
                    </h4>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      {selectedDayData.completedCount}/{selectedDayData.itemsCount} items completed
                      {selectedDayData.itemsCount > 0 && (
                        <span style={{ marginLeft: 6, color: selectedDayData.completedPct >= 80 ? '#16a34a' : selectedDayData.completedPct >= 50 ? '#eab308' : '#dc2626' }}>
                          ({selectedDayData.completedPct}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedDayData.items.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', padding: 'var(--space-md)', textAlign: 'center', border: '2px dashed #000' }}>
                      No items scheduled for this day (rest day).
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selectedDayData.items.map((item, idx) => {
                        const badge = SUBJECT_BADGE_COLORS[item.subject] || { bg: '#f5f5f5', text: '#000' };
                        return (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '10px 14px',
                            border: `2px solid ${item.completed ? '#16a34a' : '#000'}`,
                            background: item.completed ? '#f0fdf4' : 'var(--bg-surface)',
                            boxShadow: item.completed ? '2px 2px 0 #16a34a' : '2px 2px 0 #000'
                          }}>
                            <div style={{ flexShrink: 0, marginTop: 2 }}>
                              {item.completed ? (
                                <CheckCircle size={18} color="#16a34a" />
                              ) : (
                                <Clock size={18} color="#dc2626" />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', border: '2px solid #000', background: badge.bg, color: badge.text }}>
                                  {item.subject.toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', border: '1px solid #000', background: '#f5f5f5' }}>
                                  {TARGET_LABELS[item.targetType] || item.targetType}
                                </span>
                                {item.completed ? (
                                  <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', border: '1px solid #16a34a', background: '#dcfce7', color: '#166534' }}>COMPLETED</span>
                                ) : (
                                  <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', border: '1px solid #dc2626', background: '#fee2e2', color: '#991b1b' }}>PENDING</span>
                                )}
                              </div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{item.targetTitle}</div>
                              {/* Full hierarchy path: Subject > Lesson > Subtopic > Problem */}
                              {(() => {
                                const subName = SUBJECT_NAMES_FULL[item.subject] || item.subject?.toUpperCase();
                                const labels = [];
                                if (item.targetType === 'lesson') {
                                  labels.push(`Subject: ${subName}  |  Lesson: ${item.targetTitle}`);
                                } else if (item.targetType === 'subtopic') {
                                  labels.push(`Subject: ${subName}`);
                                  if (item.lessonTitle) labels.push(`Lesson: ${item.lessonTitle}`);
                                  labels.push(`Subtopic: ${item.targetTitle}`);
                                } else if (item.targetType === 'problem') {
                                  labels.push(`Subject: ${subName}`);
                                  if (item.lessonTitle) labels.push(`Lesson: ${item.lessonTitle}`);
                                  if (item.subtopicTitle) labels.push(`Subtopic: ${item.subtopicTitle}`);
                                  labels.push(`Problem: ${item.targetTitle}`);
                                }
                                return (
                                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 1, fontFamily: 'monospace', lineHeight: 1.6 }}>
                                    {labels.map((l, i) => (
                                      <span key={i}>{i > 0 && <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>}{l}</span>
                                    ))}
                                  </div>
                                );
                              })()}
                              {item.instruction && (
                                <div style={{ fontSize: '0.78rem', marginTop: 6, padding: '8px 10px', border: '2px solid #000', background: '#fffbeb' }}>
                                  <span style={{ fontWeight: 700, display: 'block', marginBottom: 2, textTransform: 'uppercase', fontSize: '0.6rem' }}>📋 Instruction for Student:</span>
                                  {item.instruction}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ Remarks Section ═══ */}
              <div style={{ border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={14} /> Remarks / Notes
                </h4>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add remarks about this student's plan progress, areas of concern, or suggestions..."
                  rows={3}
                  style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.78rem', background: 'var(--bg-surface)', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Remarks are local to this view and not saved to the server.</span>
                  {remarks && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', border: '1px solid #000', background: '#f5f5f5' }}>
                      {remarks.length} chars
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : pp.itemsBehind && pp.itemsBehind.length > 0 ? (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={14} /> {pp.itemsBehind.length} item(s) behind schedule:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pp.itemsBehind.slice(0, 10).map((item, i) => (
                  <div key={i} style={{ fontSize: '0.72rem', padding: '4px 8px', border: '1px solid #000', display: 'flex', alignItems: 'center', gap: 4, background: '#fef2f2' }}>
                    <AlertCircle size={10} color="#dc2626" />
                    <span style={{ fontWeight: 600 }}>{item.targetTitle || item.targetType}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>(Day {item.dayOffset})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ═══ FEEDBACK BANNER ═══ */}
      {overallPct > 0 && (
        <div style={{ padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-lg)', border: '3px solid #000', background: '#f0fdf4', boxShadow: '4px 4px 0 #000', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FeedbackIcon size={24} style={{ flexShrink: 0, color: '#16a34a' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{feedback.message}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              <strong>{overallPct}%</strong> complete across {totalItems} items &middot; {allQuizzes} quiz{allQuizzes !== 1 ? 'zes' : ''} attempted
            </p>
          </div>
        </div>
      )}

      {/* ═══ 2. GENERAL PROGRESS DASHBOARD ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={16} /> General Progress Dashboard
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {subjects.map(sub => {
            const s = progress[sub];
            const name = subjectNames[sub];
            const completed = s?.overall?.completed || 0;
            const total = s?.overall?.total || 0;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const quizzes = s?.quizzes?.quizzesTaken || 0;
            const quizScore = s?.quizzes?.avgScore || null;
            const SubIcon = sub === 'dsa' ? Cpu : sub === 'dbms' ? Database : BookOpen;
            const color = SUBJECT_COLORS[sub];

            return (
              <div key={sub} style={{ border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', boxShadow: '3px 3px 0 #000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color }}>
                    <SubIcon size={16} /> {name}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', color: pct >= 50 ? '#16a34a' : '#dc2626' }}>{pct}%</span>
                </div>
                <div style={{ height: 12, background: '#e5e7eb', border: '2px solid #000', marginBottom: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                  <span>Lessons: {s?.lessons?.completed || 0}/{s?.lessons?.total || 0}</span>
                  <span>Topics: {s?.subtopics?.completed || 0}/{s?.subtopics?.total || 0}</span>
                  <span>Problems: {s?.problems?.completed || 0}/{s?.problems?.total || 0}</span>
                </div>
                {quizzes > 0 && (
                  <div style={{ marginTop: 6, fontSize: '0.72rem', fontWeight: 600, color: getScoreGrade(quizScore).color, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Target size={12} /> Quiz: {quizScore}% ({quizzes} attempt{quizzes !== 1 ? 's' : ''})
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
          <div>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <BarChart3 size={14} /> Completion by Subject
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <RechartTooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return <div style={TOOLTIP}><p style={{ fontWeight: 700, marginBottom: 2 }}>{d.subject}</p><p>{d.completed} of {d.total} items ({d.pct}%)</p></div>;
                }} />
                <Bar dataKey="pct" name="Percentage">
                  {subjectChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  <LabelList dataKey="pct" position="top" fontSize={11} fontWeight={700} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Target size={14} /> Quiz Performance
            </h3>
            {quizChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quizChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <RechartTooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return <div style={TOOLTIP}><p style={{ fontWeight: 700, marginBottom: 2 }}>{d.subject}</p><p style={{ color: d.fill, fontWeight: 600 }}>Score: {d.score}%</p><p style={{ color: 'var(--text-tertiary)' }}>{d.taken} attempt{d.taken !== 1 ? 's' : ''}</p></div>;
                  }} />
                  <Bar dataKey="score" name="Score">
                    {quizChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    <LabelList dataKey="score" position="top" fontSize={11} fontWeight={700} formatter={(v) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', padding: 'var(--space-md)', textAlign: 'center', border: '2px dashed #000' }}>
                No quiz data available yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DETAILED PROGRESS ANALYSIS ═══ */}
      {totalItems > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} /> General Progress Analysis
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {generateProgressStatements().map((stmt, i) => {
              const StmtIcon = stmt.icon;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: 'var(--space-sm) var(--space-md)',
                  border: '2px solid #000',
                  background: 'var(--bg-tertiary)',
                  boxShadow: '2px 2px 0 #000'
                }}>
                  <div style={{ flexShrink: 0, width: 28, height: 28, border: '2px solid #000', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StmtIcon size={14} style={{ color: stmt.color }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.5, margin: 0, flex: 1 }}>
                    <span style={{ color: stmt.color, fontWeight: 700 }}>{stmt.text}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ PROFILE DETAILS ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={16} /> Profile Details
          </h2>
          <button onClick={() => { setEditing(!editing); setSaveSuccess(false); }} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 12px', border: '2px solid #000', cursor: 'pointer', background: 'var(--bg-surface)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {editing ? 'Cancel' : <><Edit3 size={12} /> Edit</>}
          </button>
        </div>
        {saveSuccess && (
          <div style={{ padding: '6px 12px', background: '#f0fdf4', border: '2px solid #16a34a', marginBottom: 'var(--space-sm)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> Profile updated successfully!
          </div>
        )}
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxWidth: 480 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>Display Name</label>
            <input className="input" name="displayName" value={form.displayName} onChange={handleChange} />
            <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>Email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} />
            <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>College</label>
            <input className="input" name="college" value={form.college} onChange={handleChange} />
            <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>Year</label>
            <input className="input" name="year" value={form.year} onChange={handleChange} />
            <button onClick={handleSave} disabled={saving} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '8px 16px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', cursor: 'pointer', background: '#000', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 'var(--space-sm)' }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', fontSize: '0.85rem' }}>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Username</span>@{student.username}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Display Name</span>{student.displayName || '\u2014'}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Email</span>{student.email || '\u2014'}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>College</span>{student.college || '\u2014'}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Year</span>{student.year || '\u2014'}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Bio</span>{student.bio || '\u2014'}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Joined Platform</span>{student.joinDate ? new Date(student.joinDate).toLocaleDateString() : '\u2014'}</div>
            <div><span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Linked to Centre</span>{student.coachingCenterJoinedAt ? new Date(student.coachingCenterJoinedAt).toLocaleDateString() : '\u2014'}</div>
          </div>
        )}
      </div>

      {/* ═══ BATCH DETAILS ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={16} /> Batch
        </h2>
        {student.batch ? (
          <div style={{ fontSize: '0.85rem' }}>
            <p><strong>Batch:</strong> {student.batch.name || '\u2014'}</p>
            {student.batch.code && (
              <p><strong>Code:</strong> <code style={{ background: '#f5f5f5', padding: '2px 6px', border: '2px solid #000', fontFamily: 'monospace' }}>{student.batch.code}</code></p>
            )}
            {student.batch.status && (
              <p><strong>Status:</strong> <span style={{ padding: '2px 6px', border: '2px solid #000', background: student.batch.status === 'active' ? '#f0fdf4' : '#f5f5f5', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{student.batch.status}</span></p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>This student is not assigned to any batch.</p>
        )}
      </div>

      {/* ═══ LINKS + SKILLS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {student.externalLinks?.length > 0 && (
          <div style={{ ...CARD }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={16} /> External Links
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {student.externalLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {link.label || link.platform} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        )}
        {student.skills?.length > 0 && (
          <div style={{ ...CARD }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Brain size={16} /> Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {student.skills.map((skill, i) => (
                <span key={i} style={{ padding: '3px 10px', border: '2px solid #000', background: 'var(--bg-tertiary)', fontSize: '0.72rem', fontWeight: 600 }}>{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ DANGER ZONE ═══ */}
      <div style={{ border: '3px solid #dc2626', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #dc2626' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={16} /> Danger Zone
        </h2>
        <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
          Remove this student from your center. Their account and progress are preserved — they just won't be linked anymore.
        </p>
        <button onClick={() => setRemoveOpen(true)} disabled={removing} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '8px 16px', border: '3px solid #dc2626', boxShadow: '3px 3px 0 #dc2626', cursor: 'pointer', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={14} /> Remove from Center
        </button>
      </div>

      {/* Remove Modal */}
      <Modal isOpen={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove Student">
        <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.88rem' }}>
          Remove <strong>{student.displayName || student.username}</strong> from this center?
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setRemoveOpen(false)} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px', border: '2px solid #000', cursor: 'pointer', background: 'var(--bg-surface)' }}>Cancel</button>
          <button onClick={handleRemove} disabled={removing} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px', border: '2px solid #dc2626', cursor: 'pointer', background: '#dc2626', color: '#fff' }}>
            {removing ? 'Removing...' : 'Yes, remove'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
