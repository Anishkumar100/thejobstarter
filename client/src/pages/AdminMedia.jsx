import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../stores/useAdminStore.js';
import MediaUploader from '../components/admin/MediaUploader.jsx';
import MediaLibrary from '../components/admin/MediaLibrary.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminMedia() {
  const { media, loading, error, fetchMedia, uploadMedia, deleteMedia } = useAdminStore();

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (file) => {
    try {
      await uploadMedia(file);
      await fetchMedia();
    } catch (err) {
      console.error('[ADMIN] Error uploading media:', err);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    try {
      await deleteMedia(fileId);
      await fetchMedia();
    } catch (err) {
      console.error('[ADMIN] Error deleting media:', err);
    }
  };

  return (
    <div>
      <Helmet><title>Media Library — Admin TheJobStarter</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Media Library</h1>
      </div>

      <MediaUploader onUpload={handleUpload} />

      {loading && <Loader text="LOADING MEDIA..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <MediaLibrary files={media} onDelete={handleDelete} />}
    </div>
  );
}
