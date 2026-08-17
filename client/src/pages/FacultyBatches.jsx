import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Layers, Users, CalendarClock, AlertTriangle, ArrowRight, BookOpen, Search } from 'lucide-react';

const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };

/*
 * FacultyBatches — View-only list of the batches assigned to this faculty.
 * Shows roster size, status, and the active plan for each batch.
 */
export default function FacultyBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiRequest('/faculty/batches')
      .then(res => {
        console.log('[FACULTY] Batches fetched:', res.data?.length);
        setBatches(res.data || []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filtered = batches.filter(b =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading batches..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
      <Helmet><title>Batches — Faculty — TheWebytes</title></Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={22} /> My Batches
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {batches.length} batch{batches.length !== 1 ? 'es' : ''} assigned to you · view-only
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '3px solid #000', padding: '6px 10px', background: 'var(--bg-surface)', boxShadow: '3px 3px 0 #000', minWidth: 220 }}>
          <Search size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search batches..."
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>No batches found.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {search ? 'Try a different search term.' : 'No batches have been assigned to you yet — contact your center coordinator.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
          {filtered.map(batch => (
            <div key={batch._id} style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{batch.name}</h3>
                  {batch.code && <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{batch.code}</span>}
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '3px 8px', border: '2px solid #000', flexShrink: 0,
                  background: batch.status === 'active' ? '#dcfce7' : batch.status === 'archived' ? '#f3f4f6' : '#fef3c7',
                  color: batch.status === 'active' ? '#166534' : batch.status === 'archived' ? '#374151' : '#92400e'
                }}>
                  {batch.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={14} /> {batch.studentCount}<span style={{ color: 'var(--text-tertiary)' }}>/{batch.expectedStudents || '\u221e'}</span> students
                </span>
              </div>

              {batch.plan ? (
                <div style={{ border: '2px solid #000', padding: '10px 12px', background: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BookOpen size={12} /> Active Plan
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{batch.plan.planName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    <CalendarClock size={12} /> Day {batch.plan.currentDay}/{batch.plan.totalDays}
                    <span style={{ flex: 1, height: 8, border: '2px solid #000', background: 'var(--bg-surface)', overflow: 'hidden', display: 'inline-block' }}>
                      <span style={{ display: 'block', height: '100%', width: `${Math.min(100, Math.round((batch.plan.currentDay / batch.plan.totalDays) * 100))}%`, background: batch.plan.behind ? '#dc2626' : '#16a34a' }} />
                    </span>
                  </div>
                  {batch.plan.behind && (
                    <div style={{ marginTop: 6, fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> Behind schedule
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ border: '2px dashed #000', padding: '10px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  No active plan for this batch
                </div>
              )}

              <Link to={`/faculty/batches/${batch._id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '3px solid #000', background: '#000', color: '#fff', padding: '8px 12px', fontSize: '0.78rem', fontWeight: 800, boxShadow: '3px 3px 0 #000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Open Batch <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}