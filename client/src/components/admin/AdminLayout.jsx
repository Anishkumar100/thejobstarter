import { useState, useCallback } from 'react';
import AdminSidebar from './AdminSidebar.jsx';
import { Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToastContainer from '../ui/Toast.jsx';
import { useThemeStore } from '../../stores/useThemeStore.js';

/*
 * AdminLayout — Wraps admin pages with sidebar navigation
 * No site-wide Navbar or Footer — full-screen admin experience
 * Responsive: hamburger toggle on mobile, persistent sidebar on desktop
 */
export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

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
            View Site →
          </a>
        </div>
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
