import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../stores/useAdminStore.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminUsers() {
  const { users, loading, error, fetchUsers, deleteUser } = useAdminStore();

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
      <div className="admin-actions">
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(u._id)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet><title>Users — Admin TheJobStarter</title></Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">Users</h1>
      </div>
      {loading && <Loader text="LOADING USERS..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <DataTable columns={columns} rows={rows} />}
    </div>
  );
}
