import { useMemo } from 'react';
import { BulbIcon, AlertCircleIcon, ArrowRight01Icon } from 'hugeicons-react';

/*
 * FeedbackSection — Algorithmic per-subject feedback based on progress data.
 * Highlights strengths, areas for improvement, and suggests next steps.
 */
export default function FeedbackSection({ progress }) {
  const feedback = useMemo(() => {
    if (!progress) return [];
    const subjects = ['dsa', 'dbms', 'os', 'programming'];
    const labels = { dsa: 'DSA', dbms: 'DBMS', os: 'OS', programming: 'Programming' };
    const result = [];

    /* Collect per-subject stats */
    const stats = subjects.map(subject => {
      const data = progress[subject];
      if (!data) return null;
      const pct = data.overall.total > 0 ? Math.round((data.overall.completed / data.overall.total) * 100) : 0;
      return { subject, label: labels[subject], pct, ...data.overall };
    }).filter(Boolean);

    if (stats.length === 0) return [];

    /* Find strongest and weakest subjects */
    const sorted = [...stats].sort((a, b) => b.pct - a.pct);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    /* Overall insight */
    const totalCompleted = stats.reduce((s, x) => s + x.completed, 0);
    const totalItems = stats.reduce((s, x) => s + x.total, 0);
    const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    result.push({ type: 'overall', pct: overallPct, count: totalCompleted, total: totalItems });

    /* Best subject */
    if (best && best.pct > 0) {
      result.push({ type: 'strength', subject: best.label, pct: best.pct });
    }

    /* Worst subject — advice if below the best by at least 10 points */
    if (worst && best && worst.pct < best.pct - 10 && worst.pct < 100) {
      const nextSteps = {
        dsa: 'Try revisiting the lesson on fundamental data structures.',
        dbms: 'Start with the SQL basics and normalization lessons.',
        os: 'Begin with process management and memory concepts.',
        programming: 'Focus on core programming fundamentals: variables, control flow, functions, and data types before moving to advanced topics.'
      };
      result.push({
        type: 'improvement',
        subject: worst.label,
        pct: worst.pct,
        tip: nextSteps[worst.subject] || 'Review the core lessons for this subject.'
      });
    }

    /* Balanced if all subjects within 15% of each other and none below 40% */
    const spread = sorted.length > 0 ? sorted[sorted.length - 1].pct - sorted[0].pct : 0;
    if (sorted.every(s => s.pct >= 40) && Math.abs(spread) <= 15 && sorted.length > 1) {
      result.push({ type: 'balanced', pct: overallPct });
    }

    return result;
  }, [progress]);

  if (feedback.length === 0) return null;

  return (
    <div style={{
      padding: 'var(--space-lg)',
      marginTop: 'var(--space-xl)',
      border: '3px solid var(--border-color)',
      boxShadow: 'var(--shadow)',
      background: 'var(--bg-secondary)'
    }}>
      <h3 style={{
        marginBottom: 'var(--space-md)',
        fontSize: '1rem',
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        <BulbIcon size={18} style={{ marginRight: 6, verticalAlign: -2 }} />
        Feedback & Insights
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {feedback.map((item, i) => {
          if (item.type === 'overall') {
            return (
              <div key={i} style={{
                padding: 'var(--space-sm) var(--space-md)',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                fontSize: '0.85rem'
              }}>
                <strong>Overall:</strong> {item.count}/{item.total} items completed ({item.pct}%) across all subjects.
              </div>
            );
          }
          if (item.type === 'strength') {
            return (
              <div key={i} style={{
                padding: 'var(--space-sm) var(--space-md)',
                border: '2px solid var(--success)',
                background: 'var(--success-bg)',
                color: 'var(--success-text)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BulbIcon size={16} style={{ flexShrink: 0 }} />
                <span><strong>{item.subject}</strong> is your strongest subject at {item.pct}% completion. Keep it up!</span>
              </div>
            );
          }
          if (item.type === 'improvement') {
            return (
              <div key={i} style={{
                padding: 'var(--space-sm) var(--space-md)',
                border: '2px solid var(--warning)',
                background: 'var(--warning-bg)',
                color: 'var(--warning-text)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircleIcon size={16} style={{ flexShrink: 0 }} />
                <div>
                  <strong>{item.subject}</strong> needs attention ({item.pct}%).
                  <div style={{ marginTop: 2, fontSize: '0.78rem' }}>{item.tip}</div>
                </div>
              </div>
            );
          }
          if (item.type === 'balanced') {
            return (
              <div key={i} style={{
                padding: 'var(--space-sm) var(--space-md)',
                border: '2px solid var(--accent)',
                background: 'var(--accent-light)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ArrowRight01Icon size={16} style={{ flexShrink: 0 }} />
                <span>You're making balanced progress across all subjects! Consistency is key to retention.</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
