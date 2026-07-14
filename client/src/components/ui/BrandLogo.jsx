import { Link } from 'react-router-dom';

export default function BrandLogo({ onClick }) {
  return (
    <Link to="/" className="brand-logo" onClick={onClick}>
      <span className="brand-logo__top">
        <span className="brand-logo__rule" />
        <span className="brand-logo__the">THE</span>
        <span className="brand-logo__rule" />
      </span>
      <span className="brand-logo__main">
        <span className="brand-logo__job">JOB</span>
        <span className="brand-logo__sep" />
        <span className="brand-logo__starter">STARTER</span>
      </span>
      <span className="brand-logo__bar" />
    </Link>
  );
}
