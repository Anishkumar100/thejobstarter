import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUserStore } from '../stores/useUserStore.js';
import UserGrid from '../components/users/UserGrid.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function UserSearchPage() {
  const { users, loading, error, fetchUsers } = useUserStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers({ search }); }, [search]);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-xl)' }}>
      <Helmet>
        <title>Community — TheJobStarter Users</title>
      </Helmet>

      <div className="listing-header">
        <h1 className="listing-header__title">Community</h1>
        <SearchBar onSearch={setSearch} placeholder="Search users..." />
      </div>

      {loading && <Loader text="LOADING USERS..." />}
      {error && <div className="error-text">{error}</div>}
      {!loading && !error && <UserGrid users={users} />}
    </div>
  );
}
