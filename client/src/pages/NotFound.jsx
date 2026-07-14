import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)', textAlign: 'center' }}>
      <Helmet>
        <title>404 — Page Not Found — TheJobStarter</title>
      </Helmet>
      <h1 style={{ fontSize: '6rem', marginBottom: 'var(--space-sm)' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
        This page doesn't exist.
      </p>
      <Link to="/" className="btn btn--primary">Go Home</Link>
    </div>
  );
}
