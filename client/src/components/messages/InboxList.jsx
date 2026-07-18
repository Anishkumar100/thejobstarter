import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar.jsx';
import { MessageNotification01Icon, CheckmarkCircle02Icon, CheckmarkCircle01Icon, Cancel01Icon, CancelCircleIcon, AlertCircleIcon } from 'hugeicons-react';
import { useNotificationStore } from '../../stores/useNotificationStore.js';

/* Return display data based on notification type */
const NOTIF_CONFIG = {
  answer: {
    badgeIcon: MessageNotification01Icon,
    badgeBg: 'var(--accent)',
    action: (from) => `${from.displayName || from.username || 'Someone'} answered your question`
  },
  question_approved: {
    badgeIcon: CheckmarkCircle01Icon,
    badgeBg: '#16a34a',
    action: () => 'Your question was approved'
  },
  question_rejected: {
    badgeIcon: Cancel01Icon,
    badgeBg: '#dc2626',
    action: () => 'Your question was rejected'
  },
  answer_approved: {
    badgeIcon: CheckmarkCircle01Icon,
    badgeBg: '#16a34a',
    action: (from) => `${from.displayName || from.username || 'Someone'} approved your answer`
  },
  answer_rejected: {
    badgeIcon: Cancel01Icon,
    badgeBg: '#dc2626',
    action: (from) => `${from.displayName || from.username || 'Someone'} rejected your answer`
  },
  profile_incomplete: {
    badgeIcon: AlertCircleIcon,
    badgeBg: '#f59e0b',
    action: () => 'Complete your profile — add display name, college, and year'
  }
};

export default function InboxList({ conversations = [], notifications = [], unreadNotifCount = 0 }) {
  const { markRead, markAllRead, removeNotification } = useNotificationStore();

  /* Combine notifications and conversations into a unified timeline */
  const allItems = [
    ...notifications.map(n => ({ ...n, _isNotification: true })),
    ...conversations.map(c => ({ ...c, _isNotification: false }))
  ].sort((a, b) => {
    const aDate = a._isNotification ? a.createdAt : a.lastMessage?.createdAt;
    const bDate = b._isNotification ? b.createdAt : b.lastMessage?.createdAt;
    return new Date(bDate) - new Date(aDate);
  });

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await markRead(notif._id);
    }
  };

  if (allItems.length === 0) {
    return (
      <div className="inbox-empty">
        <MessageNotification01Icon size={40} />
        <h3 className="inbox-empty__title">No messages yet</h3>
        <p className="inbox-empty__desc">Your inbox and notifications will appear here.</p>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      {/* Unread notification banner */}
      {unreadNotifCount > 0 && (
        <button className="inbox-markall-btn" onClick={markAllRead}>
          <CheckmarkCircle02Icon size={14} />
          Mark all notifications as read ({unreadNotifCount})
        </button>
      )}

      <div className="inbox-list">
        {allItems.map(item => {
          if (item._isNotification) {
            /* ── Notification card ── */
            const from = item.from || {};
            const config = NOTIF_CONFIG[item.type] || NOTIF_CONFIG.answer;
            const BadgeIcon = config.badgeIcon;
            const isAdminAction = item.type === 'question_approved' || item.type === 'question_rejected';
            const isSystemNotif = item.type === 'profile_incomplete';

            const questionDeleted = item.questionDeleted;
            const isProfileLink = isSystemNotif;
            const noLink = questionDeleted && !isProfileLink;
            const Wrapper = noLink ? 'div' : Link;
            const wrapperProps = noLink
              ? { className: `inbox-item ${!item.read ? 'inbox-item--unread' : ''}` }
              : isProfileLink
                ? { to: '/settings/profile', className: `inbox-item ${!item.read ? 'inbox-item--unread' : ''}`, onClick: () => handleNotifClick(item) }
                : { to: `/qa/${item.questionId}`, className: `inbox-item ${!item.read ? 'inbox-item--unread' : ''}`, onClick: () => handleNotifClick(item) };

            return (
              <div key={`notif-${item._id}`} className="inbox-item__wrap">
                <Wrapper {...wrapperProps}>
                  <div className="inbox-item__avatar inbox-item__avatar--notif">
                    {isAdminAction || isSystemNotif ? (
                      <div className="inbox-item__admin-avatar" style={isSystemNotif ? { background: '#f59e0b' } : {}}>
                        {isSystemNotif ? <AlertCircleIcon size={18} /> : <CheckmarkCircle01Icon size={18} />}
                      </div>
                    ) : (
                      <Avatar src={from.avatar} name={from.displayName || from.username} size={36} />
                    )}
                    <div className="inbox-item__notif-badge" style={{ background: config.badgeBg }}>
                      <BadgeIcon size={10} />
                    </div>
                  </div>
                  <div className="inbox-item__content">
                    <div className="inbox-item__header">
                      <span className="inbox-item__name">
                        {isAdminAction ? (
                          <span className="inbox-item__admin-label">Admin</span>
                        ) : isSystemNotif ? (
                          <span className="inbox-item__admin-label" style={{ color: '#f59e0b' }}>Profile</span>
                        ) : (
                          from.displayName || from.username || 'Someone'
                        )}
                        <span className="inbox-item__action">{' '}{config.action(from)}</span>
                      </span>
                      <span className="inbox-item__time">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {!isSystemNotif && (
                      <div className={`inbox-item__preview ${!item.read ? 'inbox-item__preview--unread' : ''}`}>
                        {item.questionTitle}
                      </div>
                    )}
                    {questionDeleted && !isSystemNotif && (
                      <span className="inbox-item__deleted-label">Question deleted</span>
                    )}
                  </div>
                </Wrapper>
                <button
                  className="inbox-item__dismiss"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeNotification(item._id); }}
                  title="Dismiss notification"
                >
                  ×
                </button>
              </div>
            );
          }

          /* ── Conversation card ── */
          const conv = item;
          return (
            <Link
              key={`conv-${conv.user._id}`}
              to={`/messages/${conv.user._id}`}
              className={`inbox-item ${conv.unread ? 'inbox-item--unread' : ''}`}
            >
              <div className="inbox-item__avatar">
                <Avatar src={conv.user.avatar} name={conv.user.displayName} size={36} />
                {conv.unread && <div className="inbox-item__unread-dot" />}
              </div>
              <div className="inbox-item__content">
                <div className="inbox-item__header">
                  <span className="inbox-item__name">{conv.user.displayName || conv.user.username}</span>
                  <span className="inbox-item__time">
                    {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={`inbox-item__preview ${conv.unread ? 'inbox-item__preview--unread' : ''}`}>
                  {conv.lastMessage.text}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
