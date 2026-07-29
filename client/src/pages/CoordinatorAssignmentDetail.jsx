import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  FileText, ArrowLeft, ExternalLink, Calendar, Clock, Send,
  CheckCircle, XCircle, AlertCircle, Users, Download, Search,
  BookOpen, Mail, GraduationCap, Pencil, Trash2
} from 'lucide-react';

/* ─── Theme-aware tokens ─── */
const B = 'var(--border-color)';
const TXT = 'var(--text-primary)';
const TXT2 = 'var(--text-secondary)';
const TXT3 = 'var(--text-tertiary)';
const SURF = 'var(--bg-surface)';
const TERT = 'var(--bg-tertiary)';
const SH = (n) => `${n}px ${n}px 0 var(--shadow-color)`;
const CARD = (n = 6) => ({ border: `3px solid ${B}`, padding: 'var(--space-lg)', background: SURF, boxShadow: SH(n) });
const LABEL = { fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TXT3, marginBottom: 2 };

export default function CoordinatorAssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [gradingId, setGradingId] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [bulking, setBulking] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  /* ── Edit modal state ── */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', instructions: '', attachmentLink: '', batchId: '',
    startDate: '', endDate: '', status: 'active'
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [batches, setBatches] = useState([]);

  /* Fetch batches for the edit modal */
  useEffect(() => {
    apiRequest('/coordinator/batches')
      .then(r => setBatches(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiRequest(`/coordinator/assignments/${id}`)
      .then(res => { setAssignment(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  /* ── Open edit modal with current values ── */
  const initEdit = () => {
    if (!assignment) return;
    setEditForm({
      title: assignment.title,
      instructions: assignment.instructions || '',
      attachmentLink: assignment.attachmentLink || '',
      batchId: assignment.batch?._id || '',
      startDate: new Date(assignment.startDate).toISOString().split('T')[0],
      endDate: new Date(assignment.endDate).toISOString().split('T')[0],
      status: assignment.status
    });
    setShowEditModal(true);
    setEditError('');
  };

  /* ── Save edit changes ── */
  const handleEditSave = async () => {
    const missing = [];
    if (!editForm.title) missing.push('Title');
    if (!editForm.startDate) missing.push('Start Date');
    if (!editForm.endDate) missing.push('End Date');
    if (missing.length > 0) {
      setEditError(`Required fields missing: ${missing.join(', ')}`);
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      const res = await apiRequest(`/coordinator/assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setAssignment(res.data);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || 'Failed to save');
    }
    setEditSaving(false);
  };

  const handleGrade = async (submissionId, status) => {
    setIsGrading(true);
    try {
      await apiRequest(`/coordinator/assignments/${id}/submissions/${submissionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, feedback: feedbackInput || '' })
      });
      setFeedbackInput('');
      setGradingId(null);
      const res = await apiRequest(`/coordinator/assignments/${id}`);
      setAssignment(res.data);
    } catch (err) {
      alert(err.message || 'Failed to grade');
    }
    setIsGrading(false);
  };

  /* ── Remove a single student's submission — moves them back to 'Not Submitted' ── */
  const handleRemoveSubmission = async (submissionId, studentName) => {
    if (!confirm(`Remove ${studentName}'s submission? They will need to resubmit.`)) return;
    try {
      const res = await apiRequest(`/coordinator/assignments/${id}/submissions/${submissionId}`, {
        method: 'DELETE'
      });
      setAssignment(res.data);
    } catch (err) {
      alert('Failed to remove submission: ' + (err.message || 'Unknown error'));
    }
  };

  /* ── Remove ALL submissions — all students must resubmit ── */
  const handleRemoveAll = async () => {
    if (!confirm(`Remove ALL submissions (${assignment?.submissions?.length || 0}) for this assignment? All students will need to resubmit.`)) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      const res = await apiRequest(`/coordinator/assignments/${id}/submissions`, {
        method: 'DELETE'
      });
      setAssignment(res.data);
    } catch (err) {
      alert('Failed to remove all submissions: ' + (err.message || 'Unknown error'));
    }
  };

  /* ── Bulk approve/reject all pending submissions ── */
  const handleBulkGrade = async (status) => {
    const label = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${label} ALL pending submissions?`)) return;
    setBulking(true);
    try {
      const res = await apiRequest(`/coordinator/assignments/${id}/bulk-grade`, {
        method: 'PUT',
        body: JSON.stringify({ status, feedback: bulkFeedback || '' })
      });
      setAssignment(res.data);
      setBulkFeedback('');
      alert(`Successfully ${status === 'approved' ? 'approved' : 'rejected'} ${res.modifiedCount} submission(s)!`);
    } catch (err) {
      alert('Bulk grade failed: ' + (err.message || 'Unknown error'));
    }
    setBulking(false);
  };

  /* ── Merged single list: submissions + notSubmitted, with filter ── */
  const mergedList = useMemo(() => {
    if (!assignment) return [];
    /* Convert submissions — they already have student data + status */
    const subItems = (assignment.submissions || []).map(s => ({
      _key: s._id,
      _type: 'submission',
      _status: s.status, /* 'submitted', 'approved', 'rejected' */
      student: s.student,
      submittedAt: s.submittedAt,
      driveLink: s.driveLink,
      feedback: s.feedback,
      submissionId: s._id
    }));
    /* Convert notSubmitted — no submission yet */
    const notSubItems = (assignment.notSubmitted || []).map(s => ({
      _key: `ns-${s._id}`,
      _type: 'not_submitted',
      _status: 'not_submitted',
      student: s,
      submittedAt: null,
      driveLink: null,
      feedback: null,
      submissionId: null
    }));
    const all = [...subItems, ...notSubItems];

    /* Apply filter — 'submitted' means has any submission (pending/approved/rejected) */
    let filtered = all;
    if (filterStatus === 'submitted') filtered = all.filter(i => i._status !== 'not_submitted');
    else if (filterStatus === 'approved') filtered = all.filter(i => i._status === 'approved');
    else if (filterStatus === 'rejected') filtered = all.filter(i => i._status === 'rejected');
    else if (filterStatus === 'not_submitted') filtered = all.filter(i => i._status === 'not_submitted');

    /* Apply search */
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        (i.student?.displayName || '').toLowerCase().includes(q) ||
        (i.student?.username || '').toLowerCase().includes(q) ||
        (i.student?.email || '').toLowerCase().includes(q) ||
        (i.student?.college || '').toLowerCase().includes(q)
      );
    }

    /* Sort: not_submitted first, then submitted pending, then approved/rejected */
    const sortOrder = { not_submitted: 0, submitted: 1, approved: 2, rejected: 3 };
    filtered.sort((a, b) => (sortOrder[a._status] ?? 99) - (sortOrder[b._status] ?? 99));

    return filtered;
  }, [assignment, filterStatus, search]);

  const pendingCount = assignment?.submissions?.filter(s => s.status === 'submitted').length || 0;

  /* ── Export CSV ── */
  const exportCSV = () => {
    if (!assignment) return;
    const rows = [];
    const push = (cells) => rows.push(cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));
    push(['THEWEBYTES — ASSIGNMENT SUBMISSIONS REPORT']);
    push([`Assignment: ${assignment.title}`, `Batch: ${assignment.batch?.name || ''}`]);
    push([`Start: ${new Date(assignment.startDate).toLocaleDateString()}`, `End: ${new Date(assignment.endDate).toLocaleDateString()}`]);
    push([]);
    push(['Student Name', 'Username', 'Email', 'College', 'Status', 'Drive Link', 'Submitted At', 'Feedback']);
    for (const sub of assignment.submissions || []) {
      push([
        sub.student?.displayName || '',
        sub.student?.username || '',
        sub.student?.email || '',
        sub.student?.college || '',
        sub.status || '',
        sub.driveLink || '',
        new Date(sub.submittedAt).toLocaleString(),
        sub.feedback || ''
      ]);
    }
    for (const s of assignment.notSubmitted || []) {
      push([s.displayName || '', s.username || '', s.email || '', s.college || '', 'NOT SUBMITTED', '', '', '']);
    }
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, '_')}_submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}><Loader text="LOADING ASSIGNMENT..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><p style={{ color: '#dc2626', fontWeight: 700 }}>{error}</p></div>;
  if (!assignment) return <div style={{ padding: 'var(--space-xl)' }}><p style={{ color: TXT3 }}>Assignment not found.</p></div>;

  const ed = new Date(assignment.endDate);
  const endOfEndDate = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate() + 1);
  const isOverdue = endOfEndDate <= new Date();
  const submittedCount = assignment.submissions?.length || 0;
  const totalStudents = assignment.notSubmitted?.length + submittedCount || 0;
  const subRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>{assignment.title} — Assignment Detail — Coordinator — TheWebytes</title></Helmet>

      {/* ── Back & Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/coordinator/assignments"
            style={{ color: TXT2, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> Assignments
          </Link>
          <div style={{ width: 2, height: 28, background: B }} />
          <h1 style={{ fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: TXT, margin: 0 }}>
            <FileText size={24} /> {assignment.title}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={initEdit}
            style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '8px 16px',
              border: `2px solid ${B}`, cursor: 'pointer',
              background: 'var(--success-bg)', color: 'var(--success)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: SH(3)
            }}>
            <Pencil size={14} /> Edit
          </button>
          <button onClick={exportCSV}
            style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '8px 16px',
              border: `2px solid ${B}`, cursor: 'pointer',
              background: SURF, color: TXT,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: SH(3)
            }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Assignment Info Card ── */}
      <div style={{ ...CARD(), marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <div style={LABEL}>Status</div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px',
              border: `2px solid ${B}`,
              background: isOverdue && assignment.status === 'active' ? 'var(--error-bg)' :
                          assignment.status === 'active' ? 'var(--success-bg)' : TERT,
              color: isOverdue && assignment.status === 'active' ? 'var(--error)' :
                     assignment.status === 'active' ? 'var(--success)' : TXT3
            }}>
              {isOverdue && assignment.status === 'active' ? 'OVERDUE' : assignment.status.toUpperCase()}
            </span>
          </div>
          <div>
            <div style={LABEL}>Batch</div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: TXT, display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={14} /> {assignment.batch?.name || '—'} ({assignment.batch?.code || '—'})
            </div>
          </div>
          <div>
            <div style={LABEL}>Created By</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: TXT }}>
              {assignment.createdBy?.displayName || assignment.createdBy?.username || '—'}
            </div>
          </div>
          <div>
            <div style={LABEL}>Date Range</div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: TXT, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> {new Date(assignment.startDate).toLocaleDateString()} — {new Date(assignment.endDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.6rem', color: TXT3, marginTop: 2 }}>
              Deadline: {new Date(ed).toLocaleDateString()} at 11:59 PM
            </div>
          </div>
        </div>

        {/* Instructions */}
        {assignment.instructions && (
          <div style={{ marginTop: 16, borderTop: `2px solid ${B}`, paddingTop: 16 }}>
            <div style={LABEL}>Instructions</div>
            <p style={{ fontSize: '0.85rem', color: TXT2, whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: '4px 0 0' }}>
              {assignment.instructions}
            </p>
          </div>
        )}

        {/* Attachment */}
        {assignment.attachmentLink && (
          <div style={{ marginTop: 12 }}>
            <a href={assignment.attachmentLink} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '8px 14px',
                border: `2px solid ${B}`, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: SURF, color: TXT, textDecoration: 'none'
              }}>
              <ExternalLink size={14} /> View Attachment Material
            </a>
          </div>
        )}
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { icon: Users, label: 'Total Students', value: totalStudents, color: TXT, desc: 'All students in this batch' },
          { icon: Send, label: 'Submitted', value: submittedCount, color: subRate >= 80 ? 'var(--success)' : subRate >= 50 ? 'var(--warning)' : 'var(--error)', desc: `${subRate}% submission rate` },
          { icon: CheckCircle, label: 'Approved', value: assignment.submissions?.filter(s => s.status === 'approved').length || 0, color: 'var(--success)', desc: 'Accepted submissions' },
          { icon: XCircle, label: 'Rejected', value: assignment.submissions?.filter(s => s.status === 'rejected').length || 0, color: 'var(--error)', desc: 'Needs resubmission' },
          { icon: AlertCircle, label: 'Not Submitted', value: assignment.notSubmitted?.length || 0, color: assignment.notSubmitted?.length > 0 ? 'var(--error)' : 'var(--success)', desc: 'Pending submissions' },
          { icon: Clock, label: 'Status', value: isOverdue ? 'Overdue' : (assignment.status === 'active' ? 'Active' : assignment.status), color: isOverdue ? 'var(--error)' : assignment.status === 'active' ? 'var(--success)' : TXT3, desc: `Started ${new Date(assignment.startDate).toLocaleDateString()} · Deadline: ${new Date(ed).toLocaleDateString()} at 11:59 PM` },
        ].map((s, i) => {
          const SI = s.icon;
          return (
            <div key={i} style={{ border: `2px solid ${B}`, padding: '12px 14px', background: TERT, textAlign: 'center', boxShadow: SH(3) }}>
              <SI size={16} style={{ color: s.color, marginBottom: 4 }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: TXT3 }}>{s.label}</div>
              <div style={{ fontSize: '0.5rem', color: TXT3, marginTop: 1 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: TXT3 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, college..."
            style={{
              width: '100%', padding: '8px 10px 8px 30px', border: `2px solid ${B}`,
              background: SURF, color: TXT, fontSize: '0.82rem', fontFamily: 'inherit'
            }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{
            fontSize: '0.72rem', padding: '6px 10px', border: `2px solid ${B}`,
            background: SURF, color: TXT, fontFamily: 'inherit'
          }}>
          <option value="all">All Students</option>
          <option value="submitted">Submitted</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="approved">Approved ✓</option>
          <option value="rejected">Rejected ✗</option>
        </select>
        <span style={{ fontSize: '0.65rem', color: TXT2 }}>
          Showing {mergedList.length} of {assignment.submissions?.length + assignment.notSubmitted?.length || 0}
        </span>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {pendingCount > 0 && (
        <div style={{
          display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center',
          padding: '10px 16px', border: `3px solid ${B}`,
          background: TERT, boxShadow: SH(4), borderLeft: `6px solid var(--warning)`
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: TXT, flex: 1 }}>
            {pendingCount} submission{pendingCount > 1 ? 's' : ''} pending review
          </span>
          <input
            value={bulkFeedback}
            onChange={e => setBulkFeedback(e.target.value)}
            placeholder="Feedback for all (optional)"
            style={{
              flex: 1, minWidth: 150, padding: '6px 10px',
              border: `2px solid ${B}`, fontSize: '0.72rem',
              background: SURF, color: TXT, fontFamily: 'inherit'
            }}
          />
          <button onClick={() => handleBulkGrade('approved')} disabled={bulking}
            style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '6px 14px',
              border: `2px solid var(--success)`, cursor: 'pointer',
              background: 'var(--success-bg)', color: 'var(--success)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              opacity: bulking ? 0.6 : 1, whiteSpace: 'nowrap'
            }}>
            <CheckCircle size={12} /> Approve All
          </button>
          <button onClick={() => handleBulkGrade('rejected')} disabled={bulking}
            style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '6px 14px',
              border: `2px solid var(--error)`, cursor: 'pointer',
              background: 'var(--error-bg)', color: 'var(--error)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              opacity: bulking ? 0.6 : 1, whiteSpace: 'nowrap'
            }}>
            <XCircle size={12} /> Reject All
          </button>
        </div>
      )}

      {/* ── Remove All Submissions (visible whenever there are submissions) ── */}
      {assignment.submissions?.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={handleRemoveAll}
            style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '6px 14px',
              border: `2px solid var(--error)`, cursor: 'pointer',
              background: 'var(--error-bg)', color: 'var(--error)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              whiteSpace: 'nowrap'
            }}>
            <Trash2 size={12} /> Remove All Submissions ({assignment.submissions.length})
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/*  SINGLE-COLUMN LAYOUT with filter              */}
      {/* ═══════════════════════════════════════════════ */}
      <div style={{ border: `3px solid ${B}`, boxShadow: SH(6), background: SURF, overflow: 'hidden' }}>
        <div style={{
          background: TERT, padding: '12px 16px', borderBottom: `2px solid ${B}`,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Users size={16} />
          <h2 style={{ fontSize: '0.9rem', fontWeight: 900, margin: 0, color: TXT, flex: 1 }}>
            All Students ({mergedList.length})
          </h2>
        </div>

        {mergedList.length === 0 ? (
          <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: TXT3, fontSize: '0.82rem' }}>
            {search ? 'No students match your search.' : 'No students in this batch.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {mergedList.map((item, idx) => {
              const isPending = item._status === 'submitted';
              const isApproved = item._status === 'approved';
              const isRejected = item._status === 'rejected';
              const isNotSubmitted = item._status === 'not_submitted';

              return (
                <div key={item._key} style={{
                  borderBottom: idx < mergedList.length - 1 ? `1px solid ${B}` : 'none',
                  background: isApproved ? 'var(--success-bg)' : isRejected ? 'var(--error-bg)' : isNotSubmitted ? TERT : idx % 2 === 0 ? SURF : TERT
                }}>
                  {/* Student row */}
                  <div style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{
                      width: 36, height: 36, flexShrink: 0, border: `2px solid ${isNotSubmitted ? 'var(--error)' : B}`,
                      background: isNotSubmitted ? 'var(--error-bg)' : TERT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, overflow: 'hidden'
                    }}>
                      {item.student?.avatar ? (
                        <img src={item.student.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (item.student?.displayName || item.student?.username || '?')[0]
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: TXT }}>
                        {item.student?.displayName || item.student?.username || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: TXT2, display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                        <Mail size={10} /> {item.student?.email || 'No email'}
                      </div>
                      {item.student?.college && (
                        <div style={{ fontSize: '0.62rem', color: TXT3, display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                          <GraduationCap size={10} /> {item.student.college}
                        </div>
                      )}
                      {item.submittedAt && (
                        <div style={{ fontSize: '0.62rem', color: TXT2, marginTop: 2 }}>
                          Submitted: {new Date(item.submittedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                      {item.driveLink ? (
                        <a href={item.driveLink} target="_blank" rel="noopener noreferrer"
                          style={{
                            fontSize: '0.6rem', fontWeight: 600, padding: '4px 10px',
                            border: `2px solid ${B}`, textDecoration: 'none', color: TXT,
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            background: SURF, whiteSpace: 'nowrap'
                          }}>
                          <ExternalLink size={10} /> View Link
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.55rem', color: TXT3, fontStyle: 'italic' }}>No link</span>
                      )}
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
                        padding: '2px 8px', border: `2px solid ${B}`,
                        background: isApproved ? 'var(--success-bg)' : isRejected ? 'var(--error-bg)' : isNotSubmitted ? 'var(--error-bg)' : TERT,
                        color: isApproved ? 'var(--success)' : isRejected ? 'var(--error)' : isNotSubmitted ? 'var(--error)' : TXT3
                      }}>
                        {isNotSubmitted ? 'Not Submitted' : item._status}
                      </span>
                      {!isNotSubmitted && (
                        <button onClick={() => handleRemoveSubmission(item.submissionId, item.student?.displayName || item.student?.username || 'this student')}
                          title="Remove submission (student must resubmit)"
                          style={{
                            fontSize: '0.5rem', fontWeight: 700, padding: '3px 6px',
                            border: `2px solid var(--error)`, cursor: 'pointer',
                            background: 'var(--error-bg)', color: 'var(--error)',
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            whiteSpace: 'nowrap'
                          }}>
                          <Trash2 size={9} /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grade actions for pending submissions */}
                  {isPending && (
                    <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        value={gradingId === item.submissionId ? feedbackInput : ''}
                        onChange={e => { setGradingId(item.submissionId); setFeedbackInput(e.target.value); }}
                        onFocus={() => { setGradingId(item.submissionId); setFeedbackInput(item.feedback || ''); }}
                        placeholder="Feedback (optional)"
                        style={{
                          flex: 1, minWidth: 120, padding: '4px 8px',
                          border: `2px solid ${B}`, fontSize: '0.68rem',
                          background: SURF, color: TXT, fontFamily: 'inherit'
                        }}
                      />
                      <button onClick={() => handleGrade(item.submissionId, 'approved')} disabled={isGrading}
                        style={{
                          fontSize: '0.55rem', fontWeight: 700, padding: '4px 10px',
                          border: `2px solid var(--success)`, cursor: 'pointer',
                          background: 'var(--success-bg)', color: 'var(--success)',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          opacity: isGrading ? 0.6 : 1
                        }}>
                        <CheckCircle size={10} /> Approve
                      </button>
                      <button onClick={() => handleGrade(item.submissionId, 'rejected')} disabled={isGrading}
                        style={{
                          fontSize: '0.55rem', fontWeight: 700, padding: '4px 10px',
                          border: `2px solid var(--error)`, cursor: 'pointer',
                          background: 'var(--error-bg)', color: 'var(--error)',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          opacity: isGrading ? 0.6 : 1
                        }}>
                        <XCircle size={10} /> Reject
                      </button>
                    </div>
                  )}

                  {/* Show existing feedback for graded submissions */}
                  {item.feedback && !isPending && (
                    <div style={{ padding: '0 14px 10px', marginTop: -4 }}>
                      <div style={{
                        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                        color: isRejected ? 'var(--error)' : 'var(--success)', marginBottom: 2
                      }}>
                        Feedback: {isRejected ? 'Revision Needed' : 'Accepted'}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: TXT2, margin: 0, lineHeight: 1.5 }}>{item.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Assignment Modal ── */}
      {showEditModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div style={{
            background: SURF, border: `3px solid ${B}`,
            boxShadow: '8px 8px 0 var(--shadow-color)',
            padding: 'var(--space-lg)', maxWidth: 600, width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 20, color: TXT, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pencil size={22} /> Edit Assignment
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Title *
                </label>
                <input className="input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Week 1 DSA Assignment"
                  style={{ width: '100%', fontSize: '0.92rem', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Instructions
                </label>
                <textarea className="input" value={editForm.instructions} onChange={e => setEditForm(f => ({ ...f, instructions: e.target.value }))}
                  placeholder="Detailed instructions for students..."
                  rows={5} style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Attachment Link
                </label>
                <input className="input" value={editForm.attachmentLink} onChange={e => setEditForm(f => ({ ...f, attachmentLink: e.target.value }))}
                  placeholder="https://docs.google.com/..."
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Batch <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                </label>
                <select className="input" value={editForm.batchId}
                  onChange={e => setEditForm(f => ({ ...f, batchId: e.target.value }))}
                  style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }}>
                  <option value="">Select a batch...</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                    Start Date *
                  </label>
                  <input type="date" className="input" value={editForm.startDate}
                    onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                    style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                    End Date *
                  </label>
                  <input type="date" className="input" value={editForm.endDate}
                    onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                    style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Status
                </label>
                <select className="input" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }}>
                  <option value="draft">Draft (hidden from students)</option>
                  <option value="active">Active (visible to students + notifications)</option>
                </select>
              </div>

              {editError && <p style={{ color: 'var(--error-text)', fontSize: '0.85rem', fontWeight: 600 }}>{editError}</p>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setShowEditModal(false)}
                  style={{
                    fontSize: '0.82rem', fontWeight: 700, padding: '10px 20px',
                    border: `2px solid ${B}`, cursor: 'pointer',
                    background: TERT, color: TXT
                  }}>
                  Cancel
                </button>
                <button onClick={handleEditSave} disabled={editSaving}
                  style={{
                    fontSize: '0.82rem', fontWeight: 700, padding: '10px 20px',
                    border: `2px solid ${B}`, cursor: 'pointer',
                    background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                    opacity: editSaving ? 0.6 : 1
                  }}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
