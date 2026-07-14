export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={`input ${className}`}
        {...props}
      />
      {error && <small style={{ color: 'var(--hard-text)', marginTop: '4px', display: 'block' }}>{error}</small>}
    </div>
  );
}
