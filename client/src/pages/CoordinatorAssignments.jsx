import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAssignmentStore } from '../stores/useAssignmentStore.js';
import { apiRequest } from '../api/client.js';
import { getIstNextDayStart } from '../utils/date.js';
import Loader from '../components/ui/Loader.jsx';
import {
  FileText, Plus, Pencil, Trash2, ArrowLeft, ExternalLink,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users,
  BookOpen, Send, ChevronDown, ChevronUp, Download
} from 'lucide-react';

const B = 'var(--border-color)';
const TXT = 'var(--text-primary)';
const TXT2 = 'var(--text-secondary)';
const TXT3 = 'var(--text-tertiary)';
const SURF = 'var(--bg-surface)';
const TERT = 'var(--bg-tertiary)';

export default function CoordinatorAssignments() {
  const { assignments, loading, fetchAssignments, createAssignment, updateAssignment, deleteAssignment } = useAssignmentStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchFilter, setBatchFilter] = useState('');
  const [form, setForm] = useState({
    title: '', instructions: '', attachmentLink: '', batchId: '',
    startDate: '', endDate: '', status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    console.log('[ASSIGN FORM] useEffect fired — batchFilter:', batchFilter);
    fetchAssignments(batchFilter);
    console.log('[ASSIGN FORM] Fetching batches from /coordinator/batches...');
    apiRequest('/coordinator/batches')
      .then(r => {
        console.log('[ASSIGN FORM] ✅ Batches fetched:', r.data?.length, 'batches');
        setBatches(r.data || []);
      })
      .catch(err => {
        console.log('[ASSIGN FORM] ❌ Batches fetch FAILED:', err.message);
        /* Silently fail — batches stay empty */
      });
  }, [batchFilter]);

  const resetForm = () => {
    setForm({ title: '', instructions: '', attachmentLink: '', batchId: '', startDate: '', endDate: '', status: 'active' });
    setFormError('');
    setShowCreate(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    console.log('[ASSIGN FORM] handleSubmit called with form:', { ...form });
    console.log('[ASSIGN FORM] Validation check:', { 
      title: !!form.title, batchId: !!form.batchId, 
      startDate: !!form.startDate, endDate: !!form.endDate,
      editingId: !!editingId, saving
    });
    
    /* Build a specific error message showing which fields are empty */
    const missingFields = [];
    if (!form.title) missingFields.push('Title');
    if (!form.startDate) missingFields.push('Start Date');
    if (!form.endDate) missingFields.push('End Date');
    
    if (missingFields.length > 0) {
      console.log('[ASSIGN FORM] ❌ Validation FAILED — missing fields:', missingFields.join(', '));
      setFormError(`Required fields missing: ${missingFields.join(', ')}`);
      return;
    }
    console.log('[ASSIGN FORM] ✅ Validation PASSED — calling API...');
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        console.log('[ASSIGN FORM] Calling updateAssignment with id:', editingId);
        await updateAssignment(editingId, form);
      } else {
        console.log('[ASSIGN FORM] Calling createAssignment...');
        await createAssignment(form);
      }
      console.log('[ASSIGN FORM] ✅ API call succeeded — resetting form');
      resetForm();
    } catch (err) {
      console.log('[ASSIGN FORM] ❌ API call FAILED:', err.message, err);
      setFormError(err.message || 'Failed to save');
    }
    console.log('[ASSIGN FORM] Setting saving=false');
    setSaving(false);
  };

  const handleEdit = (a) => {
    setForm({
      title: a.title,
      instructions: a.instructions || '',
      attachmentLink: a.attachmentLink || '',
      batchId: a.batch?._id || '',
      startDate: new Date(a.startDate).toISOString().split('T')[0],
      endDate: new Date(a.endDate).toISOString().split('T')[0],
      status: a.status
    });
    setEditingId(a._id);
    setShowCreate(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment and all submissions?')) return;
    try {
      await deleteAssignment(id);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const loadDetail = async (a) => {
    if (expandedId === a._id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(a._id);
    setDetailLoading(true);
    try {
      const res = await apiRequest(`/coordinator/assignments/${a._id}`);
      setDetail(res.data);
    } catch (err) {
      setDetail(null);
    }
    setDetailLoading(false);
  };

  const handleGrade = async (submissionId, status, feedback) => {
    try {
      await apiRequest(`/coordinator/assignments/${detail._id}/submissions/${submissionId}`, {
        method: 'PUT', body: JSON.stringify({ status, feedback })
      });
      loadDetail(detail);
    } catch (err) {
      alert(err.message || 'Failed to grade');
    }
  };

  const now = new Date();

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>Assignments — Coordinator — TheWebytes</title></Helmet>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, marginBottom: 24,
        borderBottom: `3px solid ${B}`, paddingBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/coordinator/dashboard" style={{ color: TXT2, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div style={{ width: 2, height: 28, background: B }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, color: TXT }}>
            <FileText size={28} /> Assignments
          </h1>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }}
          style={{
            fontSize: '0.82rem', fontWeight: 700, padding: '10px 22px',
            border: `3px solid ${B}`, cursor: 'pointer',
            background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '4px 4px 0 var(--shadow-color)'
          }}>
          <Plus size={18} /> New Assignment
        </button>
      </div>

      {/* Filter by batch */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: TXT3, textTransform: 'uppercase' }}>Filter:</span>
        <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
          style={{
            fontSize: '0.85rem', padding: '6px 12px', border: `2px solid ${B}`,
            background: SURF, color: TXT, fontFamily: 'inherit'
          }}>
          <option value="">All batches</option>
          {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </div>

      {/* Create / Edit Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={e => { if (e.target === e.currentTarget) resetForm(); }}>
          <div style={{
            background: SURF, border: `3px solid ${B}`,
            boxShadow: '8px 8px 0 var(--shadow-color)',
            padding: 'var(--space-lg)', maxWidth: 600, width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 20, color: TXT }}>
              {editingId ? 'Edit Assignment' : 'Create Assignment'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Title *
                </label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Week 1 DSA Assignment" style={{ width: '100%', fontSize: '0.92rem', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Instructions
                </label>
                <textarea className="input" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  placeholder="Detailed instructions for students..."
                  rows={5} style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Attachment Link <span style={{ fontWeight: 400, textTransform: 'none' }}>(Google Drive / PPT / PDF / DOC link)</span>
                </label>
                <input className="input" value={form.attachmentLink} onChange={e => setForm(f => ({ ...f, attachmentLink: e.target.value }))}
                  placeholder="https://docs.google.com/..." style={{ width: '100%', fontSize: '0.88rem', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Batch <span style={{ fontWeight: 400, textTransform: 'none', color: TXT3 }}>(optional — can be set later)</span>
                </label>
                <select className="input" value={form.batchId} 
                  onChange={e => {
                    console.log('[ASSIGN FORM] Batch select onChange fired — value:', e.target.value, '| type:', typeof e.target.value);
                    console.log('[ASSIGN FORM] Available batch options:', batches.map(b => ({ id: b._id, name: b.name })));
                    setForm(f => ({ ...f, batchId: e.target.value }));
                  }}
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
                  <input type="date" className="input" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                    End Date *
                  </label>
                  <input type="date" className="input" value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: TXT3 }}>
                  Status
                </label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.88rem', padding: '10px 12px' }}>
                  <option value="draft">Draft (hidden from students)</option>
                  <option value="active">Active (visible to students + notifications sent)</option>
                </select>
              </div>

              {formError && <p style={{ color: 'var(--error-text)', fontSize: '0.85rem', fontWeight: 600 }}>{formError}</p>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button onClick={resetForm}
                  style={{
                    fontSize: '0.82rem', fontWeight: 700, padding: '10px 20px',
                    border: `2px solid ${B}`, cursor: 'pointer',
                    background: TERT, color: TXT
                  }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving}
                  style={{
                    fontSize: '0.82rem', fontWeight: 700, padding: '10px 20px',
                    border: `2px solid ${B}`, cursor: 'pointer',
                    background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                    opacity: saving ? 0.6 : 1
                  }}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment List */}
      {loading ? (
        <Loader text="LOADING ASSIGNMENTS..." />
      ) : assignments.length === 0 ? (
        <div style={{
          border: `3px solid ${B}`, padding: 'var(--space-xl)', textAlign: 'center',
          background: SURF, boxShadow: '6px 6px 0 var(--shadow-color)'
        }}>
          <FileText size={48} style={{ color: TXT3, marginBottom: 12 }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TXT, marginBottom: 8 }}>No Assignments Yet</h2>
          <p style={{ fontSize: '0.85rem', color: TXT2, marginBottom: 16 }}>
            Create your first assignment for a batch. Students will be notified and can submit their Google Drive links.
          </p>
          <button onClick={() => { resetForm(); setShowCreate(true); }}
            style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '10px 24px',
              border: `3px solid ${B}`, cursor: 'pointer',
              background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map(a => {
            const isActive = a.status === 'active';
            /* IST-safe: deadline = end-of-day IST of endDate */
            const endOfEndDate = getIstNextDayStart(a.endDate);
            const isOverdue = endOfEndDate <= now;
            const stats = a._submissionStats || {};
            const subRate = stats.totalStudents > 0 ? Math.round((stats.total / stats.totalStudents) * 100) : 0;

            return (                <div key={a._id} style={{
                border: `3px solid ${B}`, background: SURF,
                boxShadow: '6px 6px 0 var(--shadow-color)',
                overflow: 'hidden'
              }}>
                {/* Card Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 22px', cursor: 'pointer',
                  borderBottom: expandedId === a._id ? `2px solid ${B}` : 'none',
                  background: TERT
                }} onClick={() => loadDetail(a)}>
                  <div style={{
                    width: 48, height: 48, flexShrink: 0,
                    border: `3px solid ${B}`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: isActive ? (isOverdue ? 'var(--error-bg)' : 'var(--success-bg)') : TERT
                  }}>
                    <FileText size={24} style={{ color: isActive ? (isOverdue ? 'var(--error)' : 'var(--success)') : TXT3 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: TXT, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {a.title}
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                        padding: '3px 10px', border: `2px solid ${B}`,
                        background: isActive ? (isOverdue ? 'var(--error-bg)' : 'var(--success-bg)') : TERT,
                        color: isActive ? (isOverdue ? 'var(--error)' : 'var(--success)') : TXT3
                      }}>
                        {isOverdue && isActive ? 'Overdue' : a.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: TXT2, marginTop: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <BookOpen size={14} /> {a.batch?.name || '—'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} /> {new Date(a.startDate).toLocaleDateString()} — {new Date(a.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} /> {stats.total} / {stats.totalStudents} submitted ({subRate}%)
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); loadDetail(a); }}
                      style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '7px 14px',
                        border: `2px solid ${B}`, cursor: 'pointer',
                        background: SURF, color: TXT,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        whiteSpace: 'nowrap'
                      }}>
                      {expandedId === a._id ? '▲' : '▼'} Submissions ({stats.total}/{stats.totalStudents})
                    </button>
                    <Link to={`/coordinator/assignments/${a._id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '7px 14px',
                        border: `2px solid ${B}`, cursor: 'pointer',
                        background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5,
                        whiteSpace: 'nowrap'
                      }}>
                      Full Details →
                    </Link>
                    <button onClick={e => { e.stopPropagation(); handleEdit(a); }}
                      style={{
                        background: SURF, border: `2px solid ${B}`, padding: '6px 10px',
                        cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        color: TXT
                      }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(a._id); }}
                      style={{
                        background: 'var(--error-bg)', border: `2px solid var(--error)`, padding: '6px 10px',
                        cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700,
                        color: 'var(--error)', display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === a._id && (
                  <div style={{ padding: 'var(--space-md)' }}>
                    {detailLoading ? (
                      <Loader text="Loading details..." />
                    ) : detail ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Instructions + Attachment */}
                        {detail.instructions && (
                          <div style={{ border: `2px solid ${B}`, padding: 14, background: TERT }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: TXT3, marginBottom: 6 }}>Instructions</div>
                            <p style={{ fontSize: '0.9rem', color: TXT, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{detail.instructions}</p>
                          </div>
                        )}
                        {detail.attachmentLink && (
                          <a href={detail.attachmentLink} target="_blank" rel="noopener noreferrer"
                            style={{
                              fontSize: '0.82rem', fontWeight: 700, padding: '10px 16px',
                              border: `2px solid ${B}`, display: 'inline-flex', alignItems: 'center', gap: 8,
                              background: SURF, color: TXT, textDecoration: 'none', width: 'fit-content'
                            }}>
                            <ExternalLink size={16} /> View Attachment
                          </a>
                        )}

                        {/* Submissions Section — single column with filter */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: TXT, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                              <Users size={20} /> All Students
                            </h3>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                              style={{
                                fontSize: '0.75rem', padding: '6px 10px', border: `2px solid ${B}`,
                                background: SURF, color: TXT, fontFamily: 'inherit', marginLeft: 'auto'
                              }}>
                              <option value="all">All</option>
                              <option value="submitted">Submitted</option>
                              <option value="not_submitted">Not Submitted</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          {(() => {
                            /* Merge and filter submissions + notSubmitted */
                            const allItems = [
                              ...(detail.submissions || []).map(s => ({ ...s, _type: 'submission', _status: s.status })),
                              ...(detail.notSubmitted || []).map(s => ({ _key: `ns-${s._id}`, student: s, _type: 'not_submitted', _status: 'not_submitted', driveLink: null, feedback: null }))
                            ];
                            /* 'submitted' = has any submission (pending/approved/rejected) */
                            const filtered = filterStatus === 'all' ? allItems
                              : filterStatus === 'submitted' ? allItems.filter(i => i._status !== 'not_submitted')
                              : filterStatus === 'not_submitted' ? allItems.filter(i => i._status === 'not_submitted')
                              : filterStatus === 'approved' ? allItems.filter(i => i._status === 'approved')
                              : filterStatus === 'rejected' ? allItems.filter(i => i._status === 'rejected')
                              : allItems;

                            if (filtered.length === 0) {
                              return <p style={{ fontSize: '0.78rem', color: TXT3, textAlign: 'center', padding: 'var(--space-md)' }}>No students match the filter.</p>;
                            }

                            return filtered.map((item, idx) => {
                              const isNotSub = item._status === 'not_submitted';
                              const isPending = item._status === 'submitted';
                              const isApproved = item._status === 'approved';
                              const isRejected = item._status === 'rejected';
                              const subId = item._id;

                              return (
                                <div key={subId || item._key} style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '10px 14px', border: `2px solid ${B}`,
                                  background: isApproved ? 'var(--success-bg)' : isRejected ? 'var(--error-bg)' : isNotSub ? TERT : SURF,
                                  flexWrap: 'wrap', marginBottom: 6
                                }}>
                                  <div style={{
                                    width: 34, height: 34, flexShrink: 0,
                                    background: TERT, border: `2px solid ${isNotSub ? 'var(--error)' : B}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700
                                  }}>
                                    {(item.student?.displayName || item.student?.username || '?')[0]}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 150 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: TXT }}>
                                      {item.student?.displayName || item.student?.username || 'Unknown'}
                                    </div>
                                    {item.submittedAt && (
                                      <div style={{ fontSize: '0.72rem', color: TXT2 }}>
                                        Submitted: {new Date(item.submittedAt).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                  {item.driveLink ? (
                                    <a href={item.driveLink} target="_blank" rel="noopener noreferrer"
                                      style={{
                                        fontSize: '0.72rem', fontWeight: 600, padding: '6px 12px',
                                        border: `2px solid ${B}`, textDecoration: 'none', color: TXT,
                                        display: 'inline-flex', alignItems: 'center', gap: 4
                                      }}>
                                      <ExternalLink size={13} /> View
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', color: TXT3, fontStyle: 'italic' }}>—</span>
                                  )}
                                  <span style={{
                                    fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                                    padding: '3px 10px', border: `2px solid ${B}`,
                                    background: isApproved ? 'var(--success-bg)' : isRejected ? 'var(--error-bg)' : isNotSub ? 'var(--error-bg)' : TERT,
                                    color: isApproved ? 'var(--success)' : isRejected ? 'var(--error)' : isNotSub ? 'var(--error)' : TXT3
                                  }}>
                                    {isNotSub ? 'Not Submitted' : item._status}
                                  </span>
                                  {isPending && (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button onClick={() => handleGrade(subId, 'approved', item.feedback || '')}
                                        style={{
                                          fontSize: '0.62rem', fontWeight: 700, padding: '5px 10px',
                                          border: `2px solid var(--success)`, cursor: 'pointer',
                                          background: 'var(--success-bg)', color: 'var(--success)'
                                        }}>
                                        <CheckCircle size={12} /> Approve
                                      </button>
                                      <button onClick={() => {
                                        const fb = prompt('Feedback for rejection (optional):', item.feedback || '');
                                        if (fb !== null) handleGrade(subId, 'rejected', fb);
                                      }                                      }
                                        style={{
                                          fontSize: '0.62rem', fontWeight: 700, padding: '5px 10px',
                                          border: `2px solid var(--error)`, cursor: 'pointer',
                                          background: 'var(--error-bg)', color: 'var(--error)'
                                        }}>
                                        <XCircle size={12} /> Reject
                                      </button>
                                    </div>
                                  )}
                                  {item.feedback && !isPending && (
                                    <div style={{ fontSize: '0.78rem', color: TXT2, width: '100%', marginTop: 6, borderTop: `1px solid ${B}`, paddingTop: 6 }}>
                                      <strong>Feedback:</strong> {item.feedback}
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: TXT3, textAlign: 'center' }}>Failed to load details.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
