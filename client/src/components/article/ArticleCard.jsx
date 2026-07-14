import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';

export default function ArticleCard({ article, category }) {
  return (
    <a href={`/${category}/${article.slug}`} className="card card--hover">
      <div className="card__header">
        <h3 className="card__title">{article.title}</h3>
        {article.topic && <Badge>{article.topic}</Badge>}
      </div>
      <p className="card__excerpt">
        {article.content?.substring(0, 150)}...
      </p>
      <div className="card__footer">
        <span>Views: {article.views}</span>
      </div>
    </a>
  );
}
