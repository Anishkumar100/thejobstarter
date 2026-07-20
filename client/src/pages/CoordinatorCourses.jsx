import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { BookOpen, Plus, Trash2, X, Check, Edit3 } from 'lucide-react';

const CARD = {
  border: '4px solid #000',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: '6px 6px 0 #000',
};

export default function CoordinatorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  /*
   * Fetch course offerings for the coordinator's centre
   */
  const fetchCourses = useCallback(async () => {
    console.log('[COORD COURSES] Fetching courses...');
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/coordinator/course-offerings');
      setCourses(res.data || []);
    } catch (err) {
      console.error('[COORD COURSES] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  /*
   * Create a new course offering
   */
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await apiRequest('/coordinator/course-offerings', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() })
      });
      setCourses(prev => [res.data, ...prev]);
      setNewName('');
      setShowCreate(false);
      console.log('[COORD COURSES] Created:', res.data?._id);
    } catch (err) {
      console.error('[COORD COURSES] Create error:', err.message);
      alert(err.message || 'Failed to create course');
    }
    setSaving(false);
  };

  /*
   * Toggle course status (active / inactive)
   */
  const handleToggleStatus = async (courseId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await apiRequest(`/coordinator/course-offerings/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, status: newStatus } : c));
      console.log('[COORD COURSES] Status toggled:', courseId, newStatus);
    } catch (err) {
      console.error('[COORD COURSES] Toggle error:', err.message);
      alert(err.message || 'Failed to update course');
    }
  };

  /*
   * Save inline name edit
   */
  const handleSaveEdit = async (courseId) => {
    if (!editingName.trim()) return;
    try {
      const res = await apiRequest(`/coordinator/course-offerings/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editingName.trim() })
      });
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, name: editingName.trim() } : c));
      setEditingId(null);
      setEditingName('');
      console.log('[COORD COURSES] Name updated:', courseId);
    } catch (err) {
      console.error('[COORD COURSES] Edit error:', err.message);
      alert(err.message || 'Failed to update course name');
    }
  };

  /*
   * Delete a course offering
   */
  const handleDelete = async (courseId) => {
    if (!confirm('Delete this course offering? This cannot be undone.')) return;
    setDeletingId(courseId);
    try {
      await apiRequest(`/coordinator/course-offerings/${courseId}`, { method: 'DELETE' });
      setCourses(prev => prev.filter(c => c._id !== courseId));
      console.log('[COORD COURSES] Deleted:', courseId);
    } catch (err) {
      console.error('[COORD COURSES] Delete error:', err.message);
      alert(err.message || 'Failed to delete course');
    }
    setDeletingId(null);
  };

  if (loading) return <Loader text="LOADING COURSES..." />;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1000, margin: '0 auto' }}>
      <Helmet><title>Courses — Coordinator — TheWebytes</title></Helmet>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={28} /> Courses
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Manage the programs and courses offered at your centre.
          </p>
        </div>
        <button className="btn" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ ...CARD, background: 'var(--error-bg)', marginBottom: 'var(--space-lg)' }}>
          <p style={{ fontWeight: 700 }}>Error loading courses</p>
          <p style={{ fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && courses.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <BookOpen size={48} style={{ marginBottom: 'var(--space-md)', color: 'var(--gray-500)' }} />
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', fontSize: '1.1rem' }}>No courses yet</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }}>
            Create your first course offering to assign to student batches.
          </p>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Course
          </button>
        </div>
      )}

      {/* Course list */}
      {courses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {courses.map(c => (
            <div key={c._id} style={{ ...CARD, padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                {/* Left: name / inline editor */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === c._id ? (
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input className="input"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        style={{ flex: 1, fontSize: '0.9rem', padding: '4px 8px', maxWidth: 300 }}
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit(c._id)}
                      />
                      <button className="btn btn--sm" onClick={() => handleSaveEdit(c._id)}
                        style={{ fontSize: '0.65rem', padding: '4px 8px' }}>
                        <Check size={14} />
                      </button>
                      <button className="btn btn--sm btn--ghost" onClick={() => { setEditingId(null); setEditingName(''); }}
                        style={{ fontSize: '0.65rem', padding: '4px 8px' }}>
                        <X size={14} />
                      </button>
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{c.name}</h3>
                      <button className="btn btn--sm btn--ghost"
                        onClick={() => { setEditingId(c._id); setEditingName(c.name); }}
                        style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                        <Edit3 size={12} />
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span>ID: <strong style={{ fontFamily: 'monospace' }}>{c._id.slice(-6)}</strong></span>
                    <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {/* Status toggle badge */}
                  <button
                    onClick={() => handleToggleStatus(c._id, c.status)}
                    style={{
                      padding: '4px 10px', border: '2px solid var(--black)',
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                      background: c.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                      cursor: 'pointer', transition: 'all 0.12s ease',
                    }}
                    title="Click to toggle status"
                  >
                    {c.status}
                  </button>
                  <button className="btn btn--sm btn--danger"
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    style={{ fontSize: '0.65rem', padding: '4px 8px' }}>
                    {deletingId === c._id ? '...' : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-lg)'
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            ...CARD, width: '100%', maxWidth: 480,
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>New Course</h2>
            <form onSubmit={e => { e.preventDefault(); handleCreate(); }}>
              <div className="input-group">
                <label>Course Name *</label>
                <input className="input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Full Stack Development 2026"
                  autoFocus
                  required />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={saving || !newName.trim()}>
                  {saving ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
