import Avatar from '../ui/Avatar.jsx';

export default function MessageThread({ messages = [] }) {
  if (messages.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>No messages yet. Say hello!</p>;
  }

  return (
    <div className="message-thread">
      {messages.map(msg => (
        <div key={msg._id} className={`message-bubble ${msg.isOwn ? 'message-bubble--own' : ''}`}>
          <div className="message-bubble__header">
            <Avatar src={msg.sender?.avatar} name={msg.sender?.displayName} size={24} />
            <span className="message-bubble__author">{msg.sender?.displayName || 'Unknown'}</span>
          </div>
          <div className="message-bubble__text">{msg.text}</div>
          <div className="message-bubble__time">{new Date(msg.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
