import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import { clearCache } from '../middleware/cache.js';

/*
 * GET /api/dsa/subtopics
 * Fetch subtopics, optionally filtered by lessonSlug
 */
export async function getSubtopics(req, res) {
  try {
    console.log('[DSA] Fetching subtopics with filters:', req.query);
    const { lesson } = req.query;
    const query = {};
    if (lesson) query.lessonSlug = lesson;
    const subtopics = await Subtopic.find(query).sort({ order: 1, title: 1 });
    console.log('[DSA] Subtopics fetched:', subtopics.length);
    res.json({ data: subtopics });
  } catch (error) {
    console.error('[DSA] Error fetching subtopics:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/dsa/subtopics/:slug
 * Fetch a single subtopic with its problems
 */
export async function getSubtopicBySlug(req, res) {
  try {
    console.log('[DSA] Fetching subtopic by slug:', req.params.slug);
    const subtopic = await Subtopic.findOne({ slug: req.params.slug });
    if (!subtopic) {
      console.log('[DSA] Subtopic not found:', req.params.slug);
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    const problems = await Problem.find({ subtopicSlug: req.params.slug }).sort({ createdAt: -1 });
    console.log('[DSA] Subtopic fetched:', subtopic.title, 'with', problems.length, 'problems');
    res.json({ data: { ...subtopic.toObject(), problems } });
  } catch (error) {
    console.error('[DSA] Error fetching subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dsa/subtopics
 * Admin: Create a new subtopic
 */
export async function createSubtopic(req, res) {
  try {
    console.log('[DSA] Creating subtopic:', req.body.title);
    const subtopic = await Subtopic.create(req.body);
    clearCache();
    console.log('[DSA] Subtopic created:', subtopic._id);
    res.status(201).json({ data: subtopic });
  } catch (error) {
    console.error('[DSA] Error creating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/dsa/subtopics/:id
 * Admin: Update a subtopic
 */
export async function updateSubtopic(req, res) {
  try {
    console.log('[DSA] Updating subtopic:', req.params.id);
    const subtopic = await Subtopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[DSA] Subtopic updated:', subtopic._id);
    res.json({ data: subtopic });
  } catch (error) {
    console.error('[DSA] Error updating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/dsa/subtopics/:id
 * Admin: Delete a subtopic
 */
export async function deleteSubtopic(req, res) {
  try {
    console.log('[DSA] Deleting subtopic:', req.params.id);
    const subtopic = await Subtopic.findByIdAndDelete(req.params.id);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[DSA] Subtopic deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DSA] Error deleting subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/dsa/subtopics/:slug/problems
 * Fetch problems for a specific subtopic (alternative to filtering on /problems)
 */
export async function getSubtopicProblems(req, res) {
  try {
    console.log('[DSA] Fetching problems for subtopic:', req.params.slug);
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const problems = await Problem.find({ subtopicSlug: req.params.slug }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Problem.countDocuments({ subtopicSlug: req.params.slug });
    console.log('[DSA] Subtopic problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[DSA] Error fetching subtopic problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}
