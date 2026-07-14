import Cheatsheet from '../models/Cheatsheet.js';
import { clearCache } from '../middleware/cache.js';

/*
 * GET /api/cheatsheets
 * Fetch cheatsheets with optional filters: category, tag
 */
export async function getCheatsheets(req, res) {
  try {
    console.log('[CHEATSHEET] Fetching cheatsheets with filters:', req.query);
    const { category, tag, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const cheatsheets = await Cheatsheet.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Cheatsheet.countDocuments(query);

    console.log('[CHEATSHEET] Cheatsheets fetched:', total);
    res.json({ data: cheatsheets, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[CHEATSHEET] Error fetching cheatsheets:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/cheatsheets/:slug
 * Fetch a single cheatsheet by slug
 */
export async function getCheatsheetBySlug(req, res) {
  try {
    console.log('[CHEATSHEET] Fetching cheatsheet by slug:', req.params.slug);
    const cheatsheet = await Cheatsheet.findOne({ slug: req.params.slug });
    if (!cheatsheet) {
      console.log('[CHEATSHEET] Cheatsheet not found:', req.params.slug);
      return res.status(404).json({ error: 'Cheatsheet not found' });
    }
    console.log('[CHEATSHEET] Cheatsheet fetched:', cheatsheet.title);
    res.json({ data: cheatsheet });
  } catch (error) {
    console.error('[CHEATSHEET] Error fetching cheatsheet:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/cheatsheets/:slug/download
 * User: Download a cheatsheet PDF (increments download counter)
 */
export async function downloadCheatsheet(req, res) {
  try {
    console.log('[CHEATSHEET] Downloading cheatsheet:', req.params.slug);
    const cheatsheet = await Cheatsheet.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!cheatsheet) {
      console.log('[CHEATSHEET] Cheatsheet not found:', req.params.slug);
      return res.status(404).json({ error: 'Cheatsheet not found' });
    }
    console.log('[CHEATSHEET] Download count updated:', cheatsheet.downloads);
    res.json({ url: cheatsheet.pdfUrl, title: cheatsheet.title });
  } catch (error) {
    console.error('[CHEATSHEET] Error downloading cheatsheet:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/cheatsheets
 * Admin: Create a new cheatsheet
 */
export async function createCheatsheet(req, res) {
  try {
    console.log('[CHEATSHEET] Creating cheatsheet:', req.body.title);
    const cheatsheet = await Cheatsheet.create(req.body);
    clearCache();
    console.log('[CHEATSHEET] Cheatsheet created:', cheatsheet._id);
    res.status(201).json({ data: cheatsheet });
  } catch (error) {
    console.error('[CHEATSHEET] Error creating cheatsheet:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/cheatsheets/:id
 * Admin: Update a cheatsheet
 */
export async function updateCheatsheet(req, res) {
  try {
    console.log('[CHEATSHEET] Updating cheatsheet:', req.params.id);
    const cheatsheet = await Cheatsheet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cheatsheet) return res.status(404).json({ error: 'Cheatsheet not found' });
    clearCache();
    console.log('[CHEATSHEET] Cheatsheet updated:', cheatsheet._id);
    res.json({ data: cheatsheet });
  } catch (error) {
    console.error('[CHEATSHEET] Error updating cheatsheet:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/cheatsheets/:id
 * Admin: Delete a cheatsheet
 */
export async function deleteCheatsheet(req, res) {
  try {
    console.log('[CHEATSHEET] Deleting cheatsheet:', req.params.id);
    const cheatsheet = await Cheatsheet.findByIdAndDelete(req.params.id);
    if (!cheatsheet) return res.status(404).json({ error: 'Cheatsheet not found' });
    clearCache();
    console.log('[CHEATSHEET] Cheatsheet deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[CHEATSHEET] Error deleting cheatsheet:', error.message);
    res.status(500).json({ error: error.message });
  }
}
