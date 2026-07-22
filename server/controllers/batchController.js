import { customAlphabet } from 'nanoid';
/* Lowercase alphanumeric only — no special chars that confuse manual typing */
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);
import Batch from '../models/Batch.js';
import User from '../models/User.js';

/*
 * Auto-generate a random 8-char code as fallback when admin doesn't provide one.
 */
export function generateCode() {
  return nanoid();
}

/*
 * POST /api/batches
 * Admin: Create a new batch with a join code.
 * Code is auto-generated server-side — never accept one from client.
 */
export async function createBatch(req, res) {
  try {
    console.log('[BATCH] Creating batch...');
    const adminUser = await User.findOne({ clerkId: req.userId });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found in database' });
    }
    const batch = await Batch.create({
      coachingCenter: req.body.coachingCenter,
      name: req.body.name,
      code: generateCode(),
      status: req.body.status || 'active',
      expectedStudents: req.body.expectedStudents || null,
      createdBy: adminUser._id
    });
    console.log('[BATCH] Batch created:', batch._id, 'code:', batch.code, 'name:', batch.name);
    res.status(201).json({ data: batch });
  } catch (error) {
    console.error('[BATCH] Error creating batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/batches
 * Admin: List all batches across all centers.
 */
export async function getAllBatches(req, res) {
  try {
    console.log('[BATCH] Fetching all batches...');
    const batches = await Batch.find()
      .populate('coachingCenter', 'name code')
      .sort({ createdAt: -1 });
    console.log('[BATCH] Batches fetched:', batches.length);
    res.json({ data: batches });
  } catch (error) {
    console.error('[BATCH] Error fetching batches:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/batches/:id
 * Admin: Get a single batch by ID.
 */
export async function getBatchById(req, res) {
  try {
    console.log('[BATCH] Fetching batch:', req.params.id);
    const batch = await Batch.findById(req.params.id).populate('coachingCenter', 'name code');
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json({ data: batch });
  } catch (error) {
    console.error('[BATCH] Error fetching batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/batches/:id
 * Admin: Update a batch's fields.
 */
export async function updateBatch(req, res) {
  try {
    console.log('[BATCH] Updating batch:', req.params.id);
    const allowedFields = ['name', 'status', 'expectedStudents', 'code'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    console.log('[BATCH] Batch updated:', batch._id);
    res.json({ data: batch });
  } catch (error) {
    console.error('[BATCH] Error updating batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/batches/:id/regenerate-code
 * Admin: Invalidate old join code and issue a new nanoid(8).
 */
export async function regenerateBatchCode(req, res) {
  try {
    console.log('[BATCH] Regenerating code for batch:', req.params.id);
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    batch.code = generateCode();
    await batch.save();
    console.log('[BATCH] Code regenerated for batch:', batch._id, 'new code:', batch.code);
    res.json({ data: batch });
  } catch (error) {
    console.error('[BATCH] Error regenerating code:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/batches/:id
 * Admin: Delete a batch — only allowed if it has zero linked students.
 * Otherwise 409 with a message to archive instead.
 */
export async function deleteBatch(req, res) {
  try {
    console.log('[BATCH] Deleting batch:', req.params.id);
    const linkedStudents = await User.countDocuments({ batch: req.params.id });
    if (linkedStudents > 0) {
      console.log('[BATCH] Unlinking', linkedStudents, 'students from batch:', req.params.id);
      await User.updateMany({ batch: req.params.id }, { $set: { batch: null } });
    }
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    console.log('[BATCH] Batch deleted:', req.params.id, '- unlinked students:', linkedStudents);
    res.json({ success: true, unlinkedStudents: linkedStudents });
  } catch (error) {
    console.error('[BATCH] Error deleting batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/batches/:id/assign-student/:userId
 * Admin: Assign a student to a batch.
 */
export async function assignStudentToBatch(req, res) {
  try {
    const { id: batchId, userId } = req.params;
    console.log('[BATCH] Admin assigning student', userId, 'to batch:', batchId);

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.batch = batchId;
    await student.save();

    console.log('[BATCH] Student', userId, 'assigned to batch:', batch.name);
    res.json({ data: { _id: student._id, username: student.username, batch: batchId, batchName: batch.name } });
  } catch (error) {
    console.error('[BATCH] Error assigning student:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/batches/:id/remove-student/:userId
 * Admin: Remove a student from a batch.
 */
export async function removeStudentFromBatch(req, res) {
  try {
    const { userId } = req.params;
    console.log('[BATCH] Admin removing student', userId, 'from batch');

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.batch = null;
    await student.save();

    console.log('[BATCH] Student', userId, 'removed from batch');
    res.json({ success: true, data: { _id: student._id, username: student.username } });
  } catch (error) {
    console.error('[BATCH] Error removing student from batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/batches/:id/assign-students
 * Admin: Bulk assign multiple students to a batch.
 * Body: { userIds: [...] }
 */
export async function bulkAssignStudentsToBatch(req, res) {
  try {
    const { id: batchId } = req.params;
    const { userIds } = req.body;

    console.log('[BATCH] Admin bulk assigning', userIds?.length, 'students to batch:', batchId);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { batch: batchId } }
    );

    console.log('[BATCH] Bulk assigned', userIds.length, 'students to batch:', batchId);
    res.json({ success: true, assigned: userIds.length, batch: batch.name });
  } catch (error) {
    console.error('[BATCH] Error bulk assigning:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/batches/:id/remove-students
 * Admin: Bulk remove multiple students from a batch.
 * Body: { userIds: [...] }
 */
export async function bulkRemoveStudentsFromBatch(req, res) {
  try {
    const { id: batchId } = req.params;
    const { userIds } = req.body;

    console.log('[BATCH] Admin bulk removing', userIds?.length, 'students from batch:', batchId);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    await User.updateMany(
      { _id: { $in: userIds }, batch: batchId },
      { $set: { batch: null } }
    );

    console.log('[BATCH] Bulk removed', userIds.length, 'students from batch:', batchId);
    res.json({ success: true, removed: userIds.length });
  } catch (error) {
    console.error('[BATCH] Error bulk removing:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/batches/students/:userId/course
 * Admin: Change a student's course offering.
 * Unscoped — admins can operate across all centers.
 */
export async function adminUpdateStudentCourse(req, res) {
  try {
    const { userId } = req.params;
    const { courseOfferingId } = req.body;

    console.log('[BATCH] Admin updating course for student:', userId);

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.courseOffering = courseOfferingId || null;
    await student.save();

    console.log('[BATCH] Student course updated:', userId, '->', courseOfferingId);
    res.json({ data: student });
  } catch (error) {
    console.error('[BATCH] Error updating student course:', error.message);
    res.status(500).json({ error: error.message });
  }
}
