/*
 * ProgressMessage Controller — CRUD for admin-managed motivational messages.
 */
import ProgressMessage from '../models/ProgressMessage.js';

/*
 * GET /api/progress-messages
 * Public: Returns all active messages, sorted by tier ascending.
 */
export async function getMessages(req, res) {
  try {
    console.log('[PROGRESS-MSG] Fetching messages');
    const totalCount = await ProgressMessage.countDocuments({});
    const activeCount = await ProgressMessage.countDocuments({ active: true });
    console.log('[PROGRESS-MSG] DB stats — total:', totalCount, 'active:', activeCount);
    const messages = await ProgressMessage.find({ active: true }).sort({ tier: 1, context: 1 }).lean();
    console.log('[PROGRESS-MSG] Messages fetched:', messages.length);
    res.json({ data: messages });
  } catch (error) {
    console.error('[PROGRESS-MSG] Error fetching messages:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/progress-messages/admin
 * Admin: Returns ALL messages (including inactive), for management.
 */
export async function getAllMessages(req, res) {
  try {
    console.log('[PROGRESS-MSG] Admin fetching all messages');
    const totalCount = await ProgressMessage.countDocuments({});
    console.log('[PROGRESS-MSG] Admin DB stats — total:', totalCount);
    const messages = await ProgressMessage.find().sort({ tier: 1, context: 1 }).lean();
    console.log('[PROGRESS-MSG] All messages fetched:', messages.length);
    res.json({ data: messages });
  } catch (error) {
    console.error('[PROGRESS-MSG] Error fetching all messages:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/progress-messages
 * Admin: Create a new message.
 */
export async function createMessage(req, res) {
  try {
    console.log('[PROGRESS-MSG] Creating message:', req.body.message);
    const { message, tier, context, subject } = req.body;
    if (!message || tier === undefined || !context) {
      return res.status(400).json({ error: 'message, tier, and context are required' });
    }
    const doc = await ProgressMessage.create({ message, tier, context, subject: subject || 'all' });
    console.log('[PROGRESS-MSG] Message created:', doc._id);
    res.status(201).json({ data: doc });
  } catch (error) {
    console.error('[PROGRESS-MSG] Error creating message:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/progress-messages/:id
 * Admin: Update an existing message.
 */
export async function updateMessage(req, res) {
  try {
    console.log('[PROGRESS-MSG] Updating message:', req.params.id);
    const updated = await ProgressMessage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.log('[PROGRESS-MSG] Message updated:', updated._id);
    res.json({ data: updated });
  } catch (error) {
    console.error('[PROGRESS-MSG] Error updating message:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/progress-messages/:id
 * Admin: Delete a message.
 */
export async function deleteMessage(req, res) {
  try {
    console.log('[PROGRESS-MSG] Deleting message:', req.params.id);
    const deleted = await ProgressMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.log('[PROGRESS-MSG] Message deleted:', deleted._id);
    res.json({ success: true });
  } catch (error) {
    console.error('[PROGRESS-MSG] Error deleting message:', error.message);
    res.status(500).json({ error: error.message });
  }
}
