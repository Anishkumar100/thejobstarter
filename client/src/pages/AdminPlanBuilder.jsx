import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import { useUser } from '@clerk/clerk-react';
import Loader from '../components/ui/Loader.jsx';
import {
  Save, ArrowLeft, Plus, X, ChevronDown, ChevronRight,
  BookOpen, Layers, Code2, FileText, Lightbulb, CheckCircle
} from 'lucide-react';

const SUBJECTS = [
  { value: 'dsa', label: 'DSA', color: '#6366f1' },
  { value: 'dbms', label: 'DBMS', color: '#14b8a6' },
  { value: 'os', label: 'OS', color: '#f59e0b' },
  { value: 'programming', label: 'Programming', color: '#a855f7' }
];

const TYPE_ICONS = {
  lesson: <BookOpen size={14} />,
  subtopic: <Layers size={14} />,
  problem: <Code2 size={14} />
};

const CARD = {
  border: '4px solid var(--border-color)',
  padding: 'var(--space-lg)',
  background: 'var(--bg-surface)',
  boxShadow: 'var(--shadow)'
};

export default function AdminPlanBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const role = clerkUser?.publicMetadata?.role;
  const isAdmin = role === 'admin';
  const isEditing = Boolean(id);
  const planApiBase = isAdmin ? '/plans' : '/coordinator/plans';

  /* ── Plan form state ── */
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);

  /* ── Hierarchy state ── */
  const [selectedSubject, setSelectedSubject] = useState('dsa');
  const [hierarchy, setHierarchy] = useState([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedSubtopics, setExpandedSubtopics] = useState({});

  /* ── Day planner state ── */
  const [activeDay, setActiveDay] = useState(1);
  const [expandedDays, setExpandedDays] = useState({});
  const [dayInstructions, setDayInstructions] = useState({});

  /* ── Expanded titles (click to reveal full text) ── */
  const [expandedTitles, setExpandedTitles] = useState({});

  /* ── Responsive: mobile vs desktop layout ── */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  /*
   * Track viewport width to toggle between stacked (mobile)
   * and two-column (desktop) layouts.
   */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /*
   * Temporarily override .admin-main overflow to 'visible'.
   * .admin-main has overflow-x: auto which creates a scroll container,
   * breaking position: sticky. Fixing it here (and restoring on unmount)
   * allows CSS sticky to work within the AdminPlanBuilder.
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

  /* Fetch plan if editing */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchPlan = async () => {
      try {
        const res = await apiRequest(`${planApiBase}/${id}`);
        const plan = res.data;
        setPlanName(plan.name);
        setDescription(plan.description || '');
        setDurationDays(plan.durationDays);
        setStatus(plan.status);
        setItems(plan.items || []);
        /* Pre-expand days that have items */
        const expanded = {};
        const instrs = {};
        (plan.items || []).forEach(item => {
          expanded[item.dayOffset] = true;
          if (item.instruction) {
            instrs[`${item.dayOffset}-${item.targetSlug}`] = item.instruction;
          }
        });
        setExpandedDays(expanded);
        setDayInstructions(instrs);
      } catch (err) {
        console.error('[PLAN BUILDER] Error fetching plan:', err.message);
        setError(err.message);
      }
      setLoading(false);
    };
    fetchPlan();
  }, [id, planApiBase]);

  /* Fetch hierarchy when subject changes */
  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoadingHierarchy(true);
      try {
        const res = await apiRequest(`/plans/hierarchy?subject=${selectedSubject}`);
        setHierarchy(res.data || []);
      } catch (err) {
        console.error('[PLAN BUILDER] Hierarchy error:', err.message);
        setHierarchy([]);
      }
      setLoadingHierarchy(false);
    };
    fetchHierarchy();
  }, [selectedSubject]);

  /* Toggle lesson expansion */
  const toggleLesson = (slug) => {
    setExpandedLessons(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  /* Toggle subtopic expansion */
  const toggleSubtopic = (slug) => {
    setExpandedSubtopics(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  /* Toggle day expansion */
  const toggleDay = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
    if (expandedDays[day]) {
      setActiveDay(Math.max(day - 1, 1));
    } else {
      setActiveDay(day);
    }
  };

  /* Add item to a specific day */
  const addItemToDay = (item) => {
    setDirty(true);
    setItems(prev => {
      /* Prevent duplicates (same slug + same day) */
      const exists = prev.some(
        i => i.dayOffset === activeDay && i.targetSlug === item.slug && i.subject === selectedSubject
      );
      if (exists) return prev;

      return [...prev, {
        dayOffset: activeDay,
        subject: selectedSubject,
        targetType: item._type || item.type,
        targetSlug: item.slug,
        targetTitle: item.title,
        targetId: item._id,
        instruction: ''
      }];
    });
    /* Auto-expand the day */
    setExpandedDays(prev => ({ ...prev, [activeDay]: true }));
  };

  /* Remove item */
  const removeItem = (dayOffset, targetSlug) => {
    setDirty(true);
    setItems(prev => prev.filter(
      i => !(i.dayOffset === dayOffset && i.targetSlug === targetSlug)
    ));
  };

  /* Update instruction for an item */
  const updateInstruction = (dayOffset, targetSlug, instruction) => {
    setDirty(true);
    setItems(prev => prev.map(i =>
      i.dayOffset === dayOffset && i.targetSlug === targetSlug
        ? { ...i, instruction }
        : i
    ));
    setDayInstructions(prev => ({
      ...prev,
      [`${dayOffset}-${targetSlug}`]: instruction
    }));
  };

  /* Get items for a specific day, sorted */
  const getItemsForDay = (day) => {
    return items
      .filter(i => i.dayOffset === day)
      .sort((a, b) => {
        const order = { lesson: 0, subtopic: 1, problem: 2 };
        return (order[a.targetType] || 0) - (order[b.targetType] || 0);
      });
  };

  /* Save plan */
  const handleSave = async (newStatus) => {
    if (!planName.trim()) {
      alert('Plan name is required');
      return;
    }
    if (!durationDays || durationDays < 1) {
      alert('Duration must be at least 1 day');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: planName.trim(),
      description: description.trim(),
      durationDays: Number(durationDays),
      status: newStatus || status,
      items
    };

    try {
      let res;
      if (isEditing) {
        res = await apiRequest(`${planApiBase}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest(planApiBase, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setDirty(false);
      const basePath = isAdmin ? '/admin/plans' : '/coordinator/plans';
      navigate(basePath);
    } catch (err) {
      console.error('[PLAN BUILDER] Save error:', err.message);
      setError(err.message);
      alert(err.message || 'Failed to save plan');
    }
    setSaving(false);
  };

  /* Item type badge color */
  const typeBadge = (type) => {
    const colors = {
      lesson: { bg: '#e0e7ff', text: '#4338ca' },
      subtopic: { bg: '#ccfbf1', text: '#0f766e' },
      problem: { bg: '#fef3c7', text: '#b45309' }
    };
    const c = colors[type] || colors.lesson;
    return { background: c.bg, color: c.text };
  };

  /* Subject color */
  const subjectColor = (subj) => {
    const found = SUBJECTS.find(s => s.value === subj);
    return found?.color || '#000';
  };

  /* Get day item count */
  const dayItemCount = (day) => {
    return items.filter(i => i.dayOffset === day).length;
  };

  /* Toggle full title text reveal for long titles in hierarchy */
  const toggleTitle = (slug) => {
    setExpandedTitles(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  /*
   * Render a title that truncates at maxLen chars with ellipsis.
   * Clicking reveals the full text inline. Only truncates if title > maxLen.
   */
  const renderTitle = (title, slug, maxLen = 30) => {
    const isExpanded = expandedTitles[slug];
    const needsTruncation = title?.length > maxLen;
    const displayText = needsTruncation && !isExpanded ? title.slice(0, maxLen) + '...' : title;
    return (
      <span
        onClick={(e) => { e.stopPropagation(); toggleTitle(slug); }}
        title={title}
        style={{
          cursor: needsTruncation ? 'pointer' : 'default',
          borderBottom: needsTruncation ? '1px dashed var(--text-tertiary)' : 'none',
          flex: 1, overflow: 'hidden',
          whiteSpace: needsTruncation && !isExpanded ? 'nowrap' : 'normal',
          wordBreak: 'break-word'
        }}>
        {displayText}
      </span>
    );
  };

  if (loading) return <Loader text="LOADING PLAN..." />;

  const totalDays = Number(durationDays) || 30;
  const dayRange = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1400, margin: '0 auto' }}>
      <Helmet>
        <title>{isEditing ? 'Edit Plan' : 'Create Plan'} — {isAdmin ? 'Admin' : 'Coordinator'} — TheWebytes</title>
      </Helmet>

      {/* ── Back link ── */}
      <button
        onClick={() => navigate(isAdmin ? '/admin/plans' : '/coordinator/plans')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-md)',
          fontSize: '0.85rem', color: 'var(--text-secondary)',
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          padding: 0
        }}>
        <ArrowLeft size={14} /> Back to plans
      </button>

      {/* ── Header + Meta ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)'
      }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <input className="input" placeholder="Plan name (e.g. 30-Day DSA Sprint)"
            value={planName}
            onChange={e => { setPlanName(e.target.value); setDirty(true); }}
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900,
              width: '100%', padding: '8px 12px', border: '3px solid var(--border-color)',
              background: 'transparent', color: 'var(--text-primary)'
            }} />
          <textarea className="input" placeholder="Optional description..."
            value={description}
            onChange={e => { setDescription(e.target.value); setDirty(true); }}
            rows={2}
            style={{
              width: '100%', marginTop: 8, padding: '8px 12px',
              border: '3px solid var(--border-color)', fontSize: '0.85rem',
              background: 'transparent', color: 'var(--text-primary)', resize: 'vertical'
            }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Duration:
            </label>
            <input type="number" min={1} max={365}
              value={durationDays}
              onChange={e => { setDurationDays(e.target.value); setDirty(true); }}
              style={{
                width: 70, padding: '4px 8px', border: '3px solid var(--border-color)',
                fontSize: '0.85rem', fontWeight: 700, background: 'transparent',
                color: 'var(--text-primary)'
              }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>days</span>
            {dirty && (
              <span style={{
                fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                padding: '2px 6px', border: '2px solid #d97706',
                background: '#fef3c7', color: '#b45309', marginLeft: 8
              }}>
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* ── Save / Publish buttons ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <button className="btn" onClick={() => handleSave('draft')}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn"
            onClick={() => handleSave('published')}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.78rem', background: 'var(--success)',
              color: 'var(--text-inverse)'
            }}>
            <CheckCircle size={16} /> {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid #dc2626' }}>
          <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 'var(--space-lg)',
        alignItems: 'flex-start'
      }}>
        {/* ─── LEFT COLUMN: Content Browser (sticky on desktop, normal on mobile) ─── */}
        <div style={
          isMobile ? {
            width: '100%', minWidth: 0
          } : {
            width: '60%', minWidth: 320,
            position: 'sticky',
            top: 'calc(var(--space-lg) + 60px)',
            alignSelf: 'flex-start',
            marginBottom: 'var(--space-xl)',
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto'
          }
        }>
          <div style={CARD}>
          <h2 style={{
            fontSize: '0.9rem', fontWeight: 800, marginBottom: 'var(--space-md)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <FileText size={18} /> Content Browser
          </h2>

          {/* Subject tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-md)', overflowX: 'auto' }}>
            {SUBJECTS.map(sub => (
              <button key={sub.value}
                onClick={() => setSelectedSubject(sub.value)}
                style={{
                  flex: 1, padding: '8px 14px', border: '3px solid var(--border-color)',
                  background: selectedSubject === sub.value ? sub.color : 'transparent',
                  color: selectedSubject === sub.value ? '#fff' : 'var(--text-primary)',
                  fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontFamily: 'inherit', transition: 'all 0.12s',
                  whiteSpace: 'nowrap'
                }}>
                {sub.value === 'programming' ? 'PROG' : sub.label}
              </button>
            ))}
          </div>

          {/* Instruction */}
          <div style={{
            padding: 'var(--space-sm)', marginBottom: 'var(--space-md)',
            border: '2px solid var(--border-color)',
            background: 'var(--bg-tertiary)', fontSize: '0.72rem', lineHeight: 1.5
          }}>
            <Lightbulb size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Click the <strong>[+]</strong> button next to any item to add it to Day {activeDay}.
            Items are organised by lesson → subtopic → problem.
          </div>

          {/* Day picker for add target */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-md)',
            padding: 'var(--space-sm)', border: '2px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Adding to Day:
            </span>
            <select value={activeDay} onChange={e => setActiveDay(Number(e.target.value))}
              style={{
                flex: 1, padding: '4px 6px', border: '2px solid var(--border-color)',
                fontSize: '0.78rem', fontWeight: 700,
                background: 'var(--bg-surface)', color: 'var(--text-primary)'
              }}>
              {dayRange.map(d => (
                <option key={d} value={d} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  Day {d} {dayItemCount(d) > 0 ? `(${dayItemCount(d)} items)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Hierarchy tree */}
          <div>
          {loadingHierarchy ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-tertiary)' }}>
              Loading...
            </div>
          ) : hierarchy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
              No content found for this subject.
            </div>
          ) : (
            <div>
              {hierarchy.map(lesson => (
                <div key={lesson._id || lesson.slug} style={{ marginBottom: 4 }}>
                  {/* ── Lesson row ── */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 8px', cursor: 'pointer',
                    background: expandedLessons[lesson.slug] ? 'var(--bg-tertiary)' : 'transparent',
                    border: '2px solid var(--border-color)',
                    fontSize: '0.78rem', fontWeight: 700,
                    transition: 'background 0.12s'
                  }}
                    onClick={() => toggleLesson(lesson.slug)}
                    onMouseEnter={e => { if (!expandedLessons[lesson.slug]) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { if (!expandedLessons[lesson.slug]) e.currentTarget.style.background = 'transparent'; }}>
                    {expandedLessons[lesson.slug] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <BookOpen size={14} style={{ flexShrink: 0, color: subjectColor(selectedSubject) }} />
                    {renderTitle(lesson.title, `lesson-${lesson.slug}`, 35)}
                    <button className="btn btn--sm"
                      onClick={e => {
                        e.stopPropagation();
                        addItemToDay({ ...lesson, _type: 'lesson' });
                      }}
                      style={{
                        padding: '2px 6px', fontSize: '0.6rem', flexShrink: 0,
                        border: '2px solid var(--border-color)'
                      }}
                      title={`Add "${lesson.title}" to Day ${activeDay}`}>
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* ── Subtopics ── */}
                  {expandedLessons[lesson.slug] && lesson.subtopics?.map(sub => (
                    <div key={sub._id || sub.slug} style={{ marginLeft: 16, marginTop: 2 }}>
                      {/* Subtopic row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 8px', cursor: 'pointer',
                        background: expandedSubtopics[sub.slug] ? 'var(--bg-tertiary)' : 'transparent',
                        border: '2px solid var(--border-color)',
                        fontSize: '0.75rem', fontWeight: 600,
                        transition: 'background 0.12s'
                      }}
                        onClick={() => toggleSubtopic(sub.slug)}
                        onMouseEnter={e => { if (!expandedSubtopics[sub.slug]) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                        onMouseLeave={e => { if (!expandedSubtopics[sub.slug]) e.currentTarget.style.background = 'transparent'; }}>
                        {sub.problems?.length > 0 ? (
                          expandedSubtopics[sub.slug] ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                        ) : <span style={{ width: 12 }} />}
                        <Layers size={12} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
                        {renderTitle(sub.title, `sub-${sub.slug}`, 30)}
                        <button className="btn btn--sm"
                          onClick={e => {
                            e.stopPropagation();
                            addItemToDay({ ...sub, _type: 'subtopic' });
                          }}
                          style={{
                            padding: '2px 6px', fontSize: '0.6rem', flexShrink: 0,
                            border: '2px solid var(--border-color)'
                          }}
                          title={`Add "${sub.title}" to Day ${activeDay}`}>
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* ── Problems ── */}
                      {expandedSubtopics[sub.slug] && sub.problems?.map(prob => (
                        <div key={prob._id || prob.slug} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          marginLeft: 16, marginTop: 2,
                          padding: '4px 8px',
                          border: '2px solid var(--border-color)',
                          fontSize: '0.72rem',
                          transition: 'background 0.12s'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                          <span style={{ width: 12 }} />
                          <Code2 size={11} style={{ flexShrink: 0, color: '#b45309' }} />
                          {renderTitle(prob.title, `prob-${prob.slug}`, 25)}
                          {prob.difficulty && (
                            <span style={{
                              fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                              padding: '1px 4px', marginRight: 4,
                              background: prob.difficulty === 'easy' ? '#dcfce7' : prob.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                              border: '1px solid var(--border-color)'
                            }}>
                              {prob.difficulty}
                            </span>
                          )}
                          <button className="btn btn--sm"
                            onClick={() => addItemToDay({ ...prob, _type: 'problem' })}
                            style={{
                              padding: '1px 5px', fontSize: '0.55rem', flexShrink: 0,
                              border: '2px solid var(--border-color)'
                            }}
                            title={`Add "${prob.title}" to Day ${activeDay}`}>
                            <Plus size={10} />
                          </button>
                        </div>
                      ))}
                      {expandedSubtopics[sub.slug] && (!sub.problems || sub.problems.length === 0) && (
                        <div style={{
                          marginLeft: 16, marginTop: 2, padding: '4px 8px 4px 30px',
                          fontSize: '0.65rem', color: 'var(--text-tertiary)'
                        }}>
                          No problems yet
                        </div>
                      )}
                    </div>
                  ))}
                  {expandedLessons[lesson.slug] && (!lesson.subtopics || lesson.subtopics.length === 0) && (
                    <div style={{
                      marginLeft: 16, marginTop: 2, padding: '4px 8px',
                      fontSize: '0.65rem', color: 'var(--text-tertiary)'
                    }}>
                      No subtopics yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>

          {/* ── Bottom tip ── */}
          <div style={{
            marginTop: 'var(--space-sm)', padding: 'var(--space-sm)',
            border: '2px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            fontSize: '0.68rem', lineHeight: 1.5,
            color: 'var(--text-secondary)'
          }}>
            <Lightbulb size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Tip: Scroll through the days on the right to review what you've added.
            Use <strong>X</strong> to remove items.
          </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Day Planner ─── */}
        <div style={isMobile ? { width: '100%', minWidth: 0 } : { width: '40%', minWidth: 360 }}>
          {/* Day navigation pills */}
          <div style={{
            display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 'var(--space-md)',
            padding: 'var(--space-sm)', border: '3px solid var(--border-color)',
            background: 'var(--bg-surface)', boxShadow: 'var(--shadow)'
          }}>
            {dayRange.slice(0, Math.min(7, totalDays)).map(day => (
              <button key={day}
                onClick={() => toggleDay(day)}
                style={{
                  padding: '4px 10px', border: '2px solid var(--border-color)',
                  background: activeDay === day ? 'var(--bg-inverse)' : 'transparent',
                  color: activeDay === day ? 'var(--text-inverse)' : 'var(--text-primary)',
                  fontWeight: 800, fontSize: '0.65rem', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.12s'
                }}>
                D{day}
                {dayItemCount(day) > 0 && (
                  <span style={{ marginLeft: 3, fontSize: '0.55rem', opacity: 0.7 }}>
                    ({dayItemCount(day)})
                  </span>
                )}
              </button>
            ))}
            {totalDays > 7 && (
              <span style={{
                padding: '4px 6px', fontSize: '0.65rem', color: 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center'
              }}>
                +{totalDays - 7} more days
              </span>
            )}
          </div>

          {/* Day list */}
          {dayRange.map(day => {
            const dayItems = getItemsForDay(day);
            const isExpanded = expandedDays[day] !== false;
            return (
                <div key={day} style={{ marginBottom: 'var(--space-sm)' }}>
                {/* Day header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px',
                  border: '3px solid var(--border-color)',
                  background: isExpanded ? 'var(--bg-inverse)' : 'var(--bg-surface)',
                  color: isExpanded ? 'var(--text-inverse)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 800, fontSize: '0.85rem',
                  transition: 'all 0.12s',
                  boxShadow: 'var(--shadow)'
                }}
                  onClick={() => toggleDay(day)}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  Day {day}
                  <span style={{
                    marginLeft: 8, fontWeight: 400, fontSize: '0.72rem',
                    opacity: 0.7
                  }}>
                    {dayItems.length} item{dayItems.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Day items */}
                {isExpanded && (
                  <div style={{
                    border: '3px solid var(--border-color)',
                    borderTop: 'none',
                    background: 'var(--bg-surface)',
                    boxShadow: 'var(--shadow)',
                    padding: dayItems.length === 0 ? 'var(--space-md)' : 'var(--space-sm)'
                  }}>
                    {dayItems.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: 'var(--space-md)',
                        color: 'var(--text-tertiary)', fontSize: '0.82rem'
                      }}>
                        No items assigned to Day {day} yet.
                        Browse content in the left panel and click <strong>[+]</strong> to add items.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {dayItems.map((item, idx) => {
                          const badgeKey = `${item.dayOffset}-${item.targetSlug}`;
                          const instr = dayInstructions[badgeKey] || item.instruction || '';
                          return (
                            <div key={badgeKey}
                              style={{
                                padding: '8px 10px',
                                border: '2px solid var(--border-color)',
                                background: 'var(--bg-tertiary)',
                                transition: 'all 0.12s'
                              }}>
                              <div style={{
                                display: 'flex', alignItems: 'flex-start',
                                gap: 6, flexWrap: 'wrap'
                              }}>
                                <span style={{ flexShrink: 0, marginTop: 2 }}>
                                  {TYPE_ICONS[item.targetType] || <FileText size={14} />}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'
                                  }}>
                                    <span style={{
                                      fontWeight: 700, fontSize: '0.82rem',
                                      color: 'var(--text-primary)'
                                    }}>
                                      {item.targetTitle}
                                    </span>
                                    <span style={{
                                      fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                                      padding: '1px 5px', border: '2px solid var(--border-color)',
                                      ...typeBadge(item.targetType)
                                    }}>
                                      {item.targetType}
                                    </span>
                                    <span style={{
                                      fontSize: '0.55rem', fontWeight: 700,
                                      color: subjectColor(item.subject)
                                    }}>
                                      {item.subject === 'programming' ? 'PROG' : item.subject.toUpperCase()}
                                    </span>
                                  </div>
                                  {/* Instruction field */}
                                  <input className="input" placeholder="Instructions for students (optional)"
                                    value={instr}
                                    onChange={e => updateInstruction(item.dayOffset, item.targetSlug, e.target.value)}
                                    style={{
                                      width: '100%', marginTop: 4,
                                      padding: '3px 6px', fontSize: '0.7rem',
                                      border: '2px solid var(--border-color)',
                                      background: 'transparent', color: 'var(--text-primary)'
                                    }} />
                                </div>
                                <button className="btn btn--sm btn--danger"
                                  onClick={() => removeItem(item.dayOffset, item.targetSlug)}
                                  style={{
                                    padding: '2px 6px', fontSize: '0.6rem', flexShrink: 0
                                  }}
                                  title="Remove item">
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom save bar ── */}
      <div style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-md)',
        border: '4px solid var(--border-color)',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)'
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
          {items.length} total items across {totalDays} days
          {dirty && (
            <span style={{
              marginLeft: 8, fontWeight: 700,
              color: '#b45309'
            }}>
              · Unsaved changes
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => handleSave('draft')}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn"
            onClick={() => handleSave('published')}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.78rem', background: 'var(--success)',
              color: 'var(--text-inverse)'
            }}>
            <CheckCircle size={16} /> {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
