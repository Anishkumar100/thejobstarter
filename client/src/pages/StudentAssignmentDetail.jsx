import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAssignmentStore } from '../stores/useAssignmentStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import { getIstDayStart, getIstNextDayStart } from '../utils/date.js';
import Loader from '../components/ui/Loader.jsx';
import {
  FileText, Calendar, Clock, ExternalLink, Send,
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Edit3
} from 'lucide-react';

const B = 'var(--border-color)';
const TXT = 'var(--text-primary)';
const TXT2 = 'var(--text-secondary)';
const TXT3 = 'var(--text-tertiary)';
const SURF = 'var(--bg-surface)';
const TERT = 'var(--bg-tertiary)';

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const { currentAssignment, studentLoading, fetchStudentAssignmentById, submitAssignment, updateSubmission } = useAssignmentStore();
  const toast = useToastStore();
  const [driveLink, setDriveLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentAssignmentById(id);
  }, [id]);

  useEffect(() => {
    if (currentAssignment?._submission?.driveLink) {
      setDriveLink(currentAssignment._submission.driveLink);
    }
  }, [currentAssignment?._submission?.driveLink]);

  const a = currentAssignment;
  if (studentLoading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING..." /></div>;
  if (!a) return <div style={{ padding: 'var(--space-xl)' }}><p style={{ color: TXT3 }}>Assignment not found.</p></div>;

  const now = new Date();
  /* IST-safe window: opens at IST midnight of startDate, deadline = end-of-day IST of endDate */
  const endOfEndDate = getIstNextDayStart(a.endDate);
  const startOfStartDate = getIstDayStart(a.startDate);
  const isActiveRange = now >= startOfStartDate && now < endOfEndDate;
  const isOverdue = now >= endOfEndDate;
  const hasSubmitted = !!a._submission;

  const handleSubmit = async () => {
    if (!driveLink.trim()) {
      setError('Please enter your Google Drive link');
      return;
    }
    if (!driveLink.includes('drive.google.com') && !driveLink.includes('docs.google.com')) {
      setError('Please enter a valid Google Drive or Docs link');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (hasSubmitted) {
        await updateSubmission(id, driveLink.trim());
        toast.success('Submission updated successfully!');
      } else {
        await submitAssignment(id, driveLink.trim());
        toast.success('Assignment submitted successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit');
      toast.error(err.message || 'Failed to submit');
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 800, margin: '0 auto' }}>
      <Helmet><title>{a.title} — Assignment — TheJobStarter</title></Helmet>

      <Link to="/assignments" style={{ color: TXT2, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', marginBottom: 16 }}>
        <ArrowLeft size={14} /> Back to assignments
      </Link>

      {/* Header */}
      <div style={{
        border: `3px solid ${B}`, padding: 'var(--space-lg)',
        background: SURF, boxShadow: '6px 6px 0 var(--shadow-color)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            width: 48, height: 48, flexShrink: 0,
            border: `3px solid ${B}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: isOverdue ? '#fef2f2' : hasSubmitted ? '#f0fdf4' : '#eff6ff'
          }}>
            <FileText size={24} style={{
              color: isOverdue ? '#dc2626' : hasSubmitted ? '#16a34a' : '#2563eb'
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: TXT, margin: 0 }}>
              {a.title}
            </h1>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: '0.78rem', color: TXT2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Calendar size={13} /> {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
              </span>
              <span style={{ fontSize: '0.62rem', color: TXT3, marginLeft: 4 }}>
                (Deadline: {endDate.toLocaleDateString()} at 11:59 PM)
              </span>
              <span style={{
                fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                padding: '3px 10px', border: `2px solid ${B}`,
                background: hasSubmitted ? '#f0fdf4' : isOverdue ? '#fef2f2' : isActiveRange ? '#eff6ff' : TERT,
                color: hasSubmitted ? '#16a34a' : isOverdue ? '#dc2626' : isActiveRange ? '#2563eb' : TXT3
              }}>
                {hasSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : isActiveRange ? 'Open' : 'Scheduled'}
              </span>
            </div>
          </div>
        </div>

        {/* Created by */}
        {a.createdBy && (
          <p style={{ fontSize: '0.72rem', color: TXT3, marginTop: 8 }}>
            Posted by: <strong>{a.createdBy.displayName || a.createdBy.username}</strong>
          </p>
        )}
      </div>

      {/* ═══ Deadline explanation ═══ */}
      <div style={{
        border: `3px solid ${B}`, padding: '10px 14px', marginBottom: 20,
        background: '#fffbeb', boxShadow: '4px 4px 0 var(--shadow-color)',
        display: 'flex', alignItems: 'flex-start', gap: 10
      }}>
        <Clock size={16} style={{ flexShrink: 0, color: '#92400e', marginTop: 1 }} />
        <div style={{ fontSize: '0.72rem', color: '#92400e', lineHeight: 1.6 }}>
          <strong>Deadline:</strong> {endDate.toLocaleDateString()} at <strong>11:59 PM</strong> —
          you have the full calendar day to submit.
        </div>
      </div>

      {/* Instructions */}
      {a.instructions && (
        <div style={{
          border: `3px solid ${B}`, padding: 'var(--space-md)',
          background: SURF, boxShadow: '4px 4px 0 var(--shadow-color)',
          marginBottom: 20
        }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: TXT, marginBottom: 8, textTransform: 'uppercase' }}>
            Instructions
          </h2>
          <div style={{ fontSize: '0.88rem', color: TXT, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {a.instructions}
          </div>
        </div>
      )}

      {/* Attachment Link */}
      {a.attachmentLink && (
        <div style={{ marginBottom: 20 }}>
          <a href={a.attachmentLink} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '10px 18px',
              border: `3px solid ${B}`, display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#eef2ff', color: '#4338ca', textDecoration: 'none',
              boxShadow: '4px 4px 0 var(--shadow-color)',
              transition: 'transform 0.12s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--shadow-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--shadow-color)'; }}>
            <ExternalLink size={16} /> View Assignment Material
          </a>
        </div>
      )}

      {/* Submission Section */}
      <div style={{
        border: `3px solid ${B}`, padding: 'var(--space-lg)',
        background: SURF, boxShadow: '6px 6px 0 var(--shadow-color)'
      }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: TXT, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Send size={18} /> Your Submission
        </h2>

        {hasSubmitted && (
          <div style={{
            border: `2px solid ${B}`, padding: 12, marginBottom: 16,
            background: a._submission.status === 'approved' ? 'var(--success-bg)' :
                        a._submission.status === 'rejected' ? 'var(--error-bg)' : TERT
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {a._submission.status === 'approved' ? (
                <CheckCircle size={16} color="var(--success)" />
              ) : a._submission.status === 'rejected' ? (
                <XCircle size={16} color="var(--error)" />
              ) : (
                <Clock size={16} color="var(--warning)" />
              )}
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: TXT }}>
                {a._submission.status === 'approved' ? 'Approved ✓' :
                 a._submission.status === 'rejected' ? 'Rejected — Resubmit Below' : 'Pending Review'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: TXT2, marginTop: 4 }}>
              Submitted: {new Date(a._submission.submittedAt).toLocaleString()}
            </p>
            {a._submission.feedback && (
              <div style={{ marginTop: 8, borderTop: `1px solid ${B}`, paddingTop: 8 }}>
                <strong style={{ fontSize: '0.72rem' }}>Feedback:</strong>
                <p style={{ fontSize: '0.78rem', color: TXT, marginTop: 2 }}>{a._submission.feedback}</p>
              </div>
            )}
            {a._submission.status === 'rejected' && (
              <p style={{
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--error)',
                marginTop: 8, borderTop: `1px solid ${B}`, paddingTop: 8
              }}>
                Your submission was rejected. Please review the feedback above, fix your work, and resubmit below.
              </p>
            )}
          </div>
        )}

        {isOverdue && !hasSubmitted ? (
          <div style={{
            border: `2px solid #dc2626`, padding: 16, textAlign: 'center',
            background: '#fef2f2', marginTop: 8
          }}>
            <AlertCircle size={24} color="#dc2626" />
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
              This assignment deadline has passed. Submissions are no longer accepted.
            </p>
          </div>
        ) : isActiveRange || hasSubmitted ? (
          <>
            <p style={{ fontSize: '0.78rem', color: TXT2, marginBottom: 12 }}>
              {hasSubmitted
                ? 'You can update your submission link below if the assignment is still open.'
                : `Submit your Google Drive link below. Make sure the link has sharing permissions set to "Anyone with the link can view".`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" className="input"
                value={driveLink}
                onChange={e => { setDriveLink(e.target.value); setError(''); }}
                placeholder="https://drive.google.com/file/d/..."
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
              {error && <p style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>{error}</p>}
              <button onClick={handleSubmit} disabled={saving}
                style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '10px 20px',
                  border: `3px solid ${B}`, cursor: 'pointer',
                  background: 'var(--bg-inverse)', color: 'var(--text-inverse)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  width: 'fit-content', opacity: saving ? 0.6 : 1,
                  boxShadow: '4px 4px 0 var(--shadow-color)',
                  transition: 'transform 0.12s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--shadow-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--shadow-color)'; }}>
                {hasSubmitted ? <Edit3 size={16} /> : <Send size={16} />}
                {saving ? 'Saving...' : hasSubmitted ? 'Update Submission' : 'Submit'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            border: `2px solid ${B}`, padding: 16, textAlign: 'center', background: TERT
          }}>
            <Clock size={24} color={TXT3} />
            <p style={{ fontSize: '0.85rem', color: TXT3, marginTop: 4 }}>
              This assignment opens on {startDate.toLocaleDateString()}. You'll be able to submit once it's open.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
