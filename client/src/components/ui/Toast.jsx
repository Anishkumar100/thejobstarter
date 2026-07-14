import { useToastStore } from '../../stores/useToastStore.js';
import { Tick02Icon, Cancel01Icon, InformationCircleIcon } from 'hugeicons-react';
import './Toast.css';

/*
 * Toast notification container
 * Renders all active toasts fixed at bottom-right
 */
export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span className="toast__icon">
            {toast.type === 'success' && <Tick02Icon size={16} />}
            {toast.type === 'error' && <Cancel01Icon size={16} />}
            {toast.type === 'info' && <InformationCircleIcon size={16} />}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button className="toast__close" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
