import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CoordinatorSidebar from './CoordinatorSidebar.jsx';
import { Menu, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToastContainer from '../ui/Toast.jsx';
import { apiRequest } from '../../api/client.js';

/*
 * CoordinatorLayout — Wraps coordinator pages with sidebar navigation.
 * Fetches center data to display in the sidebar and replaces generic branding.
 */
export default function CoordinatorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: clerkUser } = useUser();
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
