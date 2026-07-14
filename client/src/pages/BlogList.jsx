import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useBlogStore } from '../stores/useBlogStore.js';
import { apiRequest } from '../api/client.js';
import BlogCard from '../components/blog/BlogCard.jsx';
import Loader from '../components/ui/Loader.jsx';
import { Search01Icon } from 'hugeicons-react';

export default function BlogList() {
  const { posts, loading, error, fetchPosts } = useBlogStore();
  const [search, setSearch] = useState('');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  /* Fetch blog hero image from site config */
  useEffect(() => {
    apiRequest('/site-config/public')
      .then(res => { if (res.data?.blogHeroImage) setHeroImage(res.data.blogHeroImage); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q) ||
      p.author?.name?.toLowerCase().includes(q)
    );
  }, [posts, search]);

  return (
    <div className="blog-page">
      <Helmet>
        <title>Blog — TheJobStarter</title>
        <meta name="description" content="Placement preparation tips, interview experiences, and study strategies." />
      </Helmet>

      {/* Hero — full-viewport height with background image */}
      <section className="blog-hero">
        {heroImage && <div className="blog-hero__bg" style={{ backgroundImage: `url(${heroImage})` }} />}
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content">
          <span className="blog-hero__supertitle">TheWebytes</span>
          <h1 className="blog-hero__title">Blog</h1>
          <p className="blog-hero__desc">
            Placement preparation tips, interview experiences, and study strategies.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <div className="blog-toolbar">
        <div className="blog-search">
          <Search01Icon size={18} />
          <input
            className="blog-search__input"
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="blog-count">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Content */}
      <section className="blog-content">
        {loading && <Loader text="LOADING POSTS..." />}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
          <div className="blog-grid">
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <BlogCard post={p} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="blog-empty">
            <p>{search ? `No posts match "${search}".` : 'No posts yet.'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
