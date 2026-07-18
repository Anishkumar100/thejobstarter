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

      for (const subject of ['dsa', 'dbms', 'os']) {
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
      'Overall Completed', 'Overall Total', 'Overall %',
      'Status'
    ]);

    for (const s of students) {
      const p = s.progress || {};
      const subjects = ['dsa', 'dbms', 'os'];
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
