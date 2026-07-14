import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useArticleStore } from '../stores/useArticleStore.js';
import ArticleForm from '../components/admin/ArticleForm.jsx';

export default function AdminDbmsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentArticle, fetchArticleBySlug, createArticle, updateArticle } = useArticleStore();
  const isNew = !id;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) fetchArticleBySlug(id);
  }, [id]);

  const handleSave = async (data) => {
    try {
      data.category = 'dbms';
      if (isNew) {
        await createArticle(data);
      } else {
        await updateArticle(id, data);
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/dbms'), 1500);
    } catch (err) {
      console.error('[ADMIN] Error saving article:', err);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{isNew ? 'New DBMS Article' : 'Edit DBMS Article'} — Admin</title>
      </Helmet>
      <div className="listing-header">
        <h1 className="listing-header__title">{isNew ? 'Create DBMS Article' : 'Edit DBMS Article'}</h1>
      </div>
      {saved && <div className="success-text">Article saved! Redirecting...</div>}
      <ArticleForm key={currentArticle?._id || 'new'} initialData={currentArticle} onSave={handleSave} />
    </div>
  );
}
