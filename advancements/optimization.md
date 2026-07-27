# Optimization Sprint — Sub-1 Second Page Load

> Goal: Get public content pages (DSA, DBMS, OS, Blog, Programming) to load in **under 1 second** without migrating to Next.js.

---

## Bottleneck Summary

| # | Bottleneck | Current Behavior | Impact |
|---|-----------|-----------------|--------|
| 1 | Zero code-splitting | 70+ pages statically imported in `App.jsx` → single ~1.9MB bundle (463KB gzip) | User downloads the entire app on first visit |
| 2 | ClerkGate wraps all pages | `useAuth().isLoaded` spinner blocks rendering on every route, including public content pages | 200–500ms auth init delay before any content appears |
| 3 | apiRequest polls for token | `getClerkToken()` runs a 30-attempt (3s) polling loop via `setInterval` on **every** API call | Blocks data fetching by up to 3s, even for public GET endpoints that need no auth |
| 4 | Server requires auth on public content | DSA, DBMS, OS GET routes use `requireAuth` middleware. Unauthenticated visitors get 401 on data fetch. | Making public pages public requires server-side route changes too |
| 5 | Images not lazy-loaded | 53 `<img>` tags across 39 files missing `loading="lazy"` | Render-blocking image downloads delay paint |
| 6 | Google Fonts render-blocking | `<link href="https://fonts.googleapis.com/..." rel="stylesheet">` in `<head>` blocks render | Adds ~200ms before first paint |

---

## Phase 1 — Server: Make Public Routes Truly Public

**Files to modify:**

- `server/routes/dsaRoutes.js` — Remove `requireAuth` from GET endpoints (lines 16, 17, 23-25, 31-32)
- `server/routes/dbmsRoutes.js` — Remove `requireAuth` from GET endpoints
- `server/routes/osRoutes.js` — Remove `requireAuth` from GET endpoints (lines 13-14, 20-22, 28-29)
- `server/routes/programmingRoutes.js` — Verify already public (likely fine)

**Change:** GET routes become unprotected. POST/PUT/DELETE remain admin-only.

**Why:** AGENTS.md specifies DSA/DBMS/OS as "Public (no login — SEO indexed)." Articles and Blog are already public — these need to match.

**Post-change:**
- Unauthenticated visitors can fetch DSA lists, lessons, subtopics, problems
- Bookmark routes remain auth-protected
- Admin write routes remain admin-protected

---

## Phase 2 — React.lazy Code-Splitting

**File to modify:** `client/src/App.jsx`

**Approach:** Split pages into 4 chunks using `React.lazy()` + `Suspense`:

1. **Public chunk** (loaded on first visit): Home, About, DsaList, DsaLesson, DsaSubtopic, DsaSubtopicProblems, DsaDetail, DbmsList, DbmsLesson, DbmsSubtopic, DbmsSubtopicProblems, DbmsDetail, OsList, OsLesson, OsSubtopic, OsSubtopicProblems, OsDetail, ProgrammingList, ProgrammingLesson, ProgrammingSubtopic, ProgrammingSubtopicProblems, ProgrammingDetail, BlogList, BlogDetail, Cheatsheets, Newsletter
2. **Protected chunk** (loaded on auth): QaList, QaDetail, AskQuestion, UserSearchPage, UserProfile, FollowersPage, EditProfile, MessagesPage, MessageThreadPage, StudentDashboard, SubjectProgressDetail
3. **Admin chunk** (loaded on admin role): All 40+ AdminDashboard pages
4. **Coordinator chunk** (loaded on coordinator role): All 10+ Coordinator pages

**Implementation:**
```jsx
const DsaList = React.lazy(() => import('./pages/DsaList.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard.jsx'));
// ... etc.
```

Wrap routes in `<Suspense fallback={<PageLoader />}>` inside `<Routes>`.

**Expected impact:** Initial bundle drops from ~1.9MB to ~400KB (public chunk only). Admin/Coordinator/Protected pages load on-demand.

---

## Phase 3 — ClerkGate: Only Block Auth Pages

**File to modify:** `client/src/App.jsx`

**Change:** Move `ClerkGate` from wrapping the entire `AppRoutes` to only wrapping routes that actually need auth.

```jsx
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — no ClerkGate, render immediately */}
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/dsa" element={<AppLayout><DsaList /></AppLayout>} />
      {/* ... all public routes rendered immediately ... */}

      {/* Protected routes — wrapped in ClerkGate */}
      <Route path="/qa" element={
        <ClerkGate>
          <ProtectedRoute><AppLayout><QaList /></AppLayout></ProtectedRoute>
        </ClerkGate>
      } />
      {/* ... same for admin, coordinator routes ... */}
    </Routes>
  );
}
```

**Also:** Remove `requireAuth` from public page routes in App.jsx:
- `/dsa`, `/dsa/:lessonSlug`, `/dsa/:lessonSlug/:subtopicSlug`, `/dsa/:lessonSlug/:subtopicSlug/:problemSlug`, `/dsa/:lessonSlug/:subtopicSlug/problems`
- `/dbms/*`, `/os/*`, `/programming/*`, `/blog/*`

These are currently wrapped in `<ProtectedRoute>` which redirects to sign-in for unauthenticated users — this defeats SEO and the whole point of public pages.

**Expected impact:** Eliminates 200–500ms spinner on every public page load.

---

## Phase 4 — apiRequest: Skip Token Polling for Public Endpoints

**File to modify:** `client/src/api/client.js`

**Change:** Add a `public` flag to `apiRequest` that skips `getClerkToken()` entirely:

```jsx
export async function apiRequest(endpoint, options = {}) {
  const { public: isPublic, ...rest } = options;
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...rest.headers },
    ...rest
  };

  /* Public endpoints don't need token — skip polling entirely */
  if (!isPublic) {
    const token = await getClerkToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, config);
  // ... rest same
}
```

Then update all public API calls to pass `public: true`:
- `dsaApi.js` — `fetchProblems`, `fetchProblemBySlug`, etc.
- `articleApi.js` — `fetchArticles`, `fetchArticleBySlug`
- `blogApi.js` — `fetchPosts`, `fetchPostBySlug`
- `languageApi.js` — `fetchLanguages`
- `programmingApi.js` — public GETs

**Expected impact:** Data fetching starts immediately instead of waiting up to 3s for Clerk token polling.

---

## Phase 5 — Lazy-Load Images

**Files to modify:** 39 files with 53 `<img>` tags missing `loading="lazy"`.

**Approach:** Batch edit all `<img>` tags in public-facing pages to add `loading="lazy"`. Priority list:

1. **Content pages (highest priority — first paint):**
   - `DsaList.jsx` — lesson card images
   - `DbmsList.jsx`, `OsList.jsx`, `ProgrammingList.jsx` — lesson card images
   - `DbmsLesson.jsx`, `OsLesson.jsx`, `ProgrammingLesson.jsx`, `DsaLesson.jsx` — subtopic images
   - `BlogDetail.jsx` — cover image
   - `About.jsx` — logo

2. **UI components:**
   - `Navbar.jsx` — avatar images (2 occurrences)
   - `Footer.jsx` — logo image
   - `HowItWorks.jsx` — step images

3. **Admin/coordinator pages (lower priority — behind auth):**
   - All avatar lists, preview thumbnails, etc.

**Note:** Some admin/coordinator page images are already behind auth so they load after the public chunk anyway. Focus on public content page images first.

---

## Phase 6 — Font Optimization

**File to modify:** `client/public/index.html`

**Change:** Add `preconnect` + `preload` for Google Fonts stylesheet:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" media="print" onload="this.media='all'" />
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
</noscript>
```

**Expected impact:** Font download starts earlier (preconnect), and `media="print"` + `onload` trick prevents render blocking while ensuring fonts swap in after load.

---

## Execution Order

| Step | Phase | Effort | Risk | Impact |
|------|-------|--------|------|--------|
| 1 | Phase 1 — Server routes public | Low | Medium (breaks if any public route actually needs auth) | Prerequisite |
| 2 | Phase 2 — React.lazy code-split | Medium | Low (proven pattern) | Highest |
| 3 | Phase 3 — ClerkGate decouple | Medium | Medium (must ensure ProtectedRoute still works) | High |
| 4 | Phase 4 — apiRequest public flag | Low | Low | High |
| 5 | Phase 5 — Lazy images | Medium | Low | Medium |
| 6 | Phase 6 — Font optimization | Low | Low | Low |

**Order rationale:** Server routes must be public before ClerkGate is removed from public pages (otherwise API calls 401). Code-splitting is independent and can be done in parallel. Font/lazy images are independent of auth changes.

---

## Success Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| Time to First Paint (TTFP) | ~? | <1s | Chrome DevTools Network tab |
| Largest Contentful Paint (LCP) | ~? | <1.5s | Lighthouse |
| First Input Delay (FID) | ~? | <100ms | Lighthouse |
| Bundle size (gzip) | 463KB | <150KB | Vite build output |
| Auth spinner on public pages | 200-500ms | 0ms | Visual inspection |
| API calls blocked waiting for token | Up to 3s | 0ms | Network tab waterfall |
