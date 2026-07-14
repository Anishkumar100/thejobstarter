import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import { CodeIcon, BookOpen01Icon, UserGroupIcon, ArrowRight01Icon } from 'hugeicons-react';

const HAS_CLERK = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY !== 'pk_test_xxx'
);

function SignedInRedirect() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (isSignedIn) navigate('/');
  }, [isSignedIn]);
  return null;
}

const FEATURES = [
  { icon: <CodeIcon size={18} />, text: '180+ DSA problems with detailed solutions' },
  { icon: <BookOpen01Icon size={18} />, text: 'In-depth DBMS & OS study material' },
  { icon: <UserGroupIcon size={18} />, text: 'Placement-focused community & Q&A' }
];

export default function SignUp() {
  return (
    <div className="auth-split">
      <Helmet>
        <title>Sign Up — TheJobStarter</title>
      </Helmet>

      {/* ═════ BRAND HERO — LEFT ═════ */}
      <div className="auth-split__hero">
        <div className="auth-split__hero-bg" />
        <div className="auth-split__hero-content">
          {/* Brand */}
          <Link to="/" className="auth-split__brand">
            <span className="auth-split__brand-mark">✦</span>
            <div className="auth-split__brand-text">
              <span className="auth-split__brand-name">TheJobStarter</span>
              <span className="auth-split__brand-tag">Placement Prep Platform</span>
            </div>
          </Link>

          {/* Tagline */}
          <h1 className="auth-split__title">
            Start Your<br />
            <span className="auth-split__title-accent">Placement Prep</span>
          </h1>
          <p className="auth-split__desc">
            Join thousands of students preparing for tech placements. Get access to curated problems, study material, and a supportive community.
          </p>

          {/* Features */}
          <div className="auth-split__features">
            {FEATURES.map((f, i) => (
              <div key={i} className="auth-split__feature">
                <span className="auth-split__feature-icon">{f.icon}</span>
                <span className="auth-split__feature-text">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="auth-split__hero-footer">
            Already have an account? <Link to="/sign-in" className="auth-split__hero-link">Sign in <ArrowRight01Icon size={14} /></Link>
          </p>
        </div>
      </div>

      {/* ═════ FORM — RIGHT ═════ */}
      <div className="auth-split__form">
        <div className="auth-split__form-inner">
          {HAS_CLERK ? (
            <>
              <SignedInRedirect />
              <ClerkSignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
              />
            </>
          ) : (
            <div className="auth-split__card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
              <h2>Auth disabled in dev mode</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>
                Set VITE_CLERK_PUBLISHABLE_KEY in client/.env to enable Clerk.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
