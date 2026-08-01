/*
 * Assignment Controller — Assignments for coaching center batches.
 * Coordinators create/manage assignments. Students view and submit drive links.
 * All endpoints are scoped to the coordinator's own center or the student's batch.
 */
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Batch from '../models/Batch.js';
import User from '../models/User.js';
import CoachingCenter from '../models/CoachingCenter.js';
import Notification from '../models/Notification.js';

/* ────────────────────────────────────────────── */
/*  COORDINATOR ENDPOINTS                        */
/* ────────────────────────────────────────────── */

/*
 * GET /api/coordinator/assignments
 * List assignments for the coordinator's center.
 * Optional query param: ?batchId=X to filter by batch.
 */
export async function getCoordinatorAssignments(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { batchId, status } = req.query;

    console.log('[ASSIGN] Fetching assignments for center:', centerId);

    const query = { coachingCenter: centerId };
    if (batchId) query.batch = batchId;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .sort({ createdAt: -1 })
      .lean();

    /* Enrich each assignment with submission count stats */
    const enriched = await Promise.all(assignments.map(async a => {
      const totalSubmissions = await AssignmentSubmission.countDocuments({ assignment: a._id });
      const approvedCount = await AssignmentSubmission.countDocuments({ assignment: a._id, status: 'approved' });
      const pendingCount = await AssignmentSubmission.countDocuments({ assignment: a._id, status: 'submitted' });
      /* Count students only if assignment has a batch */
      const totalStudents = a.batch?._id 
        ? await User.countDocuments({ coachingCenter: centerId, batch: a.batch._id })
        : 0;
      return {
        ...a,
        _submissionStats: { total: totalSubmissions, approved: approvedCount, pending: pendingCount, totalStudents }
      };
    }));

    console.log('[ASSIGN] Assignments fetched:', enriched.length);
    res.json({ data: enriched });
  } catch (error) {
    console.error('[ASSIGN] Error fetching assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/assignments/:id
 * Get a single assignment with all student submissions.
 */
export async function getCoordinatorAssignmentById(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;

    console.log('[ASSIGN] Fetching assignment:', id);

    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId })
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    /* Fetch all submissions for this assignment, populated with student info */
    const submissions = await AssignmentSubmission.find({ assignment: id })
      .populate('student', 'displayName username avatar email college')
      .sort({ submittedAt: -1 })
      .lean();

    /* Get all students in this batch for "not submitted" list (skip if no batch assigned) */
    let notSubmitted = [];
    if (assignment.batch?._id) {
      const batchStudents = await User.find({ coachingCenter: centerId, batch: assignment.batch._id })
        .select('displayName username avatar email college _id')
        .lean();
      const submittedStudentIds = new Set(submissions.map(s => s.student._id.toString()));
      notSubmitted = batchStudents.filter(s => !submittedStudentIds.has(s._id.toString()));
    }

    console.log('[ASSIGN] Assignment fetched:', assignment.title, '- submissions:', submissions.length);
    res.json({ data: { ...assignment, submissions, notSubmitted } });
  } catch (error) {
    console.error('[ASSIGN] Error fetching assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/assignments
 * Create a new assignment for a batch in the coordinator's center.
 * Also creates notifications for all students in the batch.
 */
export async function createAssignment(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { title, instructions, attachmentLink, batchId, startDate, endDate, status } = req.body;
    
    console.log('========== [ASSIGN] CREATE ASSIGNMENT ==========');
    console.log('[ASSIGN] Received body keys:', Object.keys(req.body));
    console.log('[ASSIGN] title:', title);
    console.log('[ASSIGN] batchId:', batchId);
    console.log('[ASSIGN] startDate:', startDate);
    console.log('[ASSIGN] endDate:', endDate);
    console.log('[ASSIGN] status:', status);
    console.log('[ASSIGN] centerId from middleware:', centerId);
    console.log('[ASSIGN] req.userId from Clerk:', req.userId);

    if (!title || !startDate || !endDate) {
      console.log('[ASSIGN] ❌ Validation FAILED — missing fields: title:', !!title, 'startDate:', !!startDate, 'endDate:', !!endDate);
      return res.status(400).json({ error: 'Title, start date, and end date are required' });
    }

    console.log('[ASSIGN] Looking up coordinator user by clerkId:', req.userId);
    const coordinatorUser = await User.findOne({ clerkId: req.userId });
    if (!coordinatorUser) {
      console.log('[ASSIGN] ❌ Coordinator user not found for clerkId:', req.userId);
      return res.status(404).json({ error: 'Coordinator user not found' });
    }
    console.log('[ASSIGN] ✅ Coordinator user found:', coordinatorUser._id, coordinatorUser.displayName);

    /* Verify the batch belongs to this center if provided */
    let batchObj = null;
    if (batchId) {
      console.log('[ASSIGN] Looking up batch:', batchId);
      batchObj = await Batch.findById(batchId);
      if (!batchObj) {
        console.log('[ASSIGN] ❌ Batch not found in DB:', batchId);
        return res.status(400).json({ error: 'Batch not found' });
      }
      console.log('[ASSIGN] ✅ Batch found:', { name: batchObj.name, center: batchObj.coachingCenter });
      
      if (batchObj.coachingCenter.toString() !== centerId.toString()) {
        console.log('[ASSIGN] ❌ Batch center mismatch — batch center:', batchObj.coachingCenter.toString(), '| req center:', centerId.toString());
        return res.status(400).json({ error: 'Batch does not belong to your center' });
      }
      console.log('[ASSIGN] ✅ Batch center verified');
    } else {
      console.log('[ASSIGN] No batchId provided — creating assignment without batch');
    }

    console.log('[ASSIGN] Creating Assignment document in MongoDB...');
    console.log('[ASSIGN] Data to insert:', { 
      title, batch: batchId || null, coachingCenter: centerId,
      createdBy: coordinatorUser._id,
      startDate: new Date(startDate), endDate: new Date(endDate),
      status: status || 'draft'
    });
    
    const assignment = await Assignment.create({
      title,
      instructions: instructions || '',
      attachmentLink: attachmentLink || '',
      batch: batchId || null,
      coachingCenter: centerId,
      createdBy: coordinatorUser._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'draft'
    });
    
    console.log('[ASSIGN] ✅ Assignment document CREATED:', assignment._id);

    /* If status is 'active' and a batch is set, send notifications to all students in the batch */
    if (assignment.status === 'active' && batchId) {
      console.log('[ASSIGN] Status is active — sending notifications...');
      const students = await User.find({ coachingCenter: centerId, batch: batchId });
      console.log('[ASSIGN] Found', students.length, 'students to notify');
      
      /* Fetch center info for notification display (logo + name instead of coordinator) */
      const center = await CoachingCenter.findById(centerId).select('name logo').lean();
      
      const notifications = students.map(s => ({
        user: s._id,
        from: coordinatorUser._id,
        type: 'assignment_created',
        title: `New Assignment`,
        message: `"${assignment.title}" — Complete it before ${new Date(assignment.endDate).toLocaleDateString()} at 11:59 PM.`,
        link: `/assignments/${assignment._id}`,
        centerName: center?.name || '',
        centerLogo: center?.logo || '',
        read: false
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log('[ASSIGN] ✅ Notifications sent to', notifications.length, 'students');
      }
    } else {
      console.log('[ASSIGN] Status:', assignment.status, '| batchId:', !!batchId, '— skipping notifications');
    }

    console.log('[ASSIGN] Re-fetching with population...');
    const populated = await Assignment.findById(assignment._id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    console.log('[ASSIGN] ✅ Assignment creation complete — responding with 201');
    console.log('[ASSIGN] Final response data:', { id: populated._id, title: populated.title });
    console.log('===============================================');
    res.status(201).json({ data: populated });
  } catch (error) {
    console.error('[ASSIGN] Error creating assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coordinator/assignments/:id
 * Update an existing assignment.
 */
export async function updateAssignment(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;

    console.log('[ASSIGN] Updating assignment:', id);

    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const allowedFields = ['title', 'instructions', 'attachmentLink', 'startDate', 'endDate', 'status'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          assignment[field] = new Date(req.body[field]);
        } else {
          assignment[field] = req.body[field];
        }
      }
    }

    /* Handle batchId → batch mapping (frontend sends batchId, model expects batch) */
    if (req.body.batchId !== undefined) {
      const batchId = req.body.batchId;
      if (batchId) {
        /* Verify the batch belongs to this center */
        const batch = await Batch.findById(batchId);
        if (!batch) {
          return res.status(400).json({ error: 'Batch not found' });
        }
        if (batch.coachingCenter.toString() !== centerId.toString()) {
          return res.status(400).json({ error: 'Batch does not belong to your center' });
        }
        assignment.batch = batchId;
      } else {
        /* Clear the batch if empty string sent */
        assignment.batch = null;
      }
    }

    await assignment.save();

    /* If newly activated and has a batch, send notifications (single assignment_created notif per assignment) */
    if (req.body.status === 'active' && assignment.status === 'active' && assignment.batch) {
      const existingNotifs = await Notification.countDocuments({
        type: 'assignment_created',
        link: `/assignments/${assignment._id}`
      });
      if (existingNotifs === 0) {
        const coordinatorUser = await User.findOne({ clerkId: req.userId });
        /* Fetch center info for notification display */
        const center = await CoachingCenter.findById(centerId).select('name logo').lean();
        const students = await User.find({ coachingCenter: centerId, batch: assignment.batch });
        const notifications = students.map(s => ({
          user: s._id,
          from: coordinatorUser?._id,
          type: 'assignment_created',
          title: `New Assignment`,
          message: `"${assignment.title}" — Complete it before ${new Date(assignment.endDate).toLocaleDateString()} at 11:59 PM.`,
          link: `/assignments/${assignment._id}`,
          centerName: center?.name || '',
          centerLogo: center?.logo || '',
          read: false
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    console.log('[ASSIGN] Assignment updated:', id);
    res.json({ data: populated });
  } catch (error) {
    console.error('[ASSIGN] Error updating assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coordinator/assignments/:id
 * Delete an assignment and all its submissions.
 */
export async function deleteAssignment(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;

    console.log('[ASSIGN] Deleting assignment:', id);

    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    /* Delete all related submissions first */
    await AssignmentSubmission.deleteMany({ assignment: id });
    /* Delete the assignment */
    await Assignment.findByIdAndDelete(id);

    console.log('[ASSIGN] Assignment deleted:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('[ASSIGN] Error deleting assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coordinator/assignments/:id/bulk-grade
 * Grade ALL submissions for an assignment at once (approve or reject).
 */
export async function bulkGradeSubmissions(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;
    const { status, feedback } = req.body;

    console.log('[ASSIGN] Bulk grading all submissions for assignment:', id, '->', status);

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    /* Verify the assignment belongs to this center */
    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const coordinatorUser = await User.findOne({ clerkId: req.userId });

    /* Update all pending (submitted) submissions */
    const result = await AssignmentSubmission.updateMany(
      { assignment: id, status: 'submitted' },
      { $set: { status, feedback: feedback || '' } }
    );

    console.log('[ASSIGN] Bulk graded:', result.modifiedCount, 'submissions');

    /* Fetch center info for notification display (consistent with assignment_created) */
    const center = await CoachingCenter.findById(centerId).select('name logo').lean();

    /* Send notifications to all affected students */
    const affectedSubmissions = await AssignmentSubmission.find({ assignment: id, status }).populate('student', '_id').lean();
    const notifType = status === 'approved' ? 'assignment_approved' : 'assignment_rejected';
    const notifications = affectedSubmissions.map(sub => ({
      user: sub.student._id,
      from: coordinatorUser?._id || undefined,
      type: notifType,
      title: `Assignment ${status}: ${assignment.title}`,
      message: feedback
        ? `Your submission for "${assignment.title}" has been ${status}. Feedback: ${feedback}`
        : `Your submission for "${assignment.title}" has been ${status}.`,
      link: `/assignments/${assignment._id}`,
      centerName: center?.name || '',
      centerLogo: center?.logo || '',
      read: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log('[ASSIGN] ✅ Bulk notifications sent:', notifications.length);
    }

    /* Re-fetch populated assignment to return fresh data */
    const populated = await Assignment.findById(id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    const submissions = await AssignmentSubmission.find({ assignment: id })
      .populate('student', 'displayName username avatar email college')
      .sort({ submittedAt: -1 })
      .lean();

    let notSubmitted = [];
    if (populated.batch?._id) {
      const batchStudents = await User.find({ coachingCenter: centerId, batch: populated.batch._id })
        .select('displayName username avatar email college _id')
        .lean();
      const submittedIds = new Set(submissions.map(s => s.student._id.toString()));
      notSubmitted = batchStudents.filter(s => !submittedIds.has(s._id.toString()));
    }

    console.log('[ASSIGN] Bulk grade complete — assignment refreshed');
    res.json({ data: { ...populated, submissions, notSubmitted }, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('[ASSIGN] Error bulk grading:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coordinator/assignments/:id/submissions/:submissionId
 * Grade/feedback a student's submission (approve/reject).
 */
export async function gradeSubmission(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id, submissionId } = req.params;
    const { status, feedback } = req.body;

    console.log('[ASSIGN] Grading submission:', submissionId, '->', status);

    /* Verify the assignment belongs to this center */
    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    /* Security: verify the submission belongs to this assignment — same IDOR guard
       as deleteSubmission. Without it, a coordinator could grade a submission from
       a different assignment (or another center's assignment) by passing an
       arbitrary submissionId against their own assignment id. */
    if (submission.assignment.toString() !== id) {
      return res.status(400).json({ error: 'Submission does not belong to this assignment' });
    }

    if (status) submission.status = status;
    if (feedback !== undefined) submission.feedback = feedback;
    await submission.save();

    /* Find the coordinator user for the notification's `from` field */
    const coordinatorUser = await User.findOne({ clerkId: req.userId });

    /* Send notification to the student who submitted */
    if (status && ['approved', 'rejected'].includes(status) && submission.student) {
      const notifType = status === 'approved' ? 'assignment_approved' : 'assignment_rejected';
      const studentId = submission.student._id || submission.student;
      
      console.log('[ASSIGN] Sending', notifType, 'notification to student:', studentId);
      
      /* Fetch center info for notification display (consistent with assignment_created) */
      const center = await CoachingCenter.findById(centerId).select('name logo').lean();
      
      await Notification.create({
        user: studentId,
        from: coordinatorUser?._id || undefined,
        type: notifType,
        title: `Assignment ${status}: ${assignment.title}`,
        message: feedback
          ? `Your submission for "${assignment.title}" has been ${status}. Feedback: ${feedback}`
          : `Your submission for "${assignment.title}" has been ${status}.`,
        link: `/assignments/${assignment._id}`,
        centerName: center?.name || '',
        centerLogo: center?.logo || '',
        read: false
      });
      
      console.log('[ASSIGN] ✅ Notification sent to student:', studentId);
    }

    const populated = await AssignmentSubmission.findById(submission._id)
      .populate('student', 'displayName username avatar')
      .lean();

    console.log('[ASSIGN] Submission graded:', submissionId, '->', status);
    res.json({ data: populated });
  } catch (error) {
    console.error('[ASSIGN] Error grading submission:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coordinator/assignments/:id/submissions/:submissionId
 * Remove a single student's submission (reset to not submitted).
 */
export async function deleteSubmission(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id, submissionId } = req.params;

    console.log('[ASSIGN] Deleting submission:', submissionId, 'from assignment:', id);

    /* Verify the assignment belongs to this center */
    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    /* Security: verify the submission belongs to this assignment */
    if (submission.assignment.toString() !== id) {
      return res.status(400).json({ error: 'Submission does not belong to this assignment' });
    }

    await AssignmentSubmission.findByIdAndDelete(submissionId);
    console.log('[ASSIGN] ✅ Submission deleted:', submissionId);

    /* Re-fetch populated assignment to return fresh data */
    const populated = await Assignment.findById(id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    const submissions = await AssignmentSubmission.find({ assignment: id })
      .populate('student', 'displayName username avatar email college')
      .sort({ submittedAt: -1 })
      .lean();

    let notSubmitted = [];
    if (populated.batch?._id) {
      const batchStudents = await User.find({ coachingCenter: centerId, batch: populated.batch._id })
        .select('displayName username avatar email college _id')
        .lean();
      const submittedIds = new Set(submissions.map(s => s.student._id.toString()));
      notSubmitted = batchStudents.filter(s => !submittedIds.has(s._id.toString()));
    }

    res.json({ data: { ...populated, submissions, notSubmitted } });
  } catch (error) {
    console.error('[ASSIGN] Error deleting submission:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coordinator/assignments/:id/submissions
 * Remove ALL submissions for an assignment (students must resubmit).
 */
export async function deleteAllSubmissions(req, res) {
  try {
    const centerId = req.coordinatorCenterId;
    const { id } = req.params;

    console.log('[ASSIGN] Deleting ALL submissions for assignment:', id);

    /* Verify the assignment belongs to this center */
    const assignment = await Assignment.findOne({ _id: id, coachingCenter: centerId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const result = await AssignmentSubmission.deleteMany({ assignment: id });
    console.log('[ASSIGN] ✅ All submissions deleted:', result.deletedCount);

    /* Re-fetch populated assignment to return fresh data */
    const populated = await Assignment.findById(id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    const submissions = [];
    let notSubmitted = [];
    if (populated.batch?._id) {
      const batchStudents = await User.find({ coachingCenter: centerId, batch: populated.batch._id })
        .select('displayName username avatar email college _id')
        .lean();
      notSubmitted = batchStudents;
    }

    res.json({ data: { ...populated, submissions, notSubmitted } });
  } catch (error) {
    console.error('[ASSIGN] Error deleting all submissions:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  STUDENT ENDPOINTS                            */
/* ────────────────────────────────────────────── */

/*
 * GET /api/student/assignments
 * List assignments for the student's batch.
 * Only shows active assignments (not draft/completed).
 */
export async function getStudentAssignments(req, res) {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const batchId = user.batch;
    if (!batchId) {
      return res.json({ data: [] });
    }

    const now = new Date();
    const assignments = await Assignment.find({
      batch: batchId,
      status: 'active'
    })
      .populate('createdBy', 'displayName username')
      .sort({ endDate: 1 })
      .lean();

    /* Enrich with submission status */
    const enriched = await Promise.all(assignments.map(async a => {
      const submission = await AssignmentSubmission.findOne({ assignment: a._id, student: user._id }).lean();
      /* Allow resubmission if the submission was rejected */
      const isRejected = submission?.status === 'rejected';
      /* Fix timezone: construct local midnight of day after endDate so deadline is end-of-day LOCAL time */
      const ed = new Date(a.endDate);
      const endOfEndDate = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate() + 1);
      /* Fix timezone: construct local midnight of startDate so it becomes available at local midnight */
      const sd = new Date(a.startDate);
      const startOfStartDate = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
      return {
        ...a,
        _submission: submission || null,
        _isOverdue: now >= endOfEndDate,
        _canSubmit: now >= startOfStartDate && now < endOfEndDate && (!submission || isRejected)
      };
    }));

    console.log('[ASSIGN] Student assignments fetched:', enriched.length);
    res.json({ data: enriched });
  } catch (error) {
    console.error('[ASSIGN] Error fetching student assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/student/assignments/:id
 * Get a single assignment detail with the student's own submission if any.
 */
export async function getStudentAssignmentById(req, res) {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { id } = req.params;

    const assignment = await Assignment.findOne({ _id: id, status: { $ne: 'draft' } })
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    /* Verify the student is in the same batch */
    if (!user.batch || user.batch.toString() !== assignment.batch._id.toString()) {
      return res.status(403).json({ error: 'This assignment is not for your batch' });
    }

    const submission = await AssignmentSubmission.findOne({ assignment: id, student: user._id }).lean();

    console.log('[ASSIGN] Student assignment detail fetched:', assignment.title);
    res.json({ data: { ...assignment, _submission: submission || null } });
  } catch (error) {
    console.error('[ASSIGN] Error fetching student assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/student/assignments/:id/submit
 * Submit a Google Drive link for an assignment.
 */
export async function submitAssignment(req, res) {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { id } = req.params;
    const { driveLink } = req.body;

    if (!driveLink) {
      return res.status(400).json({ error: 'Drive link is required' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    /* Verify the student is in the same batch */
    if (!user.batch || user.batch.toString() !== assignment.batch.toString()) {
      return res.status(403).json({ error: 'This assignment is not for your batch' });
    }

    const now = new Date();
    const startSd = new Date(assignment.startDate);
    const startOfStartDate = new Date(startSd.getFullYear(), startSd.getMonth(), startSd.getDate());
    if (now < startOfStartDate) {
      return res.status(400).json({ error: 'This assignment has not started yet' });
    }
    /* Fix timezone: construct local midnight of day after endDate so deadline is end-of-day LOCAL time */
    const ed = new Date(assignment.endDate);
    const endOfEndDate = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate() + 1);
    if (now >= endOfEndDate) {
      return res.status(400).json({ error: 'This assignment deadline has passed' });
    }

    /* Check if already submitted — allow resubmission if rejected */
    const existing = await AssignmentSubmission.findOne({ assignment: id, student: user._id });
    if (existing) {
      if (existing.status === 'rejected') {
        /* Rejected submission: update the drive link and reset status to submitted */
        existing.driveLink = driveLink;
        existing.submittedAt = new Date();
        existing.status = 'submitted';
        existing.feedback = ''; /* Clear previous rejection feedback */
        await existing.save();

        const populated = await AssignmentSubmission.findById(existing._id)
          .populate('student', 'displayName username')
          .lean();

        console.log('[ASSIGN] Student resubmitted after rejection:', user._id, 'for assignment:', id);
        return res.json({ data: populated });
      }
      return res.status(409).json({ error: 'You have already submitted this assignment' });
    }

    const submission = await AssignmentSubmission.create({
      assignment: id,
      student: user._id,
      driveLink,
      submittedAt: new Date(),
      status: 'submitted'
    });

    const populated = await AssignmentSubmission.findById(submission._id)
      .populate('student', 'displayName username')
      .lean();

    console.log('[ASSIGN] Student submitted:', user._id, 'for assignment:', id);
    res.status(201).json({ data: populated });
  } catch (error) {
    console.error('[ASSIGN] Error submitting assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/student/assignments/:id/submission
 * Update an existing submission (e.g., change drive link).
 * Only allowed if the assignment is still open.
 */
export async function updateSubmission(req, res) {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { id } = req.params;
    const { driveLink } = req.body;

    if (!driveLink) {
      return res.status(400).json({ error: 'Drive link is required' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const now = new Date();
    /* Fix timezone: construct local midnight of day after endDate so deadline is end-of-day LOCAL time */
    const ed = new Date(assignment.endDate);
    const endOfEndDate = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate() + 1);
    if (now >= endOfEndDate) {
      return res.status(400).json({ error: 'Assignment deadline has passed. Cannot update.' });
    }

    const submission = await AssignmentSubmission.findOne({ assignment: id, student: user._id });
    if (!submission) {
      return res.status(404).json({ error: 'No submission found. Submit first.' });
    }

    submission.driveLink = driveLink;
    submission.submittedAt = new Date();
    /* Reset status to 'submitted' if it was 'rejected' — student can resubmit */
    if (submission.status === 'rejected') {
      submission.status = 'submitted';
      submission.feedback = ''; /* Clear previous rejection feedback */
    }
    await submission.save();

    console.log('[ASSIGN] Student updated submission:', user._id, 'for assignment:', id);
    res.json({ data: submission });
  } catch (error) {
    console.error('[ASSIGN] Error updating submission:', error.message);
    res.status(500).json({ error: error.message });
  }
}
