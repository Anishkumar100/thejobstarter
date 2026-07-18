import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, X, ChevronDown,
  Building2, Mail, User as UserIcon,
  MapPin, Phone, Shield, Circle
} from 'lucide-react';
import { useState } from 'react';

/* ── Section data ── */
const SECTIONS = [
  {
    heading: 'Overview',
    links: [
      { to: '/coordinator', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    heading: 'Students',
    links: [
      { to: '/coordinator/students', label: 'All Students', icon: Users },
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

        {/* ═══ COORDINATOR PROFILE (brutalist block, clickable) ═══ */}
        <Link
          to="/coordinator/profile"
          style={{
            margin: '0 var(--space-sm) var(--space-md)',
            padding: 'var(--space-sm)',
            border: '3px solid #000',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'inherit',
            background: 'var(--bg-surface)',
            boxShadow: '3px 3px 0 #000',
            transition: 'all 0.12s ease',
          }}
          onClick={() => { if (window.innerWidth < 900) onToggle(); }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.boxShadow = '5px 5px 0 #000';
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-surface)';
            e.currentTarget.style.boxShadow = '3px 3px 0 #000';
            e.currentTarget.style.transform = 'none';
          }}
        >
          {coordinatorAvatar ? (
            <img src={coordinatorAvatar} alt="" style={{
              width: 34, height: 34, border: '2px solid #000',
              objectFit: 'cover', flexShrink: 0
            }} />
          ) : (
            <div style={{
              width: 34, height: 34, border: '2px solid #000',
              background: 'var(--bg-inverse)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserIcon size={16} />
            </div>
          )}
          <div style={{ minWidth: 0, fontSize: '0.72rem', flex: 1 }}>
            <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {coordinatorName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#059669', fontWeight: 600, fontSize: '0.6rem', marginTop: 1 }}>
              <Shield size={10} /> Coordinator
            </div>
          </div>
        </Link>
      </aside>
    </>
  );
}
