import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce.js';

export default function SearchBar({ onSearch, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useState(() => {
    if (debouncedQuery !== undefined) onSearch?.(debouncedQuery);
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        className="search-bar__input"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button className="search-bar__btn" type="submit">Search</button>
    </form>
  );
}
