import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBlogStore } from '../stores/useBlogStore.js';
import { apiRequest } from '../api/client.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminBlogList() {
  const { posts, loading, error, fetchPosts, deletePost } = useBlogStore();
  const [heroImage, setHeroImage] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  /* Fetch current blog hero image from site config */
  useEffect(() => {
    apiRequest('/site-config/public')
      .then(res => { if (res.data?.blogHeroImage) setHeroImage(res.data.blogHeroImage); })
      .catch(() => {});
  }, []);

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
            body: JSON.stringify({ file: reader.result, fileName: `blog-hero-${Date.now()}` })
          });
          setHeroImage(res.url);
        } catch (err) {
          console.error('[ADMIN] Blog hero upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const saveHero = async () => {
    setHeroLoading(true);
    try {
      await apiRequest('/site-config', {
        method: 'PUT',
        body: JSON.stringify({
          homepageStats: { problems: 0, articles: 0, users: 0, questions: 0 },
          blogHeroImage: heroImage
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[ADMIN] Save hero failed:', err.message);
    }
    setHeroLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await deletePost(id);
  };

  const columns = [
    {
      key: 'coverImage', label: 'Image',
      render: v => v
        ? <img src={v} alt="" style={{ width: 60, height: 40, objectFit: 'cover', border: '2px solid var(--border-color)', display: 'block' }} />
        : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>—</span>
    },
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author', render: v => v?.name || 'Unknown' },
    { key: 'readTime', label: 'Read Time', render: v => `${v} min` },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = posts.map(p => ({
    ...p,
    actions: (
      <div className="admin-actions">
        <Link to={`/admin/blog/${p._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(p._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Admin Blog — TheJobStarter</title></Helmet>

      {/* Blog Hero Section Settings */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="listing-header" style={{ marginBottom: 'var(--space-md)' }}>
          <h2 className="listing-header__title" style={{ fontSize: '1.1rem' }}>Blog Hero Image</h2>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            value={heroImage}
            onChange={e => setHeroImage(e.target.value)}
            placeholder="ImageKit URL or paste image link..."
          />
          <button type="button" className="btn btn--sm" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" className="btn btn--sm btn--primary" onClick={saveHero} disabled={heroLoading}>
            {heroLoading ? 'Saving...' : 'Save'}
          </button>
          {saved && <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--success-text)' }}>Saved!</span>}
        </div>
        {heroImage && (
          <div style={{ marginTop: 'var(--space-sm)', border: '3px solid var(--border-color)', maxWidth: '100%', overflow: 'hidden' }}>
            <img src={heroImage} alt="Blog hero preview" style={{ display: 'block', width: '100%', maxHeight: 300, objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="listing-header">
        <h1 className="listing-header__title">Blog Posts</h1>
        <Link to="/admin/blog/new" className="btn btn--primary">+ New Post</Link>
      </div>
      {loading && <Loader text="LOADING..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
