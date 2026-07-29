import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePaymentStore } from '../stores/usePaymentStore.js';
import { Check, X, ArrowRight, Sparkles, AlertTriangle, CreditCard, Clock, Ban } from 'lucide-react';

export default function SubscriptionSettings() {
  const { user, subscriptionStatus } = useAuthStore();
  const { subscription, loading, fetchStatus, cancel, error } = usePaymentStore();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  /* Fetch latest subscription status on mount */
  useEffect(() => {
    fetchStatus();
  }, []);

  /* Handle cancel with confirmation */
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancel();
      setCancelled(true);
      setConfirming(false);
    } catch (err) {
      console.error('[SETTINGS] Cancel error:', err.message);
    }
    setCancelling(false);
  };

  const status = subscription?.status || subscriptionStatus || 'free';
  const isActive = status === 'active';
  const isCanceled = status === 'canceled' || cancelled;
  const isExpired = status === 'expired';
  const isFree = status === 'free';

  /* Format dates nicely */
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-surface relative">
      <Helmet>
        <title>Subscription Settings — TheJobStarter</title>
        <meta name="description" content="Manage your TheJobStarter subscription." />
      </Helmet>

      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-main) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--border-main) 1.5px, transparent 1.5px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <span
            className="inline-block border-4 border-border-main bg-accent-brand text-inverse-text px-4 py-1.5 text-xs font-black tracking-[3px] mb-5 uppercase -rotate-2"
            style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
          >
            SUBSCRIPTION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3 text-text-main leading-[0.95]">
            Your
            <br className="sm:hidden" />{' '}
            <span className="text-accent-brand underline decoration-[5px] underline-offset-[8px]">Plan</span>
          </h1>
          <p className="text-text-muted text-sm font-bold uppercase tracking-wide">
            Manage your TheJobStarter subscription
          </p>
        </div>

        {/* Loading state */}
        {loading && !subscription && (
          <div className="flex items-center justify-center py-16">
            <div
              className="border-5 border-border-main bg-inverse-bg text-inverse-text px-8 sm:px-10 py-5 font-black text-xl sm:text-2xl uppercase tracking-widest animate-pulse"
              style={{ boxShadow: '8px 8px 0 var(--shadow-color)', borderWidth: '5px' }}
            >
              LOADING...
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            className="mb-8 border-4 border-error bg-error-bg text-error-text px-5 py-4 flex items-center gap-3 font-bold text-sm"
            style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
          >
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Status Card ─── */}
        {!loading && (
          <div
            className="border-5 border-border-main bg-bg-secondary text-text-main mb-8 overflow-hidden"
            style={{ boxShadow: '10px 10px 0 var(--shadow-color)' }}
          >
            {/* Status bar */}
            <div className={`h-4 w-full ${isActive ? 'bg-success' : isCanceled ? 'bg-warning' : isExpired ? 'bg-error' : 'bg-text-muted'}`} />

            <div className="px-6 sm:px-8 py-7 sm:py-9">
              {/* Status + badge */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Current Status</h2>
                <span
                  className={`inline-flex items-center gap-1.5 border-4 px-3 py-1.5 text-xs font-black uppercase tracking-wider ${
                    isActive
                      ? 'border-success bg-success text-white'
                      : isCanceled
                      ? 'border-warning bg-warning text-black'
                      : isExpired
                      ? 'border-error bg-error text-white'
                      : 'border-text-muted bg-text-muted text-white'
                  }`}
                  style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}
                >
                  {isActive && <Sparkles size={12} />}
                  {isCanceled && <Ban size={12} />}
                  {isExpired && <X size={12} />}
                  {isFree && <Clock size={12} />}
                  {isActive ? 'Active' : isCanceled ? 'Canceled' : isExpired ? 'Expired' : 'Free'}
                </span>
              </div>

              {/* Plan name */}
              <div
                className="border-4 border-border-main bg-bg-tertiary px-5 py-4 mb-5"
                style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
              >
                <span className="text-xs font-black uppercase tracking-widest text-text-muted block mb-1">Plan</span>
                <span className="text-lg sm:text-xl font-black">
                  {isFree ? 'Free Tier' : isActive ? 'Premium Monthly' : isCanceled ? 'Premium Monthly (Canceled)' : 'Premium Monthly (Expired)'}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div
                  className="border-4 border-border-main bg-bg-tertiary px-4 py-3"
                  style={{ boxShadow: '3px 3px 0 var(--shadow-color)' }}
                >
                  <span className="text-xs font-black uppercase tracking-widest text-text-muted block mb-1">Period Start</span>
                  <span className="text-sm sm:text-base font-bold flex items-center gap-2">
                    <Clock size={14} className="shrink-0 text-text-muted" />
                    {formatDate(subscription?.currentPeriodStart)}
                  </span>
                </div>
                <div
                  className="border-4 border-border-main bg-bg-tertiary px-4 py-3"
                  style={{ boxShadow: '3px 3px 0 var(--shadow-color)' }}
                >
                  <span className="text-xs font-black uppercase tracking-widest text-text-muted block mb-1">Period End</span>
                  <span className="text-sm sm:text-base font-bold flex items-center gap-2">
                    <Clock size={14} className="shrink-0 text-text-muted" />
                    {formatDate(subscription?.currentPeriodEnd)}
                  </span>
                </div>
              </div>

              {/* Access info */}
              {isActive && subscription?.currentPeriodEnd && (
                <div
                  className="border-4 border-border-main bg-success-bg text-success-text px-5 py-4 flex items-start gap-3 text-sm font-bold leading-relaxed"
                  style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
                >
                  <Check size={18} className="shrink-0 mt-0.5" />
                  <span>
                    You have full access to all subjects until <span className="font-black underline decoration-2 underline-offset-2">{formatDate(subscription.currentPeriodEnd)}</span>.
                    Your subscription will auto-renew unless cancelled.
                  </span>
                </div>
              )}
              {isCanceled && subscription?.currentPeriodEnd && (
                <div
                  className="border-4 border-border-main bg-warning-bg text-warning-text px-5 py-4 flex items-start gap-3 text-sm font-bold leading-relaxed"
                  style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
                >
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>
                    Your subscription has been cancelled. You will retain access until{' '}
                    <span className="font-black underline decoration-2 underline-offset-2">{formatDate(subscription.currentPeriodEnd)}</span>.
                    After that, you'll be downgraded to the free tier.
                  </span>
                </div>
              )}
              {isFree && (
                <div
                  className="border-4 border-border-main bg-bg-tertiary px-5 py-4 flex items-start gap-3 text-sm font-bold leading-relaxed text-text-muted"
                  style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
                >
                  <Clock size={18} className="shrink-0 mt-0.5" />
                  <span>
                    You're on the <span className="font-black">Free Tier</span> — you can access the first 2 lessons of each subject.
                    Subscribe to unlock everything.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Actions ─── */}
        <div className="space-y-4">
          {/* Cancel button — only for active subscribers */}
          {isActive && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              className="w-full flex items-center justify-center gap-2 border-4 border-error bg-error text-white px-6 py-4 font-black text-sm uppercase tracking-wider cursor-pointer no-underline transition-all duration-100 ease-out hover:bg-transparent hover:text-error active:translate-y-1.5 active:!shadow-none"
              style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.2)' }}
            >
              <Ban size={18} /> Cancel Subscription
            </button>
          )}

          {/* Confirmation dialog */}
          {isActive && confirming && (
            <div
              className="border-5 border-border-main bg-bg-secondary"
              style={{ boxShadow: '8px 8px 0 var(--shadow-color)' }}
            >
              <div className="h-3 w-full bg-warning" />
              <div className="px-6 py-6 text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 mb-4 border-4 border-warning bg-warning-bg text-warning-text"
                  style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
                >
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-text-main">Cancel Subscription?</h3>
                <p className="text-sm font-bold leading-relaxed text-text-muted mb-6 max-w-md mx-auto">
                  You'll retain access until the end of your current billing period. After that, you'll lose access to premium content.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto border-4 border-error bg-error text-white px-8 py-3 font-black text-sm uppercase tracking-wider cursor-pointer transition-all duration-100 ease-out hover:bg-transparent hover:text-error active:translate-y-1.5 active:!shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.2)' }}
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={cancelling}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto border-4 border-border-main bg-transparent text-text-main px-8 py-3 font-black text-sm uppercase tracking-wider cursor-pointer transition-all duration-100 ease-out hover:bg-bg-tertiary active:translate-y-1.5 active:!shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: '5px 5px 0 var(--shadow-color)' }}
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success message after cancellation */}
          {cancelled && (
            <div
              className="border-5 border-border-main bg-bg-secondary"
              style={{ boxShadow: '8px 8px 0 var(--shadow-color)' }}
            >
              <div className="h-3 w-full bg-warning" />
              <div className="px-6 py-6 text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 border-4 border-warning bg-warning-bg text-warning-text"
                  style={{ boxShadow: '4px 4px 0 var(--shadow-color)' }}
                >
                  <Ban size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-text-main">Subscription Cancelled</h3>
                <p className="text-sm font-bold leading-relaxed text-text-muted mb-6 max-w-md mx-auto">
                  You'll retain access until{' '}
                  <span className="font-black text-text-main underline decoration-2 underline-offset-2">
                    {formatDate(subscription?.currentPeriodEnd)}
                  </span>.
                  We're sorry to see you go!
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-3 border-4 border-border-main bg-inverse-bg text-inverse-text font-black text-sm uppercase tracking-wider no-underline transition-all duration-100 ease-out hover:bg-accent-brand hover:border-accent-brand active:translate-y-1.5 active:!shadow-none"
                  style={{ boxShadow: '5px 5px 0 var(--shadow-color)' }}
                >
                  Resubscribe <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {/* Subscribe now CTA for free users */}
          {isFree && (
            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 w-full border-5 border-accent-highlight bg-accent-highlight text-black px-6 py-4 font-black text-sm uppercase tracking-wider no-underline transition-all duration-100 ease-out hover:bg-transparent hover:text-accent-highlight active:translate-y-1.5 active:!shadow-none"
              style={{ boxShadow: '8px 8px 0 var(--shadow-color)' }}
            >
              <Sparkles size={18} /> Subscribe Now <ArrowRight size={18} />
            </Link>
          )}

          {/* Back link */}
          <div className="text-center pt-4">
            <Link
              to="/settings/profile"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted uppercase tracking-wider hover:text-accent-brand transition-colors duration-100"
            >
              ← Back to Profile Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
