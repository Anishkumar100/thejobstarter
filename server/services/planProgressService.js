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
 * When the plan end date has passed (today >= startDate + durationDays),
 * the BatchPlan is auto-updated to status 'completed' and a completed
 * metadata object is returned (status: 'completed') so the UI can show
 * a "Plan Completed" state instead of stale "0 days remaining".
 *
 * Returns null if the user has no batch or the batch has no active plan —
 * this signals the UI not to render the plan-progress block.
 */
import BatchPlan from '../models/BatchPlan.js';
import Plan from '../models/Plan.js';
import Progress from '../models/Progress.js';
import { getPlanDayOffset } from '../utils/planDay.js';

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

    /* Find the BatchPlan for this batch — try active first, fall back to most recent */
    let batchPlan = await BatchPlan.findOne({ batch: batchId, status: 'active' });
    if (!batchPlan) {
      batchPlan = await BatchPlan.findOne({ batch: batchId }).sort({ startDate: -1 });
    }
    if (!batchPlan) {
      console.log('[PLANPROGRESS] No plan found for batch:', batchId);
      return null;
    }

    /* Get the Plan with its items */
    const plan = await Plan.findById(batchPlan.plan).lean();
    if (!plan || !plan.items || plan.items.length === 0) {
      console.log('[PLANPROGRESS] Plan has no items');
      return null;
    }

    /* Compute current day offset from startDate — IST-normalised so a UTC server
       doesn't report the previous day between 00:00–05:30 IST */
    const currentDayOffset = getPlanDayOffset(batchPlan.startDate);

    /*
     * Check if the plan's end date has passed.
     * End date = startDate + durationDays (plan ends at end of the last day).
     * If currentDayOffset > durationDays, the plan period is over.
     */
    const planEnded = currentDayOffset > plan.durationDays;

    if (planEnded) {
      console.log('[PLANPROGRESS] Plan has ended — marking BatchPlan as completed');
      /* Auto-update the BatchPlan status to prevent future queries from finding it as 'active' */
      await BatchPlan.findByIdAndUpdate(batchPlan._id, { status: 'completed' });

      /* Compute final completion stats for the entire plan */
      const totalItems = plan.items.length;
      const progressDocs = await Progress.find({
        user: userId,
        $or: plan.items.map(item => ({
          subject: item.subject,
          targetType: item.targetType,
          targetSlug: item.targetSlug
        }))
      }).select('subject targetType targetSlug').lean();

      const completedSet = new Set(
        progressDocs.map(d => `${d.subject}:${d.targetType}:${d.targetSlug}`)
      );
      const completedCount = plan.items.filter(
        item => completedSet.has(`${item.subject}:${item.targetType}:${item.targetSlug}`)
      ).length;
      const completionPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

      console.log('[PLANPROGRESS] Plan completed —', { completedCount, totalItems, completionPct });
      return {
        planName: plan.name,
        planId: plan._id,
        status: 'completed',
        durationDays: plan.durationDays,
        startDate: batchPlan.startDate,
        totalItems,
        completedCount,
        completionPct
      };
    }

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
