import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { usePaymentStore } from '../stores/usePaymentStore.js';
import { ArrowLeft, ArrowRight, Check, Tag, Loader, Sparkles, Zap, Phone } from 'lucide-react';

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan') || 'premium';
  const redirect = searchParams.get('redirect') || '/settings/profile';

  const orderPayment = usePaymentStore(state => state.orderPayment);

  const [plans, setPlans] = useState([]);
  const [subConfig, setSubConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [plansRes, configRes] = await Promise.all([
          apiRequest('/site-config/pricing'),
          apiRequest('/site-config/subscription/public')
        ]);
        setPlans(plansRes.data);
        setSubConfig(configRes.data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    })();
  }, []);

  const selectedPlan = plans.find(p => p.id === planId) || plans.find(p => p.price > 0) || null;
  const isHighlighted = selectedPlan?.highlighted;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const res = await apiRequest('/payments/apply-promo', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode.trim(), planId })
      });
      setPromoResult(res.data);
    } catch (err) {
      setPromoResult({ valid: false, error: err.message });
    }
    setPromoLoading(false);
  };

  /*
   * Pay now — creates a one-time PG order on the server, then opens the
   * Cashfree hosted checkout page via the JS SDK (see usePaymentStore).
   * No auto-charge: the customer pays manually every billing cycle.
   */
  const handleSubscribe = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setSubscribing(true);
    setError(null);
    try {
      await orderPayment({
        plan: planId,
        phone: phone.trim(),
        promoCode: promoResult?.valid ? promoResult.code : null,
        redirectUrl: redirect
      });
      /* Cashfree checkout opens in this tab — nothing further to do here */
      setSubscribing(false);
    } catch (err) {
      setError(err.message);
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 sm:px-6">
        <div
          className="border-5 border-border-main bg-inverse-bg text-inverse-text px-8 sm:px-10 py-7 sm:py-8 text-center"
          style={{ boxShadow: '10px 10px 0 var(--shadow-color)', borderWidth: '5px' }}
        >
          <div className="flex items-center justify-center gap-3 font-black text-base sm:text-lg uppercase tracking-wider animate-pulse">
            <Loader size={24} />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-surface px-4 sm:px-6 py-12">
        <div className="max-w-lg mx-auto mb-6">
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-2 border-4 border-border-main bg-accent-brand text-inverse-text px-5 py-2.5 font-black text-sm uppercase tracking-wide cursor-pointer transition-all duration-100 hover:bg-transparent hover:text-accent-brand active:translate-y-1 active:!shadow-none"
            style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
          >
            <ArrowLeft size={18} /> Back to Pricing
          </button>
        </div>
        <div
          className="max-w-lg mx-auto border-5 border-border-main bg-inverse-bg text-inverse-text px-8 sm:px-10 py-12 text-center font-black text-lg uppercase"
          style={{ boxShadow: '10px 10px 0 var(--shadow-color)', borderWidth: '5px' }}
        >
          No subscription plan found.
        </div>
      </div>
    );
  }

  const displayPrice = promoResult?.valid ? promoResult.discountedPrice : selectedPlan.price;

  return (
    <div className="min-h-screen bg-surface px-4 sm:px-6 py-10 sm:py-12 relative">
      <Helmet><title>Subscribe — {selectedPlan.name} — TheJobStarter</title></Helmet>

      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-main) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--border-main) 1.5px, transparent 1.5px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="max-w-lg mx-auto mb-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border-4 border-border-main bg-accent-brand text-inverse-text px-5 py-2.5 font-black text-sm uppercase tracking-wide cursor-pointer transition-all duration-100 hover:bg-transparent hover:text-accent-brand active:translate-y-1 active:!shadow-none"
          style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        <div
          className="bg-inverse-bg text-inverse-text"
          style={{
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: isHighlighted ? 'var(--accent-highlight)' : 'var(--border-main)',
            boxShadow: isHighlighted ? '14px 14px 0 var(--accent-highlight)' : '13px 13px 0 var(--shadow-color)',
          }}
        >
          <div className={`h-3 w-full ${isHighlighted ? 'bg-accent-highlight' : 'bg-accent-brand'}`} />

          <div className="px-6 sm:px-8 pt-8 pb-6 text-center border-b-3 border-border-main/30">
            {selectedPlan.badge && (
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase tracking-widest border-4 border-border-main mb-5 -rotate-2 ${
                  isHighlighted ? 'bg-accent-highlight text-inverse-text' : 'bg-accent-brand text-inverse-text'
                }`}
                style={{ boxShadow: '3px 3px 0 var(--shadow-color)' }}
              >
                <Sparkles size={12} /> {selectedPlan.badge}
              </span>
            )}
            <h1 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight mb-3 ${isHighlighted ? 'text-accent-highlight' : ''}`}>
              {selectedPlan.name}
            </h1>
            <p className="text-sm opacity-60 max-w-sm mx-auto leading-relaxed font-medium">{selectedPlan.description}</p>
          </div>

          {error && (
            <div className="mx-6 sm:mx-8 mt-6 px-4 py-3 border-4 border-error bg-error-bg font-bold text-sm text-error-text">
              {error}
            </div>
          )}

          <div className="px-6 sm:px-8 pt-8 pb-6 text-center relative">
            <div className="flex items-start justify-center gap-1">
              <span className="text-2xl font-black mt-2 opacity-70">₹</span>
              <span className="text-6xl sm:text-8xl font-black leading-none tracking-tighter font-mono">{displayPrice}</span>
            </div>
            {promoResult?.valid && (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 border-2 border-border-main/40 -rotate-2">
                <span className="text-base opacity-40 line-through font-mono">₹{selectedPlan.price}</span>
                <span className="text-xs font-black uppercase text-success-text">SAVED</span>
              </div>
            )}
            <div className="text-sm font-bold opacity-60 mt-3 uppercase tracking-wide">
              {selectedPlan.interval === 'monthly' ? 'PER MONTH' : selectedPlan.interval === 'yearly' ? 'PER YEAR' : selectedPlan.interval === 'once' ? 'ONE-TIME PAYMENT' : ''}
              {promoResult?.valid ? <span className="text-success-text font-black"> — {promoResult.description}</span> : ''}
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-6">
            <div className="border-3 border-border-main/40">
              {selectedPlan.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-border-main/25 last:border-b-0"
                  style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--border-main) 4%, transparent)' }}
                >
                  <span
                    className={`shrink-0 w-6 h-6 flex items-center justify-center border-3 ${
                      isHighlighted ? 'border-accent-highlight text-accent-highlight' : 'border-accent-brand text-accent-brand'
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-sm font-semibold">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-4">
            <div className="border-4 border-border-main/50 p-5">
              <label className="flex items-center gap-2 text-xs font-black uppercase mb-3 tracking-wider">
                <Tag size={14} /> Got a promo code?
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 border-4 border-border-main/60 px-3 py-3 text-sm font-black tracking-widest uppercase font-inherit outline-none bg-transparent text-inverse-text placeholder:text-inverse-text/30 focus:border-accent-brand"
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                />
                <button
                  onClick={applyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                  className={`border-4 border-border-main px-5 py-3 font-black text-xs uppercase cursor-pointer transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed active:translate-y-1 active:!shadow-none ${
                    isHighlighted ? 'bg-accent-highlight text-inverse-text hover:bg-transparent hover:text-accent-highlight' : 'bg-accent-brand text-inverse-text hover:bg-transparent hover:text-accent-brand'
                  }`}
                  style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
              {promoResult && (
                <div
                  className={`mt-3 px-3 py-2 text-xs font-black border-3 uppercase ${
                    promoResult.valid ? 'bg-success-bg text-success-text border-success' : 'bg-error-bg text-error-text border-error'
                  }`}
                >
                  {promoResult.valid ? `✓ ${promoResult.description}` : promoResult.error || 'Invalid code'}
                </div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="px-6 sm:px-8 pb-4">
            <div className="border-4 border-border-main/50 p-5">
              <label className="flex items-center gap-2 text-xs font-black uppercase mb-3 tracking-wider">
                <Phone size={14} /> Phone Number (for payment confirmation)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="ENTER PHONE NUMBER"
                maxLength={10}
                className="w-full border-4 border-border-main/60 px-3 py-3 text-sm font-black tracking-widest font-inherit outline-none bg-transparent text-inverse-text placeholder:text-inverse-text/30 focus:border-accent-brand"
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
              />
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`flex items-center justify-center gap-3 w-full border-4 border-border-main px-6 py-5 font-black text-base uppercase tracking-wider cursor-pointer transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-1.5 active:!shadow-none ${
                isHighlighted ? 'bg-accent-highlight text-inverse-text hover:bg-transparent hover:text-accent-highlight' : 'bg-accent-brand text-inverse-text hover:bg-transparent hover:text-accent-brand'
              }`}
              style={{ boxShadow: `7px 7px 0 var(--shadow-color)` }}
            >
              {subscribing ? (
                <><Loader size={20} className="animate-spin" /> Processing...</>
              ) : (
                <><Zap size={20} /> Pay ₹{displayPrice} <ArrowRight size={22} /></>
              )}
            </button>
            <p className="text-center text-xs opacity-40 mt-4 leading-relaxed font-medium">
              Secure payment powered by Cashfree. You'll be redirected to the payment page.
              No auto-charge — you renew manually each billing cycle.
              {redirect !== '/dashboard' && ` After payment, you'll return to where you left off.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}