import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, Code2, Tags, Database, Monitor, FileText,
  Users, HelpCircle, Globe, Mail, Image as ImageIcon,
  Home, Settings, Plus
} from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore.js';
import Loader from '../components/ui/Loader.jsx';

/*
 * AdminDashboard — Central hub for the admin panel
 * Shows stats and links to every management section with lucide-react icons
 */
const SECTIONS = [
  {
    heading: 'Content Management',
    items: [
      { title: 'DSA Lessons', count: 'lessons', link: '/admin/dsa', icon: BookOpen, color: '#e11d48' },
      { title: 'DSA Problems', count: 'problems', link: '/admin/dsa/problems', icon: Code2, color: '#e11d48' },
      { title: 'DSA Categories', count: null, link: '/admin/dsa/meta', icon: Tags, color: '#e11d48' },
      { title: 'DBMS Articles', count: 'dbms', link: '/admin/dbms', icon: Database, color: '#3b82f6' },
      { title: 'OS Articles', count: 'os', link: '/admin/os', icon: Monitor, color: '#22c55e' },
      { title: 'Blog Posts', count: 'blog', link: '/admin/blog', icon: FileText, color: '#f59e0b' },
      { title: 'Why Section Editor', count: null, link: '/admin/why-section', icon: FileText, color: '#ff4f00' },
    ]
  },
  {
    heading: 'Community',
    items: [
      { title: 'Users', count: 'users', link: '/admin/users', icon: Users, color: '#8b5cf6' },
      { title: 'Q&A Questions', count: 'questions', link: '/admin/qa', icon: HelpCircle, color: '#06b6d4' },
      { title: 'Languages', count: 'languages', link: '/admin/languages', icon: Globe, color: '#14b8a6' },
      { title: 'Newsletter Subs', count: 'newsletter', link: '/admin/newsletter', icon: Mail, color: '#f97316' },
    ]
  },
  {
    heading: 'Media & Settings',
    items: [
      { title: 'Media Library', count: null, link: '/admin/media', icon: ImageIcon, color: '#ec4899' },
      { title: 'Homepage Topics', count: 'topics', link: '/admin/topics', icon: Home, color: '#6366f1' },
      { title: 'Homepage Config', count: null, link: '/admin/homepage', icon: Settings, color: '#e11d48' },
    ]
  }
];

export default function AdminDashboard() {
  const { stats, loading, fetchStats } = useAdminStore();

  useEffect(() => { fetchStats(); }, []);

  return (
    <div>
      <Helmet>
        <title>Admin Dashboard — TheJobStarter</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Dashboard</h1>
        <span className="listing-header__count">Manage everything from one place</span>
      </div>

      {loading && <Loader text="LOADING STATS..." />}

      {!loading && stats && SECTIONS.map(section => (
        <div key={section.heading} style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '3px solid var(--border-color)' }}>
            {section.heading}
          </h2>
          <div className="admin-stats">
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.link}
                  className="admin-stats__card"
                  style={{ textDecoration: 'none', display: 'block', borderTop: `4px solid ${item.color}` }}
                >
                  <div className="admin-stats__number">
                    {item.count !== null && stats[item.count] !== undefined ? stats[item.count] : '—'}
                  </div>
                  <div className="admin-stats__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Icon size={14} />
                    <span>{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {!loading && stats && (
        <div className="admin-card" style={{ marginTop: 'var(--space-2xl)' }}>
          <div className="listing-header">
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Link to="/admin/dsa/lessons/new" className="btn btn--primary"><Plus size={14} style={{ marginRight: 4 }} /> New Lesson</Link>
            <Link to="/admin/dsa/problems/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> New Problem</Link>
            <Link to="/admin/dbms/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> DBMS Article</Link>
            <Link to="/admin/os/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> OS Article</Link>
            <Link to="/admin/blog/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> Blog Post</Link>
            <Link to="/admin/languages/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> Language</Link>
          </div>
        </div>
      )}
    </div>
  );
}
