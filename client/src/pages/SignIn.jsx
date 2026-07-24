import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, SignIn as ClerkSignIn } from '@clerk/clerk-react';
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
  { icon: <CodeIcon size={18} />, text: 'Curated DSA, DBMS, OS & Programming resources' },
  { icon: <BookOpen01Icon size={18} />, text: 'Step-by-step problem solutions with code' },
  { icon: <UserGroupIcon size={18} />, text: 'Community Q&A with expert answers' }
];

export default function SignIn() {
  return (
    <div className="auth-split">
      <Helmet>
        <title>Sign In — TheJobStarter</title>
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
            Welcome<br />
            <span className="auth-split__title-accent">Back</span>
          </h1>
          <p className="auth-split__desc">
            Sign in to continue your placement preparation journey. Access problems, track progress, and connect with the community.
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
            New here? <Link to="/sign-up" className="auth-split__hero-link">Create an account <ArrowRight01Icon size={14} /></Link>
          </p>
        </div>
      </div>

      {/* ═════ FORM — RIGHT ═════ */}
      <div className="auth-split__form">
        <div className="auth-split__form-inner">
          {HAS_CLERK ? (
            <>
              <SignedInRedirect />
              <ClerkSignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
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
