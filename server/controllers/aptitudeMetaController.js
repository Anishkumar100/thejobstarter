import AptitudeMeta from '../models/AptitudeMeta.js';
import { clearCache } from '../middleware/cache.js';

/*
 * GET /api/aptitude-meta
 * Fetch all meta entries, optionally filtered by type (?type=category)
 */
export async function getAptitudeMeta(req, res) {
  try {
    console.log('[APT-META] Fetching meta...');
    const query = {};
    if (req.query.type) query.type = req.query.type;
    const items = await AptitudeMeta.find(query).sort({ order: 1, value: 1 });
    console.log('[APT-META] Meta fetched:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[APT-META] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/aptitude-meta
 * Admin: create a new meta entry
 */
export async function createAptitudeMeta(req, res) {
  try {
    console.log('[APT-META] Creating:', req.body);
    const item = await AptitudeMeta.create(req.body);
    clearCache();
    res.status(201).json({ data: item });
  } catch (error) {
    console.error('[APT-META] Error creating:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/aptitude-meta/:id
 * Admin: update a meta entry
 */
export async function updateAptitudeMeta(req, res) {
  try {
    console.log('[APT-META] Updating:', req.params.id);
    const item = await AptitudeMeta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    clearCache();
    res.json({ data: item });
  } catch (error) {
    console.error('[APT-META] Error updating:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/aptitude-meta/:id
 * Admin: delete a meta entry
 */
export async function deleteAptitudeMeta(req, res) {
  try {
    console.log('[APT-META] Deleting:', req.params.id);
    const item = await AptitudeMeta.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    clearCache();
    res.json({ success: true });
  } catch (error) {
    console.error('[APT-META] Error deleting:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/aptitude-meta/seed
 * Admin: seed default categories
 */
export async function seedAptitudeMeta(req, res) {
  try {
    console.log('[APT-META] Seeding defaults...');
    const defaults = [
      { type: 'category', value: 'quantitative', label: 'Quantitative Aptitude', order: 1 },
      { type: 'category', value: 'logical', label: 'Logical Reasoning', order: 2 },
      { type: 'category', value: 'verbal', label: 'Verbal Ability', order: 3 },
      { type: 'category', value: 'data-interpretation', label: 'Data Interpretation', order: 4 }
    ];
    for (const d of defaults) {
      await AptitudeMeta.findOneAndUpdate(
        { type: d.type, value: d.value },
        d,
        { upsert: true, new: true }
      );
    }
    clearCache();
    const items = await AptitudeMeta.find().sort({ order: 1 });
    console.log('[APT-META] Seeded:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[APT-META] Error seeding:', error.message);
    res.status(500).json({ error: error.message });
  }
}
