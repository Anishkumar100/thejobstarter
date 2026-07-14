# TheJobStarter — Features

> A placement preparation platform covering DSA, DBMS, and OS under one roof.

---

## 1. Content Library

### 1.1 Three-Subject Coverage

DSA, DBMS, and OS — each with its own full content hierarchy. No need to jump between platforms for different subjects.

| Subject | Lessons | Subtopics | Problems/Articles |
|---------|---------|-----------|-------------------|
| DSA |  lessons across categories | subtopics with explanations | Problems with multi- programming language solutions |
| DBMS | Full lesson structure | Subtopics with video + PDF | Articles + problems with code blocks |
| OS | Full lesson structure | Subtopics with video + PDF | Articles + conceptual problems |

### 1.2 Content Hierarchy

Every subject follows the same three-level structure:

```
Subject → Lessons → Subtopics → Problems/Articles
```

Each subtopic includes:
- Explanatory content with Markdown rendering
- Embedded YouTube walkthrough videos
- Downloadable PDF reference
- Optional PPTX presentations
- Related problems or articles

### 1.3 DSA Problem Bank

Problems include:
- Full problem statement
- Multiple input/output examples with explanations
- Constraints listed as bullet points
- Written approach/strategy explanation
- Time and space complexity analysis
- Solutions in Python, JavaScript, Java, and C++
- Tabbed code block switching with one-click copy
- Embedded YouTube walkthrough videos
- Company tags (Amazon, Google, Meta, Microsoft, Apple, Adobe, and more)
- Topic tags (Arrays, Hashing, Linked Lists, Trees, Graphs, DP, and 15+ more)
- Difficulty badges (Easy, Medium, Hard)

### 1.4 DBMS Articles

45+ in-depth articles covering:
- SQL (joins, window functions, query optimisation)
- Normalisation (1NF through BCNF)
- ACID properties and transactions
- Concurrency control
- Indexing and query optimisation
- ER diagrams and relational model
- NoSQL concepts

### 1.5 OS Articles

40+ in-depth articles covering:
- Process management and states
- CPU scheduling algorithms
- Process synchronisation
- Deadlock detection and prevention
- Memory management and virtual memory
- File systems and I/O management
- Disk scheduling
- System calls

### 1.6 Blog Posts

Placement stories, learning guides, and industry insights from placed seniors. Each post includes cover images, author attribution, read time estimates, and topic tags.

### 1.7 Cheatsheets

Downloadable PDF quick-reference cheatsheets organised by category:
- DSA: Sorting algorithms
- DBMS: SQL joins and window functions
- OS: Scheduling and memory management

Download tracking is built in.

### 1.8 Programming Languages

Four languages supported across all code examples:

| Language | Status |
|----------|--------|
| Python | Active |
| JavaScript | Active |
| Java | Active |
| C++ | Active |

Languages are admin-managed — can be added, removed, or toggled active/inactive through the dashboard.

---

## 2. Content Discovery & Filtering

### 2.1 Filters

- By difficulty (Easy, Medium, Hard for DSA; Beginner, Intermediate, Advanced for DBMS/OS)
- By topic (21 DSA topics, 11 DBMS topics, 11 OS topics)
- By company (15 companies tracked across problems)
- By search keyword (debounced at 300ms)
- By category (Data Structures, Algorithms, Techniques for DSA)

### 2.2 Pagination

Numbered pagination with Previous/Next controls across all listing pages.

### 2.3 Hierarchical Navigation

Each subject has dedicated listing pages at every level:
- Subject overview (list of lessons)
- Lesson detail (list of subtopics)
- Subtopic detail (list of problems/articles)
- Individual problem/article view

---

## 3. Code & Media

### 3.1 Multi-Language Code Blocks

- Tabbed interface for switching between Python, JavaScript, Java, and C++
- Language icons displayed on tabs
- One-click copy button
- Syntax-highlighted rendering via Markdown

### 3.2 YouTube Video Embedding

- Embedded YouTube walkthroughs on problem and subtopic pages
- Accepts multiple URL formats (youtube.com, youtu.be, /shorts/, /live/, /embed/)
- Consistent neo-brutalist styling (3px border, hard shadow, 16:9 aspect ratio)

### 3.3 ImageKit Integration

- All images served through ImageKit CDN
- Automatic format selection (WebP preferred)
- Quality optimisation
- Resize and crop parameters
- Lazy loading below the fold
- 3px black border and hard shadow on all images

### 3.4 Markdown Rendering

Full Markdown renderer supporting:
- Headings (h1–h4)
- Code blocks with language labels
- Inline code
- Bold, italic, strikethrough
- Auto-linked URLs
- Images with alt text
- Pipe tables
- Blockquotes
- Ordered and unordered lists
- Task lists
- Definition lists
- Callout boxes (Note, Tip, Warning, Important, Info)
- Horizontal rules

---

## 4. Community & Social

### 4.1 Q&A Forum

Full-featured question and answer system:
- Ask questions with tag-based categorisation
- Answer questions with body formatting
- Upvote/downvote on both questions and answers
- Accepted answer marking by question author
- Moderation workflow: questions go through pending → approved/rejected by admin
- Answer approval: answers go through pending → approved/rejected by question author
- View tracking on each question
- Tag filtering
- Answer count displayed on question cards

### 4.2 User Profiles

Rich user profiles with:
- Display name and username
- Bio
- College and academic year
- Avatar with auto-generated initials fallback (14 deterministic colours)
- External platform links (LeetCode, GitHub, LinkedIn, HackerRank, CodeChef, CodeForces, Website) — each with brand icon
- Skills tags
- Follower and following counts
- Join date
- Activity feed (questions asked, answers given)

### 4.3 Social Features

- Follow/unfollow other users
- Follower count and following count displayed
- Dedicated followers listing page
- User search with filtering

### 4.4 Direct Messaging

- Inbox with conversation list
- Per-user message threads
- Send messages with auto-resizing textarea
- Enter to send, Shift+Enter for new line
- Read/unread tracking
- Delete messages
- Notification count on navbar

### 4.5 Notifications

- 5 notification types: answer received, question approved, question rejected, answer approved, answer rejected
- Unread badge count on navbar (capped at 99+)
- Individual notification marking as read
- Mark all as read
- Delete/dismiss notifications
- Polling every 30 seconds + on window focus
- Persistent dismissal across refreshes

### 4.6 Newsletter

- Email subscription form in footer
- Admin management of subscribers
- Success/error/loading states
- No-spam guarantee messaging

---

## 5. Bookmarks

- Bookmark problems and articles
- One-click bookmark toggle
- Bookmark count displayed on each item
- Personal bookmark list per user
- Unique constraint per user + target (no duplicate bookmarks)

---

## 6. User Accounts & Authentication

### 6.1 Clerk Integration

- Sign-up and sign-in via Clerk (email, Google, etc.)
- Session management handled by Clerk
- SSO callback routes
- Protected routes with Clerk `<SignedIn>` / `<SignedOut>` guards
- Admin role check via Clerk public metadata

### 6.2 Profile Management

- Edit display name, username, bio
- Upload avatar
- Add/edit external platform links
- Add/edit skills tags
- Update college and year

---

## 7. Admin Dashboard

### 7.1 Dashboard Overview

- Stats card display (counts across all content types)
- Quick-access sidebar with 4 groupings

### 7.2 Content Management

**DSA:**
- Lessons: create, edit, delete, reorder
- Subtopics: create, edit, delete within lessons
- Problems: create, edit, delete with full problem data
- Meta: manage categories (Data Structures, Algorithms, Techniques), topics (21), companies (15)

**DBMS:**
- Lessons: create, edit, delete, reorder
- Subtopics: create, edit, delete within lessons
- Problems: create, edit, delete with code blocks
- Meta: manage categories, topics (11), companies

**OS:**
- Lessons: create, edit, delete, reorder
- Subtopics: create, edit, delete within lessons
- Problems: create, edit, delete
- Meta: manage categories, topics (11), companies

**Blog:**
- Create, edit, delete blog posts
- Cover image, author, tags, read time, excerpt
- Document attachments per post

### 7.3 Community Management

- Q&A moderation: approve/reject questions
- User management: list, search, delete users
- Newsletter subscriber management

### 7.4 Media Library

- Upload images to ImageKit
- List all uploaded media
- Delete media
- ImageKit CDN delivery with transformation parameters

### 7.5 Language Management

- Add new programming languages
- Edit existing languages (name, slug, icon, image URL)
- Toggle active/inactive
- Delete languages

### 7.6 Site Configuration

- Homepage topics/cards management
- Homepage hero images
- Live stats configuration
- "Why" section content editor
- Site-wide configurable settings

---

## 8. UI & Design

### 8.1 Design System

Neo-brutalist design throughout:
- Sharp corners (no border-radius anywhere)
- 3px solid borders on all interactive elements
- Hard offset shadows (no blur)
- Solid colours, no gradients
- High contrast
- Black, white, and accent colour palette

### 8.2 Responsive Design

- Mobile: 320px+ single column
- Tablet: 640–1024px multi-column
- Desktop: 1024px+ full layout
- Navbar collapses to hamburger under 640px
- Admin sidebar collapses under 768px
- Code blocks scroll horizontally on all breakpoints
- Font sizes scale on mobile

### 8.3 Theme Support

- Light and dark mode
- Theme persisted in localStorage
- Toggle via navbar button
- All components adapt to active theme
- Smooth colour transition on theme switch

### 8.4 Component Library

20 reusable UI components:

| Component | Features |
|-----------|----------|
| Button | Primary, accent, danger, secondary variants; size options; full-width; motion animations |
| Badge | Easy/medium/hard colour-coded variants |
| Card | Default and alt variants; hover lift effect; motion animation |
| Modal | Animated overlay; header/body/footer; close button; scroll lock |
| Input | Label, error state, styled border |
| Textarea | Label, error state, styled border |
| Select | Label, options, error state |
| Avatar | Image or initials fallback; 14 deterministic colours; size variants |
| CodeBlock | Multi-language tabs; language icons; copy button |
| VideoEmbed | YouTube URL parsing and embedding |
| Image | ImageKit URL builder; lazy loading; transformation parameters |
| SearchBar | Debounced search; submit on enter |
| Pagination | Numbered pages; prev/next |
| Loader | Inline loading indicator |
| PageLoader | Full-page overlay with animated dots; rotating CS facts; progress bar |
| MarkdownRenderer | Full Markdown to React with all elements |
| SqlTable | Pipe-table rendering |
| Toast | Success/error/info variants; auto-dismiss |
| Divider | Horizontal rule |
| BrandLogo | Reusable brand logo |

---

## 9. Technical Architecture

### 9.1 Frontend

- React 18 with JSX
- Zustand for state management (20 stores)
- react-router-dom v7 for routing
- motion (framer-motion) for animations
- lucide-react + hugeicons-react for icons
- Tailwind CSS v4 with `@tailwindcss/vite`

### 9.2 Backend

- Node.js + Express v5
- MongoDB + Mongoose (25 models)
- ES Modules (no require)
- Clerk for authentication (React SDK + backend webhook verification)
- ImageKit for image storage and CDN

### 9.3 API

- 20 route files covering all features
- Public endpoints for content browsing
- Protected endpoints for authenticated actions
- Admin-only endpoints for content management
- RESTful design

### 9.4 Development Features

- Mock data toggle (`VITE_USE_MOCK`) for frontend development without a running backend
- 13 mock data collections with 44+ sample items
- Seed scripts for populating MongoDB from mock data
- Hot-reload development server
- Proxy configuration for API calls during development

---

## 10. Pages

### 10.1 Public Pages

| Page | Route |
|------|-------|
| Home | `/` |
| About | `/about` |
| DSA Listing | `/dsa` and nested lesson/subtopic/problem routes |
| DBMS Listing | `/dbms` and nested lesson/subtopic/problem routes |
| OS Listing | `/os` and nested lesson/subtopic/problem routes |
| Blog Listing | `/blog` |
| Blog Detail | `/blog/:slug` |
| Cheatsheets | `/cheatsheets` |
| Newsletter | `/newsletter` |
| Sign In | `/sign-in` |
| Sign Up | `/sign-up` |

### 10.2 Protected Pages

| Page | Route |
|------|-------|
| Q&A Listing | `/qa` |
| Q&A Detail | `/qa/:id` |
| Ask Question | `/qa/ask` |
| User Search | `/users` |
| User Profile | `/users/:username` |
| Followers | `/users/:username/followers` |
| Edit Profile | `/settings/profile` |
| Messages | `/messages` |
| Message Thread | `/messages/:userId` |

### 10.3 Admin Pages

| Page | Route |
|------|-------|
| Dashboard | `/admin` |
| Homepage Config | `/admin/homepage` |
| Topics | `/admin/topics` |
| Why Section | `/admin/why-section` |
| DSA Admin | 7 pages for lessons, subtopics, problems, meta |
| DBMS Admin | 7 pages for lessons, subtopics, problems, meta |
| OS Admin | 7 pages for lessons, subtopics, problems, meta |
| Blog Admin | 2 pages (list, edit) |
| Media | `/admin/media` |
| Users | `/admin/users` |
| Q&A Moderation | `/admin/qa` |
| Languages | `/admin/languages` |
| Newsletter | `/admin/newsletter` |

---

## 11. API Endpoints

### 11.1 Content Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/dsa` | GET | Public | List DSA lessons, subtopics, problems with filters |
| `/api/dsa/:slug` | GET | Public | Single DSA item |
| `/api/dbms` | GET | Public | List DBMS content |
| `/api/os` | GET | Public | List OS content |
| `/api/articles?category=dbms|os` | GET | Public | List articles by category |
| `/api/blog` | GET | Public | List blog posts |
| `/api/cheatsheets` | GET | Public | List cheatsheets with category/tag filters |
| `/api/cheatsheets/:slug` | GET | Public | Single cheatsheet detail |
| `/api/cheatsheets/:slug/download` | GET | Auth | Download PDF (tracks count) |

### 11.2 Q&A Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/qa` | GET | Public | List questions with filters |
| `/api/qa/:id` | GET | Public | Single question with answers |
| `/api/qa` | POST | Auth | Ask a question |
| `/api/qa/:id` | PUT | Auth | Edit own question |
| `/api/qa/:id` | DELETE | Auth | Delete question |
| `/api/qa/:id/vote` | PUT | Auth | Vote on question |
| `/api/qa/:id/answers` | POST | Auth | Post answer |
| `/api/qa/:id/answers/:aid` | PUT | Auth | Edit own answer |
| `/api/qa/:id/answers/:aid` | DELETE | Auth | Delete answer |
| `/api/qa/:id/answers/:aid/vote` | PUT | Auth | Vote on answer |
| `/api/qa/:id/answers/:aid/accept` | PUT | Auth | Accept answer |

### 11.3 Social Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/users` | GET | Auth | Search users |
| `/api/users/:username` | GET | Auth | User profile |
| `/api/users/:username` | PUT | Auth | Update own profile |
| `/api/users/:id/follow` | POST | Auth | Follow user |
| `/api/users/:id/follow` | DELETE | Auth | Unfollow user |
| `/api/messages` | GET | Auth | List conversations |
| `/api/messages/:userId` | GET | Auth | Message thread |
| `/api/messages/:userId` | POST | Auth | Send message |
| `/api/messages/:id/read` | PUT | Auth | Mark as read |
| `/api/notifications` | GET | Auth | List notifications |
| `/api/notifications/:id/read` | PUT | Auth | Mark notification read |
| `/api/notifications/read-all` | PUT | Auth | Mark all read |
| `/api/notifications/:id` | DELETE | Auth | Delete notification |

### 11.4 Bookmark Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/bookmarks` | POST | Auth | Create bookmark |
| `/api/bookmarks/:id` | DELETE | Auth | Remove bookmark |

### 11.5 Admin Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/admin/stats` | GET | Admin | Dashboard statistics |
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/seed` | POST | Admin | Seed database |
| Plus full CRUD for all content types | | Admin | |

### 11.6 Utility Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/languages` | GET | Public | List active languages |
| `/api/site-config/public` | GET | Public | Site-wide public config |
| `/api/newsletter/subscribe` | POST | Public | Subscribe email |
| `/api/media/upload` | POST | Admin | Upload to ImageKit |
| `/api/media` | GET | Admin | List media |
| `/api/media/:fileId` | DELETE | Admin | Delete media |

---

## 12. SEO & Performance

- SSR-ready architecture for content pages
- ImageKit CDN with automatic optimisation
- Lazy loading for images below the fold
- Debounced search inputs
- Minimal re-renders (React.memo on critical components)
- Lazy-loaded routes
- Consistent URL structure with slugs
- Meta tags via react-helmet-async
- robots.txt and favicon configured

---

## 13. Accessibility

- `:focus-visible` outlines on all interactive elements (4px accent ring)
- Skip-to-content link at top of every page
- Avatar `alt` text
- Code blocks with `role="region"` and `aria-label`
- Keyboard-navigable interactive elements
- High colour contrast ratios
- Labels on all form inputs
