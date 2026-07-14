import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDsaStore } from '../stores/useDsaStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminDsaProblemList() {
  const { problems, problemsLoading, problemsError, fetchProblems, deleteProblem } = useDsaStore();

  useEffect(() => { fetchProblems({ limit: 100 }); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return;
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
        <Link to={`/admin/dsa/problems/${p._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(p._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Admin DSA Problems — TheJobStarter</title></Helmet>

      {/* Breadcrumb: DSA umbrella */}
      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/dsa">DSA</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>Problems</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">DSA Problems</h1>
        <Link to="/admin/dsa/problems/new" className="btn btn--primary">+ New Problem</Link>
      </div>
      {problemsLoading && <Loader text="LOADING..." />}
      {problemsError && <div className="error-text">{problemsError}</div>}
      {!problemsLoading && !problemsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
