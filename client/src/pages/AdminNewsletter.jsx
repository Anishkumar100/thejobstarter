import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import DataTable from '../components/admin/DataTable.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/newsletter');
      setSubscribers(res.data);
    } catch (err) {
      console.error('[ADMIN] Error fetching subscribers:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleRemove = async (id) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await apiRequest(`/newsletter/${id}`, { method: 'DELETE' });
      setSubscribers(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('[ADMIN] Error removing subscriber:', err.message);
    }
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'createdAt', label: 'Subscribed', render: v => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = subscribers.map(s => ({
    ...s,
    actions: (
      <div className="admin-actions">
        <button className="btn btn--sm btn--danger" onClick={() => handleRemove(s._id)}>Remove</button>
      </div>
    )
  }));

  return (
    <div>
      <Helmet>
        <title>Newsletter Subscribers — TheJobStarter Admin</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Newsletter Subscribers</h1>
        <span className="listing-header__count">{subscribers.length} total</span>
      </div>

      {loading && <Loader text="LOADING SUBSCRIBERS..." />}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <DataTable columns={columns} rows={rows} />
      )}
    </div>
  );
}
