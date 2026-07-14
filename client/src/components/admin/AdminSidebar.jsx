import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Code2, Layers, Tags, Database,
  FileText, Users, HelpCircle, Globe, Mail, Image as ImageIcon,
  Home, Settings, BookText, Tag, Cpu, ThumbsUp, MessageSquareText,
  X, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

/*
 * AdminSidebar — Navigation sidebar for the admin dashboard
 * Fully responsive with hamburger toggle on mobile
 * Sections reorganized for easy navigation across subjects
 */

/* ── Section data ── */
const SECTIONS = [
  {
    heading: 'Dashboard',
    links: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard }
    ]
  },
  {
    heading: 'DSA',
    links: [
      { to: '/admin/dsa', label: 'Lessons', icon: BookOpen },
      { to: '/admin/dsa/subtopics', label: 'Subtopics', icon: Layers },
      { to: '/admin/dsa/problems', label: 'Problems', icon: Code2 },
      { to: '/admin/dsa/meta', label: 'Categories', icon: Tags },
    ]
  },
  {
    heading: 'DBMS',
    links: [
      { to: '/admin/dbms', label: 'Lessons', icon: Database },
      { to: '/admin/dbms/subtopics', label: 'Subtopics', icon: Layers },
      { to: '/admin/dbms/problems', label: 'Problems', icon: BookText },
      { to: '/admin/dbms/meta', label: 'Categories', icon: Tag },
    ]
  },
  {
    heading: 'OS',
    links: [
      { to: '/admin/os', label: 'Lessons', icon: Cpu },
      { to: '/admin/os/subtopics', label: 'Subtopics', icon: Layers },
      { to: '/admin/os/problems', label: 'Problems', icon: BookText },
      { to: '/admin/os/meta', label: 'Categories', icon: Tag },
    ]
  },
  {
    heading: 'Content',
    links: [
      { to: '/admin/blog', label: 'Blog Posts', icon: FileText },
    ]
  },
  {
    heading: 'Community',
    links: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/qa', label: 'Q&A', icon: HelpCircle },
      { to: '/admin/languages', label: 'Languages', icon: Globe },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
      { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareText },
    ]
  },
  {
    heading: 'Settings',
    links: [
      { to: '/admin/media', label: 'Media Library', icon: ImageIcon },
      { to: '/admin/topics', label: 'Homepage Topics', icon: Home },
      { to: '/admin/homepage', label: 'Homepage Config', icon: Settings },
      { to: '/admin/about-page', label: 'About Page', icon: FileText },
      { to: '/admin/why-section', label: 'Why DSA/DBMS/OS', icon: ThumbsUp },
      { to: '/admin/why-the-job-starter', label: 'Why TheJobStarter', icon: ThumbsUp },
      { to: '/admin/how-it-works', label: 'How It Works', icon: ThumbsUp },
    ]
  }
];

export default function AdminSidebar({ isOpen, onToggle }) {
  const [expandedSections, setExpandedSections] = useState(
    /* Collapse everything except Dashboard by default on mobile */
    SECTIONS.map((s) => s.heading === 'Dashboard')
  );

  const toggleSection = (index) => {
    setExpandedSections((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <>
      {/* ── Overlay (mobile only) ── */}
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${isOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <p className="admin-sidebar__brand-text">TheWebytes</p>
          <p className="admin-sidebar__brand-sub">Admin Panel</p>
          {/* Close button — mobile only */}
          <button
            className="admin-sidebar__close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {SECTIONS.map((section, sIndex) => (
          <div key={section.heading} className="admin-sidebar__section">
            {/* Section heading (collapsible on mobile) */}
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

            {/* Section links */}
            <div
              className={`admin-sidebar__links${expandedSections[sIndex] ? '' : ' admin-sidebar__links--collapsed'}`}
            >
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/admin'}
                    className={({ isActive }) =>
                      `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
                    }
                    onClick={() => {
                      /* Close sidebar on nav (mobile) */
                      if (window.innerWidth < 900) onToggle();
                    }}
                  >
                    <Icon size={16} className="admin-sidebar__link-icon" />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </aside>
    </>
  );
}
