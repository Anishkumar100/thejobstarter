import Bookmark from '../models/Bookmark.js';

/*
 * POST /api/dsa/:slug/bookmark
 * User: Bookmark a problem
 */
export async function bookmarkProblem(req, res) {
  try {
    console.log('[BOOKMARK] Bookmarking problem:', req.params.slug);
    const Problem = (await import('../models/Problem.js')).default;
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const existing = await Bookmark.findOne({ user: req.userId, targetType: 'problem', targetId: problem._id });
    if (existing) return res.status(400).json({ error: 'Already bookmarked' });

    await Bookmark.create({
      user: req.userId,
      targetType: 'problem',
      targetId: problem._id,
      targetModel: 'Problem'
    });
    await Problem.findByIdAndUpdate(problem._id, { $inc: { bookmarks: 1 } });
    console.log('[BOOKMARK] Problem bookmarked:', req.params.slug);
    res.json({ success: true });
  } catch (error) {
    console.error('[BOOKMARK] Error bookmarking problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/dsa/:slug/bookmark
 * User: Remove bookmark from a problem
 */
export async function unbookmarkProblem(req, res) {
  try {
    console.log('[BOOKMARK] Removing bookmark from problem:', req.params.slug);
    const Problem = (await import('../models/Problem.js')).default;
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const bookmark = await Bookmark.findOneAndDelete({ user: req.userId, targetType: 'problem', targetId: problem._id });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

    await Problem.findByIdAndUpdate(problem._id, { $inc: { bookmarks: -1 } });
    console.log('[BOOKMARK] Bookmark removed from problem:', req.params.slug);
    res.json({ success: true });
  } catch (error) {
    console.error('[BOOKMARK] Error removing bookmark:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/articles/:slug/bookmark
 * User: Bookmark an article
 */
export async function bookmarkArticle(req, res) {
  try {
    console.log('[BOOKMARK] Bookmarking article:', req.params.slug);
    const Article = (await import('../models/Article.js')).default;
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const existing = await Bookmark.findOne({ user: req.userId, targetType: 'article', targetId: article._id });
    if (existing) return res.status(400).json({ error: 'Already bookmarked' });

    await Bookmark.create({
      user: req.userId,
      targetType: 'article',
      targetId: article._id,
      targetModel: 'Article'
    });
    await Article.findByIdAndUpdate(article._id, { $inc: { bookmarks: 1 } });
    console.log('[BOOKMARK] Article bookmarked:', req.params.slug);
    res.json({ success: true });
  } catch (error) {
    console.error('[BOOKMARK] Error bookmarking article:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/articles/:slug/bookmark
 * User: Remove bookmark from an article
 */
export async function unbookmarkArticle(req, res) {
  try {
    console.log('[BOOKMARK] Removing bookmark from article:', req.params.slug);
    const Article = (await import('../models/Article.js')).default;
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const bookmark = await Bookmark.findOneAndDelete({ user: req.userId, targetType: 'article', targetId: article._id });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

    await Article.findByIdAndUpdate(article._id, { $inc: { bookmarks: -1 } });
    console.log('[BOOKMARK] Bookmark removed from article:', req.params.slug);
    res.json({ success: true });
  } catch (error) {
    console.error('[BOOKMARK] Error removing bookmark:', error.message);
    res.status(500).json({ error: error.message });
  }
}
