import Message from '../models/Message.js';
import User from '../models/User.js';

/*
 * GET /api/messages
 * Get inbox — list of unique conversations for the current user
 */
export async function getConversations(req, res) {
  try {
    console.log('[MESSAGE] Fetching conversations for user:', req.userId);
    const clerkUser = await User.findOne({ clerkId: req.userId });
    if (!clerkUser) return res.status(404).json({ error: 'User not found' });

    const userId = clerkUser._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 }).populate('sender receiver', 'displayName username avatar');

    /* Group by conversation partner */
    const conversationMap = new Map();
    messages.forEach(msg => {
      const partner = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const key = partner._id.toString();
      if (!conversationMap.has(key) || msg.createdAt > conversationMap.get(key).lastMessage.createdAt) {
        conversationMap.set(key, {
          user: partner,
          lastMessage: msg,
          unread: !msg.read && msg.receiver._id.toString() === userId.toString()
        });
      }
    });

    const conversations = Array.from(conversationMap.values());
    console.log('[MESSAGE] Conversations fetched:', conversations.length);
    res.json({ data: conversations });
  } catch (error) {
    console.error('[MESSAGE] Error fetching conversations:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/messages/:userId
 * Get message thread with a specific user
 */
export async function getMessages(req, res) {
  try {
    console.log('[MESSAGE] Fetching thread with user:', req.params.userId);
    const clerkUser = await User.findOne({ clerkId: req.userId });
    if (!clerkUser) return res.status(404).json({ error: 'User not found' });

    const messages = await Message.find({
      $or: [
        { sender: clerkUser._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: clerkUser._id }
      ]
    }).sort({ createdAt: 1 }).populate('sender receiver', 'displayName username avatar');

    console.log('[MESSAGE] Messages fetched:', messages.length);
    res.json({ data: messages });
  } catch (error) {
    console.error('[MESSAGE] Error fetching messages:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/messages/:userId
 * Send a message to a user
 */
export async function sendMessage(req, res) {
  try {
    console.log('[MESSAGE] Sending message to user:', req.params.userId);
    const clerkUser = await User.findOne({ clerkId: req.userId });
    if (!clerkUser) return res.status(404).json({ error: 'User not found' });

    const message = await Message.create({
      sender: clerkUser._id,
      receiver: req.params.userId,
      text: req.body.text
    });

    const populated = await Message.findById(message._id).populate('sender receiver', 'displayName username avatar');
    console.log('[MESSAGE] Message sent:', message._id);
    res.status(201).json({ data: populated });
  } catch (error) {
    console.error('[MESSAGE] Error sending message:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/messages/:id/read
 * Mark a message as read
 */
export async function markAsRead(req, res) {
  try {
    console.log('[MESSAGE] Marking message as read:', req.params.id);
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found' });
    console.log('[MESSAGE] Message marked as read:', req.params.id);
    res.json({ data: message });
  } catch (error) {
    console.error('[MESSAGE] Error marking message as read:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/messages/:id
 * Delete a message (only sender can delete)
 */
export async function deleteMessage(req, res) {
  try {
    console.log('[MESSAGE] Deleting message:', req.params.id);
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    const clerkUser = await User.findOne({ clerkId: req.userId });
    if (message.sender.toString() !== clerkUser._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Message.findByIdAndDelete(req.params.id);
    console.log('[MESSAGE] Message deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[MESSAGE] Error deleting message:', error.message);
    res.status(500).json({ error: error.message });
  }
}
