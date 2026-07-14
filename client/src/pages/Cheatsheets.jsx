import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCheatsheetStore } from '../stores/useCheatsheetStore.js';
import Loader from '../components/ui/Loader.jsx';

export default function Cheatsheets() {
  const { cheatsheets, loading, error, fetchCheatsheets, downloadCheatsheet } = useCheatsheetStore();

  useEffect(() => { fetchCheatsheets(); }, []);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>Cheatsheets — TheJobStarter</title>
        <meta name="description" content="Download free DSA, DBMS and OS cheatsheets in PDF format." />
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Cheatsheets</h1>
      </div>

      {loading && <Loader text="LOADING CHEATSHEETS..." />}
      {error && <div className="error-text">{error}</div>}

      {!loading && !error && (
        <div className="listing-grid">
          {cheatsheets.map(cs => (
            <div key={cs._id} className="card card--hover">
              <div className="card__header">
                <h3 className="card__title">{cs.title}</h3>
                <span className="tag">{cs.category}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>{cs.description}</p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                {cs.tags?.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <div className="card__footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{cs.downloads} downloads</span>
                <button className="btn btn--sm btn--primary" onClick={() => downloadCheatsheet(cs.slug)}>
                  {cs.premium ? 'Login to Download' : 'Download PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
