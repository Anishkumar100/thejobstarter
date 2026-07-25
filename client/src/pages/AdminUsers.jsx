import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../stores/useAdminStore.js';
import { useCoachingCenterStore } from '../stores/useCoachingCenterStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';
import { Download01Icon, Building02Icon } from 'hugeicons-react';

export default function AdminUsers() {
  const { users, loading, error, fetchUsers, deleteUser } = useAdminStore();
  const { centers, fetchCenters } = useCoachingCenterStore();
  const [exporting, setExporting] = useState(false);
  const [centerFilter, setCenterFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  /* Fetch centers on mount for the filter dropdown */
  useEffect(() => { fetchCenters(); }, []);

  /* Re-fetch users when filters change */
  useEffect(() => {
    const params = {};
    if (centerFilter) params.coachingCenter = centerFilter;
    if (roleFilter) params.role = roleFilter;
    fetchUsers(params);
  }, [centerFilter, roleFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await deleteUser(id);
  };

  const columns = [
    { key: 'displayName', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'center', label: 'Coaching Centre' },
    { key: 'role', label: 'Role' },
    { key: 'joinDate', label: 'Joined', render: v => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = (users || []).map(u => ({
    ...u,
    center: u.coachingCenter?.name || '—',
    role: u.coordinatorFor
      ? <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', border: '2px solid #000', background: '#dbeafe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordinator</span>
      : <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Student</span>,
    actions: (
      <div className="admin-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Link to={`/users/${u.username}`} className="btn btn--sm">View</Link>
        <Link to={`/admin/users/${u._id}/edit`} className="btn btn--sm">Edit</Link>
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(u._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Users — Admin TheJobStarter</title></Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">Users</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn--sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={async () => {
              setExporting(true);
              try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const token = await window.Clerk?.session?.getToken();
                const res = await fetch(`${API_BASE}/admin/users/export`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) throw new Error('Export failed');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all_users_progress_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error('[AdminUsers] Export error:', err.message);
              } finally { setExporting(false); }
            }}
            disabled={exporting}
          >
            <Download01Icon size={14} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Building02Icon size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <select
            className="input"
            value={centerFilter}
            onChange={e => setCenterFilter(e.target.value)}
            style={{ width: 260, fontSize: '0.82rem', padding: '6px 8px' }}
          >
            <option value="">All centres</option>
            <option value="none">Without centre</option>
            <option disabled>———</option>
            {centers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {centerFilter && (
            <button className="btn btn--sm btn--ghost" onClick={() => setCenterFilter('')}>
              Clear
            </button>
          )}
        </div>

        <select
          className="input"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ width: 160, fontSize: '0.82rem', padding: '6px 8px' }}
        >
          <option value="">All roles</option>
          <option value="coordinator">Coordinators</option>
          <option value="student">Students</option>
        </select>
        {roleFilter && (
          <button className="btn btn--sm btn--ghost" onClick={() => setRoleFilter('')}>
            Clear
          </button>
        )}
      </div>

      {loading && <Loader text="LOADING USERS..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
