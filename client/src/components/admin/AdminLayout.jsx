import { useState, useCallback } from 'react';
import AdminSidebar from './AdminSidebar.jsx';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToastContainer from '../ui/Toast.jsx';

/*
 * AdminLayout — Wraps admin pages with sidebar navigation
 * No site-wide Navbar or Footer — full-screen admin experience
 * Responsive: hamburger toggle on mobile, persistent sidebar on desktop
 */
export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="admin-shell">
      {/* ── Top bar (mobile) ── */}
      <div className="admin-topbar">
        <button
          className="admin-topbar__hamburger"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <Link to="/admin" className="admin-topbar__brand" onClick={closeSidebar}>
          <span className="admin-topbar__brand-text">TheWebytes</span>
          <span className="admin-topbar__brand-sub">Admin</span>
        </Link>
        <a
          href="/"
          className="admin-topbar__exit"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Site →
        </a>
      </div>

      <div className="admin-layout">
        <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main className="admin-main">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
