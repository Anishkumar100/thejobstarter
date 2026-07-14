import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguageStore } from '../stores/useLanguageStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminLanguagesList() {
  const { languages, loading, error, fetchLanguages, deleteLanguage } = useLanguageStore();

  useEffect(() => { fetchLanguages(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this language?')) return;
    await deleteLanguage(id);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'imageUrl', label: 'Image', render: v => v ? <img src={v} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} /> : '-' },
    { key: 'active', label: 'Active', render: v => v ? 'Yes' : 'No' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = languages.map(lang => ({
    ...lang,
    actions: (
      <div className="admin-actions">
        <Link to={`/admin/languages/${lang._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(lang._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Languages — Admin TheJobStarter</title></Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">Languages</h1>
        <Link to="/admin/languages/new" className="btn btn--primary">+ New Language</Link>
      </div>
      {loading && <Loader text="LOADING..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
