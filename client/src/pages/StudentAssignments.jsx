import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAssignmentStore } from '../stores/useAssignmentStore.js';
import { getIstDayStart, getIstNextDayStart } from '../utils/date.js';
import Loader from '../components/ui/Loader.jsx';
import {
  FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ExternalLink, Send, ArrowLeft, ChevronRight, Eye
} from 'lucide-react';

const B = 'var(--border-color)';
const TXT = 'var(--text-primary)';
const TXT2 = 'var(--text-secondary)';
const TXT3 = 'var(--text-tertiary)';
const SURF = 'var(--bg-surface)';
const TERT = 'var(--bg-tertiary)';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const { studentAssignments, studentLoading, fetchStudentAssignments } = useAssignmentStore();

  useEffect(() => {
    fetchStudentAssignments();
  }, []);

  const now = new Date();

  const activeAssignments = studentAssignments.filter(a =>
    !a._submission && !a._isOverdue
  );
  const submittedAssignments = studentAssignments.filter(a => a._submission);
  const overdueAssignments = studentAssignments.filter(a =>
    !a._submission && a._isOverdue
  );

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1000, margin: '0 auto' }}>
      <Helmet><title>My Assignments — TheJobStarter</title></Helmet>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        borderBottom: `3px solid ${B}`, paddingBottom: 16
      }}>
        <Link to="/dashboard" style={{ color: TXT2, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <div style={{ width: 2, height: 28, background: B }} />
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, color: TXT }}>
          <FileText size={24} /> My Assignments
        </h1>
      </div>

      {/* ════════════════════════════════════════ */}
      {/*  TIME LOGIC EXPLANATION                  */}
      {/* ════════════════════════════════════════ */}
      <div style={{
        border: `3px solid ${B}`, padding: '12px 16px', marginBottom: 20,
        background: '#fffbeb', boxShadow: '4px 4px 0 var(--shadow-color)',
        display: 'flex', alignItems: 'flex-start', gap: 10
      }}>
        <Clock size={18} style={{ flexShrink: 0, color: '#92400e', marginTop: 1 }} />
        <div style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.6 }}>
          <strong>How Deadlines Work:</strong> All deadlines use <strong>calendar days</strong> (midnight to midnight).
          If a deadline shows July 30, you have until <strong>11:59 PM on July 30</strong> to submit — the full calendar day.
        </div>
      </div>

      {studentLoading ? (
        <Loader text="LOADING ASSIGNMENTS..." />
      ) : studentAssignments.length === 0 ? (
        <div style={{
          border: `3px solid ${B}`, padding: 'var(--space-xl)', textAlign: 'center',
          background: SURF, boxShadow: '6px 6px 0 var(--shadow-color)'
        }}>
          <FileText size={48} style={{ color: TXT3, marginBottom: 12 }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TXT, marginBottom: 8 }}>No Assignments Yet</h2>
          <p style={{ fontSize: '0.85rem', color: TXT2 }}>
            Your coaching centre hasn't posted any assignments yet. Check back later!
          </p>
        </div>
      ) : (
        <>
          {/* Active assignments */}
          {activeAssignments.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: TXT, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} style={{ color: '#2563eb' }} /> Pending ({activeAssignments.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeAssignments.map(a => (
                  <AssignmentCard key={a._id} assignment={a} now={now} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {/* Submitted */}
          {submittedAssignments.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: TXT, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} style={{ color: '#16a34a' }} /> Submitted ({submittedAssignments.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submittedAssignments.map(a => (
                  <AssignmentCard key={a._id} assignment={a} now={now} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {/* Overdue */}
          {overdueAssignments.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: TXT, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} style={{ color: '#dc2626' }} /> Overdue ({overdueAssignments.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdueAssignments.map(a => (
                  <AssignmentCard key={a._id} assignment={a} now={now} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AssignmentCard({ assignment: a, now, navigate }) {
  /* IST-safe window: opens at IST midnight of startDate, deadline = end-of-day IST of endDate */
  const endOfEndDate = getIstNextDayStart(a.endDate);
  const startOfStartDate = getIstDayStart(a.startDate);
  /* Display-friendly dates for the card header */
  const startDate = new Date(a.startDate);
  const endDate = new Date(a.endDate);
  const isOverdue = now >= endOfEndDate;
  const isActiveRange = now >= startOfStartDate && now < endOfEndDate;
  const hasSubmitted = !!a._submission;

  return (
    <div
      onClick={() => navigate(`/assignments/${a._id}`)}
      style={{
        border: `3px solid ${B}`, background: SURF,
        boxShadow: '4px 4px 0 var(--shadow-color)',
        padding: 'var(--space-md)', cursor: 'pointer',
        transition: 'transform 0.12s',
        borderLeft: `6px solid ${
          hasSubmitted ? '#16a34a' : isOverdue ? '#dc2626' : isActiveRange ? '#2563eb' : TXT3
        }`
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--shadow-color)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--shadow-color)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: TXT, margin: 0 }}>{a.title}</h3>
            {hasSubmitted && (
              <span style={{
                fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
                padding: '2px 8px', border: `2px solid #16a34a`,
                background: '#f0fdf4', color: '#16a34a'
              }}>
                {a._submission.status === 'approved' ? 'Approved ✓' :
                 a._submission.status === 'rejected' ? 'Rejected' : 'Submitted'}
              </span>
            )}
          </div>
          {a.instructions && (
            <p style={{ fontSize: '0.78rem', color: TXT2, margin: '4px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {a.instructions}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.68rem', color: TXT3, marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Calendar size={11} /> {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
            </span>
            {hasSubmitted && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Send size={11} /> Submitted {new Date(a._submission.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
            padding: '3px 10px', border: `2px solid ${B}`,
            background: hasSubmitted ? '#f0fdf4' : isOverdue ? '#fef2f2' : isActiveRange ? '#eff6ff' : TERT,
            color: hasSubmitted ? '#16a34a' : isOverdue ? '#dc2626' : isActiveRange ? '#2563eb' : TXT3
          }}>
            {hasSubmitted ? 'Done' : isOverdue ? 'Overdue' : isActiveRange ? 'Open' : 'Scheduled'}
          </span>
          <ChevronRight size={16} style={{ color: TXT3 }} />
        </div>
      </div>
    </div>
  );
}
