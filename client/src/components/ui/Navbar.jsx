import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { useThemeStore } from '../../stores/useThemeStore.js';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, MessageCircle, User, Settings, LogOut, Bell, LayoutDashboard } from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

const NAV_LINKS = [
  { to: '/dsa', label: 'DSA' },
  { to: '/dbms', label: 'DBMS' },
  { to: '/os', label: 'OS' },
  { to: '/programming', label: 'Programming' },
  { to: '/blog', label: 'Blog' },
  { to: '/qa', label: 'Q&A' },
  { to: '/users', label: 'Community' },
  { to: '/about', label: 'About' }
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* Fetch unread notification count when authenticated, poll every 30s, refetch on focus */
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, [isAuthenticated]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    /* Match the route prefix exactly to avoid partial matches */
    return pathname === to || pathname.startsWith(to + '/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div style={{ overflow: 'hidden' }}>
          <BrandLogo onClick={closeMenu} />
        </div>

        <div className="navbar__desktop-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${isActive(link.to) ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          {isAuthenticated && user ? (
            <div className="navbar__profile-wrapper" ref={profileRef}>
              <button
                className="navbar__user"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="navbar__avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} className="navbar__avatar-img" />
                  ) : (
                    <User size={16} />
                  )}
                  {unreadCount > 0 && (
                    <span className="navbar__user-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </div>
                <span className="navbar__username">{user.displayName || user.username}</span>
              </button>

              {profileOpen && (
                <div className="navbar__dropdown">
                  <Link
                    to="/messages"
                    className="navbar__dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <MessageCircle size={16} />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="navbar__notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </Link>
                  {user.coachingCenter && (
                    <Link
                      to="/dashboard"
                      className="navbar__dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <Link
                    to={`/users/${user.username}`}
                    className="navbar__dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    to="/settings/profile"
                    className="navbar__dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Edit Profile</span>
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={() => {
                      setProfileOpen(false);
                      window.Clerk?.signOut?.();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/sign-in" className="navbar__login-btn">
              Login
            </Link>
          )}

          <button
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Fullscreen mobile overlay */}
      <div className={`navbar__overlay ${menuOpen ? 'navbar__overlay--open' : ''}`}>
        <div className="navbar__overlay-header">
          <BrandLogo onClick={closeMenu} />
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="navbar__overlay-body">
          <div className="navbar__overlay-links">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar__overlay-link ${isActive(link.to) ? 'navbar__overlay-link--active' : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar__overlay-bottom">
            {isAuthenticated && user ? (
              <div className="navbar__overlay-user">
                <Link to={`/users/${user.username}`} className="navbar__overlay-profile" onClick={closeMenu}>
                  <div className="navbar__overlay-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="navbar__avatar-img" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div>
                    <div className="navbar__overlay-name">{user.displayName || user.username}</div>
                    <div className="navbar__overlay-handle">@{user.username}</div>
                  </div>
                </Link>
                <Link to="/messages" className="navbar__overlay-msg-btn" onClick={closeMenu}>
                  <MessageCircle size={18} />
                  Messages
                  {unreadCount > 0 && (
                    <span className="navbar__notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </Link>
                <Link to="/settings/profile" className="navbar__overlay-msg-btn" onClick={closeMenu} style={{ borderTop: 'none' }}>
                  <Settings size={18} />
                  Edit Profile
                </Link>
                <button
                  className="navbar__overlay-msg-btn navbar__overlay-signout"
                  onClick={() => { closeMenu(); window.Clerk?.signOut?.(); }}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="navbar__overlay-auth">
                <Link to="/sign-in" className="btn btn--primary btn--full" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/sign-up" className="btn btn--full" style={{ marginTop: 8 }} onClick={closeMenu}>
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="navbar__overlay-theme-btn"
              onClick={() => { toggleTheme(); }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
