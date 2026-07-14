/*
 * OS Meta Controller — mirrors dbmsMetaController.js for OS categories, topics, and companies
 */
import OsMeta from '../models/OsMeta.js';

/*
 * GET /api/os-meta?type=category|topic|company
 * Fetch all OS meta entries, optionally filtered by type
 */
export async function getOsMeta(req, res) {
  try {
    console.log('[OS-META] Fetching OS meta with filter:', req.query.type);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const items = await OsMeta.find(filter).sort({ order: 1, label: 1 });
    console.log('[OS-META] OS meta fetched:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[OS-META] Error fetching OS meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/os-meta
 * Admin: Create a new OS meta entry (category, topic, or company)
 */
export async function createOsMeta(req, res) {
  try {
    console.log('[OS-META] Creating OS meta:', req.body.label);
    const item = await OsMeta.create(req.body);
    console.log('[OS-META] OS meta created:', item._id);
    res.status(201).json({ data: item });
  } catch (error) {
    console.error('[OS-META] Error creating OS meta:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/os-meta/:id
 * Admin: Update an OS meta entry
 */
export async function updateOsMeta(req, res) {
  try {
    console.log('[OS-META] Updating OS meta:', req.params.id);
    const item = await OsMeta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'OsMeta not found' });
    console.log('[OS-META] OS meta updated:', item._id);
    res.json({ data: item });
  } catch (error) {
    console.error('[OS-META] Error updating OS meta:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/os-meta/:id
 * Admin: Delete an OS meta entry
 */
export async function deleteOsMeta(req, res) {
  try {
    console.log('[OS-META] Deleting OS meta:', req.params.id);
    const item = await OsMeta.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'OsMeta not found' });
    console.log('[OS-META] OS meta deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[OS-META] Error deleting OS meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/os-meta/seed
 * Admin: Seed default OS categories, topics, and companies
 */
export async function seedOsMeta(req, res) {
  try {
    console.log('[OS-META] Seeding default OS meta...');
    await OsMeta.deleteMany({});

    const defaults = [
      /* Categories — OS lesson groupings */
      { type: 'category', value: 'process', label: 'Process Management', order: 1 },
      { type: 'category', value: 'memory', label: 'Memory Management', order: 2 },
      { type: 'category', value: 'storage', label: 'Storage & File Systems', order: 3 },
      /* Topics — OS subject areas */
      { type: 'topic', value: 'process-management', label: 'Process Management', order: 1 },
      { type: 'topic', value: 'cpu-scheduling', label: 'CPU Scheduling', order: 2 },
      { type: 'topic', value: 'synchronization', label: 'Process Synchronization', order: 3 },
      { type: 'topic', value: 'deadlocks', label: 'Deadlocks', order: 4 },
      { type: 'topic', value: 'memory-management', label: 'Memory Management', order: 5 },
      { type: 'topic', value: 'virtual-memory', label: 'Virtual Memory', order: 6 },
      { type: 'topic', value: 'file-systems', label: 'File Systems', order: 7 },
      { type: 'topic', value: 'disk-scheduling', label: 'Disk Scheduling', order: 8 },
      { type: 'topic', value: 'threads', label: 'Threads', order: 9 },
      { type: 'topic', value: 'system-calls', label: 'System Calls', order: 10 },
      /* Companies — same shared pool */
      { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
      { type: 'company', value: 'google', label: 'Google', order: 2 },
      { type: 'company', value: 'microsoft', label: 'Microsoft', order: 3 },
      { type: 'company', value: 'oracle', label: 'Oracle', order: 4 },
      { type: 'company', value: 'ibm', label: 'IBM', order: 5 },
      { type: 'company', value: 'uber', label: 'Uber', order: 6 },
      { type: 'company', value: 'flipkart', label: 'Flipkart', order: 7 },
      { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 },
    ];

    await OsMeta.insertMany(defaults);
    console.log('[OS-META] Default OS meta seeded:', defaults.length);
    res.json({ success: true, count: defaults.length });
  } catch (error) {
    console.error('[OS-META] Error seeding OS meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}
