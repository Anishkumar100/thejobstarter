/*
 * SqlTable — renders text as a clean SQL terminal-style table.
 * Parses pipe tables | col1 | col2 |, space/tab columns, or falls back
 * to a single-column table with the first line as header.
 * Every input becomes a structured table — no raw text fallback.
 */
function parseTable(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return null;

  /* Try pipe-based parsing first (with or without separator row) */
  const hasPipes = lines.some(l => l.includes('|'));
  if (hasPipes) {
    const result = tryPipeTable(lines);
    if (result) return result;
  }

  /* Try space/tab-separated (2+ spaces, tabs, then whitespace) */
  const result = trySplitTable(lines);
  if (result) return result;

  /* Last resort: single-column table, first line as header */
  return { headers: [lines[0]], rows: lines.slice(1).map(l => [l]) };
}

function tryPipeTable(lines) {
  const sepIdx = lines.findIndex(l => /^\|?\s*[-:]+\s*\|/.test(l.trim()));

  let headerLines, dataLines;
  if (sepIdx >= 0) {
    headerLines = lines.slice(0, sepIdx);
    dataLines = lines.slice(sepIdx + 1);
  } else {
    headerLines = [lines[0]];
    dataLines = lines.slice(1);
  }

  const headers = [];
  for (const line of headerLines) {
    const cleaned = line.replace(/^\|/, '').replace(/\|$/, '');
    const cells = cleaned.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length > 0) headers.push(...cells);
  }
  if (headers.length === 0) return null;

  const rows = [];
  for (const line of dataLines) {
    const cleaned = line.replace(/^\|/, '').replace(/\|$/, '');
    const cells = cleaned.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length === 0) continue;
    while (cells.length < headers.length) cells.push('');
    rows.push(cells);
  }
  if (rows.length === 0) return null;
  return { headers, rows };
}

function trySplitTable(lines) {
  const strategies = [
    l => l.split(/\s{2,}/).filter(c => c.trim()),
    l => l.split('\t').filter(c => c.trim()),
  ];

  for (const splitFn of strategies) {
    const splitLines = lines.map(l => splitFn(l).map(c => c.trim()));
    if (splitLines.length < 2) continue;
    const count = splitLines[0].length;
    if (count < 2) continue;
    if (splitLines.every(r => r.length === count)) {
      return { headers: splitLines[0], rows: splitLines.slice(1) };
    }
  }

  return null;
}

export default function SqlTable({ content }) {
  const parsed = parseTable(content);

  if (!parsed) {
    return <pre className="sql-table__plain">{content}</pre>;
  }

  return (
    <div className="sql-table-wrapper">
      <table className="sql-table">
        <thead>
          <tr>
            {parsed.headers.map((h, i) => (
              <th key={i} className="sql-table__th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="sql-table__td">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
