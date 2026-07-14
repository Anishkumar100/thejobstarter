import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useQaStore } from '../stores/useQaStore.js';
import { useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/useAuthStore.js';
import AnswerList from '../components/qa/AnswerList.jsx';
import AnswerForm from '../components/qa/AnswerForm.jsx';
import Loader from '../components/ui/Loader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useToastStore } from '../stores/useToastStore.js';
import {
  ArrowLeft01Icon, ThumbsUpIcon, ThumbsDownIcon,
  MessageQuestionIcon, EyeIcon, Clock01Icon,
  Tick03Icon, Cancel01Icon
} from 'hugeicons-react';

export default function QaDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const {
    currentQuestion, answers, loading, error,
    fetchQuestionById, voteOnQuestion,
    approveAnswerAction, rejectAnswerAction
  } = useQaStore();
  const addToast = useToastStore(state => state.addToast);
  const authUser = useAuthStore(state => state.user);
  const [localVotes, setLocalVotes] = useState(null);

  useEffect(() => { fetchQuestionById(id); }, [id]);

  /* Reset optimistic vote state when navigating to a different question */
  useEffect(() => { setLocalVotes(null); }, [id]);

  const q = currentQuestion;
  const isQuestionAuthor = !!(authUser?._id && q?.author?._id && authUser._id === q.author._id);
  const displayVotes = localVotes ?? q?.votes ?? 0;

  /* Split answers — approved ones shown normally, pending ones only to the author */
  const approvedAnswers = (answers || []).filter(a => a.status === 'approved');
  const pendingAnswers = (answers || []).filter(a => a.status === 'pending');

  const handleVote = async (dir) => {
    if (!user) return;
    const delta = dir === 'up' ? 1 : -1;
    setLocalVotes(displayVotes + delta);
    try {
      await voteOnQuestion(q._id, delta);
    } catch {
      setLocalVotes(displayVotes);
    }
  };

  const handleApproveAnswer = async (answerId) => {
    try {
      await approveAnswerAction(q._id, answerId);
      addToast('Answer approved and is now visible!', 'success');
    } catch (err) {
      addToast('Failed to approve answer', 'error');
    }
  };

  const handleRejectAnswer = async (answerId) => {
    try {
      await rejectAnswerAction(q._id, answerId);
      addToast('Answer rejected', 'info');
    } catch (err) {
      addToast('Failed to reject answer', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <Loader text="LOADING QUESTION..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="qad-page">
      <Helmet>
        <title>{q.title} — TheJobStarter Q&A</title>
        <meta name="description" content={q.body?.substring(0, 160)} />
      </Helmet>

      {/* ═════ BACK LINK ═════ */}
      <Link to="/qa" className="qad-back">
        <ArrowLeft01Icon size={16} />
        <span>Back to Q&A</span>
      </Link>

      {/* ═════ TWO-COLUMN LAYOUT (desktop) ═════ */}
      <div className="qad-layout">
        {/* LEFT COLUMN: question + approved answers */}
        <div className="qad-layout__main">
          {/* HERO / QUESTION (inside left column so sidebar aligns at top) */}
          <motion.div
            className="qad-hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="qad-hero__layout">
              {/* Voting column */}
              <div className="qad-vote">
                <button className={`qad-vote__btn ${localVotes > (q.votes || 0) ? 'qad-vote__btn--up' : ''}`} onClick={() => handleVote('up')} title="Upvote">
                  <ThumbsUpIcon size={20} />
                </button>
                <span className="qad-vote__count">{displayVotes}</span>
                <button className={`qad-vote__btn ${localVotes < (q.votes || 0) ? 'qad-vote__btn--down' : ''}`} onClick={() => handleVote('down')} title="Downvote">
                  <ThumbsDownIcon size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="qad-hero__main">
                <h1 className="qad-hero__title">{q.title}</h1>

                {/* Status badge for pending questions */}
                {q.status && q.status !== 'approved' && (
                  <span className="qad-status-badge" data-status={q.status}>
                    {q.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                  </span>
                )}

                {/* Tags */}
                {q.tags?.length > 0 && (
                  <div className="qad-hero__tags">
                    {q.tags.map(tag => <span key={tag} className="qad-tag">{tag}</span>)}
                  </div>
                )}

                {/* Body */}
                <div className="qad-body">
                  {q.body}
                </div>

                {/* Meta bar */}
                <div className="qad-meta">
                  <div className="qad-meta__author">
                    <Avatar src={q.author?.avatar} name={q.author?.name || q.author} size={28} />
                    <span>{q.author?.name || q.author || 'Anonymous'}</span>
                  </div>
                  <div className="qad-meta__stats">
                    <span className="qad-meta__stat">
                      <EyeIcon size={14} />
                      {q.views || 0} views
                    </span>
                    <span className="qad-meta__stat">
                      <MessageQuestionIcon size={14} />
                      {answers.length} answer{answers.length !== 1 ? 's' : ''}
                    </span>
                    {q.createdAt && (
                      <span className="qad-meta__stat">
                        <Clock01Icon size={14} />
                        {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <AnswerList
            answers={approvedAnswers}
            isQuestionAuthor={isQuestionAuthor}
            questionId={q._id}
          />
        </div>

        {/* RIGHT COLUMN: answer form + pending answers */}
        <div className="qad-layout__sidebar">
          {/* ═════ ANSWER FORM ═════ */}
          {user ? (
            <AnswerForm questionId={q._id} />
          ) : (
            <div className="qad-signin-prompt">
              <MessageQuestionIcon size={24} />
              <span>Sign in to post an answer</span>
              <Link to="/sign-in" className="qa-hero__btn qa-hero__btn--primary">Sign In</Link>
            </div>
          )}

          {/* ═════ PENDING ANSWERS (author only) ═════ */}
          {isQuestionAuthor && pendingAnswers.length > 0 && (
            <div className="qad-section">
              <h2 className="qad-section__title">Pending Answers ({pendingAnswers.length})</h2>
              <div className="qad-pending-list">
                {pendingAnswers.map(answer => (
                  <div key={answer._id} className="qad-pending-card">
                    <div className="qad-pending-card__body">{answer.body}</div>
                    <div className="qad-pending-card__meta">
                      <Avatar src={answer.author?.avatar} name={answer.author?.name} size={20} />
                      <span>{answer.author?.name || 'Anonymous'}</span>
                    </div>
                    <div className="qad-pending-card__actions">
                      <button
                        className="qad-pending-card__btn qad-pending-card__btn--approve"
                        onClick={() => handleApproveAnswer(answer._id)}
                      >
                        <Tick03Icon size={14} /> Approve
                      </button>
                      <button
                        className="qad-pending-card__btn qad-pending-card__btn--reject"
                        onClick={() => handleRejectAnswer(answer._id)}
                      >
                        <Cancel01Icon size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
