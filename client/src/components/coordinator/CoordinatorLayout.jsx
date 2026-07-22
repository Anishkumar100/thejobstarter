import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CoordinatorSidebar from './CoordinatorSidebar.jsx';
import { Menu, ExternalLink, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToastContainer from '../ui/Toast.jsx';
import { apiRequest } from '../../api/client.js';
import { useThemeStore } from '../../stores/useThemeStore.js';

/*
 * CoordinatorLayout — Wraps coordinator pages with sidebar navigation.
 * Fetches center data to display in the sidebar and replaces generic branding.
 */
export default function CoordinatorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: clerkUser } = useUser();
  const { theme, toggleTheme } = useThemeStore();
  const [center, setCenter] = useState(null);
  const [initDone, setInitDone] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  /* Fetch center info on mount */
  useEffect(() => {
    if (initDone) return;
    apiRequest('/coordinator/stats')
      .then(res => {
        if (res.data?.center) setCenter(res.data.center);
        setInitDone(true);
      })
      .catch(() => setInitDone(true));
  }, [initDone]);

  const coordinatorName = clerkUser?.fullName || clerkUser?.username || 'Coordinator';
  const coordinatorAvatar = clerkUser?.imageUrl || '';
  const coordinatorEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';

  return (
    <div className="admin-shell">
      {/* Top bar (mobile) */}
      <div className="admin-topbar">
        <button
          className="admin-topbar__hamburger"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <Link to="/coordinator" className="admin-topbar__brand" onClick={closeSidebar}>
          <span className="admin-topbar__brand-text" style={{ fontSize: '0.85rem' }}>
            {center?.name || 'Coordinator'}
          </span>
          <span className="admin-topbar__brand-sub">Coordinator Panel</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, cursor: 'pointer',
              border: '2px solid #000', background: 'var(--surface)',
              color: 'var(--text-primary)', fontSize: '0.82rem',
              transition: 'transform 0.12s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #000'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="/"
            className="admin-topbar__exit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            View Site
          </a>
        </div>
      </div>

      <div className="admin-layout">
        <CoordinatorSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          center={center}
          coordinatorName={coordinatorName}
          coordinatorAvatar={coordinatorAvatar}
          coordinatorEmail={coordinatorEmail}
        />
        <main className="admin-main">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
