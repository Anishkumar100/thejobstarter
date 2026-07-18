import { useEffect, useState } from 'react';
import { CheckmarkCircle01Icon } from 'hugeicons-react';
import { getCelebrationMessage } from '../../utils/progressMessages.js';
import { useProgressMessageStore } from '../../stores/useProgressMessageStore.js';

/*
 * CelebrationBanner — Shows a brief celebration message when an item is marked complete.
 * Auto-hides after `duration` ms. Set `show` to true to trigger.
 * Uses progress messages from the store, falling back to defaults.
 */
export default function CelebrationBanner({ show, subjectName = '', duration = 5000 }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const storeMessages = useProgressMessageStore(s => s.messages);

  useEffect(() => {
    if (show) {
      const msg = getCelebrationMessage(100, storeMessages);
      setMessage(msg);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, storeMessages]);

  if (!visible) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: 'var(--space-sm) var(--space-md)',
      marginBottom: 'var(--space-md)',
      border: '3px solid var(--success)',
      background: 'var(--success-bg)',
      color: 'var(--success-text)',
      boxShadow: '4px 4px 0 var(--success)',
      fontSize: '0.85rem',
      fontWeight: 600,
      animation: 'celebrationFadeIn 0.3s ease-out'
    }}>
      <CheckmarkCircle01Icon size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
      <span>{subjectName ? `${subjectName}: ` : ''}{message}</span>
    </div>
  );
}
