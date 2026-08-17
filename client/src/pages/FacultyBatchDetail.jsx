import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import { getLocalDateString, getIstNextDayStart } from '../utils/date.js';
import Loader from '../components/ui/Loader.jsx';
import { Layers, Users, ArrowLeft, Edit3, X, Trash2, Copy, Search, BookOpen, Calendar, AlertCircle, CheckCircle, FileText, Clock, Plus, BarChart3, TrendingUp, ExternalLink, Download, Shield } from 'lucide-react';

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: 'var(--shadow)',
};

/*
 * FacultyBatchDetail — Full batch drill-down for a faculty member.
 * Mirrors every feature of the coordinator batch detail page:
 * rich plan metrics, day-by-day progress grid, pace distribution,
 * top/on-track/behind performance sections, assignments CRUD,
 * search/filters, needs attention, enrolled students table and a
 * CSV export that includes full plan details.
 *
 * Faculty has NO management rights over the batch itself — the batch
 * name/code, delete, student assign/remove and promote actions are
 * coordinator-only, so they are intentionally absent here.
 */
export default function FacultyBatchDetail() {
  const { id } = useParams();

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  /* ── Day-by-day batch progress ── */
  const [batchDayProgress, setBatchDayProgress] = useState(null);
  const [loadingDayProgress, setLoadingDayProgress] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  /* ── Plan section ── */
  const [activePlan, setActivePlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState(getLocalDateString());

  /*
   * Fetch batch metadata (already enriched with courseOffering, studentCount
   * and teachers) plus the full student roster of this batch.
   */
  const fetchData = async () => {
    console.log('[FACULTY BATCH DETAIL] Loading batch:', id);
    setLoading(true);
    setError(null);
    try {
      const [batchRes, studentsRes] = await Promise.all([
        apiRequest(`/faculty/batches/${id}`),
        apiRequest(`/faculty/students?batchId=${id}&limit=500`)
      ]);
      console.log('[FACULTY BATCH DETAIL] Batch fetched:', batchRes.data?.name, '- students:', studentsRes.data?.students?.length);
      setBatch(batchRes.data);
      setStudents(studentsRes.data?.students || []);
    } catch (err) {
      console.error('[FACULTY BATCH DETAIL] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  /* Fetch active plan for this batch (faculty-scoped endpoint) */
  const fetchActivePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await apiRequest(`/faculty/batches/${id}/active-plan`);
      setActivePlan(res.data);
    } catch (err) {
      console.error('[FACULTY BATCH DETAIL] Active plan error:', err.message);
      setActivePlan(null);
    }
    setLoadingPlan(false);
  };

  useEffect(() => { if (id) fetchActivePlan(); }, [id]);

  /* Fetch batch-level day progress when active plan is available */
  useEffect(() => {
    const fetchDayProgress = async () => {
      if (!activePlan?.plan?._id || !id) return;
      setLoadingDayProgress(true);
      try {
        const res = await apiRequest(`/faculty/batches/${id}/day-progress/${activePlan.plan._id}`);
        setBatchDayProgress(res.data);
      } catch (err) {
        console.error('[FACULTY BATCH DETAIL] Day progress error:', err.message);
        setBatchDayProgress(null);
      }
      setLoadingDayProgress(false);
    };
    fetchDayProgress();
  }, [activePlan?.plan?._id, id]);

  /* Open plan picker — fetch the faculty's centre plans */
  const openPlanPicker = async () => {
    try {
      const res = await apiRequest('/faculty/plans?status=published');
      setAvailablePlans(res.data || []);
      setSelectedPlanId('');
      setStartDate(getLocalDateString());
      setShowPlanPicker(true);
    } catch (err) {
      alert(err.message || 'Failed to load plans');
    }
  };

  /* Assign a plan to this batch */
  const handleAssignPlan = async () => {
    if (!selectedPlanId || !startDate) {
      alert('Please select a plan and start date');
      return;
    }
    try {
      await apiRequest(`/faculty/batches/${id}/assign-plan`, {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId, startDate })
      });
      setShowPlanPicker(false);
      fetchActivePlan(); /* Re-fetch from active-plan endpoint which includes currentDay */
    } catch (err) {
      alert(err.message || 'Failed to assign plan');
    }
  };

  /* Unassign the current plan */
  const handleUnassignPlan = async () => {
    if (!confirm('Remove the active plan from this batch?')) return;
    try {
      await apiRequest(`/faculty/batches/${id}/unassign-plan`, { method: 'DELETE' });
      setActivePlan(null);
    } catch (err) {
      alert(err.message || 'Failed to unassign plan');
    }
  };

  /* Filter helper — match name, email, and course filter */
  const matchesSearch = (s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (s.displayName || s.username || '').toLowerCase().includes(q)
      || (s.email || '').toLowerCase().includes(q);
  };

  const matchesCourse = (s) => {
    if (!courseFilter) return true;
    const sc = s.courseOffering?._id || s.courseOffering;
    return sc === courseFilter;
  };

  const matchesDate = (s) => {
    if (!dateFilter) return true;
    const raw = s.coachingCenterJoinedAt || s.joinDate;
    if (!raw) return false;
    const joined = new Date(raw);
    if (isNaN(joined.getTime())) return false;
    const now = new Date();
    switch (dateFilter) {
      case 'year': return joined >= new Date(now.getFullYear(), 0, 1);
      case '6months': return joined >= new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case '1month': return joined >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case 'today': return joined >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      default: return true;
    }
  };

  /* The roster endpoint is already scoped to this batch — filter out faculty
     (teachers are not students) and apply the search/course/date filters. */
  const enrolledStudents = students
    .filter(s => !s.isFaculty)
    .filter(s => matchesSearch(s))
    .filter(s => matchesCourse(s))
    .filter(s => matchesDate(s));

  /* ── Plan progress distribution ── */
  const planDistribution = (() => {
    const counts = { ahead: 0, 'on-track': 0, behind: 0, 'just-started': 0, completed: 0, none: 0 };
    for (const s of enrolledStudents) {
      const pp = s.progress?.planProgress;
      if (!pp) { counts.none++; continue; }
      if (pp.status === 'completed') counts.completed++;
      else if (pp.paceStatus) counts[pp.paceStatus] = (counts[pp.paceStatus] || 0) + 1;
      else counts.none++;
    }
    return counts;
  })();

  /* ── Student performance sections pagination ── */
  const PER_PAGE_BATCH = 20;
  const [topPage, setTopPage] = useState(1);
  const [onTrackPage, setOnTrackPage] = useState(1);
  const [behindPage, setBehindPage] = useState(1);
  const [topFilter, setTopFilter] = useState('all');

  /* Enrich enrolled students with computed fields (same as coordinator) */
  const enrichedStudents = useMemo(() => {
    return enrolledStudents.map(s => {
      const prog = s.progress;
      let total = 0, completed = 0;
      for (const sub of ['dsa', 'dbms', 'os', 'programming', 'aptitude']) {
        const so = prog?.[sub]?.overall;
        if (so) { total += so.total; completed += so.completed; }
      }
      const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const pp = prog?.planProgress;
      const planCompletionPct = pp?.expectedCount > 0 ? Math.round((pp.completedCount / pp.expectedCount) * 100) : 0;
      const behindItems = pp?.itemsBehind?.length || 0;
      return { ...s, _ov: overallPct, _pp: planCompletionPct, _bi: behindItems };
    });
  }, [enrolledStudents]);

  /* Derive performance segments */
  const topCandidates = enrichedStudents.filter(s => {
    const sp = s.progress?.planProgress;
    return sp && (sp.paceStatus || sp.status === 'completed') && sp.paceStatus !== 'just-started';
  }).sort((a, b) => b._pp - a._pp);
  const onTrackStudents = enrichedStudents.filter(s => s.progress?.planProgress?.paceStatus === 'on-track');
  const behindStudents = enrichedStudents.filter(s => s.progress?.planProgress?.paceStatus === 'behind');

  /* Top performer filter */
  const filteredTop = useMemo(() => {
    if (topFilter === 'all') return topCandidates;
    const lo = Number(topFilter.split('-')[0]), hi = Number(topFilter.split('-')[1]);
    return topCandidates.filter(s => s._pp >= lo && s._pp <= hi);
  }, [topCandidates, topFilter]);

  const topTotalPages = Math.max(1, Math.ceil(filteredTop.length / PER_PAGE_BATCH));
  const paginatedTop = filteredTop.slice((topPage - 1) * PER_PAGE_BATCH, topPage * PER_PAGE_BATCH);
  const onTrackTotalPages = Math.max(1, Math.ceil(onTrackStudents.length / PER_PAGE_BATCH));
  const paginatedOnTrack = onTrackStudents.slice((onTrackPage - 1) * PER_PAGE_BATCH, onTrackPage * PER_PAGE_BATCH);
  const behindTotalPages = Math.max(1, Math.ceil(behindStudents.length / PER_PAGE_BATCH));
  const paginatedBehind = behindStudents.slice((behindPage - 1) * PER_PAGE_BATCH, behindPage * PER_PAGE_BATCH);

  /* ── Assignments section (full CRUD + grading via faculty endpoints) ── */
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '', instructions: '', attachmentLink: '', startDate: '', endDate: '', status: 'active'
  });
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAssignments = async () => {
    if (!id) return;
    setAssignmentsLoading(true);
    try {
      const res = await apiRequest(`/faculty/assignments?batchId=${id}`);
      setAssignments(res.data || []);
    } catch (err) { console.error('[FACULTY ASSIGN] Fetch error:', err.message); }
    setAssignmentsLoading(false);
  };

  useEffect(() => { if (id) fetchAssignments(); }, [id]);

  const resetAssignmentForm = () => {
    setAssignmentForm({ title: '', instructions: '', attachmentLink: '', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active' });
    setEditingAssignment(null);
    setShowAssignmentModal(false);
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.endDate) { alert('Title and end date required'); return; }
    setSavingAssignment(true);
    try {
      if (editingAssignment) {
        const res = await apiRequest(`/faculty/assignments/${editingAssignment._id}`, {
          method: 'PUT', body: JSON.stringify({ ...assignmentForm, batchId: id })
        });
        setAssignments(prev => prev.map(a => a._id === editingAssignment._id ? res.data : a));
      } else {
        const res = await apiRequest('/faculty/assignments', {
          method: 'POST', body: JSON.stringify({ ...assignmentForm, batchId: id })
        });
        setAssignments(prev => [res.data, ...prev]);
      }
      resetAssignmentForm();
    } catch (err) { alert(err.message || 'Failed to save assignment'); }
    setSavingAssignment(false);
  };

  const handleDeleteAssignment = async (a) => {
    if (a._submissionStats?.total > 0 && !confirm(`This assignment has ${a._submissionStats.total} submission(s). Delete anyway?`)) return;
    if (!editingAssignment && !confirm(`Delete "${a.title}"?`)) return;
    try {
      await apiRequest(`/faculty/assignments/${a._id}`, { method: 'DELETE' });
      setAssignments(prev => prev.filter(x => x._id !== a._id));
    } catch (err) { alert(err.message || 'Failed to delete'); }
  };

  const loadAssignmentDetail = async (a) => {
    if (expandedAssignment === a._id) { setExpandedAssignment(null); setAssignmentDetail(null); return; }
    setExpandedAssignment(a._id);
    setDetailLoading(true);
    try {
      const res = await apiRequest(`/faculty/assignments/${a._id}`);
      setAssignmentDetail(res.data);
    } catch (err) { setAssignmentDetail(null); }
    setDetailLoading(false);
  };

  const handleGradeSubmission = async (submissionId, status, feedback) => {
    try {
      await apiRequest(`/faculty/assignments/${assignmentDetail._id}/submissions/${submissionId}`, {
        method: 'PUT', body: JSON.stringify({ status, feedback })
      });
      loadAssignmentDetail(assignmentDetail);
    } catch (err) { alert(err.message || 'Failed to grade'); }
  };

  /*
   * Export CSV — batch metadata (including active plan details) + every
   * enrolled student with full progress detail. Same layout as the
   * coordinator batch export.
   */
  const exportCSV = () => {
    /* CSV cell escape: wrap in quotes when value has comma, quote, or newline.
       Also neutralise spreadsheet formula injection — cells starting with
       =, +, -, @, tab or CR get a leading apostrophe so Excel/WPS never
       interpret student-entered values (names, emails) as live formulas. */
    const esc = v => {
      let s = String(v ?? '');
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [];

    /* ── Batch metadata block (incl. plan details) ── */
    rows.push(['BATCH DETAIL EXPORT — TheWebytes']);
    rows.push(['Batch Name', batch.name || '']);
    rows.push(['Batch Code', batch.code || '']);
    rows.push(['Status', batch.status || '']);
    rows.push(['Course', batch.courseOffering?.name || '']);
    rows.push(['Created', batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : '']);
    rows.push(['Enrolled Students', enrolledStudents.length]);
    rows.push(['Active Plan', activePlan?.plan?.name || 'No plan']);
    if (activePlan) {
      rows.push(['Plan Start', activePlan.startDate ? new Date(activePlan.startDate).toLocaleDateString() : '']);
      rows.push(['Plan Day', `${activePlan.currentDay ?? 0}/${activePlan.totalDays ?? 0}`]);
      rows.push(['Plan Status', activePlan.status || 'active']);
    }
    rows.push(['Exported On (Today)', new Date().toLocaleDateString()]);
    rows.push([]);

    /* ── Student table header ── */
    rows.push([
      'Name', 'Username', 'Email', 'College', 'Joined Date', 'Course',
      'Plan Pace', 'Plan Progress %', 'Plan Completed', 'Plan Total', 'Overdue Items',
      'DSA %', 'DSA Done', 'DSA Total',
      'DBMS %', 'DBMS Done', 'DBMS Total',
      'OS %', 'OS Done', 'OS Total',
      'PROG %', 'PROG Done', 'PROG Total',
      'APT %', 'APT Done', 'APT Total',
      'Overall %', 'Needs Attention', 'Attention Reasons'
    ]);

    /* ── One row per enriched student (already has _ov/_pp/_bi computed) ── */
    for (const s of enrichedStudents) {
      const prog = s.progress;
      /* Per-subject completed/total counts */
      const subjectCounts = {};
      for (const sub of ['dsa', 'dbms', 'os', 'programming', 'aptitude']) {
        const so = prog?.[sub]?.overall;
        subjectCounts[sub] = { completed: so?.completed || 0, total: so?.total || 0 };
      }
      /* Subject completion % helper */
      const subPct = sub => subjectCounts[sub].total > 0 ? Math.round((subjectCounts[sub].completed / subjectCounts[sub].total) * 100) : 0;
      const pp = s.progress?.planProgress;

      rows.push([
        s.displayName || s.username || '', s.username || '', s.email || '',
        s.college || '', s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toLocaleDateString() : '',
        s.courseOffering?.name || '',
        pp?.status === 'completed' ? 'completed' : pp?.paceStatus || 'no-plan',
        s._pp, pp?.completedCount || 0, pp?.expectedCount || 0, s._bi,
        subPct('dsa'), subjectCounts.dsa.completed, subjectCounts.dsa.total,
        subPct('dbms'), subjectCounts.dbms.completed, subjectCounts.dbms.total,
        subPct('os'), subjectCounts.os.completed, subjectCounts.os.total,
        subPct('programming'), subjectCounts.programming.completed, subjectCounts.programming.total,
        subPct('aptitude'), subjectCounts.aptitude.completed, subjectCounts.aptitude.total,
        s._ov, s.needsAttention ? 'Yes' : 'No', (s.attentionReasons || []).join('; ')
      ]);
    }

    rows.push([]);
    rows.push(['Exported', new Date().toLocaleString()]);

    /* ── Trigger browser download ── */
    const csv = rows.map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (batch.name || 'batch').replace(/[^a-z0-9]+/gi, '_') || 'batch';
    a.href = url;
    a.download = `${safeName}_batch_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('[FACULTY BATCH DETAIL] CSV exported:', enrolledStudents.length, 'students');
  };

  if (loading) return <Loader text="LOADING BATCH..." />;
  if (error) return <div className="error-text">{error}</div>;
  if (!batch) return <div className="error-text">Batch not found</div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>{batch.name} — Batch — Faculty — TheWebytes</title></Helmet>

      {/* ── Back link ── */}
      <Link to="/faculty/batches"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-md)',
          fontSize: '0.85rem', color: 'var(--text-secondary)'
        }}>
        <ArrowLeft size={14} /> Back to all batches
      </Link>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 'var(--space-sm)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900,
            display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)'
          }}>
            <Layers size={28} />
            {batch.name}
          </h1>
          <div style={{
            display: 'flex', gap: 16, fontSize: '0.85rem',
            color: 'var(--text-tertiary)', flexWrap: 'wrap', alignItems: 'center', marginTop: 4
          }}>
            <span>
              <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {batch.studentCount ?? enrolledStudents.length} student{(batch.studentCount ?? enrolledStudents.length) !== 1 ? 's' : ''}
            </span>
            {(batch.teachers || []).length > 0 && (
              <span style={{
                padding: '2px 6px', border: '2px solid #0f766e',
                background: '#ccfbf1', color: '#0f766e',
                fontSize: '0.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6
              }}>
                <Shield size={11} />
                {(batch.teachers || []).length === 1 ? 'Teacher:' : `${batch.teachers.length} teachers:`}
                {batch.teachers.map(t => (
                  <Link key={t._id} to={`/faculty/students/${t._id}`} title="View teacher page"
                    style={{ color: '#0f766e', fontWeight: 800, textDecoration: 'underline' }}>
                    {t.displayName || t.username}
                  </Link>
                ))}
              </span>
            )}
            {batch.expectedStudents && <span>Expected: {batch.expectedStudents}</span>}
            <span style={{
              padding: '2px 6px', border: '2px solid var(--border-color)',
              background: batch.status === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
              color: batch.status === 'active' ? 'var(--success-text)' : 'var(--text-secondary)',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase'
            }}>
              {batch.status}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn--sm" onClick={exportCSV}
            title="Export batch metadata + active plan details + all enrolled students with full progress as CSV">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Code / Info Card ── */}
      <div style={{ ...CARD, marginTop: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
              display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Batch Code
            </span>
            <span>
              <strong style={{
                fontFamily: 'monospace', letterSpacing: '0.12em', fontSize: '1.2rem',
                color: 'var(--text-primary)'
              }}>
                {batch.code}
              </strong>
              <button className="btn btn--sm btn--ghost" style={{
                marginLeft: 6, padding: '2px 6px', fontSize: '0.65rem', verticalAlign: 'middle'
              }} onClick={() => { navigator.clipboard.writeText(batch.code); alert('Code copied!'); }}>
                <Copy size={12} /> Copy
              </button>
            </span>
          </div>
          {batch.courseOffering && (
            <div>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
                display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                Course
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={14} /> {batch.courseOffering.name}
              </span>
            </div>
          )}
          <div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)',
              display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Created
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {new Date(batch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ FACULTIES ASSIGNED TO THIS BATCH ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid #0f766e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
            <Shield size={18} style={{ color: '#0f766e' }} /> Faculties Assigned ({batch.teachers?.length || 0})
          </h2>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Faculty scope is managed by your coordinator.
          </span>
        </div>
        {(batch.teachers || []).length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} /> No faculty assigned to this batch yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {batch.teachers.map(t => (
              <Link key={t._id} to={`/faculty/students/${t._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '2px solid #0f766e', padding: '8px 12px',
                  background: '#f0fdfa', minWidth: 200,
                  transition: 'transform 0.12s, box-shadow 0.12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #0f766e'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {t.avatar ? (
                    <img src={t.avatar} alt="" style={{ width: 36, height: 36, border: '2px solid #0f766e', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, border: '2px solid #0f766e', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Shield size={18} color="#fff" />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{t.displayName || t.username}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>@{t.username}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ═══ PLAN SECTION — RICH METRICS ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
            <FileText size={18} /> Active Plan
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {activePlan ? (
              <>
                <button className="btn btn--sm" onClick={openPlanPicker}
                  style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                  Change Plan
                </button>
                <button className="btn btn--sm btn--danger" onClick={handleUnassignPlan}
                  style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                  <X size={12} /> Unassign
                </button>
              </>
            ) : (
              <button className="btn btn--sm" onClick={openPlanPicker}
                style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                <Plus size={12} /> Assign Plan
              </button>
            )}
          </div>
        </div>

        {loadingPlan ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Loading plan...</p>
        ) : activePlan ? (
          <div>
            {/* Plan header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <Link to={`/faculty/plans/${activePlan.plan?._id}`} style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}>
                {activePlan.plan?.name || 'Unknown Plan'}
              </Link>
              <span style={{
                fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                padding: '2px 6px', border: '2px solid var(--border-color)',
                background: activePlan.status === 'completed' ? '#d1fae5' : 'var(--success-bg)',
                color: activePlan.status === 'completed' ? '#065f46' : 'var(--success-text)'
              }}>
                {activePlan.status === 'completed' ? 'Completed' : 'Active'}
              </span>
            </div>
            {/* Plan start date + today's date (IST calendar) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} />
                Plan start: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {activePlan.startDate ? new Date(activePlan.startDate).toLocaleDateString() : '—'}
                </strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} />
                Today: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {new Date().toLocaleDateString()}
                </strong>
              </span>
              <span style={{ opacity: 0.55 }}>
                ({(activePlan.status === 'completed' ? 'ended' : `${activePlan.totalDays || 0} days • Day ${activePlan.currentDay ?? 0}`)})
              </span>
            </div>
            {activePlan.plan?.description && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{activePlan.plan.description}</p>
            )}

            {/* Metric summary grid */}
            {(() => {
              /* If plan is completed, show final summary */
              if (activePlan.status === 'completed') {
                const total = Number(activePlan.totalItems) || 1;
                const completedCount = Number(activePlan.completedCount) || 0;
                const completionPct = activePlan.completionPct || Math.round((completedCount / total) * 100);
                const completedStudents = enrolledStudents.filter(s => s.progress?.planProgress?.status === 'completed').length;
                return (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>
                        <span>Plan Completed ✓</span>
                        <span>{completionPct}% overall</span>
                      </div>
                      <div style={{ height: 12, background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, completionPct)}%`, background: 'var(--success)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 6, marginBottom: 6 }}>
                      <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--success)' }}>✓</div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Status</div>
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Plan duration has ended</div>
                      </div>
                      <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{completedCount}/{total}</div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Items Completed</div>
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Across all students with data</div>
                      </div>
                      <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: completedStudents >= enrolledStudents.length / 2 ? '#16a34a' : '#eab308' }}>{completedStudents}/{enrolledStudents.length}</div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Students Completed</div>
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Students who finished all plan items</div>
                      </div>
                    </div>
                  </>
                );
              }
              const total = Number(activePlan.totalDays) || 1;
              const current = Math.max(0, Number(activePlan.currentDay) || 0);
              const timePct = current > 0 && total > 0 ? Math.round((current / total) * 100) : 0;
              const started = current >= 1;
              const withPlan = enrichedStudents.filter(s => s.progress?.planProgress).length;
              const avgPct = withPlan > 0 ? Math.round(enrichedStudents.reduce((sum, s) => sum + (s._pp || 0), 0) / withPlan) : 0;
              return (
                <>
                  {/* Time-elapsed progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>
                      <span>Day {current}/{total}</span>
                      <span>Time Elapsed: {timePct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>
                      <span>Day {current} expires at 11:59 PM tonight</span>
                      <span>{total - current} day{(total - current) !== 1 ? 's' : ''} remaining</span>
                    </div>
                    <div style={{ height: 12, background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${timePct}%`, background: 'var(--success)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* Stat counters */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 6, marginBottom: 6 }}>
                    <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{started ? current : 0}</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Days Elapsed</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Plan day {current} of {total} total</div>
                    </div>
                    <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{withPlan}/{enrolledStudents.length}</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>With Plan Data</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Students with recorded plan progress</div>
                    </div>
                    <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: avgPct >= 60 ? '#16a34a' : avgPct >= 30 ? '#eab308' : '#dc2626' }}>{avgPct}%</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Avg Completion</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Mean items completed out of assigned so far</div>
                    </div>
                    <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{
                        (() => {
                          const ahead = enrolledStudents.filter(s => s.progress?.planProgress?.paceStatus === 'ahead').length;
                          const onTrack = enrolledStudents.filter(s => s.progress?.planProgress?.paceStatus === 'on-track').length;
                          return `${ahead + onTrack}`;
                        })()
                      }</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>On Track</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Students ahead or on-track with plan pace</div>
                    </div>
                    <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#dc2626' }}>{
                        enrolledStudents.filter(s => s.progress?.planProgress?.paceStatus === 'behind').length
                      }</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Behind</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>Behind schedule on plan progress</div>
                    </div>
                    <div style={{ border: '2px solid var(--border-color)', padding: '6px 10px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-tertiary)' }}>{
                        enrolledStudents.filter(s => {
                          const sp = s.progress?.planProgress;
                          return !sp || (!sp.paceStatus && sp.status !== 'completed') || sp.paceStatus === 'just-started';
                        }).length
                      }</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>No Data / Just Started</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)', marginTop: 1 }}>No plan progress tracked yet</div>
                    </div>
                  </div>

                  {!started && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 4 }}>
                      Plan starts on {new Date(activePlan.startDate).toLocaleDateString()}. Progress will appear once the plan is underway.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> No plan assigned yet. Create or assign a study plan to track daily progress.
          </p>
        )}
      </div>

      {/* ═══ ASSIGNMENTS — INLINE CRUD ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
            <FileText size={18} /> Assignments ({assignments.length})
          </h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn btn--sm" onClick={() => { resetAssignmentForm(); setShowAssignmentModal(true); }}
              style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
              <Plus size={12} /> Create
            </button>
          </div>
        </div>

        {assignmentsLoading ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> No assignments yet for this batch.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assignments.map(a => {
              const now = new Date();
              /* IST-safe: deadline = end-of-day IST of endDate */
              const eod = getIstNextDayStart(a.endDate);
              const isOverdue = a.status === 'active' && eod <= now;

              const stats = a._submissionStats || {};
              return (
                <div key={a._id} style={{ border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
                    <FileText size={14} style={{ flexShrink: 0, color: isOverdue ? '#dc2626' : a.status === 'active' ? '#16a34a' : 'var(--text-tertiary)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{a.title}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>{new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()} (deadline: {new Date(a.endDate).toLocaleDateString()} at 11:59 PM)</span>
                    </div>
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, padding: '2px 6px', border: '2px solid var(--border-color)', background: isOverdue ? '#fef2f2' : a.status === 'active' ? '#f0fdf4' : 'var(--bg-tertiary)', color: isOverdue ? '#dc2626' : a.status === 'active' ? '#16a34a' : 'var(--text-tertiary)' }}>{a.status}{isOverdue ? ' (overdue)' : ''}</span>
                    <button onClick={e => { e.stopPropagation(); loadAssignmentDetail(a); }}
                      style={{
                        fontSize: '0.55rem', fontWeight: 700, padding: '4px 10px',
                        border: '2px solid var(--border-color)', cursor: 'pointer',
                        background: 'var(--bg-surface)', color: 'var(--text-primary)',
                        display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
                      }}>
                      {expandedAssignment === a._id ? '▲' : '▼'} Submissions ({stats.total}/{stats.totalStudents})
                    </button>
                    <Link to={`/faculty/assignments/${a._id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: '0.55rem', fontWeight: 700, padding: '4px 10px',
                        border: '2px solid var(--border-color)', cursor: 'pointer',
                        background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3,
                        whiteSpace: 'nowrap'
                      }}>
                      Details →
                    </Link>
                    <button onClick={e => { e.stopPropagation(); setEditingAssignment(a); setAssignmentForm({ title: a.title, instructions: a.instructions || '', attachmentLink: a.attachmentLink || '', startDate: new Date(a.startDate).toISOString().split('T')[0], endDate: new Date(a.endDate).toISOString().split('T')[0], status: a.status }); setShowAssignmentModal(true); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                      <Edit3 size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteAssignment(a); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#dc2626', fontSize: '0.7rem' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {/* Expanded detail with submissions */}
                  {expandedAssignment === a._id && (
                    <div style={{ borderTop: '2px solid var(--border-color)', padding: 'var(--space-sm)', background: 'var(--bg-surface)' }}>
                      {detailLoading ? (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Loading...</p>
                      ) : assignmentDetail ? (
                        <>
                          {assignmentDetail.instructions && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'pre-wrap' }}>{assignmentDetail.instructions}</p>}
                          {assignmentDetail.attachmentLink && (
                            <a href={assignmentDetail.attachmentLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4338ca', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                              <ExternalLink size={11} /> View Attachment
                            </a>
                          )}
                          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>Submissions ({assignmentDetail.submissions?.length || 0})</div>
                          {(assignmentDetail.submissions || []).map(sub => (
                            <div key={sub._id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', flexWrap: 'wrap', borderTop: '1px solid var(--gray-300)' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, minWidth: 100 }}>{sub.student?.displayName || sub.student?.username || '?'}</span>
                              <a href={sub.driveLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#4338ca' }}>View</a>
                              <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', border: '2px solid var(--border-color)', background: sub.status === 'approved' ? '#f0fdf4' : sub.status === 'rejected' ? '#fef2f2' : 'var(--bg-tertiary)', color: sub.status === 'approved' ? '#16a34a' : sub.status === 'rejected' ? '#dc2626' : 'var(--text-tertiary)' }}>{sub.status}</span>
                              <button onClick={() => handleGradeSubmission(sub._id, 'approved', sub.feedback || '')} style={{ fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', border: '2px solid #16a34a', cursor: 'pointer', background: '#f0fdf4', color: '#16a34a' }}>Approve</button>
                              <button onClick={() => { const fb = prompt('Feedback:', sub.feedback || ''); if (fb !== null) handleGradeSubmission(sub._id, 'rejected', fb); }} style={{ fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', border: '2px solid #dc2626', cursor: 'pointer', background: '#fef2f2', color: '#dc2626' }}>Reject</button>
                            </div>
                          ))}
                          {assignmentDetail.notSubmitted?.length > 0 && (
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Not submitted: {assignmentDetail.notSubmitted.map(s => s.displayName || s.username).join(', ')}</p>
                          )}
                        </>
                      ) : <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Failed to load.</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment create/edit modal */}
      {showAssignmentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) resetAssignmentForm(); }}>
          <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-color)', boxShadow: '8px 8px 0 var(--shadow-color)', padding: 'var(--space-lg)', maxWidth: 500, width: '100%' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 16, color: 'var(--text-primary)' }}>{editingAssignment ? 'Edit' : 'New'} Assignment</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" placeholder="Title *" value={assignmentForm.title} onChange={e => setAssignmentForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input" placeholder="Instructions..." rows={3} value={assignmentForm.instructions} onChange={e => setAssignmentForm(f => ({ ...f, instructions: e.target.value }))} style={{ resize: 'vertical' }} />
              <input className="input" placeholder="Attachment link (Google Drive...)" value={assignmentForm.attachmentLink} onChange={e => setAssignmentForm(f => ({ ...f, attachmentLink: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={{ fontSize: '0.6rem', fontWeight: 700, display: 'block', marginBottom: 2, color: 'var(--text-tertiary)' }}>Start</label><input type="date" className="input" value={assignmentForm.startDate} onChange={e => setAssignmentForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><label style={{ fontSize: '0.6rem', fontWeight: 700, display: 'block', marginBottom: 2, color: 'var(--text-tertiary)' }}>End *</label><input type="date" className="input" value={assignmentForm.endDate} onChange={e => setAssignmentForm(f => ({ ...f, endDate: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn--sm btn--ghost" onClick={resetAssignmentForm}>Cancel</button>
                <button className="btn btn--sm" onClick={handleCreateAssignment} disabled={savingAssignment} style={{ opacity: savingAssignment ? 0.6 : 1 }}>{savingAssignment ? 'Saving...' : editingAssignment ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Progress Distribution */}
      {activePlan && enrolledStudents.length > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 4 }}>
            <BarChart3 size={14} />
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              Pace Distribution
            </h3>
          </div>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginBottom: 6, borderLeft: '2px solid var(--gray-500)', paddingLeft: 6 }}>
            Pace reflects how each student is tracking against plan expectations. Ahead ≥90%, On-track ≥60%, Behind &lt;60% of items completed relative to what should be done by this day.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            {[
              { key: 'ahead', label: 'Ahead', color: '#16a34a' },
              { key: 'on-track', label: 'On Track', color: '#2563eb' },
              { key: 'behind', label: 'Behind', color: '#dc2626' },
              { key: 'just-started', label: 'Just Started', color: 'var(--text-tertiary)' },
              { key: 'none', label: 'No Plan', color: 'var(--gray-300)' }
            ].map(({ key, label, color }) => {
              const count = planDistribution[key] || 0;
              const pct = enrolledStudents.length > 0 ? Math.round((count / enrolledStudents.length) * 100) : 0;
              return count > 0 ? (
                <div key={key} style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color }}>{count}</div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{label}</div>
                  <div style={{ height: 4, width: '100%', background: 'var(--bg-tertiary)', marginTop: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* ═══ STUDENT PERFORMANCE SECTIONS ═══ */}
      {activePlan && enrichedStudents.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          {/* ── Top Performing Students ── */}
          {topCandidates.length > 0 && (
            <div style={{ ...CARD, marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={18} />
                  <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>Top Performing Students</h2>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', border: '2px solid var(--border-color)', background: '#f5f5f5' }}>{topCandidates.length} total</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select value={topFilter} onChange={e => { setTopFilter(e.target.value); setTopPage(1); }}
                    style={{ fontSize: '0.68rem', padding: '3px 6px', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', fontFamily: 'inherit' }}>
                    <option value="all">All ranges</option>
                    <option value="0-49">0–49%</option>
                    <option value="50-69">50–69%</option>
                    <option value="70-89">70–89%</option>
                    <option value="90-100">90–100%</option>
                  </select>
                  {topTotalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem' }}>
                      <button onClick={() => setTopPage(p => Math.max(1, p - 1))} disabled={topPage === 1}
                        style={{ background: 'none', border: 'none', cursor: topPage === 1 ? 'default' : 'pointer', opacity: topPage === 1 ? 0.4 : 1, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}>&lt;</button>
                      <span>{topPage}/{topTotalPages}</span>
                      <button onClick={() => setTopPage(p => Math.min(topTotalPages, p + 1))} disabled={topPage === topTotalPages}
                        style={{ background: 'none', border: 'none', cursor: topPage === topTotalPages ? 'default' : 'pointer', opacity: topPage === topTotalPages ? 0.4 : 1, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}>&gt;</button>
                    </div>
                  )}
                </div>
              </div>
              {paginatedTop.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', padding: 'var(--space-md)', textAlign: 'center' }}>No students match this range.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {paginatedTop.map((s, idx) => {
                    const pp = s.progress?.planProgress;
                    return (
                      <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', textDecoration: 'none', color: 'var(--text-primary)',
                        border: '2px solid var(--border-color)', background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-tertiary)',
                        transition: 'transform 0.12s', fontSize: '0.82rem'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border-color)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-tertiary)', minWidth: 20 }}>#{idx + 1 + (topPage - 1) * PER_PAGE_BATCH}</span>
                        {s.avatar ? (
                          <img src={s.avatar} alt="" style={{ width: 26, height: 26, border: '2px solid var(--border-color)', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 26, height: 26, border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700 }}>{s.displayName?.[0] || s.username?.[0] || '?'}</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>{s.college || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{
                            fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px',
                            border: '2px solid var(--border-color)',
                            color: pp?.status === 'completed' ? '#065f46' : '#16a34a'
                          }}>{pp?.status === 'completed' ? 'COMPLETED' : pp?.paceStatus}</span>
                          <div style={{ width: 50, height: 6, background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)' }}>
                            <div style={{ height: '100%', width: `${s._pp}%`, background: s._pp >= 60 ? '#16a34a' : s._pp >= 30 ? '#eab308' : '#dc2626' }} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem', minWidth: 32, textAlign: 'right' }}>{s._pp}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── On Track Students ── */}
          {onTrackStudents.length > 0 && (
            <div style={{ ...CARD, marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={18} color="#2563eb" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>On Track</h2>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', border: '2px solid var(--border-color)', background: '#dbeafe', color: '#1e40af' }}>{onTrackStudents.length} students</span>
                </div>
                {onTrackTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem' }}>
                    <button onClick={() => setOnTrackPage(p => Math.max(1, p - 1))} disabled={onTrackPage === 1}
                      style={{ background: 'none', border: 'none', cursor: onTrackPage === 1 ? 'default' : 'pointer', opacity: onTrackPage === 1 ? 0.4 : 1, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}>&lt;</button>
                    <span>{onTrackPage}/{onTrackTotalPages}</span>
                    <button onClick={() => setOnTrackPage(p => Math.min(onTrackTotalPages, p + 1))} disabled={onTrackPage === onTrackTotalPages}
                      style={{ background: 'none', border: 'none', cursor: onTrackPage === onTrackTotalPages ? 'default' : 'pointer', opacity: onTrackPage === onTrackTotalPages ? 0.4 : 1, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}>&gt;</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {paginatedOnTrack.map((s, idx) => {
                  const pp = s.progress?.planProgress;
                  return (
                    <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', textDecoration: 'none', color: 'var(--text-primary)',
                      border: '2px solid var(--border-color)', background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-tertiary)', fontSize: '0.82rem'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border-color)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt="" style={{ width: 26, height: 26, border: '2px solid var(--border-color)', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 26, height: 26, border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700 }}>{s.displayName?.[0] || '?'}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>{s.college || '—'}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                        {pp?.status === 'completed'
                          ? `Completed · ${s._pp}% · ${pp?.completedCount || 0}/${pp?.expectedCount || 0}`
                          : `Day ${pp?.currentDayOffset || 0}/${pp?.durationDays || 0} · ${s._pp}% · ${pp?.completedCount || 0}/${pp?.expectedCount || 0}`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Behind Students ── */}
          {behindStudents.length > 0 && (
            <div style={{ ...CARD, marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={18} color="#dc2626" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>Behind Schedule</h2>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', border: '2px solid var(--border-color)', background: '#fef2f2', color: '#991b1b' }}>{behindStudents.length} students</span>
                </div>
                {behindTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem' }}>
                    <button onClick={() => setBehindPage(p => Math.max(1, p - 1))} disabled={behindPage === 1}
                      style={{ background: 'none', border: 'none', cursor: behindPage === 1 ? 'default' : 'pointer', opacity: behindPage === 1 ? 0.4 : 1, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}>&lt;</button>
                    <span>{behindPage}/{behindTotalPages}</span>
                    <button onClick={() => setBehindPage(p => Math.min(behindTotalPages, p + 1))} disabled={behindPage === behindTotalPages}
                      style={{ background: 'none', border: 'none', cursor: behindPage === behindTotalPages ? 'default' : 'pointer', opacity: behindPage === behindTotalPages ? 0.4 : 1, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 700 }}>&gt;</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {paginatedBehind.map((s, idx) => {
                  const pp = s.progress?.planProgress;
                  return (
                    <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', textDecoration: 'none', color: 'var(--text-primary)',
                      border: '2px solid #dc2626', background: idx % 2 === 0 ? '#fef2f2' : '#fff', fontSize: '0.82rem'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #dc2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt="" style={{ width: 26, height: 26, border: '2px solid #dc2626', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 26, height: 26, border: '2px solid #dc2626', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700 }}>{s.displayName?.[0] || '?'}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>{s.college || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#dc2626' }}>{s._pp}% done · {s._bi} overdue</span>
                        <AlertCircle size={14} color="#dc2626" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ DAY-BY-DAY PROGRESS ═══ */}
      {batchDayProgress && batchDayProgress.days && batchDayProgress.days.length > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Calendar size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Day-by-Day Progress
            </h2>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', padding: '2px 8px', border: '2px solid var(--border-color)', whiteSpace: 'nowrap' }}>
              {enrolledStudents.length} students · {batchDayProgress.durationDays} days
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', borderLeft: '3px solid var(--gray-500)', paddingLeft: 8 }}>
            Each bar shows the <strong>average completion %</strong> for that day across all students.
            Green ≥80% (strong), Yellow 50-79% (moderate), Red &lt;50% (weak), Gray = no items or not started.
            <strong> Click any day</strong> to see which students completed, partially completed, or missed that day's items.
          </p>

          {/* Day grid */}
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 3, minWidth: batchDayProgress.days.length * 60 }}>
              {batchDayProgress.days.map(d => {
                const barColor = d.isFuture ? 'var(--gray-300)' : d.avgCompletionPct >= 80 ? '#16a34a' : d.avgCompletionPct >= 50 ? '#eab308' : d.avgCompletionPct > 0 ? '#dc2626' : 'var(--gray-300)';
                const isSelected = selectedDay?.day === d.day;
                return (
                  <div key={d.day} onClick={() => setSelectedDay(isSelected ? null : d)}
                    style={{
                      flexShrink: 0, width: 56, textAlign: 'center', cursor: d.isFuture ? 'default' : 'pointer',
                      border: `2px solid ${isSelected ? '#2563eb' : d.isCurrent ? 'var(--border-color)' : 'transparent'}`,
                      background: isSelected ? '#eff6ff' : d.isCurrent ? 'var(--bg-tertiary)' : 'transparent',
                      padding: '6px 2px', transition: 'all 0.12s'
                    }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: d.isFuture ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                      Day {d.day}
                    </div>
                    {d.isFuture ? (
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: 2 }}>—</div>
                    ) : d.itemsCount === 0 ? (
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Rest</div>
                    ) : (
                      <>
                        <div style={{
                          height: 40, width: 20, margin: '4px auto 2px',
                          background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: `${d.avgCompletionPct}%`,
                            background: barColor,
                            transition: 'height 0.3s'
                          }} />
                        </div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: d.avgCompletionPct >= 50 ? barColor : 'var(--text-tertiary)' }}>
                          {d.avgCompletionPct}%
                        </div>
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)' }}>
                          {d.totalCompletions}/{d.itemsCount * d.studentCount}
                        </div>
                      </>
                    )}
                    {d.isCurrent && (
                      <div style={{ fontSize: '0.45rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', marginTop: 1 }}>Today</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 6, fontSize: '0.6rem', color: 'var(--text-tertiary)', borderTop: '2px solid var(--gray-300)', paddingTop: 6 }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#16a34a', marginRight: 3, border: '2px solid var(--border-color)' }} /> ≥80% completed</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#eab308', marginRight: 3, border: '2px solid var(--border-color)' }} /> 50-79%</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#dc2626', marginRight: 3, border: '2px solid var(--border-color)' }} /> &lt;50%</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--gray-300)', marginRight: 3, border: '2px solid var(--border-color)' }} /> Not started / Rest</span>
            <span style={{ fontStyle: 'italic' }}>Click any day to see who completed what</span>
          </div>

          {/* ── Day detail panel (shown when a day is selected) ── */}
          {selectedDay && !selectedDay.isFuture && (
            <div style={{ marginTop: 'var(--space-md)', borderTop: '3px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} /> Day {selectedDay.day} — Student Breakdown
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {selectedDay.itemsCount} item{selectedDay.itemsCount !== 1 ? 's' : ''} assigned · {selectedDay.totalCompletions}/{selectedDay.itemsCount * selectedDay.studentCount} completions
                  {selectedDay.itemsCount > 0 && (
                    <span style={{ marginLeft: 4, fontWeight: 700 }}>({selectedDay.avgCompletionPct}%)</span>
                  )}
                </span>
              </div>

              {/* ── Materials assigned for this day ── */}
              {selectedDay.items && selectedDay.items.length > 0 && (
                <div style={{ marginBottom: 'var(--space-md)', border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', padding: 'var(--space-sm) var(--space-md)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <FileText size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Materials for this day ({selectedDay.items.length} item{selectedDay.items.length !== 1 ? 's' : ''})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {selectedDay.items.map((item, i) => {
                      const subColors = { dsa: '#e11d48', dbms: '#3b82f6', os: '#22c55e', programming: '#a855f7', aptitude: '#f97316' };
                      const subLabels = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'PROG', aptitude: 'APT' };
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: '0.78rem', padding: '4px 6px',
                          background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
                          border: '1px solid var(--gray-300)'
                        }}>
                          <span style={{
                            fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
                            padding: '1px 5px', border: '2px solid var(--border-color)',
                            background: subColors[item.subject] || 'var(--gray-300)',
                            color: '#fff', flexShrink: 0
                          }}>
                            {subLabels[item.subject] || item.subject}
                          </span>
                          <span style={{
                            fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '1px 4px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)', color: 'var(--text-secondary)', flexShrink: 0
                          }}>
                            {item.targetType}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600 }}>{item.targetTitle || item.targetSlug}</div>
                            {/* Full hierarchy path: Subject > Lesson > Subtopic > Problem */}
                            {(() => {
                              const subName = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Programming', aptitude: 'Aptitude' }[item.subject] || item.subject?.toUpperCase();
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
                                <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: 1, fontFamily: 'monospace', lineHeight: 1.5 }}>
                                  {labels.map((l, i) => (
                                    <span key={i}>{i > 0 && <span style={{ margin: '0 3px', opacity: 0.35 }}>|</span>}{l}</span>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                          {item.instruction && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontStyle: 'italic', flexShrink: 0 }}>
                              "{item.instruction}"
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Helper map: studentId → student object */}
              {(() => {
                const studentMap = {};
                enrolledStudents.forEach(s => { studentMap[s._id] = s; });

                const completedAllStudents = (selectedDay.completedAllIds || []).map(id => studentMap[id]).filter(Boolean);
                const partialStudents = (selectedDay.partialIds || []).map(id => studentMap[id]).filter(Boolean);
                const noneStudents = (selectedDay.noneIds || []).map(id => studentMap[id]).filter(Boolean);
                const hasData = completedAllStudents.length > 0 || partialStudents.length > 0 || noneStudents.length > 0;

                if (selectedDay.itemsCount === 0) {
                  return <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No items scheduled this day (rest day).</p>;
                }
                if (!hasData) {
                  return <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No student data available for this day.</p>;
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {/* Completed all */}
                    {completedAllStudents.length > 0 && (
                      <div style={{ border: '2px solid #16a34a', background: '#f0fdf4', padding: 6 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={14} /> Completed All — {completedAllStudents.length} student{completedAllStudents.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {completedAllStudents.map(s => (
                            <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                              fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px',
                              border: '2px solid #16a34a', background: '#fff', textDecoration: 'none', color: '#166534'
                            }}>
                              {s.displayName || s.username}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Partial */}
                    {partialStudents.length > 0 && (
                      <div style={{ border: '2px solid #eab308', background: '#fefce8', padding: 6 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#854d0e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={14} /> Partially Completed — {partialStudents.length} student{partialStudents.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {partialStudents.map(s => (
                            <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                              fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px',
                              border: '2px solid #eab308', background: '#fff', textDecoration: 'none', color: '#854d0e'
                            }}>
                              {s.displayName || s.username}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* None */}
                    {noneStudents.length > 0 && (
                      <div style={{ border: '2px solid #dc2626', background: '#fef2f2', padding: 6 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={14} /> Completed None — {noneStudents.length} student{noneStudents.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {noneStudents.map(s => (
                            <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                              fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px',
                              border: '2px solid #dc2626', background: '#fff', textDecoration: 'none', color: '#991b1b'
                            }}>
                              {s.displayName || s.username}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── Plan Picker Modal ── */}
      {showPlanPicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--overlay)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-md)'
        }} onClick={() => setShowPlanPicker(false)}>
          <div style={{
            background: 'var(--bg-surface)', border: '4px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)', padding: 'var(--space-lg)', maxWidth: 480, width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={18} /> Assign a Plan
            </h3>

            {availablePlans.length === 0 ? (
              <div style={{ padding: 'var(--space-md)', textAlign: 'center', border: '2px dashed var(--border-color)', marginBottom: 'var(--space-md)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>No published plans available.</p>
                <Link to="/faculty/plans/new" className="btn btn--sm" style={{ fontSize: '0.72rem' }}
                  onClick={() => setShowPlanPicker(false)}>
                  <Plus size={12} /> Create a Plan
                </Link>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Select Plan</label>
                  <select className="input" value={selectedPlanId}
                    onChange={e => setSelectedPlanId(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }}>
                    <option value="">— Choose a plan —</option>
                    {availablePlans.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.durationDays} days · {p.items?.length || 0} items)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Start Date</label>
                  <input type="date" className="input" value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowPlanPicker(false)}>Cancel</button>
              <button className="btn" onClick={handleAssignPlan}
                disabled={!selectedPlanId || !startDate}
                style={{ background: selectedPlanId && startDate ? 'var(--success)' : undefined, color: selectedPlanId && startDate ? 'var(--text-inverse)' : undefined }}>
                Assign Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search + Filter Bar ── */}
      <div style={{
        ...CARD, marginBottom: 'var(--space-md)',
        padding: 'var(--space-sm) var(--space-md)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'
      }}>
        <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input className="input" placeholder="Search by name or email..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: 180, border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', padding: 0 }} />
        {searchQuery && (
          <button className="btn btn--sm btn--ghost" onClick={() => setSearchQuery('')}
            style={{ padding: '2px 6px', fontSize: '0.65rem', flexShrink: 0 }}>
            <X size={12} /> Clear
          </button>
        )}
        <select className="input" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          style={{ width: 180, fontSize: '0.78rem', padding: '4px 6px' }}>
          <option value="">All courses</option>
          {students.reduce((acc, s) => {
            const co = s.courseOffering;
            if (co && co._id && !acc.find(a => a._id === co._id)) acc.push(co);
            return acc;
          }, []).map(co => (
            <option key={co._id} value={co._id}>{co.name}</option>
          ))}
        </select>
        <select className="input" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ width: 150, fontSize: '0.78rem', padding: '4px 6px' }}>
          <option value="">All time</option>
          <option value="year">This year</option>
          <option value="6months">Within 6 months</option>
          <option value="1month">Within 1 month</option>
          <option value="today">Today</option>
        </select>
        {(searchQuery || courseFilter || dateFilter) && (
          <button className="btn btn--sm btn--ghost" onClick={() => { setSearchQuery(''); setCourseFilter(''); setDateFilter(''); }}
            style={{ fontSize: '0.65rem', padding: '2px 8px', flexShrink: 0 }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ═══ NEEDS ATTENTION ═══ */}
      {(() => {
        const flagged = enrolledStudents.filter(s => s.needsAttention);
        if (flagged.length === 0) return null;
        return (
          <div style={{ marginBottom: 'var(--space-xl)', ...CARD, borderLeft: '6px solid var(--error)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} style={{ color: 'var(--error)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Needs Attention
                </h2>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 10px', border: '2px solid var(--border-color)',
                  background: 'var(--error)', color: 'var(--text-inverse)'
                }}>
                  {flagged.length} flagged
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {flagged.sort((a, b) => (b.attentionReasons?.length || 0) - (a.attentionReasons?.length || 0)).map(s => (
                <Link key={s._id} to={`/faculty/students/${s._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', border: '2px solid var(--border-color)',
                  background: 'var(--bg-surface)', textDecoration: 'none', color: 'var(--text-primary)',
                  fontSize: '0.82rem', transition: 'transform 0.12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {s.avatar ? (
                    <img src={s.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid var(--border-color)', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 28, height: 28, border: '2px solid var(--border-color)', background: 'var(--bg-tertiary)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700 }}>{s.displayName || s.username}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>{s.college || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {(s.attentionReasons || []).map((reason, i) => (
                      <span key={i} style={{
                        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                        padding: '2px 6px', border: '2px solid var(--border-color)',
                        background: reason.includes('Inactive') ? 'var(--error-bg)' : reason.includes('Bottom') ? 'var(--warning-bg)' : 'var(--accent-light)'
                      }}>
                        {reason}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════ */}
      {/* ENROLLED STUDENTS — in this batch       */}
      {/* ═══════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '1rem', fontWeight: 800, marginBottom: 'var(--space-sm)',
          display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)'
        }}>
          <Users size={16} /> Enrolled in this batch ({enrolledStudents.length})
        </h2>

        {/* Table — enrolled (view-only for faculty: no bulk actions) */}
        <div style={{ border: '3px solid var(--border-color)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '3px solid var(--border-color)',
                  textAlign: 'left', background: 'var(--bg-tertiary)'
                }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Name</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Email</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>College</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <BookOpen size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} /> Course
                  </th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--text-primary)' }}>Plan Pace</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-tertiary)'
                    }}>
                      No students in this batch yet.
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link to={`/faculty/students/${s._id}`} style={{ fontWeight: 600, textDecoration: 'none', color: 'inherit' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; }}>
                          {s.displayName || s.username}
                        </Link>
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                        {s.email || '—'}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-primary)' }}>
                        {s.college || '—'}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        {s.courseOffering?.name ? (
                          <span style={{
                            padding: '2px 6px', border: '2px solid var(--border-color)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                            fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap'
                          }}>
                            {s.courseOffering.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        {(() => {
                          const pp = s.progress?.planProgress;
                          if (!pp) return <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>;
                          if (pp.status === 'completed') {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                  fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                                  padding: '2px 6px', border: '2px solid #000',
                                  color: '#065f46'
                                }}>
                                  COMPLETED
                                </span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                                  {pp.completedCount}/{pp.expectedCount}
                                </span>
                              </div>
                            );
                          }
                          const paceColors = { ahead: '#16a34a', 'on-track': '#2563eb', behind: '#dc2626', 'just-started': 'var(--text-tertiary)' };
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                                padding: '2px 6px', border: '2px solid #000',
                                color: paceColors[pp.paceStatus] || 'var(--text-tertiary)'
                              }}>
                                {pp.paceStatus === 'just-started' ? 'Started' : pp.paceStatus}
                              </span>
                              {pp.paceStatus !== 'just-started' && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                                  {pp.completedCount}/{pp.expectedCount}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}