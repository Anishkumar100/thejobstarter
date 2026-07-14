import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button.jsx';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="message-input">
      <textarea
        ref={textareaRef}
        className="textarea message-input__field"
        rows={1}
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
      />
      <Button type="submit" disabled={!text.trim()}>Send</Button>
    </form>
  );
}
