import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import clerk from '../config/clerk.js';

/*
 * GET /api/qa
 * Fetch approved questions with optional search and tag filters.
 * Admin can pass ?all=true to see pending/rejected questions too.
 * A user can pass ?author=me to see their own questions regardless of status.
 */
export async function getQuestions(req, res) {
  try {
    console.log('[QA] Fetching questions with filters:', req.query);
    const { search, tag, page = 1, limit = 20, all, author } = req.query;
    const query = {};

    if (author === 'me') {
      /* Get the current user's questions — requires auth */
      const currentUser = await User.findOne({ clerkId: req.userId });
      if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });
      query['author._id'] = currentUser._id;
    } else if (all === 'true' && req.userId) {
      /* Admin sees all — verify admin status via Clerk */
      try {
        const clerkUser = await clerk.users.getUser(req.userId);
        if (clerkUser.publicMetadata?.role === 'admin') {
          /* No status filter — show all */
        } else {
          query.status = 'approved';
        }
      } catch {
        query.status = 'approved';
      }
    } else {
      /* Approved questions OR documents without the status field (legacy data) */
      query.$or = [{ status: 'approved' }, { status: { $exists: false } }];
    }

    if (search) query.title = { $regex: search, $options: 'i' };
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const questions = await Question.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Question.countDocuments(query);

    console.log('[QA] Questions fetched:', total);
    res.json({ data: questions, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[QA] Error fetching questions:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/qa/:id
 * Fetch single question with its answers.
 * Non-author viewers only see approved answers.
 * Author sees all answers including pending.
 * If question is not approved and the viewer isn't the author, 404.
 */
export async function getQuestionById(req, res) {
  try {
    console.log('[QA] Fetching question by ID:', req.params.id);
    const question = await Question.findById(req.params.id);
    if (!question) {
      console.log('[QA] Question not found:', req.params.id);
      return res.status(404).json({ error: 'Question not found' });
    }

    /* Determine if viewer is admin */
    let isAdmin = false;
    if (req.userId) {
      try {
        const clerkUser = await clerk.users.getUser(req.userId);
        isAdmin = clerkUser.publicMetadata?.role === 'admin';
      } catch { /* not admin */ }
    }

    /* If question is not approved, only the author or admin can view */
    /* Legacy documents without status field are treated as approved */
    const isApproved = question.status === 'approved' || !question.status;
    if (!isApproved) {
      const currentUser = req.userId ? await User.findOne({ clerkId: req.userId }) : null;
      const isAuthor = currentUser && question.author._id.toString() === currentUser._id.toString();
      if (!isAdmin && !isAuthor) {
        console.log('[QA] Question not found (pending):', req.params.id);
        return res.status(404).json({ error: 'Question not found' });
      }
    }

    /* Fetch answers — author and admin see all, others see only approved */
    const currentUser = req.userId ? await User.findOne({ clerkId: req.userId }) : null;
    const isAuthor = currentUser && question.author._id.toString() === currentUser._id.toString();

    let answerQuery = { question: question._id };
    if (!isAuthor && !isAdmin) {
      answerQuery.status = 'approved';
    }
    const answers = await Answer.find(answerQuery).sort({ accepted: -1, votes: -1, createdAt: -1 });

    await Question.findByIdAndUpdate(question._id, { $inc: { views: 1 } });
    console.log('[QA] Question fetched:', question.title);
    res.json({ data: { ...question.toObject(), answers } });
  } catch (error) {
    console.error('[QA] Error fetching question:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/qa
 * User: Ask a new question — saved as pending by default
 */
export async function createQuestion(req, res) {
  try {
    console.log('[QA] Creating question:', req.body.title);
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });
    const question = await Question.create({
      ...req.body,
      status: 'pending',
      author: { _id: currentUser._id, name: currentUser.displayName || currentUser.username, avatar: currentUser.avatar || '' }
    });
    console.log('[QA] Question created (pending):', question._id);
    res.status(201).json({ data: question });
  } catch (error) {
    console.error('[QA] Error creating question:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id
 * User (author) / Admin: Edit a question
 */
export async function updateQuestion(req, res) {
  try {
    console.log('[QA] Updating question:', req.params.id);
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || question.author._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(question, req.body);
    await question.save();
    console.log('[QA] Question updated:', question._id);
    res.json({ data: question });
  } catch (error) {
    console.error('[QA] Error updating question:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/qa/:id
 * User (author) / Admin: Delete a question and its answers
 */
export async function deleteQuestion(req, res) {
  try {
    console.log('[QA] Deleting question:', req.params.id);
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    /* Clean up associated data */
    await Answer.deleteMany({ question: question._id });
    await Notification.deleteMany({ questionId: question._id });
    console.log('[QA] Deleted notifications for question:', question._id);

    await Question.findByIdAndDelete(req.params.id);
    console.log('[QA] Question deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[QA] Error deleting question:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/vote
 * User: Vote on a question (upvote/downvote)
 */
export async function voteQuestion(req, res) {
  try {
    const { vote } = req.body;
    if (![1, -1].includes(vote)) return res.status(400).json({ error: 'Invalid vote value' });

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });

    const existingVote = question.voters.find(v => v.userId.toString() === currentUser._id.toString());
    if (existingVote) {
      question.votes -= existingVote.vote;
      existingVote.vote = vote;
      question.votes += vote;
    } else {
      question.voters.push({ userId: currentUser._id, vote });
      question.votes += vote;
    }
    await question.save();
    console.log('[QA] Vote recorded on question:', req.params.id);
    res.json({ data: { votes: question.votes } });
  } catch (error) {
    console.error('[QA] Error voting on question:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/approve
 * Admin: Approve a pending question so it becomes publicly visible
 */
export async function approveQuestion(req, res) {
  try {
    console.log('[QA] Approving question:', req.params.id);

    /* First update the status */
    const updateResult = await Question.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!updateResult) return res.status(404).json({ error: 'Question not found' });

    /* Fetch a fresh copy to ensure author subdocument is fully hydrated */
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ error: 'Question disappeared' });

    /* Debug info about the author */
    const debug = {
      authorRaw: question.author,
      authorIdRaw: question.author?._id,
      authorIdType: typeof question.author?._id,
      authorConstructor: question.author?._id?.constructor?.name
    };

    /* Notify the question author that their question was approved */
    let notifResult = { created: false };
    try {
      if (!question.author || !question.author._id) {
        notifResult.reason = 'author or author._id is missing';
      } else {
        const currentUser = await User.findOne({ clerkId: req.userId });
        notifResult.adminUserId = req.userId;
        notifResult.adminDocFound = !!currentUser;
        notifResult.adminDocId = currentUser?._id?.toString();

        const newNotif = await Notification.create({
          user: question.author._id,
          from: currentUser?._id || question.author._id,
          type: 'question_approved',
          questionId: question._id,
          questionTitle: question.title
        });
        notifResult.created = true;
        notifResult.notifId = newNotif._id.toString();
      }
    } catch (notifErr) {
      notifResult.created = false;
      notifResult.error = notifErr.message;
      console.error('[NOTIFICATION] Failed:', notifErr.message);
    }

    console.log('[QA] Question approved:', question._id);
    res.json({ data: question, _debug: debug, _notification: notifResult });
  } catch (error) {
    console.error('[QA] Error approving question:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/reject
 * Admin: Reject a pending question with optional reason
 */
export async function rejectQuestion(req, res) {
  try {
    console.log('[QA] Rejecting question:', req.params.id);
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!question) return res.status(404).json({ error: 'Question not found' });

    /* Notify the question author that their question was rejected */
    try {
      if (question.author && question.author._id) {
        const currentUser = await User.findOne({ clerkId: req.userId });
        await Notification.create({
          user: question.author._id,
          from: currentUser?._id || question.author._id,
          type: 'question_rejected',
          questionId: question._id,
          questionTitle: question.title
        });
      }
    } catch (notifErr) {
      console.error('[NOTIFICATION] Failed to create rejection notification:', notifErr.message);
    }

    console.log('[QA] Question rejected:', question._id);
    res.json({ data: question });
  } catch (error) {
    console.error('[QA] Error rejecting question:', error.message);
    res.status(500).json({ error: error.message });
  }
}
