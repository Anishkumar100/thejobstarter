import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminDbmsProblemList() {
  const { problems, problemsLoading, problemsError, fetchProblems, deleteProblem } = useDbmsStore();

  /*
   * Fetch all DBMS problems on mount
   */
  useEffect(() => { fetchProblems({ limit: 100 }); }, []);

  /*
   * Handle problem deletion with confirmation
   */
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

  /*
   * Map problems to DataTable rows with action buttons
   */
  const rows = problems.map(p => ({
    ...p,
    actions: (
      <div className="admin-actions">
        <Link to={`/admin/dbms/problems/${p._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(p._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Admin DBMS Problems — TheJobStarter</title></Helmet>

      {/* Breadcrumb: DBMS umbrella */}
      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/dbms">DBMS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>Problems</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">DBMS Problems</h1>
        <Link to="/admin/dbms/problems/new" className="btn btn--primary">+ New Problem</Link>
      </div>
      {problemsLoading && <Loader text="LOADING..." />}
      {problemsError && <div className="error-text">{problemsError}</div>}
      {!problemsLoading && !problemsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
