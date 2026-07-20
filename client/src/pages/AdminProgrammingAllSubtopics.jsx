import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';
import Button from '../components/ui/Button.jsx';

export default function AdminProgrammingAllSubtopics() {
  const { lessons, fetchLessons, subtopics, subtopicsLoading, subtopicsError, fetchSubtopics, deleteSubtopic } = useProgrammingStore();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const [filterLesson, setFilterLesson] = useState('');

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    const filters = {};
    if (filterLesson) filters.lesson = filterLesson;
    fetchSubtopics(filters);
  }, [filterLesson, refresh]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this subtopic?')) return;
    await deleteSubtopic(id);
    setRefresh(n => n + 1);
  };

  const lessonMap = {};
  lessons.forEach(l => { lessonMap[l.slug] = l; });

  const columns = [
    { key: 'title', label: 'Subtopic' },
    { key: 'lesson', label: 'Lesson' },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Order' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = subtopics.map(s => {
    const lesson = lessonMap[s.lessonSlug];
    return {
      ...s,
      lesson: lesson ? (
        <Link to={`/admin/programming/lessons/${lesson._id}/subtopics`} style={{ color: 'var(--accent)' }}>
          {lesson.title}
        </Link>
      ) : s.lessonSlug,
      actions: (
        <div className="admin-actions" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {lesson && (
            <Link to={`/admin/programming/problems/new?lesson=${s.lessonSlug || ''}&subtopic=${s.slug}`} className="btn btn--sm">+ Problem</Link>
          )}
          <Link to={`/admin/programming/lessons/${lesson?._id || s.lessonSlug}/subtopics/${s._id}/edit`} className="btn btn--sm">Edit</Link>
          <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s._id)}>Delete</button>
        </div>
      )
    };
  });

  return (
    <div>
      <Helmet><title>All Subtopics — Admin Programming — TheWebytes</title></Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/programming">Programming</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>All Subtopics</span>
      </nav>

      <div className="listing-header">
        <div>
          <h1 className="listing-header__title">All Programming Subtopics</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Filter by lesson:</label>
            <select
              value={filterLesson}
              onChange={e => setFilterLesson(e.target.value)}
              style={{
                padding: '4px 10px',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                minWidth: 200
              }}
            >
              <option value="">All Lessons</option>
              {lessons.map(l => (
                <option key={l._id} value={l.slug}>{l.title}</option>
              ))}
            </select>
            <span className="listing-header__count" style={{ marginLeft: '4px' }}>
              {subtopics.length} subtopic{subtopics.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Link className="btn" to={filterLesson ? `/admin/programming/lessons/${lessonMap[filterLesson]?._id || ''}/subtopics` : '/admin/programming'}>
          + New Subtopic
        </Link>
      </div>

      {subtopicsLoading && <Loader text="LOADING..." />}
      {subtopicsError && <div className="error-text">{subtopicsError}</div>}
      {!subtopicsLoading && !subtopicsError && (
        <>
          {rows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', fontWeight: 600 }}>
              No subtopics found.{filterLesson ? ' Try selecting a different lesson.' : ''}
            </div>
          )}
          {rows.length > 0 && <DataTable columns={columns} rows={rows} />}
        </>
      )}
    </div>
  );
}
