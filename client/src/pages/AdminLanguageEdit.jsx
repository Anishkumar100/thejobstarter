import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguageStore } from '../stores/useLanguageStore.js';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';

export default function AdminLanguageEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { languages, fetchLanguages, createLanguage, updateLanguage } = useLanguageStore();
  const isNew = !id;
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const existing = isNew ? null : languages.find(l => l._id === id);

  const [name, setName] = useState(existing?.name || '');
  const [slug, setSlug] = useState(existing?.slug || '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || '');
  const [active, setActive] = useState(existing?.active ?? true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSlug(existing.slug);
      setImageUrl(existing.imageUrl || '');
      setActive(existing.active);
    }
  }, [existing]);

  /* Upload a language icon image to ImageKit */
  const handleUpload = async () => {
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
            body: JSON.stringify({ file: reader.result, fileName: `lang-${slug || name || 'icon'}-${Date.now()}` })
          });
          setImageUrl(res.url);
        } catch (err) {
          console.error('[ADMIN] Language icon upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { name, slug, imageUrl, active };
    try {
      if (isNew) {
        await createLanguage(data);
      } else {
        await updateLanguage(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/languages'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving language:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Language' : 'Edit Language'} — Admin</title>
      </Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create Language' : 'Edit Language'}</h1>
      </div>
      {saved && <div className="success-text">Language saved! Redirecting...</div>}

      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Slug</label>
          <input className="input" value={slug} onChange={e => setSlug(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Icon Image</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <input className="input" style={{ flex: 1 }} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="ImageKit URL for language icon/badge" />
            <button type="button" className="btn btn--sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {imageUrl && <img src={imageUrl} alt="" style={{ marginTop: 8, width: 48, height: 48, objectFit: 'contain', border: 'var(--border)' }} />}
        </div>
        <div className="input-group">
          <label>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ marginRight: 8 }} />
            Active (visible in language picker)
          </label>
        </div>
        <Button type="submit" fullWidth>Save Language</Button>
      </form>
    </div>
  );
}
