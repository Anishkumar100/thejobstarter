import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../stores/useAdminStore.js';
import { fetchCoachingCenters } from '../api/coachingCenterApi.js';
import Loader from '../components/ui/Loader.jsx';
import Button from '../components/ui/Button.jsx';

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchUserById, updateUser } = useAdminStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({});
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(true);

  /* Fetch coaching centers for coordinator assignment */
  useEffect(() => {
    fetchCoachingCenters()
      .then(res => {
        setCenters(res.data || []);
        setCentersLoading(false);
      })
      .catch(() => setCentersLoading(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchUserById(id)
      .then(u => {
        setUser(u);
        setForm({
          displayName: u.displayName || '',
          username: u.username || '',
          email: u.email || '',
          bio: u.bio || '',
          college: u.college || '',
          year: u.year || '',
          skills: (u.skills || []).join(', '),
          coordinatorFor: u.coordinatorFor || ''
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        displayName: form.displayName || undefined,
        username: form.username || undefined,
        email: form.email || undefined,
        bio: form.bio || undefined,
        college: form.college || undefined,
        year: form.year || undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        coordinatorFor: form.coordinatorFor || null
      };
      await updateUser(id, payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 'var(--space-lg)' }}><Loader text="Loading user..." /></div>;
  if (error && !user) return <div style={{ padding: 'var(--space-lg)' }}><p className="error-text">{error}</p></div>;

  return (
    <div>
      <Helmet><title>Edit User — Admin TheJobStarter</title></Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">Edit User: {user?.username}</h1>
      </div>

      {error && <p style={{ color: 'var(--error-text)', marginBottom: 'var(--space-md)' }}>{error}</p>}
      {success && <p style={{ color: 'var(--success-text)', marginBottom: 'var(--space-md)' }}>User updated!</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: 600 }}>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Display Name</label>
          <input className="input" value={form.displayName} onChange={e => handleChange('displayName', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Username</label>
          <input className="input" value={form.username} onChange={e => handleChange('username', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
          <input className="input" value={form.email} onChange={e => handleChange('email', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Bio</label>
          <textarea className="input" rows={3} value={form.bio} onChange={e => handleChange('bio', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>College</label>
          <input className="input" value={form.college} onChange={e => handleChange('college', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Year</label>
          <input className="input" value={form.year} onChange={e => handleChange('year', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Skills (comma-separated)</label>
          <input className="input" value={form.skills} onChange={e => handleChange('skills', e.target.value)} placeholder="React, Node.js, Python" />
        </div>

        {/* ═══ Coordinator Assignment ═══ */}
        <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '2px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Coordinator Assignment</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
            Assign this user as a coordinator for a coaching center. The user must also have
            <code style={{ fontSize: '0.75rem', background: 'var(--bg-inverse)', padding: '1px 4px' }}>role: "coordinator"</code>
            set in their Clerk public metadata (manage in Clerk dashboard).
          </p>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Coaching Center</label>
            {centersLoading ? (
              <Loader text="Loading centers..." />
            ) : (
              <select
                className="input"
                value={form.coordinatorFor}
                onChange={e => handleChange('coordinatorFor', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Not a coordinator</option>
                {centers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            )}
            {form.coordinatorFor && (
              <p style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: 4 }}>
                User is assigned as coordinator for the selected center.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button onClick={() => navigate('/admin/users')}>Back</Button>
        </div>
      </div>
    </div>
  );
}
