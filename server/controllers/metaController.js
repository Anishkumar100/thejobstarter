import DsaMeta from '../models/DsaMeta.js';

/*
 * GET /api/dsa-meta?type=category|topic|company
 * Fetch all DSA meta entries, optionally filtered by type
 */
export async function getDsaMeta(req, res) {
  try {
    console.log('[META] Fetching DSA meta with filter:', req.query.type);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const items = await DsaMeta.find(filter).sort({ order: 1, label: 1 });
    console.log('[META] DSA meta fetched:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[META] Error fetching DSA meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dsa-meta
 * Admin: Create a new DSA meta entry (category, topic, or company)
 */
export async function createDsaMeta(req, res) {
  try {
    console.log('[META] Creating DSA meta:', req.body.label);
    const item = await DsaMeta.create(req.body);
    console.log('[META] DSA meta created:', item._id);
    res.status(201).json({ data: item });
  } catch (error) {
    console.error('[META] Error creating DSA meta:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/dsa-meta/:id
 * Admin: Update a DSA meta entry
 */
export async function updateDsaMeta(req, res) {
  try {
    console.log('[META] Updating DSA meta:', req.params.id);
    const item = await DsaMeta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'DsaMeta not found' });
    console.log('[META] DSA meta updated:', item._id);
    res.json({ data: item });
  } catch (error) {
    console.error('[META] Error updating DSA meta:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/dsa-meta/:id
 * Admin: Delete a DSA meta entry
 */
export async function deleteDsaMeta(req, res) {
  try {
    console.log('[META] Deleting DSA meta:', req.params.id);
    const item = await DsaMeta.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'DsaMeta not found' });
    console.log('[META] DSA meta deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[META] Error deleting DSA meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dsa-meta/seed
 * Admin: Seed default DSA categories, topics, and companies
 */
export async function seedDsaMeta(req, res) {
  try {
    console.log('[META] Seeding default DSA meta...');
    await DsaMeta.deleteMany({});

    const defaults = [
      /* Categories */
      { type: 'category', value: 'data-structures', label: 'Data Structures', order: 1 },
      { type: 'category', value: 'algorithms', label: 'Algorithms', order: 2 },
      { type: 'category', value: 'techniques', label: 'Techniques', order: 3 },
      /* Topics */
      { type: 'topic', value: 'arrays', label: 'Arrays', order: 1 },
      { type: 'topic', value: 'strings', label: 'Strings', order: 2 },
      { type: 'topic', value: 'linked-lists', label: 'Linked Lists', order: 3 },
      { type: 'topic', value: 'stacks', label: 'Stacks', order: 4 },
      { type: 'topic', value: 'queues', label: 'Queues', order: 5 },
      { type: 'topic', value: 'trees', label: 'Trees', order: 6 },
      { type: 'topic', value: 'graphs', label: 'Graphs', order: 7 },
      { type: 'topic', value: 'dynamic-programming', label: 'Dynamic Programming', order: 8 },
      { type: 'topic', value: 'recursion', label: 'Recursion', order: 9 },
      { type: 'topic', value: 'backtracking', label: 'Backtracking', order: 10 },
      { type: 'topic', value: 'hashing', label: 'Hashing', order: 11 },
      { type: 'topic', value: 'two-pointers', label: 'Two Pointers', order: 12 },
      { type: 'topic', value: 'sliding-window', label: 'Sliding Window', order: 13 },
      { type: 'topic', value: 'binary-search', label: 'Binary Search', order: 14 },
      { type: 'topic', value: 'sorting', label: 'Sorting', order: 15 },
      { type: 'topic', value: 'searching', label: 'Searching', order: 16 },
      { type: 'topic', value: 'greedy', label: 'Greedy', order: 17 },
      { type: 'topic', value: 'bit-manipulation', label: 'Bit Manipulation', order: 18 },
      { type: 'topic', value: 'heaps', label: 'Heaps', order: 19 },
      { type: 'topic', value: 'matrix', label: 'Matrix', order: 20 },
      { type: 'topic', value: 'math', label: 'Math', order: 21 },
      /* Companies */
      { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
      { type: 'company', value: 'google', label: 'Google', order: 2 },
      { type: 'company', value: 'meta', label: 'Meta', order: 3 },
      { type: 'company', value: 'microsoft', label: 'Microsoft', order: 4 },
      { type: 'company', value: 'apple', label: 'Apple', order: 5 },
      { type: 'company', value: 'netflix', label: 'Netflix', order: 6 },
      { type: 'company', value: 'uber', label: 'Uber', order: 7 },
      { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 },
      { type: 'company', value: 'adobe', label: 'Adobe', order: 9 },
      { type: 'company', value: 'flipkart', label: 'Flipkart', order: 10 },
      { type: 'company', value: 'oracle', label: 'Oracle', order: 11 },
      { type: 'company', value: 'ibm', label: 'IBM', order: 12 },
      { type: 'company', value: 'goldman-sachs', label: 'Goldman Sachs', order: 13 },
      { type: 'company', value: 'jpmorgan', label: 'JPMorgan', order: 14 },
      { type: 'company', value: 'tesla', label: 'Tesla', order: 15 },
    ];

    await DsaMeta.insertMany(defaults);
    console.log('[META] Default DSA meta seeded:', defaults.length);
    res.json({ success: true, count: defaults.length });
  } catch (error) {
    console.error('[META] Error seeding DSA meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}