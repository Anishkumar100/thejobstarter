import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../stores/useAdminStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import MediaUploader from '../components/admin/MediaUploader.jsx';
import MediaLibrary from '../components/admin/MediaLibrary.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminMedia() {
  const { media, loading, error, fetchMedia, uploadMedia, deleteMedia } = useAdminStore();

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (file) => {
    try {
      await uploadMedia(file);
      useToastStore.getState().success('File uploaded successfully');
      await fetchMedia();
    } catch (err) {
      useToastStore.getState().error('Upload failed: ' + err.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    try {
      await deleteMedia(fileId);
      useToastStore.getState().success('File deleted');
      await fetchMedia();
    } catch (err) {
      useToastStore.getState().error('Delete failed: ' + err.message);
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
