import CourseOffering from '../models/CourseOffering.js';
import User from '../models/User.js';

/*
 * POST /api/course-offerings
 * Admin: Create a new course offering (unscoped — admin can create for any center).
 */
export async function createCourseOffering(req, res) {
  try {
    console.log('[COURSE] Creating course offering...');
    const adminUser = await User.findOne({ clerkId: req.userId });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    const offering = await CourseOffering.create({
      coachingCenter: req.body.coachingCenter,
      name: req.body.name,
      status: req.body.status || 'active',
      createdBy: adminUser._id
    });
    console.log('[COURSE] Course offering created:', offering._id, offering.name);
    res.status(201).json({ data: offering });
  } catch (error) {
    console.error('[COURSE] Error creating course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/course-offerings
 * Admin: List all course offerings across all centers.
 */
export async function getAllCourseOfferings(req, res) {
  try {
    console.log('[COURSE] Fetching all course offerings...');
    const offerings = await CourseOffering.find()
      .populate('coachingCenter', 'name code')
      .sort({ createdAt: -1 });
    console.log('[COURSE] Course offerings fetched:', offerings.length);
    res.json({ data: offerings });
  } catch (error) {
    console.error('[COURSE] Error fetching course offerings:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/course-offerings/:id
 * Admin: Get a single course offering by ID.
 */
export async function getCourseOfferingById(req, res) {
  try {
    console.log('[COURSE] Fetching course offering:', req.params.id);
    const offering = await CourseOffering.findById(req.params.id).populate('coachingCenter', 'name code');
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }
    res.json({ data: offering });
  } catch (error) {
    console.error('[COURSE] Error fetching course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/course-offerings/:id
 * Admin: Update a course offering.
 */
export async function updateCourseOffering(req, res) {
  try {
    console.log('[COURSE] Updating course offering:', req.params.id);
    const allowedFields = ['name', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const offering = await CourseOffering.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }
    console.log('[COURSE] Course offering updated:', offering._id);
    res.json({ data: offering });
  } catch (error) {
    console.error('[COURSE] Error updating course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/course-offerings/:id
 * Admin: Delete a course offering.
 */
export async function deleteCourseOffering(req, res) {
  try {
    console.log('[COURSE] Deleting course offering:', req.params.id);
    const offering = await CourseOffering.findByIdAndDelete(req.params.id);
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }
    console.log('[COURSE] Course offering deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[COURSE] Error deleting course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}
