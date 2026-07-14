import { useState } from 'react';
import { useQaStore } from '../../stores/useQaStore.js';
import { useToastStore } from '../../stores/useToastStore.js';
import { MailSend01Icon } from 'hugeicons-react';

export default function AnswerForm({ questionId }) {
  const { postAnswer } = useQaStore();
  const { success, error } = useToastStore();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await postAnswer(questionId, { body });
      setBody('');
      success('Your answer has been submitted! It will appear once the question author approves it.', 5000);
      console.log('[QA] Answer posted for question:', questionId);
    } catch (err) {
      console.error('[QA] Error posting answer:', err);
      error('Failed to post your answer. Please try again.', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ans-form">
      <div className="ans-form__header">
        <h2 className="ans-form__title">Your Answer</h2>
      </div>
      <div className="ans-form__body">
        <div className="ans-form__group">
          <textarea
            className="ans-form__textarea"
            rows={3}
            placeholder="Write your answer…"
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="ans-form__actions">
          <button type="submit" className="ans-form__btn" disabled={submitting || !body.trim()}>
            <MailSend01Icon size={16} />
            {submitting ? 'Posting…' : 'Post Answer'}
          </button>
        </div>
      </div>
    </form>
  );
}
