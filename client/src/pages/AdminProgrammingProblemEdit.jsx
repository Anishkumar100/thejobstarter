import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProgrammingStore } from '../stores/useProgrammingStore.js';
import { useLanguageStore } from '../stores/useLanguageStore.js';
import { apiRequest } from '../api/client.js';
import { DIFFICULTIES } from '../utils/constants.js';
import MarkdownRenderer from '../components/ui/MarkdownRenderer.jsx';
import QuizEditor from '../components/quiz/QuizEditor.jsx';

export default function AdminProgrammingProblemEdit() {
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
  } = useProgrammingStore();
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

  useEffect(() => {
    fetchLessons();
    fetchSubtopics();
    fetchProblems({ limit: 200 });
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (id) {
      const existing = problems.find(p => p._id === id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setLessonSlug(existing.lessonSlug || presetLesson);
        setSubtopicSlug(existing.subtopicSlug || presetSubtopic);
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

  const handleUpload = async (fieldSetter) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await apiRequest('/media/upload', {
            method: 'POST',
            body: JSON.stringify({ file: reader.result, fileName: `prog-problem-${slug || 'new'}-${Date.now()}` })
          });
          fieldSetter(res.url);
        } catch (err) {
          console.error('[ADMIN] Upload failed:', err.message);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const filteredExamples = examples.filter(ex => ex.input || ex.output);
      const filteredConstraints = constraints.filter(c => c.trim());
      const filteredCode = codeBlocks.filter(cb => cb.code.trim());
      const data = {
        title, slug, lessonSlug, subtopicSlug, difficulty,
        topics, companies, problemStatement, approach,
        timeComplexity, spaceComplexity, youtubeUrl, pdfUrl, pptxUrl,
        examples: filteredExamples.length ? filteredExamples : undefined,
        constraints: filteredConstraints.length ? filteredConstraints : undefined,
        codeBlocks: filteredCode.length ? filteredCode : undefined
      };
      if (isNew) {
        await createProblem(data);
      } else {
        await updateProblem(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/programming/problems'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving problem:', err);
    }
  };

  const availableSubtopics = subtopics.filter(s => s.lessonSlug === lessonSlug);

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Problem' : 'Edit Problem'} — Admin TheJobStarter</title>
      </Helmet>

      <nav className="admin-breadcrumb" style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/admin/programming">Programming</Link>
        <span className="admin-breadcrumb__sep">/</span>
        <Link to="/admin/programming/problems">Problems</Link>
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
            <select className="select" value={lessonSlug} onChange={e => { setLessonSlug(e.target.value); setSubtopicSlug(''); }}>
              <option value="">Select lesson</option>
              {lessons.map(l => <option key={l._id} value={l.slug}>{l.title}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Subtopic</label>
            <select className="select" value={subtopicSlug} onChange={e => setSubtopicSlug(e.target.value)}>
              <option value="">None</option>
              {availableSubtopics.map(s => <option key={s._id} value={s.slug}>{s.title}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Difficulty</label>
            <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Topics & Companies</h3>
          <div className="input-group">
            <label>Topics (comma-separated)</label>
            <input className="input" value={topics.join(', ')} onChange={e => setTopics(e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Arrays, Strings, Recursion" />
          </div>
          <div className="input-group">
            <label>Companies (comma-separated)</label>
            <input className="input" value={companies.join(', ')} onChange={e => setCompanies(e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Amazon, Google, Meta" />
          </div>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Content</h3>
          <div className="input-group">
            <label>Problem Statement (Markdown)</label>
            <textarea className="input" rows={8} value={problemStatement} onChange={e => setProblemStatement(e.target.value)} />
            {problemStatement && (
              <div style={{ marginTop: 'var(--space-sm)', border: '1px solid var(--border-color)', padding: 'var(--space-md)' }}>
                <strong>Preview:</strong>
                <MarkdownRenderer content={problemStatement} />
              </div>
            )}
          </div>
          <div className="input-group">
            <label>Approach (Markdown)</label>
            <textarea className="input" rows={6} value={approach} onChange={e => setApproach(e.target.value)} />
          </div>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Examples</h3>
          {examples.map((ex, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input className="input" placeholder="Input" value={ex.input} onChange={e => { const copy = [...examples]; copy[i].input = e.target.value; setExamples(copy); }} />
              <input className="input" placeholder="Output" value={ex.output} onChange={e => { const copy = [...examples]; copy[i].output = e.target.value; setExamples(copy); }} />
              <input className="input" placeholder="Explanation (optional)" value={ex.explanation} onChange={e => { const copy = [...examples]; copy[i].explanation = e.target.value; setExamples(copy); }} />
              <button type="button" className="btn btn--sm btn--danger" onClick={() => setExamples(examples.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="btn btn--sm" onClick={() => setExamples([...examples, { input: '', output: '', explanation: '' }])}>+ Add Example</button>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Constraints (one per line)</h3>
          {constraints.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <input className="input" value={c} onChange={e => { const copy = [...constraints]; copy[i] = e.target.value; setConstraints(copy); }} />
              <button type="button" className="btn btn--sm btn--danger" onClick={() => setConstraints(constraints.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="btn btn--sm" onClick={() => setConstraints([...constraints, ''])}>+ Add Constraint</button>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Code Solutions</h3>
          {codeBlocks.map((cb, i) => (
            <div key={i} style={{ marginBottom: '12px', border: '1px solid var(--border-color)', padding: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <select className="select" value={cb.language} onChange={e => { const copy = [...codeBlocks]; copy[i].language = e.target.value; setCodeBlocks(copy); }}>
                  {(langOptions || []).map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
                <button type="button" className="btn btn--sm btn--danger" onClick={() => setCodeBlocks(codeBlocks.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <textarea className="input" rows={8} value={cb.code} onChange={e => { const copy = [...codeBlocks]; copy[i].code = e.target.value; setCodeBlocks(copy); }} />
            </div>
          ))}
          <button type="button" className="btn btn--sm" onClick={() => setCodeBlocks([...codeBlocks, { language: 'python', code: '' }])}>+ Add Language</button>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Complexity</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Time Complexity</label>
              <input className="input" value={timeComplexity} onChange={e => setTimeComplexity(e.target.value)} placeholder="O(n log n)" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Space Complexity</label>
              <input className="input" value={spaceComplexity} onChange={e => setSpaceComplexity(e.target.value)} placeholder="O(n)" />
            </div>
          </div>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Media & Downloads</h3>
          <div className="input-group">
            <label>YouTube URL</label>
            <input className="input" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
          </div>
          <div className="input-group">
            <label>PDF URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" style={{ flex: 1 }} value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
              <button type="button" className="btn btn--sm" onClick={() => handleUpload(setPdfUrl)} disabled={uploading}>{uploading ? '...' : 'Upload'}</button>
            </div>
          </div>
          <div className="input-group">
            <label>PPTX URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" style={{ flex: 1 }} value={pptxUrl} onChange={e => setPptxUrl(e.target.value)} />
              <button type="button" className="btn btn--sm" onClick={() => handleUpload(setPptxUrl)} disabled={uploading}>{uploading ? '...' : 'Upload'}</button>
            </div>
          </div>
        </div>

        <div className="admin-form-section" style={{ marginTop: 'var(--space-lg)' }}>
          <h3>Quiz</h3>
          {!isNew && <QuizEditor problemId={id} problemModel="ProgrammingProblem" />}
          {isNew && <p style={{ color: 'var(--text-tertiary)' }}>Save the problem first to add a quiz.</p>}
        </div>

        <div style={{ marginTop: 'var(--space-lg)' }}>
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>Save Problem</button>
        </div>
      </form>
    </div>
  );
}
