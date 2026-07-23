/*
 * Plan Progress Service — Phase 15
 * Computes per-user progress against an assigned study plan.
 * Separated from progressService.js to keep concerns distinct.
 *
 * getPlanProgress(userId, batchId):
 *   1. Finds the batch's active BatchPlan (and its Plan's items).
 *   2. currentDayOffset = days between BatchPlan.startDate and today.
 *   3. expectedItems = plan.items where dayOffset <= currentDayOffset.
 *   4. completedOfExpected = count of those items with a matching Progress doc.
 *   5. paceStatus = 'ahead' | 'on-track' | 'behind' | 'just-started'.
 *
 * Returns null if the user has no batch or the batch has no active plan —
 * this signals the UI not to render the plan-progress block.
 */
import BatchPlan from '../models/BatchPlan.js';
import Plan from '../models/Plan.js';
import Progress from '../models/Progress.js';

/*
 * getPlanProgress(userId, batchId)
 * If batchId is provided, uses it directly.
 * Otherwise looks up user's batch from their User record.
 * Returns null if no active plan found.
 */
export async function getPlanProgress(userId, batchId) {
  try {
    console.log('[PLANPROGRESS] Computing plan progress for user:', userId, 'batch:', batchId);

    if (!batchId) {
      console.log('[PLANPROGRESS] No batch ID provided — no plan progress');
      return null;
    }

    /* Find the active BatchPlan for this batch */
    const batchPlan = await BatchPlan.findOne({ batch: batchId, status: 'active' });
    if (!batchPlan) {
      console.log('[PLANPROGRESS] No active plan for batch:', batchId);
      return null;
    }

    /* Get the Plan with its items */
    const plan = await Plan.findById(batchPlan.plan).lean();
    if (!plan || !plan.items || plan.items.length === 0) {
      console.log('[PLANPROGRESS] Plan has no items');
      return null;
    }

    /* Compute current day offset from startDate */
    const startDate = new Date(batchPlan.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - startDate.getTime();
    const currentDayOffset = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

    console.log('[PLANPROGRESS] Plan:', plan.name, 'start:', batchPlan.startDate, 'day:', currentDayOffset, 'of', plan.durationDays);

    /* Get expected items up to current day */
    const expectedItems = plan.items.filter(item => item.dayOffset <= currentDayOffset);
    const expectedCount = expectedItems.length;

    if (expectedCount === 0) {
      return {
        planName: plan.name,
        planId: plan._id,
        currentDayOffset,
        durationDays: plan.durationDays,
        startDate: batchPlan.startDate,
        expectedCount: 0,
        completedCount: 0,
        itemsBehind: [],
        paceStatus: 'just-started'
      };
    }

    /* Count completed items among the expected ones */
    const progressDocs = await Progress.find({
      user: userId,
      $or: expectedItems.map(item => ({
        subject: item.subject,
        targetType: item.targetType,
        targetSlug: item.targetSlug
      }))
    }).select('subject targetType targetSlug').lean();

    const completedSet = new Set(
      progressDocs.map(d => `${d.subject}:${d.targetType}:${d.targetSlug}`)
    );

    const itemsBehind = expectedItems.filter(
      item => !completedSet.has(`${item.subject}:${item.targetType}:${item.targetSlug}`)
    );
    const completedCount = expectedCount - itemsBehind.length;

    /* Determine pace status */
    let paceStatus;
    if (currentDayOffset < 3) {
      /* Too early for meaningful pace status */
      paceStatus = 'just-started';
    } else {
      const ratio = expectedCount > 0 ? completedCount / expectedCount : 0;
      if (ratio >= 0.9) paceStatus = 'ahead';
      else if (ratio >= 0.6) paceStatus = 'on-track';
      else paceStatus = 'behind';
    }

    console.log('[PLANPROGRESS] Progress:', { completedCount, expectedCount, paceStatus, behind: itemsBehind.length });

    return {
      planName: plan.name,
      planId: plan._id,
      currentDayOffset,
      durationDays: plan.durationDays,
      startDate: batchPlan.startDate,
      expectedCount,
      completedCount,
      itemsBehind: itemsBehind.slice(0, 10).map(i => ({
        subject: i.subject,
        targetType: i.targetType,
        targetTitle: i.targetTitle,
        dayOffset: i.dayOffset
      })),
      paceStatus
    };
  } catch (error) {
    console.error('[PLANPROGRESS] Error computing plan progress:', error.message);
    return null;
  }
}
