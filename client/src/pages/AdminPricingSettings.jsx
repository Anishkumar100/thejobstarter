import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Save, Plus, Trash2, RefreshCw, AlertTriangle, IndianRupee, Calendar } from 'lucide-react';

const EMPTY_PLAN = {
  id: '',
  name: '',
  description: '',
  price: 0,
  interval: 'monthly',
  features: [''],
  ctaText: 'Subscribe',
  ctaLink: '',
  highlighted: false,
  badge: '',
  active: true
};

export default function AdminPricingSettings() {
  const [plans, setPlans] = useState([]);
  const [subSettings, setSubSettings] = useState({ price: 99, durationDays: 30 });
  const [loading, setLoading] = useState(true);
  const [savingSub, setSavingSub] = useState(false);
  const [savingPlans, setSavingPlans] = useState(false);
  const [message, setMessage] = useState(null);

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        apiRequest('/site-config/pricing/admin'),
        apiRequest('/site-config/subscription')
      ]);
      setPlans(plansRes.data);
      setSubSettings(subRes.data);
    } catch (err) {
      console.error('[ADMIN] Error fetching pricing data:', err.message);
      showMsg('error', err.message);
    }
    setLoading(false);
  }, [showMsg]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveSubscription = async () => {
    setSavingSub(true);
    try {
      const res = await apiRequest('/site-config/subscription', {
        method: 'PUT',
        body: JSON.stringify({
          price: Number(subSettings.price),
          durationDays: Number(subSettings.durationDays)
        })
      });
      setSubSettings(res.data);
      showMsg('success', `Payment config saved — ₹${res.data.price} / ${res.data.durationDays} days`);
    } catch (err) {
      showMsg('error', err.message);
    }
    setSavingSub(false);
  };

  const savePlans = async () => {
    setSavingPlans(true);
    try {
      const res = await apiRequest('/site-config/pricing/plans', {
        method: 'PUT',
        body: JSON.stringify({ plans })
      });
      setPlans(res.data);
      showMsg('success', `Saved ${res.data.length} pricing plans`);
    } catch (err) {
      showMsg('error', err.message);
    }
    setSavingPlans(false);
  };

  const addPlan = () => {
    setPlans(prev => [...prev, { ...EMPTY_PLAN, id: `plan_${Date.now()}` }]);
  };

  const removePlan = (index) => {
    setPlans(prev => prev.filter((_, i) => i !== index));
  };

  const updatePlan = (index, field, value) => {
    setPlans(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateFeature = (planIndex, featureIndex, value) => {
    setPlans(prev => {
      const next = [...prev];
      const features = [...next[planIndex].features];
      features[featureIndex] = value;
      next[planIndex] = { ...next[planIndex], features };
      return next;
    });
  };

  const addFeature = (planIndex) => {
    setPlans(prev => {
      const next = [...prev];
      next[planIndex] = { ...next[planIndex], features: [...next[planIndex].features, ''] };
      return next;
    });
  };

  const removeFeature = (planIndex, featureIndex) => {
    setPlans(prev => {
      const next = [...prev];
      const features = next[planIndex].features.filter((_, i) => i !== featureIndex);
      next[planIndex] = { ...next[planIndex], features };
      return next;
    });
  };

  const movePlan = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= plans.length) return;
    setPlans(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div>
      <Helmet><title>Pricing Settings — Admin TheJobStarter</title></Helmet>

      <div className="listing-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="listing-header__title">Pricing Settings</h1>
          <span className="listing-header__count">
            Payment config + {plans.length} pricing plan{plans.length !== 1 ? 's' : ''} for the public /pricing page
          </span>
        </div>
        <button className="btn btn--sm" onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Toast */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.8rem',
          border: '3px solid #000',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2'
        }}>
          {message.type === 'success' ? '✓ ' : '✗ '}{message.text}
        </div>
      )}

      {loading && <Loader text="LOADING..." />}

      {!loading && (
        <>
          {/* ═══════════════════════════════════════════════════════
             PAYMENT CONFIG — subscription price & duration
             ═══════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: '2rem', border: '3px solid #000', background: 'var(--bg-surface)', boxShadow: 'var(--shadow)' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '3px solid #000', background: '#f5f5f5', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <IndianRupee size={16} style={{ display: 'inline', marginRight: 6 }} />
              Payment Configuration
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1rem', border: '3px solid #000',
                background: '#fef9c3', fontSize: '0.8rem', fontWeight: 600
              }}>
                This drives actual payment processing (Cashfree). Changes affect new subscriptions and manual activations.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                    Subscription Price (₹)
                  </label>
                  <input type="number" min={1} value={subSettings.price}
                    onChange={e => setSubSettings(s => ({ ...s, price: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '3px solid #000', fontSize: '1rem', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                    Duration (days)
                  </label>
                  <input type="number" min={1} value={subSettings.durationDays}
                    onChange={e => setSubSettings(s => ({ ...s, durationDays: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '3px solid #000', fontSize: '1rem', fontWeight: 700 }} />
                </div>
              </div>
              <button className="btn btn--primary" onClick={saveSubscription} disabled={savingSub}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                <Save size={16} /> {savingSub ? 'Saving...' : 'Save Payment Config'}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
             PRICING PLANS — marketing page content
             ═══════════════════════════════════════════════════════ */}
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem', border: '3px solid #000',
            background: '#e0f2fe', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <AlertTriangle size={16} />
            Plans with "active" disabled won't appear on the public /pricing page.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Pricing Plans</h2>
            <button className="btn btn--primary" onClick={savePlans} disabled={savingPlans}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
              <Save size={16} /> {savingPlans ? 'Saving...' : 'Save All Plans'}
            </button>
          </div>

          {plans.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', border: '3px solid #000', background: '#f5f5f5', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '1rem' }}>No pricing plans configured yet.</p>
              <button className="btn btn--primary" onClick={addPlan}>+ Add Your First Plan</button>
            </div>
          )}

          {plans.map((plan, pIndex) => (
            <div key={plan.id || pIndex} style={{
              marginBottom: '1.5rem', border: '3px solid #000',
              background: plan.highlighted ? '#fffbe6' : 'var(--bg-surface)',
              boxShadow: plan.highlighted ? '8px 8px 0 #000' : 'var(--shadow)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex', gap: 0, borderBottom: '3px solid #000',
                background: plan.highlighted ? '#ffd700' : '#f5f5f5'
              }}>
                <button type="button" onClick={() => movePlan(pIndex, -1)} disabled={pIndex === 0}
                  style={{ padding: '0.5rem 0.75rem', border: 'none', borderRight: '2px solid #000', cursor: 'pointer', background: 'transparent', fontWeight: 700, opacity: pIndex === 0 ? 0.3 : 1 }}>
                  ↑
                </button>
                <button type="button" onClick={() => movePlan(pIndex, 1)} disabled={pIndex === plans.length - 1}
                  style={{ padding: '0.5rem 0.75rem', border: 'none', borderRight: '2px solid #000', cursor: 'pointer', background: 'transparent', fontWeight: 700, opacity: pIndex === plans.length - 1 ? 0.3 : 1 }}>
                  ↓
                </button>
                <span style={{ flex: 1, padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  Plan {pIndex + 1} — {plan.name || 'Untitled'}
                  {plan.highlighted && <span style={{ marginLeft: 8, fontSize: '0.65rem', background: '#000', color: '#fff', padding: '2px 8px' }}>HIGHLIGHTED</span>}
                  {!plan.active && <span style={{ marginLeft: 8, fontSize: '0.65rem', background: '#999', color: '#fff', padding: '2px 8px' }}>INACTIVE</span>}
                </span>
                <button type="button" onClick={() => removePlan(pIndex)} title="Delete plan"
                  style={{ padding: '0.5rem 0.75rem', border: 'none', borderLeft: '2px solid #000', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Plan ID</label>
                    <input value={plan.id} onChange={e => updatePlan(pIndex, 'id', e.target.value)} placeholder="e.g. premium" style={inputStyle} />
                    <p style={hintStyle}>Unique identifier (no spaces)</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Plan Name</label>
                    <input value={plan.name} onChange={e => updatePlan(pIndex, 'name', e.target.value)} placeholder="e.g. Premium" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Price (₹)</label>
                    <input type="number" min={0} value={plan.price} onChange={e => updatePlan(pIndex, 'price', Number(e.target.value))} placeholder="e.g. 99" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Billing Interval</label>
                    <select value={plan.interval} onChange={e => updatePlan(pIndex, 'interval', e.target.value)} style={inputStyle}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="once">One-time</option>
                      <option value="forever">Free (forever)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>CTA Button Text</label>
                    <input value={plan.ctaText} onChange={e => updatePlan(pIndex, 'ctaText', e.target.value)} placeholder="e.g. Subscribe Now" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CTA Link</label>
                    <input value={plan.ctaLink} onChange={e => updatePlan(pIndex, 'ctaLink', e.target.value)} placeholder="e.g. /subscribe" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Badge Text</label>
                    <input value={plan.badge} onChange={e => updatePlan(pIndex, 'badge', e.target.value)} placeholder="e.g. Most Popular" style={inputStyle} />
                    <p style={hintStyle}>Shown as a chip on the card</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea value={plan.description} onChange={e => updatePlan(pIndex, 'description', e.target.value)} placeholder="Describe this plan..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={plan.highlighted} onChange={e => updatePlan(pIndex, 'highlighted', e.target.checked)} style={{ width: 18, height: 18 }} />
                    Highlighted (recommended)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={plan.active} onChange={e => updatePlan(pIndex, 'active', e.target.checked)} style={{ width: 18, height: 18 }} />
                    Active (visible)
                  </label>
                </div>

                <div style={{ borderTop: '2px solid #000', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Features</label>
                    <button type="button" onClick={() => addFeature(pIndex)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '2px solid #000', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                      <Plus size={14} /> Add Feature
                    </button>
                  </div>
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: plan.highlighted ? '#cc9900' : '#999' }}>◆</span>
                      <input value={feature} onChange={e => updateFeature(pIndex, fIndex, e.target.value)} placeholder="Feature description..." style={{ flex: 1, ...inputStyle }} />
                      <button type="button" onClick={() => removeFeature(pIndex, fIndex)} style={{ padding: '4px 8px', border: '2px solid #000', background: '#fee2e2', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: '0.7rem' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn--primary" onClick={addPlan} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={18} /> Add New Plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase'
};

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '3px solid #000',
  fontSize: '0.9rem', fontWeight: 600, background: '#fff',
  fontFamily: 'inherit'
};

const hintStyle = {
  fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2
};
