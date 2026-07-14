import { DIFFICULTIES } from '../../utils/constants.js';
import { useMetaStore } from '../../stores/useMetaStore.js';

export default function FilterBar({ activeDifficulty, activeTopic, activeCompany, onDifficultyChange, onTopicChange, onCompanyChange }) {
  const { topics, companies } = useMetaStore();

  return (
    <div className="listing-filters">
      {DIFFICULTIES.map(d => (
        <button
          key={d}
          className={`listing-filters__btn ${activeDifficulty === d ? 'listing-filters__btn--active' : ''}`}
          onClick={() => onDifficultyChange(activeDifficulty === d ? '' : d)}
        >
          {d}
        </button>
      ))}
      <select className="select" style={{ width: 'auto', minWidth: '140px' }} value={activeTopic} onChange={e => onTopicChange(e.target.value)}>
        <option value="">All Topics</option>
        {topics.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select className="select" style={{ width: 'auto', minWidth: '140px' }} value={activeCompany} onChange={e => onCompanyChange(e.target.value)}>
        <option value="">All Companies</option>
        {companies.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}
