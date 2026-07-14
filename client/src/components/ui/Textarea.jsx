export default function Textarea({ label, id, error, className = '', ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        className={`textarea ${className}`}
        {...props}
      />
      {error && <small style={{ color: 'var(--hard-text)', marginTop: '4px', display: 'block' }}>{error}</small>}
    </div>
  );
}
