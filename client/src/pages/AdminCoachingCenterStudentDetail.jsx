import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCoachingCenterStore } from '../stores/useCoachingCenterStore.js';
import Loader from '../components/ui/Loader.jsx';
import Modal from '../components/ui/Modal.jsx';
import { fetchAdminUserSummary, fetchAdminUserDailyCount } from '../api/progressApi.js';
import { useProgressMessageStore } from '../stores/useProgressMessageStore.js';
import { getMotivationalMessage, getStreakMessage } from '../utils/progressMessages.js';
import { ArrowLeft, ExternalLink, Trash2, Save, CheckCircle } from 'lucide-react';

export default function AdminCoachingCenterStudentDetail() {
  const { centerId, userId } = useParams();
  const navigate = useNavigate();
  const {
    currentCenter, currentStudent, studentLoading,
    fetchCenterById, fetchCenterStudentById, updateCenterStudent, removeStudentFromCenter
  } = useCoachingCenterStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const progressMessages = useProgressMessageStore(s => s.messages);
  const fetchProgressMessages = useProgressMessageStore(s => s.fetchMessages);

  useEffect(() => {
    if (!currentCenter) {
      fetchCenterById(centerId);
    }
  }, [centerId]);

  useEffect(() => {
    fetchCenterStudentById(centerId, userId);
  }, [centerId, userId]);

  useEffect(() => {
    if (currentStudent && !editing) {
      setForm({
        displayName: currentStudent.displayName || '',
        email: currentStudent.email || '',
        college: currentStudent.college || '',
        year: currentStudent.year || ''
      });
    }
  }, [currentStudent, editing]);

  /* Fetch progress messages once */
  useEffect(() => { fetchProgressMessages(); }, []);

  /* Fetch progress summary + daily count once student is loaded */
  useEffect(() => {
    if (!currentStudent?._id) {
      console.log('[ADMIN] No student _id yet, skipping progress fetch');
      return;
    }
    console.log('[ADMIN] Fetching progress for student:', currentStudent._id, 'displayName:', currentStudent.displayName);
    setProgressLoading(true);
    Promise.all([
      fetchAdminUserSummary(currentStudent._id),
      fetchAdminUserDailyCount(currentStudent._id)
    ])
      .then(([summaryRes, dailyRes]) => {
        console.log('[ADMIN] Progress response:', JSON.stringify(summaryRes.data));
        console.log('[ADMIN] Daily count response:', JSON.stringify(dailyRes.data));
        setProgress(summaryRes.data);
        setDailyCount(dailyRes.data?.count || 0);
        setProgressLoading(false);
      })
      .catch(err => {
        console.error('[ADMIN] Error fetching student progress:', err.message);
        setProgressLoading(false);
      });
  }, [currentStudent?._id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCenterStudent(centerId, userId, form);
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update student');
    }
    setSaving(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeStudentFromCenter(centerId, userId);
      setRemoveConfirmOpen(false);
      navigate(`/admin/coaching-centers/${centerId}`);
    } catch (err) {
      alert(err.message || 'Failed to remove student');
    }
    setRemoving(false);
  };

  if (studentLoading) return <Loader text="Loading student..." />;
  if (!currentStudent) return <div className="error-text">Student not found</div>;

  return (
    <div>
      <Helmet><title>{currentStudent.displayName || currentStudent.username} — Student — TheJobStarter</title></Helmet>

      {/* Back link */}
      <Link to={`/admin/coaching-centers/${centerId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-md)', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Back to {currentCenter?.name || 'centre'}
      </Link>

      {/* Header */}
      <div className="listing-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentStudent.avatar ? (
            <img src={currentStudent.avatar} alt="" style={{ width: 56, height: 56, border: '3px solid var(--black)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 56, height: 56, border: '3px solid var(--black)', background: 'var(--gray-300)' }} />
          )}
          <div>
            <h1 className="listing-header__title">{currentStudent.displayName || currentStudent.username}</h1>
            <span className="listing-header__count">
              @{currentStudent.username}
              {currentStudent.coachingCenterJoinedAt && (
                <> · Joined {new Date(currentStudent.coachingCenterJoinedAt).toLocaleDateString()}</>
              )}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href={`/users/${currentStudent.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={14} /> View Profile
          </a>
          <button className="btn" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Profile Details</h2>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxWidth: 480 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Display Name</label>
            <input className="input" name="displayName" value={form.displayName} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>College</label>
            <input className="input" name="college" value={form.college} onChange={handleChange} />

            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Year</label>
            <input className="input" name="year" value={form.year} onChange={handleChange} />

            <div style={{ marginTop: 'var(--space-md)' }}>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', fontSize: '0.9rem' }}>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Username</span>
              <p>@{currentStudent.username}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Display Name</span>
              <p>{currentStudent.displayName || '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Email</span>
              <p>{currentStudent.email || '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>College</span>
              <p>{currentStudent.college || '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Year</span>
              <p>{currentStudent.year || '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Bio</span>
              <p>{currentStudent.bio || '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Joined Platform</span>
              <p>{currentStudent.joinDate ? new Date(currentStudent.joinDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Linked to Centre</span>
              <p>{currentStudent.coachingCenterJoinedAt ? new Date(currentStudent.coachingCenterJoinedAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* External Links */}
      {currentStudent.externalLinks?.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>External Links</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentStudent.externalLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem' }}>
                {link.label || link.platform} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {currentStudent.skills?.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {currentStudent.skills.map((skill, i) => (
              <span key={i} className="tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
          <CheckCircle size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Progress Dashboard
        </h2>
        {progressLoading ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Loading progress...</p>
        ) : !progress ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No progress data available.</p>
        ) : (
          <>
            {/* ═════ TODAY'S ACTIVITY ═════ */}
            <div style={{
              padding: 'var(--space-sm) var(--space-md)',
              marginBottom: 'var(--space-md)',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                minWidth: 42, height: 42,
                border: '2px solid var(--border-color)',
                background: 'var(--accent)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem'
              }}>
                {dailyCount}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Today's Activity
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                  {getStreakMessage(dailyCount, progressMessages)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
            {Object.entries(progress).map(([subject, data]) => {
              const subjectName = { dsa: 'DSA', dbms: 'DBMS', os: 'OS' }[subject] || subject;
              const { lessons, subtopics, problems, overall } = data;
              const pct = overall.total > 0 ? Math.round((overall.completed / overall.total) * 100) : 0;
              return (
                <div key={subject} style={{
                  border: '3px solid var(--border-color)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--bg-secondary)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{subjectName}</div>
                  <div style={{ fontSize: '0.75rem', marginBottom: 8 }}>
                    {overall.completed}/{overall.total} items · {pct}%
                  </div>
                  <div style={{
                    height: 8, background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)', marginBottom: 6
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: pct === 100 ? 'var(--success, #22c55e)' : 'var(--accent)',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  {/* Motivational message */}
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--text-tertiary)',
                    fontStyle: 'italic', marginBottom: 8,
                    padding: '4px 6px', borderLeft: '3px solid var(--accent)',
                    background: 'var(--bg-tertiary)'
                  }}>
                    {getMotivationalMessage(pct, progressMessages).message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', gap: 12 }}>
                    <span>Lessons: {lessons.completed}/{lessons.total}</span>
                    <span>Topics: {subtopics.completed}/{subtopics.total}</span>
                    <span>Problems: {problems.completed}/{problems.total}</span>
                    {data.quizzes && <span>Quizzes: {data.quizzes.quizzesTaken} · {data.quizzes.avgScore}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div className="admin-card" style={{ borderColor: 'var(--error)', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--error)' }}>Danger Zone</h2>
        <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
          Remove this student from <strong>{currentCenter?.name || 'the centre'}</strong>.
          Their profile data and progress are preserved — they just won't be linked anymore.
        </p>
        <button className="btn btn--danger" onClick={() => setRemoveConfirmOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Trash2 size={14} /> Remove from Centre
        </button>
      </div>

      {/* Remove confirmation modal */}
      <Modal isOpen={removeConfirmOpen} onClose={() => setRemoveConfirmOpen(false)} title="Remove Student">
        <p style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
          Remove <strong>{currentStudent.displayName || currentStudent.username}</strong> from{' '}
          <strong>{currentCenter?.name || 'this centre'}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setRemoveConfirmOpen(false)}>Cancel</button>
          <button className="btn btn--danger" onClick={handleRemove} disabled={removing}>
            {removing ? 'Removing...' : 'Yes, remove'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
