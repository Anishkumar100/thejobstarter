import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOsStore } from '../stores/useOsStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';
import { BookOpen, Layers, Lightbulb } from 'lucide-react';

export default function AdminOsList() {
  const { lessons, lessonsLoading, lessonsError, fetchLessons, subtopics, fetchSubtopics, total, fetchProblems, deleteLesson } = useOsStore();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchLessons();
    fetchSubtopics();
    fetchProblems({ limit: 1 });
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this lesson? All associated subtopics and problems will remain in the database.')) return;
    await deleteLesson(id);
    setRefresh(n => n + 1);
  };

  const columns = [
    { key: 'title', label: 'Lesson' },
    { key: 'slug', label: 'Slug' },
    { key: 'category', label: 'Category' },
    { key: 'problemCount', label: 'Problems' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'order', label: 'Order' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = lessons.map(l => ({
    ...l,
    actions: (
      <div className="admin-actions" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <Link to={`/admin/os/lessons/${l._id}/edit`} className="btn btn--sm">Edit</Link>
        <Link to={`/admin/os/lessons/${l._id}/subtopics`} className="btn btn--sm">Subtopics</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(l._id)}>Delete</button>
      </div>
    )
  }));

  const subtopicCount = subtopics.length;

  return (
    <div>
      <Helmet><title>Admin OS — TheJobStarter</title></Helmet>

      <div className="admin-dsa-header">
        <div className="listing-header">
          <h1 className="listing-header__title">OS Management</h1>
          <span className="listing-header__count">Lessons · Subtopics · Problems</span>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ margin: 'var(--space-xl) 0' }}>
        <Link to="/admin/os/lessons/new" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
          <BookOpen size={28} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{lessons.length}</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lessons</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>+ New Lesson →</div>
        </Link>

        <Link to="/admin/os/subtopics" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
          <Layers size={28} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{subtopicCount}</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subtopics</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>All Subtopics →</div>
        </Link>

        <Link to="/admin/os/problems" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
          <Lightbulb size={28} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{total || '0'}</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Problems</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Manage Problems →</div>
        </Link>
      </div>

      <div className="listing-header">
        <h1 className="listing-header__title">OS Lessons</h1>
        <span className="listing-header__count">{lessons.length} lessons</span>
      </div>

      {lessonsLoading && <Loader text="LOADING..." />}
      {lessonsError && <div className="error-text">{lessonsError}</div>}
      {!lessonsLoading && !lessonsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
