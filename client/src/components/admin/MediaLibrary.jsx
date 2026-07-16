import { useState, useMemo } from 'react';
import Button from '../ui/Button.jsx';

const CATEGORIES = ['All', 'Images', 'Documents', 'Videos', 'Other'];

function getCategory(file) {
  if (file.mime) {
    if (file.mime.startsWith('image/')) return 'Images';
    if (file.mime.startsWith('video/')) return 'Videos';
    if (file.mime.startsWith('application/')) return 'Documents';
  }
  const ext = file.name?.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff'];
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'json', 'xml'];
  const videoExts = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv', 'flv'];
  if (imageExts.includes(ext)) return 'Images';
  if (videoExts.includes(ext)) return 'Videos';
  if (docExts.includes(ext)) return 'Documents';
  return 'Other';
}

export default function MediaLibrary({ files = [], onDelete }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const grouped = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => map[c] = []);
    files.forEach(f => {
      const cat = getCategory(f);
      if (map[cat]) map[cat].push(f);
      else map['Other'].push(f);
    });
    return map;
  }, [files]);

  const displayed = activeCategory === 'All' ? files : grouped[activeCategory] || [];

  return (
    <div>
      {/* Category tabs */}
      <div style={{
        display: 'flex', gap: '4px', flexWrap: 'wrap',
        marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)',
        borderBottom: '3px solid var(--border-color)'
      }}>
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? files.length : (grouped[cat]?.length || 0);
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px', cursor: 'pointer', fontSize: '0.75rem',
                fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                border: '3px solid var(--border-color)',
                background: isActive ? 'var(--accent)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text-primary)',
                boxShadow: isActive ? '4px 4px 0 var(--border-color)' : 'none',
                transform: isActive ? 'translate(-1px, -1px)' : 'none',
                transition: 'all 0.12s ease'
              }}
            >
              {cat}
              <span style={{ marginLeft: '6px', opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {displayed.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
          {activeCategory === 'All' ? 'No media files yet.' : `No ${activeCategory.toLowerCase()} files.`}
        </p>
      ) : (
        <div className="listing-grid">
          {displayed.map(file => (
            <div key={file.fileId} className="card">
              {getCategory(file) === 'Images' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', borderBottom: '3px solid var(--border-color)' }}
                  loading="lazy"
                />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '3/2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--surface-alt)', fontSize: '2rem', fontWeight: 700,
                  borderBottom: '3px solid var(--border-color)', color: 'var(--text-tertiary)'
                }}>
                  {getCategory(file) === 'Videos' ? '▶' : '📄'}
                </div>
              )}
              <div style={{ padding: 'var(--space-sm)' }}>
                <p style={{ fontSize: '0.75rem', wordBreak: 'break-all', marginBottom: '4px' }}>
                  {file.name}
                </p>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase',
                  color: 'var(--text-tertiary)', letterSpacing: '0.05em'
                }}>
                  {getCategory(file)}
                </span>
                <div style={{ marginTop: 'var(--space-sm)' }}>
                  <Button variant="danger" size="sm" onClick={() => onDelete(file.fileId)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
