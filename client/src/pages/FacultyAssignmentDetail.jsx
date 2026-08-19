import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, Users, Clock, Trash2, Pencil, Save, X, AlertTriangle, FileText } from 'lucide-react';

const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };
const STATUS_STYLES = {
  /* Assignment-level statuses */
  draft: { bg: '#f3f4f6', text: '#4b5563' },
  active: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#dcfce7', text: '#166534' },
  /* Submission-level statuses */
  submitted: { bg: '#dbeafe', text: '#1e40af' },
  approved: { bg: '#dcfce7', text: '#166534' },
  rejected: { bg: '#fee2e2', text: '#991b1b' }
};

/*
 * FacultyAssignmentDetail — Review + grade submissions for one assignment.
 * Supports: edit details, delete, per-submission approve/reject with
 * feedback, and bulk-grade (approve/reject all pending submissions).
 */
export default function FacultyAssignmentDetail() {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackDraft, setFeedbackDraft] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchAssignment = () => {
    apiRequest(`/faculty/assignments/${id}`)
      .then(res => {
        console.log('[FACULTY] Assignment detail fetched:', res.data?.title);
        setAssignment(res.data);
        setEditForm({
          title: res.data.title || '',
          instructions: res.data.instructions || '',
          attachmentLink: res.data.attachmentLink || '',
          startDate: res.data.startDate ? res.data.startDate.slice(0, 10) : '',
          endDate: res.data.endDate ? res.data.endDate.slice(0, 10) : '',
          status: res.data.status || 'draft'
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssignment(); }, [id]);

  const grade = async (submissionId, status) => {
    setBusyId(submissionId);
    try {
      await apiRequest(`/faculty/assignments/${id}/submissions/${submissionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, feedback: feedbackDraft[submissionId] || '' })
      });
      console.log('[FACULTY] Submission graded:', status);
      /* Refetch the full detail — the grade response is just the submission doc */
      fetchAssignment();
      setFeedbackDraft(f => ({ ...f, [submissionId]: '' }));
    } catch (err) {
      console.error('[FACULTY] Grade failed:', err.message);
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const bulkGrade = async (status) => {
    setBulkBusy(true);
    try {
      const res = await apiRequest(`/faculty/assignments/${id}/bulk-grade`, {
        method: 'PUT',
        body: JSON.stringify({ status, feedback: bulkFeedback || '' })
      });
      console.log('[FACULTY] Bulk graded:', res.modifiedCount);
      setAssignment(res.data);
      setBulkFeedback('');
      window.alert(`Graded ${res.modifiedCount} pending submission(s) as ${status}.`);
    } catch (err) {
      console.error('[FACULTY] Bulk grade failed:', err.message);
      window.alert(err.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const body = { ...editForm };
      if (body.startDate) body.startDate = new Date(body.startDate).toISOString();
      if (body.endDate) body.endDate = new Date(body.endDate).toISOString();
      await apiRequest(`/faculty/assignments/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      console.log('[FACULTY] Assignment updated:', id);
      /* Refetch the full detail — the update response carries no submissions */
      fetchAssignment();
      setEditing(false);
    } catch (err) {
      console.error('[FACULTY] Update failed:', err.message);
      window.alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this assignment? All student submissions will also be deleted.')) return;
    try {
      await apiRequest(`/faculty/assignments/${id}`, { method: 'DELETE' });
      console.log('[FACULTY] Assignment deleted:', id);
      window.location.href = '/faculty/assignments';
    } catch (err) {
      console.error('[FACULTY] Delete failed:', err.message);
      window.alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading assignment..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;
  if (!assignment) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}><h2>Assignment not found</h2></div>;

  const submissions = assignment.submissions || [];
  const notSubmitted = assignment.notSubmitted || [];
  const pending = submissions.filter(s => s.status === 'submitted');
  const approved = submissions.filter(s => s.status === 'approved');
  const rejected = submissions.filter(s => s.status === 'rejected');
  const st = STATUS_STYLES[assignment.status] || STATUS_STYLES.draft;
  const totalStudents = submissions.length + notSubmitted.length;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
      <Helmet><title>{assignment.title} — Assignment — Faculty — TheWebytes</title></Helmet>

      <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <Link to="/faculty/assignments" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to Assignments
        </Link>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setEditing(e => !e)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '2px solid #000', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: 'var(--bg-surface)', boxShadow: '2px 2px 0 #000' }}>
            <Pencil size={13} /> {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '2px solid #000', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: '#fee2e2', color: '#991b1b', boxShadow: '2px 2px 0 #000' }}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* ═══ ASSIGNMENT HEADER / EDIT ═══ */}
      <div style={{ ...CARD, padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Title</label>
              <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.85rem', background: 'var(--bg-surface)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Instructions</label>
              <textarea value={editForm.instructions} onChange={e => setEditForm(f => ({ ...f, instructions: e.target.value }))} rows={3} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Attachment Link</label>
              <input value={editForm.attachmentLink} onChange={e => setEditForm(f => ({ ...f, attachmentLink: e.target.value }))} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Start Date</label>
                <input type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>End Date</label>
                <input type="date" value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.8rem', background: 'var(--bg-surface)' }}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
              <button onClick={() => setEditing(false)} style={{ border: '2px solid #000', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', background: 'var(--bg-surface)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={savingEdit} style={{ border: '3px solid #000', padding: '8px 16px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', background: '#000', color: '#fff', boxShadow: '3px 3px 0 #000', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Save size={14} /> {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>{assignment.title}</h1>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', border: '2px solid #000', background: st.bg, color: st.text }}>{assignment.status}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <Link to={`/faculty/batches/${assignment.batch?._id}`} style={{ fontWeight: 700 }}>{assignment.batch?.name || 'Unknown batch'}</Link>
                {' · '}{assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : '—'} → {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '—'}
              </div>
              {assignment.instructions && (
                <div style={{ marginTop: 10, padding: '10px 12px', border: '2px solid #000', background: 'var(--bg-tertiary)', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
                  {assignment.instructions}
                </div>
              )}
              {assignment.attachmentLink && (
                <a href={assignment.attachmentLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: '0.78rem', fontWeight: 700, border: '2px solid #000', padding: '6px 10px', background: '#dbeafe', boxShadow: '2px 2px 0 #000' }}>
                  <ExternalLink size={13} /> Open attachment
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '1rem', fontWeight: 900 }}>{submissions.length}<span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>/{totalStudents}</span></div>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}><Users size={10} /> Submitted</div>
              </div>
              <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#166534' }}>{approved.length}</div>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}><CheckCircle2 size={10} /> Approved</div>
              </div>
              <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e40af' }}>{pending.length}</div>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}><Clock size={10} /> Pending</div>
              </div>
              <div style={{ border: '2px solid #000', padding: '8px 12px', background: 'var(--bg-tertiary)', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#991b1b' }}>{rejected.length}</div>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}><XCircle size={10} /> Rejected</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BULK GRADE BAR ═══ */}
      {pending.length > 0 && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid #2563eb' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={15} /> Bulk Grade — {pending.length} pending submission{pending.length !== 1 ? 's' : ''}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Feedback (applied to all)</label>
              <input value={bulkFeedback} onChange={e => setBulkFeedback(e.target.value)} placeholder="Optional common feedback..." style={{ width: '100%', border: '2px solid #000', padding: '8px 10px', fontSize: '0.78rem', background: 'var(--bg-surface)' }} />
            </div>
            <button onClick={() => bulkGrade('approved')} disabled={bulkBusy} style={{ border: '3px solid #000', padding: '8px 14px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: '#dcfce7', color: '#166534', boxShadow: '3px 3px 0 #000', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={14} /> Approve All
            </button>
            <button onClick={() => bulkGrade('rejected')} disabled={bulkBusy} style={{ border: '3px solid #000', padding: '8px 14px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', background: '#fee2e2', color: '#991b1b', boxShadow: '3px 3px 0 #000', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <XCircle size={14} /> Reject All
            </button>
          </div>
        </div>
      )}

      {/* ═══ SUBMISSIONS ═══ */}
      <div style={{ ...CARD, marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={16} /> Submissions ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-lg)' }}>
            No submissions yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {submissions.map(s => {
              const sst = STATUS_STYLES[s.status] || STATUS_STYLES.submitted;
              const feedback = feedbackDraft[s._id] ?? s.feedback ?? '';
              return (
                <div key={s._id} style={{ border: '2px solid #000', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', boxShadow: '3px 3px 0 #000' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {s.student?.avatar ? (
                        <img src={s.student.avatar} alt="" style={{ width: 36, height: 36, border: '2px solid #000', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 36, height: 36, border: '2px solid #000', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={16} color="#fff" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{s.student?.displayName || s.student?.username || 'Unknown'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                          @{s.student?.username}{s.student?.college ? ` · ${s.student.college}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', border: '2px solid #000', background: sst.bg, color: sst.text }}>{s.status}</span>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                        Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <a href={s.driveLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 800, border: '2px solid #000', padding: '6px 10px', background: '#dbeafe', boxShadow: '2px 2px 0 #000' }}>
                      <ExternalLink size={13} /> View Submission
                    </a>
                    {s.status === 'submitted' && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                        <input
                          value={feedback}
                          onChange={e => setFeedbackDraft(f => ({ ...f, [s._id]: e.target.value }))}
                          placeholder="Feedback for this student..."
                          style={{ flex: 1, minWidth: 180, border: '2px solid #000', padding: '6px 10px', fontSize: '0.75rem', background: 'var(--bg-surface)' }}
                        />
                        <button onClick={() => grade(s._id, 'approved')} disabled={busyId === s._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '2px solid #000', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', background: '#dcfce7', color: '#166534', boxShadow: '2px 2px 0 #000' }}>
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button onClick={() => grade(s._id, 'rejected')} disabled={busyId === s._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '2px solid #000', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', background: '#fee2e2', color: '#991b1b', boxShadow: '2px 2px 0 #000' }}>
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {s.status !== 'submitted' && s.feedback && (
                    <div style={{ marginTop: 8, fontSize: '0.75rem', padding: '8px 10px', border: '2px dashed #000', background: 'var(--bg-surface)' }}>
                      <strong style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Feedback: </strong>{s.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ NOT SUBMITTED ═══ */}
      <div style={{ ...CARD, borderLeft: '6px solid #f59e0b' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} /> Not Submitted ({notSubmitted.length})
        </h2>
        {notSubmitted.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-md)' }}>
            Everyone in the batch has submitted. Nice work!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {notSubmitted.map(student => (
              <Link key={student._id} to={`/faculty/students/${student._id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', border: '1px solid #000', fontSize: '0.78rem' }}>
                <Users size={12} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 700 }}>{student.displayName || student.username}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>@{student.username}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}