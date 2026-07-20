import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function ProfileHero({ profile, isOwnProfile, onFollow, onEdit }) {
  const { isAuthenticated } = useAuthStore();

  const followerCount = profile?.followers?.length || 0;
  const followingCount = profile?.following?.length || 0;

  return (
    <div className="profile-hero">
      <Avatar src={profile?.avatar} alt={profile?.displayName} size="lg" />
      <div className="profile-hero__info">
        <h1 className="profile-hero__name">{profile?.displayName || profile?.username}</h1>
        <div className="profile-hero__username">@{profile?.username}</div>

        <div className="profile-hero__stats">
          <Link to={`/users/${profile?.username}/followers?tab=followers`} className="profile-hero__stat">
            <strong>{followerCount}</strong> Followers
          </Link>
          <Link to={`/users/${profile?.username}/followers?tab=following`} className="profile-hero__stat">
            <strong>{followingCount}</strong> Following
          </Link>
        </div>

        {profile?.bio && <div className="profile-hero__bio">"{profile.bio}"</div>}

        <div className="profile-hero__meta">
          {profile?.college && <span>{profile.college}</span>}
          {profile?.college && profile?.year && <span> · </span>}
          {profile?.year && <span>Year {profile.year}</span>}
          {(profile?.college || profile?.year) && <span> · </span>}
          {profile?.batch && (
            <>
              <span style={{
                padding: '1px 6px', border: '1px solid var(--black)',
                background: profile.batch.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
                fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace'
              }}>
                {profile.batch.name}
              </span>
              <span> · </span>
            </>
          )}
          <span>Joined {new Date(profile?.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </div>

        <div className="profile-hero__actions">
          {isOwnProfile && <Button size="sm" onClick={onEdit}>Edit Profile</Button>}
          {!isOwnProfile && isAuthenticated && (
            <Button size="sm" variant="secondary" onClick={onFollow}>
              {profile?.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
