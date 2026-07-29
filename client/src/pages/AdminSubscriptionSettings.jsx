import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Save, RefreshCw, IndianRupee, Calendar } from 'lucide-react';

export default function AdminSubscriptionSettings() {
  const [settings, setSettings] = useState({ price: 99, durationDays: 30 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/site-config/subscription');
      setSettings(res.data);
    } catch (err) {
      console.error('[ADMIN] Error fetching subscription config:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiRequest('/site-config/subscription', {
        method: 'PUT',
        body: JSON.stringify({
          price: Number(settings.price),
          durationDays: Number(settings.durationDays)
        })
      });
      setSettings(res.data);
      showMsg('success', `Subscription settings saved — ₹${res.data.price} / ${res.data.durationDays} days`);
    } catch (err) {
      showMsg('error', err.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <Helmet><title>Subscription Settings — Admin TheJobStarter</title></Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Subscription Settings</h1>
        <span className="listing-header__count">Configure subscription price and duration</span>
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

      {loading && <Loader text="LOADING SETTINGS..." />}

      {error && (
        <div style={{ padding: '1rem', border: '3px solid #dc2626', background: '#fee2e2', marginBottom: '1.5rem', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Info Banner ── */}
          <div style={{
            padding: '1rem', marginBottom: '1.5rem', border: '3px solid #000',
            background: '#fef9c3', fontSize: '0.8rem', fontWeight: 600
          }}>
            Changes take effect immediately for new subscriptions and manual activations.
            Existing active subscriptions are not affected.
          </div>

          {/* ── Settings Form ── */}
          <form onSubmit={handleSave} style={{
            padding: '1.5rem', border: '3px solid #000',
            background: 'var(--bg-surface)', boxShadow: 'var(--shadow)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                  <IndianRupee size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Subscription Price (₹)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={settings.price}
                  onChange={e => setSettings(s => ({ ...s, price: e.target.value }))}
                  placeholder="e.g. 99"
                  style={{ width: '100%', padding: '10px 14px', border: '3px solid #000', fontSize: '1rem', fontWeight: 700 }}
                />
                <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Recurring monthly charge for new subscriptions
                </p>
              </div>

              {/* Duration */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Subscription Duration (days)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={settings.durationDays}
                  onChange={e => setSettings(s => ({ ...s, durationDays: e.target.value }))}
                  placeholder="e.g. 30"
                  style={{ width: '100%', padding: '10px 14px', border: '3px solid #000', fontSize: '1rem', fontWeight: 700 }}
                />
                <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  How many days each subscription period lasts
                </p>
              </div>
            </div>

            {/* Summary preview */}
            <div style={{
              padding: '0.75rem 1rem', marginBottom: '1.5rem', border: '2px solid #000',
              background: '#f5f5f5', fontSize: '0.8rem'
            }}>
              <strong>Summary:</strong> New subscribers will be charged <strong>₹{Number(settings.price) || 0}/month</strong>{' '}
              for <strong>{Number(settings.durationDays) || 0} days</strong> of access.
              Manual activations grant <strong>{Number(settings.durationDays) || 0} days</strong> of premium access.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn--primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button type="button" className="btn btn--sm" onClick={fetchSettings} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
