import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOsStore } from '../stores/useOsStore.js';
import { useOsMetaStore } from '../stores/useOsMetaStore.js';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';

export default function AdminOsLessonEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lessons, fetchLessons, createLesson, updateLesson } = useOsStore();
  const { categories, fetchAllMeta } = useOsMetaStore();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [order, setOrder] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploading, setUploading] = useState(false);

  /* Fetch lessons and meta on mount */
  useEffect(() => { fetchLessons(); fetchAllMeta(); }, []);

  /* If editing, populate form fields from existing lesson */
  useEffect(() => {
    if (id) {
      const existing = lessons.find(l => l._id === id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setDescription(existing.description);
        setImage(existing.image || '');
        setCategory(existing.category || 'process-management');
        setDifficulty(existing.difficulty);
        setOrder(existing.order);
      }
    }
  }, [id, lessons]);

  /* Open file picker and upload image to ImageKit */
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
            body: JSON.stringify({ file: reader.result, fileName: `os-lesson-${slug || 'new'}-${Date.now()}` })
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

  /* Save the lesson */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    try {
      const data = { title, slug, description, image, category, difficulty, order: Number(order) };
      if (isNew) {
        await createLesson(data);
      } else {
        await updateLesson(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/os'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving lesson:', err);
      setSaveError(err.message || 'Save failed — check console');
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Lesson' : 'Edit Lesson'} — Admin TheJobStarter</title>
      </Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/os">OS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>{isNew ? 'New Lesson' : 'Edit Lesson'}</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create Lesson' : 'Edit Lesson'}</h1>
      </div>

      {saved && <div className="success-text">Lesson saved! Redirecting...</div>}
      {saveError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>{saveError}</div>}

      <form onSubmit={handleSave} className="admin-form">
        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Slug</label>
            <input className="input" value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase())} required />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Description</label>
            <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
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
          <div className="input-group">
            <label>Category</label>
            <select className="select" value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Difficulty</label>
            <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label>Order</label>
            <input className="input" type="number" value={order} onChange={e => setOrder(e.target.value)} />
          </div>
        </div>
        <Button type="submit" fullWidth>Save Lesson</Button>
      </form>
    </div>
  );
}
