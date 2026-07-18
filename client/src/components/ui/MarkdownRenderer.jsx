/*
 * THEWEBYTES DSA WEB — MarkdownRenderer
 *
 * A reusable component that converts raw text with markdown syntax into
 * beautifully rendered content. Handles everything from simple inline
 * formatting to complex structures like pipe tables, code blocks, and
 * nested lists.
 *
 * Supported syntax:
 *   # Heading 1  |  ## Heading 2  |  ### Heading 3  |  #### Heading 4
 *   ```code blocks``` (with optional language hint)
 *   `inline code`
 *   **bold**  |  *italic*  |  _italic_  |  ***bold italic***
 *   ~~strikethrough~~
 *   [links](url)  |  bare https://urls auto-linked
 *   ![alt](image-url)
 *   | pipe table | cells |
 *   > blockquotes
 *   - unordered / * lists / 1. ordered lists (auto-grouped)
 *   - [x] task lists / - [ ] incomplete
 *   --- / *** horizontal rules
 *   term\n: definition (definition lists)
 *   : -ended lines as accent headings
 *   **Note:**, **Tip:**, **Warning:** callout boxes
 *   **bold line** as subheading
 *   **Term**: description inline definition blocks
 */

import { useMemo } from 'react';
import { BookOpen01Icon, CodeIcon } from 'hugeicons-react';

// ─── Helpers ───────────────────────────────────────────────────────

/** Escape HTML entities to prevent XSS */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Language hints map — normalise short codes to display names */
const LANG_MAP = {
  js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', ts: 'TypeScript',
  typescript: 'TypeScript', tsx: 'TSX', py: 'Python', python: 'Python',
  rb: 'Ruby', ruby: 'Ruby', go: 'Go', golang: 'Go', rs: 'Rust', rust: 'Rust',
  java: 'Java', c: 'C', cpp: 'C++', cs: 'C#', swift: 'Swift', kotlin: 'Kotlin',
  scala: 'Scala', php: 'PHP', r: 'R', html: 'HTML', css: 'CSS', scss: 'SCSS',
  sql: 'SQL', sh: 'Bash', bash: 'Bash', zsh: 'Zsh', powershell: 'PowerShell',
  json: 'JSON', xml: 'XML', yaml: 'YAML', md: 'Markdown', plain: 'Plain Text',
  text: 'Text', diff: 'Diff', dockerfile: 'Dockerfile'
};

// ─── Inline formatting ─────────────────────────────────────────────

/*
 * Apply inline markdown formatting to a string.
 * Order matters — more specific patterns first.
 * The input has already been HTML-escaped.
 */
function formatInline(text) {
  let result = text;

  /* 1. Images (before links so ![alt](url) isn't mistaken for a link) */
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="subtopic-image" loading="lazy" />'
  );

  /* 2. Links [text](url) */
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="subtopic-link" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  /* 3. Auto-link bare URLs (only http/https, avoid double-wrapping) */
  result = result.replace(
    /(?<!=")(https?:\/\/[^\s<]+)/g,
    '<a href="$1" class="subtopic-link" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  /* 4. Bold-italic ***text*** (must come before bold **) */
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  /* 5. Bold **text** */
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  /* 6. Italic *text* (single asterisk) */
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');

  /* 7. Italic _text_ (underscore — careful not to match inside words) */
  result = result.replace(/(?<=\s|^)_(.+?)_(?=\s|$|[.,!?;:])/g, '<em>$1</em>');

  /* 8. Strikethrough ~~text~~ */
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  /* 9. Inline code `text` (last so it doesn't interfere with other patterns) */
  result = result.replace(/`([^`]+)`/g, '<code class="subtopic-inline-code">$1</code>');

  return result;
}

// ─── Block-level renderer ──────────────────────────────────────────

/*
 * Transform raw markdown text into an array of React elements.
 * Every block type is handled: code, tables, headings, blockquotes,
 * lists (grouped), task lists, definition lists, HRs, and paragraphs.
 */
function renderMarkdown(text, noAutoBullet = false) {
  if (!text) {
    return (
      <div className="subtopic-empty">
        <BookOpen01Icon size={48} />
        <p>Content coming soon. Check back later or ask in the community!</p>
      </div>
    );
  }

  /* Normalise literal \n strings to actual newlines (pipe tables stored with escaped newlines) */
  let cleaned = text.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  /* Normalise AI copy-paste artifacts before parsing */
  cleaned = cleaned
    /* Replace unicode bullets with standard dash for list parser */
    .replace(/^[•▪▸◦●◆⁃‣⦿❖➢➤◇⊳⊳⋄⦁✧★]\s*/gm, '- ')
    /* Normalise arrow-starting lines to dash lists */
    .replace(/^[→⇒↪➔➜⇨⇾⇢⟶⤑⤍]\s*/gm, '- ')
    /* Normalise AI-style numbered lists: 1), (1) */
    .replace(/^\(?(\d+)\)\s+/gm, '$1. ')
    /* Strip leading/trailing whitespace per line */
    .split('\n').map(l => l.trimEnd()).join('\n');

  /* Auto-bullet: skip for quiz content (questions/options) */
  if (!noAutoBullet) {
    const autoLines = cleaned.split('\n');
    let i = 0;
    while (i < autoLines.length) {
      const line = autoLines[i].trimEnd();
      if (!line || /^[-*>\#\|`\d\.\s\[\/]/.test(line) || line.endsWith(':')) {
        i++;
        continue;
      }
      const isPoint = /^[A-Z]/.test(line) && /[.?!]$/.test(line) && line.length < 150;
      if (!isPoint) { i++; continue; }

      let count = 1;
      while (i + count < autoLines.length) {
        const next = autoLines[i + count].trimEnd();
        if (!next || /^[-*>\#\|`\d\.\s\[\/]/.test(next) || next.endsWith(':')) break;
        if (/^[A-Z]/.test(next) && /[.?!]$/.test(next) && next.length < 150) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 2) {
        for (let j = i; j < i + count; j++) {
          const trimmed = autoLines[j].trimStart();
          if (!/^[-*]\s/.test(trimmed)) {
            autoLines[j] = '- ' + trimmed;
          }
        }
        i += count;
      } else {
        i++;
      }
    }
    cleaned = autoLines.join('\n');
  }

  const lines = cleaned.split('\n');
  const elements = [];
  let paraIdx = 0; // tracks paragraph index for drop-cap

  /* ── Multi-line block state ── */
  let inCode = false;
  let codeBuf = [];
  let codeLang = '';

  let inTable = false;
  let tableBuf = [];

  /* ── List grouping state ── */
  let listType = null;      // 'ul' | 'ol' | null
  let listItems = [];       // accumulated list items
  let hadTaskList = false;  // whether current list has task items

  /* Flush a pending list group into a <ul> or <ol> */
  function flushList() {
    if (listItems.length === 0) return;
    const Tag = listType === 'ul' ? 'ul' : 'ol';
    elements.push(
      <Tag key={`list-${elements.length}`} className="subtopic-list">
        {listItems.map((item, idx) => (
          <li key={idx} className="subtopic-list__item">
            {item.taskChecked !== undefined && (
              <span className={`subtopic-task ${item.taskChecked ? 'subtopic-task--done' : ''}`}>
                {item.taskChecked ? '✓' : '○'}
              </span>
            )}
            <span dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(item.text)) }} />
          </li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
    hadTaskList = false;
  }

  /* Start or continue a list group */
  function addToList(type, text, taskChecked) {
    if (type !== listType) {
      flushList();
      listType = type;
    }
    listItems.push({ text, taskChecked });
  }

  /* Flush a collected table block into a <table> */
  function flushTable() {
    if (tableBuf.length === 0) return;
    const rows = [...tableBuf];
    const headerRow = rows[0];
    const hasSep = rows.length > 1 && /^[|\s:\-]+$/.test(rows[1].trim());
    const sepRow = hasSep ? rows[1] : null;
    const bodyRows = sepRow ? rows.slice(2) : rows.slice(1);

    function parseRow(r) {
      return r.split('|').slice(1, -1).map(c => c.trim());
    }

    const thead = (
      <thead key={`th-${elements.length}`}>
        <tr>
          {parseRow(headerRow).map((cell, ci) => (
            <th key={ci} scope="col" dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(cell)) }} />
          ))}
        </tr>
      </thead>
    );

    const tbody = (
      <tbody key={`tb-${elements.length}`}>
        {bodyRows.map((row, ri) => (
          <tr key={ri}>
            {parseRow(row).map((cell, ci) => (
              <td key={ci} dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(cell)) }} />
            ))}
          </tr>
        ))}
      </tbody>
    );

    elements.push(
      <div key={`tw-${elements.length}`} className="subtopic-table-wrap">
        <table className="subtopic-table">{thead}{tbody}</table>
      </div>
    );
    tableBuf = [];
    inTable = false;
  }

  // ── Line-by-line processing ──
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    /* ── Code blocks ── */
    if (trimmed.startsWith('```')) {
      flushList();
      if (inTable) flushTable();

      if (inCode) {
        /* End code block */
        const lang = codeLang ? (LANG_MAP[codeLang.toLowerCase()] || codeLang) : 'Code';
        elements.push(
          <pre key={`code-${i}`} className="subtopic-code-block">
            <div className="subtopic-code-block__header">
              <CodeIcon size={14} />
              <span>{lang}</span>
            </div>
            <code>{codeBuf.join('\n')}</code>
          </pre>
        );
        codeBuf = [];
        codeLang = '';
        inCode = false;
      } else {
        /* Start code block — capture language hint */
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        codeBuf = [];
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(raw);
      continue;
    }

    /* ── Pipe tables ── */
    if (trimmed.startsWith('|')) {
      flushList();
      inTable = true;
      tableBuf.push(raw);
      continue;
    }
    if (inTable) flushTable();

    /* ── Empty lines: spacer ── */
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${i}`} className="subtopic-spacer" />);
      continue;
    }

    /* ── Horizontal rules ── */
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="subtopic-hr" />);
      continue;
    }

    /* ── # Headings (h1–h4) ── */
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      const Tag = `h${level}`;
      elements.push(
        <Tag key={`h-${i}`} className={`subtopic-title-h${level}`}>
          {hMatch[2].replace(/\*\*/g, '')}
        </Tag>
      );
      continue;
    }

    /* ── Blockquotes ── */
    if (trimmed.startsWith('> ')) {
      flushList();
      const quoteText = trimmed.slice(2);
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="subtopic-blockquote"
          dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(quoteText)) }}
        />
      );
      continue;
    }

    /* ── Definition list (term  then : definition) ── */
    if (trimmed.startsWith(': ') && elements.length > 0) {
      flushList();
      const defText = trimmed.slice(2);
      elements.push(
        <dd
          key={`dd-${i}`}
          className="subtopic-definition"
          dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(defText)) }}
        />
      );
      continue;
    }

    /* ── Task list - [x] or - [ ] ── */
    const taskMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === 'x';
      addToList('ul', taskMatch[2], checked);
      hadTaskList = true;
      continue;
    }

    /* ── Unordered list - item or * item (not a task) ── */
    if (/^[-*]\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      addToList('ul', itemText);
      continue;
    }

    /* ── Ordered list 1. item ── */
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      addToList('ol', olMatch[2]);
      continue;
    }

    /* If we reach here, we're not in a list item — flush any open list */
    flushList();

    /* ── Legacy : -ended heading ── */
    if (trimmed.endsWith(':') && trimmed.length < 60) {
      elements.push(
        <h3 key={`h-${i}`} className="subtopic-heading">
          {trimmed.replace(/\*\*/g, '').replace(/:$/, '')}
        </h3>
      );
      continue;
    }

    /* ── Callout boxes: **Note:**, **Tip:**, **Warning:**, etc. ── */
    const calloutMatch = trimmed.match(/^\*\*(Note|Tip|Warning|Important|Info|Best Practice|Key Point|Reminder|Caution|Hint|Remember|Pro Tip)\*\*[:：]?\s*(.*)$/i);
    if (calloutMatch) {
      flushList();
      const calloutType = calloutMatch[1].toLowerCase().replace(/\s+/g, '-');
      const calloutBody = calloutMatch[2] || '';
      elements.push(
        <div key={`co-${i}`} className={`subtopic-callout subtopic-callout--${calloutType}`}>
          <span className="subtopic-callout__label">{calloutMatch[1]}</span>
          <span
            className="subtopic-callout__body"
            dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(calloutBody)) }}
          />
        </div>
      );
      continue;
    }

    /* ── Bold-as-subheading: line that is entirely **bold text** ── */
    const boldHeadingMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldHeadingMatch) {
      flushList();
      elements.push(
        <h4 key={`bh-${i}`} className="subtopic-title-h4 subtopic-title-h4--bold">
          {boldHeadingMatch[1]}
        </h4>
      );
      continue;
    }

    /* ── Definition pattern: **Term**: description or Term: description on its own line ── */
    const defMatch = trimmed.match(/^(?:\*\*)?([A-Z][A-Za-z0-9\s/-]+?)(?:\*\*)?[:：]\s+(.+)$/);
    if (defMatch && defMatch[1].length < 50) {
      flushList();
      const term = defMatch[1].trim();
      const defValue = defMatch[2];
      elements.push(
        <dl key={`dl-${i}`} className="subtopic-definition-block">
          <dt className="subtopic-definition-block__term">{term}</dt>
          <dd
            className="subtopic-definition-block__def"
            dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(defValue)) }}
          />
        </dl>
      );
      continue;
    }

    /* ── Regular paragraph ── */
    paraIdx++;
    const pClass = paraIdx === 1
      ? 'subtopic-paragraph subtopic-paragraph--first'
      : 'subtopic-paragraph';

    elements.push(
      <p
        key={`p-${i}`}
        className={pClass}
        dangerouslySetInnerHTML={{ __html: formatInline(escapeHtml(trimmed)) }}
      />
    );
  }

  /* Flush trailing blocks */
  if (inCode && codeBuf.length > 0) {
    const lang = codeLang ? (LANG_MAP[codeLang.toLowerCase()] || codeLang) : 'Code';
    elements.push(
      <pre key={`code-end`} className="subtopic-code-block">
        <div className="subtopic-code-block__header">
          <CodeIcon size={14} />
          <span>{lang}</span>
        </div>
        <code>{codeBuf.join('\n')}</code>
      </pre>
    );
  }
  if (inTable) flushTable();
  flushList();

  return elements;
}

// ─── Public component ──────────────────────────────────────────────

/**
 * MarkdownRenderer — turn raw markdown text into beautiful book-like content.
 *
 * Props:
 *   content       — string of raw markdown text
 *   className     — optional extra CSS class on the wrapper <div>
 *   noAutoBullet  — if true, skip the auto-bullet heuristic (use for quiz content)
 */
export default function MarkdownRenderer({ content, className = '', noAutoBullet = false }) {
  /* Wrap renderMarkdown to pass the flag via a closure param */
  const rendered = useMemo(() => renderMarkdown(content, noAutoBullet), [content, noAutoBullet]);

  return (
    <div className={`subtopic-explanation ${className}`}>
      {rendered}
    </div>
  );
}
