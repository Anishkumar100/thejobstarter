# Aptitude — 5th Subject Implementation Plan

> How to add **Aptitude** as a full 5th subject (parallel to DSA / DBMS / OS / Programming),
> wired into plan creation, progress tracking, quiz system, dashboards, navigation, and admin CRUD.
> Every touchpoint below was verified against the current code. No loose links.

---

## 1. Architecture Reality

There is **no central subject registry**. Every subsystem hardcodes its own subject
array / enum / model map. Adding a subject = touching every one of these maps.

Four pillars exist today:

| Subject      | Models (prefixed style)                  | Notes                                   |
| ------------ | ---------------------------------------- | --------------------------------------- |
| dsa          | `DsaLesson` `Subtopic` `Problem` `DsaMeta` | LEGACY generic names                    |
| dbms         | `DbmsLesson` `DbmsSubtopic` `DbmsProblem` `DbmsMeta` | prefixed                       |
| os           | `OsLesson` `OsSubtopic` `OsProblem` `OsMeta` | prefixed                           |
| programming  | `ProgrammingLesson` `ProgrammingSubtopic` `ProgrammingProblem` `ProgrammingMeta` | prefixed, NEWEST, **no mock data** |

**Clone target = Programming pillar** (prefixed, consistent, no mock-data baggage).

Naming for the new pillar: `AptitudeLesson`, `AptitudeSubtopic`, `AptitudeProblem`, `AptitudeMeta`.
Subject key: `aptitude`. Problem model name: `AptitudeProblem`. Route prefixes: `/api/aptitude`, `/api/aptitude-meta`.
Client URL base: `/aptitude`.

---

## 2. Final Schemas (with companies)

### `server/models/AptitudeLesson.js`
Clone of `server/models/ProgrammingLesson.js`:
`title, slug (unique), category, description, image, icon, order, difficulty, problemCount`

### `server/models/AptitudeSubtopic.js`
Clone of `server/models/ProgrammingSubtopic.js`:
`title, slug (unique), description, image, explanation, youtubeUrl, pdfUrl, lessonSlug, order`

### `server/models/AptitudeProblem.js`
Clone of `server/models/ProgrammingProblem.js` **minus code-centric fields**:

```js
title: { type: String, required: true },
slug: { type: String, required: true, unique: true, index: true },
lessonSlug: { type: String, required: true, index: true },
subtopicSlug: { type: String, default: '', index: true },
difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
topics: [{ type: String, index: true }],
companies: [{ type: String, index: true }],          // ← REQUIRED: shows which company asked
problemStatement: { type: String, required: true },
solution: { type: String, default: '' },
media: [{ type: { type: String, enum: ['image', 'youtube'] }, url: String, caption: String, position: Number }],
youtubeUrl: { type: String, default: '' },
pdfUrl: { type: String, default: '' },
views: { type: Number, default: 0 },
bookmarks: { type: Number, default: 0 }
```

**Deliberately omitted** (unlike Programming): `examples`, `constraints`, `approach`,
`codeBlocks`, `timeComplexity`, `spaceComplexity`, `pptxUrl`. Aptitude is prose/solution based.

### `server/models/AptitudeMeta.js`
Clone of `server/models/ProgrammingMeta.js` — **keep all three types including `company`**:

```js
type: { type: String, enum: ['category', 'topic', 'company'], required: true, index: true },
value: String, label: String, order: Number
// index({ type: 1, value: 1 }, { unique: true })
```

---

## 3. Server Hard Gates (must edit — Mongoose enum validation)

These three **reject** `subject: 'aptitude'` / `problemModel: 'AptitudeProblem'` today:

| File | Line | Change |
| ---- | ---- | ------ |
| `server/models/Progress.js` | 10 | enum add `'aptitude'` |
| `server/models/Plan.js` | 11 | enum add `'aptitude'` |
| `server/models/Quiz.js` | 10 | problemModel enum add `'AptitudeProblem'` |

`Quiz.js:9` uses `refPath: 'problemModel'` — so adding the model name is enough; no new ref needed.

---

## 4. Server Registration Maps (must edit)

| File | Line(s) | Change |
| ---- | ------- | ------ |
| `server/controllers/planController.js` | 25-30 | `SUBJECT_MODELS` add `aptitude: { lesson: AptitudeLesson, subtopic: AptitudeSubtopic, problem: AptitudeProblem }` (+ imports) |
| `server/services/progressService.js` | 30-35 | `SUBJECT_MODELS` add aptitude (+ imports) |
| `server/services/progressService.js` | 83 | `MODEL_TO_SUBJECT` add `AptitudeProblem: 'aptitude'` |
| `server/services/progressService.js` | 93 | `getQuizStats` stats object add `aptitude: { quizzesTaken: 0, avgScore: 0 }` |
| `server/services/progressService.js` | ~210 | subjects loop add `'aptitude'` |
| `server/controllers/quizController.js` | 12 | `MODEL_TO_SUBJECT` add `AptitudeProblem: 'aptitude'` |
| `server/controllers/quizController.js` | 16 | `findProblemId` model map add `AptitudeProblem` (+ import) |
| `server/controllers/quizController.js` | 176 | `getMyAttempts` Model map add `AptitudeProblem` (else "View problem" links in attempt history 404) |
| `server/controllers/quizController.js` | 252-253 | submit/verify path — Model map (252) + subject map (253) add `AptitudeProblem` |
| `server/controllers/progressController.js` | 31 | whitelist add `'aptitude'` |
| `server/controllers/progressController.js` | 52 | `PROBLEM_MODELS` add `aptitude: AptitudeProblem` |
| `server/controllers/progressController.js` | 66 | `SUBTOPIC_MODELS` add `aptitude: AptitudeSubtopic` |
| `server/controllers/progressController.js` | 198-199 | `checkCompleted` auto-complete maps — SubModel (198) + ProbModel (199) add aptitude (else theory-only subtopics never auto-complete) |

---

## 5. Chain A — Plan Creation & Day Progress (proven NO code change needed)

Plan items are matched to `Progress` purely by the **string key**
`` `${subject}:${targetType}:${targetSlug}` ``. `getPlanProgress` (in
`server/services/planProgressService.js`) and both day-progress endpoints
(`planController.js` `getDayProgressBreakdown` ~925, `getBatchDayProgress` ~1122)
never enumerate subjects — they read whatever keys exist in `Progress`.

Once `planController.js` `SUBJECT_MODELS` (25-30) gains `aptitude`:
- `/api/plans/hierarchy` (~line 343) auto-serves aptitude content (lessons → subtopics → problems)
- `/api/plans/content-search` (~line 409) auto-includes aptitude items
- `AdminPlanBuilder` (client) lists aptitude automatically after the client-side `SUBJECTS` edit (see §8)

**No edit** to `planProgressService.js` or the day-progress endpoints.

---

## 6. Chain B — Progress & Quiz Flow

- `QuizEmbed problemModel="AptitudeProblem" subject="aptitude" subjectName="Aptitude"`
- Submit attempt → `quizController.submitQuizAttempt` (~252) creates `Progress`
  record `{ subject: 'aptitude', targetType: 'problem', targetSlug }` then calls
  `cascadeProgressCompletion` — which iterates `progressService.SUBJECT_MODELS`,
  so the cascade (problem → subtopic → lesson) works once §4 edits land.
- Manual completion (`POST /api/progress`) works after `progressController.js:31,52,66` edits.
- Access gating is **identical to other subjects**: first 2 lessons free via
  `isLessonFree`; deeper content behind `canAccessSubject`; server GET routes `requireAuth`,
  admin writes `requireAuth, requireAdmin`.

---

## 7. Chain C — Soft Integrations (adds/CSV/stats)

| File | Line(s) | Change |
| ---- | ------- | ------ |
| `server/controllers/adminController.js` | 38-59 | `getStats` — explicit `countDocuments()` per model (NOT a loop): add 3 aptitude calls (pattern of 56-58), destructure at 39, response keys at 63 |
| `server/controllers/adminController.js` | 163 | CSV export subject loop add `'aptitude'` |
| `server/controllers/coordinatorController.js` | 62 | coordinator stats map add aptitude |
| `server/controllers/coordinatorController.js` | 726 | coordinator per-student subjects add aptitude |
| `server/controllers/userController.js` | 654 | CSV progress summary loop add `'aptitude'` |
| `server/controllers/userController.js` | 672-674 | CSV lookup maps `LESSON_MODELS` / `SUBTOPIC_MODELS` / `PROBLEM_MODELS` add aptitude |
| `server/controllers/userController.js` | 677-690 | CSV name-fetch `Promise.all` add 3 aptitude fetches (ProgrammingLesson at 684 is the pattern) |
| `server/controllers/userController.js` | 745-746 | CSV quiz rows — subject map (745) + Model map (746) add `AptitudeProblem` |
| `server/services/needsAttentionService.js` | 37, 82 | subject arrays add `'aptitude'` |

`centerRosterService.js` needs **nothing** — it delegates to `progressService.getProgressSummary`.

## Verified — needs NO code change (checked this round)

| File | Why it's safe |
| ---- | ------------- |
| `server/utils/accessControl.js` | subject-agnostic (lesson slugs + subscription/center checks only) |
| `server/services/planProgressService.js` | matches Progress by `` `${subject}:${targetType}:${targetSlug}` `` keys only (82-92, 133-144) |
| `server/services/centerRosterService.js` | delegates to `progressService.getProgressSummary` |
| `server/models/ProgressMessage.js:16` | `subject` is free-text, no enum |
| `server/models/QuizAttempt.js`, `BatchPlan.js`, `Batch.js`, `Assignment.js`, `CourseOffering.js`, `Topic.js` | no subject field/enum |
| `server/controllers/progressMessageController.js`, `topicController.js` | no subject lists |
| `client/src/components/quiz/QuizEmbed.jsx` / `QuizEditor.jsx` | fully parameterized (`problemModel`/`subject` props) |
| `client/src/stores/useProgressStore.js` | subject-agnostic (takes subject as arg) |
| `client/src/pages/Cheatsheets.jsx` | renders `cs.category` tag, no hardcoded list |

**Optional / pre-existing gaps (not required for the aptitude pillar):**
- `server/models/Cheatsheet.js:9` — category enum `['dsa','dbms','os']` already lacks `'programming'`; add `'aptitude'` only if aptitude cheatsheets will exist.
- `siteConfigController.js:55,69-71,91-99` + `AdminWhySection.jsx`/`AdminWhyTheJobStarter.jsx` — marketing copy ("three subjects", "DSA, DBMS & OS") — DB-driven defaults, purely cosmetic.
- **Launch item — "Coming Soon" teaser must be updated when aptitude goes live**:
  `siteConfigController.js:122-123`, `client/src/components/home/WhyTheJobStart.jsx:40-41`,
  `client/src/pages/AdminWhyTheJobStarter.jsx:28` all hardcode an
  "Aptitude & Reasoning, Coming Soon" card (fourth-pillar roadmap teaser). Once aptitude ships,
  replace this card with a live `/aptitude` link or remove it.

---

## 8. Client Changes

### API + stores
- New `client/src/api/aptitudeApi.js` + `aptitudeMetaApi.js` (clone `programmingApi.js` / `programmingMetaApi.js`)
- New `client/src/stores/useAptitudeStore.js` + `useAptitudeMetaStore.js`
  (clone programming stores; keep the `USE_MOCK` branch returning `[]` — see §10)
- Register both stores in `client/src/stores/index.js` and both APIs in `client/src/api/index.js`

### Public pages (clone Programming set)
`AptitudeList.jsx`, `AptitudeLesson.jsx`, `AptitudeSubtopic.jsx` (has `getYouTubeEmbedUrl`),
`AptitudeSubtopicProblems.jsx`, `AptitudeDetail.jsx` (mounts `QuizEmbed`).
Mount `QuizEmbed` with `problemModel="AptitudeProblem"` (same as `ProgrammingDetail`).

### Admin pages (clone Programming set)
`AdminAptitudeList.jsx`, `AdminAptitudeLessonEdit.jsx`, `AdminAptitudeAllSubtopics.jsx`,
`AdminAptitudeSubtopicList.jsx`, `AdminAptitudeSubtopicEdit.jsx` (explanation/youtube/pdf),
`AdminAptitudeProblemList.jsx`, `AdminAptitudeProblemEdit.jsx` (includes companies field +
`QuizEditor`; clone `AdminProgrammingProblemEdit.jsx`),
`AdminAptitudeMeta.jsx` (category/topic/**company** tabs — clone `AdminProgrammingMeta.jsx`).

### Routes — `client/src/App.jsx`
Imports after line 38; routes after line 291:
```
/aptitude                                  → AptitudeList
/aptitude/:lessonSlug                      → AptitudeLesson
/aptitude/:lessonSlug/:subtopicSlug        → AptitudeSubtopic
/aptitude/:lessonSlug/:subtopicSlug/problems → AptitudeSubtopicProblems
/aptitude/:lessonSlug/:subtopicSlug/:problemSlug → AptitudeDetail
```
Admin routes after line 381: `/admin/aptitude`, `/admin/aptitude/lessons(/new|:id/edit)`,
`/admin/aptitude/subtopics`, `/admin/aptitude/lessons/:lessonId/subtopics(/new|:id/edit)`,
`/admin/aptitude/problems(/new|:id/edit)`, `/admin/aptitude/meta`.

### Hardcoded subject lists (client)

| File | Line(s) | Change |
| ---- | ------- | ------ |
| `client/src/components/ui/Navbar.jsx` | 13-20 | `CORE_LINKS` add `{ to: '/aptitude', label: 'Aptitude' }` |
| `client/src/components/ui/Footer.jsx` | 139-142 | add Aptitude link beside Programming |
| `client/src/components/admin/AdminSidebar.jsx` | 53-61 | add Aptitude section after Programming (heading + 4 links) |
| `client/src/pages/AdminDashboard.jsx` | 22-28 | stat tiles — add Aptitude tiles using new `aptitudeLessons/...` keys from getStats |
| `client/src/pages/AdminDashboard.jsx` | 230-235 | quick-action buttons add Aptitude |
| `client/src/pages/Home.jsx` | 14-18 | `DEFAULT_TOPICS` — add 5th aptitude card (merge at 59-60 auto-appends extra saved topics, but defaults need it for the fallback state) |
| `client/src/pages/Home.jsx` | 155 | "Four Pillars. One Mission." headline — optional copy tweak |
| `client/src/pages/AdminTopics.jsx` | 6-11 | `DEFAULT_TOPICS` — add 5th aptitude entry (merge at 29-34 keeps extras) |
| `client/src/pages/AdminPlanBuilder.jsx` | 12-17 | `SUBJECTS` add `{ value: 'aptitude', label: 'Aptitude', color: ... }` |
| `client/src/pages/AdminPlanBuilder.jsx` | 465, 778 | TWO `PROG` shortlabel spots — extend both ternaries to handle `'aptitude'` |
| `client/src/pages/AdminPlanList.jsx` | 284-288 | subject filter options add `'aptitude'` |
| `client/src/pages/StudentDashboard.jsx` | 36-44 | `SUBJECT_COLORS` / `SUBJECT_NAMES` / `SUBJECT_NAMES_FULL` / `SUBJECT_BADGE` add `aptitude` |
| `client/src/pages/StudentDashboard.jsx` | 102 | subjects list add `'aptitude'` (drives overall stats + subject cards) |
| `client/src/pages/StudentDashboard.jsx` | 1294 | plan-statement icon ternary falls back to `BookOpen` for new subjects — optional polish |
| `client/src/pages/UserProfile.jsx` | 201, 308, 311 | add aptitude to progress grid |
| `client/src/pages/SubjectProgressDetail.jsx` | 30-31 | `validSubjects` + `subjectLabel` add aptitude |
| `client/src/pages/SubjectProgressDetail.jsx` | 32-37 | `subjectColors` add aptitude |
| `client/src/pages/SubjectProgressDetail.jsx` | 460 | attempt "View problem" URL ternary — add `'aptitude'` case (currently falls through to `'os'`!) |
| `client/src/components/feedback/FeedbackSection.jsx` | 11-12 | subjects + labels add aptitude |
| `client/src/pages/CoordinatorBatchDetail.jsx` | 336 | subject loop add aptitude |
| `client/src/pages/CoordinatorBatchDetail.jsx` | 1239-1240, 1267 | subColors / subLabels / subName maps add aptitude |
| `client/src/pages/CoordinatorGeneralStats.jsx` | 76 | overall-pct loop add aptitude |
| `client/src/pages/CoordinatorGeneralStats.jsx` | 93-107 | explicit chart rows (dsaT/dbmsT/.../progT) — add aptitude row |
| `client/src/pages/CoordinatorStudentsList.jsx` | 63, 71 | subject loops add aptitude |
| `client/src/pages/CoordinatorStudentsList.jsx` | 199-207 | CSV export — explicit subject columns + `subC.aptitude` destructure |
| `client/src/pages/CoordinatorStudentDetail.jsx` | 12-13, 17 | `SUBJECT_COLORS` / `SUBJECT_NAMES_FULL` / `SUBJECT_BADGE_COLORS` add aptitude |
| `client/src/pages/CoordinatorStudentDetail.jsx` | 117-118, 174 | subject list + short-name map + usage |
| `client/src/pages/CoordinatorStudentDetail.jsx` | 223-224 | subjects list + names map (charts, 619) |
| `client/src/pages/AdminBatchDetail.jsx` | 342, 347 | subject derivation loops add aptitude |
| `client/src/pages/AdminBatchDetail.jsx` | 992-993, 1019 | subColors / subLabels / subName maps add aptitude |
| `client/src/pages/AdminProgressMessages.jsx` | 8 | `SUBJECTS` add `'aptitude'` |
| `client/src/pages/AdminCoachingCenterStudentDetail.jsx` | 348-349 | `subjectName` map `{dsa,dbms,os}` only — add `'programming'` (pre-existing bug) **and** `'aptitude'` |
| `client/src/utils/constants.js` | after 21 | add `APTITUDE_CATEGORIES` (e.g. Quantitative / Logical / Verbal / Data Interpretation) |

---

## 9. Companies — how a problem shows "which company asked"

1. `client/src/utils/constants.js:17-21` already exports `COMPANIES` (Amazon, Google, Meta,
   Microsoft, Apple, Netflix, Uber, Atlassian, Adobe, Flipkart, Oracle, IBM, Goldman Sachs,
   JPMorgan, Tesla). Reuse it — do not duplicate.
2. **Admin** sets `companies[]` on each `AptitudeProblem` via `AdminAptitudeProblemEdit`
   (companies input exists in `AdminProgrammingProblemEdit.jsx` — clone it). Optionally
   manage an aptitude-specific company list in `AdminAptitudeMeta` (type `'company'`).
3. **Student UI** — `client/src/components/dsa/ProblemCard.jsx` already renders
   `problem.companies.slice(0, 5)` and accepts a `subject` prop. Reuse it on the aptitude
   problem list pages so each card shows the company chips.
4. **Plan items / hierarchy** — `targetTitle` is denormalized into the plan item, so the
   company list only needs to live on the problem document; no plan-side copy.

---

## 10. Decisions (locked)

- **Schema**: minimal problem model but **KEEP `companies[]`** (user requirement).
- **Gating**: identical to sibling subjects (free first 2 lessons + `canAccessSubject`).
- **Mock data**: **skip client mock data**. Programming has no `client/src/data/` mock file
  and its store's `USE_MOCK` branch returns `[]`. Programming content is instead seeded
  **server-side** — `server/seeds/seedPhaseContent.js` (lessons/subtopics/problems/meta,
  lines 1840-2560) plus per-lesson one-off scripts in `server/programming-content/`
  (`generate_seed.mjs`, `seed_*.mjs`, `reset_programming.mjs`). Mirror exactly that:
  no `client/src/data/aptitude.js`, store mock branch returns `[]`, content ships via a
  server-side seed script (Phase 6).
- **Integrations**: include ALL soft integrations (§7) — nothing left dangling.

---

## 11. Implementation Phases

- **Phase 1 — Server models** ✅ DONE (verified, no bugs): created `AptitudeLesson`, `AptitudeSubtopic`,
  `AptitudeProblem`, `AptitudeMeta`. Edited enums: `Progress.js:10`, `Plan.js:11`, `Quiz.js:10`.
- **Phase 2 — Server routes/controllers** ✅ DONE: created `aptitudeController.js`,
  `aptitudeMetaController.js` (clone programming + its `seed`/`clearCache` behavior),
  `routes/aptitudeRoutes.js`, `routes/aptitudeMetaRoutes.js`. Mounted in `app.js`
  (`/api/aptitude` L156, `/api/aptitude-meta` L157). All §4 maps registered.
  Bonus fixes while in-block: `progressController.js:67` typo `SUBTOpic_MODELS` → `SUBTOPIC_MODELS`
  (pre-existing 500 on manual subtopic completion); `userController.js` CSV batch-fetch destructuring
  mismatch (dsa/dbms/os problem names were being read from programming collections) + programming
  added to the name-map loops it was silently missing from.
- **Phase 3 — Client API/stores** ✅ DONE: `client/src/api/aptitudeApi.js`, `aptitudeMetaApi.js`,
  `client/src/stores/useAptitudeStore.js`, `useAptitudeMetaStore.js` (default categories:
  quantitative/logical/verbal/data-interpretation). Not registered in `api/index.js`/`stores/index.js`
  — parity with programming, which is imported directly by its pages. `usePageLoadingStore` labels
  are free-text — 'Aptitude' works with zero changes.
- **Phase 4 — Client pages** ✅ DONE: cloned 13 pages (5 public: AptitudeList/Lesson/Subtopic/
  SubtopicProblems/Detail + 8 admin: AdminAptitudeList/LessonEdit/AllSubtopics/SubtopicList/
  SubtopicEdit/ProblemList/ProblemEdit/Meta). Routes registered in `App.jsx` (`/aptitude/*` public,
  `/admin/aptitude/*` admin). QuizEditor `problemModel="AptitudeProblem"`, QuizEmbed
  `subjectName="Aptitude" subject="aptitude"`. Hero image fetches homepage topic `category === 'APT'`
  (requires an 'APT' topic card in Phase 5). Custom copy: hero title "Aptitude & Reasoning",
  aptitude-specific description. `vite build` passes (7715 modules).
- **Phase 5 — Integrations** ✅ DONE: Navbar (CORE_LINKS + Aptitude), Footer (:143), AdminSidebar
  (Aptitude section, Calculator icon), AdminDashboard (2 section cards + 2 quick actions), Home.jsx +
  AdminTopics (5th 'APT' topic card, `category:'APT'`, link `/aptitude`, accent `#f97316`,
  "Five Pillars" headline), AdminPlanBuilder (SUBJECTS + `APT` short-labels at both ternary sites),
  AdminPlanList (subject filter option), StudentDashboard (colors/names/badges + subjects loop),
  UserProfile (overall + per-subject cards), SubjectProgressDetail (validSubjects, colors,
  and the URL ternary — aptitude now resolves to `/aptitude/...` instead of falling through to `os`),
  FeedbackSection, CoordinatorBatchDetail/GeneralStats/StudentsList (incl. CSV + progress bars)/
  StudentDetail, AdminBatchDetail, AdminProgressMessages, AdminCoachingCenterStudentDetail
  (added aptitude AND the previously-missing programming label). `constants.js` deliberately NOT
  touched — it has no programming/aptitude consumer; adding `APTITUDE_CATEGORIES` would be dead
  code (golden rule 16). api/store/pages barrels verified as no-ops (programming isn't exported
  either — direct imports, parity). Coming Soon teaser → "Live Now": WhyTheJobStart.jsx pillar 8,
  siteConfigController.js default (subtitle + "Three Subjects" → "Five Subjects" + pillar 8),
  AdminWhyTheJobStarter.jsx defaults. Blog navlink moved into the Community dropdown (navbar
  responsiveness; renders in desktop dropdown + mobile overlay via COMMUNITY_LINKS).
  `vite build` passes (7715 modules) + grep sweeps clean.
- **Phase 5.5 — Deep audit of Phases 1-5** ✅ DONE (mismatches found + fixed):
  - **AdminAptitudeProblemEdit** — was sending 7 fields the minimal AptitudeProblem model ignores
    (approach, timeComplexity, spaceComplexity, examples, constraints, codeBlocks, pptxUrl) → silent
    data loss on save. Trimmed the code-centric UI (Approach/Examples/Constraints/Code Solutions/
    Complexity/PPTX sections) and wired the model's `solution` field end-to-end: Markdown textarea +
    preview in the form, rendered on AptitudeDetail.
  - **AdminAptitudeSubtopicEdit** — was sending `pptxUrl` (not on the subtopic model) → dropped the
    field from state/load/save/UI.
  - **AptitudeDetail** — dead UI for non-existent fields removed (code-reveal panel, PPTX download,
    time/space stat cards); `solution` section added below ProblemView.
  - **AptitudeSubtopic** — PPTX download block removed (field can never exist).
  - Security review: media routes all `requireAuth, requireAdmin`; quiz routes gated, `correctIndex`
    stripped pre-attempt and revealed only post-attempt; progress routes use `req.userId` (no IDOR);
    aptitude subject whitelist in all progress/quiz/plan paths; `.env` gitignored (only `.env.example`
    tracked); no secrets in logs. Remaining note: `server/scripts/clearProdUsersAndOrg.js` is an
    untracked production data-deletion script — keep it out of any commit.
- **Phase 6 — Content seeding** ✅ DONE: `server/seeds/seedAptitudeContent.js` — mirrors
  `seedPhaseContent.js` (lessons → subtopics → problems + meta + dynamic problemCount backfill)
  with 5 lessons, 10 subtopics, 10 problems, 22 meta entries. Deliberately clears ONLY the four
  Aptitude collections — it never wipes other subjects' content or Progress/QuizAttempt. Lesson
  categories are the four meta categories (`quantitative`, `logical`, `verbal`,
  `data-interpretation`) that drive the /aptitude filter pills (useAptitudeMetaStore defaults).
  Problems use the model's real fields only (`problemStatement` + `solution` Markdown — no
  examples/constraints/approach). Runs via `npm run seed:aptitude` (new script in
  server/package.json). Data integrity verified: no duplicate slugs, all lessonSlug/subtopicSlug
  links resolve, per-lesson problemCount matches, every solution non-empty.

---

## 12. Verification Checklist

- [ ] `POST /api/progress` with `subject:'aptitude'` returns 200 (not "Invalid subject")
- [ ] Theory-only aptitude subtopics auto-complete via `checkCompleted` (progressController 198-199)
- [ ] Quiz attempt history "View problem" links resolve for aptitude (quizController 176)
- [ ] `POST /api/plans` with `subject:'aptitude'` item saves (Plan enum accepts it)
- [ ] `GET /api/plans/hierarchy` includes aptitude; `GET /api/plans/content-search?subject=aptitude` works
- [ ] `POST /api/quizzes` with `problemModel:'AptitudeProblem'` creates; quiz submit creates Progress + cascade completes subtopic/lesson
- [ ] `/api/progress/summary` shows `aptitude` in stats; quiz stats include aptitude
- [ ] Admin CSV + `/api/admin/stats` + coordinator stats include aptitude counts
- [ ] Aptitude problems render company chips on list + detail
- [ ] Homepage shows the 5th Aptitude topic card; footer + navbar link to `/aptitude`
- [ ] First 2 aptitude lessons free, rest gated by `canAccessSubject`
- [ ] `AdminCoachingCenterStudentDetail` shows aptitude AND programming
- [ ] Full responsive pass (375/768/1024/1440) on all new pages
