import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProgressStore } from '../stores/useProgressStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useProgressMessageStore } from '../stores/useProgressMessageStore.js';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, LabelList, Cell
} from 'recharts';
import {
  Calendar, CheckCircle, Clock, FileText, AlertCircle, Download,
  TrendingUp, BookOpen, Database, Cpu, Target, Award, BarChart3,
  Brain, GraduationCap, ClipboardList, ArrowLeft, MessageSquare,
  ChevronRight, Zap, Flag, Layers, Users, Gauge, ListChecks,
  Activity, Lightbulb, PencilLine, BookMarked,
  FolderOpen, Timer, Percent, Hash, Layers3, FlagTriangleRight, ListTodo
} from 'lucide-react';

/* ─── Theme-aware design tokens ─── */
const B = 'var(--border-color)';
const TXT = 'var(--text-primary)';
const TXT2 = 'var(--text-secondary)';
const TXT3 = 'var(--text-tertiary)';
const SURF = 'var(--bg-surface)';
const TERT = 'var(--bg-tertiary)';
const SHADOW = 'var(--shadow-color)';
const SH = (n) => `${n}px ${n}px 0 var(--shadow-color)`;

/* ─── Domain constants ─── */
const SUBJECT_COLORS = { dsa: '#6366f1', dbms: '#14b8a6', os: '#f59e0b', programming: '#a855f7' };
const SUBJECT_NAMES = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Prog' };
const SUBJECT_NAMES_FULL = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Programming' };
const SUBJECT_BADGE = {
  dsa: { bg: 'var(--badge-dsa-bg, #eef2ff)', text: 'var(--badge-dsa-text, #4338ca)' },
  dbms: { bg: 'var(--badge-dbms-bg, #ccfbf1)', text: 'var(--badge-dbms-text, #0f766e)' },
  os: { bg: 'var(--badge-os-bg, #fef3c7)', text: 'var(--badge-os-text, #b45309)' },
  programming: { bg: 'var(--badge-prog-bg, #f3e8ff)', text: 'var(--badge-prog-text, #7e22ce)' }
};
const TARGET_LABELS = { lesson: 'Lesson', subtopic: 'Subtopic', problem: 'Problem' };
const PACE_COLORS = { ahead: 'var(--success)', 'on-track': 'var(--accent)', behind: 'var(--error)', 'just-started': TXT3 };

/* ─── Helpers ─── */
const getScoreGrade = (score) => {
  if (score === null || score === undefined) return { label: 'N/A', color: TXT3 };
  if (score >= 90) return { label: 'Excellent', color: 'var(--success)' };
  if (score >= 70) return { label: 'Good', color: 'var(--success)' };
  if (score >= 50) return { label: 'Average', color: 'var(--warning)' };
  return { label: 'Needs Work', color: 'var(--error)' };
};

const getFeedback = (pct, quizAvg) => {
  if (pct === 0) return { icon: GraduationCap, message: 'Every expert was once a beginner. Start your journey today!', detail: 'Complete your first lesson to begin tracking progress.' };
  if (pct >= 90) return { icon: Award, message: 'Outstanding! You are on track to mastery.', detail: quizAvg >= 70 ? 'Your quiz scores confirm deep understanding. Keep challenging yourself with harder problems.' : 'Great content progress. Focus on quizzes to solidify concepts and identify weak areas.' };
  if (pct >= 70) return { icon: TrendingUp, message: 'Strong progress — keep the momentum!', detail: quizAvg >= 70 ? 'Quiz scores match your content pace. Excellent consistency across the board.' : 'Good progress. Revisit topics where quiz scores dipped to reinforce understanding.' };
  if (pct >= 50) return { icon: Target, message: 'Halfway there — push through!', detail: quizAvg >= 50 ? 'Solid quiz foundation. Maintain consistency and target weaker subjects.' : 'Crossed the halfway mark. Review earlier topics to improve quiz performance.' };
  if (pct >= 30) return { icon: BarChart3, message: 'You are making consistent progress.', detail: 'Every lesson adds to your foundation. Stay disciplined and focus on completing daily targets.' };
  return { icon: BookOpen, message: 'Every step counts — start small.', detail: 'Begin with one lesson today. Progress compounds quickly when you show up every day.' };
};

/* ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── */
/*  COMPONENT                                  */
/* ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── */
export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { summary: progressSummary, loading: progressLoading, fetchSummary: fetchProgressSummary } = useProgressStore();
  const { messages: progressMessages, fetchMessages: fetchProgressMessages } = useProgressMessageStore();
  const [userPlanBreakdown, setUserPlanBreakdown] = useState(null);
  const [userBdLoading, setUserBdLoading] = useState(false);
  const [planSelectedDay, setPlanSelectedDay] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!progressSummary) fetchProgressSummary();
    fetchProgressMessages();
  }, []);

  useEffect(() => {
    const pp = progressSummary?.planProgress;
    const batchId = user?.batch?._id;
    const userId = user?._id;
    if (!pp?.planId || !batchId || !userId) return;
    setUserBdLoading(true);
    apiRequest(`/plans/${pp.planId}/day-progress/${batchId}/${userId}`)
      .then(res => setUserPlanBreakdown(res.data))
      .catch(err => console.error('[Dashboard] Day breakdown error:', err.message))
      .finally(() => setUserBdLoading(false));
  }, [progressSummary?.planProgress?.planId, user?.batch?._id, user?._id]);

  const subjects = ['dsa', 'dbms', 'os', 'programming'];
  const progress = progressSummary || {};

  /* ── Compute overall stats ── */
  const computeOverallStats = () => {
    const total = subjects.reduce((s, sub) => s + (progress[sub]?.overall?.total || 0), 0);
    const completed = subjects.reduce((s, sub) => s + (progress[sub]?.overall?.completed || 0), 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const allQuizzes = subjects.reduce((s, sub) => s + (progress[sub]?.quizzes?.quizzesTaken || 0), 0);
    const avgQuizScore = allQuizzes > 0
      ? Math.round(subjects.reduce((s, sub) => {
          const q = progress[sub]?.quizzes;
          return s + (q?.avgScore || 0) * (q?.quizzesTaken || 0);
        }, 0) / allQuizzes)
      : null;
    return { totalItems: total, completedItems: completed, overallPct: pct, allQuizzes, avgQuizScore };
  };
  const { totalItems, completedItems, overallPct, allQuizzes, avgQuizScore } = useMemo(computeOverallStats, [progressSummary]);

  const pp = progressSummary?.planProgress;
  const feedback = getFeedback(overallPct, avgQuizScore);
  const FeedbackIcon = feedback.icon;
  const timePct = pp ? Math.round((pp.currentDayOffset / (pp.durationDays || 1)) * 100) : 0;

  const behindCount = useMemo(() => {
    if (userPlanBreakdown?.days) {
      return userPlanBreakdown.days
        .filter(d => !d.isFuture)
        .reduce((sum, d) => sum + (d.itemsCount - d.completedCount), 0);
    }
    return pp?.itemsBehind?.length || 0;
  }, [userPlanBreakdown, pp]);

  /* ── Aggregate plan data ── */
  const planAgg = useMemo(() => {
    if (!userPlanBreakdown?.days) return null;
    const t = { lesson: 0, subtopic: 0, problem: 0 };
    const d = { lesson: 0, subtopic: 0, problem: 0 };
    const sa = {};
    for (const day of userPlanBreakdown.days) {
      for (const item of day.items) {
        if (t[item.targetType] !== undefined) t[item.targetType]++;
        if (item.completed && d[item.targetType] !== undefined) d[item.targetType]++;
        if (!sa[item.subject]) sa[item.subject] = { total: 0, done: 0 };
        sa[item.subject].total++;
        if (item.completed) sa[item.subject].done++;
      }
    }
    const activeDays = userPlanBreakdown.days.filter(dd => !dd.isFuture && dd.itemsCount > 0);
    const fullDays = activeDays.filter(dd => dd.completedCount === dd.itemsCount);
    return { t, d, sa, activeDays: activeDays.length, fullDays: fullDays.length };
  }, [userPlanBreakdown]);

  /* ── Chart data builders ── */
  const chartData = useMemo(() => {
    if (!userPlanBreakdown?.days) return { typeData: [], subjData: [], trend: [] };
    const tc = { lesson: 0, subtopic: 0, problem: 0 };
    const td = { lesson: 0, subtopic: 0, problem: 0 };
    const sa = {};
    for (const day of userPlanBreakdown.days) {
      for (const item of day.items) {
        if (tc[item.targetType] !== undefined) tc[item.targetType]++;
        if (item.completed && td[item.targetType] !== undefined) td[item.targetType]++;
        if (!sa[item.subject]) sa[item.subject] = { total: 0, done: 0 };
        sa[item.subject].total++;
        if (item.completed) sa[item.subject].done++;
      }
    }
    return {
      typeData: [
        { type: 'Lessons', total: tc.lesson, done: td.lesson, fill: 'var(--accent)' },
        { type: 'Subtopics', total: tc.subtopic, done: td.subtopic, fill: 'var(--warning)' },
        { type: 'Problems', total: tc.problem, done: td.problem, fill: '#a855f7' }
      ].filter(d => d.total > 0),
      subjData: Object.entries(sa).map(([sub, d]) => ({
        subject: SUBJECT_NAMES[sub] || sub,
        total: d.total,
        done: d.done,
        fill: SUBJECT_COLORS[sub] || 'var(--border-color)'
      })),
      trend: userPlanBreakdown.days.filter(d => !d.isFuture).map(d => ({
        day: `D${d.day}`, done: d.completedCount, total: d.itemsCount
      }))
    };
  }, [userPlanBreakdown]);

  /* ── Export CSV ── */
  const exportPlanCSV = () => {
    if (!userPlanBreakdown?.days) return;
    const rows = [];
    const push = (cells) => rows.push(cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));
    push(['THEWEBYTES — MY PLAN PROGRESS EXPORT']);
    push([`Student: ${user?.displayName || user?.username || 'N/A'}`, `Plan: ${userPlanBreakdown.planName}`, `Exported: ${new Date().toLocaleString()}`]);
    push([]); push(['DAY-BY-DAY BREAKDOWN']);
    push(['Day', 'Items Count', 'Completed', 'Completion %', 'Status', 'Item Subject', 'Item Type', 'Item Title', 'Instruction', 'Completed?']);
    for (const day of userPlanBreakdown.days) {
      if (day.items.length === 0) push([day.day, 0, 0, '0%', day.isFuture ? 'Future' : day.isCurrent ? 'Current' : 'Past', '', '', '', '', '']);
      else for (const item of day.items) push([day.day, day.itemsCount, day.completedCount, `${day.completedPct}%`, day.isFuture ? 'Future' : day.isCurrent ? 'Current' : 'Past', item.subject, item.targetType, item.targetTitle, item.instruction, item.completed ? 'Yes' : 'No']);
    }
    push([]); push([`Overall: ${userPlanBreakdown.overallPct}% (${userPlanBreakdown.totalItemsCompleted}/${userPlanBreakdown.totalItemsAssigned} items)`]);
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${user?.username || 'student'}_${(userPlanBreakdown.planName || 'plan').replace(/\s+/g, '_')}_progress.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  /* ── Utility styles ── */
  const card = (shadow = 8) => ({ border: `3px solid ${B}`, padding: '24px', background: SURF, boxShadow: `${shadow}px ${shadow}px 0 var(--shadow-color)` });
  const statCard = { border: `3px solid ${B}`, padding: '16px', background: TERT, boxShadow: SH(6), textAlign: 'center' };
  const tinyCard = (shadow = 4) => ({ border: `3px solid ${B}`, padding: '12px 14px', background: TERT, boxShadow: SH(shadow) });
  const tooltipStyle = { background: SURF, border: `3px solid ${B}`, padding: '10px 14px', fontSize: '0.78rem', boxShadow: SH(6) };
  const btnBase = (bg = '#000', fg = '#fff') => ({
    fontSize: '0.65rem', fontWeight: 700, padding: '8px 16px',
    border: `3px solid ${B}`, cursor: 'pointer',
    background: bg, color: fg,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'transform 0.12s, box-shadow 0.12s',
    boxShadow: SH(4)
  });
  const labelSm = { fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: TXT3, marginBottom: 4 };

  /* ── Render helpers ── */
  const renderHierarchy = (item) => {
    const subName = SUBJECT_NAMES_FULL[item.subject] || item.subject?.toUpperCase();
    const parts = [];
    if (item.targetType === 'lesson') parts.push(`Subject: ${subName}`, `Lesson: ${item.targetTitle}`);
    else if (item.targetType === 'subtopic') {
      parts.push(`Subject: ${subName}`);
      if (item.lessonTitle) parts.push(`Lesson: ${item.lessonTitle}`);
      parts.push(`Subtopic: ${item.targetTitle}`);
    } else if (item.targetType === 'problem') {
      parts.push(`Subject: ${subName}`);
      if (item.lessonTitle) parts.push(`Lesson: ${item.lessonTitle}`);
      if (item.subtopicTitle) parts.push(`Subtopic: ${item.subtopicTitle}`);
      parts.push(`Problem: ${item.targetTitle}`);
    }
    return parts.length > 0 ? (
      <div style={{ fontSize: '0.72rem', color: TXT2, marginTop: 3, fontFamily: 'monospace', lineHeight: 1.7 }}>
        {parts.map((p, i) => (
          <span key={i}>{i > 0 && <span style={{ margin: '0 5px', opacity: 0.3 }}>|</span>}{p}</span>
        ))}
      </div>
    ) : null;
  };

  if (progressLoading && !progressSummary) {
    return (
      <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
        <Loader text="LOADING DASHBOARD..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>My Dashboard — TheJobStarter</title></Helmet>

      {/* ═══════════════════════════════════════════════ */}
      {/*  HEADER                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 36,
        borderBottom: `3px solid ${B}`, paddingBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user?.username && (
            <Link to={`/users/${user.username}`}
              style={{
                fontSize: '0.72rem', fontWeight: 700,
                padding: '6px 14px', border: `3px solid ${B}`, boxShadow: SH(4),
                textDecoration: 'none', color: TXT, background: SURF,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                transition: 'transform 0.12s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = SH(6); }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SH(4); }}>
              <ArrowLeft size={14} /> Profile
            </Link>
          )}
          <div style={{ width: 3, height: 32, background: B }} />
          <div>
            <h1 style={{
              fontSize: '1.4rem', fontWeight: 900, margin: 0,
              display: 'flex', alignItems: 'center', gap: 10,
              textTransform: 'uppercase', letterSpacing: '-0.02em', color: TXT
            }}>
              <Gauge size={24} /> Dashboard
            </h1>
            {user?.batch?.name || user?.coachingCenter?.name ? (
              <p style={{ fontSize: '0.75rem', color: TXT2, margin: '3px 0 0', lineHeight: 1.5 }}>
                {[user?.coachingCenter?.name, user?.batch?.name].filter(Boolean).join(' · ')}
                {pp?.planName ? ` · Plan: ${pp.planName}` : ''}
              </p>
            ) : null}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {userPlanBreakdown?.days && (
            <button onClick={exportPlanCSV}
              style={btnBase('var(--bg-inverse)', 'var(--text-inverse)')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = SH(6); }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SH(4); }}>
              <Download size={14} /> EXPORT CSV
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  NO PLAN STATE                                 */}
      {/* ═══════════════════════════════════════════════ */}
      {!pp && !progressLoading && (
        <div style={{ ...card(), padding: '48px 40px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, margin: '0 auto 20px',
            border: `3px solid ${B}`, boxShadow: SH(6),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: TERT
          }}>
            <GraduationCap size={36} style={{ color: TXT }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase', color: TXT }}>
            Welcome to Your Dashboard
          </h2>
              <p style={{ fontSize: '0.95rem', color: TXT2, maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.8 }}>
            {totalItems > 0
              ? 'Your coaching centre will assign a structured learning plan soon. Once assigned, this dashboard will show your daily tasks, real-time progress tracking, plan analytics, and personalised insights to keep you on top of your preparation.'
              : 'Start exploring subjects to track your progress. Your dashboard will light up with daily targets, completion stats, and actionable feedback once a learning plan is assigned.'}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dsa"
              style={{
                fontSize: '0.78rem', fontWeight: 700,
                padding: '12px 28px', border: `3px solid ${B}`, boxShadow: SH(4),
                background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.12s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = SH(6); }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SH(4); }}>
              <BookOpen size={18} /> EXPLORE SUBJECTS
            </Link>
            <Link to={`/users/${user?.username}`}
              style={{
                fontSize: '0.78rem', fontWeight: 700,
                padding: '12px 28px', border: `3px solid ${B}`, boxShadow: SH(4),
                background: SURF, color: TXT,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.12s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = SH(6); }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SH(4); }}>
              <Users size={18} /> VIEW PROFILE
            </Link>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/*  MAIN DASHBOARD                                */}
      {/* ═══════════════════════════════════════════════ */}
      {pp && !progressLoading && (
        <>
          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 1 — OVERVIEW STATS                    */}
          {/* ─────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 14, marginBottom: 36
          }}>
            {[
              {
                icon: BarChart3, label: 'Overall Progress',
                value: `${overallPct}%`,
                desc: 'Your completion rate across DSA, DBMS, OS, and Programming — everything you have covered so far.',
                color: overallPct >= 60 ? 'var(--success)' : overallPct >= 30 ? 'var(--warning)' : 'var(--error)'
              },
              {
                icon: Target, label: 'Quiz Average',
                value: avgQuizScore !== null ? `${avgQuizScore}%` : 'N/A',
                desc: 'Average score across all quizzes taken. Reflects how well you understand each subject.',
                color: getScoreGrade(avgQuizScore).color
              },
              {
                icon: Calendar, label: 'Plan Timeline',
                value: pp ? `Day ${pp.currentDayOffset}` : '—',
                desc: `Your current position in the ${pp?.durationDays || 0}-day learning plan — how far along you are.`,
                color: TXT
              },
              {
                icon: Zap, label: 'Pace Status',
                value: pp?.paceStatus === 'just-started' ? 'Started' : (pp?.paceStatus || '—'),
                desc: pp?.paceStatus === 'ahead' ? 'You are ahead of schedule — excellent discipline and consistency.' :
                       pp?.paceStatus === 'behind' ? 'You have pending items from past days. Catch up to stay on track.' :
                       pp?.paceStatus === 'on-track' ? 'You are keeping pace with your plan — steady and consistent.' :
                       'Your plan has just begun. Complete today\'s tasks to build momentum.',
                color: PACE_COLORS[pp?.paceStatus] || TXT3
              },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <div key={i} style={statCard}>
                  <div style={{
                    width: 36, height: 36, margin: '0 auto 10px',
                    border: `3px solid ${B}`, boxShadow: SH(3),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: SURF
                  }}>
                    <StatIcon size={18} style={{ color: TXT }} />
                  </div>
                  <div style={labelSm}>{stat.label}</div>
                  <div style={{
                    fontSize: '1.6rem', fontWeight: 900,
                    color: stat.color, lineHeight: 1.1, marginBottom: 6
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', color: TXT2, lineHeight: 1.55,
                    maxWidth: 170, margin: '0 auto'
                  }}>
                    {stat.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 2 — PLAN PROGRESS                     */}
          {/* ─────────────────────────────────────────────── */}
          <div style={{ ...card(), marginBottom: 36, borderLeft: `8px solid var(--accent)` }}>
            {/* Plan header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontSize: '1.1rem', fontWeight: 900, margin: 0,
                  display: 'flex', alignItems: 'center', gap: 10, color: TXT
                }}>
                  <FileText size={22} /> {pp.planName}
                </h2>
                <p style={{ fontSize: '0.82rem', color: TXT2, margin: '6px 0 0', lineHeight: 1.65 }}>
                  Your structured daily plan. Each day has specific lessons, subtopics, and problems assigned for you to complete.
                  {pp.startDate ? ` Started ${new Date(pp.startDate).toLocaleDateString()}.` : ''}
                  {pp.endDate ? ` Ends ${new Date(pp.endDate).toLocaleDateString()}.` : ''}
                </p>
              </div>
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                padding: '5px 14px', border: `3px solid ${PACE_COLORS[pp.paceStatus] || TXT3}`,
                color: PACE_COLORS[pp.paceStatus] || TXT3,
                whiteSpace: 'nowrap', letterSpacing: '0.05em', flexShrink: 0
              }}>
                {pp.paceStatus === 'just-started' ? 'JUST STARTED' :
                 pp.paceStatus === 'on-track' ? 'ON TRACK ✓' :
                 pp.paceStatus === 'ahead' ? 'AHEAD ⚡' : 'BEHIND ⚠'}
              </span>
            </div>

            {/* Plan summary metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
              {[
                { icon: Activity, label: 'Current Pace', value: pp.paceStatus === 'just-started' ? 'Just Started' : pp.paceStatus === 'on-track' ? 'On Track' : pp.paceStatus, desc: 'Your progress relative to the plan schedule — how well you are keeping up.', color: PACE_COLORS[pp.paceStatus] || TXT },
                { icon: Timer, label: 'Plan Day', value: `Day ${pp.currentDayOffset}`, desc: `Out of ${pp.durationDays} total days in this plan. Stay consistent each day.`, color: TXT },
                { icon: ListChecks, label: 'Items Completed', value: `${pp.completedCount} / ${pp.expectedCount}`, desc: 'How many assigned items you have finished so far. Keep checking them off!', color: TXT },
                { icon: Percent, label: 'Plan Progress', value: userPlanBreakdown ? `${userPlanBreakdown.overallPct}%` : `${Math.round((pp.completedCount / Math.max(1, pp.expectedCount)) * 100)}%`, desc: 'Overall completion percentage across all plan days combined.', color: (userPlanBreakdown?.overallPct || Math.round((pp.completedCount / Math.max(1, pp.expectedCount)) * 100)) >= 60 ? 'var(--success)' : 'var(--error)' },
              ].map((s, i) => {
                const SI = s.icon;
                return (
                  <div key={i} style={tinyCard()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <SI size={12} style={{ color: TXT3 }} />
                      <div style={labelSm}>{s.label}</div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: '0.68rem', color: TXT2, marginTop: 2, lineHeight: 1.45 }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Time elapsed bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.72rem', fontWeight: 700, color: TXT2, marginBottom: 6
              }}>
                <span>TIME ELAPSED</span>
                <span>{timePct}% of plan duration used</span>
              </div>
              <div style={{
                height: 18, background: TERT, border: `3px solid ${B}`, overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, timePct)}%`,
                  background: pp.paceStatus === 'behind' ? 'var(--error)' : 'var(--success)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ fontSize: '0.72rem', color: TXT2, marginTop: 6, lineHeight: 1.55 }}>
                {pp.paceStatus === 'behind'
                  ? '⚠ You are behind schedule. Prioritise pending items from past days to catch up.'
                  : pp.paceStatus === 'ahead'
                    ? '⚡ Ahead of schedule! Maintain this momentum and you will finish strong.'
                    : '✓ Stay consistent — showing up every day is the key to mastering the material.'}
              </p>
            </div>

            {/* ═══ DAY GRID ═══ */}
            <div style={{
              borderTop: `2px solid ${B}`, paddingTop: 20, marginTop: 4
            }}>
              <h3 style={{
                fontSize: '0.9rem', fontWeight: 900, margin: '0 0 4px',
                display: 'flex', alignItems: 'center', gap: 8, color: TXT
              }}>
                <Calendar size={18} /> DAILY TASK COMPLETION
                {userPlanBreakdown?.days && (
                  <span style={{ fontWeight: 400, fontSize: '0.7rem', color: TXT2, marginLeft: 4 }}>
                    ({userPlanBreakdown.days.filter(d => !d.isFuture).length} days elapsed)
                  </span>
                )}
              </h3>
              <p style={{
                fontSize: '0.78rem', color: TXT2, marginBottom: 14,
                borderLeft: `3px solid var(--accent)`, paddingLeft: 12, lineHeight: 1.6
              }}>
                <strong>Green</strong> = all items done &nbsp;|&nbsp; <strong>Yellow</strong> = partial &nbsp;|&nbsp;
                <strong>Red</strong> = not started &nbsp;|&nbsp; <strong>Gray</strong> = rest day &nbsp;|&nbsp;
                <strong>Outlined</strong> = future. <strong>Click any day</strong> to drill into its tasks and see what needs attention.
              </p>

              {userBdLoading ? (
                <div style={{ padding: 24, textAlign: 'center' }}><Loader text="LOADING DAYS..." /></div>
              ) : userPlanBreakdown?.days ? (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {userPlanBreakdown.days.map(d => {
                      const isSelected = planSelectedDay?.day === d.day;
                      let bg;
                      if (d.isFuture) bg = TERT;
                      else if (d.itemsCount === 0) bg = '#a8a29e';
                      else if (d.completedCount === d.itemsCount) bg = 'var(--success)';
                      else if (d.completedCount > 0) bg = 'var(--warning)';
                      else bg = 'var(--error)';
                      return (
                        <div key={d.day}
                          onClick={() => setPlanSelectedDay(isSelected ? null : d)}
                          title={`Day ${d.day}: ${d.completedCount}/${d.itemsCount} items (${d.completedPct}%)${d.isCurrent ? ' — TODAY' : d.isPast ? ' — PAST' : ' — FUTURE'}${d.items.length > 0 ? '. Click to see items.' : ''}`}
                          style={{
                            width: 36, height: 36, cursor: d.items?.length > 0 ? 'pointer' : 'default',
                            border: isSelected ? `3px solid var(--accent)` : d.isCurrent ? `3px solid ${B}` : `2px solid ${B}`,
                            background: bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 900,
                            color: d.isFuture ? TXT3 : '#000',
                            transition: 'transform 0.12s, box-shadow 0.12s',
                            outline: isSelected ? `3px solid var(--accent)` : 'none',
                            outlineOffset: 2,
                            boxShadow: isSelected ? SH(4) : 'none'
                          }}
                          onMouseEnter={e => { if (d.items?.length > 0) { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = SH(4); }}}
                          onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } else { e.currentTarget.style.transform = 'none'; }}}>
                          {d.day}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{
                    display: 'flex', gap: 16, fontSize: '0.72rem', color: TXT2,
                    flexWrap: 'wrap', marginBottom: 18,
                    padding: '8px 12px', border: `2px solid ${B}`, background: TERT
                  }}>
                    <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--success)', marginRight: 5, border: `2px solid ${B}` }} /> All completed</span>
                    <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--warning)', marginRight: 5, border: `2px solid ${B}` }} /> Partially done</span>
                    <span><span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--error)', marginRight: 5, border: `2px solid ${B}` }} /> Not started</span>
                    <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a8a29e', marginRight: 5, border: `2px solid ${B}` }} /> Rest day</span>
                    <span><span style={{ display: 'inline-block', width: 12, height: 12, background: TERT, marginRight: 5, border: `2px solid ${B}` }} /> Future day</span>
                  </div>

                  {/* ═══ DAY DRILLDOWN ═══ */}
                  {planSelectedDay && planSelectedDay.items?.length > 0 && (
                    <div style={{
                      border: `3px solid var(--accent)`, padding: 20,
                      background: TERT, boxShadow: SH(6), marginBottom: 16
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16
                      }}>
                        <h4 style={{
                          fontSize: '0.95rem', fontWeight: 900, margin: 0,
                          display: 'flex', alignItems: 'center', gap: 10, color: TXT
                        }}>
                          <Calendar size={20} /> DAY {planSelectedDay.day} — TASKS
                          <span style={{
                            fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '4px 12px', border: `3px solid ${B}`,
                            background: planSelectedDay.isFuture ? TERT : planSelectedDay.isCurrent ? 'var(--accent-light)' : 'var(--success-bg)',
                            color: planSelectedDay.isFuture ? TXT3 : planSelectedDay.isCurrent ? 'var(--accent)' : 'var(--success-text)',
                            marginLeft: 6
                          }}>
                            {planSelectedDay.isFuture ? 'FUTURE' : planSelectedDay.isCurrent ? 'TODAY' : 'PAST'}
                          </span>
                        </h4>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: TXT }}>
                          {planSelectedDay.completedCount}/{planSelectedDay.itemsCount} DONE
                          <span style={{
                            marginLeft: 10,
                            color: planSelectedDay.completedPct >= 80 ? 'var(--success)' :
                                   planSelectedDay.completedPct >= 50 ? 'var(--warning)' : 'var(--error)',
                            fontWeight: 900
                          }}>
                            ({planSelectedDay.completedPct}%)
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {planSelectedDay.items.map((item, idx) => {
                          const badge = SUBJECT_BADGE[item.subject] || { bg: TERT, text: TXT };
                          return (
                            <div key={idx} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 14,
                              padding: '14px 18px',
                              border: `3px solid ${item.completed ? 'var(--success)' : B}`,
                              background: item.completed ? 'var(--success-bg)' : SURF,
                              boxShadow: item.completed ? SH(4) : SH(4)
                            }}>
                              <div style={{
                                flexShrink: 0, marginTop: 4,
                                width: 28, height: 28,
                                border: `3px solid ${item.completed ? 'var(--success)' : B}`,
                                background: item.completed ? 'var(--success)' : SURF,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {item.completed
                                  ? <CheckCircle size={16} color="#000" />
                                  : <ListTodo size={16} style={{ color: TXT }} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  flexWrap: 'wrap', marginBottom: 4
                                }}>
                                  <span style={{
                                    fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                                    padding: '3px 10px', border: `3px solid ${B}`,
                                    background: badge.bg, color: badge.text
                                  }}>
                                    {item.subject?.toUpperCase()}
                                  </span>
                                  <span style={{
                                    fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                                    padding: '3px 8px', border: `3px solid ${B}`, background: SURF, color: TXT
                                  }}>
                                    {TARGET_LABELS[item.targetType] || item.targetType}
                                  </span>
                                  {item.completed ? (
                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '3px 8px', border: `3px solid var(--success)`, background: 'var(--success-bg)', color: 'var(--success-text)' }}>DONE</span>
                                  ) : (
                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '3px 8px', border: `3px solid var(--error)`, background: 'var(--error-bg)', color: 'var(--error-text)' }}>PENDING</span>
                                  )}
                                </div>
                                <div style={{
                                  fontWeight: 800, fontSize: '0.9rem',
                                  color: TXT, marginBottom: 2
                                }}>
                                  {item.targetTitle}
                                </div>
                                {renderHierarchy(item)}
                                {item.instruction && (
                                  <div style={{
                                    fontSize: '0.85rem', marginTop: 10,
                                    padding: '10px 14px', border: `3px solid ${B}`,
                                    background: 'var(--accent-light)', color: TXT,
                                    lineHeight: 1.6
                                  }}>
                                    <span style={{
                                      fontWeight: 800, display: 'block', marginBottom: 3,
                                      textTransform: 'uppercase', fontSize: '0.55rem',
                                      color: TXT2
                                    }}>INSTRUCTION:</span>
                                    {item.instruction}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Behind alert */}
                  {behindCount > 0 && (
                    <div style={{
                      fontSize: '0.85rem', padding: '12px 18px',
                      border: `3px solid var(--error)`,
                      background: 'var(--error-bg)',
                      boxShadow: SH(4), display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 4, color: 'var(--error-text)'
                    }}>
                      <AlertCircle size={20} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 700 }}>
                        {behindCount} item{behindCount !== 1 ? 's' : ''} pending from past days.{' '}
                        {planSelectedDay
                          ? 'Keep working through your tasks above.'
                          : 'Click a highlighted day above to see what needs attention.'}
                      </span>
                    </div>
                  )}
                </>
              ) : pp.itemsBehind && pp.itemsBehind.length > 0 ? (
                <div style={{
                  fontSize: '0.85rem', padding: '12px 18px',
                  border: `3px solid var(--error)`,
                  background: 'var(--error-bg)',
                  boxShadow: SH(4), display: 'flex', alignItems: 'center', gap: 10,
                  color: 'var(--error-text)'
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 700 }}>
                    <strong>{pp.itemsBehind.length}</strong> item(s) behind schedule. Complete these to catch up!
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: TXT3, fontStyle: 'italic' }}>
                  Loading day breakdown data...
                </p>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 3 — FEEDBACK BANNER                    */}
          {/* ─────────────────────────────────────────────── */}
          {overallPct > 0 && (
            <div style={{
              border: `3px solid var(--success)`,
              boxShadow: SH(6), padding: '18px 24px', marginBottom: 36,
              background: 'var(--success-bg)',
              display: 'flex', alignItems: 'center', gap: 16,
              position: 'relative'
            }}>
              <div style={{
                width: 48, height: 48,
                border: `3px solid var(--success)`,
                boxShadow: SH(3),
                background: SURF,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <FeedbackIcon size={24} style={{ color: 'var(--success)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: '0.95rem', margin: 0, color: 'var(--success-text)' }}>
                  {feedback.message}
                </p>
                <p style={{ fontSize: '0.85rem', color: TXT2, marginTop: 4, lineHeight: 1.55 }}>
                  {feedback.detail}
                </p>
                <div style={{
                  fontSize: '0.75rem', color: TXT2, marginTop: 8,
                  display: 'flex', gap: 16, flexWrap: 'wrap'
                }}>
                  <span><strong>{overallPct}%</strong> complete across {totalItems} items</span>
                  <span>{allQuizzes} quiz{allQuizzes !== 1 ? 'zes' : ''} attempted</span>
                  {avgQuizScore !== null && <span>Avg score: <strong>{avgQuizScore}%</strong></span>}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 4 — PLAN ITEM BREAKDOWN                */}
          {/* ─────────────────────────────────────────────── */}
          {planAgg && (
            <div style={{ ...card(), marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 36, height: 36,
                  border: `3px solid ${B}`, boxShadow: SH(3),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: TERT
                }}>
                  <Layers3 size={18} style={{ color: TXT }} />
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', color: TXT }}>
                  Plan Item Breakdown
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: TXT2, marginBottom: 18, lineHeight: 1.6, paddingLeft: 0 }}>
                A detailed snapshot of what your plan contains and how much of each item type and subject you have completed so far. Use this to spot where you need to focus.
              </p>

              {/* Type breakdown */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10, marginBottom: 20
              }}>
                {[
                  {
                    icon: Hash, label: 'Total Items',
                    value: Object.values(planAgg.t).reduce((a, b) => a + b, 0),
                    desc: 'All lessons, subtopics, and problems combined in this plan.',
                    color: TXT
                  },
                  {
                    icon: BookOpen, label: 'Lessons',
                    value: `${planAgg.d.lesson} / ${planAgg.t.lesson}`,
                    desc: planAgg.t.lesson > 0
                      ? `Theoretical content. ${planAgg.d.lesson === planAgg.t.lesson ? 'All completed — great!' : `${planAgg.t.lesson - planAgg.d.lesson} remaining.`}`
                      : 'No lessons in this plan.',
                    color: planAgg.d.lesson === planAgg.t.lesson && planAgg.t.lesson > 0 ? 'var(--success)' : TXT
                  },
                  {
                    icon: FolderOpen, label: 'Subtopics',
                    value: `${planAgg.d.subtopic} / ${planAgg.t.subtopic}`,
                    desc: planAgg.t.subtopic > 0
                      ? `Topics to master. ${planAgg.d.subtopic === planAgg.t.subtopic ? 'All covered!' : `${planAgg.t.subtopic - planAgg.d.subtopic} remaining.`}`
                      : 'No subtopics in this plan.',
                    color: planAgg.d.subtopic === planAgg.t.subtopic && planAgg.t.subtopic > 0 ? 'var(--success)' : TXT
                  },
                  {
                    icon: BookMarked, label: 'Problems',
                    value: `${planAgg.d.problem} / ${planAgg.t.problem}`,
                    desc: planAgg.t.problem > 0
                      ? `Practice problems to solve. ${planAgg.d.problem === planAgg.t.problem ? 'All solved — well done!' : `${planAgg.t.problem - planAgg.d.problem} remaining.`}`
                      : 'No problems in this plan.',
                    color: planAgg.d.problem === planAgg.t.problem && planAgg.t.problem > 0 ? 'var(--success)' : TXT
                  },
                  {
                    icon: Layers, label: 'Subjects',
                    value: Object.keys(planAgg.sa).length,
                    desc: 'Unique subjects covered in this plan\'s curriculum.',
                    color: TXT
                  },
                  {
                    icon: Timer, label: 'Days Elapsed',
                    value: planAgg.activeDays,
                    desc: 'Plan days that have already passed.',
                    color: TXT
                  },
                  {
                    icon: Calendar, label: 'Days Remaining',
                    value: userPlanBreakdown.days.filter(d => d.isFuture).length,
                    desc: 'Days left before the plan ends.',
                    color: TXT
                  },
                  {
                    icon: FlagTriangleRight, label: 'Items Behind',
                    value: behindCount,
                    desc: 'Unfinished items from past days — tackle these first before new content.',
                    color: behindCount > 0 ? 'var(--error)' : 'var(--success)'
                  },
                ].map((s, i) => {
                  const SI = s.icon;
                  return (
                    <div key={i} style={tinyCard()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <SI size={12} style={{ color: TXT2 }} />
                        <div style={labelSm}>{s.label}</div>
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
                      <div style={{ fontSize: '0.68rem', color: TXT2, marginTop: 3, lineHeight: 1.45 }}>{s.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Subject sub-breakdown */}
              {Object.keys(planAgg.sa).length > 0 && (
                <div style={{
                  borderTop: `2px solid ${B}`, paddingTop: 16, marginTop: 4
                }}>
                  <h4 style={{
                    fontSize: '0.75rem', fontWeight: 800, marginBottom: 10,
                    textTransform: 'uppercase', color: TXT2
                  }}>
                    Per-Subject Breakdown
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(planAgg.sa).map(([sub, d]) => {
                      const pct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
                      return (
                        <div key={sub} style={{
                          padding: '6px 14px', border: `3px solid ${B}`, background: TERT,
                          display: 'flex', alignItems: 'center', gap: 10
                        }}>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                            color: SUBJECT_COLORS[sub] || TXT
                          }}>
                            {SUBJECT_NAMES[sub] || sub}
                          </span>
                          <div style={{
                            height: 8, width: 60, background: SURF, border: `2px solid ${B}`, overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: SUBJECT_COLORS[sub] || 'var(--accent)',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: TXT2 }}>
                            {d.done}/{d.total} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 5 — PLAN CHARTS                        */}
          {/* ─────────────────────────────────────────────── */}
          {userPlanBreakdown && (() => {
            const { typeData, subjData, trend } = chartData;
            return (
              <div style={{ ...card(), marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 36, height: 36,
                    border: `3px solid ${B}`, boxShadow: SH(3),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: TERT
                  }}>
                    <BarChart3 size={18} style={{ color: TXT }} />
                  </div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', color: TXT }}>
                    Plan Visuals
                  </h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: TXT2, marginBottom: 18, lineHeight: 1.6 }}>
                  Visual breakdown of your plan progress — what you have completed by item type, by subject, and across each active day.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                  {/* By Item Type */}
                  <div>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, marginBottom: 2, textTransform: 'uppercase', color: TXT }}>
                      <ListTodo size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      By Item Type
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: TXT2, marginBottom: 10 }}>
                      How many lessons, subtopics, and problems you have completed so far.
                    </p>
                    {typeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={typeData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={B} />
                          <XAxis dataKey="type" tick={{ fontSize: 12, fontWeight: 700, fill: TXT }} />
                          <YAxis tick={{ fontSize: 11, fill: TXT2 }} allowDecimals={false} />
                          <RechartTooltip content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0]?.payload;
                            return <div style={tooltipStyle}><p style={{ fontWeight: 700, marginBottom: 2, color: TXT }}>{d.type}</p><p style={{ color: TXT2 }}>{d.done} of {d.total} done</p></div>;
                          }} />
                          <Bar dataKey="done" name="Done" fill="var(--success)">
                            <LabelList dataKey="done" position="top" fontSize={11} fontWeight={700} fill={TXT} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ border: `2px dashed ${B}`, padding: 16, textAlign: 'center', fontSize: '0.85rem', color: TXT3 }}>No item data to display.</div>
                    )}
                  </div>

                  {/* By Subject */}
                  <div>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, marginBottom: 2, textTransform: 'uppercase', color: TXT }}>
                      <Layers size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      By Subject
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: TXT2, marginBottom: 10 }}>
                      Total items vs completed items per subject in this plan.
                    </p>
                    {subjData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={subjData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={B} />
                          <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700, fill: TXT }} />
                          <YAxis tick={{ fontSize: 11, fill: TXT2 }} allowDecimals={false} />
                          <RechartTooltip content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0]?.payload;
                            return <div style={tooltipStyle}><p style={{ fontWeight: 700, marginBottom: 2, color: TXT }}>{d.subject}</p><p style={{ color: TXT2 }}>{d.done} of {d.total} items</p></div>;
                          }} />
                          <Bar dataKey="total" name="Total" fill={TERT} />
                          <Bar dataKey="done" name="Done" fill="var(--success)">
                            <LabelList dataKey="done" position="top" fontSize={11} fontWeight={700} fill={TXT} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ border: `2px dashed ${B}`, padding: 16, textAlign: 'center', fontSize: '0.85rem', color: TXT3 }}>No subject data to display.</div>
                    )}
                  </div>

                  {/* Daily Trend */}
                  <div>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, marginBottom: 2, textTransform: 'uppercase', color: TXT }}>
                      <Activity size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      Daily Trend
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: TXT2, marginBottom: 10 }}>
                      Items completed on each active plan day — spot your productive days.
                    </p>
                    {trend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trend} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={B} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: TXT }} interval={0} angle={-45} textAnchor="end" height={50} />
                          <YAxis tick={{ fontSize: 11, fill: TXT2 }} allowDecimals={false} />
                          <RechartTooltip content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0]?.payload;
                            return <div style={tooltipStyle}><p style={{ fontWeight: 700, marginBottom: 2, color: TXT }}>{d.day}</p><p style={{ color: TXT2 }}>{d.done} of {d.total} items</p></div>;
                          }} />
                          <Bar dataKey="done" name="Completed" fill="var(--success)">
                            <LabelList dataKey="done" position="top" fontSize={10} fontWeight={700} fill={TXT} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ border: `2px dashed ${B}`, padding: 16, textAlign: 'center', fontSize: '0.85rem', color: TXT3 }}>No daily trend data available yet.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 6 — PLAN ANALYSIS                      */}
          {/* ─────────────────────────────────────────────── */}
          {planAgg && (() => {
            const stmts = [];
            if (planAgg.t.lesson > 0) {
              const p = Math.round((planAgg.d.lesson / planAgg.t.lesson) * 100);
              stmts.push({
                icon: BookOpen, iconColor: SUBJECT_COLORS.dsa,
                text: `Lessons: ${planAgg.d.lesson}/${planAgg.t.lesson} completed (${p}%)`,
                desc: p >= 70 ? 'Strong lesson completion. You are building a solid theoretical foundation.' :
                       p >= 50 ? 'Halfway through the lessons. Keep reading and taking notes.' :
                       'Work through remaining lessons to build your foundation.',
                color: p >= 70 ? 'var(--success)' : p >= 50 ? 'var(--warning)' : 'var(--error)'
              });
            }
            if (planAgg.t.subtopic > 0) {
              const p = Math.round((planAgg.d.subtopic / planAgg.t.subtopic) * 100);
              stmts.push({
                icon: FolderOpen, iconColor: SUBJECT_COLORS.dbms,
                text: `Subtopics: ${planAgg.d.subtopic}/${planAgg.t.subtopic} covered (${p}%)`,
                desc: p >= 70 ? 'Most subtopics covered. You have strong topic-level understanding.' :
                       p >= 50 ? 'Half of the subtopics done. Keep grinding through each one.' :
                       'Several subtopics remain. Focus on completing them systematically.',
                color: p >= 70 ? 'var(--success)' : p >= 50 ? 'var(--warning)' : 'var(--error)'
              });
            }
            if (planAgg.t.problem > 0) {
              const p = Math.round((planAgg.d.problem / planAgg.t.problem) * 100);
              stmts.push({
                icon: BookMarked, iconColor: SUBJECT_COLORS.os,
                text: `Problems: ${planAgg.d.problem}/${planAgg.t.problem} solved (${p}%)`,
                desc: p >= 70 ? 'Great problem-solving momentum! You are applying concepts effectively.' :
                       p >= 50 ? 'Good number of problems solved. Keep practising to strengthen your skills.' :
                       'More practice needed. Problems are where concepts truly sink in.',
                color: p >= 70 ? 'var(--success)' : p >= 50 ? 'var(--warning)' : 'var(--error)'
              });
            }
            for (const [sub, d] of Object.entries(planAgg.sa)) {
              if (d.total === 0) continue;
              const p = Math.round((d.done / d.total) * 100);
              const Icon = sub === 'dsa' ? Cpu : sub === 'dbms' ? Database : sub === 'programming' ? Brain : BookOpen;
              stmts.push({
                icon: Icon, iconColor: SUBJECT_COLORS[sub] || TXT,
                text: `${SUBJECT_NAMES_FULL[sub] || sub}: ${d.done}/${d.total} plan items (${p}%)`,
                desc: `Your completion within ${SUBJECT_NAMES_FULL[sub] || sub} for this plan.${p >= 70 ? ' Strong performance.' : p >= 50 ? ' Steady progress.' : ' More focus needed.'}`,
                color: SUBJECT_COLORS[sub] || TXT
              });
            }
            if (planAgg.activeDays > 0) {
              stmts.push({
                icon: Calendar, iconColor: 'var(--accent)',
                text: `Fully completed ${planAgg.fullDays} of ${planAgg.activeDays} active days.`,
                desc: planAgg.fullDays === planAgg.activeDays
                  ? 'Perfect attendance — you completed every single active day fully!'
                  : planAgg.fullDays >= planAgg.activeDays / 2
                    ? 'More than half your days were fully completed. Build towards full consistency.'
                    : 'Focus on completing full days rather than partial progress.',
                color: planAgg.fullDays === planAgg.activeDays ? 'var(--success)' :
                       planAgg.fullDays >= planAgg.activeDays / 2 ? 'var(--warning)' : 'var(--error)'
              });
            }
            return stmts.length > 0 ? (
              <div style={{ ...card(), marginBottom: 36, borderTop: `8px solid var(--accent)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 36, height: 36,
                    border: `3px solid ${B}`, boxShadow: SH(3),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: TERT
                  }}>
                    <Lightbulb size={18} style={{ color: TXT }} />
                  </div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', color: TXT }}>
                    Plan Analysis
                  </h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: TXT2, marginBottom: 18, lineHeight: 1.6 }}>
                  A detailed snapshot of how you are performing across every area of your plan. Each statement highlights your completion rate and what needs attention.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stmts.map((stmt, i) => {
                    const StmtIcon = stmt.icon;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '14px 18px', border: `3px solid ${B}`,
                        background: TERT, boxShadow: SH(4)
                      }}>
                        <div style={{
                          flexShrink: 0, width: 36, height: 36,
                          border: `3px solid ${B}`, background: SURF,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: SH(2)
                        }}>
                          <StmtIcon size={18} style={{ color: stmt.iconColor || TXT }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: stmt.color }}>
                            {stmt.text}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: TXT2, margin: '4px 0 0', lineHeight: 1.55 }}>
                            {stmt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null;
          })()}

          {/* ─────────────────────────────────────────────── */}
          {/*  SECTION 7 — PERSONAL NOTES                     */}
          {/* ─────────────────────────────────────────────── */}
          <div style={{ ...card(), marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36, height: 36,
                border: `3px solid ${B}`, boxShadow: SH(3),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: TERT
              }}>
                <PencilLine size={18} style={{ color: TXT }} />
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', color: TXT }}>
                Personal Notes
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: TXT2, marginBottom: 12, lineHeight: 1.6 }}>
              Use this space to jot down observations, doubts, or focus areas for your current plan. What concepts need revisiting? Which topics feel unclear?
            </p>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Need to revise Day 3 topics — the two-pointer technique was tricky. Also want to revisit Day 5 DBMS normalization examples."
              rows={4}
              style={{
                width: '100%', border: `3px solid ${B}`,
                padding: '12px 14px', fontSize: '0.85rem',
                background: TERT, color: TXT,
                resize: 'vertical', fontFamily: 'inherit',
                outline: 'none', lineHeight: 1.6
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 4
            }}>
              <span style={{ fontSize: '0.72rem', color: TXT3, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> Notes are temporary and will be lost on page refresh.
              </span>
              {remarks && (
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '4px 12px', border: `3px solid ${B}`, background: TERT, color: TXT2
                }}>
                  {remarks.length} characters
                </span>
              )}
            </div>
          </div>

          {/* ═══ FOOTER ═══ */}
          {user?.username && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Link to={`/users/${user.username}`}
                style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  padding: '12px 32px', border: `3px solid ${B}`,
                  boxShadow: SH(4),
                  background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                  textDecoration: 'none', display: 'inline-flex',
                  alignItems: 'center', gap: 8,
                  transition: 'transform 0.12s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = SH(6); }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SH(4); }}>
                <Users size={18} /> BACK TO MY PROFILE
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
