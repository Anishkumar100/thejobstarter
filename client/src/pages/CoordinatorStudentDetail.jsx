import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ArrowLeft, ExternalLink, Save, Trash2, TrendingUp, User, BookOpen, Database, Cpu, Target, Award, BarChart3, Brain, GraduationCap, Mail, Calendar, Edit3, ClipboardList, Layers, Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';

const SUBJECT_COLORS = { dsa: '#6366f1', dbms: '#14b8a6', os: '#f59e0b', programming: '#a855f7' };
const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };
const TOOLTIP = { background: 'var(--bg-surface)', border: '3px solid #000', padding: '8px 12px', fontSize: '0.78rem', boxShadow: '4px 4px 0 #000' };

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

  /* Fetch plan day-by-day breakdown */
  useEffect(() => {
    if (!student?.progress?.planProgress?.planId || !student?.batch?._id) return;
    const pp = student.progress.planProgress;
    setBreakdownLoading(true);
    apiRequest(`/plans/${pp.planId}/day-progress/${student.batch._id}/${userId}`)
      .then(res => setPlanBreakdown(res.data))
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
    if (score >= 90) return { label: 'Excellent', color: 'var(--success)' };
    if (score >= 70) return { label: 'Good', color: 'var(--success)' };
    if (score >= 50) return { label: 'Average', color: 'var(--warning)' };
    return { label: 'Needs Work', color: 'var(--error)' };
  };

  /*
   * Generate detailed progress analysis statements based on actual data.
   * Uses lessons, subtopics, problems, and quiz scores to give meaningful feedback.
   */
  const generateProgressStatements = () => {
    const statements = [];

    /* Aggregate across all subjects */
    let totalLessons = 0, doneLessons = 0;
    let totalSubtopics = 0, doneSubtopics = 0;
    let totalProblems = 0, doneProblems = 0;

    for (const sub of subjects) {
      const s = progress[sub];
      if (!s) continue;
      totalLessons += s.lessons?.total || 0;
      doneLessons += s.lessons?.completed || 0;
      totalSubtopics += s.subtopics?.total || 0;
      doneSubtopics += s.subtopics?.completed || 0;
      totalProblems += s.problems?.total || 0;
      doneProblems += s.problems?.completed || 0;
    }

    /* Lesson statement */
    if (totalLessons > 0) {
      const pct = Math.round((doneLessons / totalLessons) * 100);
      let note = '';
      if (pct >= 90) note = 'Excellent progress on lessons.';
      else if (pct >= 70) note = 'Strong lesson completion rate.';
      else if (pct >= 50) note = 'Halfway through the lessons.';
      else if (pct >= 25) note = 'Making headway on the lessons.';
      else note = 'Getting started with the lessons.';
      statements.push({ icon: BookOpen, text: `Completed ${doneLessons} of ${totalLessons} lessons across DSA, DBMS, and OS. ${note}`, color: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)' });
    }

    /* Subtopic statement */
    if (totalSubtopics > 0) {
      const pct = Math.round((doneSubtopics / totalSubtopics) * 100);
      let note = '';
      if (pct >= 90) note = 'Nearly all topics covered.';
      else if (pct >= 70) note = 'Most topics have been studied.';
      else if (pct >= 50) note = 'Half of the topics are done.';
      else if (pct >= 25) note = 'Several topics completed.';
      else note = 'Still early in the topic coverage.';
      statements.push({ icon: ClipboardList, text: `Studied ${doneSubtopics} of ${totalSubtopics} subtopics. ${note}`, color: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)' });
    }

    /* Problem statement */
    if (totalProblems > 0) {
      const pct = Math.round((doneProblems / totalProblems) * 100);
      let note = '';
      if (pct >= 90) note = 'Outstanding problem-solving practice.';
      else if (pct >= 70) note = 'Strong practice with problems.';
      else if (pct >= 50) note = 'Good amount of problems solved.';
      else if (pct >= 25) note = 'Some problems attempted.';
      else note = 'Needs more problem-solving practice.';
      statements.push({ icon: Database, text: `Solved ${doneProblems} of ${totalProblems} problems. ${note}`, color: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)' });
    }

    /* Quiz statement */
    if (allQuizzes > 0 && avgQuizScore !== null) {
      let note = '';
      if (avgQuizScore >= 90) note = 'Mastery level understanding.';
      else if (avgQuizScore >= 70) note = 'Good conceptual clarity.';
      else if (avgQuizScore >= 50) note = 'Average quiz performance — room for improvement.';
      else note = 'Quiz scores indicate concepts need revisiting.';
      statements.push({ icon: Target, text: `Attempted ${allQuizzes} quiz${allQuizzes !== 1 ? 'zes' : ''} with a combined average of ${avgQuizScore}%. ${note}`, color: avgQuizScore >= 70 ? 'var(--success)' : avgQuizScore >= 50 ? 'var(--warning)' : 'var(--error)' });
    }

    /* Per-subject breakdown */
    for (const sub of subjects) {
      const s = progress[sub];
      if (!s) continue;
      const q = s.quizzes;
      const subTotal = (s.lessons?.total || 0) + (s.subtopics?.total || 0) + (s.problems?.total || 0);
      const subDone = (s.lessons?.completed || 0) + (s.subtopics?.completed || 0) + (s.problems?.completed || 0);
      if (subTotal === 0) continue;
      const subPct = Math.round((subDone / subTotal) * 100);
      const SubIcon = sub === 'dsa' ? Cpu : sub === 'dbms' ? Database : BookOpen;
      let status = '';
      if (subPct >= 90) status = 'Strong performance.';
      else if (subPct >= 70) status = 'Good progress.';
      else if (subPct >= 50) status = 'Making steady progress.';
      else if (subPct >= 25) status = 'Building foundation.';
      else status = 'Just getting started.';
      const quizNote = q?.quizzesTaken > 0 ? ` | Quiz avg: ${q.avgScore}%` : ' | No quizzes yet';
      statements.push({
        icon: SubIcon,
        text: `${subjectNames[sub]}: ${subPct}% complete (${subDone}/${subTotal} items). ${status}${quizNote}`,
        color: SUBJECT_COLORS[sub]
      });
    }

    return statements;
  };

  const getFeedback = (pct, quizAvg) => {
    if (pct === 0) return { icon: GraduationCap, message: 'Every expert was once a beginner. Start your journey today!' };
    if (pct >= 90) return { icon: Award, message: quizAvg >= 70 ? 'Outstanding performance! You are on track to mastery.' : 'Great progress on content. Focus on quizzes to solidify understanding.' };
    if (pct >= 70) return { icon: TrendingUp, message: quizAvg >= 70 ? 'Strong progress and quiz scores. Keep the momentum!' : 'Good progress. Try revisiting topics where quiz scores dipped.' };
    if (pct >= 50) return { icon: Target, message: quizAvg >= 50 ? 'Halfway there with solid quiz scores. Push through!' : 'Crossed the halfway mark. Revisit earlier topics to boost quiz scores.' };
    if (pct >= 30) return { icon: BarChart3, message: 'Making good progress. Consistent effort will get you there.' };
    return { icon: BookOpen, message: 'Every step counts. Start with one lesson today.' };
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading student..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: 'var(--error-bg)' }}><strong>Error:</strong> {error}</div></div>;
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
      <div style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <Link to="/coordinator" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Student Detail</span>
      </div>

      {/* ═══ PROFILE HEADER ═══ */}
      <div style={{ ...CARD, padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, minWidth: 250 }}>
          {student.avatar ? (
            <img src={student.avatar} alt="" style={{ width: 64, height: 64, border: '3px solid #000', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 64, height: 64, border: '3px solid #000', background: 'var(--bg-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={28} />
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
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {[
            { icon: BarChart3, label: 'Overall Progress', value: `${overallPct}%`, color: overallPct >= 50 ? 'var(--success)' : 'var(--error)' },
            { icon: Target, label: 'Quiz Average', value: avgQuizScore !== null ? `${avgQuizScore}%` : 'N/A', color: getScoreGrade(avgQuizScore).color },
            { icon: Calendar, label: 'Joined Center', value: student.coachingCenterJoinedAt ? new Date(student.coachingCenterJoinedAt).toLocaleDateString() : 'N/A', color: '#000' },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} style={{ textAlign: 'center', padding: '8px 16px', border: '2px solid #000', background: 'var(--bg-tertiary)', minWidth: 80 }}>
                <StatIcon size={14} style={{ marginBottom: 2 }} />
                <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ FEEDBACK BANNER ═══ */}
      {overallPct > 0 && (
        <div style={{ padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-lg)', border: '3px solid #000', background: 'var(--success-bg)', boxShadow: '4px 4px 0 #000', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FeedbackIcon size={24} style={{ flexShrink: 0, color: 'var(--success)' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{feedback.message}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              <strong>{overallPct}%</strong> complete across {totalItems} items &middot; {allQuizzes} quiz{allQuizzes !== 1 ? 'zes' : ''} attempted
            </p>
          </div>
        </div>
      )}

      {/* ═══ DETAILED PROGRESS ANALYSIS ═══ */}
      {totalItems > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} /> Progress Analysis
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
                  <div style={{
                    flexShrink: 0, width: 28, height: 28,
                    border: '2px solid #000',
                    background: 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
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
          <button className="btn btn--sm" onClick={() => { setEditing(!editing); setSaveSuccess(false); }}>
            {editing ? 'Cancel' : <><Edit3 size={12} style={{ marginRight: 4 }} /> Edit</>}
          </button>
        </div>

        {saveSuccess && (
          <div style={{ padding: '6px 12px', background: 'var(--success-bg)', border: '2px solid var(--success)', marginBottom: 'var(--space-sm)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <button className="btn btn--primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 'var(--space-sm)' }}>
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
            <p><strong>Batch:</strong> {student.batch.name || '—'}</p>
            {student.batch.code && (
              <p>
                <strong>Code:</strong>{' '}
                <code style={{ background: 'var(--gray-100)', padding: '2px 6px', border: '2px solid var(--black)', fontFamily: 'monospace' }}>
                  {student.batch.code}
                </code>
              </p>
            )}
            {student.batch.status && (
              <p>
                <strong>Status:</strong>{' '}
                <span style={{
                  padding: '2px 6px', border: '2px solid var(--black)',
                  background: student.batch.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {student.batch.status}
                </span>
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            This student is not assigned to any batch.
          </p>
        )}
      </div>

      {/* ═══ PLAN PROGRESS — Day-by-day breakdown ═══ */}
      {student?.progress?.planProgress && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid var(--accent)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> Plan Progress: {student.progress.planProgress.planName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            <span style={{
              fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
              padding: '2px 8px', border: '2px solid #000',
              color: student.progress.planProgress.paceStatus === 'behind' ? '#dc2626'
                : student.progress.planProgress.paceStatus === 'ahead' ? '#16a34a'
                : student.progress.planProgress.paceStatus === 'on-track' ? '#2563eb'
                : 'var(--text-tertiary)'
            }}>
              {student.progress.planProgress.paceStatus === 'just-started' ? 'Started' : student.progress.planProgress.paceStatus}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} />
              Day {student.progress.planProgress.currentDayOffset}/{student.progress.planProgress.durationDays}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              {student.progress.planProgress.completedCount}/{student.progress.planProgress.expectedCount} items done
            </span>
          </div>
          {/* Progress bar */}
          {student.progress.planProgress.durationDays > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', border: '2px solid #000', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round((student.progress.planProgress.currentDayOffset / student.progress.planProgress.durationDays) * 100))}%`,
                  background: student.progress.planProgress.paceStatus === 'behind' ? '#dc2626' : 'var(--success)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                {Math.round((student.progress.planProgress.currentDayOffset / student.progress.planProgress.durationDays) * 100)}%
              </span>
            </div>
          )}

          {/* Day-by-day breakdown */}
          {breakdownLoading ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Loading day breakdown...</p>
          ) : planBreakdown?.days ? (
            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>Day-by-Day Completion</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
                {planBreakdown.days.map(d => (
                  <div key={d.day} title={`Day ${d.day}: ${d.completedCount}/${d.itemsCount} items${d.isCurrent ? ' (Current)' : d.isPast ? ' (Past)' : ' (Future)'}`}
                    style={{
                      width: 24, height: 24,
                      border: d.isCurrent ? '3px solid #000' : '2px solid var(--gray-300)',
                      background: d.isFuture ? 'var(--bg-tertiary)'
                        : d.itemsCount === 0 ? '#f0f0f0'
                        : d.completedCount === d.itemsCount ? '#16a34a'
                        : d.completedCount > 0 ? '#facc15'
                        : '#fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.55rem', fontWeight: 700,
                      color: d.isFuture ? 'var(--text-tertiary)' : '#000'
                    }}>
                    {d.day}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.65rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#16a34a', marginRight: 3, border: '1px solid #000' }} /> Complete</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#facc15', marginRight: 3, border: '1px solid #000' }} /> Partial</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fee2e2', marginRight: 3, border: '1px solid #000' }} /> Behind</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f0f0f0', marginRight: 3, border: '1px solid var(--gray-300)' }} /> No items</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--bg-tertiary)', marginRight: 3, border: '1px solid var(--gray-300)' }} /> Future</span>
              </div>
            </div>
          ) : student.progress.planProgress.itemsBehind && student.progress.planProgress.itemsBehind.length > 0 ? (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>
                {student.progress.planProgress.itemsBehind.length} item(s) behind schedule:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 150, overflowY: 'auto' }}>
                {student.progress.planProgress.itemsBehind.slice(0, 8).map((item, i) => (
                  <div key={i} style={{ fontSize: '0.72rem', padding: '2px 6px', border: '1px solid var(--gray-300)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={10} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{item.targetTitle || item.targetType}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>(Day {item.dayOffset})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

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

      {/* ═══ PROGRESS ═══ */}
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
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', color: pct >= 50 ? 'var(--success)' : 'var(--error)' }}>{pct}%</span>
                </div>
                <div style={{ height: 12, background: 'var(--bg-tertiary)', border: '2px solid #000', marginBottom: 8 }}>
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
            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
              Percentage of items completed per subject for this student.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 600 }} label={{ value: 'Subject', position: 'insideBottom', offset: -3, style: { fontSize: 11 } }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" label={{ value: 'Completion %', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <RechartTooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return <div style={TOOLTIP}><p style={{ fontWeight: 700, marginBottom: 2 }}>{d.subject}</p><p>{d.completed} of {d.total} items ({d.pct}%)</p></div>;
                }} />
                <Bar dataKey="pct" name="Percentage" radius={[0, 0, 0, 0]}>
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
            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
              Quiz scores per subject for this student. Only subjects with attempted quizzes shown.
            </p>
            {quizChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quizChartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 600 }} label={{ value: 'Subject', position: 'insideBottom', offset: -3, style: { fontSize: 11 } }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" label={{ value: 'Score %', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                  <RechartTooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return <div style={TOOLTIP}><p style={{ fontWeight: 700, marginBottom: 2 }}>{d.subject}</p><p style={{ color: d.fill, fontWeight: 600 }}>Score: {d.score}%</p><p style={{ color: 'var(--text-tertiary)' }}>{d.taken} attempt{d.taken !== 1 ? 's' : ''}</p></div>;
                  }} />
                  <Bar dataKey="score" name="Score" radius={[0, 0, 0, 0]}>
                    {quizChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    <LabelList dataKey="score" position="top" fontSize={11} fontWeight={700} formatter={(v) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', padding: 'var(--space-md)', textAlign: 'center', border: '2px dashed var(--border-color)' }}>
                No quiz data available yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DANGER ZONE ═══ */}
      <div style={{ border: '3px solid #dc2626', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #dc2626' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={16} /> Danger Zone
        </h2>
        <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
          Remove this student from your center. Their account and progress are preserved — they just won't be linked anymore.
        </p>
        <button className="btn btn--danger" onClick={() => setRemoveOpen(true)} disabled={removing} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={14} /> Remove from Center
        </button>
      </div>

      {/* Remove Modal */}
      <Modal isOpen={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove Student">
        <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.88rem' }}>
          Remove <strong>{student.displayName || student.username}</strong> from this center?
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setRemoveOpen(false)}>Cancel</button>
          <button className="btn btn--danger" onClick={handleRemove} disabled={removing}>
            {removing ? 'Removing...' : 'Yes, remove'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
