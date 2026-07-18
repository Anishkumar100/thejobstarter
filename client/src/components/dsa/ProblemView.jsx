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
 * ExampleTable — renders example input/output content using MarkdownRenderer.
 * Normalizes literal \n strings to actual newlines for pipe table compatibility.
 * Falls back to a code block if MarkdownRenderer produces no table output.
 */
function ExampleTable({ content }) {
  if (!content) return null;
  /* Normalize literal \n (backslash-n) to actual newlines */
  const normalized = content.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  return (
    <div className="pview-example__rendered">
      <MarkdownRenderer noAutoBullet content={normalized} />
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
        <div className="pview-statement"><MarkdownRenderer noAutoBullet content={p.problemStatement} /></div>
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
                    <MarkdownRenderer noAutoBullet content={ex.explanation} />
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
            <MarkdownRenderer noAutoBullet content={p.approach} />
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
