import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { RefreshCw, CheckCircle } from 'lucide-react';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('subscribed');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actingId, setActingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 50 };
      if (statusFilter && statusFilter !== 'subscribed') params.status = statusFilter;
      const qs = new URLSearchParams(params).toString();
      const res = await apiRequest(`/admin/payments/subscriptions?${qs}`);
      setSubscribers(res.data);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('[ADMIN] Error fetching subscribers:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleActivate = async (userId) => {
    const months = prompt('How many months of access should this user get?', '1');
    if (!months) return;
    const numMonths = parseInt(months, 10);
    if (!numMonths || numMonths < 1) {
      alert('Please enter a valid number of months (minimum 1).');
      return;
    }
    setActingId(userId);
    setMessage(null);
    try {
      await apiRequest(`/admin/payments/subscriptions/${userId}/activate`, {
        method: 'POST',
        body: JSON.stringify({ months: numMonths })
      });
      setMessage({ type: 'success', text: `Subscription activated for ${numMonths} month${numMonths > 1 ? 's' : ''}` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setActingId(null);
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate subscription for this user immediately? Access will be revoked.')) return;
    setActingId(userId);
    setMessage(null);
    try {
      await apiRequest(`/admin/payments/subscriptions/${userId}/deactivate`, { method: 'POST' });
      setMessage({ type: 'success', text: 'Subscription deactivated' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setActingId(null);
  };

  const handleCancel = async (userId) => {
    if (!confirm('Cancel subscription for this user permanently?')) return;
    setActingId(userId);
    setMessage(null);
    try {
      await apiRequest(`/admin/payments/subscriptions/${userId}/cancel`, { method: 'POST' });
      setMessage({ type: 'success', text: 'Subscription canceled' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setActingId(null);
  };

  const statusBadge = (status) => {
    const map = {
      active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
      canceled: { bg: '#fef9c3', color: '#854d0e', label: 'Canceled' },
      expired: { bg: '#fee2e2', color: '#991b1b', label: 'Expired' },
      past_due: { bg: '#ffedd5', color: '#9a3412', label: 'Past Due' },
      free: { bg: '#f5f5f5', color: '#555', label: 'Free' }
    };
    const s = map[status] || { bg: '#f5f5f5', color: '#555', label: status || 'Never Subscribed' };
    return <span style={{ ...s, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, border: '2px solid #000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>;
  };

  return (
    <div>
      <Helmet><title>Subscribers — Admin TheJobStarter</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Subscriber Management</h1>
        <span className="listing-header__count">Activate or deactivate user subscriptions</span>
      </div>

      {/* ── Toast Message ── */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.8rem',
          border: '3px solid #000',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2'
        }}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', border: '3px solid #000', background: 'var(--bg-surface)', fontWeight: 600, fontSize: '0.8rem' }}
          >
            <option value="subscribed">Subscribed (Active / Canceled / Expired)</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="expired">Expired</option>
            <option value="past_due">Past Due</option>
            <option value="free">Never Subscribed</option>
          </select>
        <button className="btn btn--sm" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading && <Loader text="LOADING SUBSCRIBERS..." />}

      {error && (
        <div style={{ padding: '1rem', border: '3px solid #dc2626', background: '#fee2e2', marginBottom: '1.5rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!loading && subscribers.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '3rem' }}>
          No subscribers found.
        </p>
      )}

      {!loading && subscribers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '3px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 700 }}>User</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: 700 }}>Email</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Status</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Period Start</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Period End</th>
                <th style={{ textAlign: 'center', padding: '10px', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => {
                const subData = sub.subscription || {};
                return (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {sub.avatar ? (
                        <img src={sub.avatar} alt="" style={{ width: 28, height: 28, borderRadius: 0, border: '2px solid #000', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 28, height: 28, border: '2px solid #000', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                          {sub.displayName?.[0] || sub.username?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{sub.displayName || sub.username || '—'}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>@{sub.username}</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.75rem' }}>{sub.email || '—'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{statusBadge(subData.status)}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {subData.currentPeriodStart ? new Date(subData.currentPeriodStart).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {subData.currentPeriodEnd ? new Date(subData.currentPeriodEnd).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {subData.status !== 'active' ? (
                          <button
                            className="btn btn--sm"
                            style={{ background: '#dcfce7', color: '#166534', border: '2px solid #166534', display: 'flex', alignItems: 'center', gap: 4 }}
                            onClick={() => handleActivate(sub._id)}
                            disabled={actingId === sub._id}
                          >
                            <CheckCircle size={12} /> {actingId === sub._id ? '...' : 'Activate'}
                          </button>
                        ) : (
                          <button
                            className="btn btn--sm"
                            style={{ background: '#fee2e2', color: '#991b1b', border: '2px solid #991b1b', display: 'flex', alignItems: 'center', gap: 4 }}
                            onClick={() => handleCancel(sub._id)}
                            disabled={actingId === sub._id}
                          >
                            {actingId === sub._id ? '...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button className="btn btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ padding: '8px', fontWeight: 700, fontSize: '0.8rem' }}>Page {page} of {totalPages}</span>
          <button className="btn btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
