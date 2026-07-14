import Button from '../ui/Button.jsx';

export default function MediaLibrary({ files = [], onDelete }) {
  if (files.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No media files yet.</p>;
  }

  return (
    <div className="listing-grid">
      {files.map(file => (
        <div key={file.fileId} className="card">
          <img
            src={file.url}
            alt={file.name}
            style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', borderBottom: '3px solid var(--border-color)' }}
            loading="lazy"
          />
          <div style={{ padding: 'var(--space-sm)' }}>
            <p style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{file.name}</p>
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <Button variant="danger" size="sm" onClick={() => onDelete(file.fileId)}>Delete</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
