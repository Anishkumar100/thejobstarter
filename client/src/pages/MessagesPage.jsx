import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMessageStore } from '../stores/useMessageStore.js';
import { useNotificationStore } from '../stores/useNotificationStore.js';
import InboxList from '../components/messages/InboxList.jsx';
import Loader from '../components/ui/Loader.jsx';
import { RefreshCw } from 'lucide-react';

export default function MessagesPage() {
  const { conversations, loading: msgLoading, error: msgError, fetchConversations, lastFetched } = useMessageStore();
  const { notifications, unreadCount, loading: notifLoading, error: notifError, fetchNotifications } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchNotifications();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchConversations(), fetchNotifications()]);
    setRefreshing(false);
  }, [fetchConversations, fetchNotifications]);

  const isBusy = msgLoading || notifLoading || refreshing;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>Messages — TheJobStarter</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Messages</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastFetched && !isBusy && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Updated {lastFetched}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isBusy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', cursor: isBusy ? 'not-allowed' : 'pointer',
              border: '3px solid var(--border-color)', background: 'var(--bg-surface)',
              color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.82rem',
              opacity: isBusy ? 0.6 : 1
            }}
            title="Refresh conversations and notifications"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {isBusy && <Loader text="LOADING..." />}
      {notifError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Notifications error: {notifError}</div>}
      {msgError && <div className="error-text">{msgError}</div>}

      {!isBusy && !msgError && (
        <InboxList
          conversations={conversations}
          notifications={notifications}
          unreadNotifCount={unreadCount}
        />
      )}
    </div>
  );
}
