import Avatar from '../ui/Avatar.jsx';
import { Link } from 'react-router-dom';

export default function UserGrid({ users = [] }) {
  if (users.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No users found.</p>;
  }

  return (
    <div className="listing-grid">
      {users.map(user => (
        <Link key={user._id} to={`/users/${user.username}`} className="card card--hover">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
            <Avatar src={user.avatar} name={user.displayName} size={48} />
            <div>
              <div style={{ fontWeight: 700 }}>{user.displayName || user.username}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>@{user.username}</div>
            </div>
          </div>
          {user.bio && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.bio}</p>}
          {user.skills?.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
              {user.skills.slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
