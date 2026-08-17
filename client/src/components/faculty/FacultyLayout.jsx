import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import FacultySidebar from './FacultySidebar.jsx';
import SuspendedGate from '../ui/SuspendedGate.jsx';
import { Menu, ExternalLink, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToastContainer from '../ui/Toast.jsx';
import { apiRequest } from '../../api/client.js';
import { useThemeStore } from '../../stores/useThemeStore.js';

/*
 * FacultyLayout — Wraps faculty pages with sidebar navigation.
 * Fetches center data (from /faculty/stats) for sidebar branding,
 * same pattern as CoordinatorLayout but faculty-scoped.
 */
export default function FacultyLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: clerkUser } = useUser();
  const { theme, toggleTheme } = useThemeStore();
  const [center, setCenter] = useState(null);
  const [initDone, setInitDone] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  /* Fetch center info on mount (stats endpoint returns the populated center doc) */
  useEffect(() => {
    if (initDone) return;
    apiRequest('/faculty/stats')
      .then(res => {
        if (res.data?.center) setCenter(res.data.center);
        setInitDone(true);
      })
      .catch(() => setInitDone(true));
  }, [initDone]);

  const facultyName = clerkUser?.fullName || clerkUser?.username || 'Faculty';
  const facultyAvatar = clerkUser?.imageUrl || '';
  const facultyEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';

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
        <Link to="/faculty" className="admin-topbar__brand" onClick={closeSidebar}>
          <span className="admin-topbar__brand-text" style={{ fontSize: '0.85rem' }}>
            {center?.name || 'Faculty'}
          </span>
          <span className="admin-topbar__brand-sub">Faculty Panel</span>
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
        <FacultySidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          center={center}
          facultyName={facultyName}
          facultyAvatar={facultyAvatar}
          facultyEmail={facultyEmail}
        />
        <main className="admin-main">
          <SuspendedGate center={center}>
            {children}
          </SuspendedGate>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}