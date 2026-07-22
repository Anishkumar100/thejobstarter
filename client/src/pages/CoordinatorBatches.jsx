import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Layers, Plus, Users, Trash2, BookOpen, Search, Calendar, X } from 'lucide-react';

const CARD = {
  border: '4px solid #000',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: '6px 6px 0 #000',
};

export default function CoordinatorBatches() {
  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [form, setForm] = useState({ name: '', expectedStudents: '', courseOffering: '' });
  const [saving, setSaving] = useState(false);
  const [assignBatchId, setAssignBatchId] = useState(null);
  const [selectedAddIds, setSelectedAddIds] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [editingCourseBatchId, setEditingCourseBatchId] = useState(null);
  const [editingCourseValue, setEditingCourseValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDate, setFilterDate] = useState('');

  /*
   * Fetch all batches and student roster
   */
  const fetchBatches = useCallback(async () => {
    console.log('[COORD BATCHES] Fetching batches...');
    setLoading(true);
    setError(null);
    try {
      const [batchesRes, rosterRes, courseRes] = await Promise.all([
        apiRequest('/coordinator/batches'),
        apiRequest('/coordinator/students'),
        apiRequest('/coordinator/course-offerings')
      ]);
      setBatches(batchesRes.data || []);
      setAllStudents(rosterRes.data?.students || []);
      setCourseOfferings(courseRes.data || []);
    } catch (err) {
      console.error('[COORD BATCHES] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  /*
   * Count students in a batch
   */
  const getBatchStudentCount = (batchId) => {
    return allStudents.filter(s => {
      const bid = s.batch?._id || s.batch;
      return bid === batchId;
    }).length;
  };

  /*
   * Create a new batch
   */
  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await apiRequest('/coordinator/batches', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          courseOffering: form.courseOffering || null,
          expectedStudents: form.expectedStudents ? Number(form.expectedStudents) : null
        })
      });
      console.log('[COORD BATCHES] Batch created:', res.data?._id);
      setBatches(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', expectedStudents: '', courseOffering: '' });
    } catch (err) {
      console.error('[COORD BATCHES] Create error:', err.message);
      alert(err.message || 'Failed to create batch');
    }
    setSaving(false);
  };

  /*
   * Delete a batch (unlinks any remaining students first)
   */
  const handleDelete = async (batchId) => {
    if (!confirm('Delete this batch permanently? Students currently linked will be unassigned.')) return;
    try {
      await apiRequest(`/coordinator/batches/${batchId}`, { method: 'DELETE' });
      console.log('[COORD BATCHES] Batch deleted:', batchId);
      setBatches(prev => prev.filter(b => b._id !== batchId));
    } catch (err) {
      console.error('[COORD BATCHES] Delete error:', err.message);
      alert(err.message || 'Failed to delete batch');
    }
  };

  /*
   * Open assign modal for a batch
   */
  const handleOpenAssign = (batchId) => {
    setAssignBatchId(batchId);
    setSelectedAddIds([]);
  };

  /*
   * Add selected students to batch
   */
  const handleAddStudents = async () => {
    if (!assignBatchId || selectedAddIds.length === 0) return;
    setAssigning(true);
    try {
      await apiRequest(`/coordinator/batches/${assignBatchId}/assign-students`, {
        method: 'POST',
        body: JSON.stringify({ userIds: selectedAddIds })
      });
      setAllStudents(prev => prev.map(s => selectedAddIds.includes(s._id) ? { ...s, batch: { _id: assignBatchId } } : s));
      setAssignBatchId(null);
      setSelectedAddIds([]);
      console.log('[COORD BATCHES] Added', selectedAddIds.length, 'students to batch:', assignBatchId);
    } catch (err) {
      console.error('[COORD BATCHES] Add students error:', err.message);
      alert(err.message || 'Failed to add students');
    }
    setAssigning(false);
  };

  /*
   * Save course offering on a batch
   */
  const handleSaveCourseEdit = async (batchId) => {
    if (!batchId) return;
    try {
      await apiRequest(`/coordinator/batches/${batchId}`, {
        method: 'PATCH',
        body: JSON.stringify({ courseOffering: editingCourseValue || null })
      });
      setBatches(prev => prev.map(b => b._id === batchId ? { ...b, courseOffering: editingCourseValue || null } : b));
      setEditingCourseBatchId(null);
      setEditingCourseValue('');
      console.log('[COORD BATCHES] Batch course updated:', batchId);
    } catch (err) {
      console.error('[COORD BATCHES] Course edit error:', err.message);
      alert(err.message || 'Failed to update course');
    }
  };

  if (loading) return <Loader text="LOADING BATCHES..." />;

  const unassignedStudents = allStudents.filter(s => !s.batch);

  /*
   * Filter batches by search, course, and date range
   */
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const filteredBatches = batches.filter(b => {
    /* Search by name or code */
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!b.name.toLowerCase().includes(q) && !b.code.toLowerCase().includes(q)) return false;
    }
    /* Filter by course */
    if (filterCourse) {
      const coId = b.courseOffering?._id || b.courseOffering;
      if (coId !== filterCourse) return false;
    }
    /* Filter by date range */
    if (filterDate) {
      if (!b.createdAt) return false;
      const created = new Date(b.createdAt);
      if (isNaN(created.getTime())) return false;
      switch (filterDate) {
        case 'year': if (created < startOfYear) return false; break;
        case '6months': if (created < sixMonthsAgo) return false; break;
        case '1month': if (created < oneMonthAgo) return false; break;
        case 'today': if (created < startOfToday) return false; break;
      }
    }
    return true;
  });

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>Batches — Coordinator — TheWebytes</title></Helmet>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={28} /> Batches
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Create and manage student cohorts. Click a batch to manage its students.
          </p>
        </div>
        <button className="btn" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Batch
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{
          flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 6,
          border: '3px solid #000', padding: '6px 10px', background: 'var(--bg-surface)',
          boxShadow: '4px 4px 0 #000'
        }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input className="input" placeholder="Search by name or code..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.82rem', background: 'transparent', padding: 0 }} />
          {searchQuery && (
            <button className="btn btn--sm btn--ghost" onClick={() => setSearchQuery('')}
              style={{ padding: '2px 4px', fontSize: '0.6rem', flexShrink: 0 }}>
              <X size={12} />
            </button>
          )}
        </div>
        <select className="input" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          style={{ width: 180, fontSize: '0.78rem', padding: '6px 8px' }}>
          <option value="">All courses</option>
          {courseOfferings.filter(c => c.status === 'active').map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select className="input" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          style={{ width: 160, fontSize: '0.78rem', padding: '6px 8px' }}>
          <option value="">All time</option>
          <option value="year">This year</option>
          <option value="6months">Within 6 months</option>
          <option value="1month">Within 1 month</option>
          <option value="today">Today</option>
        </select>
        {(searchQuery || filterCourse || filterDate) && (
          <button className="btn btn--sm btn--ghost" onClick={() => { setSearchQuery(''); setFilterCourse(''); setFilterDate(''); }}
            style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            <X size={14} /> Clear filters
          </button>
        )}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
          {filteredBatches.length} / {batches.length} batches
        </span>
      </div>

      {error && (
        <div style={{ ...CARD, background: 'var(--error-bg)', marginBottom: 'var(--space-lg)' }}>
          <p style={{ fontWeight: 700 }}>Error loading batches</p>
          <p style={{ fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {!error && batches.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <Layers size={48} style={{ marginBottom: 'var(--space-md)', color: 'var(--gray-500)' }} />
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', fontSize: '1.1rem' }}>No batches yet</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }}>
            Create your first batch to group students into cohorts.
          </p>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Batch
          </button>
        </div>
      )}

      {!error && batches.length > 0 && filteredBatches.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <Layers size={48} style={{ marginBottom: 'var(--space-md)', color: 'var(--gray-500)' }} />
          <p style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', fontSize: '1.1rem' }}>No batches match your filters</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }}>
            Try a different search term or clear the filters.
          </p>
          <button className="btn btn--sm btn--ghost" onClick={() => { setSearchQuery(''); setFilterCourse(''); setFilterDate(''); }}>
            Clear filters
          </button>
        </div>
      )}

      {filteredBatches.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {filteredBatches.map(b => {
            const studentCount = getBatchStudentCount(b._id);
            return (
              <div key={b._id}>
                <Link to={`/coordinator/batches/${b._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ ...CARD, cursor: 'pointer', transition: 'all 0.12s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '8px 8px 0 #000'; e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '6px 6px 0 #000'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>{b.name}</h3>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--text-tertiary)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>
                          Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.12em', color: '#000' }}>{b.code}</strong>
                        </span>
                        <span><Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{studentCount} students</span>
                        {b.expectedStudents && <span>Expected: {b.expectedStudents}</span>}
                        {(() => {
                          const coId = b.courseOffering?._id || b.courseOffering;
                          const found = coId && courseOfferings.find(c => c._id === coId);
                          return found ? (
                            <span style={{
                              padding: '2px 6px', border: '2px solid var(--black)',
                              background: 'var(--bg-tertiary)', fontSize: '0.65rem', fontWeight: 600
                            }}>
                              <BookOpen size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                              {found.name}
                            </span>
                          ) : null;
                        })()}
                        <span style={{
                          padding: '2px 6px', border: '2px solid var(--black)',
                          background: b.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: '2px', alignItems: 'center' }}>
                  <button
                    className="btn btn--sm"
                    onClick={(e) => { e.preventDefault(); handleOpenAssign(b._id); }}
                    disabled={unassignedStudents.length === 0}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Plus size={12} /> Assign Students
                  </button>
                  {/* Inline course editor */}
                  {editingCourseBatchId === b._id ? (
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <select className="input" style={{ fontSize: '0.7rem', padding: '2px 4px', width: 140 }}
                        value={editingCourseValue}
                        onChange={e => setEditingCourseValue(e.target.value)}
                        autoFocus
                      >
                        <option value="">— No course —</option>
                        {courseOfferings.filter(c => c.status === 'active').map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                      <button className="btn btn--sm" onClick={(e) => { e.preventDefault(); handleSaveCourseEdit(b._id); }}
                        style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Save</button>
                      <button className="btn btn--sm btn--ghost" onClick={(e) => { e.preventDefault(); setEditingCourseBatchId(null); }}
                        style={{ fontSize: '0.65rem', padding: '2px 6px' }}>X</button>
                    </span>
                  ) : (
                    <button
                      className="btn btn--sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingCourseBatchId(b._id);
                        setEditingCourseValue(b.courseOffering?._id || b.courseOffering || '');
                      }}
                      style={{ fontSize: '0.7rem' }}
                    >
                      <BookOpen size={12} /> Edit Course
                    </button>
                  )}
                  <button
                    className="btn btn--sm btn--danger"
                    onClick={(e) => { e.preventDefault(); handleDelete(b._id); }}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Batch Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>New Batch</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <div className="input-group">
            <label>Batch Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Jan 2027 Weekend Batch" required />
          </div>
          <div className="input-group">
            <label>Course / Program</label>
            <select className="input" value={form.courseOffering} onChange={e => setForm(prev => ({ ...prev, courseOffering: e.target.value }))}>
              <option value="">— No course —</option>
              {courseOfferings.filter(c => c.status === 'active').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Expected Students</label>
            <input className="input" type="number" value={form.expectedStudents} onChange={e => setForm(prev => ({ ...prev, expectedStudents: e.target.value }))} placeholder="Optional" />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Creating...' : 'Create Batch'}</button>
          </div>
        </form>
      </Modal>

      {/* Assign Students Modal */}
      <Modal isOpen={assignBatchId !== null} onClose={() => setAssignBatchId(null)}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>
          Assign Students — {batches.find(b => b._id === assignBatchId)?.name || ''}
        </h2>
        {unassignedStudents.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            All students are already assigned to a batch.
          </p>
        ) : (
          <>
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '3px solid var(--black)', padding: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
              {unassignedStudents.map(s => (
                <label key={s._id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', cursor: 'pointer', fontSize: '0.85rem',
                  borderBottom: '1px solid var(--gray-300)',
                  background: selectedAddIds.includes(s._id) ? 'var(--accent-bg)' : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedAddIds.includes(s._id)}
                    onChange={e => {
                      setSelectedAddIds(prev =>
                        e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                      );
                    }}
                  />
                  <div>
                    <strong>{s.displayName || s.username}</strong>
                    {s.email && <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{s.email}</div>}
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--ghost" onClick={() => setAssignBatchId(null)}>Cancel</button>
              <button type="button" className="btn" onClick={handleAddStudents} disabled={selectedAddIds.length === 0 || assigning}>
                {assigning ? 'Adding...' : `Add Selected (${selectedAddIds.length})`}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
