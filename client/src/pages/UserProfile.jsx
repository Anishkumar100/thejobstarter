import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUserStore } from '../stores/useUserStore.js';
import { useQaStore } from '../stores/useQaStore.js';
import { useProgressStore } from '../stores/useProgressStore.js';
import { useProgressMessageStore } from '../stores/useProgressMessageStore.js';
import { getMotivationalMessage, getOverallMessage, getStreakMessage } from '../utils/progressMessages.js';
import { getUserActivity } from '../api/userApi.js';
import { fetchQuestions } from '../api/qaApi.js';
import ProfileHero from '../components/users/ProfileHero.jsx';
import ExternalLinks from '../components/users/ExternalLinks.jsx';
import SkillsTags from '../components/users/SkillsTags.jsx';
import ActivityFeed from '../components/users/ActivityFeed.jsx';
import FeedbackSection from '../components/users/FeedbackSection.jsx';
import { useUser } from '@clerk/clerk-react';
import Loader from '../components/ui/Loader.jsx';
import { MessageQuestionIcon, Cancel01Icon, Clock01Icon, Download01Icon } from 'hugeicons-react';
import { AlertCircle, CheckCircle, FileText, Clock, Layers, Building2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { currentProfile, loading, error, fetchProfile: fetchUserByUsername, follow, unfollow } = useUserStore();
  const { summary: progressSummary, dailyCount, loading: progressLoading, fetchSummary: fetchProgressSummary, fetchDailyCount: fetchDailyProgressCount } = useProgressStore();
  const { messages: progressMessages, fetchMessages: fetchProgressMessages } = useProgressMessageStore();
  const [activities, setActivities] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  /* Plan day breakdown for plan progress */
  const [userPlanBreakdown, setUserPlanBreakdown] = useState(null);
  const [userBdLoading, setUserBdLoading] = useState(false);
  const isOwnProfile = !!(clerkUser?.id && currentProfile?.clerkId === clerkUser.id);
  console.log('[UserProfile] Render — isOwnProfile:', isOwnProfile, '| clerkUser?.id:', clerkUser?.id, '| profile.clerkId:', currentProfile?.clerkId, '| param username:', username, '| progressSummary:', !!progressSummary, '| progressLoading:', progressLoading);

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

  /* Fetch plan day breakdown when planProgress is available */
  useEffect(() => {
    const pp = progressSummary?.planProgress;
    if (!pp?.planId || !currentProfile?.batch?._id) return;
    setUserBdLoading(true);
    apiRequest(`/plans/${pp.planId}/day-progress/${currentProfile.batch._id}/${currentProfile._id}`)
      .then(res => setUserPlanBreakdown(res.data))
      .catch(err => console.error('[UP] Day breakdown error:', err.message))
      .finally(() => setUserBdLoading(false));
  }, [progressSummary?.planProgress?.planId, currentProfile?.batch?._id, currentProfile?._id]);

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
  }, [currentProfile?._id, clerkUser?.id]);

  /* Fetch own progress summary + daily count if this is the user's own profile */
  useEffect(() => {
    console.log('[UserProfile] Progress useEffect fired — isOwnProfile:', isOwnProfile, '| progressSummary:', !!progressSummary);
    if (isOwnProfile && !progressSummary) {
      console.log('[UserProfile] Calling fetchProgressSummary()...');
      fetchProgressSummary();
      fetchDailyProgressCount();
    }
  }, [isOwnProfile]);

  /* Fetch progress messages (cached — only fetches once) */
  useEffect(() => {
    fetchProgressMessages();
  }, []);
  useEffect(() => {
    if (!currentProfile && !loading && clerkUser?.id) {
      fetchUserByUsername(username);
    }
  }, [clerkUser?.id]);


  /*
   * CSV export — download full tracking data as CSV file
   */
  const handleCsvExport = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_BASE}/users/export-csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProfile?.username || 'user'}_thejobstarter_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[UserProfile] CSV export error:', err.message);
    }
  };

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

  console.log('[UserProfile] Render progress check — isOwnProfile:', isOwnProfile, '| progressLoading:', progressLoading, '| progressSummary:', !!progressSummary);

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

          {/* ═════ PROGRESS DASHBOARD (own profile only) ═════ */}
          {isOwnProfile && (
            <div style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-md)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
                  My Progress
                </h3>
                <button
                  onClick={handleCsvExport}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px',
                    border: '3px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    boxShadow: '3px 3px 0 var(--shadow-color)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'transform 0.12s, box-shadow 0.12s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--shadow-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}
                >
                  <Download01Icon size={14} />
                  Export CSV
                </button>
              </div>

              {progressLoading && <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Loading progress...</p>}

              {!progressLoading && !progressSummary && (
                <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No progress data yet.</p>
              )}

              {!progressLoading && progressSummary && (
                <>
                  {/* ═════ OVERALL MOTIVATIONAL MESSAGE ═════ */}
                  {(() => {
                    const subjects = ['dsa', 'dbms', 'os', 'programming'];
                    let totalCompleted = 0, totalItems = 0;
                    for (const s of subjects) {
                      const d = progressSummary[s];
                      if (d) { totalCompleted += d.overall.completed; totalItems += d.overall.total; }
                    }
                    const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
                    const overallMsg = getOverallMessage(overallPct, progressMessages);
                    return (
                      <div style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        marginBottom: 'var(--space-md)',
                        border: '3px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        boxShadow: 'var(--shadow)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        {totalCompleted}/{totalItems} across all subjects · {overallPct}% complete
                        <div style={{ fontWeight: 400, fontSize: '0.82rem', marginTop: '4px', color: 'var(--text-tertiary)' }}>
                          {overallMsg}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═════ TODAY'S ACTIVITY ═════ */}
                  <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    marginBottom: 'var(--space-md)',
                    border: '2px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      minWidth: 48, height: 48,
                      border: '2px solid var(--border-color)',
                      background: 'var(--accent)',
                      color: 'var(--text-inverse)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.2rem'
                    }}>
                      {dailyCount}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Today's Activity
                      </div>
                      <div style={{ fontSize: '0.78rem', marginTop: 2 }}>
                        {getStreakMessage(dailyCount, progressMessages)}
                      </div>
                    </div>
                  </div>

                  {/* ═════ CENTRE & BATCH INFO ═════ */}
                  {currentProfile && (currentProfile.batch || currentProfile.coachingCenter) && (
                    <div style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      marginBottom: 'var(--space-md)',
                      border: '3px solid var(--border-color)',
                      boxShadow: 'var(--shadow)',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      flexWrap: 'wrap',
                      fontSize: '0.82rem'
                    }}>
                      {currentProfile.coachingCenter && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Building2 size={14} />
                          <strong>{currentProfile.coachingCenter.name || 'Centre'}</strong>
                        </span>
                      )}
                      {currentProfile.batch && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Layers size={14} />
                          Batch: <strong>{currentProfile.batch.name || '—'}</strong>
                          {currentProfile.batch.code && (
                            <code style={{ background: 'var(--bg-surface)', padding: '1px 4px', border: '1px solid var(--border-color)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                              {currentProfile.batch.code}
                            </code>
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ═════ PLAN PROGRESS ═════ */}
                  {progressSummary.planProgress && (() => {
                    const pp = progressSummary.planProgress;
                    const paceColors = { ahead: 'var(--success)', 'on-track': '#2563eb', behind: '#dc2626', 'just-started': 'var(--text-tertiary)' };
                    const pct = pp.expectedCount > 0 ? Math.round((pp.completedCount / pp.expectedCount) * 100) : 0;
                    return (
                      <div style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        marginBottom: 'var(--space-md)',
                        border: '3px solid var(--border-color)',
                        boxShadow: 'var(--shadow)',
                        background: 'var(--bg-secondary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            Plan Progress: {pp.planName}
                          </div>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                            padding: '2px 8px', border: '2px solid var(--border-color)',
                            color: paceColors[pp.paceStatus] || 'var(--text-tertiary)'
                          }}>
                            {pp.paceStatus === 'just-started' ? 'Just started' : pp.paceStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>
                          <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                          Day {pp.currentDayOffset} of {pp.durationDays} · Started {new Date(pp.startDate).toLocaleDateString()}
                        </div>
                        {pp.paceStatus === 'just-started' && pp.currentDayOffset < 3 ? (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            Plan just started — progress data will appear soon.
                          </p>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <div style={{ flex: 1, height: 14, background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: pp.paceStatus === 'behind' ? '#dc2626' : 'var(--success)', transition: 'width 0.4s ease' }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                {pp.completedCount}/{pp.expectedCount}
                              </span>
                            </div>
                            {/* Day-by-day breakdown */}
                            {userBdLoading ? (
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Loading day breakdown...</p>
                            ) : userPlanBreakdown?.days ? (
                              <div style={{ marginTop: 8 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 6 }}>Day-by-Day Completion</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                  {userPlanBreakdown.days.map(d => (
                                    <div key={d.day} title={`Day ${d.day}: ${d.completedCount}/${d.itemsCount} items${d.isCurrent ? ' (Current)' : d.isPast ? ' (Past)' : ' (Future)'}`}
                                      style={{
                                        width: 22, height: 22,
                                        border: d.isCurrent ? '3px solid #000' : '2px solid var(--gray-300)',
                                        background: d.isFuture ? 'var(--bg-tertiary)'
                                          : d.itemsCount === 0 ? '#f0f0f0'
                                          : d.completedCount === d.itemsCount ? '#16a34a'
                                          : d.completedCount > 0 ? '#facc15'
                                          : '#fee2e2',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.5rem', fontWeight: 700
                                      }}>
                                      {d.day}
                                    </div>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: '0.6rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                                  <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#16a34a', marginRight: 2, border: '1px solid #000' }} /> Done</span>
                                  <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#facc15', marginRight: 2, border: '1px solid #000' }} /> Partial</span>
                                  <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#fee2e2', marginRight: 2, border: '1px solid #000' }} /> Missed</span>
                                </div>
                              </div>
                            ) : pp.itemsBehind && pp.itemsBehind.length > 0 ? (
                              <div style={{ marginTop: 6, fontSize: '0.72rem' }}>
                                <span style={{ color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <AlertCircle size={12} /> {pp.itemsBehind.length} item(s) behind schedule
                                </span>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    );
                  })()}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                    {['dsa', 'dbms', 'os', 'programming'].map(subject => {
                      const data = progressSummary[subject];
                      if (!data) return null;
                      const label = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Prog' }[subject];
                      const pct = data.overall.total > 0 ? Math.round((data.overall.completed / data.overall.total) * 100) : 0;
                      const { message } = getMotivationalMessage(pct, progressMessages);
                      const items = [
                        { type: 'Lessons', completed: data.lessons.completed, total: data.lessons.total },
                        { type: 'Subtopics', completed: data.subtopics.completed, total: data.subtopics.total },
                        { type: 'Problems', completed: data.problems.completed, total: data.problems.total }
                      ];
                      const quizzes = data.quizzes || { quizzesTaken: 0, avgScore: 0 };
                      return (
                        <Link
                          key={subject}
                          to={`/settings/progress/${subject}`}
                          style={{
                            display: 'block',
                            padding: 'var(--space-lg)',
                            border: '3px solid var(--border-color)',
                            boxShadow: 'var(--shadow)',
                            background: 'var(--bg-secondary)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            transition: 'transform 0.15s, box-shadow 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-3px, -3px)'; e.currentTarget.style.boxShadow = '9px 9px 0 var(--shadow-color)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                        >
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>{label}</h4>
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 900,
                            marginBottom: 'var(--space-sm)'
                          }}>
                            {data.overall.completed}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>/{data.overall.total}</span>
                          </div>
                          <div style={{
                            height: 8,
                            background: 'var(--bg-tertiary)',
                            border: '2px solid var(--border-color)',
                            marginBottom: 'var(--space-sm)'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: data.overall.completed === data.overall.total ? 'var(--success)' : 'var(--accent)',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          {/* ═════ PER-SUBJECT MOTIVATIONAL MESSAGE ═════ */}
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic',
                            marginBottom: 'var(--space-sm)',
                            padding: '6px 8px',
                            borderLeft: '3px solid var(--accent)',
                            background: 'var(--bg-tertiary)'
                          }}>
                            {message}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                            {items.map(item => (
                              <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.type}</span>
                                <span style={{ fontWeight: 600 }}>
                                  {item.completed}/{item.total}
                                </span>
                              </div>
                            ))}
                            <div key="quizzes" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Quizzes</span>
                              <span style={{ fontWeight: 600 }}>
                                {quizzes.quizzesTaken} taken · {quizzes.avgScore}% avg
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          <ExternalLinks links={currentProfile.externalLinks} />
          <SkillsTags skills={currentProfile.skills} />
          <ActivityFeed activities={activities} />

          {/* ═════ FEEDBACK & INSIGHTS (own profile only) ═════ */}
          {isOwnProfile && progressSummary && (
            <FeedbackSection progress={progressSummary} />
          )}

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
                        border: '3px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)',
                        background: question.status === 'pending' ? 'var(--warning-bg)' : question.status === 'rejected' ? 'var(--error-bg)' : 'var(--bg-secondary)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
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
