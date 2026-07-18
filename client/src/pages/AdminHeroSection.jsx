import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import { uploadMedia } from '../api/mediaApi.js';

/*
 * AdminHeroSection — Edit the homepage hero section (title, subtitle, CTAs, video URL)
 * Route: /admin/hero-section
 */
export default function AdminHeroSection() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaPrimary, setCtaPrimary] = useState('');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('');
  const [ctaSecondary, setCtaSecondary] = useState('');
  const [ctaSecondaryLink, setCtaSecondaryLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    apiRequest('/site-config/public')
      .then(res => {
        const hero = res.data?.homepageHero;
        if (hero) {
          if (hero.title) setTitle(hero.title);
          if (hero.subtitle) setSubtitle(hero.subtitle);
          if (hero.ctaPrimary) setCtaPrimary(hero.ctaPrimary);
          if (hero.ctaPrimaryLink) setCtaPrimaryLink(hero.ctaPrimaryLink);
          if (hero.ctaSecondary) setCtaSecondary(hero.ctaSecondary);
          if (hero.ctaSecondaryLink) setCtaSecondaryLink(hero.ctaSecondaryLink);
          if (hero.videoUrl) setVideoUrl(hero.videoUrl);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[ADMIN] Failed to load hero section:', err.message);
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  /* Upload a video file to ImageKit and set the URL */
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    /* Validate file type */
    if (!file.type.startsWith('video/')) {
      setSaveError('Please select a video file.');
      return;
    }
    setUploadingVideo(true);
    setSaveError(null);
    try {
      /* Read file as base64 data URL */
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      /* Upload to ImageKit via the existing media endpoint */
      const res = await uploadMedia(base64, file.name);
      setVideoUrl(res.url);
      console.log('[ADMIN] Video uploaded:', res.url);
    } catch (err) {
      console.error('[ADMIN] Video upload failed:', err.message);
      setSaveError('Video upload failed: ' + err.message);
    }
    setUploadingVideo(false);
    /* Reset file input so same file can be re-selected */
    e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await apiRequest('/site-config/hero-section', {
        method: 'PUT',
        body: JSON.stringify({
          homepageHero: { title, subtitle, ctaPrimary, ctaPrimaryLink, ctaSecondary, ctaSecondaryLink, videoUrl }
        })
      });
      console.log('[ADMIN] Hero section saved');
      setSaved(true);
      setSaving(false);
    } catch (err) {
      console.error('[ADMIN] Failed to save hero section:', err.message);
      setSaveError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <Loader text="LOADING HERO SECTION..." />;

  if (fetchError) {
    return (
      <div>
        <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Failed to load: {fetchError}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Hero Section — Admin — TheWebytes</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Hero Section</h1>
        <span className="listing-header__count">Edit the homepage hero banner — title, subtitle, buttons, and background video.</span>
      </div>

      {saved && <div className="success-text" style={{ marginBottom: 'var(--space-md)' }}>Hero section saved!</div>}
      {saveError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Save failed: {saveError}</div>}

      <form onSubmit={handleSave} className="admin-form">
        <fieldset style={{ border: '3px solid var(--border-color)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hero Content</legend>

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
            {/* ── Title ── */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>
                Title <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(use &lt;br /&gt; for line breaks)</span>
              </label>
              <textarea
                rows={3}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Master Placements.&lt;br /&gt;Crack the Code.&lt;br /&gt;Land Your Dream Job."
                style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            {/* ── Subtitle ── */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>Subtitle</label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="180+ curated DSA problems, in-depth DBMS & OS articles..."
                style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            {/* ── Primary CTA ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>Primary Button Text</label>
                <input
                  type="text"
                  value={ctaPrimary}
                  onChange={e => setCtaPrimary(e.target.value)}
                  placeholder="Browse DSA"
                  style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>Primary Button Link</label>
                <input
                  type="text"
                  value={ctaPrimaryLink}
                  onChange={e => setCtaPrimaryLink(e.target.value)}
                  placeholder="/dsa"
                  style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* ── Secondary CTA ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>Secondary Button Text</label>
                <input
                  type="text"
                  value={ctaSecondary}
                  onChange={e => setCtaSecondary(e.target.value)}
                  placeholder="Join Community"
                  style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>Secondary Button Link</label>
                <input
                  type="text"
                  value={ctaSecondaryLink}
                  onChange={e => setCtaSecondaryLink(e.target.value)}
                  placeholder="/qa"
                  style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* ── Video URL ── */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem' }}>Background Video URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="/hero-video.mp4"
                style={{ width: '100%', padding: '8px', border: '3px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Paste a URL or upload a video file below.</p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', alignItems: 'center' }}>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
                <Button type="button" disabled={uploadingVideo} onClick={() => videoInputRef.current?.click()} style={{ flexShrink: 0 }}>
                  {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                </Button>
                {videoUrl && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                    ✓ {videoUrl.split('/').pop() || 'file set'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        {/* ── Preview ── */}
        <fieldset style={{ border: '3px solid var(--border-color)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <legend style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</legend>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '3px solid var(--border-color)',
            padding: 'var(--space-lg)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 'var(--space-md)' }}
              dangerouslySetInnerHTML={{
                __html: title || 'Master Placements.<br />Crack the Code.<br />Land Your Dream Job.'
              }}
            />
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              {subtitle || '180+ curated DSA problems, in-depth DBMS & OS articles, and a thriving community — all in one brutalist package.'}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
              <span className="btn btn--primary">{ctaPrimary || 'Browse DSA'}</span>
              <span className="btn">{ctaSecondary || 'Join Community'}</span>
            </div>
            {videoUrl && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)' }}>Video: {videoUrl}</p>}
          </div>
        </fieldset>

        <div className="admin-form__actions">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Hero Section'}
          </Button>
        </div>
      </form>
    </div>
  );
}
