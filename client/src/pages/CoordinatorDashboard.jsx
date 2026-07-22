import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  Users, Layers, FileText, Plus, ArrowRight, AlertCircle,
  CheckCircle, Clock, GraduationCap, Building2, TrendingUp, Download
} from 'lucide-react';

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: 'var(--shadow)'
};

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchesRes, statsRes] = await Promise.all([
        apiRequest('/coordinator/batches/progress'),
        apiRequest('/coordinator/stats')
      ]);
      setBatches(batchesRes.data || []);
      setStats(statsRes.data);
      if (statsRes.data?.center) setCenter(statsRes.data.center);
    } catch (err) {
      console.error('[COORD DASH] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalStudents = batches.reduce((sum, b) => sum + (b.studentCount || 0), 0);
  const totalPlans = new Set(batches.filter(b => b.plan).map(b => b.plan.planId)).size;
  const activeBatches = batches.filter(b => b.status === 'active').length;
  const behindBatches = batches.filter(b => b.plan?.behind).length;

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="LOADING DASHBOARD..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, borderLeft: '6px solid #dc2626' }}><strong style={{ color: '#dc2626', fontSize: '0.9rem' }}>Error</strong><p style={{ marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{error}</p></div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>Dashboard — {center?.name || 'Coordinator'} — TheWebytes</title></Helmet>

      {/* ═══ WELCOME HEADER ═══ */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
          <GraduationCap size={28} />
          Welcome back{stats?.coordinatorName ? `, ${stats.coordinatorName}` : ''}
        </h1>
        {center && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={16} /> {center.name}
            {center.status && (
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                padding: '2px 8px', border: '2px solid var(--border-color)',
                background: center.status === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                color: center.status === 'active' ? 'var(--success-text)' : 'var(--text-secondary)'
              }}>
                {center.status}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'var(--space-md)', marginBottom: 'var(--space-xl)'
      }}>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <Users size={24} style={{ marginBottom: 6, color: 'var(--text-tertiary)' }} />
          <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900 }}>{totalStudents}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Students</div>
        </div>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <Layers size={24} style={{ marginBottom: 6, color: 'var(--text-tertiary)' }} />
          <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900 }}>{activeBatches}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Batches</div>
        </div>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <FileText size={24} style={{ marginBottom: 6, color: 'var(--text-tertiary)' }} />
          <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900 }}>{totalPlans}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Plans</div>
        </div>
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-md)' }}>
          <TrendingUp size={24} style={{ marginBottom: 6, color: behindBatches > 0 ? '#dc2626' : 'var(--success)' }} />
          <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: behindBatches > 0 ? '#dc2626' : 'var(--text-primary)' }}>{behindBatches}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Behind Schedule</div>
        </div>
      </div>

      {/* ═══ BATCH PROGRESS CARDS ═══ */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
            <Layers size={20} /> Batch Progress
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/coordinator/plans"
              className="btn btn--sm"
              style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <FileText size={14} /> Manage Plans
            </Link>
            <Link to="/coordinator/batches"
              className="btn btn--sm"
              style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Plus size={14} /> All Batches
            </Link>
          </div>
        </div>

        {batches.length === 0 ? (
          <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
            <Layers size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 6 }}>No batches yet</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
              Create a batch and assign a plan to start tracking progress.
            </p>
            <Link to="/coordinator/batches" className="btn" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Create Batch
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {batches.map(batch => {
              const plan = batch.plan;
              const progressPct = plan ? Math.round((plan.currentDay / plan.totalDays) * 100) : 0;
              const isBehind = plan?.behind;

              return (
                <div key={batch._id} style={{
                  border: '3px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  boxShadow: isBehind ? '6px 6px 0 #dc2626' : 'var(--shadow)',
                  padding: 'var(--space-md)',
                  borderLeft: isBehind ? '8px solid #dc2626' : '8px solid var(--border-color)',
                  transition: 'transform 0.12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)'
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      {/* Batch name + status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {batch.name}
                        </h3>
                        <span style={{
                          fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                          padding: '2px 6px', border: '2px solid var(--border-color)',
                          background: batch.status === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)'
                        }}>
                          {batch.status}
                        </span>
                        {isBehind && (
                          <span style={{
                            fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                            padding: '2px 6px', border: '2px solid #dc2626',
                            background: '#fee2e2', color: '#dc2626'
                          }}>
                            <AlertCircle size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} /> Behind
                          </span>
                        )}
                      </div>

                      {/* Plan info */}
                      {plan ? (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <FileText size={13} />
                            <strong>{plan.planName}</strong>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
                              · Started {new Date(plan.startDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <div style={{
                              flex: 1, height: 16,
                              background: 'var(--bg-tertiary)',
                              border: '2px solid var(--border-color)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%', width: `${progressPct}%`,
                                background: isBehind ? '#dc2626' : 'var(--success)',
                                transition: 'width 0.4s ease'
                              }} />
                            </div>
                            <span style={{
                              fontWeight: 800, fontSize: '0.78rem', whiteSpace: 'nowrap',
                              color: plan.currentDay >= plan.totalDays ? 'var(--success)' : 'var(--text-primary)'
                            }}>
                              Day {plan.currentDay} / {plan.totalDays}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
                          padding: '6px 10px', border: '2px dashed var(--border-color)',
                          fontSize: '0.78rem', color: 'var(--text-tertiary)'
                        }}>
                          <AlertCircle size={14} />
                          No plan assigned yet
                        </div>
                      )}

                      {/* Batch meta */}
                      <div style={{
                        display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap',
                        fontSize: '0.7rem', color: 'var(--text-tertiary)'
                      }}>
                        <span><Users size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                          {batch.studentCount} student{batch.studentCount !== 1 ? 's' : ''}
                          {batch.expectedStudents ? ` / ${batch.expectedStudents} expected` : ''}
                        </span>
                        <span>Code: <strong style={{ fontFamily: 'monospace' }}>{batch.code}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Link to={`/coordinator/batches/${batch._id}`}
                        className="btn btn--sm"
                        style={{ fontSize: '0.65rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        View Batch <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div style={{ ...CARD }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={18} /> Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <Link to="/coordinator/plans/new" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <FileText size={16} /> Create Plan
          </Link>
          <Link to="/coordinator/batches" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <Layers size={16} /> New Batch
          </Link>
          <Link to="/coordinator/general-stats" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <TrendingUp size={16} /> View Stats
          </Link>
        </div>
      </div>
    </div>
  );
}
