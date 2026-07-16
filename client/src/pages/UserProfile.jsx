import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUserStore } from '../stores/useUserStore.js';
import { useQaStore } from '../stores/useQaStore.js';
import { getUserActivity } from '../api/userApi.js';
import { fetchQuestions } from '../api/qaApi.js';
import ProfileHero from '../components/users/ProfileHero.jsx';
import ExternalLinks from '../components/users/ExternalLinks.jsx';
import SkillsTags from '../components/users/SkillsTags.jsx';
import ActivityFeed from '../components/users/ActivityFeed.jsx';
import { useUser } from '@clerk/clerk-react';
import Loader from '../components/ui/Loader.jsx';
import { MessageQuestionIcon, Cancel01Icon, Clock01Icon } from 'hugeicons-react';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { currentProfile, loading, error, fetchProfile: fetchUserByUsername, follow, unfollow } = useUserStore();
  const [activities, setActivities] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    fetchUserByUsername(username);
  }, [username]);

  /* Fetch activity once we have the profile */
  useEffect(() => {
    if (currentProfile?._id) {
      getUserActivity(currentProfile._id)
        .then(res => {
          setActivities(res.data || []);
        })
        .catch(err => console.error('[UserProfile] Error fetching activity:', err.message));
    }
  }, [currentProfile?._id]);

  /* Fetch own questions if this is the user's own profile */
  useEffect(() => {
    if (isOwnProfile) {
      setLoadingQuestions(true);
      fetchQuestions({ author: 'me' })
        .then(res => {
          setMyQuestions(res.data || []);
        })
        .catch(err => console.error('[UserProfile] Error fetching own questions:', err.message))
        .finally(() => setLoadingQuestions(false));
    }
  }, [currentProfile?._id, clerkUser?.username]);

  /* Retry if profile is null but auth user just loaded */
  useEffect(() => {
    if (!currentProfile && !loading && clerkUser?.username === username) {
      fetchUserByUsername(username);
    }
  }, [clerkUser?.username]);


  const isOwnProfile = clerkUser?.username === username;

  const handleFollow = async () => {
    if (!currentProfile) return;
    if (currentProfile.isFollowing) {
      await unfollow(currentProfile._id);
    } else {
      await follow(currentProfile._id);
    }
    fetchUserByUsername(username);
  };

  /* Status badge helper */
  const StatusBadge = ({ status }) => {
    if (status === 'approved') return null;
    if (status === 'pending') {
      return (
          <span className="qad-status-badge" data-status="pending" style={{ fontSize: '0.7rem', padding: '2px 8px', marginLeft: '8px' }}>
          <Clock01Icon size={12} /> Pending
        </span>
      );
    }
    return (
      <span className="qad-status-badge" data-status="rejected" style={{ fontSize: '0.7rem', padding: '2px 8px', marginLeft: '8px' }}>
        <Cancel01Icon size={12} /> Rejected
      </span>
    );
  };

  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>{currentProfile?.displayName || username} — TheJobStarter Profile</title>
      </Helmet>

      <Link to="/users" className="detail-back">← Back to Community</Link>

      {loading && <Loader text="LOADING PROFILE..." />}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && currentProfile && (
        <>
          <ProfileHero
            profile={currentProfile}
            isOwnProfile={isOwnProfile}
            onFollow={handleFollow}
            onEdit={() => navigate('/settings/profile')}
          />
          <ExternalLinks links={currentProfile.externalLinks} />
          <SkillsTags skills={currentProfile.skills} />
          <ActivityFeed activities={activities} />

          {/* ═════ MY QUESTIONS (own profile only) ═════ */}
          {isOwnProfile && (
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>
                My Questions
                {myQuestions.length > 0 && (
                  <span style={{ marginLeft: '8px', fontSize: '0.75rem', fontWeight: 400, textTransform: 'none', color: 'var(--text-tertiary)' }}>
                    ({myQuestions.filter(q => q.status === 'pending').length} pending)
                  </span>
                )}
              </h3>

              {loadingQuestions && <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Loading questions...</p>}

              {!loadingQuestions && myQuestions.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No questions asked yet.</p>
              )}

              {!loadingQuestions && myQuestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myQuestions.map(question => (
                    <Link
                      key={question._id}
                      to={`/qa/${question._id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0 #000',
                        background: question.status === 'pending' ? '#fffbeb' : question.status === 'rejected' ? '#fef2f2' : '#fff',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #000'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #000'; }}
                    >
                      <MessageQuestionIcon size={18} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {question.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {question.answers?.length || 0} answers · {question.votes || 0} votes · {new Date(question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <StatusBadge status={question.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
