import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCoachingCenterStore } from '../stores/useCoachingCenterStore.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Shield, RefreshCw, ArrowLeft, Users, Trash2 } from 'lucide-react';

export default function AdminCoachingCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCenter, loading, error, fetchCenterById, regenerateCode, updateCenter, students, studentsLoading, fetchCenterStudents, removeStudentFromCenter } = useCoachingCenterStore();
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [removingUserId, setRemovingUserId] = useState(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchCenterById(id);
  }, [id]);

  useEffect(() => {
    if (currentCenter) {
      fetchCenterStudents(id);
    }
  }, [currentCenter]);

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

      {/* Student Roster */}
      <div className="admin-card" style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
          <Users size={18} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Students ({students.length})
          </h2>
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
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>College</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Joined</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} style={{ borderBottom: '2px solid var(--gray-300)', cursor: 'pointer' }} onClick={() => navigate(`/admin/coaching-centers/${id}/students/${s._id}`)}>
                    <td style={{ padding: '8px 12px' }}>
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
                    <td style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                      {s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => openRemoveConfirm(s._id)}
                        title="Remove from centre"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
