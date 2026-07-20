import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import Button from '../components/ui/Button.jsx';

export default function AdminProgrammingSubtopicEdit() {
  const { lessonId, id } = useParams();
  const navigate = useNavigate();
  const { lessons, fetchLessons, subtopics, fetchSubtopics, createSubtopic, updateSubtopic } = useProgrammingStore();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [explanation, setExplanation] = useState('');
  const [order, setOrder] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pptxUrl, setPptxUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchLessons(); fetchSubtopics(); }, []);

  const lesson = lessons.find(l => l._id === lessonId);

  useEffect(() => {
    if (id) {
      const existing = subtopics.find(s => s._id === id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setDescription(existing.description || '');
        setExplanation(existing.explanation || '');
        setOrder(existing.order);
        setYoutubeUrl(existing.youtubeUrl || '');
        setPdfUrl(existing.pdfUrl || '');
        setPptxUrl(existing.pptxUrl || '');
      }
    }
  }, [id, subtopics]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title, slug, lessonSlug: lesson?.slug, description, explanation,
        order: Number(order), youtubeUrl, pdfUrl, pptxUrl
      };
      if (isNew) {
        await createSubtopic(data);
      } else {
        await updateSubtopic(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate(`/admin/programming/lessons/${lessonId}/subtopics`), 1500);
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
        <Link to="/admin/programming">Programming</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <Link to={`/admin/programming/lessons/${lessonId}/subtopics`}>{lesson?.title || 'Lesson'}</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>{isNew ? 'New Subtopic' : 'Edit Subtopic'}</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create Subtopic' : 'Edit Subtopic'}</h1>
        {lesson && <p>Lesson: <strong>{lesson.title}</strong> (slug: {lesson.slug})</p>}
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
            <label>Explanation (Markdown)</label>
            <textarea className="input" rows={12} value={explanation} onChange={e => setExplanation(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Order</label>
            <input className="input" type="number" value={order} onChange={e => setOrder(e.target.value)} />
          </div>
          <div className="input-group">
            <label>YouTube URL</label>
            <input className="input" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
          </div>
          <div className="input-group">
            <label>PDF URL</label>
            <input className="input" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
          </div>
          <div className="input-group">
            <label>PPTX URL</label>
            <input className="input" value={pptxUrl} onChange={e => setPptxUrl(e.target.value)} />
          </div>
        </div>
        <Button type="submit" fullWidth>Save Subtopic</Button>
      </form>
    </div>
  );
}
