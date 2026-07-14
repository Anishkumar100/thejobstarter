import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function MediaUploader({ onUpload }) {
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !fileName) return;
    onUpload({ file: url, fileName });
    setUrl('');
    setFileName('');
  };

  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 style={{ marginBottom: 'var(--space-md)' }}>Upload Media</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label>File URL (base64 or remote)</label>
          <input className="input" value={url} onChange={e => setUrl(e.target.value)} placeholder="Image URL or base64 data" required />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>File Name</label>
          <input className="input" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="my-image.jpg" required />
        </div>
        <Button type="submit">Upload</Button>
      </form>
    </div>
  );
}
