import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCoachingCenterStore } from '../stores/useCoachingCenterStore.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Shield, RefreshCw, ArrowLeft, Users, Layers, Trash2, CheckSquare, BookOpen } from 'lucide-react';

export default function AdminCoachingCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCenter, loading, error, fetchCenterById, regenerateCode, updateCenter, students, studentsLoading, fetchCenterStudents, removeStudentFromCenter, setStudents } = useCoachingCenterStore();
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [removingUserId, setRemovingUserId] = useState(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [batchAssignId, setBatchAssignId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [batchUpdates, setBatchUpdates] = useState({}); /* { userId: batchId|null } */
  const [batchChangeConfirm, setBatchChangeConfirm] = useState(null); /* { userId, batchId, currentBatchId } */
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [courseOfferingsLoading, setCourseOfferingsLoading] = useState(false);
  const [courseChangeConfirm, setCourseChangeConfirm] = useState(null); /* { userId, courseOfferingId, currentCourseId, currentCourseName } */
  const fetchedRef = useRef(false);

  useEffect(() => {
    fetchCenterById(id);
  }, [id]);

  useEffect(() => {
    if (currentCenter && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchCenterStudents(id);
      fetchBatchesForCenter();
      fetchCourseOfferingsForCenter();
    }
  }, [currentCenter]);

  /*
   * Fetch batches for this center
   */
  const fetchBatchesForCenter = async () => {
    setBatchesLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/batches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.data) {
        /* Filter batches belonging to this center */
        const centerBatches = json.data.filter(b =>
          (b.coachingCenter?._id || b.coachingCenter) === id
        );
        setBatches(centerBatches);
      }
    } catch (err) {
      console.error('[ADMIN] Error fetching batches:', err.message);
    }
    setBatchesLoading(false);
  };

  /*
   * Fetch course offerings for this center
   */
  const fetchCourseOfferingsForCenter = async () => {
    setCourseOfferingsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/coaching-centers/${id}/course-offerings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.data) setCourseOfferings(json.data);
    } catch (err) {
      console.error('[ADMIN] Error fetching course offerings:', err.message);
    }
    setCourseOfferingsLoading(false);
  };

  /*
   * Assign a student to a batch
   */
  const handleAssignStudent = async (userId, batchId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/batches/${batchId}/assign-student/${userId}`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStudents(prev => prev.map(s => s._id === userId ? { ...s, batch: { _id: batchId } } : s));
      console.log('[ADMIN] Student', userId, 'assigned to batch:', batchId);
    } catch (err) {
      console.error('[ADMIN] Assign error:', err.message);
      alert(err.message);
    }
  };

  /*
   * Remove a student from their batch
   */
  const handleRemoveStudentFromBatch = async (userId) => {
    const s = students.find(st => st._id === userId);
    const batchId = s?.batch?._id || s?.batch;
    if (!batchId) return;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/batches/${batchId}/remove-student/${userId}`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStudents(prev => prev.map(s => s._id === userId ? { ...s, batch: null } : s));
      console.log('[ADMIN] Student', userId, 'removed from batch');
    } catch (err) {
      console.error('[ADMIN] Remove error:', err.message);
      alert(err.message);
    }
  };

  /*
   * Bulk assign selected students to a batch
   */
  const handleBulkAssign = async () => {
    if (!batchAssignId || selectedStudents.length === 0) return;
    setAssigning(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/batches/${batchAssignId}/assign-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ userIds: selectedStudents })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStudents(prev => prev.map(s => selectedStudents.includes(s._id) ? { ...s, batch: { _id: batchAssignId } } : s));
      setSelectedStudents([]);
      setBatchAssignId('');
      console.log('[ADMIN] Bulk assigned', selectedStudents.length, 'students');
    } catch (err) {
      console.error('[ADMIN] Bulk assign error:', err.message);
      alert(err.message);
    }
    setAssigning(false);
  };

  /*
   * Bulk remove selected students from batch
   */
  const handleBulkRemoveFromBatch = async () => {
    if (selectedStudents.length === 0) return;
    setAssigning(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      /* Get the batch each selected student belongs to, group by batch, remove per batch */
      const batchGroups = {};
      for (const sid of selectedStudents) {
        const s = students.find(st => st._id === sid);
        const bid = s?.batch?._id || s?.batch;
        if (bid) {
          if (!batchGroups[bid]) batchGroups[bid] = [];
          batchGroups[bid].push(sid);
        }
      }
      for (const [bid, userIds] of Object.entries(batchGroups)) {
        const res = await fetch(`${API_BASE}/batches/${bid}/remove-students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ userIds })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed');
      }
      setStudents(prev => prev.map(s => selectedStudents.includes(s._id) ? { ...s, batch: null } : s));
      setSelectedStudents([]);
      console.log('[ADMIN] Bulk removed', selectedStudents.length, 'students from batch');
    } catch (err) {
      console.error('[ADMIN] Bulk remove error:', err.message);
      alert(err.message);
    }
    setAssigning(false);
  };

  useEffect(() => {
    if (currentCenter && !editing) {
      setForm({
        name: currentCenter.name || '',
        address: currentCenter.address || '',
        expectedStudents: currentCenter.expectedStudents ?? '',
        status: currentCenter.status || 'trial',
        contactName: currentCenter.contactName || '',
        contactEmail: currentCenter.contactEmail || '',
        contactPhone: currentCenter.contactPhone || '',
        logo: currentCenter.logo || '',
        code: currentCenter.code || ''
      });
    }
  }, [currentCenter, editing]);

  /*
   * Handle code regenerate with confirmation
   */
  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateCode(id);
      setConfirmRegenerate(false);
    } catch (err) {
      alert(err.message || 'Failed to regenerate code');
    }
    setRegenerating(false);
  };

  /*
   * Save edits to the centre
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCenter(id, {
        ...form,
        expectedStudents: form.expectedStudents ? Number(form.expectedStudents) : null
      });
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update centre');
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openRemoveConfirm = (userId) => {
    setRemovingUserId(userId);
    setRemoveConfirmOpen(true);
  };

  const handleRemoveStudent = async () => {
    if (!removingUserId) return;
    setRemoving(true);
    try {
      await removeStudentFromCenter(id, removingUserId);
      setRemoveConfirmOpen(false);
      setRemovingUserId(null);
    } catch (err) {
      alert(err.message || 'Failed to remove student');
    }
    setRemoving(false);
  };

  /*
   * Handle batch change — always show confirmation before any change
   */
  const handleBatchChangeRequest = (userId, batchId) => {
    const student = students.find(s => s._id === userId);
    const currentBatchId = student?.batch?._id || student?.batch;
    setBatchChangeConfirm({ userId, batchId, currentBatchId });
  };

  const confirmBatchChange = async () => {
    if (!batchChangeConfirm) return;
    const { userId, batchId } = batchChangeConfirm;
    if (batchId) await handleAssignStudent(userId, batchId);
    else await handleRemoveStudentFromBatch(userId);
    setBatchChangeConfirm(null);
  };

  /*
   * Handle course change — always show confirmation before any change
   */
  const handleCourseChangeRequest = (userId, courseOfferingId) => {
    const student = students.find(s => s._id === userId);
    const currentId = student?.courseOffering?._id || student?.courseOffering || '';
    const currentName = student?.courseOffering?.name || 'None';
    setCourseChangeConfirm({ userId, courseOfferingId, currentCourseId: currentId, currentCourseName: currentName });
  };

  const confirmCourseChange = async () => {
    if (!courseChangeConfirm) return;
    const { userId, courseOfferingId } = courseChangeConfirm;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/batches/students/${userId}/course`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ courseOfferingId: courseOfferingId || null })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      /* Update local state with the new course name */
      const newCourseName = courseOfferingId
        ? (courseOfferings.find(c => c._id === courseOfferingId)?.name || 'Selected')
        : null;
      setStudents(prev => prev.map(s => s._id === userId ? {
        ...s, courseOffering: courseOfferingId ? { _id: courseOfferingId, name: newCourseName } : null
      } : s));
      console.log('[ADMIN] Student course changed:', userId, '->', courseOfferingId || 'none');
    } catch (err) {
      console.error('[ADMIN] Course change error:', err.message);
      alert(err.message);
    }
    setCourseChangeConfirm(null);
  };

  if (loading) return <Loader text="LOADING..." />;
  if (error) return <div className="error-text">{error}</div>;
  if (!currentCenter) return <div className="error-text">Centre not found</div>;

  const statusColors = { active: 'var(--success)', trial: 'var(--warning)', suspended: 'var(--error)' };

  return (
    <div>
      <Helmet><title>{currentCenter.name} — Admin — TheJobStarter</title></Helmet>

      {/* Back link */}
      <Link to="/admin/coaching-centers" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-md)', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Back to all centres
      </Link>

      {/* Header */}
      <div className="listing-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 className="listing-header__title">{currentCenter.name}</h1>
          <span className="listing-header__count">
            <span style={{ color: statusColors[currentCenter.status], fontWeight: 700 }}>{currentCenter.status}</span>
            {' · '}Joined {new Date(currentCenter.createdAt).toLocaleDateString()}
          </span>
        </div>
        <button className="btn" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Join Code Card */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
          <Shield size={18} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Join Code</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
          Students enter this code in their profile to link to this centre.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <code className="code-display" style={{
            fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.15em',
            background: 'var(--gray-100)', padding: '8px 16px',
            border: '3px solid var(--black)'
          }}>
            {currentCenter.code}
          </code>

          {!confirmRegenerate ? (
            <button className="btn btn--sm" onClick={() => setConfirmRegenerate(true)}>
              <RefreshCw size={14} style={{ marginRight: 4 }} /> Regenerate
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Are you sure?</span>
              <button className="btn btn--sm btn--danger" onClick={handleRegenerate} disabled={regenerating}>
                {regenerating ? 'Regenerating...' : 'Yes, regenerate'}
              </button>
              <button className="btn btn--sm" onClick={() => setConfirmRegenerate(false)}>Cancel</button>
            </div>
          )}

          {currentCenter.codeRegeneratedAt && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Last regenerated {new Date(currentCenter.codeRegeneratedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="admin-card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Centre Details</h2>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Join Code</label>
            <input className="input" name="code" value={form.code} onChange={handleChange} placeholder="6-char alphanumeric" />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Status</label>
            <select className="input" name="status" value={form.status} onChange={handleChange}>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Contact Name</label>
            <input className="input" name="contactName" value={form.contactName} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Contact Email</label>
            <input className="input" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Contact Phone</label>
            <input className="input" name="contactPhone" value={form.contactPhone} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Expected Students</label>
            <input className="input" name="expectedStudents" type="number" value={form.expectedStudents} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Address</label>
            <textarea className="input" name="address" value={form.address} onChange={handleChange} rows={2} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Logo URL</label>
            <input className="input" name="logo" value={form.logo} onChange={handleChange} />

            <div style={{ marginTop: 'var(--space-md)' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', fontSize: '0.9rem' }}>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Contact</span>
              <p>{currentCenter.contactName || '—'}</p>
              <p>{currentCenter.contactEmail || '—'}</p>
              <p>{currentCenter.contactPhone || '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Details</span>
              <p>Expected students: {currentCenter.expectedStudents ?? '—'}</p>
              <p>Address: {currentCenter.address || '—'}</p>
              {currentCenter.logo && (
                <div style={{ marginTop: 'var(--space-sm)' }}>
                  <img src={currentCenter.logo} alt="" style={{ maxWidth: 120, border: '3px solid var(--black)' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Batches */}
      <div className="admin-card" style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
          <Layers size={18} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Batches ({batches.length})
          </h2>
        </div>

        {batchesLoading ? (
          <Loader text="Loading batches..." />
        ) : batches.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            No batches created for this centre yet. Coordinators can create batches.
          </p>
        ) : (
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid var(--black)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Code</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Expected</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b._id} style={{ borderBottom: '2px solid var(--gray-300)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{b.name}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{b.code}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        padding: '2px 8px', border: '2px solid var(--black)',
                        background: b.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>{b.expectedStudents || '—'}</td>
                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Roster */}
      <div className="admin-card" style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Students ({students.length})
            </h2>
          </div>
          {batches.length > 0 && selectedStudents.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input"
                style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto' }}
                value={batchAssignId}
                onChange={e => setBatchAssignId(e.target.value)}
              >
                <option value="">— Assign to batch —</option>
                {batches.filter(b => b.status === 'active').map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
              <button className="btn btn--sm" onClick={handleBulkAssign} disabled={assigning || !batchAssignId}>
                {assigning ? 'Assigning...' : `Assign (${selectedStudents.length})`}
              </button>
              <button className="btn btn--sm btn--danger" onClick={handleBulkRemoveFromBatch} disabled={assigning}>
                Remove from batch
              </button>
            </div>
          )}
        </div>

        {studentsLoading ? (
          <Loader text="Loading students..." />
        ) : students.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            No students have linked to this centre yet.
          </p>
        ) : (
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid var(--black)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 700, width: 36 }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={e => setSelectedStudents(e.target.checked ? students.map(s => s._id) : [])}
                    />
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>College</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Batch</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Course</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Joined</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const currentBatchId = s.batch?._id || s.batch;
                  const currentBatchName = s.batch?.name || '';
                  return (
                    <tr key={s._id} style={{ borderBottom: '2px solid var(--gray-300)' }}>
                      <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s._id)}
                          onChange={e => {
                            setSelectedStudents(prev =>
                              e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                            );
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => navigate(`/admin/coaching-centers/${id}/students/${s._id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {s.avatar ? (
                            <img src={s.avatar} alt="" style={{ width: 28, height: 28, border: '2px solid var(--black)', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, border: '2px solid var(--black)', background: 'var(--gray-300)' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.displayName || s.username}</div>
                            {s.displayName && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>@{s.username}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)' }}>{s.email || '—'}</td>
                      <td style={{ padding: '8px 12px' }}>{s.college || '—'}</td>
                      <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <select
                            className="input"
                            style={{ fontSize: '0.78rem', padding: '2px 4px', width: 140 }}
                            value={currentBatchId || ''}
                            onChange={e => {
                              handleBatchChangeRequest(s._id, e.target.value);
                            }}
                          >
                            <option value="">— No batch —</option>
                            {batches.filter(b => b.status === 'active').map(b => (
                              <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                          </select>
                          {currentBatchName && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{currentBatchName}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <select
                            className="input"
                            style={{ fontSize: '0.78rem', padding: '2px 4px', width: 140 }}
                            value={s.courseOffering?._id || s.courseOffering || ''}
                            onChange={e => handleCourseChangeRequest(s._id, e.target.value)}
                          >
                            <option value="">— No course —</option>
                            {courseOfferings.filter(c => c.status === 'active').map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                          {s.courseOffering?.name && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{s.courseOffering.name}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                        {s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn--sm"
                            onClick={() => navigate(`/admin/coaching-centers/${id}/students/${s._id}`)}
                            style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                          >
                            View
                          </button>
                          <button
                            className="btn btn--sm btn--danger"
                            onClick={() => openRemoveConfirm(s._id)}
                            title="Remove from centre"
                            style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch change confirmation modal */}
      <Modal isOpen={batchChangeConfirm !== null} onClose={() => setBatchChangeConfirm(null)} title="Change Batch Assignment">
        <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          {batchChangeConfirm?.currentBatchId ? (
            <>
              <strong>Warning:</strong> This student is already assigned to a batch. Changing their batch will move them to the new one.
            </>
          ) : (
            <>
              Are you sure you want to assign this student to a batch?
            </>
          )}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setBatchChangeConfirm(null)}>Cancel</button>
          <button className="btn btn--primary" onClick={confirmBatchChange}>
            {batchChangeConfirm?.batchId ? 'Yes, assign to batch' : 'Yes, remove from batch'}
          </button>
        </div>
      </Modal>

      {/* Course change confirmation modal */}
      <Modal isOpen={courseChangeConfirm !== null} onClose={() => setCourseChangeConfirm(null)} title="Change Course Assignment">
        <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          {courseChangeConfirm?.currentCourseId ? (
            <>
              <strong>Warning:</strong> Are you sure you want to change this student's course from <strong>{courseChangeConfirm.currentCourseName}</strong> to <strong>
                {courseChangeConfirm.courseOfferingId
                  ? (courseOfferings.find(c => c._id === courseChangeConfirm.courseOfferingId)?.name || 'new course')
                  : 'No course'}
              </strong>?
            </>
          ) : (
            <>
              Are you sure you want to assign <strong>
                {courseChangeConfirm ? (courseOfferings.find(c => c._id === courseChangeConfirm.courseOfferingId)?.name || 'this course') : 'this course'}
              </strong> to this student?
            </>
          )}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setCourseChangeConfirm(null)}>Cancel</button>
          <button className="btn btn--primary" onClick={confirmCourseChange}>
            {courseChangeConfirm?.courseOfferingId ? 'Yes, assign course' : 'Yes, remove course'}
          </button>
        </div>
      </Modal>

      {/* Remove student confirmation modal */}
      <Modal isOpen={removeConfirmOpen} onClose={() => setRemoveConfirmOpen(false)} title="Remove Student">
        <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          Are you sure you want to remove this student from <strong>{currentCenter.name}</strong>?<br />
          Their profile data will be preserved — they just won't be linked to this centre anymore.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setRemoveConfirmOpen(false)}>Cancel</button>
          <button className="btn btn--danger" onClick={handleRemoveStudent} disabled={removing}>
            {removing ? 'Removing...' : 'Yes, remove'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
