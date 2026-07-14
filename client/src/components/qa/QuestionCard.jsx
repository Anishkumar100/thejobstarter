import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar.jsx';
import { ChatIcon, EyeIcon, ThumbsUpIcon } from 'hugeicons-react';

export default function QuestionCard({ question }) {
  const q = question;

  return (
    <Link to={`/qa/${q._id}`} className="qa-card-new">
      {/* Vote area */}
      <div className="qa-card-new__vote">
        <ThumbsUpIcon size={16} />
        <span className="qa-card-new__vote-count">{q.votes || 0}</span>
      </div>

      {/* Main content */}
      <div className="qa-card-new__body">
        {/* Tags + title */}
        <div className="qa-card-new__top">
          {q.tags?.length > 0 && (
            <div className="qa-card-new__tags">
              {q.tags.slice(0, 3).map(tag => (
                <span key={tag} className="qa-card-new__tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <h3 className="qa-card-new__title">{q.title}</h3>

        <p className="qa-card-new__excerpt">
          {q.body?.substring(0, 180)}{q.body?.length > 180 ? '…' : ''}
        </p>

        {/* Footer */}
        <div className="qa-card-new__footer">
          <div className="qa-card-new__author">
            <Avatar src={q.author?.avatar} name={q.author?.name || q.author} size={22} />
            <span className="qa-card-new__author-name">{q.author?.name || q.author || 'Anonymous'}</span>
          </div>

          <div className="qa-card-new__stats">
            <span className="qa-card-new__stat">
              <ChatIcon size={13} />
              {q.answerCount || 0}
            </span>
            <span className="qa-card-new__stat">
              <EyeIcon size={13} />
              {q.views || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Hover arrow */}
      <span className="qa-card-new__arrow">→</span>
    </Link>
  );
}
