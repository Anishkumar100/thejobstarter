import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminDbmsSubtopicList() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lessons, fetchLessons, subtopics, subtopicsLoading, subtopicsError, fetchSubtopics, deleteSubtopic } = useDbmsStore();
  const [refresh, setRefresh] = useState(0);

  /*
   * Find the current lesson from the lessonId URL parameter
   */
  const lesson = lessons.find(l => l._id === lessonId);

  /*
   * Fetch lessons on mount
   */
  useEffect(() => {
    fetchLessons();
  }, []);

  /*
   * Fetch subtopics filtered by the lesson's slug once the lesson is loaded
   */
  useEffect(() => {
    if (lesson) {
      fetchSubtopics({ lesson: lesson.slug });
    } else if (lessons.length > 0 && !lessonId) {
      navigate(`/admin/dbms/lessons/${lessons[0]._id}/subtopics`, { replace: true });
    }
  }, [lesson, lessonId, lessons.length, refresh]);

  const handleLessonChange = (e) => {
    const val = e.target.value;
    if (val) {
      navigate('/admin/dbms/lessons/' + val + '/subtopics');
    } else {
      navigate('/admin/dbms/subtopics');
    }
  };

  /*
   * Handle subtopic deletion with confirmation
   */
  const handleDelete = async (id) => {
    if (!confirm('Delete this subtopic?')) return;
    await deleteSubtopic(id);
    setRefresh(n => n + 1);
  };

  const columns = [
    { key: 'title', label: 'Subtopic' },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Order' },
    { key: 'actions', label: 'Actions' }
  ];

  /*
   * Map subtopics to DataTable rows with action buttons
   */
  const rows = subtopics.map(s => ({
    ...s,
    actions: (
      <div className="admin-actions">
        <Link to={`/admin/dbms/problems/new?lesson=${lesson?.slug || ''}&subtopic=${s.slug}`} className="btn btn--sm">+ Problem</Link>
        <Link to={`/admin/dbms/lessons/${lessonId}/subtopics/${s._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Subtopics — {lesson?.title || '...'} — Admin TheJobStarter</title></Helmet>

      {/* Breadcrumb: DBMS umbrella */}
      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/dbms">DBMS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <Link to={`/admin/dbms/lessons/${lessonId}/subtopics`}>{lesson?.title || 'Lesson'}</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>Subtopics</span>
      </nav>

      <div className="listing-header">
        <div>
          <h1 className="listing-header__title">Subtopics</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Lesson:</label>
            <select
              value={lessonId || ''}
              onChange={handleLessonChange}
              style={{
                padding: '4px 10px',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                minWidth: 200
              }}
            >
              <option value="">All Subtopics</option>
              {lessons.map(l => (
                <option key={l._id} value={l._id}>{l.title}</option>
              ))}
            </select>
            <Link to={`/admin/dbms/lessons`} style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>← Manage Lessons</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Link to={`/admin/dbms/problems/new?lesson=${lesson?.slug || ''}`} className="btn">+ New Problem</Link>
          <Link to={`/admin/dbms/lessons/${lessonId}/subtopics/new`} className="btn btn--primary">+ New Subtopic</Link>
        </div>
      </div>
      {subtopicsLoading && <Loader text="LOADING..." />}
      {subtopicsError && <div className="error-text">{subtopicsError}</div>}
      {!subtopicsLoading && !subtopicsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
