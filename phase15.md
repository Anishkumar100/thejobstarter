# Phase 15 — Dual Progress Tracking (Under Revision)

> Plan-pace calculation, shown alongside general progress.
>
> **⚠️ SPACE FOR MODIFICATIONS** — This phase is under active revision.
> The current implementation will be iterated on based on review feedback.

---

## Modifications Completed

> These changes have been implemented based on review feedback.

### 1. AdminCoachingCenterDetail — Batch-Plan linkage & Quick Actions ✅

- **Backend:** Added `GET /api/coaching-centers/:id/plan-assignments` endpoint via `getCenterPlansWithAssignments` which returns plans with their assigned batches populated.
- **Frontend:** Plans table now fetches from `plan-assignments` endpoint. New "Assigned Batch(es)" column shows clickable batch badges. Actions column added with View/Edit/Batch quick action buttons per row.

### 2. AdminPlanList — Visible batch assignments ✅

- **Backend:** Added `GET /api/plans/:id/assignments` endpoint via `getPlanAssignments` returning batch assignments per plan.
- **Frontend:** Plan cards now batch-fetch assignments for all visible plans. Assigned batches shown as clickable badges with batch name + start date. "Loading assignments..." indicator shown while fetching.

### 3. CoordinatorDashboard — Charts, graphs, detail, action ✅

- **Completely rewritten:** Uses recharts `BarChart` + `ResponsiveContainer` for content progress (completed vs pending stack bar) and per-batch plan progress bars.
- **Stats grid:** Clickable cards (Students → `/coordinator/students`, Batches → `/coordinator/batches`, Plans → `/coordinator/plans`) with Behind Schedule and Overall Completion %.
- **Batch Progress Cards:** Grid layout with plan name, progress bar, day count, student count, behind indicator, hover effects, clickable to batch detail.
- **Lagging Students section:** Fetches all students, filters those with `needsAttention` or `behind` pace, shows reason badges, max 20, clickable to student detail.
- **Quick Actions:** Prominent section with Create Plan, New Batch, View Students, Manage Plans, Detailed Stats.

### 4. CoordinatorStudentDetail — Day-based plan tracking ✅

- **Backend:** Added `GET /api/plans/:planId/day-progress/:batchId/:userId` endpoint via `getDayProgressBreakdown` returning day-by-day completion matrix.
- **Frontend:** New "Plan Progress" section below batch details showing:
  - Pace status badge, day count, completed/expected items
  - Progress bar with color coding (behind = red)
  - **Day-by-day heatmap grid**: colored squares for each day (green = complete, yellow = partial, red = missed, grey = future/no items, current day has bold border)
  - Behind items list when no breakdown available
  - Legend explaining heatmap colors

### 5. CoordinatorBatchDetail — Richer plan progress display ✅

- Pace Distribution bar added between plan card and search bar showing counts for Ahead/On Track/Behind/Just Started/No Plan with percentage bars.
- Student names in enrolled table made clickable, linking to `/coordinator/students/:id`.

### 6. CoordinatorPlanList — Batch assignment visibility ✅

- (Already covered by AdminPlanList changes — same component handles both roles based on `isAdmin` flag)
- Assignment badges appear on plan cards for coordinator role as well (routes to `/coordinator/batches/:id`).

### 7. UserProfile — Day-based plan tracking + Batch/Center details ✅

- **Centre & Batch section:** New informational bar showing coaching center name and batch name/code when the user belongs to one.
- **Plan Progress enhanced:** Day-by-day completion heatmap grid (same pattern as CoordinatorStudentDetail) fetched via day-progress API. Behind items summary when breakdown unavailable.

### 8. AdminDashboard — Counts-based, no plan listing ✅

- **Removed**: Recent batches list and individual plan listings.
- **Added**: Overview section with 6 clickable stat cards — Centres (→ `/admin/coaching-centers`), Batches (→ `/admin/coaching-centers`), Total Plans (→ `/admin/plans`), Platform Users, Centre Students, Behind Schedule.
- **Added**: Two highlight cards below the grid — Published Plans count (→ `/admin/plans?status=published`) and Batches Running Plans (→ `/admin/coaching-centers`).
- **Backend**: `getBatchPlanStats` enhanced to return `totalCenters`, `totalPlansAll`, `totalBatches`, `centerStudents`.

### 9. Admin batch/plan navigation ✅

- Batch names in AdminCoachingCenterDetail's Batches table made clickable → `/admin/batches/:id`.
- Student names in CoordinatorBatchDetail's enrolled table made clickable → `/coordinator/students/:id`.
- Batch badges in plan cards throughout link to batch detail pages.

---

## Overview

Once a batch has an active `BatchPlan` (from Phase 14), a student in that batch
has two different, simultaneous answers to "how am I doing":

1. **General progress** — all-time progress across the whole platform (4 subjects).
2. **Plan progress** — progress specifically against what their center told them
   to do by today (their batch's active plan).

Both are shown — not one instead of the other.

---

## Files Created

| File | Purpose |
|------|---------|
| `server/services/planProgressService.js` | `getPlanProgress(userId, batchId)` engine — computes day offset, expected vs completed items, pace status |
| `client/src/pages/AdminBatchDetail.jsx` | New admin page at `/admin/batches/:id` with batch detail, plan management, student progress table |

---

## Files Modified

### Backend

| File | Changes |
|------|---------|
| `server/controllers/planController.js` | Added `getCenterPlans`, `getBatchStudentsWithProgress`, `getPlanAssignments`, `getCoordinatorPlanAssignments`, `getCenterPlansWithAssignments`, `getDayProgressBreakdown`; added `email` population + subject/date filters to `getPlans` and `getCoordinatorPlans` |
| `server/routes/planRoutes.js` | Added `GET /:id/assignments`, `GET /:planId/day-progress/:batchId/:userId` |
| `server/routes/coachingCenterRoutes.js` | Added `GET /:id/plans`, `GET /:id/plan-assignments` routes |
| `server/routes/coordinatorRoutes.js` | Added `GET /batches/:id/students-with-progress`, `GET /plans/:id/assignments` routes |
| `server/routes/adminRoutes.js` | Added `GET /batch-plan-stats` route; imported `getBatchPlanStats` |
| `server/controllers/adminController.js` | Enhanced `getBatchPlanStats` — now returns `{ activePlans, activeBatchPlans, behindCount, recentBatches, totalStudents, totalCenters, totalPlansAll, totalBatches, centerStudents }` |
| `server/services/progressService.js` | Wired `planProgress` into `getProgressSummary(userId)` via `User.batch` lookup + `getPlanProgress` call |
| `server/services/needsAttentionService.js` | Added 4th attention reason: `'Behind plan pace'` when `paceStatus === 'behind'` and `currentDayOffset >= 3` |

### Frontend — Modified Files

| File | Route | What Changed |
|------|-------|-------------|
| `client/src/pages/AdminCoachingCenterDetail.jsx` | `/admin/coaching-centers/:id` | Plans table now uses `plan-assignments` endpoint; added "Assigned Batch(es)" column with clickable batch badges; added Actions column (View/Edit/Batch quick actions); batch names in batches table are now clickable links |
| `client/src/pages/AdminPlanList.jsx` | `/admin/plans` | Each plan card now batch-fetches its assignments; shows clickable assigned-batch badges with start date |
| `client/src/pages/CoordinatorDashboard.jsx` | `/coordinator` | **Complete rewrite** — recharts BarChart for content progress (completed/pending stack); per-batch progress bars; clickable stats grid (students, batches, plans); lagging students section (needsAttention + behind); batch progress cards with hover effects; prominent quick actions |
| `client/src/pages/CoordinatorStudentDetail.jsx` | `/coordinator/students/:id` | New "Plan Progress" section with day-by-day completion heatmap grid (colored squares per day); behind-items list; progress bar with color coding |
| `client/src/pages/CoordinatorBatchDetail.jsx` | `/coordinator/batches/:id` | Added "Pace Distribution" bar (ahead/on-track/behind/started/none counts + bars); student names in enrolled table made clickable |
| `client/src/pages/UserProfile.jsx` | `/users/:username` | Added "Centre & Batch" bar (coaching center + batch name/code); Plan Progress enhanced with day-by-day heatmap grid |
| `client/src/pages/AdminDashboard.jsx` | `/admin` | **Redesigned** — removed individual plan/batch listings; overview section with 6 clickable stat cards (Centres, Batches, Plans, Platform Users, Centre Students, Behind Schedule); two highlight cards (Published Plans, Batches Running Plans) |
| `client/src/pages/AdminBatchDetail.jsx` | `/admin/batches/:id` | (Existing — no changes needed) |

---

## API Endpoints Added / Modified

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/coaching-centers/:id/plans` | Auth | Fetch plans scoped to a coaching center |
| GET | `/api/coaching-centers/:id/plan-assignments` | Auth | Fetch plans with their active batch assignments for a center |
| GET | `/api/plans/:id/assignments` | Auth | Fetch batches a specific plan is assigned to |
| GET | `/api/plans/:planId/day-progress/:batchId/:userId` | Auth | Day-by-day completion breakdown for a user against a plan |
| GET | `/api/coordinator/plans/:id/assignments` | Coordinator | Same as above but scoped to coordinator's center |
| GET | `/api/coordinator/batches/:id/students-with-progress` | Coordinator | Batch students with per-student `planProgress`, sorted by pace |
| GET | `/api/admin/batch-plan-stats` | Admin | Dashboard stats: now also includes `totalCenters`, `totalPlansAll`, `totalBatches`, `centerStudents` |

---

## Key Behaviors

- **Plan Progress shows only when applicable**: if a user has no batch or no active
  plan, `planProgress` is `null` and no UI block renders.
- **Pace status suppression**: for the first 3 days of a plan, pace is `'just-started'`
  (neutral display, no behind flag) — too early for meaningful signal.
- **Day-by-day heatmap**: colored grid squares per plan day — green (100% complete), yellow (partial), red (missed), grey (future/no items), bold border for current day.
- **Needs Attention**: students with `paceStatus === 'behind'` and `currentDayOffset >= 3`
  get flagged with `'Behind plan pace (X/Y items)'`.
- **Pace Distribution**: batch detail pages show Ahead/On Track/Behind/Started counts with percentage bars.
- **Aggregate Admin Dashboard**: shows top-level counts (centers, batches, plans, students, behind) with clickable cards → respective admin pages.
- **Build verified**: `npm run build` passes with 7679 modules, 0 errors.
