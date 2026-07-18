import { useEffect, useState } from 'react';
import { fetchQuizByProblemId, createQuiz, updateQuiz, deleteQuiz } from '../../api/quizApi.js';
import Button from '../ui/Button.jsx';
import MarkdownRenderer from '../ui/MarkdownRenderer.jsx';

/*
 * QuizEditor — Admin collapsible section for authoring an MCQ quiz on a problem.
 * Questions and options support markdown (tables, code blocks, etc.).
 * Props: problemId (MongoDB _id), problemModel ('Problem'|'DbmsProblem'|'OsProblem')
 * Fetches existing quiz on mount; shows create/edit/delete controls.
 */
export default function QuizEditor({ problemId, problemModel }) {
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([{ text: '', options: ['', ''], correctIndex: 0 }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [previewQ, setPreviewQ] = useState(null); /* index of question being previewed, or null */
  const [previewOpt, setPreviewOpt] = useState({}); /* { qi: oi } for option preview */

  useEffect(() => {
    if (!problemId || !problemModel) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchQuizByProblemId(problemModel, problemId)
      .then(res => {
        const q = res.data;
        if (q) {
          setQuizId(q._id);
          setQuestions(q.questions.map(qq => ({
            text: qq.text,
            options: [...qq.options],
            correctIndex: qq.correctIndex
          })));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [problemId, problemModel]);

  const handleQuestionText = (i, val) => {
    setQuestions(prev => { const n = [...prev]; n[i] = { ...n[i], text: val }; return n; });
  };

  const handleOption = (qi, oi, val) => {
    setQuestions(prev => {
      const n = [...prev];
      const opts = [...n[qi].options];
      opts[oi] = val;
      n[qi] = { ...n[qi], options: opts };
      return n;
    });
  };

  const handleCorrectIndex = (qi, val) => {
    setQuestions(prev => { const n = [...prev]; n[qi] = { ...n[qi], correctIndex: Number(val) }; return n; });
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { text: '', options: ['', ''], correctIndex: 0 }]);
  };

  const addOption = (qi) => {
    setQuestions(prev => {
      const n = [...prev];
      if (n[qi].options.length >= 6) return n;
      n[qi] = { ...n[qi], options: [...n[qi].options, ''] };
      return n;
    });
  };

  const removeOption = (qi, oi) => {
    setQuestions(prev => {
      const n = [...prev];
      if (n[qi].options.length <= 2) return n;
      const opts = n[qi].options.filter((_, i) => i !== oi);
      let ci = n[qi].correctIndex;
      if (oi === ci) ci = 0;
      else if (oi < ci) ci--;
      n[qi] = { ...n[qi], options: opts, correctIndex: ci };
      return n;
    });
  };

  const removeQuestion = (i) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    const valid = questions.every(q => q.text.trim() && q.options.every(o => o.trim()) && q.options.length >= 2);
    if (!valid) {
      setError('All questions must have text and at least 2 non-empty options.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (quizId) {
        await updateQuiz(quizId, { questions });
      } else {
        const res = await createQuiz({ problemId, problemModel, questions });
        setQuizId(res.data._id);
      }
      setSaved(true);
      console.log('[QUIZ] Saved');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!quizId) return;
    if (!window.confirm('Delete this quiz and all student attempts?')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteQuiz(quizId);
      setQuizId(null);
      setQuestions([{ text: '', options: ['', ''], correctIndex: 0 }]);
      setExpanded(false);
      console.log('[QUIZ] Deleted');
    } catch (err) {
      setError(err.message);
    }
    setDeleting(false);
  };

  return (
    <div style={{ marginTop: 'var(--space-lg)' }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '12px',
          border: '3px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <span>MCQ Quiz {quizId ? '(attached)' : '(none)'}</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{
          border: '3px solid var(--border-color)', borderTop: 'none',
          padding: 'var(--space-md)',
          background: 'var(--bg-surface)'
        }}>
          {error && <p style={{ color: 'var(--error-text)', marginBottom: 'var(--space-sm)', fontSize: '0.85rem' }}>{error}</p>}
          {saved && <p style={{ color: 'var(--success-text)', marginBottom: 'var(--space-sm)', fontSize: '0.85rem' }}>Quiz saved!</p>}

          {questions.map((q, qi) => (
            <div key={qi} style={{
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-sm)',
              border: '2px solid var(--border-subtle)',
              position: 'relative'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Question {qi + 1}</span>
                <button type="button" onClick={() => setPreviewQ(previewQ === qi ? null : qi)}
                  style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.75rem', color: 'var(--accent)' }}>
                  {previewQ === qi ? 'Edit' : 'Preview'}
                </button>
                <button type="button" onClick={() => removeQuestion(qi)}
                  style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.75rem', color: 'var(--error-text)' }}>
                  Remove
                </button>
              </div>

              {previewQ === qi ? (
                <div style={{
                  padding: 'var(--space-sm)',
                  border: '2px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  <MarkdownRenderer noAutoBullet content={q.text || '*No content*'} />
                </div>
              ) : (
                <textarea
                  className="input"
                  value={q.text}
                  onChange={e => handleQuestionText(qi, e.target.value)}
                  placeholder="Question text (supports markdown: tables, code blocks, **bold**, etc.)"
                  rows={4}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  style={{ width: '100%', marginBottom: 'var(--space-xs)', resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              )}

              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'flex-start' }}>
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => handleCorrectIndex(qi, oi)}
                    title="Mark as correct answer"
                    style={{ marginTop: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    {previewOpt[qi] === oi ? (
                      <div style={{
                        padding: '4px 8px',
                        border: '2px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        minHeight: '28px'
                      }} onClick={() => setPreviewOpt(prev => { const n = { ...prev }; delete n[qi]; return n; })}>
                        <MarkdownRenderer noAutoBullet content={opt || '*empty*'} />
                      </div>
                    ) : (
                      <input
                        className="input"
                        value={opt}
                        onChange={e => handleOption(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)} (supports markdown)`}
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck={false}
                        style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                        onFocus={() => setPreviewOpt(prev => { const n = { ...prev }; delete n[qi]; return n; })}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewOpt(prev => prev[qi] === oi ? (() => { const n = { ...prev }; delete n[qi]; return n; })() : { ...prev, [qi]: oi })}
                      style={{ fontSize: '0.65rem', cursor: 'pointer', border: 'none', background: 'none', color: 'var(--text-tertiary)', padding: 0, marginTop: '2px' }}
                    >
                      {previewOpt[qi] === oi ? 'edit' : 'preview'}
                    </button>
                  </div>
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qi, oi)}
                      style={{ color: 'var(--error-text)', cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.75rem', marginTop: '6px' }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button type="button" onClick={() => addOption(qi)}
                  style={{ fontSize: '0.75rem', cursor: 'pointer', border: 'none', background: 'none', color: 'var(--accent)', marginTop: '2px' }}>
                  + Add option
                </button>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            <button type="button" className="btn btn--sm" onClick={addQuestion}>+ Add Question</button>
            <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : quizId ? 'Update Quiz' : 'Create Quiz'}
            </Button>
            {quizId && (
              <Button type="button" size="sm" disabled={deleting} onClick={handleDelete} style={{ background: 'var(--error-text)', color: '#fff' }}>
                {deleting ? 'Deleting...' : 'Delete Quiz'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
