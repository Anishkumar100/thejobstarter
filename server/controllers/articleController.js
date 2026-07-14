import mongoose from 'mongoose';
import Article from '../models/Article.js';
import { clearCache } from '../middleware/cache.js';

/*
 * GET /api/articles?category=dbms|os
 * Fetch articles filtered by category, with optional topic and search
 */
export async function getArticles(req, res) {
  try {
    console.log('[ARTICLE] Fetching articles with filters:', req.query);
    const { category, topic, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const articles = await Article.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Article.countDocuments(query);

    console.log('[ARTICLE] Articles fetched:', total);
    res.json({ data: articles, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[ARTICLE] Error fetching articles:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/articles/:slug
 * Fetch single article by slug, increment view count
 */
export async function getArticleBySlug(req, res) {
  try {
    const { slug } = req.params;
    console.log('[ARTICLE] Fetching article by slug/id:', slug);
    let article;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      article = await Article.findById(slug);
    }
    if (!article) {
      article = await Article.findOne({ slug });
    }
    if (!article) {
      console.log('[ARTICLE] Article not found:', slug);
      return res.status(404).json({ error: 'Article not found' });
    }
    await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    console.log('[ARTICLE] Article fetched:', article.title);
    res.json({ data: article });
  } catch (error) {
    console.error('[ARTICLE] Error fetching article:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/articles
 * Admin: Create a new article (DBMS or OS)
 */
export async function createArticle(req, res) {
  try {
    console.log('[ARTICLE] Creating article:', req.body.title);
    const article = await Article.create(req.body);
    clearCache();
    console.log('[ARTICLE] Article created:', article._id);
    res.status(201).json({ data: article });
  } catch (error) {
    console.error('[ARTICLE] Error creating article:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/articles/:id
 * Admin: Update an existing article
 */
export async function updateArticle(req, res) {
  try {
    console.log('[ARTICLE] Updating article:', req.params.id);
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    clearCache();
    console.log('[ARTICLE] Article updated:', article._id);
    res.json({ data: article });
  } catch (error) {
    console.error('[ARTICLE] Error updating article:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/articles/:id
 * Admin: Delete an article
 */
export async function deleteArticle(req, res) {
  try {
    console.log('[ARTICLE] Deleting article:', req.params.id);
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    clearCache();
    console.log('[ARTICLE] Article deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[ARTICLE] Error deleting article:', error.message);
    res.status(500).json({ error: error.message });
  }
}
