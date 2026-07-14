import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function ProblemForm({ initialData, onSave }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'easy');
  const [problemStatement, setProblemStatement] = useState(initialData?.problemStatement || '');
  const [approach, setApproach] = useState(initialData?.approach || '');
  const [timeComplexity, setTimeComplexity] = useState(initialData?.timeComplexity || '');
  const [spaceComplexity, setSpaceComplexity] = useState(initialData?.spaceComplexity || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title, slug, difficulty, problemStatement, approach, timeComplexity, spaceComplexity
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Title</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Slug</label>
        <input className="input" value={slug} onChange={e => setSlug(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Difficulty</label>
        <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="input-group">
        <label>Problem Statement</label>
        <textarea className="textarea" rows={6} value={problemStatement} onChange={e => setProblemStatement(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Approach</label>
        <textarea className="textarea" rows={4} value={approach} onChange={e => setApproach(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Time Complexity</label>
        <input className="input" value={timeComplexity} onChange={e => setTimeComplexity(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Space Complexity</label>
        <input className="input" value={spaceComplexity} onChange={e => setSpaceComplexity(e.target.value)} />
      </div>
      <Button type="submit" fullWidth>Save Problem</Button>
    </form>
  );
}
