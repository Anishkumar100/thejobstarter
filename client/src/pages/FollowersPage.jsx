import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUserStore } from '../stores/useUserStore.js';
import { getFollowers, getFollowing } from '../api/userApi.js';
import Loader from '../components/ui/Loader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { Search, Users } from 'lucide-react';

export default function FollowersPage() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'followers';
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const { fetchProfile: fetchUserByUsername, currentProfile } = useUserStore();

  useEffect(() => {
    fetchUserByUsername(username);
  }, [username]);

  /* Get the MongoDB _id from the profile */
  useEffect(() => {
    if (currentProfile?._id) {
      setProfileId(currentProfile._id);
    }
  }, [currentProfile]);

  /* Fetch followers or following */
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    const fetcher = tab === 'followers' ? getFollowers : getFollowing;
    fetcher(profileId)
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [profileId, tab]);

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const switchTab = (t) => {
    setSearchParams({ tab: t });
    setSearch('');
  };

  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>@{username}'s {tab} — TheJobStarter</title>
      </Helmet>

      <Link to={`/users/${username}`} className="detail-back">← Back to Profile</Link>

      <h2 className="page-title" style={{ marginTop: 'var(--space-lg)' }}>
        <Users size={24} /> @{username}'s {tab}
      </h2>

      <div className="followers-tabs">
        <button
          className={`followers-tab ${tab === 'followers' ? 'followers-tab--active' : ''}`}
          onClick={() => switchTab('followers')}
        >
          Followers ({currentProfile?.followers?.length || 0})
        </button>
        <button
          className={`followers-tab ${tab === 'following' ? 'followers-tab--active' : ''}`}
          onClick={() => switchTab('following')}
        >
          Following ({currentProfile?.following?.length || 0})
        </button>
      </div>

      <div className="search-bar" style={{ margin: 'var(--space-lg) 0' }}>
        <input
          type="text"
          className="search-bar__input"
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="search-bar__btn"><Search size={18} /></span>
      </div>

      {loading && <Loader text={`LOADING ${tab.toUpperCase()}...`} />}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <div className="followers-list">
          {filtered.length === 0 ? (
            <p className="text-muted" style={{ padding: 'var(--space-xl) 0', textAlign: 'center' }}>
              {search ? `No ${tab} match "${search}"` : `No ${tab} yet`}
            </p>
          ) : (
            filtered.map(u => (
              <Link key={u._id} to={`/users/${u.username}`} className="follower-card">
                <Avatar src={u.avatar} alt={u.displayName} size="sm" />
                <div className="follower-card__info">
                  <div className="follower-card__name">{u.displayName || u.username}</div>
                  <div className="follower-card__username">@{u.username}</div>
                </div>
                {u.bio && <div className="follower-card__bio">{u.bio}</div>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
