import { motion } from 'motion/react';
import { useQaStore } from '../../stores/useQaStore.js';
import Avatar from '../ui/Avatar.jsx';
import { ThumbsUpIcon, ThumbsDownIcon, CheckmarkCircle01Icon, ChatIcon } from 'hugeicons-react';

export default function AnswerList({ answers = [], isQuestionAuthor = false, questionId }) {
  const { voteOnAnswer } = useQaStore();

  const handleVote = async (answerId, dir) => {
    const delta = dir === 'up' ? 1 : -1;
    try {
      await voteOnAnswer(questionId, answerId, delta);
    } catch (err) {
      console.error('[QA] Vote error:', err);
    }
  };

  if (answers.length === 0) {
    return (
      <div className="ans-empty">
        <ChatIcon size={36} />
        <h3 className="ans-empty__title">No answers yet</h3>
        <p className="ans-empty__desc">Be the first to share your knowledge!</p>
      </div>
    );
  }

  return (
    <div className="ans-section">
      <div className="ans-section__header">
        <h2 className="ans-section__title">{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h2>
      </div>

      <div className="ans-section__list">
        {answers.map((answer, i) => (
          <motion.div
            key={answer._id}
            className={`ans-card ${answer.accepted ? 'ans-card--accepted' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
          >
            {/* Accepted banner */}
            {answer.accepted && (
              <div className="ans-card__accepted">
                <CheckmarkCircle01Icon size={14} />
                Accepted Answer
              </div>
            )}

            <div className="ans-card__body-wrap">
              {/* Voting column */}
              <div className="ans-card__votes">
                <button
                  className="ans-card__vote-btn ans-card__vote-btn--up"
                  onClick={() => handleVote(answer._id, 'up')}
                  title="Upvote"
                >
                  <ThumbsUpIcon size={16} />
                </button>
                <span className="ans-card__vote-count">{answer.votes || 0}</span>
                <button
                  className="ans-card__vote-btn ans-card__vote-btn--down"
                  onClick={() => handleVote(answer._id, 'down')}
                  title="Downvote"
                >
                  <ThumbsDownIcon size={16} />
                </button>
              </div>

              {/* Content area */}
              <div className="ans-card__main">
                {/* Author row */}
                <div className="ans-card__author-row">
                  <div className="ans-card__author">
                    <Avatar src={answer.author?.avatar} name={answer.author?.name || answer.author} size={28} />
                    <span className="ans-card__author-name">{answer.author?.name || answer.author || 'Anonymous'}</span>
                    <span className="ans-card__author-badge">answered</span>
                    {answer.createdAt && (
                      <span className="ans-card__date">
                        {new Date(answer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="ans-card__text">
                  {answer.body}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
