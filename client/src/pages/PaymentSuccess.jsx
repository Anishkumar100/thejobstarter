import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import { Check, ArrowRight, Loader, PartyPopper, Lock } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subscriptionId = searchParams.get('subscription_id');
  /* Default redirect — send user to DSA to access their new content */
  const defaultRedirect = '/dsa';
  const [redirect, setRedirect] = useState(defaultRedirect);
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    if (!subscriptionId) {
      setVerifying(false);
      return;
    }
    (async () => {
      try {
        const res = await apiRequest('/payments/verify-subscription', {
          method: 'POST',
          body: JSON.stringify({ subscriptionId })
        });
        console.log('[PAYMENT] Verification result:', res.data);
        if (res.data?.status === 'active') {
          setVerifyError(null);
          if (res.data.redirect) {
            setRedirect(res.data.redirect);
          }
        } else {
          setVerifyError('Payment is being processed. Your subscription will activate shortly.');
        }
      } catch (err) {
        console.error('[PAYMENT] Verification error:', err.message);
        setVerifyError('Could not verify payment status. Your subscription will be confirmed by email.');
      }
      setVerifying(false);
    })();
  }, [subscriptionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirect);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [redirect, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Helmet><title>Payment Successful — TheJobStarter</title></Helmet>

      {/* Grid background pattern */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(var(--border-main) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--border-main) 1.5px, transparent 1.5px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Main card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          border: '6px solid var(--border-main)',
          background: 'var(--bg-surface)',
          boxShadow: '14px 14px 0 var(--shadow-color)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 8,
            width: '100%',
            background: 'var(--success)',
          }}
        />

        <div style={{ padding: '2.5rem 2rem' }}>
          {/* ═══ Checkmark icon ═══ */}
          <div
            style={{
              width: 88,
              height: 88,
              margin: '0 auto 1.5rem',
              border: '5px solid var(--success)',
              background: 'var(--success-bg)',
              boxShadow: '6px 6px 0 var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={48} strokeWidth={3} style={{ color: 'var(--success-text)' }} />
          </div>

          {/* ═══ Title ═══ */}
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 900,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            Payment Successful!
          </h1>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '1.75rem',
              lineHeight: 1.5,
            }}
          >
            Your premium subscription is now active.{' '}
            <PartyPopper size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </p>

          {/* ═══ Subscription ID (brutalist code box) ═══ */}
          {subscriptionId && (
            <div
              style={{
                padding: '0.75rem 1rem',
                border: '4px solid var(--border-main)',
                background: 'var(--bg-primary)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <Lock size={16} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0, color: 'var(--text-tertiary)' }} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-tertiary)',
                    marginBottom: 4,
                  }}
                >
                  Subscription ID
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    wordBreak: 'break-all',
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                  }}
                >
                  {subscriptionId}
                </div>
              </div>
            </div>
          )}

          {/* ═══ Verifying state ═══ */}
          {verifying && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                border: '4px solid var(--warning)',
                background: 'var(--warning-bg)',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: 'var(--warning-text)',
              }}
            >
              <Loader size={18} className="animate-spin" />
              Verifying your payment...
            </div>
          )}

          {/* ═══ Error / pending state ═══ */}
          {verifyError && !verifying && (
            <div
              style={{
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                border: '4px solid var(--warning)',
                background: 'var(--warning-bg)',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: 'var(--warning-text)',
                lineHeight: 1.5,
              }}
            >
              {verifyError}
            </div>
          )}

          {/* ═══ Countdown ═══ */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
              padding: '0.5rem 0',
              borderTop: '3px solid var(--border-main)',
              borderBottom: '3px solid var(--border-main)',
            }}
          >
            Redirecting to content in{' '}
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                padding: '0 4px',
              }}
            >
              {countdown}
            </span>{' '}
            seconds...
          </div>

          {/* ═══ Continue button ═══ */}
          <button
            onClick={() => navigate(redirect)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '1rem 1.5rem',
              border: '5px solid var(--border-main)',
              background: 'var(--accent)',
              color: 'var(--text-inverse)',
              fontWeight: 900,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              boxShadow: '8px 8px 0 var(--shadow-color)',
              transition: 'all 0.1s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '10px 10px 0 var(--shadow-color)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '8px 8px 0 var(--shadow-color)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '4px 4px 0 var(--shadow-color)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '10px 10px 0 var(--shadow-color)';
            }}
          >
            Continue Now <ArrowRight size={22} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
