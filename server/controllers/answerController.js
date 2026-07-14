/*
 * Answer Controller — handles answer-level operations with approval flow
 * When someone answers a question, the answer is saved as 'pending'.
 * The question author can then approve or reject it.
 * Only approved answers are visible to the public.
 */
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/*
 * POST /api/qa/:id/answers
 * User: Post an answer to a question — saved as pending
 * Also creates a notification for the question author
 */
export async function createAnswer(req, res) {
  try {
    console.log('[QA] Creating answer for question:', req.params.id);
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });
    const answer = await Answer.create({
      question: req.params.id,
      body: req.body.body,
      status: 'pending',
      author: { _id: currentUser._id, name: currentUser.displayName || currentUser.username, avatar: currentUser.avatar || '' }
    });
    /* Push answer reference into question */
    const Question = (await import('../models/Question.js')).default;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $push: { answers: answer._id } },
      { new: true }
    );

    /* Create a notification for the question author */
    if (question) {
      await Notification.create({
        user: question.author._id,
        from: currentUser._id,
        type: 'answer',
        questionId: question._id,
        questionTitle: question.title,
        answerId: answer._id
      });
      console.log('[NOTIFICATION] Created for question author:', question.author._id);
    }

    console.log('[QA] Answer created (pending):', answer._id);
    res.status(201).json({ data: answer });
  } catch (error) {
    console.error('[QA] Error creating answer:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/answers/:aid
 * User (author): Edit own answer
 */
export async function updateAnswer(req, res) {
  try {
    console.log('[QA] Updating answer:', req.params.aid);
    const answer = await Answer.findById(req.params.aid);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || answer.author._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    answer.body = req.body.body;
    await answer.save();
    console.log('[QA] Answer updated:', req.params.aid);
    res.json({ data: answer });
  } catch (error) {
    console.error('[QA] Error updating answer:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/qa/:id/answers/:aid
 * User (author) / Admin: Delete an answer
 */
export async function deleteAnswer(req, res) {
  try {
    console.log('[QA] Deleting answer:', req.params.aid);
    const answer = await Answer.findByIdAndDelete(req.params.aid);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    /* Delete the notification tied to this answer */
    await Notification.deleteMany({ answerId: answer._id });
    console.log('[QA] Deleted notifications for answer:', req.params.aid);

    const Question = (await import('../models/Question.js')).default;
    await Question.findByIdAndUpdate(req.params.id, { $pull: { answers: req.params.aid } });
    console.log('[QA] Answer deleted:', req.params.aid);
    res.json({ success: true });
  } catch (error) {
    console.error('[QA] Error deleting answer:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/answers/:aid/vote
 * User: Vote on an answer
 */
export async function voteAnswer(req, res) {
  try {
    const { vote } = req.body;
    if (![1, -1].includes(vote)) return res.status(400).json({ error: 'Invalid vote value' });

    const answer = await Answer.findById(req.params.aid);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser) return res.status(404).json({ error: 'Your profile not found' });

    const existingVote = answer.voters.find(v => v.userId.toString() === currentUser._id.toString());
    if (existingVote) {
      answer.votes -= existingVote.vote;
      existingVote.vote = vote;
      answer.votes += vote;
    } else {
      answer.voters.push({ userId: currentUser._id, vote });
      answer.votes += vote;
    }
    await answer.save();
    console.log('[QA] Vote recorded on answer:', req.params.aid);
    res.json({ data: { votes: answer.votes } });
  } catch (error) {
    console.error('[QA] Error voting on answer:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/answers/:aid/accept
 * User (question author): Accept an answer as correct
 */
export async function acceptAnswer(req, res) {
  try {
    const Question = (await import('../models/Question.js')).default;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || question.author._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Only the question author can accept answers' });
    }

    /* Unaccept all other answers, then accept this one */
    await Answer.updateMany({ question: req.params.id }, { accepted: false });
    const answer = await Answer.findByIdAndUpdate(req.params.aid, { accepted: true }, { new: true });
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    console.log('[QA] Answer accepted:', req.params.aid);
    res.json({ data: answer });
  } catch (error) {
    console.error('[QA] Error accepting answer:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/answers/:aid/approve
 * Question author: Approve a pending answer so it becomes visible
 */
export async function approveAnswer(req, res) {
  try {
    const Question = (await import('../models/Question.js')).default;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || question.author._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Only the question author can approve answers' });
    }

    const answer = await Answer.findByIdAndUpdate(
      req.params.aid,
      { status: 'approved' },
      { new: true }
    );
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    /* Notify the answer author that their answer was approved */
    try {
      if (answer.author && answer.author._id) {
        await Notification.create({
          user: answer.author._id,
          from: currentUser._id,
          type: 'answer_approved',
          questionId: question._id,
          questionTitle: question.title,
          answerId: answer._id
        });
        console.log('[NOTIFICATION] Answer approved notification for:', answer.author._id);
      }
    } catch (notifErr) {
      console.error('[NOTIFICATION] Failed to create answer approved notification:', notifErr.message);
    }

    console.log('[QA] Answer approved:', req.params.aid);
    res.json({ data: answer });
  } catch (error) {
    console.error('[QA] Error approving answer:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/qa/:id/answers/:aid/reject
 * Question author: Reject a pending answer
 */
export async function rejectAnswer(req, res) {
  try {
    const Question = (await import('../models/Question.js')).default;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const currentUser = await User.findOne({ clerkId: req.userId });
    if (!currentUser || question.author._id.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Only the question author can reject answers' });
    }

    const answer = await Answer.findByIdAndUpdate(
      req.params.aid,
      { status: 'rejected' },
      { new: true }
    );
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    /* Notify the answer author that their answer was rejected */
    try {
      if (answer.author && answer.author._id) {
        await Notification.create({
          user: answer.author._id,
          from: currentUser._id,
          type: 'answer_rejected',
          questionId: question._id,
          questionTitle: question.title,
          answerId: answer._id
        });
        console.log('[NOTIFICATION] Answer rejected notification for:', answer.author._id);
      }
    } catch (notifErr) {
      console.error('[NOTIFICATION] Failed to create answer rejected notification:', notifErr.message);
    }

    console.log('[QA] Answer rejected:', req.params.aid);
    res.json({ data: answer });
  } catch (error) {
    console.error('[QA] Error rejecting answer:', error.message);
    res.status(500).json({ error: error.message });
  }
}
