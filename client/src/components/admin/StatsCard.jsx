import { Link } from 'react-router-dom';

export default function StatsCard({ title, count, link }) {
  const content = (
    <div className="stat-card">
      <div className="stat-card__number">{count}</div>
      <div className="stat-card__label">{title}</div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}
