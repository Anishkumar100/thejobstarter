import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProgressStore } from '../stores/useProgressStore.js';
import { useProgressMessageStore } from '../stores/useProgressMessageStore.js';
import { getMotivationalMessage, getOverallMessage } from '../utils/progressMessages.js';
import { fetchMyQuizAttempts } from '../api/quizApi.js';
import Loader from '../components/ui/Loader.jsx';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { Award, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

/*
 * SubjectProgressDetail — Detailed stats page for one subject (dsa, dbms, os).
 * Shows:
 *   - Overall progress with breakdown
 *   - Quiz attempts with scores and justifications
 *   - Detailed per-lesson/subtopic/problem view
 */
export default function SubjectProgressDetail() {
  const { subject } = useParams();

  const { summary: progressSummary, loading: progressLoading, fetchSummary: fetchProgressSummary } = useProgressStore();
  const { messages: progressMessages, fetchMessages: fetchProgressMessages } = useProgressMessageStore();
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState(null);

  const validSubjects = ['dsa', 'dbms', 'os'];
  const subjectLabel = { dsa: 'DSA', dbms: 'DBMS', os: 'OS' }[subject] || subject;
  const subjectColors = {
    dsa: { bg: '#e8f4f8', accent: '#0066ff', border: '#0066ff' },
    dbms: { bg: '#fef3e2', accent: '#f59e0b', border: '#d97706' },
    os: { bg: '#f0fdf4', accent: '#16a34a', border: '#15803d' }
  };
  const colors = subjectColors[subject] || { bg: '#f5f5f5', accent: '#000', border: '#000' };

  /* Fetch progress summary on mount */
  useEffect(() => {
    fetchProgressSummary();
    fetchProgressMessages();
  }, []);

  /* Fetch quiz attempts for this subject */
  useEffect(() => {
    setAttemptsLoading(true);
    fetchMyQuizAttempts()
      .then(res => {
        const filtered = (res.data || []).filter(a => a.subject === subject);
        setAttempts(filtered);
        setAttemptsLoading(false);
      })
      .catch(() => setAttemptsLoading(false));
  }, [subject]);

  /* Invalid subject */
  if (!validSubjects.includes(subject)) {
    return (
      <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)' }}>
        <Link to="/settings/profile" className="detail-back">← Back to Profile</Link>
        <div className="error-text" style={{ marginTop: 'var(--space-lg)' }}>Invalid subject. Please select DSA, DBMS, or OS.</div>
      </div>
    );
  }

  if (progressLoading) {
    return (
      <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)' }}>
        <Loader text={`LOADING ${subjectLabel} DETAILS...`} />
      </div>
    );
  }

  const data = progressSummary?.[subject];
  if (!data) {
    return (
      <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)' }}>
        <Link to="/settings/profile" className="detail-back">← Back to Profile</Link>
        <p style={{ marginTop: 'var(--space-lg)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No progress data yet for {subjectLabel}.</p>
      </div>
    );
  }

  const pct = data.overall.total > 0 ? Math.round((data.overall.completed / data.overall.total) * 100) : 0;
  const { message: motMsg } = getMotivationalMessage(pct, progressMessages);
  const overallMsg = getOverallMessage(pct, progressMessages);

  /* Determine overall status text/color — lowercase labels, no title case */
  const getScoreGrade = (score) => {
    if (score === 100) return { label: 'perfect', color: '#166534' };
    if (score >= 90) return { label: 'excellent', color: '#166534' };
    if (score >= 80) return { label: 'great', color: '#15803d' };
    if (score >= 70) return { label: 'good', color: '#15803d' };
    if (score >= 60) return { label: 'above average', color: '#854d0e' };
    if (score >= 50) return { label: 'average', color: '#854d0e' };
    if (score >= 40) return { label: 'below average', color: '#92400e' };
    if (score >= 25) return { label: 'needs work', color: '#991b1b' };
    return { label: 'just starting', color: '#991b1b' };
  };

  const grade = getScoreGrade(pct);
  const quizGrade = getScoreGrade(data.quizzes.avgScore);

  /*
   * Score justification helper — returns detailed, accurate explanation
   * based on percentage broken into finer brackets, quiz scores, and completion status.
   */
  const getJustification = (pct, quizzesTaken, avgScore, lessonData, subtopicData, problemData) => {
    const parts = [];

    /* Progress justification — every 10% for accuracy */
    if (pct === 100) {
      parts.push('you have completed all available content in this subject — every lesson, subtopic, and problem is done.');
    } else if (pct >= 90) {
      parts.push('you are in the final stretch with over 90% completion. a handful of items remain to reach full mastery.');
    } else if (pct >= 80) {
      parts.push('strong progress at 80%+ completion. you have built a solid foundation across most of the content.');
    } else if (pct >= 70) {
      parts.push('good progress — you have covered more than two-thirds of the material. consistent effort is paying off.');
    } else if (pct >= 60) {
      parts.push('more than half the content is done. you have established a decent base — keep the momentum going.');
    } else if (pct >= 50) {
      parts.push('exactly halfway (or just past it). this is a significant milestone — the rest is within reach.');
    } else if (pct >= 40) {
      parts.push('you have completed a solid portion of the content. building momentum now sets you up for strong progress.');
    } else if (pct >= 30) {
      parts.push('a good start — about a third of the material is done. consistency in these early stages matters most.');
    } else if (pct >= 20) {
      parts.push('you have taken the first steps. even 20% is a meaningful foundation — keep adding to it daily.');
    } else if (pct >= 10) {
      parts.push('you are at the beginning of your learning journey. small, consistent steps lead to big results.');
    } else if (pct === 0) {
      parts.push('no items completed yet. every journey starts with a single step — pick a lesson and begin today.');
    } else {
      parts.push('early progress — you have started working through the content. each completed item builds your understanding.');
    }

    /* Breakdown of completed items across types */
    if (lessonData && subtopicData && problemData) {
      const sections = [];
      if (lessonData.completed > 0) sections.push(`${lessonData.completed} lesson${lessonData.completed > 1 ? 's' : ''}`);
      if (subtopicData.completed > 0) sections.push(`${subtopicData.completed} subtopic${subtopicData.completed > 1 ? 's' : ''}`);
      if (problemData.completed > 0) sections.push(`${problemData.completed} problem${problemData.completed > 1 ? 's' : ''}`);
      if (sections.length > 0) {
        parts.push(`your completions span ${sections.join(', ')} across this subject.`);
      }
    }

    /* Quiz performance justification */
    if (quizzesTaken > 0) {
      if (avgScore === 100) {
        parts.push('your quiz average is perfect — every question answered correctly across all quizzes.');
      } else if (avgScore >= 90) {
        parts.push('your quiz average is excellent at 90%+, showing very strong conceptual clarity with only occasional slip-ups.');
      } else if (avgScore >= 80) {
        parts.push('your quiz performance is strong (80%+ average), indicating solid understanding with minor gaps.');
      } else if (avgScore >= 70) {
        parts.push('your quiz average is good (70%+). reviewing the questions you missed will help strengthen weaker spots.');
      } else if (avgScore >= 60) {
        parts.push('your quiz scores are decent (60%+). focus on revisiting the topics where your answers were incorrect.');
      } else if (avgScore >= 50) {
        parts.push('your quiz average is around 50%. consider re-reading the lesson materials before attempting similar quizzes.');
      } else {
        parts.push('your quiz scores suggest significant room for improvement. we recommend studying the subtopic explanations again.');
      }
      parts.push(`you have attempted ${quizzesTaken} quiz${quizzesTaken > 1 ? 'zes' : ''} in this subject.`);
    } else {
      parts.push('no quizzes attempted yet. once you feel confident in a topic, try its quiz to test and reinforce your understanding.');
    }

    /* Cross-reference: does quiz avg align with progress? */
    if (quizzesTaken > 0) {
      const diff = avgScore - pct;
      if (diff >= 20) {
        parts.push('your quiz scores are significantly higher than your completion rate suggests strong understanding of the topics you have covered.');
      } else if (diff <= -20) {
        parts.push('your quiz scores trail behind your completion rate — consider revisiting earlier topics to solidify your foundation.');
      } else if (Math.abs(diff) <= 5 && pct > 0) {
        parts.push('your quiz performance and progress rate are well aligned, indicating consistent understanding across topics.');
      } else {
        parts.push('your quiz performance and progress rate are in a reasonable range with room to grow in both areas.');
      }
    }

    return parts;
  };

  const justifications = getJustification(
    pct, data.quizzes.quizzesTaken, data.quizzes.avgScore,
    data.lessons, data.subtopics, data.problems
  );

  return (
    <div className="container container-sm" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>{subjectLabel} Progress — TheJobStarter</title>
      </Helmet>

      <Link to="/settings/profile" className="detail-back">
        <ArrowLeft01Icon size={16} />
        <span style={{ marginLeft: 6 }}>Back to Profile</span>
      </Link>

      {/* ═════ HEADER ═════ */}
      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-lg)',
        border: '3px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
          <div style={{
            minWidth: 56, height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1.4rem',
            border: '3px solid var(--border-color)',
            background: colors.accent,
            color: '#fff'
          }}>
            {subjectLabel}
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              {subjectLabel} — Progress Report
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Overall completion · Quiz performance · Score analysis
            </p>
          </div>
        </div>

        {/* ═════ SCORE ODOMETER ═════ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Overall Progress</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: grade.color }}>{pct}% — {grade.label}</span>
            </div>
            <div style={{
              height: 16,
              background: 'var(--bg-tertiary)',
              border: '2px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: data.overall.completed === data.overall.total ? 'var(--success)' : colors.accent,
                  width: '0%'
                }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {data.overall.completed} of {data.overall.total} items completed across {data.lessons.total} lessons, {data.subtopics.total} subtopics, {data.problems.total} problems
            </div>
          </div>

          {data.quizzes.quizzesTaken > 0 && (
            <div style={{
              padding: 'var(--space-sm) var(--space-md)',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              textAlign: 'center',
              minWidth: 160
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>Quiz Avg</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: quizGrade.color }}>{data.quizzes.avgScore}%</div>
              <div style={{ fontSize: '0.72rem', color: quizGrade.color, fontWeight: 600 }}>{quizGrade.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{data.quizzes.quizzesTaken} quiz{data.quizzes.quizzesTaken > 1 ? 'zes' : ''} taken</div>
            </div>
          )}
        </div>
      </div>

      {/* ═════ JUSTIFICATION SECTION ═════ */}
      <div style={{
        marginTop: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        border: '3px solid var(--border-color)',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-sm)' }}>
          Score Analysis & Justification
        </h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {justifications.map((j, i) => (
            <li key={i} style={{
              fontSize: '0.82rem',
              lineHeight: 1.6,
              paddingLeft: '16px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute', left: 0, top: '5px',
                width: 8, height: 8,
                background: colors.accent,
                display: 'inline-block'
              }} />
              {j}
            </li>
          ))}
        </ul>
      </div>

      {/* ═════ OVERALL MOTIVATIONAL MESSAGE ═════ */}
      <div style={{
        marginTop: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        border: '3px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        background: 'var(--bg-secondary)',
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--text-primary)'
      }}>
        {overallMsg}
      </div>

      {/* ═════ PROGRESS BREAKDOWN — LESSONS / SUBTOPICS / PROBLEMS ═════ */}
      <div style={{
        marginTop: 'var(--space-lg)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        {[
          { type: 'Lessons', completed: data.lessons.completed, total: data.lessons.total },
          { type: 'Subtopics', completed: data.subtopics.completed, total: data.subtopics.total },
          { type: 'Problems', completed: data.problems.completed, total: data.problems.total }
        ].map(item => {
          const itemPct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
          return (
            <div key={item.type} style={{
              padding: 'var(--space-md)',
              border: '3px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                {item.type}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: itemPct === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                {item.completed}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>/{item.total}</span>
              </div>
              <div style={{
                height: 6,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                marginTop: 'var(--space-sm)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${itemPct}%`,
                  background: itemPct === 100 ? 'var(--success)' : colors.accent,
                  transition: 'width 0.5s'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4, color: 'var(--text-secondary)' }}>
                {itemPct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* ═════ QUIZ ATTEMPTS ═════ */}
      <div className="quiz-content" style={{ marginTop: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
          Quiz Attempts
          {attempts.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 400, textTransform: 'none', color: 'var(--text-tertiary)' }}>
              ({attempts.length} total)
            </span>
          )}
        </h3>

        {attemptsLoading && <Loader text="Loading quiz attempts..." />}

        {!attemptsLoading && attempts.length === 0 && (
          <div style={{
            padding: 'var(--space-lg)',
            border: '3px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            fontStyle: 'italic'
          }}>
            No quiz attempts yet for {subjectLabel}. Attempt quizzes on problem pages to see them here.
          </div>
        )}

        {!attemptsLoading && attempts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attempts.map(att => {
              const isOpen = expandedAttempt === att._id;
              const correctCount = att.questions.filter((q, i) => att.answers[i] === q.correctIndex).length;
              const attGrade = getScoreGrade(att.score);

              return (
                <div key={att._id} style={{
                  border: '3px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}>
                  {/* Compact header */}
                  <div
                    onClick={() => setExpandedAttempt(isOpen ? null : att._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      background: isOpen ? 'var(--bg-tertiary)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Score badge */}
                    <div style={{
                      minWidth: 44, height: 44,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.9rem',
                      border: '3px solid var(--border-color)',
                      background: att.score >= 80 ? '#166534' : att.score >= 50 ? '#92400e' : '#991b1b',
                      color: '#fff'
                    }}>
                      {att.score}%
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: attGrade.color }}>{attGrade.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                          {correctCount}/{att.questions.length} correct
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {att.attemptedAt ? new Date(att.attemptedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        }) : ''}
                        {att.problemSlug && (
                          <span> · <Link
                            to={`/${subject === 'dsa' ? 'dsa' : subject === 'dbms' ? 'dbms' : 'os'}/${att.problemSlug}`}
                            onClick={e => e.stopPropagation()}
                            style={{ textDecoration: 'underline', color: 'var(--accent-blue, #0066ff)' }}
                          >View problem</Link></span>
                        )}
                      </div>
                    </div>

                    {/* Justification */}
                    <div style={{
                      display: 'none',
                      fontSize: '0.72rem',
                      color: 'var(--text-tertiary)',
                      maxWidth: 180,
                      textAlign: 'right',
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}>
                      {att.score >= 80 ? 'Strong conceptual grasp' :
                       att.score >= 60 ? 'Good understanding' :
                       att.score >= 40 ? 'Needs revision' : 'Review fundamentals'}
                    </div>

                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{
                      borderTop: '2px solid var(--border-subtle)',
                      padding: 'var(--space-md) var(--space-lg)',
                      background: 'var(--bg-surface)'
                    }}>
                      {/* Score justification */}
                      <div style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        marginBottom: 'var(--space-md)',
                        border: '2px solid var(--border-color)',
                        background: 'var(--bg-tertiary)',
                        fontSize: '0.82rem',
                        lineHeight: 1.6
                      }}>
                        <strong style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                          score: {att.score}% — {attGrade.label}
                        </strong>
                        <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                          {att.score >= 90 ? 'excellent work! your understanding of this topic is very strong. you have demonstrated a thorough grasp of the concepts.' :
                           att.score >= 75 ? 'great job! you have a solid understanding with only minor gaps. review the questions you missed to close those gaps.' :
                           att.score >= 60 ? 'good effort! you have a decent grasp but there is room for improvement. focus on the topics where you made mistakes.' :
                           att.score >= 40 ? 'fair attempt. consider revisiting the lesson and subtopic materials to strengthen your understanding.' :
                           'needs improvement. we recommend studying the lesson materials again before retrying similar problems.'}
                        </div>
                      </div>

                      {att.questions.map((q, qi) => (
                        <div key={qi} style={{
                          marginBottom: qi < att.questions.length - 1 ? 'var(--space-md)' : 0,
                          padding: 'var(--space-sm) var(--space-md)',
                          border: '2px solid var(--border-subtle)'
                        }}>
                          <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>
                            <MarkdownRenderer noAutoBullet content={`**${qi + 1}.** ${q.text}`} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {q.options.map((opt, oi) => {
                              const isCorrectAnswer = oi === q.correctIndex;
                              const isUserAnswer = att.answers[qi] === oi;
                              const isWrongPick = isUserAnswer && !isCorrectAnswer;
                              return (
                                <div key={oi} style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                                  padding: '6px 10px', fontSize: '0.82rem',
                                  border: `2px solid ${isCorrectAnswer ? 'var(--success)' : isWrongPick ? 'var(--error)' : 'transparent'}`,
                                  background: isCorrectAnswer ? 'var(--success-bg)' : isWrongPick ? 'var(--error-bg)' : 'transparent'
                                }}>
                                  <span style={{
                                    fontWeight: 700, flexShrink: 0, minWidth: 20,
                                    color: isCorrectAnswer ? 'var(--success-text)' : isWrongPick ? 'var(--error-text)' : 'var(--text-secondary)'
                                  }}>
                                    {String.fromCharCode(65 + oi)}.
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <MarkdownRenderer noAutoBullet content={opt} />
                                  </div>
                                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {isCorrectAnswer && (
                                      <span style={{ color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                                        <CheckCircle size={14} /> correct
                                      </span>
                                    )}
                                    {isWrongPick && (
                                      <span style={{ color: 'var(--error-text)', display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                                        <XCircle size={14} /> your pick
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
