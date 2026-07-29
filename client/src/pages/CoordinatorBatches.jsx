import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import {
  Layers, Plus, Users, Trash2, BookOpen, Search, Calendar, X,
  ChevronRight, GraduationCap, Clock, CheckCircle, AlertCircle,
  Hash, Edit3, UserPlus, ArrowRight, Sparkles
} from 'lucide-react';

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: '6px 6px 0 var(--shadow-color)',
};

const STATUS_CONFIG = {
  active: { border: '4px solid var(--success)', label: 'Active', bg: 'var(--success-bg)', text: 'var(--success-text)' },
  trial: { border: '4px solid var(--warning)', label: 'Trial', bg: 'var(--warning-bg)', text: 'var(--warning-text)' },
  suspended: { border: '4px solid var(--error)', label: 'Suspended', bg: 'var(--error-bg)', text: 'var(--error-text)' },
};

export default function CoordinatorBatches() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [form, setForm] = useState({ name: '', expectedStudents: '', courseOffering: '' });
  const [saving, setSaving] = useState(false);
  const [editingCourseBatchId, setEditingCourseBatchId] = useState(null);
  const [editingCourseValue, setEditingCourseValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchBatches = useCallback(async () => {
    console.log('[COORD BATCHES] Fetching batches...');
    setLoading(true);
    setError(null);
    try {
      const [batchesRes, rosterRes, courseRes] = await Promise.all([
        apiRequest('/coordinator/batches'),
        apiRequest('/coordinator/students'),
        apiRequest('/coordinator/course-offerings')
      ]);
      setBatches(batchesRes.data || []);
      setAllStudents(rosterRes.data?.students || []);
      setCourseOfferings(courseRes.data || []);
    } catch (err) {
      console.error('[COORD BATCHES] Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const getBatchStudentCount = (batchId) => {
    return allStudents.filter(s => {
      const bid = s.batch?._id || s.batch;
      return bid === batchId;
    }).length;
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await apiRequest('/coordinator/batches', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          courseOffering: form.courseOffering || null,
          expectedStudents: form.expectedStudents ? Number(form.expectedStudents) : null
        })
      });
      console.log('[COORD BATCHES] Batch created:', res.data?._id);
      setBatches(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', expectedStudents: '', courseOffering: '' });
    } catch (err) {
      console.error('[COORD BATCHES] Create error:', err.message);
      alert(err.message || 'Failed to create batch');
    }
    setSaving(false);
  };

  const handleDelete = async (batchId) => {
    if (!confirm('Delete this batch permanently? Students currently linked will be unassigned.')) return;
    try {
      await apiRequest(`/coordinator/batches/${batchId}`, { method: 'DELETE' });
      console.log('[COORD BATCHES] Batch deleted:', batchId);
      setBatches(prev => prev.filter(b => b._id !== batchId));
    } catch (err) {
      console.error('[COORD BATCHES] Delete error:', err.message);
      alert(err.message || 'Failed to delete batch');
    }
  };

  const handleOpenAssign = (batchId) => {
    navigate(`/coordinator/batches/${batchId}`);
  };

  const handleSaveCourseEdit = async (batchId) => {
    if (!batchId) return;
    try {
      await apiRequest(`/coordinator/batches/${batchId}`, {
        method: 'PATCH',
        body: JSON.stringify({ courseOffering: editingCourseValue || null })
      });
      setBatches(prev => prev.map(b => b._id === batchId ? { ...b, courseOffering: editingCourseValue || null } : b));
      setEditingCourseBatchId(null);
      setEditingCourseValue('');
      console.log('[COORD BATCHES] Batch course updated:', batchId);
    } catch (err) {
      console.error('[COORD BATCHES] Course edit error:', err.message);
      alert(err.message || 'Failed to update course');
    }
  };

  if (loading) return <Loader text="LOADING BATCHES..." />;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const filteredBatches = batches.filter(b => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!b.name.toLowerCase().includes(q) && !b.code.toLowerCase().includes(q)) return false;
    }
    if (filterCourse) {
      const coId = b.courseOffering?._id || b.courseOffering;
      if (coId !== filterCourse) return false;
    }
    if (filterDate) {
      if (!b.createdAt) return false;
      const created = new Date(b.createdAt);
      if (isNaN(created.getTime())) return false;
      switch (filterDate) {
        case 'year': if (created < startOfYear) return false; break;
        case '6months': if (created < sixMonthsAgo) return false; break;
        case '1month': if (created < oneMonthAgo) return false; break;
        case 'today': if (created < startOfToday) return false; break;
      }
    }
    return true;
  });

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      {/* Subtle grid background */}
      <div
        style={{
          position: 'fixed', inset: 0, opacity: 0.03, pointerEvents: 'none', zIndex: 0,
          backgroundImage:
            'linear-gradient(var(--border-color) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--border-color) 1.5px, transparent 1.5px)',
          backgroundSize: '44px 44px',
        }}
      />

      <Helmet><title>Batches — Coordinator — TheWebytes</title></Helmet>

      {/* ═══ HEADER ═══ */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, border: '4px solid var(--border-color)',
              background: 'var(--accent)', color: 'var(--text-inverse)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '5px 5px 0 var(--shadow-color)',
              transform: 'rotate(-3deg)'
            }}>
              <Layers size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, lineHeight: 1.1 }}>
                Batches
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                <GraduationCap size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Create and manage student cohorts
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 800, padding: '6px 14px',
            border: '3px solid var(--border-color)',
            background: 'var(--bg-surface)', boxShadow: '3px 3px 0 var(--shadow-color)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Users size={14} />
            <span>{batches.reduce((sum, b) => sum + getBatchStudentCount(b._id), 0)} total students</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: '4px solid var(--border-color)', padding: '8px 18px',
              background: 'var(--accent)', color: 'var(--text-inverse)',
              fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase',
              letterSpacing: '0.04em', cursor: 'pointer',
              boxShadow: '5px 5px 0 var(--shadow-color)',
              transition: 'all 0.1s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '7px 7px 0 var(--shadow-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--shadow-color)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--shadow-color)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '7px 7px 0 var(--shadow-color)'; }}
          >
            <Plus size={16} strokeWidth={3} /> New Batch
          </button>
        </div>
      </div>

      {/* ═══ FILTERS BAR ═══ */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', gap: 10, marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap', alignItems: 'center',
        padding: 'var(--space-md)',
        border: '3px solid var(--border-color)',
        background: 'var(--bg-surface)',
        boxShadow: '5px 5px 0 var(--shadow-color)',
      }}>
        {/* Search */}
        <div style={{
          flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 6,
          border: '3px solid var(--border-color)', padding: '7px 10px',
          background: 'var(--bg-primary)'
        }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            placeholder="Search by name or code..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '0.82rem',
              background: 'transparent', color: 'var(--text-primary)', padding: 0,
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-tertiary)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Course filter */}
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          style={{
            width: 170, fontSize: '0.78rem', padding: '7px 8px',
            border: '3px solid var(--border-color)', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit'
          }}>
          <option value="">All courses</option>
          {courseOfferings.filter(c => c.status === 'active').map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Date filter */}
        <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
          style={{
            width: 155, fontSize: '0.78rem', padding: '7px 8px',
            border: '3px solid var(--border-color)', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit'
          }}>
          <option value="">All time</option>
          <option value="year">This year</option>
          <option value="6months">Within 6 months</option>
          <option value="1month">Within 1 month</option>
          <option value="today">Today</option>
        </select>

        {(searchQuery || filterCourse || filterDate) && (
          <button onClick={() => { setSearchQuery(''); setFilterCourse(''); setFilterDate(''); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px',
              border: '3px solid var(--border-color)', cursor: 'pointer',
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}>
            <X size={14} /> Clear
          </button>
        )}

        <span style={{
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)',
          marginLeft: 'auto', whiteSpace: 'nowrap'
        }}>
          {filteredBatches.length} / {batches.length} batches
        </span>
      </div>

      {/* ═══ ERROR STATE ═══ */}
      {error && (
        <div style={{ ...CARD, background: 'var(--error-bg)', marginBottom: 'var(--space-lg)', borderLeft: '6px solid var(--error)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--error-text)' }}>Failed to load batches</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--error-text)', marginTop: 2 }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!error && batches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...CARD, textAlign: 'center', padding: 'var(--space-2xl)', position: 'relative', zIndex: 1 }}
        >
          <div style={{
            width: 72, height: 72, margin: '0 auto 1.5rem',
            border: '4px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '6px 6px 0 var(--shadow-color)', transform: 'rotate(-3deg)'
          }}>
            <Layers size={36} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8 }}>No batches yet</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Create your first batch to group students into cohorts. Each batch gets a unique code for students to join.
          </p>
          <button onClick={() => setShowCreate(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '4px solid var(--border-color)', padding: '10px 22px',
              background: 'var(--accent)', color: 'var(--text-inverse)',
              fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase',
              letterSpacing: '0.04em', cursor: 'pointer',
              boxShadow: '6px 6px 0 var(--shadow-color)',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '8px 8px 0 var(--shadow-color)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--shadow-color)'; }}
          >
            <Sparkles size={18} /> Create Your First Batch
          </button>
        </motion.div>
      )}

      {/* ═══ NO RESULTS STATE ═══ */}
      {!error && batches.length > 0 && filteredBatches.length === 0 && (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-2xl)', position: 'relative', zIndex: 1 }}>
          <Search size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 6 }}>No batches match your filters</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>Try a different search term or clear the filters.</p>
          <button onClick={() => { setSearchQuery(''); setFilterCourse(''); setFilterDate(''); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px',
              border: '3px solid var(--border-color)', cursor: 'pointer',
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}>
            <X size={14} /> Clear filters
          </button>
        </div>
      )}

      {/* ═══ BATCH CARDS GRID ═══ */}
      {filteredBatches.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-lg)', position: 'relative', zIndex: 1 }}>
          {filteredBatches.map((b, index) => {
            const studentCount = getBatchStudentCount(b._id);
            const statusConf = STATUS_CONFIG[b.status] || STATUS_CONFIG.trial;
            const coId = b.courseOffering?._id || b.courseOffering;
            const course = coId && courseOfferings.find(c => c._id === coId);

            return (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <div style={{
                  ...CARD, padding: 0, overflow: 'hidden',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                  onClick={() => navigate(`/coordinator/batches/${b._id}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '8px 8px 0 var(--shadow-color)';
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '6px 6px 0 var(--shadow-color)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{
                    height: 6, width: '100%',
                    background: b.status === 'active' ? 'var(--success)' : b.status === 'trial' ? 'var(--warning)' : 'var(--error)'
                  }} />

                  <div style={{ padding: 'var(--space-lg)' }}>
                    {/* Row 1: Batch name + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{
                        fontSize: '1.1rem', fontWeight: 900,
                        color: 'var(--text-primary)', lineHeight: 1.2
                      }}>
                        {b.name}
                      </h3>
                      <span style={{
                        fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.08em', padding: '3px 8px',
                        border: `2px solid var(--border-color)`,
                        background: statusConf.bg,
                        color: statusConf.text,
                        whiteSpace: 'nowrap'
                      }}>
                        {statusConf.label}
                      </span>
                    </div>

                    {/* Row 2: Batch metadata */}
                    <div style={{
                      display: 'flex', gap: 14, fontSize: '0.78rem',
                      flexWrap: 'wrap', alignItems: 'center',
                      color: 'var(--text-secondary)', marginBottom: 14
                    }}>
                      {/* Code */}
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: 'monospace', fontWeight: 700,
                        fontSize: '0.75rem', letterSpacing: '0.08em',
                        color: 'var(--text-primary)',
                        padding: '2px 8px', border: '2px solid var(--border-color)',
                        background: 'var(--bg-primary)'
                      }}>
                        <Hash size={12} />
                        {b.code}
                      </span>

                      {/* Course */}
                      {course && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', border: '2px solid var(--border-color)',
                          background: 'var(--accent-light)',
                          fontWeight: 700, fontSize: '0.7rem',
                          color: 'var(--text-primary)'
                        }}>
                          <BookOpen size={12} />
                          {course.name}
                        </span>
                      )}

                      {/* Created date */}
                      {b.createdAt && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)' }}>
                          <Calendar size={12} />
                          Created {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Row 3: Student count */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px',
                      border: '2px solid var(--border-color)',
                      background: 'var(--bg-primary)'
                    }}>
                      <Users size={16} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {studentCount}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                        student{studentCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px var(--space-lg)',
                    borderTop: '3px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    gap: 8, flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleOpenAssign(b._id); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px',
                          border: '2px solid var(--border-color)', cursor: 'pointer',
                          background: 'var(--bg-surface)', color: 'var(--text-primary)',
                          fontFamily: 'inherit', transition: 'all 0.1s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-inverse)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      >
                        <UserPlus size={12} /> Manage
                      </button>

                      {editingCourseBatchId === b._id ? (
                        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}
                          onClick={e => e.stopPropagation()}>
                          <select
                            style={{
                              fontSize: '0.65rem', padding: '3px 4px', width: 130,
                              border: '2px solid var(--border-color)',
                              background: 'var(--bg-primary)', color: 'var(--text-primary)',
                              fontFamily: 'inherit', fontWeight: 600
                            }}
                            value={editingCourseValue}
                            onChange={e => setEditingCourseValue(e.target.value)}
                            autoFocus
                          >
                            <option value="">— No course —</option>
                            {courseOfferings.filter(c => c.status === 'active').map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); handleSaveCourseEdit(b._id); }}
                            style={{
                              fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px',
                              border: '2px solid var(--border-color)', cursor: 'pointer',
                              background: 'var(--success)', color: '#fff',
                              fontFamily: 'inherit'
                            }}>Save</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingCourseBatchId(null); }}
                            style={{
                              fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px',
                              border: '2px solid var(--border-color)', cursor: 'pointer',
                              background: 'var(--bg-surface)', color: 'var(--text-primary)',
                              fontFamily: 'inherit'
                            }}>X</button>
                        </span>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setEditingCourseBatchId(b._id); setEditingCourseValue(b.courseOffering?._id || b.courseOffering || ''); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px',
                            border: '2px solid var(--border-color)', cursor: 'pointer',
                            background: 'var(--bg-surface)', color: 'var(--text-primary)',
                            fontFamily: 'inherit', transition: 'all 0.1s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                        >
                          <BookOpen size={12} /> Course
                        </button>
                      )}

                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(b._id); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px',
                          border: '2px solid var(--error)', cursor: 'pointer',
                          background: 'var(--error-bg)', color: 'var(--error-text)',
                          fontFamily: 'inherit', transition: 'all 0.1s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--error)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--error-bg)'; e.currentTarget.style.color = 'var(--error-text)'; }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>

                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.65rem', fontWeight: 700,
                      color: 'var(--text-tertiary)'
                    }}>
                      View Details <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ CREATE MODAL ═══ */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
        <div style={{
          borderBottom: '4px solid var(--border-color)',
          paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-lg)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} /> New Batch
          </h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Batch Name <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              style={{
                width: '100%', padding: '10px 12px',
                border: '3px solid var(--border-color)', fontSize: '0.9rem',
                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontWeight: 600, outline: 'none'
              }}
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Jan 2027 Weekend Batch"
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Course / Program
            </label>
            <select
              style={{
                width: '100%', padding: '10px 12px',
                border: '3px solid var(--border-color)', fontSize: '0.9rem',
                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer'
              }}
              value={form.courseOffering}
              onChange={e => setForm(prev => ({ ...prev, courseOffering: e.target.value }))}
            >
              <option value="">— No course —</option>
              {courseOfferings.filter(c => c.status === 'active').map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Expected Students <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span>
            </label>
            <input
              type="number"
              style={{
                width: '100%', padding: '10px 12px',
                border: '3px solid var(--border-color)', fontSize: '0.9rem',
                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontWeight: 600, outline: 'none'
              }}
              value={form.expectedStudents}
              onChange={e => setForm(prev => ({ ...prev, expectedStudents: e.target.value }))}
              placeholder="e.g. 30"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button"
              onClick={() => setShowCreate(false)}
              style={{
                padding: '10px 20px', fontSize: '0.78rem', fontWeight: 700,
                border: '3px solid var(--border-color)', cursor: 'pointer',
                background: 'var(--bg-surface)', color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{
                padding: '10px 20px', fontSize: '0.78rem', fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.04em',
                border: '3px solid var(--border-color)', cursor: 'pointer',
                background: 'var(--accent)', color: 'var(--text-inverse)',
                fontFamily: 'inherit',
                opacity: saving ? 0.6 : 1,
                boxShadow: '4px 4px 0 var(--shadow-color)'
              }}
            >
              {saving ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
