import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { apiRequest } from '../../api/client.js';

export default function BlogForm({ initialData, onSave }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [readTime, setReadTime] = useState(initialData?.readTime || 5);
  const [authorName, setAuthorName] = useState(initialData?.author?.name || '');
  const [docUrl, setDocUrl] = useState(initialData?.document?.url || '');
  const [docTitle, setDocTitle] = useState(initialData?.document?.title || '');
  const [uploading, setUploading] = useState(false);

  /* Upload image to ImageKit via the media upload endpoint */
  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await apiRequest('/media/upload', {
            method: 'POST',
            body: JSON.stringify({ file: reader.result, fileName: `blog-${(slug || title).slice(0, 30)}-${Date.now()}` })
          });
          setCoverImage(res.url);
        } catch (err) {
          console.error('[ADMIN] Blog image upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  /* Upload a document file (PDF, etc.) to ImageKit */
  const handleDocUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.ppt,.pptx';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await apiRequest('/media/upload', {
            method: 'POST',
            body: JSON.stringify({ file: reader.result, fileName: `blog-doc-${(slug || title).slice(0, 30)}-${Date.now()}` })
          });
          setDocUrl(res.url);
          /* Auto-fill document title from file name if not already set */
          if (!docTitle) setDocTitle(file.name.replace(/\.[^.]+$/, ''));
        } catch (err) {
          console.error('[ADMIN] Blog document upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title, slug, excerpt, content, coverImage, readTime,
      author: { name: authorName },
      document: { url: docUrl, title: docTitle }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <label>Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Slug</label>
          <input className="input" value={slug} onChange={e => { setSlug(e.target.value); setSlug(e.target.value.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()); }} required />
        </div>
        <div className="input-group">
          <label>Author Name</label>
          <input className="input" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="input-group">
          <label>Read Time (minutes)</label>
          <input className="input" type="number" min="1" value={readTime} onChange={e => setReadTime(Number(e.target.value))} />
        </div>
      </div>

      <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
        <label>Cover Image</label>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <input className="input" style={{ flex: 1 }} value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://ik.imagekit.io/..." />
          <button type="button" className="btn btn--sm" onClick={handleFileUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {coverImage && (
          <div style={{ marginTop: 'var(--space-sm)', border: '3px solid var(--border-color)', maxWidth: 300 }}>
            <img src={coverImage} alt="Cover preview" style={{ display: 'block', width: '100%', height: 'auto' }} />
          </div>
        )}
      </div>

      {/* Document upload — PDF, notes, etc. */}
      <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
        <label>Attached Document (optional)</label>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <input className="input" style={{ flex: 1 }} value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://ik.imagekit.io/.../document.pdf" />
          <button type="button" className="btn btn--sm" onClick={handleDocUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        <input className="input" style={{ marginTop: 8 }} value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="Document title (e.g. 'Placement Guide PDF')" />
        {docUrl && (
          <div style={{ marginTop: 'var(--space-sm)', border: '3px solid var(--border-color)', padding: '10px 14px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>📄</span>
            <a href={docUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{docTitle || 'View Document'}</a>
          </div>
        )}
      </div>

      <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
        <label>Excerpt</label>
        <textarea className="input textarea--lg" rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short description for blog cards..." />
      </div>

      <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
        <label>Content</label>
        <textarea className="input textarea--lg" rows={16} value={content} onChange={e => setContent(e.target.value)} required />
      </div>

      <Button type="submit" fullWidth style={{ marginTop: 'var(--space-lg)' }}>Save Post</Button>
    </form>
  );
}
