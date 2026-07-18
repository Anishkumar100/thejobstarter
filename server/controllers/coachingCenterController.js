import { customAlphabet } from 'nanoid';
/* Lowercase alphanumeric only — no special chars that confuse manual typing */
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);
import CoachingCenter from '../models/CoachingCenter.js';
import User from '../models/User.js';
import { getCenterRoster } from '../services/centerRosterService.js';

/*
 * Auto-generate a random 6-char code as fallback when admin doesn't provide one.
 */
function generateCode() {
  return nanoid();
}

/*
 * POST /api/coaching-centers
 * Admin: Create a new coaching center with a join code.
 * Admin can specify their own code in req.body.code.
 * If left empty, a random 6-char code is auto-generated.
 * Unique index on `code` prevents duplicates.
 */
export async function createCenter(req, res) {
  try {
    console.log('[COACHING] Creating center...');
    const adminUser = await User.findOne({ clerkId: req.userId });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found in database' });
    }
    const code = req.body.code || generateCode();
    const center = await CoachingCenter.create({
      name: req.body.name,
      logo: req.body.logo || '',
      address: req.body.address || '',
      expectedStudents: req.body.expectedStudents || null,
      code,
      status: req.body.status || 'trial',
      contactName: req.body.contactName || '',
      contactEmail: req.body.contactEmail || '',
      contactPhone: req.body.contactPhone || '',
      createdBy: adminUser._id
    });
    console.log('[COACHING] Center created:', center._id, 'code:', code);
    res.status(201).json({ data: center });
  } catch (error) {
    console.error('[COACHING] Error creating center:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coaching-centers
 * Admin: List all coaching centers (no student counts — that's Phase 4/5)
 */
export async function getCenters(req, res) {
  try {
    console.log('[COACHING] Fetching centers...');
    const centers = await CoachingCenter.find().sort({ createdAt: -1 });
    console.log('[COACHING] Centers fetched:', centers.length);
    res.json({ data: centers });
  } catch (error) {
    console.error('[COACHING] Error fetching centers:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coaching-centers/:id
 * Admin: Get a single coaching center by ID (no student counts — keep it cheap)
 */
export async function getCenterById(req, res) {
  try {
    console.log('[COACHING] Fetching center:', req.params.id);
    const center = await CoachingCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Coaching center not found' });
    }
    res.json({ data: center });
  } catch (error) {
    console.error('[COACHING] Error fetching center:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coaching-centers/:id
 * Admin: Update a coaching center's fields (name, logo, address, expectedStudents, status, contacts)
 */
export async function updateCenter(req, res) {
  try {
    console.log('[COACHING] Updating center:', req.params.id);
    const allowedFields = ['name', 'logo', 'address', 'expectedStudents', 'status', 'contactName', 'contactEmail', 'contactPhone', 'code'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const center = await CoachingCenter.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedBy: (await User.findOne({ clerkId: req.userId }))?._id },
      { new: true, runValidators: true }
    );
    if (!center) {
      return res.status(404).json({ error: 'Coaching center not found' });
    }
    console.log('[COACHING] Center updated:', center._id);
    res.json({ data: center });
  } catch (error) {
    console.error('[COACHING] Error updating center:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coaching-centers/:id/regenerate-code
 * Admin: Invalidate old join code and issue a new nanoid(6)
 * Old code stops working immediately — student gets "code not found", not "code changed"
 */
export async function regenerateCenterCode(req, res) {
  try {
    console.log('[COACHING] Regenerating code for center:', req.params.id);
    const adminUser = await User.findOne({ clerkId: req.userId });
    const center = await CoachingCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Coaching center not found' });
    }
    center.code = generateCode();
    center.updatedBy = adminUser?._id;
    center.codeRegeneratedAt = new Date();
    await center.save();
    console.log('[COACHING] Code regenerated for center:', center._id, 'new code:', center.code);
    res.json({ data: center });
  } catch (error) {
    console.error('[COACHING] Error regenerating code:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coaching-centers/:id
 * Admin: Delete a coaching center — only allowed if it has zero linked students
 * Otherwise 409 with a message to reassign or suspend instead
 */
export async function deleteCenter(req, res) {
  try {
    console.log('[COACHING] Deleting center:', req.params.id);
    const linkedStudents = await User.countDocuments({ coachingCenter: req.params.id });
    if (linkedStudents > 0) {
      console.log('[COACHING] Cannot delete center with linked students:', linkedStudents);
      return res.status(409).json({
        error: `Cannot delete center with ${linkedStudents} linked student(s). Reassign or suspend the center instead.`
      });
    }
    const center = await CoachingCenter.findByIdAndDelete(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Coaching center not found' });
    }
    console.log('[COACHING] Center deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[COACHING] Error deleting center:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coaching-centers/:id/students
 * Admin: Fetch roster for a coaching center (students + center info).
 * Delegates to the shared centerRosterService — no Express logic here.
 */
export async function getCenterStudents(req, res) {
  try {
    console.log('[COACHING] Fetching students for center:', req.params.id);
    const roster = await getCenterRoster(req.params.id);
    res.json({ data: roster });
  } catch (error) {
    console.error('[COACHING] Error fetching center students:', error.message);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
}

/*
 * GET /api/coaching-centers/:id/students/:userId
 * Admin: Get a single student within a center with full profile details.
 */
export async function getCenterStudentById(req, res) {
  try {
    console.log('[COACHING] Fetching student within center:', req.params.userId);
    const { id: centerId, userId } = req.params;

    const student = await User.findById(userId)
      .select('-followers -following')
      .populate('coachingCenter', 'name logo');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.coachingCenter || student.coachingCenter._id.toString() !== centerId) {
      return res.status(400).json({ error: 'Student is not linked to this center' });
    }

    res.json({ data: student });
  } catch (error) {
    console.error('[COACHING] Error fetching student:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coaching-centers/:id/students/:userId
 * Admin: Update a student's basic fields within a center.
 * Whitelist: displayName, email, college, year only.
 */
export async function updateCenterStudent(req, res) {
  try {
    console.log('[COACHING] Updating student within center:', req.params.userId);
    const { id: centerId, userId } = req.params;

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId) {
      return res.status(400).json({ error: 'Student is not linked to this center' });
    }

    const allowedFields = ['displayName', 'email', 'college', 'year'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    }
    await student.save();

    console.log('[COACHING] Student updated:', userId);
    res.json({ data: student });
  } catch (error) {
    console.error('[COACHING] Error updating student:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coaching-centers/:id/students/:userId
 * Admin: Remove a student from a coaching center (emergency unlink).
 * Does NOT delete the user — only sets coachingCenter to null.
 * Validates the student is actually linked to this center before unlinking.
 */
export async function removeStudentFromCenter(req, res) {
  try {
    console.log('[COACHING] Removing student from center:', req.params.userId);
    const { id: centerId, userId } = req.params;

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId) {
      return res.status(400).json({ error: 'Student is not linked to this center' });
    }

    student.coachingCenter = null;
    student.coachingCenterJoinedAt = null;
    await student.save();

    console.log('[COACHING] Student removed from center:', userId);
    res.json({ success: true, data: { _id: student._id, displayName: student.displayName, username: student.username } });
  } catch (error) {
    console.error('[COACHING] Error removing student from center:', error.message);
    res.status(500).json({ error: error.message });
  }
}
