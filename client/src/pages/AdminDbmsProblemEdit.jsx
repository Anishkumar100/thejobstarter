import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDbmsStore } from '../stores/useDbmsStore.js';
import { useLanguageStore } from '../stores/useLanguageStore.js';
import { apiRequest } from '../api/client.js';
import { DIFFICULTIES } from '../utils/constants.js';
import { useDbmsMetaStore } from '../stores/useDbmsMetaStore.js';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';

export default function AdminDbmsProblemEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  /* Pre-fill from query params (?lesson=...&subtopic=...) when creating */
  const presetLesson = searchParams.get('lesson') || '';
  const presetSubtopic = searchParams.get('subtopic') || '';
  const {
    lessons, fetchLessons,
    subtopics, fetchSubtopics,
    problems, fetchProblems,
    createProblem, updateProblem
  } = useDbmsStore();
  const { topics: metaTopics, companies: metaCompanies, fetchAllMeta } = useDbmsMetaStore();
  const { languages: langOptions, fetchLanguages } = useLanguageStore();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [lessonSlug, setLessonSlug] = useState(presetLesson);
  const [subtopicSlug, setSubtopicSlug] = useState(presetSubtopic);
  const [difficulty, setDifficulty] = useState('easy');
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [problemStatement, setProblemStatement] = useState('');
  const [approach, setApproach] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pptxUrl, setPptxUrl] = useState('');
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [constraints, setConstraints] = useState(['']);
  const [codeBlocks, setCodeBlocks] = useState([{ language: 'python', code: '' }]);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  /*
   * Generic file upload to ImageKit — returns URL and sets the provided setter
   */
  const handleFileUpload = async (setter, prefix) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await apiRequest('/media/upload', {
            method: 'POST',
            body: JSON.stringify({ file: reader.result, fileName: `${prefix}-${(slug || 'new').slice(0, 20)}-${Date.now()}` })
          });
          setter(res.url);
        } catch (err) {
          console.error('[ADMIN] Upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  /*
   * Fetch lessons and meta on mount
   */
  useEffect(() => { fetchLessons(); fetchAllMeta(); fetchLanguages(); }, []);

  /*
   * Load subtopics when lesson changes
   */
  useEffect(() => {
    if (lessonSlug) fetchSubtopics({ lesson: lessonSlug });
  }, [lessonSlug]);

  /*
   * Edit mode: load existing problem
   */
  useEffect(() => {
    if (id) {
      fetchProblems({ limit: 200 });
    }
  }, [id]);

  /*
   * If editing, populate form fields from existing problem
   */
  useEffect(() => {
    if (!isNew && problems.length > 0) {
      const existing = problems.find(p => p._id === id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setLessonSlug(existing.lessonSlug || '');
        setSubtopicSlug(existing.subtopicSlug || '');
        setDifficulty(existing.difficulty);
        setTopics(existing.topics || []);
        setCompanies(existing.companies || []);
        setProblemStatement(existing.problemStatement || '');
        setApproach(existing.approach || '');
        setTimeComplexity(existing.timeComplexity || '');
        setSpaceComplexity(existing.spaceComplexity || '');
        setYoutubeUrl(existing.youtubeUrl || '');
        setPdfUrl(existing.pdfUrl || '');
        setPptxUrl(existing.pptxUrl || '');
        setExamples(existing.examples?.length ? existing.examples : [{ input: '', output: '', explanation: '' }]);
        setConstraints(existing.constraints?.length ? existing.constraints : ['']);
        setCodeBlocks(existing.codeBlocks?.length ? existing.codeBlocks : [{ language: 'python', code: '' }]);
      }
    }
  }, [id, problems]);

  /*
   * Toggle a topic in the selected topics array
   */
  const toggleTopic = (t) => {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  /*
   * Toggle a company in the selected companies array
   */
  const toggleCompany = (c) => {
    setCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  /*
   * Update a single field of an example at the given index
   */
  const handleExample = (i, field, value) => {
    setExamples(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  /*
   * Add a new empty example row
   */
  const addExample = () => setExamples(prev => [...prev, { input: '', output: '', explanation: '' }]);

  /*
   * Update a constraint at the given index
   */
  const handleConstraint = (i, value) => {
    setConstraints(prev => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  /*
   * Add a new empty constraint input
   */
  const addConstraint = () => setConstraints(prev => [...prev, '']);

  /*
   * Update a single field of a code block at the given index
   */
  const handleCodeBlock = (i, field, value) => {
    setCodeBlocks(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  /*
   * Add a new empty code block entry
   */
  const addCodeBlock = () => setCodeBlocks(prev => [...prev, { language: 'python', code: '' }]);

  /*
   * Save the problem — create or update depending on isNew
   */
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title, slug, lessonSlug, subtopicSlug, difficulty,
        topics, companies, problemStatement, approach,
        timeComplexity, spaceComplexity, youtubeUrl, pdfUrl, pptxUrl,
        examples: examples.filter(ex => ex.input || ex.output),
        constraints: constraints.filter(c => c.trim()),
        codeBlocks: codeBlocks.filter(cb => cb.code.trim())
      };
      if (isNew) {
        await createProblem(data);
      } else {
        await updateProblem(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/dbms/problems'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving problem:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Problem' : 'Edit Problem'} — Admin TheJobStarter</title>
      </Helmet>

      {/* Breadcrumb: DBMS umbrella */}
      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/dbms">DBMS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <Link to="/admin/dbms/problems">Problems</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <span>{isNew ? 'New' : 'Edit'}</span>
      </nav>

      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create Problem' : 'Edit Problem'}</h1>
      </div>

      {saved && <div className="success-text">Problem saved! Redirecting...</div>}

      <form onSubmit={handleSave} className="admin-form">
        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Slug</label>
            <input className="input" value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Lesson</label>
            <select className="select" value={lessonSlug} onChange={e => setLessonSlug(e.target.value)} required>
              <option value="">Select lesson...</option>
              {lessons.map(l => <option key={l._id} value={l.slug}>{l.title}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Subtopic (optional)</label>
            <select className="select" value={subtopicSlug} onChange={e => setSubtopicSlug(e.target.value)}>
              <option value="">No subtopic</option>
              {subtopics.map(s => <option key={s._id} value={s.slug}>{s.title}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Difficulty</label>
            <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Time Complexity</label>
            <input className="input" value={timeComplexity} onChange={e => setTimeComplexity(e.target.value)} placeholder="O(n)" />
          </div>
          <div className="input-group">
            <label>Space Complexity</label>
            <input className="input" value={spaceComplexity} onChange={e => setSpaceComplexity(e.target.value)} placeholder="O(1)" />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>YouTube URL (embed link)</label>
            <input className="input" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
          </div>
          <div className="input-group">
            <label>PDF URL</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="input" style={{ flex: 1 }} value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="ImageKit PDF URL" />
              <button type="button" className="btn btn--sm" onClick={() => handleFileUpload(setPdfUrl, 'pdf')} disabled={uploading}>
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>PPTX URL</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="input" style={{ flex: 1 }} value={pptxUrl} onChange={e => setPptxUrl(e.target.value)} placeholder="ImageKit PPTX URL" />
              <button type="button" className="btn btn--sm" onClick={() => handleFileUpload(setPptxUrl, 'pptx')} disabled={uploading}>
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
          <label>Problem Statement</label>
          <textarea className="input textarea--lg" rows={5} value={problemStatement} onChange={e => setProblemStatement(e.target.value)} required />
          {problemStatement && (
            <div style={{ marginTop: 'var(--space-sm)', border: '3px solid var(--border-color)', padding: 'var(--space-md)', background: 'var(--bg-surface)' }}>
              <label style={{ marginBottom: 'var(--space-sm)', fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</label>
              <MarkdownRenderer content={problemStatement} />
            </div>
          )}
        </div>

        <div className="input-group">
          <label>Approach</label>
          <textarea className="input textarea--lg" rows={4} value={approach} onChange={e => setApproach(e.target.value)} />
        </div>

        {/* Topics */}
        <div className="input-group">
          <label>Topics</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {metaTopics.map(t => (
              <button key={t} type="button"
                className={`btn btn--tag ${topics.includes(t) ? 'btn--tag-active' : ''}`}
                onClick={() => toggleTopic(t)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Companies */}
        <div className="input-group">
          <label>Companies</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {metaCompanies.map(c => (
              <button key={c} type="button"
                className={`btn btn--tag ${companies.includes(c) ? 'btn--tag-active' : ''}`}
                onClick={() => toggleCompany(c)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="input-group">
          <label>Examples</label>
          {examples.map((ex, i) => (
            <div key={i} className="admin-form__example-row">
              <div className="admin-form__example-io">
                <textarea className="input textarea--lg" rows={8} placeholder="Input — pipe table or plain text" value={ex.input} onChange={e => handleExample(i, 'input', e.target.value)} />
                <textarea className="input textarea--lg" rows={8} placeholder="Output — pipe table or plain text" value={ex.output} onChange={e => handleExample(i, 'output', e.target.value)} />
              </div>
              <div className="admin-form__example-explain">
                <textarea className="input textarea--lg" rows={5} placeholder="Explanation (optional)" value={ex.explanation} onChange={e => handleExample(i, 'explanation', e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" className="btn btn--sm" onClick={addExample}>+ Add Example</button>
        </div>

        {/* Constraints */}
        <div className="input-group">
          <label>Constraints</label>
          {constraints.map((c, i) => (
            <textarea key={i} className="input" style={{ marginBottom: '4px', minHeight: '44px' }} rows={2} value={c} onChange={e => handleConstraint(i, e.target.value)} placeholder="e.g., 1 <= n <= 10^5" />
          ))}
          <button type="button" className="btn btn--sm" onClick={addConstraint}>+ Add Constraint</button>
        </div>

        {/* Code Blocks */}
        <div className="input-group">
          <label>Code Solutions</label>
          {codeBlocks.map((cb, i) => (
            <div key={i} style={{ marginBottom: 'var(--space-md)', border: '3px solid var(--border-color)', padding: 'var(--space-sm)' }}>
              <select className="select" style={{ marginBottom: '8px' }} value={cb.language} onChange={e => handleCodeBlock(i, 'language', e.target.value)}>
                {langOptions.map(l => (
                  <option key={l.slug} value={l.slug}>{l.name}</option>
                ))}
              </select>
              <textarea className="input textarea--lg" rows={8} value={cb.code} onChange={e => handleCodeBlock(i, 'code', e.target.value)} placeholder="// Your code here..." style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
          ))}
          <button type="button" className="btn btn--sm" onClick={addCodeBlock}>+ Add Language</button>
        </div>

        <button type="submit" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
          {isNew ? 'Create Problem' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
