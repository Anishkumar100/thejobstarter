import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminDbmsProblemList() {
  const { problems, problemsLoading, problemsError, fetchProblems, deleteProblem } = useDbmsStore();
  const [filterLesson, setFilterLesson] = useState('');
  const [filterSubtopic, setFilterSubtopic] = useState('');
  const [availableSubtopics, setAvailableSubtopics] = useState([]);
  const { lessons, fetchLessons, subtopics, fetchSubtopics } = useDbmsStore();

  useEffect(() => { fetchLessons(); }, []);

  useEffect(() => {
    if (filterLesson) {
      fetchSubtopics({ lesson: filterLesson });
    } else {
      setAvailableSubtopics([]);
    }
  }, [filterLesson]);

  useEffect(() => {
    setAvailableSubtopics(subtopics || []);
  }, [subtopics]);

  useEffect(() => {
    const filters = { limit: 100 };
    if (filterLesson) filters.lesson = filterLesson;
    if (filterSubtopic) filters.subtopic = filterSubtopic;
    fetchProblems(filters);
  }, [filterLesson, filterSubtopic]);

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
        <div>
          <h1 className="listing-header__title">DBMS Problems</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Lesson:</label>
            <select
              value={filterLesson}
              onChange={e => { setFilterLesson(e.target.value); setFilterSubtopic(''); }}
              style={{
                padding: '4px 10px',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                minWidth: 180
              }}
            >
              <option value="">All Lessons</option>
              {lessons.map(l => (
                <option key={l._id} value={l.slug}>{l.title}</option>
              ))}
            </select>

            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Subtopic:</label>
            <select
              value={filterSubtopic}
              onChange={e => setFilterSubtopic(e.target.value)}
              disabled={!filterLesson}
              style={{
                padding: '4px 10px',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                minWidth: 200,
                opacity: !filterLesson ? 0.5 : 1
              }}
            >
              <option value="">All Subtopics</option>
              {availableSubtopics.map(s => (
                <option key={s._id} value={s.slug}>{s.title}</option>
              ))}
            </select>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              {problems.length} problem{problems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Link to="/admin/dbms/problems/new" className="btn btn--primary">+ New Problem</Link>
      </div>
      {problemsLoading && <Loader text="LOADING..." />}
      {problemsError && <div className="error-text">{problemsError}</div>}
      {!problemsLoading && !problemsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
