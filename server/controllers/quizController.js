import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import DbmsProblem from '../models/DbmsProblem.js';
import OsProblem from '../models/OsProblem.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import { cascadeProgressCompletion } from '../services/progressService.js';

/* Map problemModel → subject for quiz stats */
const MODEL_TO_SUBJECT = { Problem: 'dsa', DbmsProblem: 'dbms', OsProblem: 'os', ProgrammingProblem: 'programming' };

/* Find a problem by slug + model to get its _id */
async function findProblemId(problemModel, slug) {
  const Model = { Problem, DbmsProblem, OsProblem, ProgrammingProblem }[problemModel];
  if (!Model) return null;
  const doc = await Model.findOne({ slug });
  return doc?._id;
}

/*
 * POST /api/quizzes
 * Admin: Create a quiz for a problem.
 * Body: { problemId, problemModel, questions: [{ text, options: [...], correctIndex }] }
 */
export async function createQuiz(req, res) {
  try {
    console.log('[QUIZ] Creating quiz...');
    const { problemId, problemModel, questions } = req.body;
    if (!problemId || !problemModel || !questions?.length) {
      return res.status(400).json({ error: 'problemId, problemModel, and questions are required' });
    }
    const quiz = await Quiz.create({ problemId, problemModel, questions });
    console.log('[QUIZ] Created:', quiz._id);
    res.status(201).json({ data: quiz });
  } catch (error) {
    console.error('[QUIZ] Error creating quiz:', error.message);
    if (error.code === 11000) return res.status(409).json({ error: 'Quiz already exists for this problem' });
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/quizzes/:id
 * Admin: Update an existing quiz (replace questions).
 */
export async function updateQuiz(req, res) {
  try {
    console.log('[QUIZ] Updating quiz:', req.params.id);
    const { questions } = req.body;
    if (!questions?.length) return res.status(400).json({ error: 'questions array is required' });
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, { questions }, { new: true });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    console.log('[QUIZ] Updated:', quiz._id);
    res.json({ data: quiz });
  } catch (error) {
    console.error('[QUIZ] Error updating quiz:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/quizzes/:id
 * Admin: Delete a quiz and all its attempts.
 */
export async function deleteQuiz(req, res) {
  try {
    console.log('[QUIZ] Deleting quiz:', req.params.id);
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    /* Clean up all attempts for this quiz */
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    console.log('[QUIZ] Deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[QUIZ] Error deleting quiz:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/quizzes/by-problem/:problemModel/:slug
 * Public (auth): Get a quiz by problem model + slug.
 * Returns questions WITHOUT correctIndex — never leak the answer key.
 */
export async function getQuizByProblem(req, res) {
  try {
    const { problemModel, slug } = req.params;
    console.log('[QUIZ] Fetching quiz for', problemModel, slug);
    const problemId = await findProblemId(problemModel, slug);
    if (!problemId) return res.status(404).json({ error: 'Problem not found' });

    const quiz = await Quiz.findOne({ problemId, problemModel }).lean();
    if (!quiz) return res.status(404).json({ error: 'No quiz for this problem' });

    /* Check if user has already attempted this quiz */
    let attempt = null;
    if (req.userId) {
      const user = await User.findOne({ clerkId: req.userId });
      if (user) {
        attempt = await QuizAttempt.findOne({ user: user._id, quiz: quiz._id }).lean();
      }
    }

    /*
     * If the user already attempted this quiz, return ALL questions WITH correctIndex
     * so they can review their answers (they've already seen it, no security risk).
     * Otherwise strip correctIndex so the student can't peek before attempting.
     */
    const questionsToReturn = attempt
      ? quiz.questions
      : quiz.questions.map(q => ({
          _id: q._id,
          text: q.text,
          options: q.options
        }));

    res.json({
      data: {
        _id: quiz._id,
        problemId: quiz.problemId,
        problemModel: quiz.problemModel,
        questions: questionsToReturn,
        attempt: attempt ? {
          answers: attempt.answers,
          score: attempt.score,
          attemptedAt: attempt.attemptedAt
        } : null
      }
    });
  } catch (error) {
    console.error('[QUIZ] Error fetching quiz:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/quizzes/admin/by-problem/:problemModel/:problemId
 * Admin: Get a quiz by problem _id (includes correctIndex for editing).
 */
export async function getQuizByProblemId(req, res) {
  try {
    const { problemModel, problemId } = req.params;
    console.log('[QUIZ] Admin fetching quiz for', problemModel, problemId);
    const quiz = await Quiz.findOne({ problemId, problemModel }).lean();
    if (!quiz) return res.status(404).json({ error: 'No quiz for this problem' });
    res.json({ data: quiz });
  } catch (error) {
    console.error('[QUIZ] Error fetching quiz by problem id:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/quizzes/my-attempts
 * User: Get all quiz attempts for the authenticated user, populated with quiz questions + answers.
 * Returns the full quiz data (with correctIndex so they can review).
 */
export async function getMyAttempts(req, res) {
  try {
    console.log('[QUIZ] Fetching my attempts for user:', req.userId);
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    /* Fetch all attempts, populating quiz data */
    const attempts = await QuizAttempt.find({ user: user._id })
      .populate('quiz')
      .sort({ attemptedAt: -1 })
      .lean();

    console.log('[QUIZ] My attempts fetched:', attempts.length);

    /* Attach the problem slug to each attempt for navigation */
    const results = await Promise.all(attempts.map(async (att) => {
      const Model = { Problem, DbmsProblem, OsProblem, ProgrammingProblem }[att.quiz.problemModel];
      let problemSlug = null;
      if (Model) {
        const problem = await Model.findById(att.quiz.problemId).select('slug').lean();
        problemSlug = problem?.slug || null;
      }
      return {
        _id: att._id,
        quizId: att.quiz._id,
        problemModel: att.quiz.problemModel,
        problemSlug,
        subject: MODEL_TO_SUBJECT[att.quiz.problemModel] || 'dsa',
        questions: att.quiz.questions,
        answers: att.answers,
        score: att.score,
        attemptedAt: att.attemptedAt
      };
    }));

    res.json({ data: results });
  } catch (error) {
    console.error('[QUIZ] Error fetching my attempts:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/quizzes/:id/attempt
 * User: Submit a quiz attempt.
 * Body: { answers: [number] }
 * Single-shot: duplicate attempts are rejected.
 */
export async function submitAttempt(req, res) {
  try {
    console.log('[QUIZ] Submitting attempt for quiz:', req.params.id);
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    /* Get user */
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    /* Get quiz */
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    /* Check if already attempted (single-shot) */
    const existing = await QuizAttempt.findOne({ user: user._id, quiz: quiz._id });
    if (existing) {
      return res.status(409).json({ error: 'Already attempted this quiz' });
    }

    /* Validate answers array length matches questions */
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: `Expected ${quiz.questions.length} answers, got ${answers.length}` });
    }

    /* Compute score server-side */
    let correct = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctIndex) correct++;
    }
    const score = Math.round((correct / quiz.questions.length) * 100);

    /* Save attempt */
    const attempt = await QuizAttempt.create({
      user: user._id,
      quiz: quiz._id,
      answers,
      score
    });

    /* Auto-mark the problem as complete — wipe any legacy manual entry first, then create fresh */
    const Model = { Problem, DbmsProblem, OsProblem, ProgrammingProblem }[quiz.problemModel];
    const subject = { Problem: 'dsa', DbmsProblem: 'dbms', OsProblem: 'os', ProgrammingProblem: 'programming' }[quiz.problemModel];
    let problemSlug = null, lessonSlug = null, subtopicSlug = null;
    if (Model && subject) {
      const problem = await Model.findById(quiz.problemId).select('slug lessonSlug subtopicSlug');
      if (problem) {
        problemSlug = problem.slug;
        lessonSlug = problem.lessonSlug;
        subtopicSlug = problem.subtopicSlug;
        /* Delete any pre-existing manual-completion record */
        await Progress.deleteOne({ user: user._id, subject, targetType: 'problem', targetSlug: problemSlug });
        /* Create a fresh record tied to this quiz attempt */
        await Progress.create({ user: user._id, subject, targetType: 'problem', targetSlug: problemSlug, completedAt: new Date() });
        console.log('[QUIZ] Problem auto-completed via quiz:', problemSlug);
      }
    }

    /* Cascade completion up the hierarchy: problem → subtopic → lesson */
    if (lessonSlug) {
      cascadeProgressCompletion(user._id, subject, lessonSlug, subtopicSlug).catch(err => {
        console.error('[CASCADE] Error during cascade:', err.message);
      });
    }

    console.log('[QUIZ] Attempt recorded:', attempt._id, 'score:', score);
    res.json({
      data: {
        score,
        correct,
        total: quiz.questions.length,
        /* Return correct answers after submission so student can review */
        results: quiz.questions.map((q, i) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          yourAnswer: answers[i],
          isCorrect: answers[i] === q.correctIndex
        }))
      }
    });
  } catch (error) {
    console.error('[QUIZ] Error submitting attempt:', error.message);
    if (error.code === 11000) return res.status(409).json({ error: 'Already attempted this quiz' });
    res.status(500).json({ error: error.message });
  }
}
