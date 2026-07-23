import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import { useUser } from '@clerk/clerk-react';
import { useCoachingCenterStore } from '../stores/useCoachingCenterStore.js';
import Loader from '../components/ui/Loader.jsx';
import {
  FileText, Plus, Search, X, Clock, Users, Mail,
  Eye, Edit3, Trash2, CheckCircle, BookOpen, Calendar, Layers, ExternalLink
} from 'lucide-react';

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: 'var(--shadow)'
};

export default function AdminPlanList() {
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const role = clerkUser?.publicMetadata?.role;
  const isAdmin = role === 'admin';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [centerFilter, setCenterFilter] = useState('');

  const { centers, fetchCenters } = useCoachingCenterStore();

  /* State for plan batch assignments (planId → batches[]) */
  const [planAssignments, setPlanAssignments] = useState({});
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  /* Fetch batch assignments for all visible plans */
  useEffect(() => {
    const fetchAssignments = async () => {
      if (plans.length === 0) return;
      setAssignmentsLoading(true);
      const results = {};
      try {
        /* Fetch assignments for each plan in parallel (limited to avoid overwhelming) */
        const batchSize = 10;
        for (let i = 0; i < plans.length; i += batchSize) {
          const batch = plans.slice(i, i + batchSize);
          const promises = batch.map(p =>
            apiRequest(`/plans/${p._id}/assignments`).catch(() => ({ data: [] }))
          );
          const responses = await Promise.all(promises);
          responses.forEach((res, idx) => {
            if (res.data && res.data.length > 0) {
              results[batch[idx]._id] = res.data;
            }
          });
        }
      } catch (err) {
        console.error('[PLANS] Error fetching assignments:', err.message);
      }
      setPlanAssignments(results);
      setAssignmentsLoading(false);
    };
    fetchAssignments();
  }, [plans]);

  /* Assign-to-batch modal state */
  const [assignModal, setAssignModal] = useState(null); /* { plan } or null */
  const [assignBatchId, setAssignBatchId] = useState('');
  const [assignStartDate, setAssignStartDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [existingPlanForBatch, setExistingPlanForBatch] = useState(null);
  const [batchesLoading, setBatchesLoading] = useState(false);

  /* Fetch batches for the assign modal */
  const fetchBatchesForAssign = async () => {
    setBatchesLoading(true);
    try {
      const res = await apiRequest('/batches');
      setAvailableBatches(res.data || []);
    } catch (err) {
      console.error('[PLANS] Error fetching batches:', err.message);
    }
    setBatchesLoading(false);
  };

  /* When batch changes in the assign modal, check if it already has a plan */
  useEffect(() => {
    if (!assignBatchId) {
      setExistingPlanForBatch(null);
      return;
    }
    (async () => {
      try {
        const res = await apiRequest(`/plans/batches/${assignBatchId}/active-plan`);
        setExistingPlanForBatch(res.data || null);
      } catch {
        setExistingPlanForBatch(null);
      }
    })();
  }, [assignBatchId]);

  /* Handle assign plan to batch */
  const handleAssignPlan = async () => {
    if (!assignModal || !assignBatchId || !assignStartDate) return;
    setAssigning(true);
    try {
      await apiRequest(`/plans/batches/${assignBatchId}/assign-plan`, {
        method: 'POST',
        body: JSON.stringify({ planId: assignModal.plan._id, startDate: assignStartDate })
      });
      setAssignModal(null);
      setAssignBatchId('');
      setAssignStartDate('');
      setExistingPlanForBatch(null);
      alert('Plan assigned to batch successfully!');
    } catch (err) {
      alert(err.message || 'Failed to assign plan');
    }
    setAssigning(false);
  };

  /*
   * Temporarily override .admin-main overflow to 'visible'.
   * .admin-main has overflow-x: auto which creates a scroll container,
   * breaking position: sticky. Fixing it here (and restoring on unmount)
   * allows CSS sticky to work within this page.
   */
  useEffect(() => {
    const el = document.querySelector('.admin-main');
    if (!el) return;
    const prevX = el.style.overflowX;
    const prevY = el.style.overflowY;
    el.style.overflow = 'visible';
    return () => {
      el.style.overflowX = prevX;
      el.style.overflowY = prevY;
    };
  }, []);

  /* Determine API base based on role */
  const planApiBase = isAdmin ? '/plans' : '/coordinator/plans';

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (subjectFilter) params.set('subject', subjectFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (isAdmin && centerFilter) params.set('center', centerFilter);

      const res = await apiRequest(`${planApiBase}?${params.toString()}`);
      setPlans(res.data || []);
    } catch (err) {
      console.error('[PLANS] Error fetching plans:', err.message);
      setError(err.message);
    }
    setLoading(false);
  }, [searchQuery, statusFilter, subjectFilter, dateFrom, dateTo, centerFilter, planApiBase, isAdmin]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleDelete = async (plan) => {
    if (!confirm(`Delete "${plan.name}"? This will retire any active assignments.`)) return;
    try {
      await apiRequest(`${planApiBase}/${plan._id}`, { method: 'DELETE' });
      setPlans(prev => prev.filter(p => p._id !== plan._id));
    } catch (err) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const handleStatusToggle = async (plan) => {
    const newStatus = plan.status === 'published' ? 'draft' : 'published';
    try {
      const res = await apiRequest(`${planApiBase}/${plan._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setPlans(prev => prev.map(p => p._id === plan._id ? res.data : p));
    } catch (err) {
      alert(err.message || 'Failed to update plan status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
      published: { background: 'var(--success-bg)', color: 'var(--success-text)' },
      archived: { background: 'var(--error-bg)', color: 'var(--error-text)' }
    };
    const s = styles[status] || styles.draft;
    return (
      <span style={{
        fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.08em', padding: '2px 8px',
        border: '2px solid var(--border-color)', ...s
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <Loader text="LOADING PLANS..." />;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet><title>Plans — {isAdmin ? 'Admin' : 'Coordinator'} — TheWebytes</title></Helmet>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900,
            display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)'
          }}>
            <FileText size={28} /> Plans
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {plans.length} plan{plans.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Link to={isAdmin ? '/admin/plans/new' : '/coordinator/plans/new'}
          className="btn"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
            padding: '8px 18px'
          }}>
          <Plus size={16} /> Create Plan
        </Link>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div style={{
        ...CARD, marginBottom: 'var(--space-lg)',
        padding: 'var(--space-sm) var(--space-md)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'
      }}>
        <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input className="input" placeholder="Search plans..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            flex: 1, minWidth: 180, border: 'none', outline: 'none',
            fontSize: '0.85rem', background: 'transparent', padding: 0
          }} />
        {searchQuery && (
          <button className="btn btn--sm btn--ghost" onClick={() => setSearchQuery('')}
            style={{ padding: '2px 6px', fontSize: '0.65rem', flexShrink: 0 }}>
            <X size={12} /> Clear
          </button>
        )}

        {/* Status filter */}
        <select className="input" value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 120, fontSize: '0.78rem', padding: '4px 6px' }}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        {/* Subject filter */}
        <select className="input" value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          style={{ width: 130, fontSize: '0.78rem', padding: '4px 6px' }}>
          <option value="">All subjects</option>
          <option value="dsa">DSA</option>
          <option value="dbms">DBMS</option>
          <option value="os">OS</option>
          <option value="programming">Programming</option>
        </select>

        {/* Date range filter */}
        <input type="date" className="input" value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          title="From date"
          style={{ width: 140, fontSize: '0.78rem', padding: '4px 6px' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>to</span>
        <input type="date" className="input" value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          title="To date"
          style={{ width: 140, fontSize: '0.78rem', padding: '4px 6px' }} />

        {/* Center filter (admin only) */}
        {isAdmin && (
          <select className="input" value={centerFilter}
            onChange={e => setCenterFilter(e.target.value)}
            style={{ width: 180, fontSize: '0.78rem', padding: '4px 6px' }}>
            <option value="">All centers</option>
            {centers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Clear all filters */}
        {(statusFilter || subjectFilter || dateFrom || dateTo || centerFilter) && (
          <button className="btn btn--sm btn--ghost" onClick={() => {
            setStatusFilter(''); setSubjectFilter(''); setDateFrom(''); setDateTo(''); setCenterFilter('');
          }} style={{ padding: '2px 6px', fontSize: '0.65rem', flexShrink: 0 }}>
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid #dc2626' }}>
          <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* ── Plan Cards ── */}
      {plans.length === 0 && !loading ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
          <FileText size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>No plans yet</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
            Create a reusable study template to assign to your batches.
          </p>
          <Link to={isAdmin ? '/admin/plans/new' : '/coordinator/plans/new'}
            className="btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
            <Plus size={16} /> Create Your First Plan
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {plans.map(plan => (
            <div key={plan._id} style={{
              border: '3px solid var(--border-color)',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow)',
              padding: 'var(--space-md)',
              transition: 'transform 0.12s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 var(--border-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4
                  }}>
                    <h3 style={{
                      fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {plan.name}
                    </h3>
                    {getStatusBadge(plan.status)}
                  </div>

                  {plan.description && (
                    <p style={{
                      fontSize: '0.78rem', color: 'var(--text-secondary)',
                      marginBottom: 6, lineHeight: 1.4
                    }}>
                      {plan.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex', gap: 16, flexWrap: 'wrap',
                    fontSize: '0.75rem', color: 'var(--text-tertiary)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {plan.durationDays} day{plan.durationDays !== 1 ? 's' : ''}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookOpen size={13} />
                      {plan.items?.length || 0} item{(plan.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    {plan.coachingCenter?.name && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} />
                        {plan.coachingCenter.name}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem' }}>
                      Created by {plan.createdBy?.displayName || plan.createdBy?.username || 'Unknown'}
                    </span>
                    {plan.createdBy?.email && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        <Mail size={11} /> {plan.createdBy.email}
                      </span>
                    )}
                    {/* Batch assignments */}
                    {planAssignments[plan._id] && planAssignments[plan._id].length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {planAssignments[plan._id].map(a => (
                          <Link key={a.batchPlanId} to={`/${isAdmin ? 'admin' : 'coordinator'}/batches/${a.batch?._id}`}
                            style={{
                              fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                              padding: '2px 6px', border: '2px solid var(--border-color)',
                              background: 'var(--accent-light)', textDecoration: 'none', color: 'inherit',
                              display: 'inline-flex', alignItems: 'center', gap: 3
                            }}>
                            <Layers size={10} /> {a.batch?.name || 'Unknown'} {a.startDate ? `· ${new Date(a.startDate).toLocaleDateString()}` : ''}
                          </Link>
                        ))}
                      </div>
                    )}
                    {assignmentsLoading && <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Loading assignments...</span>}
                  </div>
                </div>

                {/* ── Actions ── */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {plan.status === 'published' && (
                    <button className="btn btn--sm"
                      onClick={() => { setAssignModal({ plan }); fetchBatchesForAssign(); setAssignStartDate(new Date().toISOString().split('T')[0]); }}
                      title="Assign to batch"
                      style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                      <Users size={12} /> Assign
                    </button>
                  )}
                  <button className="btn btn--sm"
                    onClick={() => handleStatusToggle(plan)}
                    title={plan.status === 'published' ? 'Set to draft' : 'Publish'}
                    style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                    <CheckCircle size={12} />
                    {plan.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link to={`${isAdmin ? '/admin' : '/coordinator'}/plans/${plan._id}/edit`}
                    className="btn btn--sm"
                    style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                    <Edit3 size={12} /> Edit
                  </Link>
                  <button className="btn btn--sm btn--danger"
                    onClick={() => handleDelete(plan)}
                    style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ── Assign to Batch Modal ── */}
      {assignModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-md)'
        }} onClick={() => setAssignModal(null)}>
          <div style={{
            background: 'var(--bg-surface)', border: '4px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)', padding: 'var(--space-lg)',
            maxWidth: 480, width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} /> Assign: {assignModal.plan.name}
            </h3>

            {/* Batch selector */}
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
              Select Batch
            </label>
            {batchesLoading ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Loading batches...</p>
            ) : (
              <select className="input" value={assignBatchId}
                onChange={e => setAssignBatchId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                <option value="">— Choose a batch —</option>
                {availableBatches.filter(b => b.status === 'active').map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code}){b.coachingCenter?.name ? ` — ${b.coachingCenter.name}` : ''}</option>
                ))}
              </select>
            )}

            {/* Existing plan warning */}
            {existingPlanForBatch && (
              <div style={{
                padding: '10px 12px', border: '2px solid #dc2626',
                background: '#fee2e2', marginBottom: 'var(--space-md)',
                fontSize: '0.8rem', fontWeight: 600
              }}>
                <strong>Warning:</strong> This batch already has an active plan (<strong>{existingPlanForBatch.plan?.name || 'Unknown'}</strong>).
                Assigning will replace it.
              </div>
            )}

            {/* Start date picker */}
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
              Start Date
            </label>
            <input type="date" className="input" value={assignStartDate}
              onChange={e => setAssignStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleAssignPlan}
                disabled={assigning || !assignBatchId || !assignStartDate}>
                {assigning ? 'Assigning...' : 'Assign Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
