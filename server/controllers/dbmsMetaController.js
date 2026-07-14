import DbmsMeta from '../models/DbmsMeta.js';

/*
 * GET /api/dbms-meta?type=category|topic|company
 * Fetch all DBMS meta entries, optionally filtered by type
 */
export async function getDbmsMeta(req, res) {
  try {
    console.log('[DBMS-META] Fetching DBMS meta with filter:', req.query.type);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const items = await DbmsMeta.find(filter).sort({ order: 1, label: 1 });
    console.log('[DBMS-META] DBMS meta fetched:', items.length);
    res.json({ data: items });
  } catch (error) {
    console.error('[DBMS-META] Error fetching DBMS meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dbms-meta
 * Admin: Create a new DBMS meta entry (category, topic, or company)
 */
export async function createDbmsMeta(req, res) {
  try {
    console.log('[DBMS-META] Creating DBMS meta:', req.body.label);
    const item = await DbmsMeta.create(req.body);
    console.log('[DBMS-META] DBMS meta created:', item._id);
    res.status(201).json({ data: item });
  } catch (error) {
    console.error('[DBMS-META] Error creating DBMS meta:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/dbms-meta/:id
 * Admin: Update a DBMS meta entry
 */
export async function updateDbmsMeta(req, res) {
  try {
    console.log('[DBMS-META] Updating DBMS meta:', req.params.id);
    const item = await DbmsMeta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'DbmsMeta not found' });
    console.log('[DBMS-META] DBMS meta updated:', item._id);
    res.json({ data: item });
  } catch (error) {
    console.error('[DBMS-META] Error updating DBMS meta:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/dbms-meta/:id
 * Admin: Delete a DBMS meta entry
 */
export async function deleteDbmsMeta(req, res) {
  try {
    console.log('[DBMS-META] Deleting DBMS meta:', req.params.id);
    const item = await DbmsMeta.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'DbmsMeta not found' });
    console.log('[DBMS-META] DBMS meta deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DBMS-META] Error deleting DBMS meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dbms-meta/seed
 * Admin: Seed default DBMS categories, topics, and companies
 */
export async function seedDbmsMeta(req, res) {
  try {
    console.log('[DBMS-META] Seeding default DBMS meta...');
    await DbmsMeta.deleteMany({});

    const defaults = [
      /* Categories — DBMS lesson groupings */
      { type: 'category', value: 'sql', label: 'SQL', order: 1 },
      { type: 'category', value: 'design', label: 'Database Design', order: 2 },
      { type: 'category', value: 'theory', label: 'Theory & Concepts', order: 3 },
      /* Topics — DBMS subject areas */
      { type: 'topic', value: 'sql-queries', label: 'SQL Queries', order: 1 },
      { type: 'topic', value: 'joins', label: 'Joins', order: 2 },
      { type: 'topic', value: 'indexing', label: 'Indexing', order: 3 },
      { type: 'topic', value: 'normalization', label: 'Normalization', order: 4 },
      { type: 'topic', value: 'transactions', label: 'Transactions', order: 5 },
      { type: 'topic', value: 'acid', label: 'ACID Properties', order: 6 },
      { type: 'topic', value: 'concurrency', label: 'Concurrency Control', order: 7 },
      { type: 'topic', value: 'er-diagrams', label: 'ER Diagrams', order: 8 },
      { type: 'topic', value: 'relational-model', label: 'Relational Model', order: 9 },
      { type: 'topic', value: 'nosql', label: 'NoSQL', order: 10 },
      { type: 'topic', value: 'query-optimization', label: 'Query Optimization', order: 11 },
      { type: 'topic', value: 'triggers', label: 'Triggers & Stored Procedures', order: 12 },
      /* Companies — same as DSA (shared pool) */
      { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
      { type: 'company', value: 'google', label: 'Google', order: 2 },
      { type: 'company', value: 'microsoft', label: 'Microsoft', order: 3 },
      { type: 'company', value: 'oracle', label: 'Oracle', order: 4 },
      { type: 'company', value: 'ibm', label: 'IBM', order: 5 },
      { type: 'company', value: 'uber', label: 'Uber', order: 6 },
      { type: 'company', value: 'flipkart', label: 'Flipkart', order: 7 },
      { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 },
    ];

    await DbmsMeta.insertMany(defaults);
    console.log('[DBMS-META] Default DBMS meta seeded:', defaults.length);
    res.json({ success: true, count: defaults.length });
  } catch (error) {
    console.error('[DBMS-META] Error seeding DBMS meta:', error.message);
    res.status(500).json({ error: error.message });
  }
}
