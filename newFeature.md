# Prompt for DeepSeek — Course Offerings (standalone addition, on top of the already-completed Batches phase)

Paste this to the agent as its own task. Do not paste this into
`goals-2.md` — Phase 12 in that document is already marked complete, and
adding this there would make it look like unfinished Phase 12 work
instead of what it actually is: a new, separate addition that builds on
top of the already-shipped `Batch`/`CoachingCenter`/`coordinatorOnly.js`
system.

---

You are working in the existing **thejobstarter** repository. The
coaching-center and batch system is already fully built and deployed:
`CoachingCenter`, `Batch` (with `coachingCenter`, `name`, `code`,
`status`), `User.coachingCenter` / `User.batch` /
`User.coordinatorFor`, `middleware/coordinatorOnly.js`,
`controllers/coordinatorController.js`,
`services/centerRosterService.js`. Read those files before starting —
this task extends them, it does not replace or redo them.

## In plain terms — the problem this solves

A coaching center doesn't just run one program — it might run "Full-Stack
Development," "Data Science," and others at the same time, each with its
own batches. Right now, when a coordinator wants to sort students into
batches, there's nothing in the app that says which program a given
student actually signed up for. The coordinator would have to recognize
names from memory or check an outside spreadsheet — that doesn't scale
and isn't something the app should require. This task adds that missing
piece: a center can define the list of courses/programs it runs, a
student picks theirs when they join the center, and a coordinator can
then filter and bulk-assign students into batches using that as a real
signal instead of guessing.

## Critical naming warning — read this before writing any code

**Do not call this concept `subject` anywhere — model name, field name,
variable name, nothing.** The word `subject` is already used extensively
and specifically throughout this codebase to mean one of the four content
pillars — `dsa`, `dbms`, `os`, `programming` — in `Progress.subject`,
`Plan.items[].subject`, the `SUBJECT_MODELS` map, and elsewhere. If this
new concept (a center's course/program, like "Full-Stack Development")
also gets called `subject`, it will collide with that existing meaning
and cause real confusion in code that touches both. Call this concept
**`CourseOffering`** as the model name, and `courseOffering` as the field
name everywhere it appears on other models. Never `subject`, `course`
alone, or anything that could be mistaken for the four-pillar content
system.

## New model — `server/models/CourseOffering.js`

```js
{
  coachingCenter: { type: ObjectId, ref: 'CoachingCenter', required: true, index: true },
  name: { type: String, required: true },   // e.g. "Full-Stack Development", "Data Science"
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  { timestamps: true }
}
```

## Admin + coordinator CRUD

- `server/controllers/courseOfferingController.js` +
  `server/routes/courseOfferingRoutes.js`, mounted at
  `/api/course-offerings`. Admin: full CRUD, unscoped, same shape as
  `coachingCenterController.js`.
- Coordinator: `GET/POST/PATCH /api/coordinator/course-offerings` in
  `coordinatorController.js`, scoped to `req.coordinatorCenterId` on
  create — force it server-side regardless of what's in the request
  body, same rule as every other coordinator-scoped create endpoint
  already in this codebase.
- `GET /api/coaching-centers/:centerId/course-offerings` — public to any
  authenticated user, used by the student-facing dropdown below. Only
  returns `status: 'active'` offerings for that one center.

## `Batch` model change (additive)

```js
courseOffering: { type: ObjectId, ref: 'CourseOffering', default: null }
```
Optional, not required — don't force every existing or new batch to have
one, this is additive on top of what already works. Settable when
creating or editing a batch (admin and coordinator batch-management
screens both get this field added to their existing forms — don't build
new forms for it).

## `User` model change (additive)

```js
courseOffering: { type: ObjectId, ref: 'CourseOffering', default: null }
```
This is the student's own chosen course.

## Student-facing flow — this is a change to the existing EditProfile flow, not a new page

The coaching-center code field and batch code field already exist in
`EditProfile.jsx` (center code: mandatory-if-you-want-to-join, always
optional overall; batch code: optional). Add a third element to this
same section: **once a student has successfully joined a center** (i.e.
`user.coachingCenter` is set), show a searchable dropdown listing that
center's `CourseOffering`s (fetched from the endpoint above). This
dropdown is **mandatory** — but only conditionally: a student who never
joined a center has no course list to choose from and shouldn't be
forced into this; a student who *did* join a center must pick one for
their profile to count as complete. The batch code field stays optional
exactly as it already is — this task doesn't change that.

New endpoint: `POST /api/users/select-course` body
`{ courseOfferingId }`, `requireAuth`. Verify the `CourseOffering`
belongs to the caller's own `user.coachingCenter` before setting
`user.courseOffering` — a student must not be able to pick a course from
a center they haven't joined.

**Wire into the existing profile-completeness check from `goals.md`
Phase 3** (the one that drives the `profile_incomplete` notification via
the navbar bell — reuse it, do not build a second notification
mechanism): the required-fields list needs a conditional rule added —
`courseOffering` becomes required *only if* `user.coachingCenter` is set.
A student with no center is unaffected by this change entirely.

## Coordinator — batch assignment, filtering, and course changes

This is the actual fix for the original bulk-assignment problem. Extend
the existing student-list endpoint the coordinator uses for batch
assignment (`GET /api/coordinator/students` or wherever the
batch-assignment picker currently pulls its student list from) to accept
an optional `?courseOffering=<id>` filter. In the UI, add the same
searchable-course dropdown as a filter control above the student list on
the batch-assignment screen — a coordinator picks "Full-Stack," sees only
students who chose that course, multi-selects, assigns them to a batch.
This is what turns bulk assignment from "guessing from memory" into
something backed by real data.

**Changing a student's course** — mirrors the existing batch-remove
escape hatch from the Batches phase: `PATCH
/api/coordinator/students/:userId/course` body
`{ courseOfferingId }` (or `null` to clear it). Same double ownership
check already used for batch assignment: the target student's
`coachingCenter` must equal `req.coordinatorCenterId`, and the
`CourseOffering` being assigned must also belong to
`req.coordinatorCenterId` — both checks, not just one.

**Worth considering, not required for this task:** you could make batch
assignment itself validate that a student's `courseOffering` matches the
`Batch`'s `courseOffering` before allowing the assignment, which would
turn "coordinator might assign the wrong student to the wrong batch"
into something the system actively prevents rather than just makes
easier to avoid. Flag this to the person you're building this for as an
option rather than building it silently — it's a real behavior change
(a hard block, not just a helpful filter) and should be a deliberate
choice, not something that shows up unannounced.

## Admin visibility and the mandatory warning popup

Admin's per-center roster view (`AdminCoachingCenterDetail.jsx`) gets the
student's `courseOffering` added as a visible column, same way `batch`
was added in the Batches phase. If admin changes a student's course
through this screen, **the UI must block the change behind a
confirmation popup** — something like "Are you sure you want to change
this student's course from X to Y?" with an explicit confirm step, not a
silent inline edit. This is a UI-only requirement — there's no technical
enforcement that can catch a missing confirmation dialog automatically,
so treat it as a hard acceptance-criteria item to check by hand, not
something a passing test proves.

## Acceptance criteria

- A student who hasn't joined a center never sees the course dropdown
  and is never blocked from a "complete" profile because of it.
- A student who has joined a center cannot mark their profile complete
  without picking a course, and cannot pick a course belonging to a
  different center than the one they joined.
- A coordinator filtering the batch-assignment screen by course only
  ever sees students from their own center — verify with the same
  two-coordinators/two-centers test used for every other coordinator
  feature in this codebase.
- Changing a student's course via the admin screen cannot be submitted
  without the confirmation popup appearing first — check this by hand,
  it will not show up in an automated test.