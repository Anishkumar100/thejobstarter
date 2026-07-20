import ProgrammingMeta from '../models/ProgrammingMeta.js';
import { clearCache } from '../middleware/cache.js';

/*
 * GET /api/programming-meta
 * Fetch all meta entries, optionally filtered by type (?type=category)
 */
export async function getProgrammingMeta(req, res) {
  try {
    console.log('[PROG-META] Fetching meta...');
    const query = {};
    if (req.query.type) query.type = req.query.type;
    const items = await ProgrammingMeta.find(query).sort({ order: 1, value: 1 });
    console.log('[PROG-META] Meta fetched:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[PROG-META] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/programming-meta
 * Admin: create a new meta entry
 */
export async function createProgrammingMeta(req, res) {
  try {
    console.log('[PROG-META] Creating:', req.body);
    const item = await ProgrammingMeta.create(req.body);
    clearCache();
    res.status(201).json({ data: item });
  } catch (error) {
    console.error('[PROG-META] Error creating:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/programming-meta/:id
 * Admin: update a meta entry
 */
export async function updateProgrammingMeta(req, res) {
  try {
    console.log('[PROG-META] Updating:', req.params.id);
    const item = await ProgrammingMeta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    clearCache();
    res.json({ data: item });
  } catch (error) {
    console.error('[PROG-META] Error updating:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/programming-meta/:id
 * Admin: delete a meta entry
 */
export async function deleteProgrammingMeta(req, res) {
  try {
    console.log('[PROG-META] Deleting:', req.params.id);
    const item = await ProgrammingMeta.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    clearCache();
    res.json({ success: true });
  } catch (error) {
    console.error('[PROG-META] Error deleting:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/programming-meta/seed
 * Admin: seed default categories
 */
export async function seedProgrammingMeta(req, res) {
  try {
    console.log('[PROG-META] Seeding defaults...');
    const defaults = [
      { type: 'category', value: 'core', label: 'Core', order: 1 },
      { type: 'category', value: 'fundamentals', label: 'Fundamentals', order: 2 },
      { type: 'category', value: 'oops', label: 'OOPs', order: 3 },
      { type: 'category', value: 'advanced', label: 'Advanced', order: 4 }
    ];
    for (const d of defaults) {
      await ProgrammingMeta.findOneAndUpdate(
        { type: d.type, value: d.value },
        d,
        { upsert: true, new: true }
      );
    }
    clearCache();
    const items = await ProgrammingMeta.find().sort({ order: 1 });
    console.log('[PROG-META] Seeded:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[PROG-META] Error seeding:', error.message);
    res.status(500).json({ error: error.message });
  }
}
