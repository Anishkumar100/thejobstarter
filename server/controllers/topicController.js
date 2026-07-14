import Topic from '../models/Topic.js';

/*
 * GET /api/topics
 * Public: Get all topics sorted by order
 */
export async function getTopics(req, res) {
  try {
    console.log('[TOPIC] Fetching all topics...');
    const topics = await Topic.find().sort({ order: 1 });
    console.log('[TOPIC] Topics fetched:', topics.length);
    res.json({ data: topics });
  } catch (error) {
    console.error('[TOPIC] Error fetching topics:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/topics/:id
 * Admin: Get single topic
 */
export async function getTopic(req, res) {
  try {
    console.log('[TOPIC] Fetching topic:', req.params.id);
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ data: topic });
  } catch (error) {
    console.error('[TOPIC] Error fetching topic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/topics
 * Admin: Create a new topic
 */
export async function createTopic(req, res) {
  try {
    console.log('[TOPIC] Creating topic:', req.body.title);
    const topic = await Topic.create(req.body);
    console.log('[TOPIC] Topic created:', topic._id);
    res.status(201).json({ data: topic });
  } catch (error) {
    console.error('[TOPIC] Error creating topic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/topics/:id
 * Admin: Update a topic
 */
export async function updateTopic(req, res) {
  try {
    console.log('[TOPIC] Updating topic:', req.params.id);
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    console.log('[TOPIC] Topic updated:', topic.title);
    res.json({ data: topic });
  } catch (error) {
    console.error('[TOPIC] Error updating topic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/topics/:id
 * Admin: Delete a topic
 */
export async function deleteTopic(req, res) {
  try {
    console.log('[TOPIC] Deleting topic:', req.params.id);
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    console.log('[TOPIC] Topic deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[TOPIC] Error deleting topic:', error.message);
    res.status(500).json({ error: error.message });
  }
}
