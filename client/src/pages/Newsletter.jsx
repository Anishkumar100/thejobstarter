import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
      <Helmet>
        <title>Newsletter — TheJobStarter</title>
      </Helmet>

      <div className="auth-box" style={{ margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>Newsletter</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          Get notified when we add new problems, articles, and cheatsheets.
        </p>

        {subscribed ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}><Check size={32} /></div>
            <p style={{ fontWeight: 700 }}>You're subscribed!</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Thanks for joining TheJobStarter community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" fullWidth>Subscribe</Button>
          </form>
        )}
      </div>
    </div>
  );
}
