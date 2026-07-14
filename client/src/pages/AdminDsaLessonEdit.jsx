import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDsaStore } from '../stores/useDsaStore.js';
import { useMetaStore } from '../stores/useMetaStore.js';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';

export default function AdminDsaLessonEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lessons, fetchLessons, createLesson, updateLesson } = useDsaStore();
  const { categories, fetchAllMeta } = useMetaStore();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('data-structures');
  const [difficulty, setDifficulty] = useState('easy');
  const [icon, setIcon] = useState('List');
  const [order, setOrder] = useState(0);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchLessons(); fetchAllMeta(); }, []);

  useEffect(() => {
    if (id) {
      const existing = lessons.find(l => l._id === id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setDescription(existing.description);
        setImage(existing.image || '');
        setCategory(existing.category || 'data-structures');
        setDifficulty(existing.difficulty);
        setIcon(existing.icon);
        setOrder(existing.order);
      }
    }
  }, [id, lessons]);

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
            body: JSON.stringify({ file: reader.result, fileName: `lesson-${slug || 'new'}-${Date.now()}` })
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { title, slug, description, image, category, difficulty, icon, order: Number(order) };
      if (isNew) {
        await createLesson(data);
      } else {
        await updateLesson(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/dsa/lessons'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving lesson:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Lesson' : 'Edit Lesson'} — Admin TheJobStarter</title>
      </Helmet>

      {/* Breadcrumb: DSA umbrella */}
      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/dsa">DSA</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>{isNew ? 'New Lesson' : 'Edit Lesson'}</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create Lesson' : 'Edit Lesson'}</h1>
      </div>

      {saved && <div className="success-text">Lesson saved! Redirecting...</div>}

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
            <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
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
            <label>Icon</label>
            <select className="select" value={icon} onChange={e => setIcon(e.target.value)}>
              <option value="List">List</option>
              <option value="Link2">Link</option>
              <option value="Type">Type</option>
              <option value="Hash">Hash</option>
              <option value="MoveRight">Sliding Window</option>
              <option value="GitBranch">GitBranch</option>
              <option value="Layers">Layers</option>
              <option value="Share2">Share2</option>
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
