import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../api/client.js';
import Loader from '../components/ui/Loader.jsx';
import { Shield, Users, Layers, X, Save, Trash2, Mail, GraduationCap, CheckCircle2, AlertTriangle } from 'lucide-react';

const CARD = { border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-surface)', boxShadow: '4px 4px 0 #000' };

/*
 * CoordinatorFaculties — Manage the center's faculty (Mongo-only role).
 * Promote happens from the student roster; this page lists faculty members,
 * sets their batch scope (which batches they can see/manage), and revokes.
 */
export default function CoordinatorFaculties() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selection, setSelection] = useState([]);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchAll = () => {
    Promise.all([
      apiRequest('/coordinator/faculties'),
      apiRequest('/coordinator/batches')
    ])
      .then(([fRes, bRes]) => {
        console.log('[COORD] Faculties fetched:', fRes.data?.length);
        setFaculties(fRes.data || []);
        setBatches(bRes.data || []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchAll(); }, []);

  const startEdit = (f) => {
    setEditingId(f._id);
    setSelection((f.facultyBatches || []).map(b => typeof b === 'string' ? b : b._id));
    setNotice('');
  };

  const toggleBatch = (batchId) => {
    setSelection(sel => sel.includes(batchId) ? sel.filter(id => id !== batchId) : [...sel, batchId]);
  };

  const saveScope = async () => {
    setSaving(true);
    try {
      const res = await apiRequest(`/coordinator/faculties/${editingId}/batches`, {
        method: 'PUT',
        body: JSON.stringify({ batchIds: selection })
      });
      console.log('[COORD] Faculty batch scope saved:', res.data);
      setNotice(`Batch scope saved (${res.data.facultyBatches.length} batch${res.data.facultyBatches.length !== 1 ? 'es' : ''}).`);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      console.error('[COORD] Save scope failed:', err.message);
      setNotice(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (f) => {
    if (!window.confirm(`Revoke faculty status from ${f.displayName || f.username}? They become a regular student again. Nothing else is touched.`)) return;
    setRevokingId(f._id);
    try {
      await apiRequest(`/coordinator/students/${f._id}/revoke-faculty`, { method: 'POST' });
      console.log('[COORD] Faculty revoked:', f._id);
      setFaculties(list => list.filter(x => x._id !== f._id));
    } catch (err) {
      console.error('[COORD] Revoke failed:', err.message);
      window.alert(err.message);
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-xl)' }}><Loader text="Loading faculty..." /></div>;
  if (error) return <div style={{ padding: 'var(--space-xl)' }}><div style={{ ...CARD, background: '#fef2f2' }}><strong>Error:</strong> {error}</div></div>;

  return (
    <div style={{ padding: 'var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
      <Helmet><title>Manage Faculty — Coordinator — TheWebytes</title></Helmet>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={22} /> Manage Faculty
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {faculties.length} faculty member{faculties.length !== 1 ? 's' : ''} in your center · Promote teachers from the{' '}
          <Link to="/coordinator/students" style={{ fontWeight: 700 }}>student roster</Link>
        </p>
      </div>

      {notice && (
        <div style={{ ...CARD, marginBottom: 'var(--space-lg)', borderLeft: '6px solid #16a34a', background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#16a34a" /> {notice}
        </div>
      )}

      {faculties.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>No faculty members yet.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Open a student in the roster and hit <strong>Promote to Faculty</strong>.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {faculties.map(f => {
            const scope = f.facultyBatches || [];
            return (
              <div key={f._id}
                style={{ ...CARD, padding: 'var(--space-lg)', cursor: editingId === f._id ? 'default' : 'pointer', transition: 'transform 0.12s, box-shadow 0.12s' }}
                onClick={() => { if (editingId !== f._id) navigate(`/coordinator/faculties/${f._id}`); }}
                onMouseEnter={e => { if (editingId !== f._id) { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #000'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #000'; }}
              >
                {/* Whole card is clickable → teacher detail page (except while editing scope) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                  {/* Profile */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
                    {f.avatar ? (
                      <Link to={`/coordinator/faculties/${f._id}`} title="View teacher details" onClick={e => e.stopPropagation()}>
                        <img src={f.avatar} alt="" style={{ width: 52, height: 52, border: '3px solid #000', objectFit: 'cover', display: 'block', transition: 'transform 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }} />
                      </Link>
                    ) : (
                      <Link to={`/coordinator/faculties/${f._id}`} title="View teacher details" style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: 52, height: 52, border: '3px solid #000', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                          <Shield size={24} color="#fff" />
                        </div>
                      </Link>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        <Link to={`/coordinator/faculties/${f._id}`} title="View teacher details"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          onClick={e => e.stopPropagation()}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; }}>
                          {f.displayName || f.username}
                        </Link>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 8px', border: '2px solid #0f766e', background: '#ccfbf1', color: '#0f766e', marginLeft: 8, textTransform: 'uppercase' }}>Faculty</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={11} /> @{f.username}{f.email ? ` · ${f.email}` : ''}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <GraduationCap size={11} />
                        {f.batch ? `Their batch: ${typeof f.batch === 'object' && f.batch.name ? f.batch.name : '—'}` : 'No personal batch'}
                        {f.coachingCenterJoinedAt ? ` · joined ${new Date(f.coachingCenterJoinedAt).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingId !== f._id && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(f); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '2px solid #000', padding: '7px 12px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: 'var(--bg-surface)', boxShadow: '2px 2px 0 #000' }}>
                          <Layers size={13} /> Edit Batch Scope
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); revoke(f); }} disabled={revokingId === f._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '2px solid #000', padding: '7px 12px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: '#fee2e2', color: '#991b1b', boxShadow: '2px 2px 0 #000' }}>
                          <Trash2 size={13} /> {revokingId === f._id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Scope summary or editor */}
                {editingId === f._id ? (
                  <div style={{ marginTop: 'var(--space-md)', border: '3px solid #000', padding: 'var(--space-md)', background: 'var(--bg-tertiary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)', flexWrap: 'wrap', gap: 8 }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Layers size={15} /> Assign batches (faculty can only see/manage these)
                      </h3>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{selection.length} selected</span>
                    </div>
                    {batches.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>No batches exist in your center yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {batches.map(b => {
                          const active = selection.includes(b._id);
                          return (
                            <button key={b._id} onClick={(e) => { e.stopPropagation(); toggleBatch(b._id); }}
                              style={{
                                border: '2px solid #000', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                background: active ? '#0f766e' : 'var(--bg-surface)', color: active ? '#fff' : 'var(--text-primary)',
                                boxShadow: active ? '3px 3px 0 #000' : 'none'
                              }}>
                              {b.name} ({b.studentCount ?? 0})
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} style={{ border: '2px solid #000', padding: '7px 12px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: 'var(--bg-surface)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <X size={13} /> Cancel
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); saveScope(); }} disabled={saving} style={{ border: '3px solid #000', padding: '7px 14px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: '#000', color: '#fff', boxShadow: '3px 3px 0 #000', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Save size={13} /> {saving ? 'Saving...' : 'Save Scope'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} /> Batch scope ({scope.length})
                    </div>
                    {scope.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', padding: '8px 10px', border: '2px dashed #000', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={12} /> No batches assigned — this faculty member sees no student data. Edit their scope above.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {scope.map(b => (
                          <span key={b._id || b} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', border: '2px solid #000', background: 'var(--bg-surface)' }}>
                            {typeof b === 'object' ? b.name : 'Unknown batch'}
                            <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>
                              {typeof b === 'object' && b.status ? `(${b.status})` : ''}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}