import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import { uploadMedia } from '../api/mediaApi.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

/*
 * AdminHowItWorks — Edit the "How it Works" homepage section steps.
 * Route: /admin/how-it-works
 *
 * Manages:
 *   - steps (4 items: number, id, quote, response, accent, image)
 *   - number and id are fixed (not editable) — only quote, response, accent, image can change
 *   - image is an ImageKit URL; when blank, the frontend falls back to inline SVG illustration
 */

const DEFAULT_STEPS = [
  { number: 1, id: 'confusion', quote: '"There\'s so much to study. DSA, DBMS, OS... where do I even start?"', response: 'Structured roadmaps for each subject. Start with what matters most, track your progress.', accent: '#ff4f00', image: '' },
  { number: 2, id: 'clarity', quote: '"I finally understand how arrays work, but how do I apply this in an interview?"', response: 'Curated problem sets with company tags, difficulty levels, and video explanations.', accent: '#0066ff', image: '' },
  { number: 3, id: 'confidence', quote: '"I\'m solving medium problems now. But am I ready for the actual interview?"', response: 'Mock interview questions, community Q&A, and trusted answers from placed seniors.', accent: '#10b981', image: '' },
  { number: 4, id: 'result', quote: '"I got the offer. TCS Digital. And I used TheJobStarter every single day."', response: 'Join 10,000+ students who placed using TheJobStarter.', accent: '#ff4f00', image: '' }
];

export default function AdminHowItWorks() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* Form state — array of steps */
  const [steps, setSteps] = useState(DEFAULT_STEPS.map(s => ({ ...s })));

  /* Track which step index is currently uploading an image */
  const [uploadingIndex, setUploadingIndex] = useState(null);

  /* Hidden file input refs — one per step */
  const fileInputRefs = useRef([]);

  /* Load existing config on mount */
  useEffect(() => {
    console.log('[ADMIN] Loading HowItWorks section config...');
    setLoading(true);
    setFetchError(null);
    apiRequest('/site-config/public')
      .then(res => {
        const section = res.data?.homepageHowItWorks;
        if (!section || !section.steps || !Array.isArray(section.steps) || section.steps.length === 0) {
          console.log('[ADMIN] No HowItWorks section data, using defaults');
          setLoading(false);
          return;
        }
        console.log('[ADMIN] HowItWorks section loaded');
        const merged = DEFAULT_STEPS.map(def => {
          const saved = section.steps.find(s => s.id === def.id);
          if (!saved) return { ...def };
          return {
            number: def.number,
            id: def.id,
            quote: saved.quote || def.quote,
            response: saved.response || def.response,
            accent: saved.accent || def.accent,
            image: saved.image || ''
          };
        });
        setSteps(merged);
        setLoading(false);
      })
      .catch(err => {
        console.error('[ADMIN] Failed to load HowItWorks section:', err.message);
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  /* Save the entire section */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      console.log('[ADMIN] Saving HowItWorks section...');
      await apiRequest('/site-config/how-it-works', {
        method: 'PUT',
        body: JSON.stringify({ homepageHowItWorks: { steps } })
      });
      console.log('[ADMIN] HowItWorks section saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[ADMIN] Error saving HowItWorks section:', err.message);
      setSaveError(err.message);
    }
    setSaving(false);
  };

  /* Update a single field within a step */
  const updateStepField = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  /* Trigger hidden file input for a given step */
  const handleUploadClick = (index) => {
    fileInputRefs.current[index]?.click();
  };

  /*
   * Upload image for a step via ImageKit
   * Reads file as base64 -> sends to /api/media/upload -> stores returned URL in step.image
   */
  const handleFileSelect = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    /* Validate file type */
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingIndex(index);

    try {
      /* Read file as base64 */
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      console.log('[ADMIN] Uploading image for step:', steps[index].id);

      /* Upload to ImageKit via media API */
      const res = await uploadMedia(base64, `how-it-works-${steps[index].id}-${Date.now()}.${file.name.split('.').pop()}`);

      console.log('[ADMIN] Image uploaded:', res.url);

      /* Store the URL in the step */
      updateStepField(index, 'image', res.url);
    } catch (err) {
      console.error('[ADMIN] Image upload failed:', err.message);
      alert('Image upload failed: ' + err.message);
    }

    setUploadingIndex(null);

    /* Reset file input so the same file can be re-selected */
    if (event.target) event.target.value = '';
  };

  /* Remove the image from a step, reverting to SVG illustration on the frontend */
  const handleRemoveImage = (index) => {
    updateStepField(index, 'image', '');
  };

  if (loading) return <Loader text="LOADING HOW IT WORKS SECTION..." />;

  if (fetchError) {
    return (
      <div>
        <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>
          Failed to load: {fetchError}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>How It Works — Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">How It Works — Content Editor</h1>
        <span className="listing-header__count">Edit the 4 journey steps for the homepage "How it Works" section</span>
      </div>

      {saved && <div className="success-text" style={{ marginBottom: 'var(--space-md)' }}>Section content saved!</div>}
      {saveError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Save failed: {saveError}</div>}

      <form onSubmit={handleSave} className="admin-form">

        {steps.map((step, i) => (
          <fieldset
            key={step.id}
            style={{
              border: `3px solid ${step.accent}`,
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-lg)',
              position: 'relative'
            }}
          >
            <legend style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: step.accent
            }}>
              Step {step.number} — {step.id.charAt(0).toUpperCase() + step.id.slice(1)}
            </legend>

            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-sm)' }}>
              {/* Quote */}
              <div className="input-group">
                <label>Quote text (the student&apos;s voice)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={step.quote}
                  onChange={e => updateStepField(i, 'quote', e.target.value)}
                  placeholder={`"${step.id} quote..."`}
                />
              </div>

              {/* Response */}
              <div className="input-group">
                <label>Response text (TheJobStarter&apos;s answer)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={step.response}
                  onChange={e => updateStepField(i, 'response', e.target.value)}
                  placeholder="TheJobStarter response..."
                />
              </div>

              {/* Accent color */}
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <label style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Accent color</label>
                <input
                  type="color"
                  value={step.accent}
                  onChange={e => updateStepField(i, 'accent', e.target.value)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid var(--border-color)',
                    padding: '2px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent'
                  }}
                />
                <input
                  className="input"
                  style={{ width: '120px' }}
                  value={step.accent}
                  onChange={e => updateStepField(i, 'accent', e.target.value)}
                  placeholder="#hex"
                />
              </div>

              {/* Image upload */}
              <div className="input-group">
                <label>Card illustration</label>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                  {/* Image preview or placeholder */}
                  <div
                    style={{
                      width: '120px',
                      height: '144px',
                      border: '3px solid var(--border-color)',
                      backgroundColor: '#f5f0e8',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)',
                      textAlign: 'center',
                      padding: '4px',
                      lineHeight: 1.2
                    }}
                  >
                    {step.image ? (
                      <img
                        src={step.image}
                        alt={`Step ${step.number} illustration`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <span>No image — SVG illustration will be shown</span>
                    )}
                  </div>

                  {/* Upload / remove buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={el => { fileInputRefs.current[i] = el; }}
                      onChange={e => handleFileSelect(i, e)}
                    />
                    <Button
                      type="button"
                      onClick={() => handleUploadClick(i)}
                      disabled={uploadingIndex === i}
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      {uploadingIndex === i ? 'Uploading...' : step.image ? 'Replace' : 'Upload Image'}
                    </Button>
                    {step.image && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        variant="danger"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        ))}

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Saving...' : 'Save How It Works Content'}
        </Button>
      </form>
    </div>
  );
}
