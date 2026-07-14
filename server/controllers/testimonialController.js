import Testimonial from '../models/Testimonial.js';

/*
 * GET /api/testimonials
 * Public — returns active testimonials sorted by order
 */
export async function getActiveTestimonials(req, res) {
  try {
    console.log('[TESTIMONIALS] Fetching active testimonials...');
    const testimonials = await Testimonial.find({ active: true }).sort({ order: 1, createdAt: -1 });
    console.log('[TESTIMONIALS] Fetched:', testimonials.length);
    res.json({ data: testimonials });
  } catch (error) {
    console.error('[TESTIMONIALS] Error fetching:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/testimonials/all
 * Admin — returns all testimonials
 */
export async function getAllTestimonials(req, res) {
  try {
    console.log('[TESTIMONIALS] Fetching all testimonials (admin)...');
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ data: testimonials });
  } catch (error) {
    console.error('[TESTIMONIALS] Error fetching all:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/testimonials
 * Admin — create a testimonial
 */
export async function createTestimonial(req, res) {
  try {
    console.log('[TESTIMONIALS] Creating testimonial...');
    const { name, role, text, order, active, avatar } = req.body;
    if (!name || !role || !text) {
      return res.status(400).json({ error: 'name, role and text are required' });
    }
    const testimonial = await Testimonial.create({ name, role, text, order: order || 0, active: active !== undefined ? active : true, avatar: avatar || '' });
    console.log('[TESTIMONIALS] Created:', testimonial.name);
    res.status(201).json({ data: testimonial });
  } catch (error) {
    console.error('[TESTIMONIALS] Error creating:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/testimonials/:id
 * Admin — update a testimonial
 */
export async function updateTestimonial(req, res) {
  try {
    console.log('[TESTIMONIALS] Updating testimonial:', req.params.id);
    const { name, role, text, order, active, avatar } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, role, text, order, active, avatar: avatar || '' },
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    console.log('[TESTIMONIALS] Updated:', testimonial.name);
    res.json({ data: testimonial });
  } catch (error) {
    console.error('[TESTIMONIALS] Error updating:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/testimonials/:id
 * Admin — delete a testimonial
 */
export async function deleteTestimonial(req, res) {
  try {
    console.log('[TESTIMONIALS] Deleting testimonial:', req.params.id);
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    console.log('[TESTIMONIALS] Deleted:', testimonial.name);
    res.json({ success: true });
  } catch (error) {
    console.error('[TESTIMONIALS] Error deleting:', error.message);
    res.status(500).json({ error: error.message });
  }
}
