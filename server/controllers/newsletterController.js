import Newsletter from '../models/Newsletter.js';

/*
 * POST /api/newsletter/subscribe
 * Public: Subscribe an email to the newsletter
 */
export async function subscribe(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
      }
      return res.json({ success: true, message: 'Already subscribed' });
    }
    await Newsletter.create({ email });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('[NEWSLETTER] Error subscribing:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/newsletter
 * Admin: List all subscribers
 */
export async function getSubscribers(req, res) {
  try {
    console.log('[NEWSLETTER] Fetching subscribers...');
    const subscribers = await Newsletter.find({ active: true }).sort({ createdAt: -1 });
    console.log('[NEWSLETTER] Subscribers fetched:', subscribers.length);
    res.json({ data: subscribers });
  } catch (error) {
    console.error('[NEWSLETTER] Error fetching subscribers:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/newsletter/:id
 * Admin: Remove a subscriber
 */
export async function removeSubscriber(req, res) {
  try {
    console.log('[NEWSLETTER] Removing subscriber:', req.params.id);
    const sub = await Newsletter.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Subscriber not found' });
    console.log('[NEWSLETTER] Subscriber removed:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[NEWSLETTER] Error removing subscriber:', error.message);
    res.status(500).json({ error: error.message });
  }
}
