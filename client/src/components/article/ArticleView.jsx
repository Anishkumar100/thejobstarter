import Image from '../ui/Image.jsx';
import VideoEmbed from '../ui/VideoEmbed.jsx';

export default function ArticleView({ article }) {
  const renderContent = (text) => {
    if (!text) return '';
    return text
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <article className="article-view">
      <h1 className="article-view__title">{article.title}</h1>
      {article.topic && <span className="tag">{article.topic}</span>}

      <div className="detail-content" dangerouslySetInnerHTML={{ __html: renderContent(article.content) }} />

      {article.media?.map((m, i) => (
        <div key={i} style={{ margin: 'var(--space-lg) 0' }}>
          {m.type === 'youtube' ? (
            <VideoEmbed url={m.url} caption={m.caption} />
          ) : (
            <Image src={m.url} alt={m.caption || ''} width={800} />
          )}
        </div>
      ))}
    </article>
  );
}
