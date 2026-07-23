import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, Code2, Tags, Database, Monitor, FileText,
  Users, HelpCircle, Globe, Mail, Image as ImageIcon,
  Home, Settings, Plus, Terminal, Layers, TrendingUp, AlertCircle, Clock,
  Building2, GraduationCap, BarChart3, ArrowRight
} from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore.js';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';

/*
 * AdminDashboard — Central hub for the admin panel
 * Shows aggregate stats and links to every management section.
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
      { title: 'Programming Lessons', count: 'programmingLessons', link: '/admin/programming', icon: Terminal, color: '#a855f7' },
      { title: 'Programming Problems', count: 'programmingProblems', link: '/admin/programming/problems', icon: Code2, color: '#a855f7' },
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
  const [batchPlanStats, setBatchPlanStats] = useState(null);
  const [bpLoading, setBpLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/admin/batch-plan-stats');
        setBatchPlanStats(res.data);
      } catch (err) {
        console.error('[ADMIN] Error fetching batch/plan stats:', err.message);
      }
      setBpLoading(false);
    })();
  }, []);

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

      {/* ═══ OVERVIEW STATS — Centers, Batches, Plans, Students ═══ */}
      {!bpLoading && batchPlanStats && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)', borderBottom: '3px solid var(--border-color)' }}>
            Overview
          </h2>
          <div className="admin-stats">
            <Link to="/admin/coaching-centers" className="admin-stats__card" style={{ textDecoration: 'none', display: 'block' }}>
              <Building2 size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
              <div className="admin-stats__num">{batchPlanStats.totalCenters || 0}</div>
              <div className="admin-stats__label">Centres</div>
            </Link>
            <Link to="/admin/coaching-centers" className="admin-stats__card" style={{ textDecoration: 'none', display: 'block' }}>
              <Layers size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
              <div className="admin-stats__num">{batchPlanStats.totalBatches || 0}</div>
              <div className="admin-stats__label">Batches</div>
            </Link>
            <Link to="/admin/plans" className="admin-stats__card" style={{ textDecoration: 'none', display: 'block' }}>
              <FileText size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
              <div className="admin-stats__num">{batchPlanStats.totalPlansAll || 0}</div>
              <div className="admin-stats__label">Total Plans</div>
            </Link>
            <div className="admin-stats__card">
              <Users size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
              <div className="admin-stats__num">{batchPlanStats.totalStudents || 0}</div>
              <div className="admin-stats__label">Platform Users</div>
            </div>
            <div className="admin-stats__card">
              <GraduationCap size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
              <div className="admin-stats__num">{batchPlanStats.centerStudents || 0}</div>
              <div className="admin-stats__label">Students From An Enterprise Plans</div>
            </div>
            <div className="admin-stats__card" style={{ border: `3px solid ${batchPlanStats.behindCount > 0 ? '#dc2626' : 'var(--border-color)'}` }}>
              <TrendingUp size={24} style={{ color: batchPlanStats.behindCount > 0 ? '#dc2626' : 'var(--success)', marginBottom: 8 }} />
              <div className="admin-stats__num" style={{ color: batchPlanStats.behindCount > 0 ? '#dc2626' : 'inherit' }}>{batchPlanStats.behindCount}</div>
              <div className="admin-stats__label">Behind Schedule</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.3 }}>
                Batches that started a plan ≥3 days ago but have covered less than 40% of plan duration
              </p>
            </div>
          </div>

          {/* Active Plans vs Running Plans quick highlight */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
            <Link to="/admin/plans?status=published" style={{
              flex: 1, minWidth: 180, padding: 'var(--space-md)', border: '3px solid var(--border-color)',
              background: 'var(--bg-surface)', boxShadow: 'var(--shadow)',
              textDecoration: 'none', color: 'inherit',
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)'
            }}>
              <FileText size={24} style={{ color: '#16a34a' }} />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{batchPlanStats.activePlans || 0}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Published Plans</div>
              </div>
            </Link>
            <Link to="/admin/coaching-centers" style={{
              flex: 1, minWidth: 180, padding: 'var(--space-md)', border: '3px solid var(--border-color)',
              background: 'var(--bg-surface)', boxShadow: 'var(--shadow)',
              textDecoration: 'none', color: 'inherit',
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)'
            }}>
              <Layers size={24} style={{ color: '#2563eb' }} />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{batchPlanStats.activeBatchPlans || 0}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Batches Running Plans</div>
              </div>
            </Link>
          </div>
        </div>
      )}

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
            <Link to="/admin/programming/lessons/new" className="btn btn--primary"><Plus size={14} style={{ marginRight: 4 }} /> New Prog Lesson</Link>
            <Link to="/admin/programming/problems/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> New Prog Problem</Link>
            <Link to="/admin/blog/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> Blog Post</Link>
            <Link to="/admin/languages/new" className="btn"><Plus size={14} style={{ marginRight: 4 }} /> Language</Link>
          </div>
        </div>
      )}
    </div>
  );
}
