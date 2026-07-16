import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminDbmsAllSubtopics() {
  const { lessons, fetchLessons, subtopics, subtopicsLoading, subtopicsError, fetchSubtopics, deleteSubtopic } = useDbmsStore();
  const [refresh, setRefresh] = useState(0);

  /*
   * Fetch lessons and all subtopics on mount or refresh
   */
  useEffect(() => {
    fetchLessons();
    fetchSubtopics();
  }, [refresh]);

  /*
   * Handle subtopic deletion with confirmation
   */
  const handleDelete = async (id) => {
    if (!confirm('Delete this subtopic?')) return;
    await deleteSubtopic(id);
    setRefresh(n => n + 1);
  };

  /*
   * Build a lookup map from lesson slug to lesson object
   */
  const lessonMap = {};
  lessons.forEach(l => { lessonMap[l.slug] = l; });

  const columns = [
    { key: 'title', label: 'Subtopic' },
    { key: 'lesson', label: 'Lesson' },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Order' },
    { key: 'actions', label: 'Actions' }
  ];

  /*
   * Map subtopics to DataTable rows with lesson name linked and action buttons
   */
  const rows = subtopics.map(s => {
    const lesson = lessonMap[s.lessonSlug];
    return {
      ...s,
      lesson: lesson ? (
        <Link to={`/admin/dbms/lessons/${lesson._id}/subtopics`} style={{ color: 'var(--accent)' }}>
          {lesson.title}
        </Link>
      ) : s.lessonSlug,
      actions: (
        <div className="admin-actions">
          <Link to={`/admin/dbms/problems/new?lesson=${s.lessonSlug || ''}&subtopic=${s.slug}`} className="btn btn--sm">+ Problem</Link>
          <Link to={`/admin/dbms/lessons/${lesson?._id || ''}/subtopics/${s._id}/edit`} className="btn btn--sm">Edit</Link>
          <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s._id)}>Delete</button>
        </div>
      )
    };
  });

  return (
    <div>
      <Helmet><title>All Subtopics — Admin — TheWebytes</title></Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/dbms">DBMS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>All Subtopics</span>
      </nav>

      <div className="listing-header">
        <div>
          <h1 className="listing-header__title">All Subtopics</h1>
          <span className="listing-header__count">{subtopics.length} subtopics across {lessons.length} lessons</span>
        </div>
      </div>

      {subtopicsLoading && <Loader text="LOADING..." />}
      {subtopicsError && <div className="error-text">{subtopicsError}</div>}
      {!subtopicsLoading && !subtopicsError && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
