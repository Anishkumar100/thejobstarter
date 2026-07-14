import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBlogStore } from '../stores/useBlogStore.js';
import BlogForm from '../components/admin/BlogForm.jsx';

export default function AdminBlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPost, fetchPostBySlug, createPost, updatePost } = useBlogStore();
  const isNew = !id;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) fetchPostBySlug(id);
  }, [id]);

  const handleSave = async (data) => {
    try {
      if (isNew) {
        await createPost(data);
      } else {
        await updatePost(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/blog'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving post:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New Blog Post' : 'Edit Blog Post'} — Admin</title>
      </Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create Blog Post' : 'Edit Blog Post'}</h1>
      </div>
      {saved && <div className="success-text">Post saved! Redirecting...</div>}
      <BlogForm key={currentPost?._id || 'new'} initialData={currentPost} onSave={handleSave} />
    </div>
  );
}
