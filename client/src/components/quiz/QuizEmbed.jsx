import { useEffect, useState } from 'react';
import { fetchQuizByProblem, submitQuizAttempt } from '../../api/quizApi.js';
import Button from '../ui/Button.jsx';
import Loader from '../ui/Loader.jsx';
import MarkdownRenderer from '../ui/MarkdownRenderer.jsx';

/*
 * QuizEmbed — Student-facing MCQ quiz rendered below a problem.
 * Questions and options support markdown (tables, code, etc.).
 * Fetches quiz by problem model + slug. If none exists, renders nothing.
 * Single-shot: once submitted, shows results. Also marks the problem complete.
 */
export default function QuizEmbed({ problemModel, slug, subjectName }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!problemModel || !slug) return;
    setLoading(true);
    setError(null);
    fetchQuizByProblem(problemModel, slug)
      .then(res => {
        setQuiz(res.data);
        if (res.data?.attempt) {
          setResult(res.data.attempt);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.message === 'No quiz for this problem' || err.message === 'Problem not found') {
          setQuiz(null);
        } else {
          setError(err.message);
        }
        setLoading(false);
      });
  }, [problemModel, slug]);

  if (loading) return <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}><Loader text="Loading quiz..." /></div>;
  if (error) return null;
  if (!quiz) return null;

  /* Already submitted — show results */
  if (result) {
    /*
     * Build the full results breakdown from either:
     * - Immediate post-submission: result.results exists (full array with correctIndex, yourAnswer, isCorrect)
     * - Revisit: quiz.questions has correctIndex, result.answers has user's answers
     */
    const buildDetailedResults = () => {
      const items = result.results || (quiz.questions ? quiz.questions.map((q, i) => ({
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        yourAnswer: result.answers?.[i],
        isCorrect: result.answers?.[i] === q.correctIndex
      })) : null);
      return items;
    };

    const detailedResults = buildDetailedResults();
    const correctCount = detailedResults ? detailedResults.filter(r => r.isCorrect).length : 0;
    const totalCount = detailedResults ? detailedResults.length : 0;

    return (
      <div className="quiz-content" style={{
        border: '3px solid var(--border-color)',
        padding: 'var(--space-lg)',
        marginTop: 'var(--space-lg)',
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow)'
      }}>
        {/* ── Compact Summary Header (always visible) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: 'var(--space-md)'
        }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
              {subjectName} Quiz — Results
            </h3>
            <div style={{ fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Score: <strong>{result.score}%</strong></span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span>{result.score >= 80 ? 'Excellent!' : result.score >= 50 ? 'Good effort!' : 'Keep practising!'}</span>
              {detailedResults && (
                <>
                  <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                    {correctCount}/{totalCount} correct
                  </span>
                </>
              )}
              {result.attemptedAt && (
                <>
                  <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    {new Date(result.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Toggle button */}
          {detailedResults && (
            <button
              onClick={() => setShowDetails(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                border: '3px solid var(--border-color)',
                background: showDetails ? 'var(--accent)' : 'var(--bg-surface)',
                color: showDetails ? 'var(--text-inverse)' : 'var(--text-primary)',
                boxShadow: '3px 3px 0 var(--shadow-color)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'background 0.12s, color 0.12s, transform 0.12s, box-shadow 0.12s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--shadow-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--shadow-color)'; }}
            >
              {showDetails ? 'Hide Details' : 'Review Answers'}
              <span style={{ display: 'inline-block', transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </button>
          )}
        </div>

        {/* ── Detailed Breakdown (collapsible) ── */}
        {detailedResults ? (
          <div style={{
            overflow: 'hidden',
            maxHeight: showDetails ? '20000px' : '0',
            opacity: showDetails ? 1 : 0,
            transition: 'max-height 0.4s ease, opacity 0.25s ease'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {detailedResults.map((q, i) => (
                <div key={i} style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  border: '3px solid var(--border-color)',
                  background: q.isCorrect ? 'var(--success-bg)' : 'var(--error-bg)'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                    <MarkdownRenderer noAutoBullet content={`**${i + 1}.** ${q.text}`} />
                  </div>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{
                      padding: '6px 10px',
                      margin: '4px 0',
                      background: oi === q.correctIndex ? 'var(--success-bg)' : oi === q.yourAnswer && !q.isCorrect ? 'var(--error-bg)' : 'transparent',
                      border: oi === q.correctIndex || oi === q.yourAnswer ? '2px solid var(--border-color)' : 'none',
                    }}>
                      <span style={{ fontWeight: 600, marginRight: 6 }}>{String.fromCharCode(65 + oi)}.</span>
                      <MarkdownRenderer noAutoBullet content={opt} />
                      {oi === q.correctIndex && ' ✓'}
                      {oi === q.yourAnswer && !q.isCorrect && ' ✗'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Attempted on {new Date(result.attemptedAt).toLocaleDateString()}</p>
        )}
      </div>
    );
  }

  /* Not yet attempted — show quiz form */
  const handleSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      setSubmitError(`Please answer all ${quiz.questions.length} questions`);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const orderedAnswers = quiz.questions.map((_, i) => answers[i]);
      const res = await submitQuizAttempt(quiz._id, orderedAnswers);
      setResult(res.data);
    } catch (err) {
      if (err.message === 'Already attempted this quiz') {
        setSubmitError('You have already attempted this quiz.');
      } else {
        setSubmitError(err.message);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="quiz-content" style={{
      border: '3px solid var(--border-color)',
      padding: 'var(--space-lg)',
      marginTop: 'var(--space-lg)',
      background: 'var(--bg-secondary)',
      boxShadow: 'var(--shadow)'
    }}>
      <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', fontSize: '1.1rem' }}>
        {subjectName} Quiz — {quiz.questions.length} Question{quiz.questions.length > 1 ? 's' : ''}
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>
        Test your understanding. Single attempt only.
      </p>

      {quiz.questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            <MarkdownRenderer noAutoBullet content={`**${i + 1}.** ${q.text}`} />
          </div>
          {q.options.map((opt, oi) => (
            <label key={oi} style={{
              background: answers[i] === oi ? 'var(--accent-bg)' : 'var(--bg-surface)',
            }}>
              <input
                type="radio"
                name={`q-${i}`}
                checked={answers[i] === oi}
                onChange={() => handleSelect(i, oi)}
                style={{ marginRight: '8px' }}
              />
              <MarkdownRenderer noAutoBullet content={opt} />
            </label>
          ))}
        </div>
      ))}

      {submitError && (
        <p style={{ color: 'var(--error-text)', fontSize: '0.85rem', marginBottom: 'var(--space-sm)' }}>{submitError}</p>
      )}

      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Answers'}
      </Button>
    </div>
  );
}
