import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOsStore } from '../stores/useOsStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminOsProblemList() {
  const { problems, problemsLoading, problemsError, fetchProblems, deleteProblem } = useOsStore();

  /* Fetch all OS problems on mount */
  useEffect(() => { fetchProblems({ limit: 100 }); }, []);

  /* Handle problem deletion */
  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return;
    console.log('[OS] Deleting problem:', id);
    await deleteProblem(id);
  };

  const columns = [
    { key: 'title', label: 'Problem' },
    { key: 'lessonSlug', label: 'Lesson' },
    { key: 'subtopicSlug', label: 'Subtopic' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'views', label: 'Views' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = problems.map(p => ({
    ...p,
    actions: (
      <div className="admin-actions">
        <Link to={`/admin/os/problems/${p._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(p._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Admin OS Problems — TheJobStarter</title></Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/os">OS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>Problems</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">OS Problems</h1>
        <Link to="/admin/os/problems/new" className="btn btn--primary">+ New Problem</Link>
      </div>
      {problemsLoading && <Loader text="LOADING..." />}
      {problemsError && <div className="error-text">{problemsError}</div>}
      {!problemsLoading && !problemsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
