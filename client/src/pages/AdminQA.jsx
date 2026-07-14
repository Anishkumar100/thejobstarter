import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQaStore } from '../stores/useQaStore.js';
import { usePageLoadingStore } from '../stores/usePageLoadingStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';
import {
  EyeIcon, Delete01Icon, MessageQuestionIcon,
  Tick03Icon, Cancel01Icon
} from 'hugeicons-react';

/*
 * Loads answers for a specific question using the store's mock/data helpers
 * Works in both mock and live modes
 */
async function loadAnswersFor(questionId, fetchQuestionById) {
  const pl = usePageLoadingStore.getState();
  pl.start('Q&A');
  await fetchQuestionById(questionId);
  pl.stop('Q&A');
}

export default function AdminQA() {
  const {
    questions, loading, error, fetchQuestions,
    deleteQuestion, deleteAnswerAction,
    approveQuestion, rejectQuestion,
    answers, currentQuestion, fetchQuestionById
  } = useQaStore();
  const addToast = useToastStore(state => state.addToast);

  const [expandedId, setExpandedId] = useState(null);
  const [deletingAnswerId, setDeletingAnswerId] = useState(null);

  /* Fetch ALL questions (including pending) for admin */
  useEffect(() => { fetchQuestions({ all: 'true' }); }, []);

  /* When a question is expanded, load its answers */
  const handleToggleExpand = async (qId) => {
    if (expandedId === qId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(qId);
    await loadAnswersFor(qId, fetchQuestionById);
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question AND all its answers?')) return;
    await deleteQuestion(id);
    if (expandedId === id) setExpandedId(null);
    addToast('Question deleted', 'info');
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!expandedId) return;
    if (!confirm('Delete this answer?')) return;
    setDeletingAnswerId(answerId);
    await deleteAnswerAction(expandedId, answerId);
    setDeletingAnswerId(null);
    addToast('Answer deleted', 'info');
  };

  const handleApprove = async (id) => {
    try {
      await approveQuestion(id);
      addToast('Question approved!', 'success');
    } catch (err) {
      addToast('Failed to approve', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectQuestion(id);
      addToast('Question rejected', 'info');
    } catch (err) {
      addToast('Failed to reject', 'error');
    }
  };

  const columns = [
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        if (!v || v === 'approved') return <span style={{ color: 'var(--accent-green, #16a34a)', fontWeight: 700 }}>Approved</span>;
        if (v === 'pending') return <span style={{ color: '#d97706', fontWeight: 700 }}>Pending</span>;
        return <span style={{ color: '#dc2626', fontWeight: 700 }}>Rejected</span>;
      }
    },
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author', render: (v) => v?.name || 'Unknown' },
    { key: 'answerCount', label: 'Answers', render: (v) => v || 0 },
    { key: 'votes', label: 'Votes' },
    { key: 'views', label: 'Views' },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
        <div className="admin-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* Approve/Reject for pending questions */}
          {row.status === 'pending' && (
            <>
              <button
                className="btn btn--sm"
                style={{ background: '#16a34a', color: '#fff', border: '2px solid #000', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleApprove(row._id)}
                title="Approve question"
              >
                <Tick03Icon size={14} /> Approve
              </button>
              <button
                className="btn btn--sm"
                style={{ background: '#dc2626', color: '#fff', border: '2px solid #000', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleReject(row._id)}
                title="Reject question"
              >
                <Cancel01Icon size={14} /> Reject
              </button>
            </>
          )}
          <button
            className="btn btn--sm"
            onClick={() => handleToggleExpand(row._id)}
            title="View answers"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <EyeIcon size={14} />
            {expandedId === row._id ? 'Hide' : 'Answers'}
          </button>
          <button className="btn btn--sm btn--danger" onClick={() => handleDeleteQuestion(row._id)}>
            <Delete01Icon size={14} />
          </button>
        </div>
      )
    }
  ];

  const rows = questions.map(q => ({
    ...q,
    actions: null /* rendered via column.render */
  }));

  /* Debounced reload answers when expandedId changes and data might be stale */
  const answersList = expandedId ? answers : [];

  return (
    <div>
      <Helmet><title>Q&A Moderation — Admin TheJobStarter</title></Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">Q&A Moderation</h1>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {questions.length} questions
          {' | '}
          <span style={{ color: '#d97706' }}>{questions.filter(q => q.status === 'pending').length} pending</span>
        </span>
      </div>

      {loading && <Loader text="LOADING QUESTIONS..." />}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <div style={{ border: '3px solid var(--border-color)' }}>
          <DataTable columns={columns} rows={rows} />

          {/* ═════ EXPANDED ANSWER ROWS ═════ */}
          {expandedId && currentQuestion?._id === expandedId && (
                <div style={{
                  borderTop: '3px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  padding: 'var(--space-lg)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <MessageQuestionIcon size={18} />
                    <strong style={{ fontSize: '0.95rem' }}>
                      Answers for: {currentQuestion?.title || 'Loading...'}
                    </strong>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-tertiary)',
                      padding: '2px 8px',
                      border: '2px solid var(--border-color)',
                      background: 'var(--bg-primary)'
                    }}>
                      {answersList.length}
                    </span>
                  </div>

                  {answersList.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', padding: 'var(--space-md)', textAlign: 'center' }}>
                      No answers yet for this question.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                      {answersList.map((answer) => (
                        <div
                          key={answer._id}
                          style={{
                            border: `3px solid ${answer.accepted ? 'var(--accent)' : answer.status === 'pending' ? '#d97706' : 'var(--border-color)'}`,
                            background: answer.status === 'pending' ? '#fffbeb' : 'var(--bg-secondary)',
                            padding: 'var(--space-md)',
                            position: 'relative'
                          }}
                        >
                          {/* Status badge */}
                          {answer.status && answer.status !== 'approved' && (
                            <span style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.12em',
                              padding: '4px 10px',
                              background: answer.status === 'pending' ? '#d97706' : '#dc2626',
                              color: '#fff'
                            }}>
                              {answer.status === 'pending' ? 'Pending' : 'Rejected'}
                            </span>
                          )}

                          {/* Accepted badge */}
                          {answer.accepted && (
                            <span style={{
                              position: 'absolute',
                              top: 0,
                              right: answer.status && answer.status !== 'approved' ? '90px' : 0,
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.12em',
                              padding: '4px 10px',
                              background: 'var(--accent)',
                              color: 'var(--text-inverse)'
                            }}>
                              Accepted
                            </span>
                          )}

                          {/* Answer body */}
                          <p style={{
                            fontSize: '0.9rem',
                            lineHeight: '1.7',
                            color: 'var(--text-primary)',
                            whiteSpace: 'pre-wrap',
                            marginBottom: 'var(--space-sm)',
                            paddingRight: '80px'
                          }}>
                            {answer.body?.substring(0, 300)}
                            {answer.body?.length > 300 ? '…' : ''}
                          </p>

                          {/* Answer meta + actions */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 'var(--space-sm)'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-md)',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)'
                            }}>
                              <span style={{ fontWeight: 700 }}>
                                {answer.author?.name || answer.author || 'Anonymous'}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                                Votes: {answer.votes || 0}
                              </span>
                              {answer.createdAt && (
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                                  {new Date(answer.createdAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>

                            <button
                              className="btn btn--sm btn--danger"
                              onClick={() => handleDeleteAnswer(answer._id)}
                              disabled={deletingAnswerId === answer._id}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Delete01Icon size={13} />
                              {deletingAnswerId === answer._id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
        </div>
      )}
    </div>
  );
}
