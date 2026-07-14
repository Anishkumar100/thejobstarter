import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQaStore } from '../stores/useQaStore.js';
import { useToastStore } from '../stores/useToastStore.js';
import { ArrowLeft01Icon, PlusSignIcon } from 'hugeicons-react';

const APPROVAL_QUOTES = [
  'Your question has been sent for review. Our code monkeys will check its credibility while sipping coffee. 🐒☕',
  'Question received! The wisdom committee is convening to decide its fate. Expect a verdict soon!',
  'Your question is now in the approval queue. Our team of experts is debating its brilliance as we speak.',
  'Question dropped! It\'s now being examined under a microscope by our quality assurance gnomes.',
  'Hold tight! Your question is being reviewed by the Council of Elders. You\'ll hear back soon!'
];

export default function AskQuestion() {
  const navigate = useNavigate();
  const { askQuestion } = useQaStore();
  const addToast = useToastStore(state => state.addToast);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await askQuestion({
        title,
        body,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      const quote = APPROVAL_QUOTES[Math.floor(Math.random() * APPROVAL_QUOTES.length)];
      addToast(quote, 'info');
      navigate('/qa');
    } catch (err) {
      console.error('[QA] Error creating question:', err);
      addToast('Failed to post question. Try again!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ask-page">
      <Helmet>
        <title>Ask a Question — TheJobStarter</title>
      </Helmet>

      <Link to="/qa" className="ask-back">
        <ArrowLeft01Icon size={16} />
        Back to Q&A
      </Link>

      <div className="ask-card">
        <h1 className="ask-card__title">Ask a Question</h1>
        <p className="ask-card__desc">
          Be specific — include what you've tried, your code, and where you're stuck.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="ask-card__group">
            <label htmlFor="ask-title">Title</label>
            <input
              id="ask-title"
              className="ask-card__input"
              placeholder="What's your question? Be clear and specific."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="ask-card__group">
            <label htmlFor="ask-body">Body</label>
            <textarea
              id="ask-body"
              className="ask-card__textarea"
              rows={8}
              placeholder="Describe your question in detail — include code snippets, error messages, and what you've tried."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="ask-card__group">
            <label htmlFor="ask-tags">Tags</label>
            <input
              id="ask-tags"
              className="ask-card__input"
              placeholder="e.g. DSA, arrays, sorting, time-complexity (comma-separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className="ask-card__btn" disabled={submitting || !title.trim() || !body.trim()}>
            <PlusSignIcon size={16} />
            {submitting ? 'Posting…' : 'Post Question'}
          </button>
        </form>
      </div>
    </div>
  );
}
