import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useOsStore } from '../stores/useOsStore.js';
import { apiRequest } from '../api/client.js';
import { DIFFICULTIES } from '../utils/constants.js';
import { useOsMetaStore } from '../stores/useOsMetaStore.js';
import QuizEditor from '../components/quiz/QuizEditor.jsx';

export default function AdminOsProblemEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetLesson = searchParams.get('lesson') || '';
  const presetSubtopic = searchParams.get('subtopic') || '';
  const {
    lessons, fetchLessons,
    subtopics, fetchSubtopics,
    problems, fetchProblems,
    createProblem, updateProblem
  } = useOsStore();
  const { topics: metaTopics, companies: metaCompanies, fetchAllMeta } = useOsMetaStore();
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
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* Generic file upload to ImageKit */
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

  /* Fetch lessons, subtopics, and meta on mount */
  useEffect(() => { fetchLessons(); fetchAllMeta(); }, []);

  /* Load subtopics when lesson changes */
  useEffect(() => {
    if (lessonSlug) fetchSubtopics({ lesson: lessonSlug });
  }, [lessonSlug]);

  /* Edit mode: load existing problem */
  useEffect(() => {
    if (id) { fetchProblems({ limit: 200 }); }
  }, [id]);

  /* If editing, populate form fields from existing problem */
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
      }
    }
  }, [id, problems]);

  const toggleTopic = (t) => {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleCompany = (c) => {
    setCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleExample = (i, field, value) => {
    setExamples(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const addExample = () => setExamples(prev => [...prev, { input: '', output: '', explanation: '' }]);

  const handleConstraint = (i, value) => {
    setConstraints(prev => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const addConstraint = () => setConstraints(prev => [...prev, '']);

  /* Save the problem — no codeBlocks for OS (conceptual only) */
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title, slug, lessonSlug, subtopicSlug, difficulty,
        topics, companies, problemStatement, approach,
        timeComplexity, spaceComplexity, youtubeUrl, pdfUrl, pptxUrl,
        examples: examples.filter(ex => ex.input || ex.output),
        constraints: constraints.filter(c => c.trim())
      };
      if (isNew) {
        await createProblem(data);
      } else {
        await updateProblem(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/os/problems'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving problem:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Problem' : 'Edit Problem'} — Admin TheJobStarter</title>
      </Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/os">OS</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <Link to="/admin/os/problems">Problems</Link>
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
                <textarea className="input textarea--lg" rows={8} placeholder="Input — pipe table or plain text" value={ex.input} onChange={e => handleExample(i, 'input', e.target.value)} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} />
                <textarea className="input textarea--lg" rows={8} placeholder="Output — pipe table or plain text" value={ex.output} onChange={e => handleExample(i, 'output', e.target.value)} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} />
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

        {/* ═══ MCQ QUIZ EDITOR ═══ */}
        {id && <QuizEditor problemId={id} problemModel="OsProblem" />}

        <button type="submit" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
          {isNew ? 'Create Problem' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
