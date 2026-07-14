import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTestimonialStore } from '../stores/useTestimonialStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/*
 * AdminTestimonials — CRUD for homepage testimonials
 * Route: /admin/testimonials
 * Fields: name, role, text, order, active
 */

const EMPTY_FORM = { name: '', role: '', text: '', order: 0, active: true, avatar: '' };

export default function AdminTestimonials() {
  const { allTestimonials, loading, error, fetchAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonialStore();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAllTestimonials();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (t) => {
    setForm({ name: t.name, role: t.role, text: t.text, order: t.order, active: t.active, avatar: t.avatar || '' });
    setEditing(t._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.text.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateTestimonial(editing, form);
        useToastStore.getState().success('Testimonial updated successfully!');
      } else {
        await createTestimonial(form);
        useToastStore.getState().success('Testimonial created successfully!');
      }
      resetForm();
      await fetchAllTestimonials();
    } catch (err) {
      console.error('[ADMIN] Error saving testimonial:', err.message);
      useToastStore.getState().error(err.message || 'Failed to save testimonial');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      useToastStore.getState().success('Testimonial deleted successfully!');
      await fetchAllTestimonials();
    } catch (err) {
      console.error('[ADMIN] Error deleting testimonial:', err.message);
      useToastStore.getState().error(err.message || 'Failed to delete testimonial');
    }
  };

  /* Upload avatar image to ImageKit via the media upload endpoint */
  const handleAvatarUpload = async () => {
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
            body: JSON.stringify({ file: reader.result, fileName: `testimonial-${form.name?.slice(0, 20) || 'avatar'}-${Date.now()}` })
          });
          setForm(prev => ({ ...prev, avatar: res.url }));
        } catch (err) {
          console.error('[ADMIN] Avatar upload failed:', err.message);
          useToastStore.getState().error('Failed to upload avatar');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (loading && !allTestimonials.length) return <Loader text="LOADING TESTIMONIALS..." />;

  return (
    <div>
      <Helmet><title>Testimonials — Admin</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Testimonials</h1>
        <span className="listing-header__count">{allTestimonials.length} total</span>
        {!showForm && (
          <Button onClick={() => { resetForm(); setShowForm(true); }}>+ New Testimonial</Button>
        )}
      </div>

      {error && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: 'var(--space-lg)' }}>
          <fieldset style={{ border: '3px solid var(--border-color)', padding: 'var(--space-md)' }}>
            <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {editing ? 'Edit Testimonial' : 'New Testimonial'}
            </legend>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <div className="input-group">
                <label>Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Arjun Mehta" required />
              </div>
              <div className="input-group">
                <label>Role *</label>
                <input className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="SDE-1 at Amazon · 36 LPA" required />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
              <label>Testimonial text *</label>
              <textarea className="input" rows={4} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="The full testimonial quote..." required />
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-sm)' }}>
              <label>Avatar Image</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <input className="input" style={{ flex: 1 }} value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://ik.imagekit.io/..." />
                <button type="button" className="btn btn--sm" onClick={handleAvatarUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {form.avatar && (
                <div style={{ marginTop: 'var(--space-sm)', border: '3px solid var(--border-color)', width: 80, height: 80 }}>
                  <img src={form.avatar} alt="Avatar preview" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <div className="input-group" style={{ width: '100px' }}>
                <label>Order</label>
                <input className="input" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <span className="font-bold" style={{ fontSize: '0.85rem' }}>Active</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
          </fieldset>
        </form>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {allTestimonials.map((t, i) => (
          <div key={t._id} style={{
            border: '3px solid var(--border-color)',
            padding: 'var(--space-md)',
            backgroundColor: t.active ? 'var(--bg-surface)' : 'var(--bg-tertiary)',
            opacity: t.active ? 1 : 0.5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                {t.avatar ? (
                  <div style={{ width: 48, height: 48, border: '3px solid var(--border-color)', flexShrink: 0, overflow: 'hidden' }}>
                    <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : null}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span className="font-mono font-bold" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>#{t.order}</span>
                    <span className="font-black" style={{ fontSize: '1.1rem' }}>{t.name}</span>
                    {!t.active && <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>(inactive)</span>}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <Button onClick={() => handleEdit(t)} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Edit</Button>
                <Button onClick={() => handleDelete(t._id)} variant="danger" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Delete</Button>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{t.text}"</p>
          </div>
        ))}
        {!allTestimonials.length && !loading && (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-xl)' }}>No testimonials yet. Create one.</p>
        )}
      </div>
    </div>
  );
}
