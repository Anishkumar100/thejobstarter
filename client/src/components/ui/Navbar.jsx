import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { useThemeStore } from '../../stores/useThemeStore.js';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, MessageCircle, User, Settings, LogOut, Bell, LayoutDashboard, Sparkles, Zap, ChevronDown, Users, HelpCircle, GraduationCap, Building2, Newspaper, School } from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

/*
 * Core nav links that are always visible (top level).
 * Pricing is conditionally added below the static list.
 */
const CORE_LINKS = [
  { to: '/dsa', label: 'DSA' },
  { to: '/dbms', label: 'DBMS' },
  { to: '/os', label: 'OS' },
  { to: '/programming', label: 'Programming' },
  { to: '/aptitude', label: 'Aptitude' },
  { to: '/about', label: 'About' }
];

/* Community dropdown sub-links */
const COMMUNITY_LINKS = [
  { to: '/blog', label: 'Blog', icon: Newspaper },
  { to: '/qa', label: 'Q&A', icon: HelpCircle },
  { to: '/users', label: 'Community', icon: Users }
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isPremium, subscriptionStatus } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const profileRef = useRef(null);
  const communityRef = useRef(null);

  /* Determine if user is center-enrolled or a coordinator — hide Pricing for them */
  const isCenterOrCoordinator = !!user?.coachingCenter || user?.publicMetadata?.role === 'coordinator' || !!user?.coordinatorFor;

  /* Role/org badge logic */
  const isCoordinator = user?.publicMetadata?.role === 'coordinator' || !!user?.coordinatorFor;
  const isStudentInCenter = !!user?.coachingCenter && !isCoordinator;

  /* Faculty status is Mongo-backed (mirrored into the store by AuthSync) — never from Clerk metadata */
  const isFaculty = !!user?.isFaculty;

  /* Build the full nav links list dynamically */
  const navLinks = [
    ...CORE_LINKS,
    ...(!isCenterOrCoordinator ? [{ to: '/pricing', label: 'Pricing' }] : []),
  ];

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

  /* Close community dropdown on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (communityRef.current && !communityRef.current.contains(e.target)) {
        setCommunityOpen(false);
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

  /* Check if ANY community link is active */
  const isCommunityActive = COMMUNITY_LINKS.some(l => isActive(l.to));

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        {/* Brand wrapper — flex-shrink: 0 via .navbar__brand so the logo NEVER gets squeezed/hidden */}
        <div className="navbar__brand">
          <BrandLogo onClick={closeMenu} />
        </div>

        <div className="navbar__desktop-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${isActive(link.to) ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Community dropdown */}
          <div
            className="navbar__community-wrapper"
            ref={communityRef}
            onMouseLeave={() => setCommunityOpen(false)}
          >
            <button
              className={`navbar__link navbar__community-trigger ${isCommunityActive ? 'navbar__link--active' : ''}`}
              onClick={() => setCommunityOpen(!communityOpen)}
              onMouseEnter={() => setCommunityOpen(true)}
            >
              Community <ChevronDown size={14} className={`navbar__community-chevron ${communityOpen ? 'navbar__community-chevron--open' : ''}`} />
            </button>

            {communityOpen && (
              <div className="navbar__community-dropdown">
                {COMMUNITY_LINKS.map(sub => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    className={`navbar__dropdown-item ${isActive(sub.to) ? 'navbar__dropdown-item--active' : ''}`}
                    onClick={() => setCommunityOpen(false)}
                  >
                    <sub.icon size={16} />
                    <span>{sub.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="navbar__actions">
          {isAuthenticated && user ? (
            <>
              {/* Upgrade CTA for free-tier non-center users */}
              {!isPremium && !isCenterOrCoordinator && (
                <Link to="/pricing" className="navbar__upgrade-link">
                  <Zap size={14} /> Upgrade
                </Link>
              )}
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
                  {/* Role/org badge — coordinator, student, or premium */}
                  {isCoordinator && (
                    <span className="navbar__org-badge navbar__org-badge--coordinator" title="Coordinator">
                      <Building2 size={12} />
                    </span>
                  )}
                  {isStudentInCenter && (
                    <span className="navbar__org-badge navbar__org-badge--student" title="Center Student">
                      <GraduationCap size={12} />
                    </span>
                  )}
                  {isFaculty && (
                    <span className="navbar__org-badge navbar__org-badge--faculty" title="Faculty">
                      <School size={12} />
                    </span>
                  )}
                  {isPremium && !isCenterOrCoordinator && (
                    <span className="navbar__premium-badge" title="Premium Member">
                      <Sparkles size={12} />
                    </span>
                  )}
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
                    {isFaculty && (
                      <Link
                        to="/faculty"
                        className="navbar__dropdown-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        <School size={16} />
                        <span>Faculty Panel</span>
                      </Link>
                    )}
                    <Link
                      to="/settings/profile"
                      className="navbar__dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Edit Profile</span>
                    </Link>
                    {/* Subscription settings link — only for non-center users */}
                    {!isCenterOrCoordinator && (
                      <Link
                        to="/settings/subscription"
                        className="navbar__dropdown-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Sparkles size={16} />
                        <span>{isPremium ? 'Subscription' : 'Upgrade to Premium'}</span>
                      </Link>
                    )}
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
            </>
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
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar__overlay-link ${isActive(link.to) ? 'navbar__overlay-link--active' : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}

            {/* Community section in mobile overlay */}
            <div className="navbar__overlay-subsection">
              <span className="navbar__overlay-subheader">Community</span>
              {COMMUNITY_LINKS.map(sub => (
                <Link
                  key={sub.to}
                  to={sub.to}
                  className={`navbar__overlay-sublink ${isActive(sub.to) ? 'navbar__overlay-sublink--active' : ''}`}
                  onClick={closeMenu}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
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
                {user.coachingCenter && (
                  <Link to="/dashboard" className="navbar__overlay-msg-btn" onClick={closeMenu} style={{ borderTop: 'none' }}>
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}
                {isFaculty && (
                  <Link to="/faculty" className="navbar__overlay-msg-btn" onClick={closeMenu} style={{ borderTop: 'none' }}>
                    <School size={18} />
                    Faculty Panel
                  </Link>
                )}
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
                {!isCenterOrCoordinator && (
                  <Link to="/settings/subscription" className="navbar__overlay-msg-btn" onClick={closeMenu} style={{ borderTop: 'none' }}>
                    <Sparkles size={18} />
                    {isPremium ? 'Subscription' : 'Upgrade to Premium'}
                  </Link>
                )}
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
