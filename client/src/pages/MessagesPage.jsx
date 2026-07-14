import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMessageStore } from '../stores/useMessageStore.js';
import { useNotificationStore } from '../stores/useNotificationStore.js';
import InboxList from '../components/messages/InboxList.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function MessagesPage() {
  const { conversations, loading: msgLoading, error: msgError, fetchConversations } = useMessageStore();
  const { notifications, unreadCount, loading: notifLoading, error: notifError, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchConversations();
    fetchNotifications();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>Messages — TheJobStarter</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Messages</h1>
      </div>

      {(msgLoading || notifLoading) && <Loader text="LOADING..." />}
      {notifError && <div className="error-text" style={{ marginBottom: 'var(--space-md)' }}>Notifications error: {notifError}</div>}
      {msgError && <div className="error-text">{msgError}</div>}

      {!msgLoading && !msgError && (
        <InboxList
          conversations={conversations}
          notifications={notifications}
          unreadNotifCount={unreadCount}
        />
      )}
    </div>
  );
}
