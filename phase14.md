# Phase 14 — Placement Plans

> Coaching centers create reusable study templates (Plans), assign them to batches with a start date (BatchPlan), and track daily progress.

---

## Core Concepts

### Plan (Template)
A reusable study schedule — the "what to study" and "in what order."

```
Plan = {
  name: "30-Day DSA Sprint",
  durationDays: 30,
  items: [
    { dayOffset: 1, subject: "dsa", targetType: "lesson", targetSlug: "arrays", instruction: "..." },
    { dayOffset: 2, subject: "dsa", targetType: "problem", targetSlug: "two-sum", instruction: "..." },
    ...
  ]
}
```

### BatchPlan (Assignment)
Links a Plan to a batch with a real start date — the "when to start."

```
BatchPlan = {
  batch: ObjectId,        // ref to Batch
  plan: ObjectId,         // ref to Plan
  startDate: Date,
  status: "active" | "completed" | "paused"
}
```

**Rule:** Only one active BatchPlan per batch at a time. Assigning a new one retires the old one (sets to `completed`).

### Calendar Mapping (Runtime Computation)
- Day 1 = `startDate` (the start date itself)
- Day 2 = `startDate + 1 day`
- Day N = `startDate + (N - 1) days`

Today's item = find BatchPlan where `startDate + (dayOffset - 1) === today`.

---

## Roles & Permissions

| Role | Plans | Assign to Batch |
|------|-------|-----------------|
| Admin | Create/Edit/Delete any plan | Assign to any batch |
| Coordinator | Option to create for own center | Assign own batches only |
| Teacher | *Not implemented yet (future)* | — |
| Student | View only — see active plan on dashboard | — |

---

## Models

### Plan (`server/models/Plan.js`)
```js
{
  coachingCenter: { type: ObjectId, ref: 'CoachingCenter', required: true },
  name: { type: String, required: true },
  description: String,
  durationDays: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  items: [{
    dayOffset: { type: Number, required: true },
    subject: { type: String, enum: ['dsa', 'dbms', 'os', 'programming'], required: true },
    targetType: { type: String, enum: ['lesson', 'subtopic', 'problem'], required: true },
    targetSlug: { type: String, required: true },
    targetTitle: { type: String, required: true },
    targetId: { type: ObjectId },
    instruction: { type: String, default: '' }
  }]
}
```

### BatchPlan (`server/models/BatchPlan.js`)
```js
{
  batch: { type: ObjectId, ref: 'Batch', required: true },
  plan: { type: ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
}
```

---

## API Endpoints

### Admin Routes (`/api/plans`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/plans` | Admin | List plans (all centers) |
| GET | `/api/plans/:id` | Admin | Get single plan |
| POST | `/api/plans` | Admin | Create plan |
| PUT | `/api/plans/:id` | Admin | Update plan |
| DELETE | `/api/plans/:id` | Admin | Delete plan (retires BatchPlans) |
| GET | `/api/plans/hierarchy?subject=dsa` | Public | Get lesson→subtopic→problem tree |
| GET | `/api/plans/content-search` | Public | Search content across subjects |
| POST | `/api/plans/batches/:id/assign-plan` | Auth | Assign plan to batch |
| DELETE | `/api/plans/batches/:id/unassign-plan` | Auth | Remove plan from batch |
| GET | `/api/plans/batches/:id/active-plan` | Auth | Get active plan for a batch |

### Coordinator Routes (`/api/coordinator`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/coordinator/plans` | Coordinator | List plans scoped to own center |
| GET | `/api/coordinator/plans/:id` | Coordinator | Get own plan |
| POST | `/api/coordinator/plans` | Coordinator | Create plan for own center |
| PUT | `/api/coordinator/plans/:id` | Coordinator | Update own plan |
| DELETE | `/api/coordinator/plans/:id` | Coordinator | Delete own plan |
| GET | `/api/coordinator/batches/progress` | Coordinator | Batch progress with plan data |
| POST | `/api/plans/batches/:id/assign-plan` | Auth | Assign to own batch (shared admin route) |
| DELETE | `/api/plans/batches/:id/unassign-plan` | Auth | Remove from own batch (shared admin route) |

---

## Content Hierarchy API

Returns nested tree for the builder UI:

```
GET /api/plans/hierarchy?subject=dsa

Response:
{
  lessons: [{
    _id, title, slug,
    subtopics: [{
      _id, title, slug,
      problems: [{ _id, title, slug, difficulty }]
    }]
  }]
}
```

Uses the `SUBJECT_MODELS` map from `server/services/progressService.js`.

---

## Builder UI — Two-Column Layout

```
┌───────────────────────┬───────────────────────────────────┐
│  📂 Content Browser   │     📅 Day Planner                │
│                       │                                   │
│  Subject: [DSA ▼]     │  ▼ Day 1 — 2 items                │
│                       │    📘 Arrays (Lesson)             │
│  ▼ Arrays             │      Instruction: [........] [✕]  │
│    ▼ Array Basics     │    📝 Two Sum (Problem)           │
│      ○ Two Sum   [+]  │      [✕]                          │
│      ○ Three Sum [+]  │  ▼ Day 2 — 1 item                 │
│    ▼ Rotation         │    📘 Linked Lists (Lesson)       │
│      ○ Rotate    [+]  │      Instruction: [........] [✕]  │
│      ○ Search    [+]  │                                   │
│  ▼ Linked Lists       │  [ + Add Day ]                    │
│    ▼ Singly LL        ├───────────────────────────────────┤
│      ○ Reverse   [+]  │  [💾 Save Draft] [📢 Publish]     │
└───────────────────────┴───────────────────────────────────┘
```

- Left: hierarchy browser — expand lessons → subtopics → problems, click `[+]` to add
- Right: day-by-day items with inline instruction field and remove `[✕]`
- Clicking `[+]` adds to currently selected day (or prompts day picker)

---

## Coordinator Dashboard Redesign

The current `/coordinator` page (generic stats) moves to `/coordinator/general-stats` in the sidebar.

The new `/coordinator` page shows:

```
┌──────────────────────────────────────────────────────────┐
│  👋 Welcome back, Ravi                                   │
│  Your Center: CodeCamp Academy                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Active       │  │ Total       │  │ Plans       │      │
│  │ Batches      │  │ Students    │  │ Created     │      │
│  │     4        │  │     87      │  │     6       │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
├─────────── Batch Progress ───────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Batch Alpha  ●  Day 14 / 30  ████████████░░░░░░░  │  │
│  │ Plan: DSA Sprint  · Started Mar 1  → On Track     │  │
│  │ [View Batch]                                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Batch Beta   ●  Day 2 / 30   ██░░░░░░░░░░░░░░░░  │  │
│  │ Plan: DSA Sprint  · Started Mar 15  → On Track    │  │
│  │ [View Batch]                                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Batch Gamma  ⚠  Day 8 / 45  ██████░░░░░░░░░░░░░  │  │
│  │ Plan: DBMS Deep Dive  · Started Feb 20 → 3 days   │  │
│  │ behind schedule                                    │  │
│  │ [View Batch]                                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
├─────────── Quick Actions ────────────────────────────────┤
│                                                          │
│  [📋 Create Plan]  [👥 New Batch]  [📊 Download Report] │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Coordinator Sidebar Changes

```
Before:                  After:
┌─────────────┐         ┌──────────────────┐
│ Dashboard   │         │ Dashboard        │  ← batch progress (new)
│ Batches     │         │ General Stats    │  ← moved from Dashboard
│ Students    │         │ Batches          │
│ ...         │         │ Students         │
│             │         │ Plans            │  ← new link
│             │         │ ...              │
└─────────────┘         └──────────────────┘
```

---

## Student Dashboard

(To be implemented in a later phase)
- Shows current day's items from the batch's active plan
- Progress bar per plan
- Completion tracking (checkbox per item)

---

## Future Considerations

- **Teacher role** — dedicated plan builder with batch assignment access
- **Completion tracking** — students mark items done, stats per batch
- **Plan templates** — pre-built plans shipped with the platform
- **Reorder / drag-drop** in day planner
- **Copy plan** — duplicate an existing plan as draft
- **Multiple plans per batch** — staggered (e.g., morning DSA, evening DBMS)

---

## Session Log

| Date | Discussion |
|------|------------|
| Jul 22 | Plan vs BatchPlan clarified. Faculty should build plans, not coordinator. Agreed to defer teacher role to later. Visual hierarchy browser preferred over search. Instruction field per item. Coordinator dashboard redesigned to show batch progress. Stats moved to `/general-stats`. |
