/*
 * Coordinator Controller — All endpoints operate on the coordinator's own
 * center only, using req.coordinatorCenterId set by requireCoordinator middleware.
 *
 * Per rule 4: no center ID is ever accepted from request params or query.
 * Per rule 3: every route is gated by requireAuth + requireCoordinator.
 */
import { getCenterRoster } from '../services/centerRosterService.js';
import { getProgressSummary, deriveStatus } from '../services/progressService.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import CourseOffering from '../models/CourseOffering.js';
import { generateCode } from './batchController.js';

/*
 * GET /api/coordinator/students
 * Returns the roster for the coordinator's own center.
 * Reuses getCenterRoster() from Phase 4 which includes student progress.
 */
export async function getStudents(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Fetching students for center:', centerId);

    const roster = await getCenterRoster(centerId);
    console.log('[COORD] Students fetched:', roster.totalStudents);

    res.json({ data: roster });
  } catch (error) {
    console.error('[COORD] Error fetching students:', error.message);
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/stats
 * Aggregates Phase 6/7 numbers for the coordinator's center only.
 * Returns center info, summary stats, and aggregate completion data.
 */
export async function getStats(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Fetching stats for center:', centerId);

    const roster = await getCenterRoster(centerId);
    const students = roster.students;

    /* Compute aggregate stats across all students */
    let totalLessons = 0, completedLessons = 0;
    let totalSubtopics = 0, completedSubtopics = 0;
    let totalProblems = 0, completedProblems = 0;
    let totalQuizTaken = 0, totalQuizScoreSum = 0, studentsWithQuizzes = 0;

    for (const student of students) {
      const p = student.progress;
      if (!p) continue;

      for (const subject of ['dsa', 'dbms', 'os', 'programming']) {
        const s = p[subject];
        if (!s) continue;

        totalLessons += s.lessons.total;
        completedLessons += s.lessons.completed;
        totalSubtopics += s.subtopics.total;
        completedSubtopics += s.subtopics.completed;
        totalProblems += s.problems.total;
        completedProblems += s.problems.completed;

        if (s.quizzes && s.quizzes.quizzesTaken > 0) {
          totalQuizTaken += s.quizzes.quizzesTaken;
          totalQuizScoreSum += s.quizzes.avgScore * s.quizzes.quizzesTaken;
          studentsWithQuizzes++;
        }
      }
    }

    const totalItems = totalLessons + totalSubtopics + totalProblems;
    const completedItems = completedLessons + completedSubtopics + completedProblems;
    const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const avgQuizScore = totalQuizTaken > 0 ? Math.round(totalQuizScoreSum / totalQuizTaken) : null;

    console.log('[COORD] Stats computed for center:', roster.center.name);

    res.json({
      data: {
        center: roster.center,
        totalStudents: roster.totalStudents,
        studentsWithQuizzes,
        aggregate: {
          lessons: { completed: completedLessons, total: totalLessons },
          subtopics: { completed: completedSubtopics, total: totalSubtopics },
          problems: { completed: completedProblems, total: totalProblems },
          overall: { completed: completedItems, total: totalItems, percentage: overallPct }
        },
        quizzes: {
          totalTaken: totalQuizTaken,
          averageScore: avgQuizScore
        }
      }
    });
  } catch (error) {
    console.error('[COORD] Error fetching stats:', error.message);
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/students/:userId
 * Returns full profile + progress for a single student in the coordinator's center.
 * Verifies the student belongs to the coordinator's center before returning data.
 */
export async function getStudentById(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;

    console.log('[COORD] Fetching student detail:', userId);

    /* Verify student belongs to this center */
    const student = await User.findById(userId)
      .select('-password -__v')
      .populate('coachingCenter', 'name code')
      .populate('batch')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.coachingCenter || student.coachingCenter._id.toString() !== centerId.toString()) {
      console.log('[COORD] Student', userId, 'is not in this center');
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }

    /* Fetch progress summary */
    const progress = await getProgressSummary(student._id);

    console.log('[COORD] Student detail fetched:', student.displayName || student.username);

    res.json({ data: { ...student, progress } });
  } catch (error) {
    console.error('[COORD] Error fetching student detail:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/students/:userId
 * Edit limited profile fields on a student in the coordinator's center.
 */
export async function updateStudent(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;
    const { displayName, email, college, year } = req.body;

    console.log('[COORD] Updating student:', userId);

    /* Verify student belongs to this center */
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Student', userId, 'is not in this center');
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }

    /* Update allowed fields only */
    if (displayName !== undefined) student.displayName = displayName;
    if (email !== undefined) student.email = email;
    if (college !== undefined) student.college = college;
    if (year !== undefined) student.year = year;

    await student.save();

    console.log('[COORD] Student updated:', userId);
    res.json({ data: student });
  } catch (error) {
    console.error('[COORD] Error updating student:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * ─────────────────────────────────────────────────────────
 * BATCH MANAGEMENT (coordinator-scoped)
 * ─────────────────────────────────────────────────────────
 */

/*
 * GET /api/coordinator/batches
 * Coordinator: List batches for their own center.
 */
export async function getCoordinatorBatches(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Fetching batches for center:', centerId);
    const batches = await Batch.find({ coachingCenter: centerId })
      .populate('courseOffering', 'name')
      .sort({ createdAt: -1 });
    console.log('[COORD] Batches fetched:', batches.length);
    res.json({ data: batches });
  } catch (error) {
    console.error('[COORD] Error fetching batches:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/batches
 * Coordinator: Create a batch for their own center.
 * coachingCenter is forced server-side — never accept from client body.
 */
export async function createCoordinatorBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Creating batch for center:', centerId);
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'Coordinator user not found' });
    }
    const createdBy = user._id;
    /* If a courseOffering is specified, verify it belongs to this center */
    if (req.body.courseOffering) {
      const co = await CourseOffering.findById(req.body.courseOffering);
      if (!co || co.coachingCenter.toString() !== centerId.toString()) {
        return res.status(400).json({ error: 'Course offering does not belong to your center' });
      }
    }
    let batch = await Batch.create({
      coachingCenter: centerId,
      name: req.body.name,
      code: generateCode(),
      courseOffering: req.body.courseOffering || null,
      expectedStudents: req.body.expectedStudents || null,
      createdBy: user._id
    });
    /* Re-fetch with courseOffering populated so the frontend gets the course name */
    batch = await Batch.findById(batch._id).populate('courseOffering', 'name');
    console.log('[COORD] Batch created:', batch._id, 'name:', batch.name);
    res.status(201).json({ data: batch });
  } catch (error) {
    console.error('[COORD] Error creating batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/batches/:id
 * Coordinator: Update a batch's name/status — only if it belongs to their center.
 */
export async function updateCoordinatorBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;
    console.log('[COORD] Updating batch:', id);

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    if (batch.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Batch', id, 'does not belong to this center');
      return res.status(403).json({ error: 'Batch does not belong to your center' });
    }

    const allowedFields = ['name', 'status', 'expectedStudents', 'code', 'courseOffering'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        /* Guard: courseOffering must belong to this center */
        if (field === 'courseOffering' && req.body.courseOffering) {
          const co = await CourseOffering.findById(req.body.courseOffering);
          if (!co || co.coachingCenter.toString() !== centerId.toString()) {
            return res.status(400).json({ error: 'Course offering does not belong to your center' });
          }
        }
        batch[field] = req.body[field];
      }
    }
    await batch.save();
    /* Re-fetch with courseOffering populated so the frontend gets the course name */
    const updated = await Batch.findById(batch._id).populate('courseOffering', 'name');

    console.log('[COORD] Batch updated:', id);
    res.json({ data: updated });
  } catch (error) {
    console.error('[COORD] Error updating batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coordinator/batches/:id
 * Coordinator: Delete a batch — only if it belongs to their center and has no linked students.
 */
export async function deleteCoordinatorBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;
    console.log('[COORD] Deleting batch:', id);

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    if (batch.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Batch', id, 'does not belong to this center');
      return res.status(403).json({ error: 'Batch does not belong to your center' });
    }

    const linkedStudents = await User.countDocuments({ batch: id });
    if (linkedStudents > 0) {
      console.log('[COORD] Cannot delete batch with linked students:', linkedStudents);
      return res.status(409).json({
        error: `Cannot delete batch with ${linkedStudents} linked student(s). Archive it instead.`
      });
    }

    await Batch.findByIdAndDelete(id);
    console.log('[COORD] Batch deleted:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('[COORD] Error deleting batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/students/:userId/batch
 * Coordinator: Assign a student to a batch in their own center.
 * Verifies both the student and the batch belong to the coordinator's center.
 */
export async function assignStudentToBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;
    const { batchId } = req.body;

    console.log('[COORD] Assigning student', userId, 'to batch:', batchId);

    if (!batchId) {
      return res.status(400).json({ error: 'batchId is required' });
    }

    /* Verify the batch belongs to this coordinator's center */
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    if (batch.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Batch', batchId, 'does not belong to this center');
      return res.status(403).json({ error: 'Batch does not belong to your center' });
    }

    /* Verify the student belongs to this center */
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Student', userId, 'is not in this center');
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }

    /* Assign the student to the batch */
    student.batch = batch._id;
    await student.save();

    console.log('[COORD] Student', userId, 'assigned to batch:', batch.name);
    res.json({ data: { _id: student._id, username: student.username, batch: batch._id, batchName: batch.name } });
  } catch (error) {
    console.error('[COORD] Error assigning student to batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/students/:userId/batch/remove
 * Coordinator: Remove a student from their batch (set batch to null).
 * Does NOT remove them from the center.
 */
export async function removeStudentFromBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;

    console.log('[COORD] Removing student', userId, 'from batch');

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Student', userId, 'is not in this center');
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }

    student.batch = null;
    await student.save();

    console.log('[COORD] Student', userId, 'removed from batch');
    res.json({ success: true, data: { _id: student._id, username: student.username } });
  } catch (error) {
    console.error('[COORD] Error removing student from batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/batches/:id/assign-students
 * Coordinator: Bulk assign multiple students to a batch.
 * Body: { userIds: [...] }
 * All students must belong to the coordinator's center.
 */
export async function bulkAssignStudentsToBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id: batchId } = req.params;
    const { userIds } = req.body;

    console.log('[COORD] Bulk assigning', userIds?.length, 'students to batch:', batchId);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    /* Verify the batch belongs to this coordinator's center */
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    if (batch.coachingCenter.toString() !== centerId.toString()) {
      return res.status(403).json({ error: 'Batch does not belong to your center' });
    }

    /* Verify all students belong to this center and assign them */
    const students = await User.find({ _id: { $in: userIds } });
    const notFound = userIds.filter(id => !students.find(s => s._id.toString() === id));
    const wrongCenter = students.filter(s => !s.coachingCenter || s.coachingCenter.toString() !== centerId.toString());

    if (notFound.length > 0) {
      return res.status(404).json({ error: `Students not found: ${notFound.join(', ')}` });
    }
    if (wrongCenter.length > 0) {
      return res.status(403).json({
        error: `Students not in your center: ${wrongCenter.map(s => s.username || s._id).join(', ')}`
      });
    }

    /* Bulk assign */
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { batch: batchId } }
    );

    console.log('[COORD] Bulk assigned', userIds.length, 'students to batch:', batchId);
    res.json({ success: true, assigned: userIds.length, batch: batch.name });
  } catch (error) {
    console.error('[COORD] Error bulk assigning:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/batches/:id/remove-students
 * Coordinator: Bulk remove multiple students from a batch.
 * Body: { userIds: [...] }
 */
export async function bulkRemoveStudentsFromBatch(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id: batchId } = req.params;
    const { userIds } = req.body;

    console.log('[COORD] Bulk removing', userIds?.length, 'students from batch:', batchId);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    /* Verify the batch belongs to this coordinator's center */
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    if (batch.coachingCenter.toString() !== centerId.toString()) {
      return res.status(403).json({ error: 'Batch does not belong to your center' });
    }

    /* Verify all students belong to this center */
    const students = await User.find({ _id: { $in: userIds } });
    const wrongCenter = students.filter(s => !s.coachingCenter || s.coachingCenter.toString() !== centerId.toString());
    if (wrongCenter.length > 0) {
      return res.status(403).json({
        error: `Students not in your center: ${wrongCenter.map(s => s.username || s._id).join(', ')}`
      });
    }

    /* Bulk remove from batch */
    await User.updateMany(
      { _id: { $in: userIds }, batch: batchId },
      { $set: { batch: null } }
    );

    console.log('[COORD] Bulk removed', userIds.length, 'students from batch:', batchId);
    res.json({ success: true, removed: userIds.length });
  } catch (error) {
    console.error('[COORD] Error bulk removing:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * ─────────────────────────────────────────────────────────
 * COURSE OFFERING MANAGEMENT (coordinator-scoped)
 * ─────────────────────────────────────────────────────────
 */

/*
 * GET /api/coordinator/course-offerings
 * Coordinator: List active course offerings for their own center.
 */
export async function getCoordinatorCourseOfferings(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Fetching course offerings for center:', centerId);
    const offerings = await CourseOffering.find({ coachingCenter: centerId })
      .sort({ name: 1 });
    console.log('[COORD] Course offerings fetched:', offerings.length);
    res.json({ data: offerings });
  } catch (error) {
    console.error('[COORD] Error fetching course offerings:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/course-offerings
 * Coordinator: Create a course offering for their own center.
 * coachingCenter is forced server-side — never accept from client body.
 */
export async function createCoordinatorCourseOffering(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Creating course offering for center:', centerId);
    const coordinatorUser = await User.findOne({ clerkId: req.userId });
    if (!coordinatorUser) {
      return res.status(404).json({ error: 'Coordinator user not found' });
    }
    const offering = await CourseOffering.create({
      coachingCenter: centerId,
      name: req.body.name,
      status: req.body.status || 'active',
      createdBy: coordinatorUser._id
    });
    console.log('[COORD] Course offering created:', offering._id, offering.name);
    res.status(201).json({ data: offering });
  } catch (error) {
    console.error('[COORD] Error creating course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/course-offerings/:id
 * Coordinator: Update a course offering name/status — only if it belongs to their center.
 */
export async function updateCoordinatorCourseOffering(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;
    console.log('[COORD] Updating course offering:', id);

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }
    if (offering.coachingCenter.toString() !== centerId.toString()) {
      return res.status(403).json({ error: 'Course offering does not belong to your center' });
    }

    const allowedFields = ['name', 'status'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        offering[field] = req.body[field];
      }
    }
    await offering.save();

    console.log('[COORD] Course offering updated:', id);
    res.json({ data: offering });
  } catch (error) {
    console.error('[COORD] Error updating course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coordinator/course-offerings/:id
 * Coordinator: Delete a course offering — only if it belongs to their center and has no linked batches.
 */
export async function deleteCoordinatorCourseOffering(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;
    console.log('[COORD] Deleting course offering:', id);

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }
    if (offering.coachingCenter.toString() !== centerId.toString()) {
      return res.status(403).json({ error: 'Course offering does not belong to your center' });
    }

    const linkedBatches = await Batch.countDocuments({ courseOffering: id });
    if (linkedBatches > 0) {
      return res.status(409).json({
        error: `Cannot delete course offering with ${linkedBatches} linked batch(es). Archive it instead.`
      });
    }

    await CourseOffering.findByIdAndDelete(id);
    console.log('[COORD] Course offering deleted:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('[COORD] Error deleting course offering:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/students/:userId/course
 * Coordinator: Change a student's course offering.
 * Body: { courseOfferingId } (or null to clear it).
 * Double ownership check: student belongs to center AND course belongs to center.
 */
export async function updateStudentCourse(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;
    const { courseOfferingId } = req.body;

    console.log('[COORD] Updating course for student:', userId);

    /* Verify the student belongs to this center */
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }

    /* If setting a course offering, verify it belongs to this center */
    if (courseOfferingId) {
      const co = await CourseOffering.findById(courseOfferingId);
      if (!co || co.coachingCenter.toString() !== centerId.toString()) {
        return res.status(403).json({ error: 'Course offering does not belong to your center' });
      }
    }

    student.courseOffering = courseOfferingId || null;
    await student.save();

    console.log('[COORD] Student course updated:', userId, '->', courseOfferingId);
    res.json({ data: student });
  } catch (error) {
    console.error('[COORD] Error updating student course:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/export
 * Coordinator: Export own center's roster + progress stats as CSV.
 * Tenant-scoped: only students in req.coordinatorCenterId.
 */
export async function exportCoordinatorCsv(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] CSV export requested for center:', centerId);

    const roster = await getCenterRoster(centerId);
    const { center, students } = roster;

    const rows = [];

    /* ── Header ── */
    rows.push(['SECTION: CENTER INFO']);
    rows.push(['Center Name', center.name]);
    rows.push(['Contact', center.contactName || '']);
    rows.push(['Email', center.contactEmail || '']);
    rows.push(['Phone', center.contactPhone || '']);
    rows.push(['Status', center.status || '']);
    rows.push(['']);

    /* ── Student Data ── */
    rows.push(['SECTION: STUDENT PROGRESS']);
    rows.push([
      'Username', 'Display Name', 'Email', 'College', 'Year',
      'Joined Centre',
      'DSA Lessons', 'DSA Subtopics', 'DSA Problems', 'DSA Overall %', 'DSA Quiz Avg',
      'DBMS Lessons', 'DBMS Subtopics', 'DBMS Problems', 'DBMS Overall %', 'DBMS Quiz Avg',
      'OS Lessons', 'OS Subtopics', 'OS Problems', 'OS Overall %', 'OS Quiz Avg',
      'PROG Lessons', 'PROG Subtopics', 'PROG Problems', 'PROG Overall %', 'PROG Quiz Avg',
      'Overall Completed', 'Overall Total', 'Overall %',
      'Status'
    ]);

    for (const s of students) {
      const p = s.progress || {};
      const subjects = ['dsa', 'dbms', 'os', 'programming'];
      let totalCompleted = 0, totalItems = 0;
      let quizTaken = 0, quizScoreSum = 0;
      const row = [
        s.username || '',
        s.displayName || '',
        s.email || '',
        s.college || '',
        s.year || '',
        s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toISOString().split('T')[0] : ''
      ];

      for (const sub of subjects) {
        const d = p[sub];
        if (d) {
          const subPct = d.overall.total > 0 ? Math.round((d.overall.completed / d.overall.total) * 100) : 0;
          row.push(d.lessons.completed, d.lessons.total);
          row.push(d.subtopics.completed, d.subtopics.total);
          row.push(d.problems.completed, d.problems.total);
          row.push(`${subPct}%`);
          row.push(`${d.quizzes?.avgScore || 0}%`);
          totalCompleted += d.overall.completed;
          totalItems += d.overall.total;
          if (d.quizzes) {
            quizTaken += d.quizzes.quizzesTaken;
            quizScoreSum += (d.quizzes.avgScore || 0) * (d.quizzes.quizzesTaken || 0);
          }
        } else {
          row.push(0, 0, 0, 0, 0, 0, '0%', '0%');
        }
      }

      const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
      const overallQuizAvg = quizTaken > 0 ? Math.round(quizScoreSum / quizTaken) : null;
      const status = overallPct > 0 ? deriveStatus({ completionPct: overallPct, quizAvgPct: overallQuizAvg }) : 'Not started';

      row.push(totalCompleted, totalItems, `${overallPct}%`, status);
      rows.push(row);
    }

    rows.push(['']);
    rows.push(['Generated on', new Date().toISOString()]);
    rows.push([`Exported by ${roster.center.name} coordinator`]);

    /* Build CSV string */
    const csv = rows.map(r => r.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell === null || cell === undefined ? '' : String(cell);
    }).join(',')).join('\r\n');

    const slug = center.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug}_student_progress_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log('[COORD] CSV export sent:', filename, '| students:', students.length);
  } catch (error) {
    console.error('[COORD] Error exporting CSV:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PATCH /api/coordinator/students/:userId/remove
 * Removes a student from the coordinator's own center.
 * Verifies the target user's coachingCenter matches the coordinator's center.
 */
export async function removeStudent(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;

    console.log('[COORD] Removing student', userId, 'from center:', centerId);

    /* Verify the target user is actually linked to THIS center */
    const student = await User.findById(userId).select('coachingCenter displayName username');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Student', userId, 'is not in this center');
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }

    /* Remove the center link — does NOT delete the user account */
    student.coachingCenter = null;
    student.coachingCenterJoinedAt = null;
    await student.save();

    console.log('[COORD] Student removed from center:', userId);
    res.json({ success: true, data: { _id: student._id, username: student.username } });
  } catch (error) {
    console.error('[COORD] Error removing student:', error.message);
    res.status(500).json({ error: error.message });
  }
}
