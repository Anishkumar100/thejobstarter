import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, X, ChevronDown, FileText,
  Building2, Mail, User as UserIcon, Layers, BarChart3,
  MapPin, Phone, Shield, Circle, BookOpen, Sun, Moon
} from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '../../stores/useThemeStore.js';

/* ── Section data ── */
const SECTIONS = [
  {
    heading: 'Overview',
    links: [
      { to: '/coordinator', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/coordinator/general-stats', label: 'General Stats', icon: BarChart3 },
    ]
  },
  {
    heading: 'Students',
    links: [
      { to: '/coordinator/students', label: 'All Students', icon: Users },
    ]
  },
  {
    heading: 'Batches',
    links: [
      { to: '/coordinator/batches', label: 'Manage Batches', icon: Layers },
    ]
  },
  {
    heading: 'Plans',
    links: [
      { to: '/coordinator/plans', label: 'Study Plans', icon: FileText },
    ]
  },
  {
    heading: 'Courses',
    links: [
      { to: '/coordinator/courses', label: 'Manage Courses', icon: BookOpen },
    ]
  },
  {
    heading: 'Centre',
    links: [
      { to: '/coordinator/profile', label: 'Centre Profile', icon: Building2 },
    ]
  }
];

export default function CoordinatorSidebar({ isOpen, onToggle, center, coordinatorName, coordinatorAvatar, coordinatorEmail }) {
  const { theme, toggleTheme } = useThemeStore();
  /* All sections open by default */
  const [expandedSections, setExpandedSections] = useState(
    SECTIONS.map(() => true)
  );

  const toggleSection = (index) => {
    setExpandedSections((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const statusColor = center?.status === 'active' ? '#059669'
    : center?.status === 'trial' ? '#d97706'
    : '#dc2626';

  return (
    <>
      {isOpen && (
        <div className="admin-sidebar-overlay" onClick={onToggle} aria-hidden="true" />
      )}

      <aside
        className={`admin-sidebar${isOpen ? ' admin-sidebar--open' : ''}`}
        style={{
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '4px solid #000',
        }}
      >
        {/* ═══ BRAND — Logo + Centre Name (NO "Coordinator Panel") ═══ */}
        <div style={{
          padding: 'var(--space-md) var(--space-md) var(--space-sm)',
          borderBottom: '4px solid #000',
          marginBottom: 'var(--space-sm)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {center?.logo ? (
              <img src={center.logo} alt="" style={{
                width: 40, height: 40, border: '3px solid #000',
                objectFit: 'cover', flexShrink: 0, boxShadow: '3px 3px 0 #000'
              }} />
            ) : (
              <div style={{
                width: 40, height: 40, border: '3px solid #000',
                background: 'var(--bg-inverse)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '3px 3px 0 #000'
              }}>
                <Building2 size={20} style={{ color: 'var(--accent)' }} />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontWeight: 900, fontSize: '0.9rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
              }}>
                {center?.name || 'Coaching Centre'}
              </div>
              {center?.status && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.12em', marginTop: 2,
                }}>
                  <Circle size={6} fill={statusColor} color={statusColor} />
                  <span style={{ color: statusColor }}>{center.status}</span>
                </div>
              )}
            </div>
          </div>
          <button
            className="admin-sidebar__close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* ═══ NAVIGATION ═══ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-xs)' }}>
          {SECTIONS.map((section, sIndex) => {
            const isLast = sIndex === SECTIONS.length - 1;
            return (
              <div key={section.heading} style={{ marginBottom: isLast ? 0 : 'var(--space-xs)' }}>
                <button
                  className="admin-sidebar__heading"
                  onClick={() => toggleSection(sIndex)}
                  aria-expanded={expandedSections[sIndex]}
                >
                  <span>{section.heading}</span>
                  <ChevronDown
                    size={14}
                    className={`admin-sidebar__chevron${expandedSections[sIndex] ? ' admin-sidebar__chevron--open' : ''}`}
                  />
                </button>
                <div className={`admin-sidebar__links${expandedSections[sIndex] ? '' : ' admin-sidebar__links--collapsed'}`}>
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/coordinator'}
                        className={({ isActive }) =>
                          `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
                        }
                        onClick={() => { if (window.innerWidth < 900) onToggle(); }}
                      >
                        <Icon size={16} className="admin-sidebar__link-icon" />
                        {link.label}
                      </NavLink>
                    );
                  })}
                </div>
                {!isLast && <div style={{
                  height: '2px', background: '#000', margin: 'var(--space-sm) var(--space-sm) 0',
                  opacity: 0.15
                }} />}
              </div>
            );
          })}
        </div>

        {/* ═══ CENTRE INFO (compact brutalist block) ═══ */}
        {center && (
          <div style={{
            margin: '0 var(--space-sm) var(--space-sm)',
            padding: 'var(--space-sm)',
            border: '3px solid #000',
            background: 'var(--bg-tertiary)',
            boxShadow: '3px 3px 0 #000',
            fontSize: '0.68rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <MapPin size={11} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {center.address || 'No address on file'}
              </span>
            </div>
            {center.contactPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <Phone size={11} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {center.contactPhone}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Mail size={11} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {center.contactEmail || 'No email on file'}
              </span>
            </div>
          </div>
        )}

        {/* ═══ THEME TOGGLE + PROFILE LINK (compact row) ═══ */}
        <div style={{
          margin: '0 var(--space-sm) var(--space-md)',
          padding: 'var(--space-sm)',
          border: '3px solid #000',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-surface)',
          boxShadow: '3px 3px 0 #000',
        }}>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, cursor: 'pointer', flexShrink: 0,
              border: '2px solid #000', background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)', fontSize: '0.82rem',
              transition: 'transform 0.12s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #000'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </div>
          </div>
          <Link
            to="/coordinator/profile"
            onClick={() => { if (window.innerWidth < 900) onToggle(); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px',
              border: '2px solid #000', textDecoration: 'none',
              color: 'inherit', background: 'var(--bg-tertiary)',
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-inverse)'; e.currentTarget.style.color = 'var(--text-inverse)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'inherit'; }}
          >
            <UserIcon size={12} /> Profile
          </Link>
        </div>
      </aside>
    </>
  );
}
