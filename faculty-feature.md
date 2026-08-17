# Faculty Feature — Batch-Level Teaching Staff

> A new stakeholder role: **Faculty** — a teaching assistant scoped to specific batches. They create plans and assignments for the batches they're assigned to, view dashboards and individual performances, and export CSV — everything a coordinator can do *within their batches*. They **cannot** assign/remove students, and they have **no visibility or power outside their assigned batches**.

---

## Non-Negotiable Constraint

> **ZERO changes to existing admin and coordinator functionality.** The faculty feature is purely additive:
> - Existing endpoints, middleware, pages, guards, and flows are NOT modified (only extended with new additive inputs).
> - The only shared-code touches are additive (verified against source 8/2026): new `User` fields, one `$pull` line in `deleteBatch` (clean `facultyBatches`), three field-clearing lines in `removeStudentFromCenter` (unlink must also un-faculty). Everything else — including `accessControl.js` — is **confirmed untouched-safe** (see §2).
> - No refactors of coordinator/admin code, no renames, no behavior changes.

---

## Stakeholders & Access Matrix

| Capability                          | Coordinator         | Faculty             | Admin            |
|-------------------------------------|---------------------|---------------------|------------------|
| Create batches                      | ✅                  | ❌                  | ✅               |
| Assign / remove students to batches | ✅                  | ❌                  | ✅ (override)     |
| Create plans                        | ✅                  | ✅ (own batches)     | ✅               |
| Create assignments + grade          | ✅                  | ✅ (own batches)     | ✅               |
| View dashboard / stats              | ✅ (center)          | ✅ (own batches)     | ✅ (global)      |
| View individual performances        | ✅ (center)          | ✅ (own batches)     | ✅ (global)      |
| CSV export                          | ✅ (center)          | ✅ (own batches)     | ✅ (global)      |
| Promote student → faculty           | ✅ (own center)      | ❌                  | ✅ (override)     |
| Assign faculty to batches           | ✅ (own center)      | ❌                  | ✅ (override)     |
| Payment / revenue stats             | ❌                  | ❌                  | ✅               |

**Empty state rule:** a faculty member assigned to no batches can still log in, but every dashboard/stat/roster endpoint returns empty data — no 403, no dead end.

**Single-center rule:** a faculty member's assigned batches must all belong to one coaching center. Validated server-side on every assignment.

---

## Current State (baseline research, 8/2026)

- Roles today: `user`, `admin`, `coordinator` — stored in **Clerk `publicMetadata.role`** (authoritative) + Mongo `User.role` (`server/models/User.js:36`).
- The Clerk webhook whitelist (`server/controllers/userController.js:63`) resets unknown Clerk roles to `user`. **Consequence for this feature:** faculty is NEVER a Clerk role — it lives purely in Mongo (`isFaculty` + `facultyBatches`), so the webhook cannot touch it.
- **No runtime endpoint writes Clerk `publicMetadata` today.** Role changes are manual (Clerk Dashboard) or one-off scripts (`server/scripts/syncAdminRoles.js`). Admin's `PUT /api/admin/users/:id` (`adminController.js:260-296`) only sets Mongo `coordinatorFor` — the client helper text literally says "set role in Clerk dashboard manually".
- Coordinator scoping pattern (the template to clone): `server/middleware/coordinatorOnly.js` — Clerk role check → Mongo `coordinatorFor` → center-suspended check → inject `req.coordinatorCenterId`. Every handler trusts only the injected scope, never URL params.
- Students link to a batch via a **single** `User.batch` ObjectId — faculty needs a new **array** field (`facultyBatches`).
- Plans = center-level day-by-day templates (`server/models/Plan.js`); `BatchPlan` = plan + batch + startDate, one active per batch (`server/models/BatchPlan.js`).
- Assignments are batch-linked (`server/models/Assignment.js` — `batch` + `coachingCenter` + `createdBy`) with coordinator CRUD + grading (`server/controllers/assignmentController.js`, routes under `/api/coordinator/assignments`).
- Dashboards: `CoordinatorDashboard.jsx` (center-scoped stats + client-side CSV), `AdminDashboard.jsx` (global). CSV export exists at 3 levels today (admin global, coordinator center, student self) — all client-side blob builders with BOM for Excel.
- Client route guards: `AdminRoute` / `CoordinatorRoute` in `client/src/App.jsx:177-191`, purely `publicMetadata.role`-based.

---

## Design

### 1. Data model

**`User` (`server/models/User.js`):**
```js
// FACULTY STATUS IS MONGO-ONLY — Clerk never knows about it.
isFaculty: { type: Boolean, default: false },
facultyBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: [] }]
```

- `role` stays **fully owned by Clerk** (as today: `user` / `admin` / `coordinator` set via Clerk dashboard). The `User.role` enum is **NOT extended** — a faculty member is still `role: 'user'` in Clerk's eyes.
- A faculty member is a **regular student of the center who also teaches batches**: `coachingCenter`, `batch` (their own student batch), progress, and submissions all remain intact. `facultyBatches` is strictly additive.
- No changes to `Batch`, `Plan`, `Assignment` — faculty reuses existing models.

### 2. Role plumbing — only ONE source of truth change

Because faculty status never enters Clerk, the webhook and role-sync code are **untouched** — nothing can degrade the role.

| File | Change |
|---|---|
| `server/models/User.js` | add `isFaculty: Boolean` + `facultyBatches: [ObjectId]` |
| `server/controllers/coordinatorController.js` | promote/revoke/batch-assign handlers (Mongo-only) |
| `server/controllers/adminController.js` | center-scoped faculty handlers (Mongo-only) |
| `server/routes/coachingCenterRoutes.js` | register the admin faculty endpoints here (lines 14-26 pattern: `requireAuth, requireAdmin`) — this file owns all `/api/coaching-centers/:id/*` routes; `adminRoutes.js` has none |
| `server/controllers/batchController.js` | `deleteBatch` (line 134): +1 `$pull` of the batch id from all `facultyBatches` arrays (it already unlinks `User.batch`, line 140) |
| `server/controllers/coachingCenterController.js` | `removeStudentFromCenter` (line 271): also clear `isFaculty: false` + `facultyBatches: []` — an unlinked student can't be faculty (it already clears `batch`/`courseOffering`, line 286-287) |
| `server/services/centerRosterService.js` | add `isFaculty` to the `.select()` field lists at lines 36 (`getCenterRoster`) + 86 (`getBatchRoster`) — **verified: both rosters are field-filtered**, so without this the Teacher badge (admin center page) and Promote-button state (coordinator students list) can't render. One-word additive change; detail endpoints already include it via exclusion-style selects (`getStudentById` `-password -__v` line 128, `getCenterStudentById` `-followers -following` line 213) |
| `server/controllers/userController.js` | **NO change** — verified: webhook uses `findOneAndUpdate` with a fixed field list (line 65-76), `getUserByUsername` self-heal + `hasAdminAccess` self-heal are targeted field writes, all `save()` calls persist only modified paths → `isFaculty`/`facultyBatches` survive every existing flow |
| `server/utils/accessControl.js` | **NO change needed** — faculty are center-enrolled students, so `canAccessSubject` already returns true via the `user.coachingCenter` check (line 110); the staff OR-check is unnecessary |
| `server/controllers/adminController.js` `updateUser` | **NO change** — field-targeted assignments + `save()` (line 260-296); editing a faculty member's `coordinatorFor`/profile cannot wipe `isFaculty` |
| `client/src/App.jsx` | new `FacultyRoute` guard + **AuthSync additive line** (see below — verified: AuthSync only mirrors `_id`/`avatar`/`displayName`/`coachingCenter`/`batch`, lines 219-236) |

**AuthSync verified gap (App.jsx:193-251):** `AuthSync` copies the server profile into `useAuthStore` **selectively** — `isFaculty` is NOT mirrored today. Add one line next to line 235: `if (json.data.isFaculty) serverUpdates.isFaculty = json.data.isFaculty;` (plus `facultyBatches` if the faculty UI needs batch ids in the store). Without this, `FacultyRoute` has nothing to read.

### 3. Promotion & batch assignment — Mongo-only, no Clerk calls

**Coordinator (primary flow):**
- `POST /api/coordinator/students/:userId/promote` — student must belong to the coordinator's center and be a regular student. Sets `isFaculty: true`, `facultyBatches: []`. **No `clerk.users.updateUser` call** — coordinators never touch Clerk.
- `POST /api/coordinator/students/:userId/revoke-faculty` — **removal restores a regular student**: clears `isFaculty` + `facultyBatches` only. `coachingCenter`, their own `batch`, progress, and submissions are untouched. (Named `revoke-faculty` so it reads clearly vs removing a student from the center.)
- `GET /api/coordinator/faculties` — list faculty of own center (with assigned batches populated).
- `PUT /api/coordinator/faculties/:userId/batches` — body `{ batchIds: [] }`. Validates: every batch belongs to the coordinator's center, all batches share one center, target is `isFaculty` and belongs to the center. `facultyBatches = batchIds`.

**Admin (override — same philosophy as admin assign/remove student, but surfaced INSIDE the center page):**
- Center-scoped admin endpoints (handlers in `adminController.js`, registered in `coachingCenterRoutes.js` with `requireAuth, requireAdmin` — matches the existing center-page route pattern at lines 14-26; `adminRoutes.js` is untouched). **Mongo-only** — no Clerk writes. Admin's Clerk access remains what it is today (coordinator roles are still managed in the Clerk dashboard); faculty status is simply not a Clerk concern:
  - `GET /api/coaching-centers/:centerId/faculties` — faculty list of the center (batches populated).
  - `POST /api/coaching-centers/:centerId/students/:userId/promote` — same validation as the coordinator promote (target is a regular student of THIS center).
  - `POST /api/coaching-centers/:centerId/students/:userId/revoke-faculty` — clears `isFaculty` + `facultyBatches` only → regular student again.
  - `PUT /api/coaching-centers/:centerId/faculties/:userId/batches` — body `{ batchIds: [] }`, same single-center + center-ownership validation.
- Demote/remove faculty = same fields as coordinator revoke: `isFaculty: false`, `facultyBatches: []` → regular student of their center again.

### 4. Faculty runtime — `server/middleware/facultyOnly.js`

Clone of `requireCoordinator`, but **no Clerk metadata check** (role is Mongo-only):

1. `requireAuth` already ran → `req.userId` (Clerk sub).
2. Mongo `User.findOne({ clerkId: req.userId }).select('isFaculty facultyBatches')` — `isFaculty !== true` → 403.
3. Empty `facultyBatches` is **allowed** (empty-scope faculty — dashboards return empty).
4. Resolve center from batches; inject:
   - `req.facultyBatchIds` — array of batch ObjectIds
   - `req.facultyCenterId` — single center (from `req.facultyBatchIds[0]`'s batch; all must agree)
5. **Suspended-center check (mirror `coordinatorOnly.js:40-45`):** if the resolved center is suspended → 403. (Batches can't be moved between centers, so the resolved center is the faculty's center.)

### 5. API surface — `/api/faculty/*` (all `requireAuth, requireFaculty`)

Every handler validates scope from `req.facultyBatchIds` — a `batchId`/`studentId` outside the scope returns 403. Never trusts params.

**Batches (view only):**
- `GET /api/faculty/batches` — own batches, populated with student counts + active plan info. Empty array when none assigned.
- `GET /api/faculty/batches/:id` — 403 unless `id ∈ req.facultyBatchIds`.

**Students (view + export only — no edits):**
- `GET /api/faculty/students?batchId=&search=&page=` — roster of students whose `User.batch ∈ req.facultyBatchIds`.
- `GET /api/faculty/students/:id` — individual performance (progress, quizzes, assignments, plan day) — 403 unless `student.batch ∈ req.facultyBatchIds`.

**Dashboard/stats:**
- `GET /api/faculty/stats` — coordinator-style aggregate **scoped to own batches**: totalStudents, activePlans, activeBatchPlans, behindCount, completion %, quiz stats. Zeros when no batches.
- `GET /api/faculty/batches/progress` — per-batch day-by-day plan progress.

**CSV export:**
- `GET /api/faculty/export` — clone of `exportCoordinatorCsv` (`coordinatorController.js:692-793`) filtered to `req.facultyBatchIds`.

**Plans (create for own batches, reuse Plan/BatchPlan models):**
- `GET /api/faculty/plans` — plans of the faculty's center (or only plans they created — decide at build time).
- `POST /api/faculty/plans` — body includes `batchId ∈ req.facultyBatchIds`; center derived from that batch; stored on the Plan.
- `PUT /api/faculty/plans/:id` / `DELETE /api/faculty/plans/:id` — own-center scope check (mirror `planController.js:267`).
- `POST /api/faculty/batches/:id/assign-plan` / `unassign-plan` — only for own batches (mirror coordinator assign, `planController.js:1273`).

**Assignments (full CRUD + grading, batch-scoped):**
- `GET /api/faculty/assignments?batchId=&status=` / `GET /api/faculty/assignments/:id` (with submissions + not-submitted list)
- `POST /api/faculty/assignments` — body `batchId ∈ req.facultyBatchIds`; creates `assignment_created` notifications (mirror coordinator).
- `PUT /api/faculty/assignments/:id` / `DELETE /api/faculty/assignments/:id`
- `PUT /api/faculty/assignments/:id/submissions/:submissionId` — grade (approve/reject + feedback + notifications), with IDOR guard.
- `PUT /api/faculty/assignments/:id/bulk-grade`

**Explicitly NOT exposed:** assign/remove students, batch CRUD, course-offering changes, center settings, payment stats, any endpoint outside `req.facultyBatchIds`.

### 6. Client

**Routing:** `FacultyRoute` guard + `/faculty/*` tree under a new `FacultyLayout` + `FacultySidebar` (clone of coordinator's: Overview / Students / Batches / Assignments / Plans). Navbar shows faculty badge + link (`client/src/components/ui/Navbar.jsx:42-46, 184-198`).

**Guard note:** `FacultyRoute` reads `isFaculty` from `useAuthStore` — which requires the **additive AuthSync line** (§2): AuthSync currently mirrors only `_id`/`avatar`/`displayName`/`coachingCenter`/`batch` (App.jsx:219-236), so `isFaculty` must be added to `serverUpdates`. Never read `publicMetadata.role` — Clerk doesn't know about faculty.

**Pages (clone coordinator pages, batch-scoped):**
- `FacultyDashboard.jsx` — stat cards + batch progress cards + client-side CSV export; **empty state** when no batches assigned.
- `FacultyStudents.jsx` — roster + CSV; `FacultyStudentDetail.jsx` — performance drill-down (no edit, no remove buttons).
- `FacultyBatches.jsx` / `FacultyBatchDetail.jsx` — view-only.
- `FacultyAssignments.jsx` / `FacultyAssignmentDetail.jsx` — list + grading UI.
- `FacultyPlans.jsx` — reuse `AdminPlanBuilder` / `AdminPlanList` pattern (like coordinator does), batch-scoped.

**Coordinator additions:**
- "Promote to Faculty" button in `CoordinatorStudentsList.jsx` row actions + `CoordinatorStudentDetail.jsx` — the row-action button needs `isFaculty` from the roster (§2 fix); the student-detail button works as-is (exclusion-style select).
- New "Faculties" page in `CoordinatorSidebar.jsx` — list faculty, assign/remove batches (multi-select of own-center batches).

**Admin additions — all inside the center page (`AdminCoachingCenterDetail.jsx`), NOT in the global user editor:**
- New "Teachers (N)" admin-card section in the center page: faculty list of the center (name, email, assigned batches with student counts) + controls: Promote, Revoke, batch multi-select (active batches of THIS center only).
- "Teacher" badge on faculty rows in the existing Students table — **depends on `isFaculty` being added to `getCenterRoster`'s select list** (§2); the roster response is field-filtered today.
- `AdminUsers.jsx` untouched. `AdminUserEdit.jsx` untouched.

### 7. Security rules (build-time checklist)

- [ ] `requireFaculty` injects `req.facultyBatchIds` from the Mongo user doc; handlers never trust `:batchId`/`:studentId` params directly.
- [ ] `requireFaculty` checks `User.isFaculty` (Mongo) — **never** Clerk `publicMetadata.role`.
- [ ] Student lookups require `student.batch ∈ req.facultyBatchIds`.
- [ ] Assignment/plan creation requires `batchId ∈ req.facultyBatchIds`.
- [ ] Grade endpoints check the assignment's batch ∈ scope (IDOR guard like `assignmentController.js:456-458`).
- [ ] Single-center rule enforced on every faculty batch assignment.
- [ ] Coordinator promote/revoke/assign endpoints only touch students of `req.coordinatorCenterId`; no Clerk calls anywhere in the flow.
- [ ] Revoke-faculty clears ONLY `isFaculty` + `facultyBatches` — student state (center, batch, progress, submissions) survives.
- [ ] `deleteBatch` `$pull`s the batch id from `facultyBatches` (no dead scope after deletion).
- [ ] `removeStudentFromCenter` also clears `isFaculty`/`facultyBatches` (no faculty without a center).
- [ ] Faculty CSV export excludes students outside `req.facultyBatchIds`.

---

## Risks & Vulnerabilities (reviewed 8/2026)

### High — must handle at build time

1. **Orphaned `facultyBatches` refs on batch deletion.** **VERIFIED** — `deleteBatch` (`batchController.js:134-152`) unlinks students' `User.batch` (line 140) but has no knowledge of `facultyBatches`. **Fix:** add `$pull` of the batch id from all `facultyBatches` arrays next to line 140 (additive cleanup — no behavior change for existing flows). Archiving a batch is fine (see #7).
1b. **`removeStudentFromCenter` orphans faculty.** **NEW FINDING** — `removeStudentFromCenter` (`coachingCenterController.js:271-296`) clears `coachingCenter`, `batch`, `courseOffering` but not `isFaculty`/`facultyBatches`. An admin emergency-unlinking a faculty member would leave them faculty of a dead scope. **Fix:** also set `isFaculty: false` + `facultyBatches: []` alongside lines 284-287 (additive — normal students are unaffected, since `isFaculty` defaults false for them).
2. **Center derivation with empty/dangling batches.** `req.facultyCenterId` comes from `facultyBatches[0]` — with an empty array it's `undefined`. Every `/api/faculty/*` handler must treat `undefined` center / empty scope as "return empty data", never crash or widen scope.
3. **Client guard depends on `isFaculty` being in the profile payload.** **PARTIALLY RESOLVED BY AUDIT** — `getUserByUsername` (`userController.js:358-419`) returns the full doc (no field filtering), so `isFaculty` is already exposed; the client gate works as-is. Only gap: `facultyBatches` is NOT populated (raw ObjectIds) — fine for the guard; populate it only if the faculty UI needs batch names in profile contexts.

### Medium — design decisions with security impact

4. **Promote must target only regular students.** Guard `POST /students/:userId/promote`: target must be `role: 'user'` (Mongo), belong to `req.coordinatorCenterId`, and `isFaculty` must currently be false. Prevents: re-promoting faculty, promoting coordinators/admins (which would stack powers), promoting out-of-center students.
5. **`isFaculty`-stamped notifications.** `notificationController.js:31` stamps the actor's role from Clerk metadata (`'user'` for faculty). Faculty-created `assignment_created` notifications will read as from a regular student. Cosmetic, but decide: acceptable, or stamp `createdBy.role` fallback.
6. **Faculty-created content after revoke.** Assignments/plans created by a faculty member stay live after revoke. Coordinator/admin center-scoped endpoints can still manage them (fine — nothing is orphaned or unmanageable). Faculty endpoint access dies with the revoke (403). Document this behavior; do not auto-delete content.
7. **Archived batches.** If a faculty batch is archived, faculty still sees it (view-only). Block new plan/assignment creation and plan-assignments against archived batches (mirror whatever coordinator endpoints do today — verify before writing).

### Low — awareness

8. **Re-seeding wipes faculty state.** `server/seeds/seed.js` / admin "seed" button `deleteMany`s users — running it on the populated test DB destroys prod-restored data (including `isFaculty`, `coordinatorFor`, batches, plans). Never run seeds on the test cluster; it's prod-mirror data now.
9. **Type discipline on scope ids.** `req.facultyBatchIds` must be cast to ObjectIds in middleware, else `User.batch ∈ scope` queries silently mismatch strings. Mirror `coordinatorOnly.js` behavior.
10. **Single-center rule is enforced only at assignment time.** Batches cannot change center today (no such endpoint), so this holds; re-verify if a batch-move endpoint is ever added.
11. **Admin endpoints take an explicit `:centerId`** — the admin can act on ANY center, but within a single call every batch/student must belong to that one center (same validation as coordinator, with the center taken from the URL instead of middleware scope). Don't skip validation because "admin is global".

---

## File-by-file implementation checklist

### Server
- [ ] `server/models/User.js` — add `isFaculty` + `facultyBatches` fields (role enum NOT extended)
- [ ] `server/controllers/userController.js` — **NO change** (verified: fixed-field-list webhook + targeted self-heals; Mongo-only status can't degrade)
- [ ] `server/utils/accessControl.js` — **NO change** (verified: faculty pass via `coachingCenter` check, line 110)
- [ ] `server/controllers/batchController.js` — `deleteBatch`: +1 `$pull` of batch id from `facultyBatches` (next to line 140)
- [ ] `server/controllers/coachingCenterController.js` — `removeStudentFromCenter`: +3 lines clearing `isFaculty`/`facultyBatches` (next to lines 284-287)
- [ ] `server/services/centerRosterService.js` — add `isFaculty` to select lists (lines 36 + 86)
- [ ] `server/middleware/facultyOnly.js` — new middleware
- [ ] `server/controllers/facultyController.js` — new controller (batches/students/stats/export/plans/assignments)
- [ ] `server/routes/facultyRoutes.js` — new route module
- [ ] `server/controllers/coordinatorController.js` — promote/revoke/faculties list/batch assignment (all Mongo-only, no Clerk calls)
- [ ] `server/routes/coordinatorRoutes.js` — new faculty endpoints
- [ ] `server/controllers/adminController.js` — center-scoped faculty handlers (list/promote/revoke/batches per `:centerId`, Mongo-only, no Clerk write)
- [ ] `server/routes/coachingCenterRoutes.js` — register the admin faculty endpoints (`requireAuth, requireAdmin`, lines 14-26 pattern); `adminRoutes.js` untouched
- [ ] `server/app.js` — mount `/api/faculty`

### Client
- [ ] `client/src/App.jsx` — `FacultyRoute` + `/faculty/*` tree + **AuthSync additive line** (`if (json.data.isFaculty) serverUpdates.isFaculty = json.data.isFaculty;` near line 235)
- [ ] `client/src/components/faculty/FacultyLayout.jsx` + `FacultySidebar.jsx`
- [ ] `client/src/pages/FacultyDashboard.jsx`
- [ ] `client/src/pages/FacultyStudents.jsx` + `FacultyStudentDetail.jsx`
- [ ] `client/src/pages/FacultyBatches.jsx` + `FacultyBatchDetail.jsx`
- [ ] `client/src/pages/FacultyAssignments.jsx` + `FacultyAssignmentDetail.jsx`
- [ ] `client/src/pages/FacultyPlans.jsx`
- [ ] `client/src/pages/CoordinatorFaculties.jsx` + sidebar entry
- [ ] `client/src/pages/CoordinatorStudentsList.jsx` / `CoordinatorStudentDetail.jsx` — promote button
- [ ] `client/src/pages/AdminCoachingCenterDetail.jsx` — Teachers section (list/promote/revoke/batch-assign) + Teacher badges in Students table
- [ ] `client/src/components/ui/Navbar.jsx` — faculty badge/link
- [ ] `client/src/api/` — faculty API client (or extend `useAuthStore`-style store)

### Docs
- [ ] Update this file as the build progresses (mark checkboxes done, note deviations)

---

## Open items to decide at build time

1. `GET /api/faculty/plans` — show only faculty-created plans, or all plans of the center? (Default: all plans of the faculty's center, matching coordinator visibility.)
2. ~~Demotion path~~ — **DECIDED**: revoke-faculty (coordinator or admin) clears `isFaculty` + `facultyBatches` only; the person remains a regular student of the center. No Clerk involvement.
3. ~~Clerk involvement~~ — **DECIDED**: none. Faculty status is Mongo-only. Admin's Clerk access continues to manage only `admin`/`coordinator` roles exactly as today.
4. Notifications on promote/revoke (mirror `assignment_created` pattern) — include or skip?
