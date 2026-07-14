export default function Select({ label, id, options, error, className = '', ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} className={`select ${className}`} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <small style={{ color: 'var(--hard-text)', marginTop: '4px', display: 'block' }}>{error}</small>}
    </div>
  );
}
