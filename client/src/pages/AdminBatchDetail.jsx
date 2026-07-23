import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import {
  ArrowLeft, Users, Layers, FileText, BookOpen, AlertCircle,
  CheckCircle, Clock, Calendar, X
} from 'lucide-react';

export default function AdminBatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [centerStudents, setCenterStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Plan assign modal */
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [assigning, setAssigning] = useState(false);

  /* Unassign confirm */
  const [unassignConfirm, setUnassignConfirm] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  useEffect(() => {
    fetchBatchData();
  }, [id]);

  const fetchBatchData = async () => {
    setLoading(true);
    setError(null);
    try {
      /* Fetch batch list to find our batch */
      const batchesRes = await apiRequest('/batches');
      const batchData = (batchesRes.data || []).find(b => b._id === id);
      if (!batchData) {
        setError('Batch not found');
        setLoading(false);
        return;
      }
      setBatch(batchData);

      /* Fetch active plan */
      try {
        const planRes = await apiRequest(`/plans/batches/${id}/active-plan`);
        setActivePlan(planRes.data || null);
      } catch {
        setActivePlan(null);
      }

      /* Fetch all students to find enrolled ones */
      const studentsRes = await apiRequest('/users');
      const allUsers = studentsRes.data || [];
      const enrolled = allUsers.filter(u => (u.batch?._id || u.batch) === id);
      setStudents(enrolled);
      setCenterStudents(allUsers.filter(u => !u.batch));

    } catch (err) {
      console.error('[ADMIN BATCH] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  const openPlanPicker = async () => {
    try {
      const res = await apiRequest('/plans?status=published');
      setAvailablePlans(res.data || []);
      setSelectedPlanId('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setShowPlanPicker(true);
    } catch (err) {
      alert(err.message || 'Failed to load plans');
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedPlanId || !startDate) return;
    setAssigning(true);
    try {
      await apiRequest(`/plans/batches/${id}/assign-plan`, {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId, startDate })
      });
      const planRes = await apiRequest(`/plans/batches/${id}/active-plan`);
      setActivePlan(planRes.data || null);
      setShowPlanPicker(false);
    } catch (err) {
      alert(err.message || 'Failed to assign plan');
    }
    setAssigning(false);
  };

  const handleUnassignPlan = async () => {
    setUnassigning(true);
    try {
      await apiRequest(`/plans/batches/${id}/unassign-plan`, { method: 'DELETE' });
      setActivePlan(null);
      setUnassignConfirm(false);
    } catch (err) {
      alert(err.message || 'Failed to unassign plan');
    }
    setUnassigning(false);
  };

  const paceColors = { ahead: '#16a34a', 'on-track': '#2563eb', behind: '#dc2626', 'just-started': 'var(--text-tertiary)' };

  if (loading) return <Loader text="LOADING BATCH..." />;
  if (error) return <div style={{ padding: 'var(--space-lg)' }}><p style={{ color: '#dc2626', fontWeight: 700 }}>{error}</p></div>;
  if (!batch) return <div style={{ padding: 'var(--space-lg)' }}><p>Batch not found</p></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1000, margin: '0 auto' }}>
      <Helmet><title>{batch.name} — Admin — TheJobStarter</title></Helmet>

      {/* Back link */}
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-md)', fontSize: '0.85rem', fontWeight: 600 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Batch header */}
      <div className="listing-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 className="listing-header__title">{batch.name}</h1>
          <span className="listing-header__count">
            Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{batch.code}</strong>
            {' · '}{students.length} student{students.length !== 1 ? 's' : ''}
            {' · '}
            <span style={{
              padding: '2px 8px', border: '2px solid #000',
              background: batch.status === 'active' ? 'var(--success-bg)' : 'var(--gray-100)',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase'
            }}>
              {batch.status}
            </span>
          </span>
        </div>
      </div>

      {/* Active Plan Section */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Plan</h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {activePlan ? (
              <>
                <button className="btn btn--sm" onClick={openPlanPicker}>Change Plan</button>
                <button className="btn btn--sm btn--danger" onClick={() => setUnassignConfirm(true)}>Unassign</button>
              </>
            ) : (
              <button className="btn btn--sm" onClick={openPlanPicker}>Assign Plan</button>
            )}
          </div>
        </div>

        {activePlan ? (() => {
          const total = Number(activePlan.totalDays) || 1;
          const current = Math.max(0, Number(activePlan.currentDay) || 0);
          const pct = current > 0 && total > 0 ? Math.round((current / total) * 100) : 0;
          return (
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activePlan.plan?.name || activePlan.planName}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Started {new Date(activePlan.startDate).toLocaleDateString()} · Day {current} of {total}
              </p>
              {current < 1 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Plan starts on {new Date(activePlan.startDate).toLocaleDateString()}. Progress will appear once the plan is underway.
                </p>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 14, background: 'var(--bg-tertiary)', border: '2px solid #000', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--success)', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{pct}%</span>
                </div>
              )}
            </div>
          );
        })() : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> No plan assigned. Assign a study plan to track daily progress.
          </p>
        )}
      </div>

      {/* Enrolled Students */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
          <Users size={18} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Enrolled Students ({students.length})</h2>
        </div>

        {students.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No students enrolled in this batch.</p>
        ) : (
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>College</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Plan Pace</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Completed / Expected</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const pp = s.progress?.planProgress;
                  return (
                    <tr key={s._id} style={{ borderBottom: '2px solid var(--gray-300)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                        <Link to={`/admin/users/${s._id}`} style={{ color: 'inherit' }}>
                          {s.displayName || s.username}
                        </Link>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-tertiary)' }}>{s.email || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{s.college || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        {pp ? (
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                            padding: '2px 6px', border: '2px solid #000',
                            color: paceColors[pp.paceStatus] || 'var(--text-tertiary)'
                          }}>
                            {pp.paceStatus === 'just-started' ? 'Started' : pp.paceStatus}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                        {pp && pp.paceStatus !== 'just-started' ? (
                          <span>{pp.completedCount}/{pp.expectedCount}</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Picker Modal */}
      {showPlanPicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)'
        }} onClick={() => setShowPlanPicker(false)}>
          <div style={{
            background: 'var(--bg-surface)', border: '4px solid #000',
            boxShadow: '8px 8px 0 #000', padding: 'var(--space-lg)', maxWidth: 480, width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} /> Assign Plan
            </h3>

            {activePlan && (
              <div style={{ padding: '8px 10px', border: '2px solid #dc2626', background: '#fee2e2', marginBottom: 'var(--space-md)', fontSize: '0.8rem', fontWeight: 600 }}>
                This batch already has an active plan. Assigning will replace it.
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Select Plan</label>
            <select className="input" value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
              <option value="">— Choose a plan —</option>
              {availablePlans.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.durationDays} days)</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>Start Date</label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }} />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowPlanPicker(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleAssignPlan} disabled={assigning || !selectedPlanId || !startDate}>
                {assigning ? 'Assigning...' : 'Assign Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unassign confirmation modal */}
      {unassignConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)'
        }} onClick={() => setUnassignConfirm(false)}>
          <div style={{
            background: 'var(--bg-surface)', border: '4px solid #000',
            boxShadow: '8px 8px 0 #000', padding: 'var(--space-lg)', maxWidth: 420, width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800 }}>Unassign Plan</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
              Are you sure? This will remove the current plan from this batch. Students won't lose their progress data.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setUnassignConfirm(false)}>Cancel</button>
              <button className="btn btn--danger" onClick={handleUnassignPlan} disabled={unassigning}>
                {unassigning ? 'Unassigning...' : 'Yes, unassign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
