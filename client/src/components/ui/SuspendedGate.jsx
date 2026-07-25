import { useAuthStore } from '../../stores/useAuthStore.js';

/*
 * SuspendedGate — Blocks content if the user's coaching centre is suspended.
 * Shows a professional termination message instead of the wrapped content.
 *
 * Accepts an optional `center` prop (full centre object with status).
 * If not provided, falls back to authStore.user.coachingCenter.status.
 *
 * Admins are never blocked — they need to manage centres.
 */
export default function SuspendedGate({ children, center }) {
  const { user, isAdmin } = useAuthStore();

  /* Admins bypass the gate */
  if (isAdmin) return children;

  const status = center?.status || user?.coachingCenter?.status;

  if (status === 'suspended') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: 'var(--space-xl)',
        background: 'var(--bg-surface)'
      }}>
        <div style={{
          maxWidth: 520, width: '100%', textAlign: 'center',
          border: '4px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-xl) var(--space-lg)',
          background: 'var(--bg-surface)'
        }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto var(--space-lg)',
            border: '3px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', background: 'var(--error-bg)',
            color: 'var(--error)'
          }}>
            !
          </div>
          <h1 style={{
            fontSize: '1.4rem', fontWeight: 900, marginBottom: 'var(--space-md)',
            color: 'var(--text-primary)'
          }}>
            Service Suspended
          </h1>
          <p style={{
            fontSize: '0.9rem', color: 'var(--text-secondary)',
            marginBottom: 'var(--space-lg)', lineHeight: 1.7
          }}>
            Your coaching centre's services have been suspended. Please contact
            your centre administrator or our support team to resolve this issue.
          </p>
          <div style={{
            padding: 'var(--space-md)',
            border: '2px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            fontSize: '0.78rem', color: 'var(--text-tertiary)'
          }}>
            If you believe this is an error, reach out to{' '}
            <strong>support@thejobstarter.com</strong>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
