# goals.md — TheJobStarter: Coaching Center / B2B Feature Rollout

You are an autonomous coding agent working inside the existing **thejobstarter**
repository (Express 5 + Mongoose backend in `/server`, React 19 + Vite +
Zustand frontend in `/client`, Clerk for auth, ImageKit for media).

Read this entire file before writing any code. It defines *what* to build,
*in what order*, and — just as important — what you must **not** touch.

**Model-specific operating notes (you are DeepSeek-V4-Flash):** you have a
large context window — use it to re-read this whole file and the relevant
existing source files at the start of every phase rather than relying on
what you remember from earlier in the session. Work one phase at a time,
in the order given. Before writing any code for a phase, restate in your
own words: (a) which files you will create, (b) which existing files you
will edit and exactly which lines, (c) which of the Hard Rules in section 0
apply to this phase. If that restatement doesn't match what's written
below for the phase, stop and re-read the phase spec — don't proceed on a
guess. After finishing a phase, run its acceptance criteria yourself before
reporting the phase done; do not report a phase complete based on the code
"looking right." When a rule in section 0 and a convenience shortcut are in
tension, the rule wins — these rules exist specifically to stop shortcuts
that look reasonable in isolation but break tenant isolation or scope
creep across a long multi-phase task.

---

## 0. Hard rules (apply to every phase, no exceptions)

1. **Additive first.** Prefer adding new files, new fields, new routes over
   editing existing ones. When you must edit an existing file, change only
   the lines required for the feature in that phase — do not reformat,
   refactor, rename, or "clean up" surrounding code you weren't asked to
   touch, even if it looks messy (e.g. the heavy `console.log` debug
   statements in `middleware/auth.js` and controllers — leave them alone
   unless a phase explicitly says to remove them).
2. **Do not modify existing content CRUD logic.** `dsaController.js`,
   `dbmsController.js`, `osController.js`, `subtopicController.js`,
   `articleController.js`, `blogController.js`, `qaController.js`,
   `messageController.js`, `bookmarkController.js`, `cheatsheetController.js`,
   `siteConfigController.js`, and their routes/models are **out of scope**
   for every phase below except where a phase explicitly says "read from"
   or "count documents in." Read-only access to these is fine; behavior
   changes are not.
3. **Do not weaken auth.** Every new write route must follow the exact
   existing pattern: `router.METHOD(path, requireAuth, requireAdmin, handler)`
   (see `server/routes/dsaRoutes.js` or `adminRoutes.js` for reference). New
   roles (coordinator) get a **new** middleware file, modeled on
   `server/middleware/adminOnly.js` — do not edit `adminOnly.js` or
   `middleware/auth.js` itself.
4. **Every query scoped to a coaching center must filter by that center's
   id at the database level**, not just gate the route. A coordinator
   hitting `GET /api/coaching-centers/:id/students` must get a 403 if `:id`
   isn't their own `coordinatorFor` center — checked server-side, every
   request, not inferred from the frontend. This is the single most
   important rule in this whole document. Treat any endpoint that returns
   a list of students as tenant-scoped by default.
5. **No cached/denormalized totals for progress tracking.** Compute lesson/
   subtopic/problem completion percentages with live `countDocuments()` /
   aggregation queries at request time, the same way `getStats` in
   `adminController.js` already does. Do not add a stored counter that has
   to be kept in sync — that's a bug generator.
6. **Respect the DSA/DBMS/OS model asymmetry.** DSA content uses generic,
   unprefixed models: `DsaLesson`, `Subtopic`, `Problem`. DBMS and OS use
   prefixed, fully separate models: `DbmsLesson` / `DbmsSubtopic` /
   `DbmsProblem` and `OsLesson` / `OsSubtopic` / `OsProblem` (note:
   `OsProblem` has **no** `codeBlocks` field — OS problems are conceptual
   only). Any code computing "totals per subject" must query three
   different model sets, not one generic model with a `subject` field.
   Do not attempt to unify these schemas as part of this work — that's a
   separate migration, not part of this feature set.
7. **New collections only where you don't already have a fitting one.**
   Before adding a model, check whether an existing one already does the
   job:
   - Notifications → reuse `models/Notification.js`. It already has a
     `type` enum and a `read` boolean. Add a new enum value
     (`profile_incomplete`) rather than building a separate notification
     system.
   - User-to-content relations → mirror the pattern in `models/Bookmark.js`
     (`user` ref + `targetType`/`targetId`/`targetModel` + unique compound
     index) for the new `Progress` and `QuizAttempt` models in Phase 6/7.
8. **New dependencies:** only add `nanoid` (for center-code generation) and
   `json2csv` (or `csv-stringify`) for CSV export. Do not add anything else
   — no state-management library beyond the existing Zustand, no new UI kit
   beyond what's already imported in `client/package.json`.
9. **After each phase**, run the existing app and confirm nothing outside
   that phase's files changed (`git diff --stat` should only show the files
   listed in that phase's "Files" section). If it shows more, revert and
   redo more surgically.
10. Do **not** attempt to fix the two known pre-existing issues (the
    committed `server.zip` containing real secrets, and the missing Clerk
    webhook signature verification) as part of this work unless a phase
    explicitly asks — they're being handled separately. Don't touch
    `server.zip`, `userController.js`'s `handleClerkWebhook`, or
    `.gitignore` in any of these phases.

---

## Build order and why

```
Phase 0: Add requireAuth to the currently-open DSA/DBMS/OS content read routes
Phase 1: CoachingCenter model + admin CRUD API
Phase 2: Admin dashboard UI for coaching centers (create/list)
Phase 3: EditProfile — training center field + code linking + completion notification
Phase 4: Shared "center roster & stats" service (used by Phase 5 AND Phase 8)
Phase 5: Admin per-center detail view (student list, identity, stats, CRUD)
Phase 6: Student progress tracking (lesson/subtopic/problem completion) + dashboard-ified UserProfile
Phase 7: MCQ system (admin authoring + student taking + recording)
Phase 8: Coordinator role, middleware, and coordinator dashboard (reuses Phase 4 + Phase 6/7 data)
Phase 9: CSV export (student self-export + coordinator center-scoped export) + rule-based status message
Phase 10: Frontend `pages/` folder reorganization + import path cleanup
```

Phase 0 comes first because it's a five-line fix with zero dependency on
anything else in this document, and every day it's left open the DSA/DBMS/OS
content is fully public with no login required at all — that's a live gap,
not a future one, and it undermines the "students get access because their
center paid" pitch for the entire B2B feature set being built after it.
There's no reason to sequence something this cheap and this decoupled
anywhere but first.

Phase 10 comes last, deliberately, for the opposite reason: it's a
wide-blast-radius, purely organizational change (moving most of `pages/`
into subfolders and fixing every import that touches them) with zero
functional payoff. Doing it before Phases 2/5/8 means guessing a folder
structure for pages that don't exist yet; doing it after means every new
page created in Phases 2–9 gets placed in its final home once, not moved
twice. Do not fold Phase 10 into any other phase's commit — it should be
its own isolated change with nothing else in the diff, so that if
something breaks (a missed import, a case-sensitivity issue) it's obvious
which change caused it.

Rationale for the middle ordering: everything downstream needs a
`CoachingCenter` to exist and a way for a student to be linked to one, so
that's Phase 1–3. Phase 4 is built as a shared service *before* Phase 5
specifically so you don't write the roster-fetching logic twice (once for
admin, once for coordinator in Phase 8) — Phase 5 and Phase 8 are two thin
authorization layers over one function. Progress tracking (Phase 6) and
MCQs (Phase 7) are the least dependent on the org/coordinator layer and are
written next so there's real data for the coordinator dashboard and CSV
export to show. CSV export is last because it needs both the roster
(Phase 4) and the stats (Phase 6/7) to exist first.

Do not start a phase until the previous one is fully working end-to-end
(API + UI, manually testable) and confirmed. Do not jump ahead to make a
later phase's UI look complete with fake/mock data.

**Explicitly out of scope for all 9 phases below — do not build these
unless a future phase document says so:** any premium/paywall access
control (i.e. actually restricting content based on payment or center
status), payment gateway integration, and billing/invoicing. This document
only builds the tracking and organizational layer (who's linked to which
center, how they're progressing). Suspending a `CoachingCenter` in Phase 1
currently only blocks *new* code redemptions — it does **not** restrict
already-linked students' access to lessons/problems, because no such
access-restriction mechanism exists yet anywhere in this codebase. That's
intentional for this doc, but flag it back to the person who wrote this
spec before treating "suspend a center" as a real enforcement lever — right
now it isn't one.

---

## Phase 0 — Auth fix on public content read routes

**Goal:** `GET` routes for DSA/DBMS/OS lessons, subtopics, and problems
currently have no auth middleware at all — anyone, logged in or not, can
read full content. Fix that before touching anything else in this
document.

**Backend changes (per spec — 3 route files only):**

`server/routes/dsaRoutes.js`, `server/routes/dbmsRoutes.js`,
`server/routes/osRoutes.js` — added `requireAuth` as second argument to
every `GET` route that didn't already have it (lessons, subtopics,
subtopic problems, problems, and the legacy `GET /` in dsaRoutes).

**Frontend changes (REQUIRED BEYOND SPEC — auth race fix):**

Adding `requireAuth` to content GET routes exposed a timing bug: pages
fire API calls on mount (e.g. `Home.jsx` → `fetchProblems()`) before
Clerk's session token is available, causing a 401 flash on every pageload.
Three fixes applied:

1. `client/src/App.jsx` — `ClerkGate` component wraps all routes; blocks
   render until `useAuth().isLoaded` is true, with a motion-animated
   "INITIALIZING AUTH..." spinner. Added `useAuth` import + `motion`
   import.

2. `client/src/api/client.js` — `getClerkToken()` now polls up to 30
   iterations (100ms each) for `window.Clerk.session` before returning
   null, as a safety net for any component that somehow fires before
   ClerkGate has booted.

3. `client/src/pages/Home.jsx` — removed dead `useDsaStore` import and
   `fetchProblems()` call (the Home page was fetching DSA problems on
   mount but never rendering them — leftover from an earlier design).

**Do not touch:** `requireAdmin`-gated routes (already correct), any
controller file, any model.

**Acceptance criteria:** an unauthenticated request (no Clerk session) to
any of `GET /api/dsa/problems`, `GET /api/dbms/lessons`,
`GET /api/os/subtopics`, etc. returns a 401, matching the existing
`requireAuth` behavior used elsewhere in this codebase. An authenticated
request behaves exactly as it did before this change. `requireAdmin`-only
routes are unaffected — verify by diffing each file: only `GET` lines
should have changed in the route files. No 401 flash on page load.

---

## Phase 1 — CoachingCenter model + admin CRUD API

**Goal:** Admin can create/list/view/update/deactivate coaching centers,
each with a unique, revocable join code.

**Deviation from spec (confirmed with implementer):**
- Code length changed from 12 to 6 (admin types these to share verbally
  with students — shorter is more practical).
- Code is admin-supplied on create (`req.body.code`) with a random
  6-char fallback if left empty — NOT always server-generated. This lets
  centres use memorable codes (e.g. "besant") while maintaining a random
  fallback when the admin doesn't care.
- `updatedBy` and `codeRegeneratedAt` fields added to model (needed by
  `regenerateCenterCode` — spec mentioned them but omitted them from the
  schema block).
- Files touched also includes `server/package.json` (added `nanoid` dep).

**New files:**
- `server/models/CoachingCenter.js`
  ```
  name: String (required)
  logo: String (ImageKit URL, optional)
  address: String (optional)
  expectedStudents: Number (optional)
  code: String (required, unique, indexed) // 6-char lowercase alphanumeric
  status: String enum ['active', 'trial', 'suspended'] default 'trial'
  contactName: String (optional)
  contactEmail: String (optional)
  contactPhone: String (optional)
  createdBy: ObjectId ref User (the admin who created it)
  updatedBy: ObjectId ref User (set on update/code-regenerate)
  codeRegeneratedAt: Date (set when code is regenerated)
  { timestamps: true }
  ```
- `server/controllers/coachingCenterController.js`
  - `createCenter` — accepts `req.body.code` if provided; generates
    `customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)` as
    fallback. No special characters in generated codes.
  - `getCenters` — list, admin only, sorted by `createdAt desc`.
  - `getCenterById` — single center, admin only (no student counts —
    that's Phase 4/5, keep this endpoint cheap).
  - `updateCenter` — whitelists allowed fields (name/logo/address/
    expectedStudents/status/contact fields). Sets `updatedBy` to the
    current admin.
  - `regenerateCenterCode` — issues a new random 6-char alphanumeric code,
    sets `updatedBy` + `codeRegeneratedAt`. Old code stops working
    immediately (student gets "code not found", not "code changed").
  - `deleteCenter` — only allowed if zero linked students
    (`User.countDocuments({ coachingCenter: centerId })`); 409 otherwise
    with count of linked students.
- `server/routes/coachingCenterRoutes.js` — all routes
  `requireAuth, requireAdmin`, mounted at `/api/coaching-centers` in
  `app.js`.

**Files touched:**
- `server/app.js` (2 lines: import + `app.use`)
- `server/package.json` / `server/package-lock.json` (added `nanoid` v6)

**Acceptance criteria:**
- Creating two centres without an admin-supplied code never produces the
  same `code` (nanoid collision probability is negligible).
- `code` is never returned in any public or student-facing response in
  later phases except the one admin/coordinator screen meant to display it.
- Deleting a centre with active students (once Phase 3 adds `coachingCenter`
  to User model) is blocked with a clear 409 error.

---

## Phase 2 — Admin dashboard UI for coaching centers

**Goal:** Admin can do everything in Phase 1 from the UI.

**Deviation from spec (confirmed with implementer):**
- `AdminCoachingCenterDetail.jsx` is NOT a placeholder — it has a full edit
  form (name, code, status, contacts, address, logo) with save. The join
  code is editable in the edit form, not just via the regenerate button.
- Create modal form rewritten with Tailwind CSS for responsive 2-column
  grid (desktop) / 1-column (mobile). Logo field has an Upload button
  (file picker → ImageKit → URL).
- Modal CSS updated: `.modal` now has `max-height: 90vh; overflow-y: auto`
  on body so tall forms scroll properly. Added `.modal--wide` variant
  (`max-width: 680px`) for the coaching form. Responsive at 600px breakpoint.
- `updateCenter` controller whitelist extended to include `'code'` so the
  edit form can change the join code directly.
- Sidebar uses `Building2` icon from lucide-react for the "Centres" link.

**New files:**
- `client/src/api/coachingCenterApi.js` — 6 thin wrappers calling `apiRequest`
  (create, list, get by id, update, regenerate code, delete)
- `client/src/stores/useCoachingCenterStore.js` — Zustand store with
  fetch/create/update/regenerate/delete + loading/error state
- `client/src/pages/AdminCoachingCenters.jsx` — list view (DataTable with
  name, code, status, contacts, created date) + create modal with 3
  sections (Basic Info, Contact, Additional) using Tailwind responsive grid
- `client/src/pages/AdminCoachingCenterDetail.jsx` — detail view with join
  code card (regenerate with confirm dialog), edit-toggle form for all
  centre fields including code, logo preview. No student roster (Phase 5).

**Files touched:**
- `client/src/App.jsx` — 2 imports + 2 routes
  (`/admin/coaching-centers`, `/admin/coaching-centers/:id`) added after
  testimonial route
- `client/src/components/admin/AdminSidebar.jsx` — added `Building2` import
  + new "Coaching" section with "Centres" link
- `client/src/styles/components.css` — modal overflow/scroll fixes,
  `modal--wide` class, mobile responsive padding
- `server/controllers/coachingCenterController.js` — `'code'` added to
  `allowedFields` whitelist

**Acceptance criteria:** admin can create a center, see it in the list,
open it, edit its fields (including join code), regenerate the code with
confirmation, and the old code stops working for anything that will consume
it in Phase 3.

---

## Phase 3 — EditProfile: training center field + completion notification

**Goal:** Students can optionally link themselves to a coaching center via
its code, and get a lightweight nudge if their profile is incomplete.

**3a. Define "incomplete" first, explicitly, before writing any code.**
Required-for-complete fields (confirm this list matches what you actually
want before implementing — this is a product decision, not just a coding
one): `displayName`, `college`, `year`. Everything else — `bio`, `skills`,
`links`, `externalLinks`, and the new `coachingCenter` field — stays
optional and does **not** factor into the completeness check.

**Deviation from spec (confirmed with implementer):**
- Notification model's `questionId` and `questionTitle` were `required: true`
  — changed to `default: null` / `default: ''` since `profile_incomplete`
  notifications don't reference a question. Existing notification types
  still set these explicitly.
- Added a `POST /api/users/check-profile-completeness` endpoint (not in
  spec) so the frontend can trigger the completeness check + notification
  creation/resolution on profile load. The spec said to check "on login/
  profile load" but provided no server-side endpoint to call.
- `getUserByUsername` now does `.populate('coachingCenter', 'name')` so
  the frontend can display the linked centre's name.
- "Verify" button calls `link-coaching-center` immediately (which both
  verifies AND links), rather than doing a separate pre-verify step. This
  is because `link-coaching-center` is the only write path — there's no
  separate "verify-only" endpoint.
- `getNotifications` controller auto-creates a `profile_incomplete`
  notification on every inbox fetch when the user's profile is incomplete.
  Required because Clerk webhook (`user.created`) doesn't fire on localhost,
  so sign-up alone never triggered the notification.
- Clicking the `profile_incomplete` notification navigates to
  `/settings/profile` (EditProfile), not `/qa/null`.
- `questionDeleted` check in notification controller now guards against
  null `questionId` — was falsely marking `profile_incomplete` as deleted
  since that notification type has no `questionId`.
- Replaced `AlertTriangleIcon` with `AlertCircleIcon` in InboxList.jsx
  (hugeicons-react doesn't export `AlertTriangleIcon`).

**Model change — `server/models/User.js` (additive fields only):**
```
coachingCenter: { type: ObjectId, ref: 'CoachingCenter', default: null }
coachingCenterJoinedAt: { type: Date, default: null }
```
Do not remove or rename any existing field on this schema.

**Model change — `server/models/Notification.js` (additive):**
- Added `'profile_incomplete'` to the `type` enum.
- Changed `questionId` from `required: true` to `default: null`.
- Changed `questionTitle` from `required: true` to `default: ''`.

**New endpoints:**
- `POST /api/users/link-coaching-center` — body: `{ code }`. Rate-limited
  (in-memory, 10/hr per user). Looks up
  `CoachingCenter.findOne({ code, status: { $ne: 'suspended' } })`; if
  found, sets `coachingCenter` + `coachingCenterJoinedAt` on the
  authenticated user's own document. If not found, `404`. This is the
  **only** write path for this field.
- `POST /api/users/check-profile-completeness` — reads user by clerkId,
  calls `checkAndNotifyProfileIncomplete(user._id)`, returns
  `{ data: { isComplete } }`. Called on profile load to sync the
  notification bell.

**Notification on incomplete profile:**
- On profile load (EditProfile.jsx mount), calls
  `POST /api/users/check-profile-completeness`. If `displayName`/`college`/
  `year` are missing, creates an unread `profile_incomplete` notification
  (or leaves existing one). On profile save (`updateProfile`), the backend
  auto-calls `checkAndNotifyProfileIncomplete()` — if all three are now
  filled, marks any unread `profile_incomplete` as read.

**Files touched:**
- `server/models/User.js` — 2 additive fields
- `server/models/Notification.js` — enum + required→default changes
- `server/controllers/userController.js` — added `linkCoachingCenter`,
  `checkAndNotifyProfileIncomplete`, `checkProfileCompleteness`; updated
  `updateProfile` to fire completeness check; updated `getUserByUsername`
  to populate coachingCenter
- `server/routes/userRoutes.js` — 2 new routes (both before `:username`)
- `client/src/pages/EditProfile.jsx` — added coaching centre section with
  code input + "Verify" button (immediately links the user), shows linked
  centre badge if already connected, calls completeness check on mount
- `server/controllers/notificationController.js` — auto-create
  `profile_incomplete` notification on inbox fetch, fixed `questionDeleted`
  false positive for null questionId
- `client/src/components/messages/InboxList.jsx` — added
  `profile_incomplete` notification type to `NOTIF_CONFIG`; notification
  links to `/settings/profile` instead of `/qa/null`; system-notif guard
  on "Question deleted" label; replaced `AlertTriangleIcon` →
  `AlertCircleIcon`

**Acceptance criteria:** entering a valid code links the account and shows
the centre name; an invalid code shows an inline error; leaving it blank
works fine; an incomplete profile (missing displayName/college/year)
creates a notification visible in the bell; filling all three on save
auto-resolves it.

---

## Phase 4 — Shared center roster & stats service

**Goal:** One function, two authorized callers (admin in Phase 5,
coordinator in Phase 8). Build this before either UI.

**New file:** `server/services/centerRosterService.js`
```js
export async function getCenterRoster(centerId) {
  // returns { center, students: [...], totalStudents }
  // students = User.find({ coachingCenter: centerId }) with the fields
  // needed for identity + a placeholder for stats (Phase 6 will extend
  // this to attach real progress numbers — don't stub fake numbers now,
  // just return the student list and wire stats in once Phase 6 exists)
}
```
This file has **no** Express req/res in it — it's pure data access, called
by two different controllers with two different authorization checks
around it. That separation is the point: authorization lives in the
controller/route layer, not in this service.

**Files touched:** none besides the new service file.

**Actual build:**
- `server/services/centerRosterService.js` — exports `getCenterRoster(centerId)`,
  returns `{ center, students, totalStudents }`. Throws with `statusCode: 404`
  if center not found. Pure data access — no Express req/res. Students sorted
  by `coachingCenterJoinedAt` descending.

---

## Phase 5 — Admin per-center detail view (roster, stats, CRUD)

**Goal:** Clicking a center in the admin list shows its students with
identity + stats, and admin can edit/remove a student's center link "in
case of emergencies."

**New endpoints** (`server/controllers/coachingCenterController.js`,
extend, don't rewrite):
- `GET /api/coaching-centers/:id/students` — `requireAuth, requireAdmin` →
  calls `getCenterRoster(id)` from Phase 4.
- `PATCH /api/coaching-centers/:id/students/:userId` — admin-only,
  currently used only for the emergency case of removing a student's
  center link (`coachingCenter: null`) or correcting a mislink — do not
  build general profile-editing here, that's `updateProfile` in
  `userController.js` already and is out of scope.

**UI:** fill in `AdminCoachingCenterDetail.jsx` from Phase 2 — table of
students (name, join date, and once Phase 6 lands, completion %), with a
"remove from center" action per row, confirm-dialog gated.

**Acceptance criteria:** an admin can see exactly which students are
linked to a given center and unlink a wrongly-tagged one without touching
any other field on that user's profile.

**Actual build:**
- `server/controllers/coachingCenterController.js` — added `getCenterStudents`
  (calls `getCenterRoster` from Phase 4, wraps in Express error handling),
  `getCenterStudentById` (single student with full profile within a center),
  `updateCenterStudent` (whitelist: displayName, email, college, year), and
  `removeStudentFromCenter` (validates student is linked to this center before
  nullifying `coachingCenter` + `coachingCenterJoinedAt`). Imported
  `getCenterRoster` from the new service.
- `server/routes/coachingCenterRoutes.js` — added `GET /:id/students`,
  `GET /:id/students/:userId`, `PUT /:id/students/:userId`,
  `PATCH /:id/students/:userId`
- `client/src/api/coachingCenterApi.js` — added `fetchCenterStudents`,
  `fetchCenterStudentById`, `updateCenterStudent`, `removeStudentFromCenter`
- `client/src/stores/useCoachingCenterStore.js` — added `students` array,
  `currentStudent`, `studentsLoading`, `studentLoading` flags, and actions:
  `fetchCenterStudents`, `fetchCenterStudentById`, `updateCenterStudent`,
  `removeStudentFromCenter`
- `client/src/pages/AdminCoachingCenterDetail.jsx` — student roster table
  with clickable rows (navigate to student detail page), remove button
  per row with confirm modal
- `client/src/pages/AdminCoachingCenterStudentDetail.jsx` — full student
  profile detail page: avatar + name/username header, profile details grid
  (view/edit toggle), external links, skills, danger zone with remove button.
  Edit form saves via `PUT /:id/students/:userId`. Remove redirects back to
  center detail.
- `client/src/App.jsx` — added import and route for
  `/admin/coaching-centers/:centerId/students/:userId`

---

## Phase 6 — Student progress tracking + dashboard-ified profile

**Goal:** Track completion of lessons/subtopics/problems per subject
(DSA/DBMS/OS separately, per rule 6 above), surfaced on a new dashboard
version of the profile page.

**New model:** `server/models/Progress.js`
```js
{
  user: ObjectId ref User (required, indexed),
  subject: String enum ['dsa', 'dbms', 'os'] (required),
  targetType: String enum ['lesson', 'subtopic', 'problem'] (required),
  targetSlug: String (required),
  completedAt: { type: Date, default: Date.now }
}
// compound unique index: { user, subject, targetType, targetSlug }
```
One document per (user, item) marks that item done. Do **not** add a
`completed: Boolean` field on the content models themselves (`Problem`,
`Subtopic`, etc.) — those are shared across all users, per-user completion
must live in its own collection, exactly like `Bookmark` already does it
for bookmarks.

**New endpoints:**
- `POST /api/progress` — body `{ subject, targetType, targetSlug }`,
  `requireAuth`, marks complete for `req.userId`'s own User doc only.
- `GET /api/progress/summary` — `requireAuth`, returns, per subject, counts
  completed vs total (`totalLessons` = live `countDocuments()` against
  `DsaLesson`/`DbmsLesson`/`OsLesson` per rule 5 and rule 6 — do not persist
  these totals anywhere).

**UI:** convert `client/src/pages/UserProfile.jsx` (or wherever "view
profile" currently renders for the logged-in user — check whether it's the
same component as the public profile view or a separate one; if it's
shared, branch a dashboard-mode view for `isOwnProfile` rather than forking
the whole file) into a dashboard showing per-subject progress bars
(completed/total for lessons, subtopics, problems, each subject separate).

**Acceptance criteria:** completing a problem updates the dashboard number
without a page reload requiring a hard refresh (use the existing Zustand
store pattern), and the totals shown update automatically when an admin
adds a new lesson — because they're computed live, not because anything
triggers a resync.

### Phase 6 Post — Hero Section CRUD + Loading Screen

**Goal:** Homepage hero section was hardcoded with no admin edit capability. Added full CRUD via SiteConfig, a video upload option, and a full-page loader until data is ready.

**Changes:**
- `server/models/SiteConfig.js` — added `homepageHero` subdocument (title, subtitle, ctaPrimary, ctaPrimaryLink, ctaSecondary, ctaSecondaryLink, videoUrl)
- `server/controllers/siteConfigController.js` — added `updateHeroSection()`; included `homepageHero` in `getPublicConfig` response; auto-seeds defaults for legacy documents; accepts `homepageHero` in `updateConfig`
- `server/routes/siteConfigRoutes.js` — added `PUT /hero-section` (admin-only)
- `client/src/pages/AdminHeroSection.jsx` — **new.** Full admin form with title, subtitle, 2 CTA buttons + links, video URL text input + file upload to ImageKit, live preview
- `client/src/pages/Home.jsx` — hero reads from `siteConfig.homepageHero` with hardcoded fallback; added full-page `<Loader>` shown until both `/site-config/public` and `/topics` resolve
- `client/src/App.jsx` — import + route for `/admin/hero-section`
- `client/src/components/admin/AdminSidebar.jsx` — "Hero Section" link under Settings (Airplay icon)
- `client/src/styles/global.css` — added `.success-text` class

---

**Also in this phase — do not skip:** extend `getCenterRoster()` from
Phase 4 so each student in the returned list includes their per-subject
completion summary (reuse the same aggregation `GET /api/progress/summary`
uses, don't duplicate the query logic — factor it into a shared helper
both call). Without this, Phase 5's admin view and Phase 8's coordinator
view have no stats to show, only names — which defeats the point of
either.

**Actual build:**
- `server/models/Progress.js` — new model with compound unique index
  `{ user, subject, targetType, targetSlug }`.
- `server/services/progressService.js` — shared service with:
  - `getSubjectTotals(subject)` — live `countDocuments()` on the 3 content
    models per subject (DsaLesson/Subtopic/Problem, DbmsLesson/DbmsSubtopic/
    DbmsProblem, OsLesson/OsSubtopic/OsProblem).
  - `getCompletedCounts(userId, subject)` — aggregate pipeline grouping
    Progress docs by targetType for one user + subject.
  - `getProgressSummary(userId)` — combines totals + completed into per-subject
    shape `{ dsa: { lessons: { completed, total }, subtopics: {...}, problems: {...}, overall: { completed, total } }, dbms, os }`.
  - `getProgressSummariesForUsers(userIds)` — batch version returning
    `Map<userId, summary>`, used by centerRosterService to avoid N+1.
- `server/controllers/progressController.js` — `markComplete` (POST, upsert,
  idempotent) and `getSummary` (GET, delegates to shared service).
- `server/routes/progressRoutes.js` — 2 requireAuth routes.
- `server/app.js` — imported + mounted at `/api/progress`.
- `server/services/centerRosterService.js` — extended to import
  `getProgressSummariesForUsers` and attach `progress` field to each student
  in the returned roster.
- `client/src/api/progressApi.js` — `markComplete` and `fetchProgressSummary`.
- `client/src/stores/useProgressStore.js` — Zustand store with
  `fetchSummary` + `markComplete` (auto-refreshes summary after marking).
- `client/src/pages/UserProfile.jsx` — added "My Progress" dashboard section
  (only on own profile, gated by `isOwnProfile`). Shows 3 subject cards in a
  responsive grid, each with overall completed/total count, progress bar,
  and breakdown by lessons/subtopics/problems.
- `client/src/pages/DsaDetail.jsx`, `DbmsDetail.jsx`, `OsDetail.jsx` — "Mark Complete"
  button for problems (targetType `'problem'`). Fetches `GET /check-completed`
  on mount to show already-completed state, idempotent POST on click with local
  state update, disabled while completing.
- `client/src/pages/DsaLesson.jsx`, `DbmsLesson.jsx`, `OsLesson.jsx` — "Mark Complete"
  banner for lessons (targetType `'lesson'`). Inserted between hero section and
  subtopic cards. Same check-completed + idempotent POST pattern.
- `client/src/pages/DsaSubtopic.jsx`, `DbmsSubtopic.jsx`, `OsSubtopic.jsx` — "Mark
  Complete" button for subtopics (targetType `'subtopic'`). Placed in the sidebar
  below the "Solve Problems" CTA. Same check-completed + idempotent POST pattern.
- `server/controllers/progressController.js` — added `getAdminUserSummary` handler
  (`GET /api/progress/admin/:userId/summary`, admin-only).
- `server/routes/progressRoutes.js` — added admin summary route with
  `requireAuth` + `requireAdmin`.
- `client/src/api/progressApi.js` — added `fetchAdminUserSummary(userId)`.
- `client/src/pages/AdminCoachingCenterStudentDetail.jsx` — added "Progress
  Dashboard" section after Skills, displaying per-subject cards (DSA/DBMS/OS)
  with overall count, progress bar, and breakdown by lessons/subtopics/problems.
  Fetched via `fetchAdminUserSummary` on mount.
- Bug fixes:
  - `/sign-up/verify-email-address` 404: replaced 4 exact Clerk auth routes with
    2 wildcard paths (`/sign-in/*`, `/sign-up/*`).
  - `isOwnProfile` in UserProfile.jsx: was comparing `clerkUser?.username ===
    username` but Clerk username can be null. Changed to `clerkUser?.id &&
    currentProfile?.clerkId === clerkUser.id`.
  - `profile_incomplete` notification never created on sign-up (Clerk webhook
    doesn't fire on localhost). Added auto-create in `getNotifications` controller
    on every inbox fetch when profile is incomplete.
  - "Question deleted" false positive: backend now checks truthiness of
    `questionId` on system notifications; frontend guards with `!isSystemNotif`.

---

## Phase 7 — MCQ system

**Goal:** Admin attaches an optional MCQ to specific problems; students
answer once it's reached; answers are recorded and roll into progress
stats. This is a genuinely separate, larger feature — budget real time for
it, do not compress it into Phase 6.

**New models:**
- `server/models/Quiz.js` — problemId, problemModel, questions (text, options 2–6, correctIndex)
- `server/models/QuizAttempt.js` — user, quiz, answers, score (server-computed), attemptedAt
  Single-shot: unique compound index `{ user, quiz }`.

**New backend files:**
- `server/controllers/quizController.js` — `createQuiz`, `updateQuiz`, `deleteQuiz` (admin-only),
  `getQuizByProblem` (auth, strips correctIndex), `submitAttempt` (auth, single-shot, scores server-side)
- `server/routes/quizRoutes.js` — all routes at `/api/quizzes`, admin routes with `requireAuth, requireAdmin`
- `server/app.js` — import + mount

**Backend service extension:**
- `server/services/progressService.js` — added `getQuizStats(userId)` aggregating QuizAttempts joined with
  Quiz (via problemModel → subject mapping); extended `getProgressSummary` to include `quizzes: { taken, avgScore }`
  in each subject block.

**New frontend files:**
- `client/src/api/quizApi.js` — `fetchQuizByProblem`, `submitQuizAttempt`, `createQuiz`, `updateQuiz`, `deleteQuiz`
- `client/src/components/quiz/QuizEmbed.jsx` — Student-facing quiz component: fetches quiz on mount, shows
  radio-button MCQ form, single-shot submit, shows results (score + per-question correct/wrong) after submission.
  Renders nothing if no quiz exists for the problem.
- `client/src/components/quiz/QuizEditor.jsx` — Admin collapsible quiz authoring section: add/remove questions,
  2–6 options per question, mark correct answer via radio, create/update/delete with validation.

**Frontend pages touched:**
- `client/src/pages/DsaDetail.jsx` — added `<QuizEmbed problemModel="Problem" ... />` after ProblemView
- `client/src/pages/DbmsDetail.jsx` — same, `problemModel="DbmsProblem"`
- `client/src/pages/OsDetail.jsx` — same, `problemModel="OsProblem"`
- `client/src/pages/AdminDsaProblemEdit.jsx` — added `<QuizEditor problemModel="Problem" />` before submit button
- `client/src/pages/AdminDbmsProblemEdit.jsx` — same, `problemModel="DbmsProblem"`
- `client/src/pages/AdminOsProblemEdit.jsx` — same, `problemModel="OsProblem"`

**Acceptance criteria:** a student cannot see correct answers before
submitting; submitting twice on a single-shot quiz is rejected with a clear
"already attempted" response, not a silent overwrite; quiz scores show up
in the Phase 6 dashboard as part of the subject's stats.

---

## Phase 8 — Coordinator role + dashboard

**Goal:** A coordinator (identified by `publicMetadata.role === 'coordinator'`
in Clerk, promoted manually by admin outside the app for now — no
self-serve coordinator signup in this phase) sees only their own center's
roster and stats, reusing Phase 4/6/7.

**Model change — `server/models/User.js` (additive):**
```
coordinatorFor: { type: ObjectId, ref: 'CoachingCenter', default: null }
```

**New middleware:** `server/middleware/coordinatorOnly.js`, modeled
directly on `adminOnly.js` — checks
`user.publicMetadata?.role === 'coordinator'` via Clerk, then loads the
User doc and requires `coordinatorFor` to be set. Do not merge this into
`adminOnly.js`; keep it a separate file/export
(`requireCoordinator`) so admin and coordinator authorization can never be
accidentally conflated in a route definition.

**New endpoints** (new `coordinatorController.js`/`coordinatorRoutes.js`,
mounted at `/api/coordinator`):
- `GET /api/coordinator/students` — `requireAuth, requireCoordinator` →
  reads `req.coordinatorCenterId` (set by the middleware from the user's
  own `coordinatorFor`, **never** from a request param or query string) →
  calls the same `getCenterRoster()` from Phase 4.
- `GET /api/coordinator/stats` — same scoping, aggregates the Phase 6/7
  numbers for that center only.
- `PATCH /api/coordinator/students/:userId/remove` — `requireAuth,
  requireCoordinator`, only allowed to unlink a student from
  `req.coordinatorCenterId` specifically (verify the target user's
  `coachingCenter` actually equals the coordinator's own center before
  unlinking — otherwise a coordinator could unlink a student from a
  *different* center by guessing a userId, which is exactly the class of
  bug rule 4 exists to prevent). This mirrors the admin "remove from
  center" action in Phase 5 — a leaked join code will most likely surface
  as a stranger in a coordinator's own roster, and the coordinator is who
  needs the ability to fix it, not just admin.

This is the rule-4 checkpoint: if you find yourself writing
`req.params.centerId` anywhere in this controller, stop — a coordinator
must never be able to pass in a center id, only ever operate on their own.

**UI:** `client/src/pages/CoordinatorDashboard.jsx` + a `CoordinatorRoute`
guard component in `App.jsx` mirroring `AdminRoute`/`ProtectedRoute`
exactly, checking `publicMetadata.role === 'coordinator'`.

**Acceptance criteria:** two coordinators from two different centers,
tested side by side, can never see each other's students under any
request, including a manually crafted API call with a different id.

### Phase 8 Post — Coordinator dashboard overhaul + sidebar redesign

**Goal:** After initial coordinator role implementation, the dashboard and
sidebar were iteratively improved based on real usage feedback.

**1. Sidebar redesign (`CoordinatorSidebar.jsx`):**
- Removed "Coordinator Panel" text from brand area (user requested no
  "coordinator" label at top)
- Added status indicator dot (Circle icon with green/amber/red fill) next
  to center name based on centre status
- Added thick black divider lines between navigation sections (2px, 15%)
- Brand area shows center logo (or Building2 fallback) with brutalist
  3px border + 3px shadow
- Three navigation sections: Overview (Dashboard), Students (All
  Students), Centre (Centre Profile) — all expanded by default
- Centre info block wrapped in 3px border box with shadow (address, phone,
  email)
- Coordinator profile block at bottom with 3px border + 3px shadow +
  hover effect (moves -1px -1px, shadow increases, background tints)
- Profile block links to `/coordinator/profile`

**2. New pages:**
- `CoordinatorStudentsList.jsx` — dedicated student roster page with NO
  charts. Pure table with search, sortable columns (name/college/joined/
  progress), per-subject mini progress bars, View links to student detail.
- `CoordinatorProfile.jsx` — full centre profile page showing center logo,
  name, join code with copy-to-clipboard button, status badge, address,
  contact person, email, phone, expected students, created/updated dates.
  Also shows coordinator's own Clerk profile (avatar, name, email, role
  badge with Shield icon).

**3. Dashboard overhaul (`CoordinatorDashboard.jsx`):**
- Every chart now has a detailed explanatory panel with:
  - "What this shows" — plain-language purpose description
  - "How to read it" — colour legend, interactive instructions, what
    to look for
  - "Why it matters" — actionable advice for a coordinator
- Brutalist styling cranked up: borders 3px→4px, shadows 4px 4px→8px 8px
- Chart bars got stroke="#000" strokeWidth={1} for extra boldness
- Donut chart innerRadius increased (58→90), strokeWidth={2}
- Progress bars now have `tip` text below each ("Main chapters read",
  "Subsections studied", "Practice problems solved")
- Full student roster replaced with compact "Recently Joined" table
  (8 students max) + "View All Students" link to dedicated roster page
- Empty states show Lightbulb icon + helpful suggestion message
- Distributions got "desc" field per bracket for richer tooltips

**4. Student detail enhancement (`CoordinatorStudentDetail.jsx`):**
- Added `generateProgressStatements()` — comprehensive analysis function
  that generates per-category statements based on actual numbers:
  - Lessons completed/total with contextual note
  - Subtopics completed/total with contextual note
  - Problems completed/total with contextual note
  - Quiz attempts with weighted average score and assessment
  - Per-subject detailed breakdown (DSA/DBMS/OS) with quiz averages
- Each statement has a contextual lucide icon, colour based on performance
  tier (green/amber/red via CSS vars), and descriptive tier-based text
- Statements render in a new "Progress Analysis" section below the
  feedback banner with brutalist-styled statement cards
- Added `ClipboardList` lucide icon import

**5. Theme compatibility:**
- Dashboard: replaced all hardcoded semantic colours with CSS variables
  (`#059669`→`var(--success)`, `#dc2626`→`var(--error)`,
  `#d97706`→`var(--warning)`, `#d4d4d4`→`var(--text-tertiary)`,
  `#e5e7eb`→`var(--bg-tertiary)`, `#fef2f2`→`var(--error-bg)`,
  status badge backgrounds to `var(--success-bg)`/`var(--warning-bg)`/
  `var(--error-bg)`, `#fff` to `var(--text-inverse)`)
- Student detail: same treatment for all hardcoded colours in feedback
  banners, progress bars, error/success backgrounds
- Brand colours kept as-is for consistency: `#6366f1` (DSA), `#14b8a6`
  (DBMS), `#f59e0b` (OS), `#000` borders (brutalist styling)

**6. Routes updated (`App.jsx`):**
- `/coordinator/students` → renders `<CoordinatorStudentsList>` (no longer
  redirects to dashboard)
- `/coordinator/profile` → renders `<CoordinatorProfile>`
- Both wrapped in CoordinatorRoute + CoordinatorLayout

**New files (Phase 8 Post):**
- `client/src/pages/CoordinatorStudentsList.jsx`
- `client/src/pages/CoordinatorProfile.jsx`

**Rewritten files:**
- `client/src/components/coordinator/CoordinatorSidebar.jsx`
- `client/src/pages/CoordinatorDashboard.jsx`
- `client/src/pages/CoordinatorStudentDetail.jsx`

**Touched files:**
- `client/src/App.jsx` — 3 new imports + 2 new routes + 1 redirect removed

---

## Phase 9 — CSV export + rule-based status

**Goal:** Students export their own stats; coordinators export their
center's roster + stats; a simple non-detailed status string shows per
student.

**New endpoints:**
- `GET /api/progress/export` — `requireAuth`, CSV of the caller's own
  Phase 6/7 stats only.
- `GET /api/coordinator/export` — `requireAuth, requireCoordinator`, CSV of
  the coordinator's own center roster + stats (same scoping rule as Phase
  8 — no id in the URL/query).
- Both use `json2csv` server-side; stream the file, don't build the whole
  CSV string in memory if the roster could realistically exceed a few
  hundred rows.

**Status derivation** (add to the Phase 6 summary response, not a new
endpoint): a small pure function, e.g.
```js
function deriveStatus({ completionPct, quizAvgPct }) {
  if (completionPct < 30) return 'Explore more lessons';
  if (quizAvgPct !== null && quizAvgPct < 50) return 'Solve more problems';
  return 'On track';
}
```
Keep the thresholds as named constants at the top of the file so they're
easy to tune later without touching logic. This is intentionally simple —
do not add machine learning, weighting, or configurability in this phase.

**Acceptance criteria:** a coordinator's exported CSV never contains a row
for a student outside their center, verified by the same two-coordinator
test from Phase 8.

---

## Phase 10 — Frontend `pages/` folder reorganization

**Goal:** `client/src/pages/` currently holds ~75 files flat (plus whatever
Phases 2, 5, 7, and 8 added on top of that). Split it into subfolders and
fix every import that breaks as a result. Do this only after Phase 9 is
fully working — do not start this phase early and do not run it
concurrently with any other phase.

**Before touching a single file:** list every file currently in
`client/src/pages/` and group them into subfolders by the same domain
lines already visible in the filenames — e.g. `pages/admin/` for every
`Admin*.jsx` file (including the ones added in Phases 2, 5, and 8:
`AdminCoachingCenters.jsx`, `AdminCoachingCenterDetail.jsx`), `pages/dsa/`,
`pages/dbms/`, `pages/os/` for the respective `Dsa*`/`Dbms*`/`Os*` pages,
`pages/auth/` for `SignIn.jsx`/`SignUp.jsx`, `pages/qa/` for
`AskQuestion.jsx`/`QaDetail.jsx`/`QaList.jsx`, and a `pages/` root for
anything that doesn't cleanly fit a group (`Home.jsx`, `About.jsx`,
`NotFound.jsx`, `UserProfile.jsx`, `EditProfile.jsx`, `CoordinatorDashboard.jsx`
if it doesn't fit `admin/`). Write out the full proposed mapping (old path →
new path) as a first step and do not move anything until that full list is
written — moving files one at a time while also editing imports
incrementally is how this kind of change goes wrong.

**Process, in order:**
1. Write the full old-path → new-path mapping (as above).
2. Move every file to its new location (`git mv`, to preserve history —
   don't delete-and-recreate).
3. Update every import of a moved file across the codebase — primarily
   `client/src/App.jsx`'s route imports, but grep the whole `client/src`
   tree for any other cross-page import before assuming App.jsx is the
   only place.
4. Fix relative import paths *inside* each moved file too — a file that
   moved from `pages/Foo.jsx` to `pages/admin/Foo.jsx` now needs
   `../../stores/...` where it used to need `../stores/...`, for every
   relative import in that file, not just the ones that were already
   broken by the move.
5. Do not touch component logic, JSX, or behavior in any moved file —
   this phase changes file locations and import paths only. If a diff for
   a moved file shows anything besides its import lines changing, that's a
   mistake — revert the extra change.

**Acceptance criteria:** the app builds with zero import errors, every
route in `App.jsx` still resolves to the correct page, and manually
clicking through every top-level nav link and every admin sidebar link
loads the expected page with no console errors. Do this check page by
page — do not consider Phase 10 done from a successful `npm run build`
alone; a build can succeed with a route pointing at the wrong file if the
import still resolves to *something*.

---

## When you're done with all 11 phases (0 through 10)

Produce a short summary (not a new doc, just a message) listing:
- every new file created, grouped by phase
- every existing file touched and the exact lines changed in each
- any place you deviated from this spec and why

Do not mark this work "complete" if Phase 8's cross-tenant isolation test
(two coordinators, two centers) hasn't been manually verified — that check
is the one failure mode in this entire feature set that would actually leak
one paying customer's student data to another. Do not mark Phase 10
"complete" from a successful build alone — walk every route by hand per its
acceptance criteria.