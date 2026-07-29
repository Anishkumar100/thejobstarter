import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { IndianRupee, Users, CreditCard, ArrowRight, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';

export default function AdminPayments() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/admin/payments/stats');
        setStats(res.data);
      } catch (err) {
        console.error('[ADMIN] Error fetching payment stats:', err.message);
        setError(err.message);
      }
      setLoading(false);
    })();
    (async () => {
      try {
        const res = await apiRequest('/admin/payments/transactions?limit=10');
        setTransactions(res.data);
      } catch (err) {
        console.error('[ADMIN] Error fetching transactions:', err.message);
      }
      setTxnLoading(false);
    })();
  }, []);

  const statusStyle = (status) => {
    const map = {
      success: { bg: '#dcfce7', color: '#166534' },
      failed: { bg: '#fee2e2', color: '#991b1b' },
      pending: { bg: '#fef9c3', color: '#854d0e' },
      refunded: { bg: '#f3e8ff', color: '#6b21a8' }
    };
    const s = map[status] || { bg: '#f5f5f5', color: '#555' };
    return { ...s, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, border: '2px solid #000', textTransform: 'uppercase', letterSpacing: '0.05em' };
  };

  const txnTypeLabel = (type) => {
    const map = {
      subscription_created: 'Created',
      subscription_renewed: 'Renewed',
      subscription_canceled: 'Canceled',
      promo_applied: 'Promo',
      admin_activated: 'Activated',
      admin_deactivated: 'Deactivated'
    };
    return map[type] || type;
  };

  return (
    <div>
      <Helmet><title>Payments Dashboard — Admin TheJobStarter</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Payments Dashboard</h1>
        <span className="listing-header__count">Revenue & subscription overview</span>
      </div>

      {loading && <Loader text="LOADING STATS..." />}

      {error && (
        <div style={{ padding: '1rem', border: '3px solid #dc2626', background: '#fee2e2', marginBottom: '1.5rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!loading && stats && (
        <>
          {/* ── Revenue Overview Cards ── */}
          <div className="admin-stats" style={{ marginBottom: '2rem' }}>
            <div className="admin-stats__card" style={{ borderTop: '4px solid #16a34a' }}>
              <IndianRupee size={24} style={{ color: '#16a34a', marginBottom: 8 }} />
              <div className="admin-stats__num">₹{stats.totalRevenue?.toLocaleString() || '0'}</div>
              <div className="admin-stats__label">Total Revenue</div>
            </div>
            <div className="admin-stats__card" style={{ borderTop: '4px solid #2563eb' }}>
              <Users size={24} style={{ color: '#2563eb', marginBottom: 8 }} />
              <div className="admin-stats__num">{stats.activeSubscriptions || 0}</div>
              <div className="admin-stats__label">Active Subscribers</div>
            </div>
            <div className="admin-stats__card" style={{ borderTop: '4px solid #f59e0b' }}>
              <DollarSign size={24} style={{ color: '#f59e0b', marginBottom: 8 }} />
              <div className="admin-stats__num">₹{((stats.activeSubscriptions || 0) * (stats.currentPrice || 99)).toLocaleString()}</div>
              <div className="admin-stats__label">Expected Monthly</div>
            </div>
            <div className="admin-stats__card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <CreditCard size={24} style={{ color: '#8b5cf6', marginBottom: 8 }} />
              <div className="admin-stats__num">{stats.totalTransactions || 0}</div>
              <div className="admin-stats__label">Total Transactions</div>
            </div>
            <div className="admin-stats__card" style={{ borderTop: '4px solid #dc2626' }}>
              <TrendingUp size={24} style={{ color: '#dc2626', marginBottom: 8 }} />
              <div className="admin-stats__num">{stats.canceledSubscriptions || 0}</div>
              <div className="admin-stats__label">Canceled Subs</div>
            </div>
            <div className="admin-stats__card" style={{ borderTop: '4px solid #06b6d4' }}>
              <Activity size={24} style={{ color: '#06b6d4', marginBottom: 8 }} />
              <div className="admin-stats__num">{stats.monthlyTransactions || 0}</div>
              <div className="admin-stats__label">Transactions This Month</div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link to="/admin/payments/subscribers" className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} /> Manage Subscribers <ArrowRight size={14} />
            </Link>
            <Link to="/admin/payments/promos" className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} /> Promo Codes <ArrowRight size={14} />
            </Link>
          </div>

          {/* ── Recent Transactions ── */}
          <div className="admin-card">
            <div className="listing-header" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Recent Transactions</h2>
            </div>
            {txnLoading ? (
              <Loader text="LOADING TRANSACTIONS..." />
            ) : transactions.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No transactions yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '3px solid #000' }}>
                      <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700 }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700 }}>User</th>
                      <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700 }}>Type</th>
                      <th style={{ textAlign: 'right', padding: '8px', fontWeight: 700 }}>Amount</th>
                      <th style={{ textAlign: 'center', padding: '8px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {tx.user?.displayName || tx.user?.username || tx.user?._id || '—'}
                        </td>
                        <td style={{ padding: '8px' }}>{txnTypeLabel(tx.type)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                          ₹{tx.amount?.toLocaleString() || '0'}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={statusStyle(tx.status)}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
