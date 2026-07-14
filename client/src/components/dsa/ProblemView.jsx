import Badge from '../ui/Badge.jsx';
import CodeBlock from '../ui/CodeBlock.jsx';
import VideoEmbed from '../ui/VideoEmbed.jsx';
import Image from '../ui/Image.jsx';
import MarkdownRenderer from '../ui/MarkdownRenderer.jsx';


/*
 * ProblemView — renders the full problem detail content.
 * Handles: title, difficulty, topics, companies, statement,
 * examples, constraints, approach, code blocks, complexity, media.
 */

/*
 * Render pipe-table content as a direct HTML <table> using
 * the existing subtopic-table CSS classes (same as problem statement).
 * Pure pipe parsing — works with or without \n in the data.
 */
function ExampleTable({ content }) {
  if (!content) return null;
  const text = content.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
  let lines = text.split('\n').filter(l => l.trim());

  /*
   * If all content is on one line (no \n), try splitting the
   * single-line pipe table into rows by detecting the separator
   * row (--------) and using its column count.
   */
  if (lines.length === 1) {
    const parts = lines[0].split('|').map(c => c.trim()).filter(c => c);
    const sepIdx = parts.findIndex(c => /^[-:=\s]+$/.test(c));
    if (sepIdx > 0) {
      let sepCount = 0;
      for (let i = sepIdx; i < parts.length; i++) {
        if (/^[-:=\s]+$/.test(parts[i])) sepCount++; else break;
      }
      const colCount = sepCount;
      if (colCount >= 2) {
        const dataParts = parts.filter(c => !/^[-:=\s]+$/.test(c));
        const rows = [];
        for (let i = 0; i < dataParts.length; i += colCount) {
          rows.push(dataParts.slice(i, i + colCount));
        }
        if (rows.length >= 2) {
          lines = rows.map(r => `| ${r.join(' | ')} |`);
        }
      }
    }
  }

  if (lines.length < 2) return <div><span className="pview-example__sql-format">(Text)</span><pre className="subtopic-code-block" style={{ margin: 0 }}><code>{content}</code></pre></div>;

  /* Filter out separator rows (contain only | - : and spaces) */
  const dataLines = lines.filter(l => !/^[|\s:\-]+$/.test(l.trim()));
  if (dataLines.length < 2) return <div><span className="pview-example__sql-format">(Text)</span><pre className="subtopic-code-block" style={{ margin: 0 }}><code>{content}</code></pre></div>;

  const parseRow = (r) => r.split('|').slice(1, -1).map(c => c.trim());

  const isTable = dataLines.length >= 2;

  return (
    <div>
      <span className="pview-example__sql-format">({isTable ? 'Table' : 'Text'})</span>
      <div className="subtopic-table-wrap">
        <table className="subtopic-table">
          <thead>
            <tr>{parseRow(dataLines[0]).map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {dataLines.slice(1).map((row, ri) => (
              <tr key={ri}>{parseRow(row).map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProblemView({ problem }) {
  const p = problem;

  return (
    <article className="pview">
      {/* ═════ PROBLEM STATEMENT ═════ */}
      <section className="pview-section">
        <h2 className="pview-section__title">Problem Statement</h2>
        <div className="pview-statement"><MarkdownRenderer content={p.problemStatement} /></div>
      </section>

      {/* ═════ EXAMPLES ═════ */}
      {p.examples?.length > 0 && (
        <section className="pview-section">
          <h2 className="pview-section__title">Examples</h2>
          <div className="pview-examples">
            {p.examples.map((ex, i) => (
              <div key={i} className="pview-example">
                <span className="pview-example__label">Example {i + 1}</span>
                {(ex.input || ex.output) && (
                  <div className="pview-example__sql">
                    {ex.input && (
                      <div className="pview-example__sql-block">
                        <span className="pview-example__sql-label">Input</span>
                        <ExampleTable content={ex.input} />
                      </div>
                    )}
                    {ex.output && (
                      <div className="pview-example__sql-block">
                        <span className="pview-example__sql-label">Output</span>
                        <ExampleTable content={ex.output} />
                      </div>
                    )}
                  </div>
                )}
                {ex.explanation && (
                  <div className="pview-example__explain">
                    <span className="pview-example__sql-label">Explanation</span>
                    <MarkdownRenderer content={ex.explanation} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═════ CONSTRAINTS ═════ */}
      {p.constraints?.length > 0 && (
        <section className="pview-section">
          <h2 className="pview-section__title">Constraints</h2>
          <ul className="pview-constraints">
            {p.constraints.map((c, i) => (
              <li key={i} className="pview-constraint">{c}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ═════ APPROACH ═════ */}
      {p.approach && (
        <section className="pview-section">
          <h2 className="pview-section__title">Approach</h2>
          <div className="pview-approach">
            <MarkdownRenderer content={p.approach} />
          </div>
        </section>
      )}

      {/* ═════ COMPLEXITY ═════ */}
      {(p.timeComplexity || p.spaceComplexity) && (
        <section className="pview-section">
          <h2 className="pview-section__title">Complexity Analysis</h2>
          <div className="pview-complexity">
            {p.timeComplexity && (
              <div className="pview-complexity__card">
                <span className="pview-complexity__icon">⏱</span>
                <div>
                  <span className="pview-complexity__label">Time</span>
                  <span className="pview-complexity__value">{p.timeComplexity}</span>
                </div>
              </div>
            )}
            {p.spaceComplexity && (
              <div className="pview-complexity__card">
                <span className="pview-complexity__icon">💾</span>
                <div>
                  <span className="pview-complexity__label">Space</span>
                  <span className="pview-complexity__value">{p.spaceComplexity}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═════ YOUTUBE VIDEO (from youtubeUrl field) ═════ */}
      {p.youtubeUrl && (
        <VideoEmbed url={p.youtubeUrl} />
      )}

      {/* ═════ MEDIA (video / images) ═════ */}
      {p.media?.length > 0 && (
        <section className="pview-section">
          <h2 className="pview-section__title">Media</h2>
          <div className="pview-media">
            {p.media.map((m, i) => (
              <div key={i} className="pview-media__item">
                {m.type === 'youtube' ? (
                  <VideoEmbed url={m.url} caption={m.caption} />
                ) : (
                  <Image src={m.url} alt={m.caption || ''} width={800} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
