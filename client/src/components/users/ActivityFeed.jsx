import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';

export default function ActivityFeed({ activities }) {
  if (!activities?.length) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 'var(--space-lg)' }}>No recent activity yet.</p>
        <Link to="/dsa">
          <Button>Explore new concepts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Recent Activity</h3>
      {activities.map((a, i) => (
        <Link key={i} to={a.link || '#'} style={{ display: 'block', padding: '8px 0', borderBottom: '2px solid var(--border-subtle)', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span style={{ fontSize: '0.875rem' }}>
            {a.type === 'asked' && '● Asked "'}
            {a.type === 'answered' && '● Answered "'}
            {a.title}
            {a.type === 'asked' ? '"' : '"'}
            {' in '}
            <strong>{a.category}</strong>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
            {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </Link>
      ))}
    </div>
  );
}
