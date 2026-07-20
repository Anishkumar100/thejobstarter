import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';
import { BookOpen, Layers, Code2 } from 'lucide-react';

export default function AdminProgrammingList() {
  const { lessons, loading, fetchLessons, subtopics, fetchSubtopics, total, fetchProblems, deleteLesson } = useProgrammingStore();
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
        <Link to={`/admin/programming/lessons/${l._id}/edit`} className="btn btn--sm">Edit</Link>
        <Link to={`/admin/programming/lessons/${l._id}/subtopics`} className="btn btn--sm">Subtopics</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(l._id)}>Delete</button>
      </div>
    )
  }));

  const subtopicCount = subtopics.length;

  return (
    <div>
      <Helmet><title>Admin Programming — TheJobStarter</title></Helmet>

      <div className="admin-dsa-header">
        <div className="listing-header">
          <h1 className="listing-header__title">Programming Concepts</h1>
          <span className="listing-header__count">Lessons · Subtopics · Problems</span>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ margin: 'var(--space-xl) 0' }}>
        <Link to="/admin/programming/lessons/new" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
          <BookOpen size={28} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{lessons.length}</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lessons</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>+ New Lesson →</div>
        </Link>

        <Link to="/admin/programming/subtopics" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
          <Layers size={28} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{subtopicCount}</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subtopics</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>All Subtopics →</div>
        </Link>

        <Link to="/admin/programming/problems" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
          <Code2 size={28} />
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{total || '0'}</div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Problems</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Manage Problems →</div>
        </Link>
      </div>

      <div className="listing-header">
        <h1 className="listing-header__title">Programming Lessons</h1>
        <span className="listing-header__count">{lessons.length} lessons</span>
      </div>

      {loading && <Loader text="LOADING..." />}
      {!loading && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
