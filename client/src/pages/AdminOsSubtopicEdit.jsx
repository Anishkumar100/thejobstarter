import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOsStore } from '../stores/useOsStore.js';
import { apiRequest } from '../api/client.js';

export default function AdminOsSubtopicEdit() {
  const { lessonId, id } = useParams();
  const navigate = useNavigate();
  const { lessons, fetchLessons, createSubtopic, updateSubtopic } = useOsStore();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [explanation, setExplanation] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pptxUrl, setPptxUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { subtopics, fetchSubtopics } = useOsStore();

  /* Fetch lessons on mount, and fetch subtopics if editing */
  useEffect(() => {
    fetchLessons();
    if (!isNew) { fetchSubtopics(); }
  }, []);

  /* If editing, populate form fields from existing subtopic */
  useEffect(() => {
    if (!isNew && subtopics.length > 0) {
      const existing = subtopics.find(s => s._id === id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setDescription(existing.description);
        setImage(existing.image || '');
        setExplanation(existing.explanation || '');
        setYoutubeUrl(existing.youtubeUrl || '');
        setPdfUrl(existing.pdfUrl || '');
        setPptxUrl(existing.pptxUrl || '');
        setOrder(existing.order || 0);
      }
    }
  }, [id, subtopics]);

  const lesson = lessons.find(l => l._id === lessonId);

  /* Image upload to ImageKit */
  const handleImageUpload = async () => {
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
            body: JSON.stringify({ file: reader.result, fileName: `os-subtopic-${slug || 'new'}-${Date.now()}` })
          });
          setImage(res.url);
        } catch (err) {
          console.error('[ADMIN] Upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  /* Generic file upload to ImageKit */
  const handleFileUpload = async (setter, prefix) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await apiRequest('/media/upload', {
            method: 'POST',
            body: JSON.stringify({ file: reader.result, fileName: `${prefix}-${(slug || 'new').slice(0, 20)}-${Date.now()}` })
          });
          setter(res.url);
        } catch (err) {
          console.error('[ADMIN] Upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  /* Save the subtopic */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!lesson) return;
    const data = {
      title, slug, description, image, explanation, youtubeUrl, pdfUrl, pptxUrl,
      lessonSlug: lesson.slug,
      order: Number(order)
    };
    try {
      if (isNew) {
        await createSubtopic(data);
      } else {
        await updateSubtopic(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate(`/admin/os/lessons/${lessonId}/subtopics`), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving subtopic:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Subtopic' : 'Edit Subtopic'} — Admin TheJobStarter</title>
      </Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/os">OS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <Link to={`/admin/os/lessons/${lessonId}/subtopics`}>{lesson?.title || 'Lesson'}</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>{isNew ? 'New Subtopic' : 'Edit Subtopic'}</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">
          {isNew ? 'Create Subtopic' : 'Edit Subtopic'}
          {lesson ? ` (${lesson.title})` : ''}
        </h1>
      </div>

      {saved && <div className="success-text">Subtopic saved! Redirecting...</div>}

      <form onSubmit={handleSave} className="admin-form">
        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Slug</label>
            <input className="input" value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Description</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Image</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="input" style={{ flex: 1 }} value={image} onChange={e => setImage(e.target.value)} placeholder="ImageKit URL" />
              <button type="button" className="btn btn--sm" onClick={handleImageUpload} disabled={uploading}>
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
            {image && <img src={image} alt="preview" style={{ width: 120, marginTop: 'var(--space-sm)', border: '3px solid var(--border-color)' }} />}
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Explanation (plain text, paragraphs separated by blank lines)</label>
            <textarea className="input textarea--lg" rows={10} value={explanation} onChange={e => setExplanation(e.target.value)} />
          </div>
          <div className="input-group">
            <label>YouTube URL (embed link)</label>
            <input className="input" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
          </div>
          <div className="input-group">
            <label>Order</label>
            <input className="input" type="number" value={order} onChange={e => setOrder(e.target.value)} />
          </div>
          <div className="input-group">
            <label>PDF URL</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="input" style={{ flex: 1 }} value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="ImageKit PDF URL" />
              <button type="button" className="btn btn--sm" onClick={() => handleFileUpload(setPdfUrl, 'pdf')} disabled={uploading}>
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>PPTX URL</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="input" style={{ flex: 1 }} value={pptxUrl} onChange={e => setPptxUrl(e.target.value)} placeholder="ImageKit PPTX URL" />
              <button type="button" className="btn btn--sm" onClick={() => handleFileUpload(setPptxUrl, 'pptx')} disabled={uploading}>
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
          {isNew ? 'Create Subtopic' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
