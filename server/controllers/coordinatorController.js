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
import CoachingCenter from '../models/CoachingCenter.js';
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

      for (const subject of ['dsa', 'dbms', 'os', 'programming', 'aptitude']) {
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
      .sort({ createdAt: -1 })
      .lean();
    /* Enrich each batch with student count (users in this coaching center assigned to this batch).
       Faculty members are NOT students — exclude them so promoted teachers vanish from student counts.
       Also attach the teachers assigned to this batch (faculty whose scope includes this batch)
       so the coordinator UI can mention them separately. */
    const enriched = await Promise.all(batches.map(async b => {
      const studentCount = await User.countDocuments({ coachingCenter: centerId, batch: b._id, isFaculty: { $ne: true } });
      const teachers = await User.find({ coachingCenter: centerId, isFaculty: true, facultyBatches: b._id })
        .select('displayName username avatar _id')
        .lean();
      return { ...b, studentCount, teachers };
    }));
    console.log('[COORD] Batches fetched:', enriched.length);
    res.json({ data: enriched });
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
      console.log('[COORD] Unlinking', linkedStudents, 'students from batch:', id);
      await User.updateMany({ batch: id }, { $set: { batch: null } });
    }

    await Batch.findByIdAndDelete(id);
    console.log('[COORD] Batch deleted:', id, '- unlinked students:', linkedStudents);
    res.json({ success: true, unlinkedStudents: linkedStudents });
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
      'Joined Centre', 'Batch',
      'DSA Lessons', 'DSA Subtopics', 'DSA Problems', 'DSA Overall %', 'DSA Quiz Avg',
      'DBMS Lessons', 'DBMS Subtopics', 'DBMS Problems', 'DBMS Overall %', 'DBMS Quiz Avg',
      'OS Lessons', 'OS Subtopics', 'OS Problems', 'OS Overall %', 'OS Quiz Avg',
      'PROG Lessons', 'PROG Subtopics', 'PROG Problems', 'PROG Overall %', 'PROG Quiz Avg',
      'APT Lessons', 'APT Subtopics', 'APT Problems', 'APT Overall %', 'APT Quiz Avg',
      'Overall Completed', 'Overall Total', 'Overall %',
      'Status', 'Needs Attention', 'Attention Reasons'
    ]);

    for (const s of students) {
      const p = s.progress || {};
      const subjects = ['dsa', 'dbms', 'os', 'programming', 'aptitude'];
      let totalCompleted = 0, totalItems = 0;
      let quizTaken = 0, quizScoreSum = 0;
      const row = [
        s.username || '',
        s.displayName || '',
        s.email || '',
        s.college || '',
        s.year || '',
        s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toISOString().split('T')[0] : '',
        s.batch?.name || ''
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
      row.push(s.needsAttention ? 'Yes' : 'No');
      row.push(s.attentionReasons ? s.attentionReasons.join('; ') : '');
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
 * PATCH /api/coordinator/center/code
 * Coordinator: Update their center's join code.
 * Accepts either { code: 'newcode' } to set a specific code,
 * or { regenerate: true } to auto-generate a random code.
 * No restrictions on code format — any non-empty string is accepted.
 * Uniqueness is enforced server-side (case-sensitive).
 */
export async function updateCenterCode(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Updating center code for center:', centerId);

    const center = await CoachingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({ error: 'Coaching center not found' });
    }

    if (req.body.regenerate === true) {
      /* Auto-generate a random code using the shared generator */
      center.code = generateCode();
    } else if (req.body.code) {
      const code = req.body.code.trim();
      /* Check uniqueness (case-sensitive) */
      const existing = await CoachingCenter.findOne({ code, _id: { $ne: centerId } });
      if (existing) {
        return res.status(409).json({ error: 'This code is already in use by another center' });
      }
      center.code = code;
    } else {
      return res.status(400).json({ error: 'Provide a code or set regenerate: true' });
    }

    center.codeRegeneratedAt = new Date();
    await center.save();

    console.log('[COORD] Center code updated:', center.code);
    res.json({ data: { code: center.code } });
  } catch (error) {
    console.error('[COORD] Error updating center code:', error.message);
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
    student.batch = null;
    student.courseOffering = null;
    /*
     * Faculty status dies with the center link — same additive rule as the
     * admin removeStudentFromCenter: a faculty member can only teach batches
     * of the center they belong to.
     */
    student.isFaculty = false;
    student.facultyBatches = [];
    await student.save();

    console.log('[COORD] Student removed from center:', userId, '— batch, courseOffering and faculty status cleared');
    res.json({ success: true, data: { _id: student._id, username: student.username } });
  } catch (error) {
    console.error('[COORD] Error removing student:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/students/:userId/promote
 * Coordinator: Promote a regular student of the own center to faculty.
 * Mongo-only — faculty status never enters Clerk (no clerk.users.updateUser call).
 * Optional body { batchId } — when promoting "from a batch", that batch becomes
 * the teacher's DEFAULT scope (facultyBatches = [batchId]); the coordinator can
 * assign more batches afterwards via PUT /api/coordinator/faculties/:userId/batches.
 * Without batchId, facultyBatches stays empty (existing behavior).
 */
export async function promoteStudentToFaculty(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;
    const { batchId } = req.body || {};

    console.log('[COORD] Promoting student to faculty:', userId, batchId ? `default batch ${batchId}` : 'no default batch');

    const student = await User.findById(userId).select('coachingCenter role isFaculty displayName username');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    /* Security: only regular students of THIS center can be promoted */
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Promote rejected — student not in this center:', userId);
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }
    if (student.role !== 'user') {
      console.log('[COORD] Promote rejected — student is a staff role:', userId, student.role);
      return res.status(400).json({ error: 'Only regular students can be promoted to faculty' });
    }
    if (student.isFaculty) {
      console.log('[COORD] Promote rejected — already faculty:', userId);
      return res.status(400).json({ error: 'Student is already a faculty member' });
    }

    /* If a default batch was given, validate it belongs to THIS center */
    if (batchId) {
      const batch = await Batch.findById(batchId).select('coachingCenter name').lean();
      if (!batch) {
        return res.status(400).json({ error: 'Batch does not exist' });
      }
      if (batch.coachingCenter.toString() !== centerId.toString()) {
        console.log('[COORD] Promote rejected — default batch belongs to another center:', batchId);
        return res.status(400).json({ error: `Batch "${batch.name}" is not in your center` });
      }
    }

    student.isFaculty = true;
    /* Promote "from a batch" → that batch is the default scope; otherwise empty scope */
    student.facultyBatches = batchId ? [batchId] : [];
    await student.save();

    console.log('[COORD] Student promoted to faculty:', userId, 'scope:', student.facultyBatches);
    res.json({ success: true, data: { _id: student._id, displayName: student.displayName, username: student.username, isFaculty: true, facultyBatches: student.facultyBatches } });
  } catch (error) {
    console.error('[COORD] Error promoting student to faculty:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/students/:userId/revoke-faculty
 * Coordinator: Revoke faculty status — the person becomes a regular student
 * of the center again. Clears ONLY isFaculty + facultyBatches; their own
 * coachingCenter, student batch, progress, and submissions all survive.
 */
export async function revokeFaculty(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;

    console.log('[COORD] Revoking faculty status for:', userId);

    const student = await User.findById(userId).select('coachingCenter isFaculty displayName username');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    /* Only own-center faculty can be revoked */
    if (!student.coachingCenter || student.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Revoke rejected — student not in this center:', userId);
      return res.status(403).json({ error: 'Student is not linked to your center' });
    }
    if (!student.isFaculty) {
      console.log('[COORD] Revoke rejected — not a faculty member:', userId);
      return res.status(400).json({ error: 'Student is not a faculty member' });
    }

    /* Targeted clear — nothing else on the user doc is touched */
    student.isFaculty = false;
    student.facultyBatches = [];
    await student.save();

    console.log('[COORD] Faculty status revoked — back to regular student:', userId);
    res.json({ success: true, data: { _id: student._id, displayName: student.displayName, username: student.username, isFaculty: false } });
  } catch (error) {
    console.error('[COORD] Error revoking faculty status:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/faculties
 * Coordinator: List all faculty members of the own center,
 * with their assigned batches populated.
 */
export async function getCoordinatorFaculties(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    console.log('[COORD] Fetching faculties for center:', centerId);

    const faculties = await User.find({ coachingCenter: centerId, isFaculty: true })
      .select('displayName username avatar email isFaculty facultyBatches batch coachingCenterJoinedAt')
      .populate('facultyBatches', 'name code status expectedStudents')
      .sort({ displayName: 1 });

    console.log('[COORD] Faculties fetched:', faculties.length);
    res.json({ data: faculties });
  } catch (error) {
    console.error('[COORD] Error fetching faculties:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coordinator/faculties/:userId/batches
 * Coordinator: Set the batch scope of a faculty member.
 * Body: { batchIds: [] } — replaces the whole facultyBatches array.
 * Validates: every batch belongs to the coordinator's center, all batches
 * share ONE center (single-center rule), the target is a faculty member
 * of the coordinator's center.
 */
export async function updateFacultyBatches(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { userId } = req.params;
    const { batchIds } = req.body;

    console.log('[COORD] Updating faculty batches for:', userId, batchIds);

    if (!Array.isArray(batchIds)) {
      return res.status(400).json({ error: 'batchIds must be an array' });
    }

    /* Target must be an own-center faculty member */
    const faculty = await User.findById(userId).select('coachingCenter isFaculty displayName username');
    if (!faculty) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!faculty.coachingCenter || faculty.coachingCenter.toString() !== centerId.toString()) {
      console.log('[COORD] Batch assign rejected — user not in this center:', userId);
      return res.status(403).json({ error: 'User is not linked to your center' });
    }
    if (!faculty.isFaculty) {
      console.log('[COORD] Batch assign rejected — user is not faculty:', userId);
      return res.status(400).json({ error: 'User is not a faculty member' });
    }

    /* Validate every batch belongs to the coordinator's center */
    const uniqueIds = [...new Set(batchIds.filter(Boolean))];
    const batches = uniqueIds.length > 0
      ? await Batch.find({ _id: { $in: uniqueIds } }).select('coachingCenter status name').lean()
      : [];

    if (batches.length !== uniqueIds.length) {
      console.log('[COORD] Batch assign rejected — unknown batch ids:', uniqueIds);
      return res.status(400).json({ error: 'One or more batches do not exist' });
    }
    for (const batch of batches) {
      if (batch.coachingCenter.toString() !== centerId.toString()) {
        console.log('[COORD] Batch assign rejected — batch belongs to another center:', batch._id);
        return res.status(400).json({ error: `Batch "${batch.name}" is not in your center` });
      }
    }

    /* Single-center rule is inherent — every batch above already belongs to THIS center */

    faculty.facultyBatches = uniqueIds;
    await faculty.save();

    console.log('[COORD] Faculty batches updated:', userId, '->', uniqueIds.length);
    res.json({ success: true, data: { _id: faculty._id, facultyBatches: uniqueIds } });
  } catch (error) {
    console.error('[COORD] Error updating faculty batches:', error.message);
    res.status(500).json({ error: error.message });
  }
}
