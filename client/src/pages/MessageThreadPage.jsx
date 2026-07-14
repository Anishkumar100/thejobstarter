import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMessageStore } from '../stores/useMessageStore.js';
import MessageThread from '../components/messages/MessageThread.jsx';
import MessageInput from '../components/messages/MessageInput.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function MessageThreadPage() {
  const { userId } = useParams();
  const { messages, loading, error, fetchMessages, sendMessage } = useMessageStore();

  useEffect(() => { fetchMessages(userId); }, [userId]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    try {
      await sendMessage(userId, text);
      await fetchMessages(userId);
    } catch (err) {
      console.error('[MESSAGE] Error sending message:', err);
    }
  };

  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>Messages — TheJobStarter</title>
      </Helmet>

      <Link to="/messages" className="detail-back">← Back to Inbox</Link>

      {loading && <Loader text="LOADING MESSAGES..." />}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <div className="message-thread-page">
          <MessageThread messages={messages} />
          <MessageInput onSend={handleSend} />
        </div>
      )}
    </div>
  );
}
