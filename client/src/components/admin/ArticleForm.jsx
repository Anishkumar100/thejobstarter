import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function ArticleForm({ initialData, onSave }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [content, setContent] = useState(initialData?.content || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, slug, topic, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Title</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Slug</label>
        <input className="input" value={slug} onChange={e => setSlug(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Topic</label>
        <input className="input" value={topic} onChange={e => setTopic(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Content</label>
        <textarea className="textarea" rows={12} value={content} onChange={e => setContent(e.target.value)} required />
      </div>
      <Button type="submit" fullWidth>Save Article</Button>
    </form>
  );
}
