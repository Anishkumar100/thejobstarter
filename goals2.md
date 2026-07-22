# goals-2.md — TheJobStarter: Programming Concepts Pillar, Batches, Placement Plans & Engagement Insights

You are an autonomous coding agent working inside the existing
**thejobstarter** repository. This document assumes the coaching-center /
coordinator system from `goals.md` (Phases 0–9) is already built and
deployed: `CoachingCenter`, `User.coachingCenter` /
`User.coordinatorFor`, `Progress`, `Quiz`, `QuizAttempt`,
`services/centerRosterService.js`, `services/progressService.js`,
`middleware/coordinatorOnly.js`, `controllers/coordinatorController.js`.
Read those files before starting — this document extends them, it does
not replace them. (Note: `client/src/pages/` was not reorganized into
subfolders yet — Phase 10 from `goals.md` is still outstanding and is
unrelated to this document; don't do it as part of this work either.)

**Important, read this before anything else:** the currently-shipped
`services/progressService.js`, `models/Progress.js`, and `models/Quiz.js`
hard-code exactly three subjects — `dsa`, `dbms`, `os` — in several
places: `Progress.subject`'s enum, `Quiz.problemModel`'s enum, the
`SUBJECT_MODELS` map, the `MODEL_TO_SUBJECT` map, the `subjects` array
inside `getProgressSummary()`, and the initial stats object inside
`getQuizStats()`. Phase 11 below adds a fourth subject —
**Programming Concepts** — as a real, equal fourth pillar alongside DSA,
DBMS, and OS, which means retrofitting every one of those hard-coded
spots, not just adding new content. Everything built in Phases 12–16 —
batches, needs-attention, plans, dual tracking, daily tasks — must treat
Programming Concepts identically to the other three subjects everywhere
a subject is referenced. If you find yourself writing a check, mapping,
or UI tab that lists `dsa`/`dbms`/`os` without `programming`, that's a
bug introduced by this document, not something to leave for later.

**Model-specific operating notes (you are DeepSeek-V4-Flash):** same as
last time — use your context window to re-read the actual current source
(not just this doc) before each phase, restate your file-level plan before
writing code, run each phase's acceptance criteria yourself before
reporting it done, and treat the Hard Rules below as overriding any
shortcut that looks reasonable in isolation. **If a phase's technical
spec is unclear, read its "In plain terms" summary first** — every phase
below now opens with one, written in simple, non-technical language,
specifically so a phase's *intent* is unambiguous even before the model
names and endpoints are read. If the plain-terms summary and the
technical spec ever seem to conflict, the plain-terms summary describes
what's actually wanted — ask rather than guess.

---

## 0. Hard rules

1. **Additive first**, same as `goals.md`. Don't touch unrelated files.
   Don't refactor `centerRosterService.js` or `progressService.js`
   wholesale — extend them, including the four-subjects retrofit in
   Phase 11, which is a set of small, precise edits to existing arrays
   and enums, not a rewrite.
2. **Tenant scoping is still the most important rule.** Everything added
   here introduces a *second* level of scoping on top of the first:
   a `Batch` belongs to a `CoachingCenter`, and a coordinator must only
   ever see/manage batches that belong to their own `coordinatorFor`
   center. Never accept a `coachingCenter` id from a coordinator's request
   body — always derive it from `req.coordinatorCenterId`, exactly as
   `coordinatorController.js` already does. A coordinator creating a batch
   with a `coachingCenter` field they supplied themselves is exactly the
   bug this rule exists to prevent.
3. **Codes are guessable-adjacent, same as the coaching-center code.**
   `goals.md` specified `nanoid(12)` for center codes; the shipped code
   used `nanoid(6)` — a real entropy drop that was never explicitly
   decided, just happened. Don't repeat that silently here: batch codes
   in this document use `nanoid(8)`, written explicitly in the model spec
   below. If you deviate from this, say so out loud in your phase summary
   — don't just change a number quietly.
4. **No new caching or denormalized totals.** Everything computed in this
   document (needs-attention flags, plan pace, daily tasks, and the new
   subject's totals) is computed live from `Progress`/`QuizAttempt`/the
   new models, the same way `progressService.js` already does it. If
   performance becomes a real problem later (large rosters, four subjects
   instead of three), the fix is a smarter aggregation query, not a cache
   that can drift stale.
5. **Don't build a second completion-tracking mechanism.** Daily tasks
   (Phase 16) are a *view* over existing `Progress` documents — checking
   off a task must go through the same completion path a student already
   uses (marking a problem/lesson done), not a parallel "mark task done"
   button that writes somewhere else. Same principle as the earlier
   decision to reuse `Notification` instead of building a second
   notification system.
6. **New dependencies:** none beyond what `goals.md` already added
   (`nanoid`, csv writer). Don't add a scheduling/cron library for the
   "daily tasks" feature — it's a read-time calculation from a date, not a
   background job.
7. **One canonical language for Programming Concepts.** "Programming
   Concepts" is not language-neutral — OOP looks different in Java,
   Python, and C++. Do not build multi-language content in this pass;
   decide one language before writing a single lesson (see Phase 11) and
   treat anything beyond that as a future, separate expansion.

---

## Build order

```
Phase 11: Programming Concepts — new 4th content pillar + retrofit existing subject-list code
Phase 12: Batches — model, codes, two join paths, admin + coordinator CRUD
Phase 13: Needs Attention — inactivity, relative standing, quiz average (general data only — no plans exist yet)
Phase 14: Placement Plans — reusable plan templates + per-batch assignment (all 4 subjects)
Phase 15: Dual progress tracking — plan-pace calculation, shown alongside general progress
Phase 16: Daily/weekly task view — thin read layer over Phase 14/15 data
```

Programming Concepts goes first, ahead of batches and everything else,
because Phases 14–16 all touch the `subject` concept directly (plan
items, progress totals, pace calculations) — building those against only
three subjects and then retrofitting a fourth in afterward means touching
the same files twice. Get the fourth subject in and working end-to-end
first, then build the batch/plan/tracking layer once, correctly, against
all four subjects from the start. Batches, Needs Attention, Plans, dual
tracking, and daily tasks keep the same relative order and reasoning as
before: batches first because everything else needs students grouped
narrower than "the whole center"; Needs Attention next because it doesn't
need plans to exist and should ship early — it's deliberately built
against general data only, and gets a fourth signal added to it later in
Phase 15 once plan data exists, rather than waiting for plans first;
Plans is the largest single piece, isolated in its own phase; dual
tracking and daily tasks depend on plans, in that order, because daily
tasks is just a filtered read of what dual tracking already computes.

---

## Phase 11 — Programming Concepts: the 4th content pillar

**In plain terms:** right now the app has three subjects — DSA, DBMS,
OS. This phase adds a fourth one, "Programming Concepts" — basic
programming from Hello World through object-oriented programming to more
advanced topics, structured the exact same way as the other three
(lessons → subtopics → problems). Once this exists, it has to work
*everywhere* the other three subjects already work — a student's
dashboard, the coordinator's view of a student, CSV exports, quizzes —
not just on its own new content pages. If you only build the new content
pages and forget to update the other places that currently only know
about three subjects, this phase isn't done.

**The concept:** the research behind this addition matters, so it's
worth restating plainly. Looking at real coaching-center course catalogs
(including centers on the actual target list), DSA is clearly taught as
a standalone, interview-focused course everywhere. DBMS and OS, as
academic/theoretical subjects, are largely *absent* from what these
centers sell — what exists instead is practical database-tool training
(Oracle, MySQL, MongoDB), not the theory taught in a CS syllabus or asked
in interview rounds, likely because Anna University's own curriculum
already covers DBMS/OS theory and a center's actual value-add is filling
the gap college leaves, which is DSA. What *is* everywhere across these
catalogs, in large volume, is core programming language training — Core
Java, Advanced Java, C, C++, Python — beginner through advanced. Adding a
"Programming Concepts" pillar — Hello World through OOP through advanced
concepts, in the same lesson → subtopic → problem hierarchy as the other
three subjects — maps directly onto what these centers already run as
paid courses, and widens who on any given batch gets real value from the
app: not just students already deep into DSA-focused placement prep, but
first/second-years and non-CS-branch students taking a center's basic
programming course. DBMS and OS remain in the app as interview-theory
depth, not the headline; Programming Concepts and DSA become the
stronger, more recognizable pitch to a center.

**Decision required before writing a single lesson:** pick one canonical
language for this pillar — do not build multi-language content in this
pass (rule 7). Recommended default, given Anna University's curriculum
and what appears most across target centers' own catalogs: **Java**.
Confirm this before starting; if a different language is chosen, replace
every "Java" reference below with the chosen language, but do not attempt
more than one.

**New models — follow the DBMS/OS prefixed pattern, not DSA's legacy
generic naming (DSA's `Subtopic`/`Problem` naming was a first-mover
artifact, not a pattern to replicate going forward):**
- `server/models/ProgrammingLesson.js` — mirror `DbmsLesson.js` /
  `OsLesson.js` field-for-field (slug, title, content, order, etc. —
  copy the exact shape, don't invent a new one).
- `server/models/ProgrammingSubtopic.js` — mirror `DbmsSubtopic.js` /
  `OsSubtopic.js`.
- `server/models/ProgrammingProblem.js` — mirror `DbmsProblem.js` /
  `OsProblem.js`. Decide whether Programming Concepts problems need
  `codeBlocks` (DSA/DBMS-style) or are conceptual-only like `OsProblem`
  — given this pillar is explicitly about writing code (Hello World
  onward), it almost certainly needs `codeBlocks`; don't copy `OsProblem`
  by default without checking this.

**Content structure, concretely, so "Hello World to advanced" has actual
boundaries:** organize lessons roughly as (a) fundamentals — variables,
data types, control flow, functions, (b) OOP — classes, objects,
inheritance, polymorphism, encapsulation, abstraction, (c) intermediate —
collections/generics, exception handling, file I/O, (d) advanced —
whatever the chosen language's ecosystem considers advanced (for Java:
multithreading basics, streams, or similar) — treat this as a starting
outline, not a rigid final structure; refine it against what real target
centers' own "Core Java"/"Advanced Java" course syllabi actually cover,
so the content maps recognizably onto what a center already teaches.

**Admin CRUD + UI:** mirror the existing DBMS/OS admin controllers,
routes, and pages exactly — `programmingController.js`,
`programmingRoutes.js` mounted at `/api/programming`, and
`AdminProgrammingLessons.jsx` / equivalents, same shape as the DBMS/OS
admin pages. Same for the public-facing content pages
(`ProgrammingDetail.jsx` etc., mirroring `DbmsDetail.jsx`/`OsDetail.jsx`).

**The retrofit — this is the part that's easy to under-scope. Every one
of these needs the fourth subject added, precisely:**
- `models/Progress.js` — `subject` enum: add `'programming'`.
- `models/Quiz.js` — `problemModel` enum: add `'ProgrammingProblem'`.
- `services/progressService.js`:
  - `SUBJECT_MODELS` map — add
    `programming: { lesson: ProgrammingLesson, subtopic: ProgrammingSubtopic, problem: ProgrammingProblem }`,
    plus the corresponding import lines at the top of the file.
  - `MODEL_TO_SUBJECT` map — add `ProgrammingProblem: 'programming'`.
  - `getQuizStats()`'s initial `stats` object — add
    `programming: { quizzesTaken: 0, avgScore: 0 }`.
  - `getProgressSummary()`'s `subjects` array — add `'programming'` so it
    reads `['dsa', 'dbms', 'os', 'programming']`.
- Quiz authoring UI (the collapsible section added to
  `AdminDsaProblemEdit.jsx`/`AdminDbmsProblemEdit.jsx`/
  `AdminOsProblemEdit.jsx` in the original `goals.md` Phase 7) — add the
  same block to the new `AdminProgrammingProblemEdit.jsx`.
- `UserProfile.jsx`'s dashboard (`goals.md` Phase 6) — the per-subject
  progress bars must render a fourth block for `programming` alongside
  `dsa`/`dbms`/`os`. Check whether this is hard-coded per-subject JSX or
  already looped over a subject list — if hard-coded, this is the one
  place in the existing frontend that needs a genuine small edit, not
  just a new file.
- `centerRosterService.js` / roster CSV exports — anywhere `dsa`/`dbms`/
  `os` are listed as columns or fields, add `programming`.
- **`CoordinatorDashboard.jsx` and `AdminCoachingCenterDetail.jsx` —**
  this is the part easiest to silently skip, since it's a UI change to
  screens that already exist and already "work." Both currently render
  per-student stats for three subjects. Check whether that's a hard-coded
  three-column table/three JSX blocks or already looped over whatever
  `getProgressSummary()` returns — if hard-coded, add the fourth column
  explicitly. A coordinator or admin who can't see a student's
  Programming Concepts progress in the same place they see DSA/DBMS/OS
  progress is exactly the kind of half-done retrofit rule 1 in the intro
  warns about — the backend returning the data correctly is not the same
  as the person who needs it being able to see it.

**Acceptance criteria:** a student completing a Programming Concepts
lesson/problem shows up correctly in their dashboard's fourth progress
block, in the coordinator/admin roster stats, and in CSV exports — same
correctness bar as the other three subjects, verified by actually
completing an item and checking it appears everywhere the other three
subjects' progress already appears, not just in the new subject's own
detail pages.

---

## Phase 12 — Batches

**In plain terms:** a coaching center isn't one big undivided group of
students — it runs several batches at once (a January group, a March
group, a weekend group). Right now the app only knows "this student
belongs to this center," with no way to say which specific batch inside
that center they're in. This phase adds that: a batch is a named
sub-group inside a center, with its own join code, and a student can be
placed into one either by entering that code themselves or by their
coordinator assigning them directly.

**New model — `server/models/Batch.js`:**
```js
{
  coachingCenter: { type: ObjectId, ref: 'CoachingCenter', required: true, index: true },
  name: { type: String, required: true },            // e.g. "Jan 2027 Weekend Batch"
  code: { type: String, required: true, unique: true, index: true }, // nanoid(8)
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  expectedStudents: { type: Number, default: null },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  { timestamps: true }
}
```

**User model change (additive) — `server/models/User.js`:**
```js
batch: { type: ObjectId, ref: 'Batch', default: null }
```
Do not remove `coachingCenter`/`coachingCenterJoinedAt` — keep both, and
keep them in sync deliberately: whenever `user.batch` is set, also set
`user.coachingCenter` to `batch.coachingCenter` in the same write. This
means `centerRosterService.js`'s existing `User.find({ coachingCenter:
centerId })` query keeps working completely unmodified — a batch is a
refinement inside a center, never a replacement for the center link.

**Two join paths, exactly as specified:**
1. **Student self-joins via code** — `POST /api/users/link-batch` body
   `{ code }`, `requireAuth`. Look up the `Batch` by code. Reject with a
   clear message if the student's `user.coachingCenter` doesn't already
   match `batch.coachingCenter` — a student has to belong to the center
   before they can belong to one of its batches; don't let a batch code
   silently join someone to a center they were never linked to. On
   success, set `user.batch`.
2. **Coordinator assigns directly** — `PATCH /api/coordinator/students/:userId/batch`
   body `{ batchId }`, `requireAuth, requireCoordinator`. Verify (a) the
   target student's `coachingCenter` equals `req.coordinatorCenterId`
   (reuse the exact ownership check already in `updateStudent`/
   `removeStudent` in `coordinatorController.js`) and (b) the batch's
   `coachingCenter` also equals `req.coordinatorCenterId` — both checks,
   not just one, or a coordinator could assign one of their own students
   into a batch that belongs to a different center.

**Admin CRUD:** `server/controllers/batchController.js` +
`server/routes/batchRoutes.js`, mounted at `/api/batches`,
`requireAuth, requireAdmin` for create/update/delete/list-all. Same shape
as `coachingCenterController.js` — generate the code server-side via
`nanoid(8)`, never accept one from the client. Include a
`regenerateBatchCode` endpoint, same reasoning as the center one.

**Coordinator batch management:** `GET/POST/PATCH /api/coordinator/batches`
in `coordinatorController.js`, scoped to `req.coordinatorCenterId` — a
coordinator can create and edit batches for their own center without
admin involvement. On create, force `coachingCenter =
req.coordinatorCenterId` server-side regardless of what's in the request
body (rule 2).

**Extend `centerRosterService.js`:** add `batch` (populated with `name`)
to the `.select()` in `getCenterRoster()`'s student query, and add a new
sibling function `getBatchRoster(batchId)` that does the same thing
`getCenterRoster` does but filters `User.find({ batch: batchId })`
instead of by center — reuse `getProgressSummariesForUsers` exactly as
`getCenterRoster` already does, don't duplicate that logic.

**Same leak risk as the center code, now doubled — build the escape
hatch now, not later:** `PATCH /api/coordinator/students/:userId/batch/remove`
— unlinks `user.batch` (sets to `null`) without touching
`user.coachingCenter`, same ownership verification as above. A coordinator
noticing a stranger in the wrong batch needs to be able to fix it
immediately, same reasoning as the existing center-level remove endpoint.

**UI:** admin batch list/create page (mirror `AdminCoachingCenters.jsx`),
a batch selector inside `AdminCoachingCenterDetail.jsx` and
`CoordinatorDashboard.jsx` so the roster can be filtered/grouped by batch,
and the batch-code field + join flow added to `EditProfile.jsx` right
next to the existing coaching-center code field — same verify-then-submit
pattern already built for the center code.

**Acceptance criteria:** a student cannot join a batch belonging to a
center they haven't joined. A coordinator cannot assign a student to, or
create a batch under, any center other than their own — verified the same
way Phase 8 (in `goals.md`) was verified: two coordinators, two centers,
hand-tested.

---

## Phase 13 — Needs Attention

**In plain terms, before anything technical:** a coordinator with
150–200 students isn't going to scroll through a spreadsheet every week
checking each one to see who's struggling. This phase makes the app do
that automatically. Three simple yes/no checks decide whether a student
gets flagged as "needs attention":

1. **Have they gone quiet?** No activity (no completed lesson/problem, no
   quiz taken) in the last 9 days → flag them.
2. **Are they behind their own batch?** Their overall completion
   percentage is in the bottom 15% compared to the rest of their own
   batch (or their whole center, if they're not in a batch) → flag them.
3. **Are their quiz scores weak?** Their average quiz score is under
   50% → flag them.

If any one of these three is true, the student is marked "needs
attention," and — importantly — the app records *which* reason, not just
a yes/no. So instead of a red dot with no explanation, whoever's looking
at it sees something like "Inactive 12 days" or "Quiz average 38%" right
next to the student's name.

**This phase uses general stats only — there is no plan data to check
against yet.** `Plan` and `BatchPlan` don't exist until Phase 14, and the
plan-pace calculation doesn't exist until Phase 15. Do not attempt to
add a "behind their plan" check in this phase — there's nothing yet to
compute it from. A fourth reason, `'behind plan pace'`, gets added to
this exact same system later, in Phase 15, once that data exists — this
phase is built so that addition slots in cleanly, not so it has to be
built now. If this phase is done correctly, "needs attention" today means
exactly, and only, the three checks above.

**This is for all three stakeholders, not just the coordinator — build
all three pieces, not just the dashboard:**
- **Coordinator** — sees a "Needs Attention" list on their own dashboard.
- **Admin** — sees the same thing, same data, on the per-center detail
  page (a center might have multiple coordinators, or none yet — admin
  needs the same visibility).
- **Student** — gets their own notification when they personally get
  flagged, reusing the existing notification system (see below) — not
  just the coordinator finding out on their behalf.

**New file — `server/services/needsAttentionService.js`:**
```js
// computeNeedsAttention(students)
// students: the array already returned by getCenterRoster/getBatchRoster,
// each with a `.progress` field from getProgressSummariesForUsers.
// Returns the same array with two fields added per student:
//   needsAttention: boolean
//   attentionReasons: string[]  e.g. ['Inactive 12 days', 'Bottom 15% of batch', 'Quiz avg 38%']
```
This needs one new piece of data not currently computed:
**last-activity timestamp** per student — the max of their most recent
`Progress.completedAt` and most recent `QuizAttempt.attemptedAt`. Add this
as a new function in `progressService.js`,
`getLastActivityForUsers(userIds)`, returning a `Map` the same shape as
`getProgressSummariesForUsers` does, and call it once per roster fetch —
don't compute it per-student in a loop, batch it the same way progress
summaries are already batched.

Use the existing `STATUS_THRESHOLDS.QUIZ_WARNING` constant already in
`progressService.js` for the quiz-average check (currently 50%, per the
plain-terms description above) rather than inventing a second constant
for the same idea. "Overall completion" for the relative-standing check
means the sum across all four subjects — since `getProgressSummary()`
was already retrofitted in Phase 11 to include `programming`, this falls
out correctly as long as this phase sums across whatever subjects
`getProgressSummary()` actually returns, rather than hard-coding a
three-subject list of its own.

**Wire it in:** `getCenterRoster()` and `getBatchRoster()` both call
`computeNeedsAttention()` on the student list before returning, so
`needsAttention`/`attentionReasons` show up automatically everywhere the
roster already shows up — admin center view, coordinator dashboard, CSV
export (add the two fields as extra CSV columns in
`exportCoordinatorCsv` in `coordinatorController.js`).

**UI — coordinator and admin:** a "Needs Attention" section at the top
of `CoordinatorDashboard.jsx` (and the same section on
`AdminCoachingCenterDetail.jsx`) — filter the same roster data
client-side where `needsAttention === true`, sorted by number of reasons
flagged, each row showing the specific reason text, not just a red dot.
Whoever's looking at it should be able to tell why someone's flagged
straight from this list, without clicking into their profile.

**UI/backend — student:** reuse the existing `Notification` model (same
pattern as the `profile_incomplete` notification from `goals.md` Phase 3
— do not build a second notification mechanism). When a student's own
`needsAttention` flips to `true` on their own progress check, create (or
leave existing unread) a `Notification` with a new type, e.g.
`'needs_attention'`, carrying the specific reason text. Mark it resolved
automatically once none of the reasons apply anymore, the same way the
profile-completeness notification auto-resolves.

**Acceptance criteria:** a student with zero activity for 9+ days shows
up flagged with that specific reason, in both the dashboard and the CSV
export, with the correct reason text — not just a boolean — and that same
student receives their own notification with the same reason, which
clears automatically once they're active again. Confirm this works using
only general stats — no plan-related data should be referenced anywhere
in this phase's code.

---

## Phase 14 — Placement Plans

**In plain terms:** a coaching center running a 60-day placement-prep
program wants to tell their students exactly what to do, day by day —
not "here's the whole app, explore it," but "days 1–5: these lessons,
days 6–10: these problems." This phase lets a coordinator (or admin)
build that schedule once, as a reusable template, and then apply it to a
specific batch starting on a specific date — so the same "60-day plan"
can be reused for a new batch three months from now without rebuilding
it from scratch.

**The concept, explained properly since this is the largest piece:** a
coaching center running a 60-day placement-prep program wants to tell
their own students exactly what to do on which day — not "here's the
whole app, go explore," but "day 1–5: these lessons, day 6–10: these
problems, quiz at the end of day 10." That schedule is specific to how
*that center* runs *that program* — one center might front-load
Programming Concepts before DSA, another might do a 20-day DSA-only
sprint instead. The plan itself (the sequence of content and pacing)
should be reusable — a center will likely reuse "our standard 60-day
plan" across many future batches, each starting on a different date. So
there are two things, not one:

- **`Plan`** — the reusable template: a name, a duration, and an ordered
  list of content items each with a day-offset ("this problem is due by
  day 7"). Created once, doesn't know about any specific batch or start
  date.
- **`BatchPlan`** — the act of assigning a specific `Plan` to a specific
  `Batch` starting on a specific date. This is what turns "day 7" into an
  actual calendar date for that batch. A center can assign the same
  `Plan` to five different batches, each with its own `startDate`,
  without duplicating the plan's content list five times.

**New model — `server/models/Plan.js`:**
```js
{
  coachingCenter: { type: ObjectId, ref: 'CoachingCenter', required: true, index: true },
  name: { type: String, required: true },              // e.g. "60-Day Placement Plan"
  durationDays: { type: Number, required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  items: [{
    dayOffset: { type: Number, required: true },        // due by end of this day (1-indexed)
    subject: { type: String, enum: ['dsa', 'dbms', 'os', 'programming'], required: true },
    targetType: { type: String, enum: ['lesson', 'subtopic', 'problem'], required: true },
    targetSlug: { type: String, required: true }
  }],
  { timestamps: true }
}
```
Note the `subject` enum includes `'programming'` from the start — this
only works correctly if Phase 11 is fully done first (rule: build order
above exists specifically so this enum doesn't need a follow-up patch).

**New model — `server/models/BatchPlan.js`:**
```js
{
  batch: { type: ObjectId, ref: 'Batch', required: true, index: true },
  plan: { type: ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  { timestamps: true }
}
```
Only one `BatchPlan` with `status: 'active'` per `batch` at a time —
enforce this in the assign-plan endpoint (mark any existing active
`BatchPlan` for that batch as `'completed'` before creating the new one),
not with a unique index, since history (past plans a batch has run) is
worth keeping queryable.

**Endpoints — `server/controllers/planController.js` +
`server/routes/planRoutes.js`, mounted at `/api/plans`:**
- Admin: full CRUD on `Plan`, unscoped.
- Coordinator: `GET/POST/PUT/DELETE /api/coordinator/plans`, scoped to
  `req.coordinatorCenterId` on create (force it server-side, same as
  Phase 12's batch creation).
- `POST /api/batches/:batchId/assign-plan` body `{ planId, startDate }` —
  `requireAuth` + (`requireAdmin` OR `requireCoordinator` with the batch's
  `coachingCenter` verified against `req.coordinatorCenterId`). Creates
  the `BatchPlan`, retiring any prior active one for that batch.
- **Content search, the piece that actually needs care:**
  `GET /api/plans/content-search?subject=dsa&type=problem&q=two+sum`
  — this is what makes the plan-builder UI usable. It must query
  the correct model set per the `subject` param — using the exact same
  `SUBJECT_MODELS` map from `progressService.js` (now four entries after
  Phase 11: `dsa`, `dbms`, `os`, `programming`). Don't write a new ad-hoc
  mapping; import or mirror that one so the two stay in sync as content
  models evolve.

**UI — this is the most complex screen in this whole document, budget
real time for it:** `AdminPlanBuilder.jsx` / a coordinator equivalent —
name + duration fields, then a day-by-day (or week-by-week) item list
where each row is added via the content-search endpoint above: pick a
subject tab (now four: DSA/DBMS/OS/Programming), search, pick an item,
assign it a day-offset. Don't try to build a single unified content list
across all four subjects in one query — the UI can have four tabs/filters
calling the same search endpoint with a different `subject` param, which
is simpler and mirrors the real schema separation rather than fighting
it.

**Acceptance criteria:** the same `Plan` can be assigned to two different
`Batch`es with two different `startDate`s without duplicating any content
item data. Assigning a new plan to a batch that already has an active one
correctly marks the old one `'completed'`, not deleted — verify old
`BatchPlan` history is still queryable afterward. A plan mixing items
from all four subjects (e.g. Programming Concepts early, DSA later)
computes pace correctly in Phase 15 without any special-casing of the
fourth subject.

---

## Phase 15 — Dual progress tracking

**In plain terms:** once a batch has an active plan (from Phase 14), a
student in that batch has two different, both-true answers to "how am I
doing" — how much they've done on the platform overall (already tracked),
and whether they're keeping pace with what their center specifically
told them to do by today. Both get shown, not one instead of the other —
see the UI ordering notes below for exactly how.

**The concept:** once a batch has an active `BatchPlan`, a student in
that batch has two different, simultaneous answers to "how am I doing":
their all-time progress across the whole platform (already built,
untouched, now across four subjects after Phase 11), and their progress
*specifically against what their center told them to do by now*. These
are genuinely different numbers and both matter — a student could be
doing great generally but behind on their center's specific 60-day
sprint, or vice versa.

**New function — add to `services/progressService.js` (or a new sibling
file `planProgressService.js` if it keeps `progressService.js` from
growing unwieldy — your call, but don't duplicate the subject-totals
logic either way):**
```js
// getPlanProgress(userId, batchId)
// 1. Find the batch's active BatchPlan (and its Plan's items).
// 2. currentDayOffset = number of whole days between BatchPlan.startDate and today.
// 3. expectedItems = plan.items where dayOffset <= currentDayOffset.
// 4. completedOfExpected = count of those items with a matching Progress doc
//    for this user (match on subject + targetType + targetSlug — works
//    identically for a 'programming' item as for 'dsa'/'dbms'/'os').
// 5. paceStatus = 'ahead' | 'on-track' | 'behind', based on
//    completedOfExpected vs expectedItems.length.
// Returns { planName, currentDayOffset, durationDays, expectedCount,
//           completedCount, itemsBehind: [...], paceStatus }
// Returns null if the user has no batch or the batch has no active plan
// — this is the signal the UI uses to decide whether to show the second
// progress block at all.
```
Suppress a meaningful pace-status display for the first few days of a
plan (e.g. `currentDayOffset` under 3) — with almost nothing "expected"
yet, `paceStatus` is noise this early and shouldn't be shown as a
confident signal; render it as neutral/"just started" instead.

**Wire into `getProgressSummary(userId)`** so a single call returns both:
add a `planProgress` field (using the function above, keyed off
`user.batch`) alongside the existing per-subject `dsa`/`dbms`/`os`/
`programming` data — don't make the frontend make two separate calls for
something that's naturally one lookup per user.

**Wire into `needsAttentionService.js` from Phase 13:** add a fourth
reason, `'behind plan pace'`, when `paceStatus === 'behind'` — this is
genuinely the strongest signal of the four once plans exist, because
it's specific to what that batch was actually told to do, not a generic
completion number.

**UI — student's own dashboard:** show both blocks, always, side by
side: "General Progress" (existing, untouched, four subjects after
Phase 11) and "Plan Progress: <planName>, Day <currentDayOffset> of
<durationDays>" with its own bar and pace status — the plan block only
renders when `planProgress` isn't null. These answer two different
questions and a student benefits from seeing both without extra clicks.

**UI — coordinator dashboard, this needs different treatment than the
student view, not the same layout copied over:** a coordinator scanning
150–200 rows should not see two full stat blocks per student — that adds
scrolling and clutter and defeats the point of Needs Attention, which
exists to reduce what a coordinator has to process. Per row: lead with
plan pace (ahead/on-track/behind, shown as a status word or color, not a
second progress bar that looks identical to a completion bar — these are
different kinds of numbers and shouldn't look the same) if the student's
batch has an active plan, or general completion if it doesn't, right next
to the Needs Attention reason. Show the *other* stat only in that
student's own detail view, one click deeper — that's where a full
side-by-side breakdown belongs, same as the student's own dashboard.

**UI — dashboard entry point ordering (both admin and coordinator
landing views), top to bottom:**
1. Needs Attention section (from Phase 13) — always first.
2. Plan-based summary, if the batch has an active plan — e.g. "Day 12 of
   60 — 18 of 25 students on pace." This reflects a goal the coordinator
   set, so it leads over generic background stats.
3. General overview — a smaller, secondary summary band, still visible
   but visually behind the plan summary.
4. Full roster table below all of that.
Keep this on one screen — don't make a coordinator switch tabs or views
to see general vs. plan-based information.

**Acceptance criteria:** a student not in any batch, or in a batch with
no active plan, sees only their general progress — the plan-progress
block doesn't appear or error. A student behind their plan's expected
pace shows up in Needs Attention with the correct reason text, whether
the item they're behind on is DSA, DBMS, OS, or Programming Concepts. A
coordinator's roster row shows one leading stat plus the Needs Attention
reason, not two full stat blocks, per the layout guidance above.

---

## Phase 16 — Daily/weekly task view

**In plain terms:** once Phase 15 can figure out "what's expected by
today," showing a student "here's what's due this week" is basically just
displaying a filtered slice of that same information. This is
deliberately the simplest, cheapest phase — don't overbuild it into its
own product surface.

**New endpoint — `GET /api/plans/my-tasks`, `requireAuth`:** looks up the
caller's `user.batch`'s active `BatchPlan` (same lookup as
`getPlanProgress`), returns the `Plan` items whose `dayOffset` falls
within a window around `currentDayOffset` (default: today ± the current
week, i.e. `dayOffset` between `currentDayOffset - 6` and
`currentDayOffset`), each annotated with `completed: true/false` by
checking for a matching `Progress` document — this works identically
regardless of which of the four subjects the item belongs to. Returns an
empty list (not an error) for a student with no batch or no active plan.

**Do not add a "mark task done" action here.** Per rule 5, a task in this
view is completed by the student actually doing the underlying
lesson/subtopic/problem through the existing content pages — clicking a
task in this view should navigate to that content page (DSA, DBMS, OS, or
the new Programming Concepts pages, whichever the item belongs to), not
toggle a checkbox that writes anywhere new. The `completed` flag is
read-only, reflecting whatever `Progress` already says.

**UI:** a small "This Week" widget on `UserProfile.jsx`'s dashboard,
listing each task with its subject, a link to the actual content, and a
checkmark if already done. Keep it simple — a list, not a calendar
widget — this phase exists to surface the plan-progress data
conveniently, not to become its own product surface.

**Acceptance criteria:** a student with no batch/plan sees no widget at
all (not an empty/broken one). Clicking a task navigates to the real
content page, for all four subjects. Completing that content elsewhere
makes the task show as completed here without any extra action.

---

## When you're done with all 6 phases

Same as before: summarize every new file, every existing file touched and
what changed in it, and any deviation from this spec with your reasoning
— including, explicitly, which language was chosen for Programming
Concepts and why, if it wasn't Java.

Do not mark Phase 12 or Phase 14 "complete" without the two-coordinators/
two-centers-equivalent test run by hand for batches and plans specifically
— a batch or a plan leaking across centers is the same class of bug as
the original roster leak, just one level deeper, and just as real a risk
to a paying customer's data. Do not mark Phase 11 "complete" until you've
verified a Programming Concepts item's progress shows up correctly
everywhere the other three subjects' progress already appears — dashboard,
roster, CSV, and (once built) plan pace — not just on its own content
pages. Do not mark Phase 13 "complete" until all three stakeholder pieces
exist — coordinator section, admin section, and the student's own
notification — not just the coordinator dashboard.

---

## Session Log — Work Completed

### Phase 11 — Programming Concepts (4th Pillar)

**New Backend Models:**
- `server/models/ProgrammingLesson.js` — mirrors `DbmsLesson.js`
- `server/models/ProgrammingSubtopic.js` — mirrors `DbmsSubtopic.js`
- `server/models/ProgrammingProblem.js` — mirrors `DbmsProblem.js` (includes `codeBlocks`)
- `server/models/ProgrammingQuiz.js` — mirrors `DbmsQuiz.js` for quiz authoring

**Backend Controller + Routes:**
- `server/controllers/programmingController.js` — CRUD + progress tracking for Programming content
- `server/routes/programmingRoutes.js` — mounted at `/api/programming`
- `server/models/ProgrammingQuiz.js` + `server/routes/programmingQuizRoutes.js` (mounted at `/api/programming/quiz`)

**Backend Retrofit (4th subject added everywhere):**
- `models/Progress.js` — `subject` enum now includes `'programming'`
- `models/Quiz.js` — `problemModel` enum now includes `'ProgrammingProblem'`
- `services/progressService.js`:
  - `SUBJECT_MODELS` — added `programming` entry with `ProgrammingLesson`, `ProgrammingSubtopic`, `ProgrammingProblem`
  - `MODEL_TO_SUBJECT` — added `ProgrammingProblem: 'programming'`
  - `getQuizStats()` — initial `stats` object includes `programming`
  - `getProgressSummary()` — `subjects` array reads `['dsa', 'dbms', 'os', 'programming']`
- `controllers/progressController.js` — `SUBTOPIC_MODELS` includes `programming: ProgrammingSubtopic`
- `services/centerRosterService.js` — roster queries return programming progress data
- `services/needsAttentionService.js` — programming included in all 4-subject calculations
- CSV exports — programming columns added

**New Admin Frontend Pages:**
- `client/src/pages/Admin/AdminProgrammingLessons.jsx` — CRUD for lessons (mirrors AdminDbmsLessons)
- `client/src/pages/Admin/AdminProgrammingSubtopicList.jsx` — subtopics list (mirrors AdminDbmsSubtopics)
- `client/src/pages/Admin/AdminProgrammingProblemList.jsx` — problem list (mirrors AdminDbmsProblems)
- `client/src/pages/Admin/AdminProgrammingProblemEdit.jsx` — problem editor with quiz authoring section
- `client/src/pages/Admin/AdminProgrammingMeta.jsx` — CRUD for Programming categories/topics/companies (mirrors AdminDbmsMeta)
- `client/src/pages/Admin/AdminProgrammingAllSubtopics.jsx` — all subtopics view with lesson filter dropdown + "New Subtopic" button
- Routes added in `App.jsx`, sidebar link added in admin layout

**New Public Frontend Pages:**
- `client/src/pages/ProgrammingList.jsx` — fetches hero image from `/topics` by `category === 'PROG'`
- `client/src/pages/ProgrammingDetail.jsx` — lesson/subtopic/problem content view
- `client/src/pages/ProgrammingSubtopicProblems.jsx` — passes `subject="programming"` to ProblemCard

**Existing Frontend Files Modified:**
- `client/src/components/dsa/ProblemCard.jsx` — added `subject` prop (default `'dsa'`), removed hardcoded `/dsa/` links
- `client/src/pages/UserProfile.jsx` — added 4th progress bar for Programming
- `client/src/pages/CoordinatorDashboard.jsx` — added PROG to `SUBJECT_COLORS`, chart data, quiz section lookup, `Code2` icon, updated all "three subjects" texts to "four subjects (DSA, DBMS, OS, PROG)"
- `client/src/pages/CoordinatorStudentsList.jsx` — added PROG column (`#a855f7`) with progress bar, widened to 260px
- `client/src/components/users/FeedbackSection.jsx` — added `programming` entry to `nextSteps` advice

### Topics / Homepage

**AdminTopics.jsx:**
- Added `DEFAULT_TOPICS` with 4 entries (DSA, DBMS, OS, Programming — `category: 'PROG'`, `link: '/programming'`, `accentColor: '#a855f7'`, `order: 4`)
- Fetch logic merges DB topics with `DEFAULT_TOPICS` (overlay by `category`) so all 4 cards always appear
- Count changed from hardcoded to `topics.length`

**Home.jsx:**
- Added `DEFAULT_TOPICS` fallback with same 4 entries
- Topics fetch now merges API response with `DEFAULT_TOPICS` — if DB has 3 saved topics, the 4th (Programming) falls back to default
- Updated "Three Pillars" → "Four Pillars"

**CSS Fix:**
- `.home-topics__scroll` height changed from `calc(300vh + 60px)` to `calc(400vh + 60px)` in both `pages.css` and `pages_fixed.css` — fixes 4th card overlap with content below

### Quiz Stats Debugging

- Added (then removed) extensive `[QUIZ_DEBUG]` logs in `getQuizStats`
- Confirmed: 5 Quiz documents exist (3×`Problem`, 1×`DbmsProblem`, 1×`ProgrammingProblem`), but all 4 `QuizAttempt` records point only to `Problem` (DSA) — no user attempted DBMS/Programming quizzes, no `OsProblem` quiz exists
- Dashboard quiz data is correct — reflects actual attempts

### Status

- **Phase 11 (Programming Concepts):** Completed — models, controllers, routes, admin UI, public pages, retrofit in all 3-subject lists, coordinator/admin roster columns, quiz authoring, ProblemCard subject prop
- **Phase 12 (Batches):** Completed
- **Phase 13 (Needs Attention):** Completed — all 3 automated checks (inactivity, bottom 15%, quiz avg <50%) implemented with `needsAttentionService.js`, wired into coordinator dashboard, admin center detail, and student notifications. Additional session fixes below.
- **Phase 14 (Placement Plans):** Completed — `Plan` + `BatchPlan` models, full CRUD controller/routes (admin + coordinator-scoped), content hierarchy & search APIs, assign/unassign batch plan endpoints, batch progress endpoint. Frontend: `AdminPlanBuilder.jsx` (two-column builder with sticky left column, responsive mobile stack, hierarchy browser, day planner, inline instructions, save/publish), `AdminPlanList.jsx` (search, filter, create/edit/delete/publish), `CoordinatorBatchDetail.jsx` (plan picker modal, progress bar), `CoordinatorDashboard.jsx` (batch progress cards). Route paths documented in `phase14.md` need alignment: assign/unassign live at `/api/plans/batches/:id/...` (not `/api/batches/:id/...` as spec states). Student-facing plan view deferred to Phase 16.
- **Phase 15 (Dual progress):** Not started
- **Phase 16 (Daily tasks):** Not started

### Session Fixes (Post-Phase-13)

- **Duplicate clerkId fix** — `getUserByUsername` checks for existing doc by `clerkId` before creating; `updateProfile` falls back to `clerkId` lookup when username not found
- **`/qa/null` 500 fix** — `getQuestionById` validates ObjectId format before query; `useQaStore.fetchQuestionById` guards against null/invalid ID; `InboxList` renders `div` instead of `<Link to="/qa/null">` when `questionId` is missing
- **Theme toggle performance** — `App.jsx` changed from `useThemeStore()` (subscribes to full store, re-renders entire app on every toggle) to `useThemeStore(state => state.initTheme)` (selects only the stable function)
- **Smooth theme transitions** — added `transition` on `*` in `global.css` for `background-color`, `color`, `border-color`, `box-shadow` (150ms ease)
- **Messages page refresh button** — added manual Refresh button with `lastFetched` timestamp display + spin animation; no auto-polling changes
- **Coordinator Assign Students** — button now navigates to `/coordinator/batches/:id` (batch detail page with full student management) instead of opening a limited popup modal; removed the assign modal entirely
- **`server/utils/xlsxExport.js`** — deleted (orphaned file, zero imports)
- **Phase 14 frontend polish** — `AdminPlanBuilder.jsx` two-column layout made responsive: flex row (≥900px) with sticky left column (`position:sticky`, `overflow-y:auto`, `maxHeight:calc(100vh - 140px)`), flex column (<900px, stacked, no sticky). `.admin-main overflow-x:auto` override (breaks sticky) applied on mount, restored on unmount. Same override added to `AdminPlanList.jsx`.

### Remaining / Next Actions

1. Seed the Programming topic image via `/admin/topics` (hero image for `/programming` page)
2. Create quizzes for DBMS/OS/ProgrammingProblem problems and submit attempts to populate quiz stats