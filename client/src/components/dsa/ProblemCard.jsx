import { Link } from 'react-router-dom';

/*
 * Enhanced ProblemCard — displays a problem with difficulty badge,
 * topic tags, company tags, and view/bookmark stats.
 */
export default function ProblemCard({ problem, lessonSlug, subtopicSlug, subject = 'dsa' }) {
  const linkTo = lessonSlug && subtopicSlug
    ? `/${subject}/${lessonSlug}/${subtopicSlug}/${problem.slug}`
    : lessonSlug
      ? `/${subject}/${lessonSlug}/${problem.slug}`
      : `/${subject}/${problem.slug}`;

  return (
    <Link to={linkTo} className="prob-card">
      {/* Difficulty stripe */}
      <span className={`prob-card__stripe prob-card__stripe--${problem.difficulty}`} />

      <div className="prob-card__body">
        {/* Header: title + difficulty badge */}
        <div className="prob-card__header">
          <h3 className="prob-card__title">{problem.title}</h3>
          <span className={`prob-card__badge prob-card__badge--${problem.difficulty}`}>
            {problem.difficulty}
          </span>
        </div>

        {/* Topic tags */}
        {problem.topics && problem.topics.length > 0 && (
          <div className="prob-card__tags">
            {problem.topics.map(topic => (
              <span key={topic} className="prob-card__tag">{topic}</span>
            ))}
          </div>
        )}

        {/* Companies */}
        {problem.companies && problem.companies.length > 0 && (
          <div className="prob-card__companies">
            {problem.companies.slice(0, 5).map(company => (
              <span key={company} className="prob-card__company">{company}</span>
            ))}
          </div>
        )}

        {/* Footer: views + arrow */}
        <div className="prob-card__footer">
          <span className="prob-card__views">
            <span className="prob-card__views-icon">▲</span>
            {problem.views?.toLocaleString() || 0} views
          </span>
          <span className="prob-card__arrow">→</span>
        </div>
      </div>
    </Link>
  );
}
