import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../stores/useAdminStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';
import { Download01Icon } from 'hugeicons-react';

export default function AdminUsers() {
  const { users, loading, error, fetchUsers, deleteUser } = useAdminStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await deleteUser(id);
  };

  const columns = [
    { key: 'displayName', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'joinDate', label: 'Joined', render: v => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = (users || []).map(u => ({
    ...u,
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
        <button
          className="btn btn--sm"
          style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
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
      {loading && <Loader text="LOADING USERS..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
