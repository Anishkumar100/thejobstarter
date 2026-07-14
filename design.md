# Design System — TheWebytes DSA Web

> **Style:** Gumroad-inspired Neo-Brutalism
> **Philosophy:** Raw, bold, high-contrast, meticulously crafted to look simple. Every border, shadow, and font choice is deliberate. Function over fluff.

---

## 1. Color Palette

### Base Colors

| Token           | Value     | Usage                                   |
| --------------- | --------- | --------------------------------------- |
| `--black`       | `#000000` | Text, borders, shadows, primary buttons |
| `--white`       | `#ffffff` | Page background, card backgrounds       |
| `--gray-100`    | `#f5f5f5` | Alternate card bg, input bg             |
| `--gray-300`    | `#d4d4d4` | Dividers, disabled states               |
| `--gray-500`    | `#9ca3af` | Placeholder text                        |
| `--gray-700`    | `#555555` | Muted text, secondary info              |
| `--gray-900`    | `#111111` | Body text (softer than pure black)      |

### Accent Colors

| Token           | Value     | Usage                                   |
| --------------- | --------- | --------------------------------------- |
| `--accent`      | `#ff4f00` | CTA highlights, active nav, links hover |
| `--accent-blue` | `#0066ff` | Secondary accent, info badges           |

### Difficulty Badges

| Token           | Value     | Usage            |
| --------------- | --------- | ---------------- |
| `--easy-bg`     | `#d4edda` | Easy badge bg    |
| `--easy-text`   | `#155724` | Easy badge text  |
| `--medium-bg`   | `#fff3cd` | Medium badge bg  |
| `--medium-text` | `#856404` | Medium badge text|
| `--hard-bg`     | `#f8d7da` | Hard badge bg    |
| `--hard-text`   | `#721c1d` | Hard badge text  |

### CSS Variables Block

```css
:root {
  --black: #000000;
  --white: #ffffff;
  --gray-100: #f5f5f5;
  --gray-300: #d4d4d4;
  --gray-500: #9ca3af;
  --gray-700: #555555;
  --gray-900: #111111;

  --accent: #ff4f00;
  --accent-blue: #0066ff;

  --easy-bg: #d4edda;
  --easy-text: #155724;
  --medium-bg: #fff3cd;
  --medium-text: #856404;
  --hard-bg: #f8d7da;
  --hard-text: #721c1d;

  --border-width: 3px;
  --border: 3px solid var(--black);
  --border-thin: 2px solid var(--black);
  --shadow-sm: 4px 4px 0 var(--black);
  --shadow: 6px 6px 0 var(--black);
  --shadow-lg: 8px 8px 0 var(--black);
  --shadow-hover: 10px 10px 0 var(--black);
  --radius: 0;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}
```

---

## 2. Typography

### Font Families

| Role         | Font Stack                                          |
| ------------ | --------------------------------------------------- |
| Body / Headings | `'Inter', system-ui, -apple-system, sans-serif`  |
| Code / Mono     | `'JetBrains Mono', 'Fira Code', monospace`        |

### Type Scale

| Element  | Size      | Weight | Transform   | Letter Spacing |
| -------- | --------- | ------ | ----------- | -------------- |
| `h1`     | `3rem`    | `700`  | `none`      | `-0.02em`      |
| `h2`     | `2rem`    | `700`  | `none`      | `-0.01em`      |
| `h3`     | `1.5rem`  | `600`  | `none`      | `0`            |
| `h4`     | `1.25rem` | `600`  | `uppercase` | `0`            |
| `body`   | `1rem`    | `400`  | `none`      | `0`            |
| `small`  | `0.875rem`| `400`  | `none`      | `0`            |
| `label`  | `0.75rem` | `700`  | `uppercase` | `0.05em`       |
| `code`   | `0.9rem`  | `400`  | `none`      | `0`            |

### Rules

- Headings are bold but **not** all-caps (Gumroad keeps headings readable)
- Labels and buttons ARE uppercase
- Line height: `1.6` for body, `1.2` for headings
- Max text width: `65ch` for article content
- Code blocks always use monospace font

---

## 3. Borders & Shadows

### Borders

```css
/* Standard border on all interactive elements */
border: 3px solid var(--black);

/* Thin border for badges, tags, internal dividers */
border: 2px solid var(--black);
```

### Shadows (Hard Offset — Signature Look)

```css
/* Small — inputs, small buttons */
box-shadow: 4px 4px 0 var(--black);

/* Medium — default cards, buttons */
box-shadow: 6px 6px 0 var(--black);

/* Large — featured cards, modals */
box-shadow: 8px 8px 0 var(--black);

/* Hover state — elements "lift" on hover */
box-shadow: 10px 10px 0 var(--black);
transform: translate(-2px, -2px);

/* Active/pressed — shadow disappears, element "stamps down" */
box-shadow: 2px 2px 0 var(--black);
transform: translate(2px, 2px);
```

### Rules

- **NO `border-radius`** anywhere. Everything is sharp corners.
- **NO blur** on shadows. Hard offset only. `box-shadow: Xpx Ypx 0 color`.
- **NO gradients.** Solid colors only.
- **NO soft shadows** (no `box-shadow: 0 4px 12px rgba(...)`).

---

## 4. Spacing System

Based on a `4px` grid:

| Token   | Value  | Usage                           |
| ------- | ------ | ------------------------------- |
| `xs`    | `4px`  | Tight gaps, icon spacing        |
| `sm`    | `8px`  | Small padding, inline gaps      |
| `md`    | `16px` | Default component padding       |
| `lg`    | `24px` | Card padding, section gaps      |
| `xl`    | `32px` | Section spacing                 |
| `2xl`   | `48px` | Major section breaks            |
| `3xl`   | `64px` | Page-level vertical rhythm      |

### CSS Variables

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.container-sm {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}
```

---

## 5. Component Specifications

### 5.1 Button

```
┌──────────────────────────┐
│  PRIMARY (filled)        │   bg: var(--black)
│                          │   color: var(--white)
│                          │   border: 3px solid var(--black)
│                          │   shadow: 6px 6px 0 var(--black)
│                          │   padding: 12px 24px
│                          │   font: 700, uppercase, 0.875rem
│                          │   hover: shadow 10px, translate(-2px,-2px)
│                          │   active: shadow 2px, translate(2px,2px)
└──────────────────────────┘

┌──────────────────────────┐
│  SECONDARY (outline)     │   bg: var(--white)
│                          │   color: var(--black)
│                          │   border: 3px solid var(--black)
│                          │   shadow: 6px 6px 0 var(--black)
│                          │   hover: bg var(--gray-100)
└──────────────────────────┘

┌──────────────────────────┐
│  ACCENT (orange)         │   bg: var(--accent)
│                          │   color: var(--white)
│                          │   border: 3px solid var(--black)
│                          │   shadow: 6px 6px 0 var(--black)
└──────────────────────────┘
```

### 5.2 Card

```
┌──────────────────────────────────────────────┐
│  Title                          [BADGE]      │   border: 3px solid var(--black)
│  ──────────────────────────────────────────  │   shadow: 8px 8px 0 var(--black)
│  Description text...                         │   bg: var(--white)
│                                              │   padding: 24px
│  tag · tag · tag                             │   hover: shadow 10px, translate(-2px,-2px)
│                                              │
│  ┌────────────────┐                          │
│  │  VIEW SOLUTION │                          │
│  └────────────────┘                          │
└──────────────────────────────────────────────┘
```

### 5.3 Badge / Tag

```
EASY          MEDIUM         HARD          AMAZON
┌──────────┐  ┌──────────┐   ┌──────────┐  ┌──────────┐
│  EASY    │  │  MEDIUM  │   │  HARD    │  │  AMAZON  │
└──────────┘  └──────────┘   └──────────┘  └──────────┘

Difficulty badges:
  bg: difficulty color, text: difficulty text color
  border: 2px solid var(--black)
  padding: 4px 12px
  font: 700, uppercase, 0.75rem

Company/topic tags:
  bg: var(--gray-100), text: var(--black)
  border: 2px solid var(--black)
  padding: 4px 12px
  font: 400, 0.75rem
```

### 5.4 Input

```
┌──────────────────────────────────────────────┐
│  LABEL (uppercase, 0.75rem, 700)             │
│  ┌──────────────────────────────────────────┐│
│  │  placeholder text...                     ││   border: 3px solid var(--black)
│  │                                          ││   bg: var(--white)
│  └──────────────────────────────────────────┘│   padding: 12px 16px
│                                              │   font: var(--font-sans), 1rem
│                                              │   focus: outline: 4px solid var(--accent)
│                                              │   no border-radius
└──────────────────────────────────────────────┘
```

### 5.5 Navbar

```
┌──────────────────────────────────────────────────────────────────┐
│  THEWEBYTES  │  DSA  │  DBMS  │  OS  │  BLOG  │   [SEARCH] [👤] │
│  ──────────────────────────────────────────────────────────────  │
│  border-bottom: 4px solid var(--black)                           │
│  bg: var(--white)                                                │
│  height: 64px                                                    │
│  links: uppercase, 0.875rem, 700                                 │
│  active link: underline 3px var(--black) or bg pill var(--black) │
│  hover: color var(--accent)                                      │
└──────────────────────────────────────────────────────────────────┘
```

### 5.6 Avatar

```
┌──────────┐
│          │   width: 80px, height: 80px
│   IMG    │   border: 3px solid var(--black)
│          │   border-radius: 0 (square, NOT circle)
│          │   object-fit: cover
└──────────┘
```

### 5.7 Code Block

Language tabs at the top switch between solutions. The language list comes from the Language model (admin-managed).

```
┌──────────────────────────────────────────────────────┐
│  PYTHON  JAVA  C++  JAVASCRIPT        [COPY]         │   header bar uses Language Picker tabs
│  ──────────────────────────────────────────────────  │   bg: var(--black)
│  def twoSum(nums, target):                           │   color: var(--white)
│      seen = {}                                       │   font: 0.75rem, uppercase
│      for i, n in enumerate(nums):                    │
│          complement = target - n                     │   body:
│          if complement in seen:                      │   bg: var(--gray-900) (#111)
│              return [seen[complement], i]            │   color: var(--white)
│          seen[n] = i                                │   font: var(--font-mono), 0.9rem
│                                                      │   padding: 16px
│                                                      │   overflow-x: auto
└──────────────────────────────────────────────────────┘
```

### 5.8 Modal

```
                    ┌──────────────────────────────────┐
                    │  MODAL TITLE              [X]    │   border: 3px solid var(--black)
                    │  ──────────────────────────────  │   shadow: 8px 8px 0 var(--black)
                    │                                  │   bg: var(--white)
                    │  Modal content...                │   padding: 24px
                    │                                  │   max-width: 500px
                    │  ┌────────────┐  ┌────────────┐ │   position: fixed, centered
                    │  │  CANCEL    │  │  CONFIRM   │ │   backdrop: rgba(0,0,0,0.5)
                    │  └────────────┘  └────────────┘ │
                    └──────────────────────────────────┘
```

### 5.9 Divider

```css
.divider {
  border: none;
  border-top: 2px solid var(--black);
  margin: var(--space-xl) 0;
}
```

### 5.10 YouTube Embed

```
┌──────────────────────────────────────────────────────┐
│                                                      │   border: 3px solid var(--black)
│                  [YouTube iframe]                    │   shadow: 6px 6px 0 var(--black)
│                                                      │   aspect-ratio: 16/9
│                                                      │   width: 100%
└──────────────────────────────────────────────────────┘
  Caption below: var(--gray-700), 0.875rem, italic
```

### 5.11 Image

```
┌──────────────────────────────────────────────────────┐
│                                                      │   border: 3px solid var(--black)
│                  [Admin-uploaded image]              │   shadow: 6px 6px 0 var(--black)
│                                                      │   max-width: 100%
│                                                      │   height: auto
└──────────────────────────────────────────────────────┘
  Caption below: var(--gray-700), 0.875rem, italic
```

### 5.12 Language Picker

Tab-style selector for switching code languages on problem detail pages.

```
┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐
│  PYTHON    │ │ JAVASCRIPT │ │   JAVA   │ │    C++     │
└────────────┘ └────────────┘ └──────────┘ └────────────┘

Active tab:
  bg: var(--black), color: var(--white)
  border: 2px solid var(--black)
  font: 700, uppercase, 0.75rem, var(--font-mono)
  padding: 8px 16px

Inactive tab:
  bg: var(--gray-100), color: var(--gray-700)
  border: 2px solid var(--black)
  hover: bg var(--gray-300)

All tabs: sharp corners, no gaps between tabs (adjacent borders touch)
```

---

## 6. Page Layouts

### 6.1 Home Page

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  HERO SECTION                                           │ │
│  │  bg: var(--white), border-bottom: 4px solid var(--black)│ │
│  │                                                         │ │
│  │  MASTER PLACEMENTS.          (h1, 3rem, 700)           │ │
│  │  CRACK THE CODE.            (h1, 3rem, 700)            │ │
│  │  LAND YOUR DREAM JOB.       (h1, 3rem, 700)            │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐                    │ │
│  │  │ BROWSE DSA   │  │ JOIN COMMUNITY│                    │ │
│  │  └──────────────┘  └──────────────┘                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  DSA     │  │  DBMS    │  │   OS     │  │  BLOG    │     │
│  │  180+    │  │  45+     │  │  40+     │  │  25+     │     │
│  │  problems│  │  articles│  │  articles│  │  posts   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                               │
│  FEATURED PROBLEMS                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Problem Card │  │ Problem Card │  │ Problem Card │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  © 2026 THEWEBYTES. ALL RIGHTS RESERVED.                     │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Content Listing (DSA / DBMS / OS)

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                       │
├──────────────────────────────────────────────────────────────┤
│  DSA PROBLEMS                              [🔍 Search]       │
│  ──────────────────────────────────────────────────────────  │
│  [All] [Easy] [Medium] [Hard]   [Company ▼]   [Topic ▼]     │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  1. Two Sum                              EASY  ▲ 1.2k│    │
│  │     Arrays · Hashing · Amazon · Google · Meta       │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  2. Reverse Linked List                 EASY  ▲ 890 │    │
│  │     Linked List · Microsoft · Apple                 │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  3. Longest Substring                   MEDIUM ▲ 2.1k│   │
│  │     Sliding Window · Amazon · Google · Adobe        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  [< 1  2  3  ...  12  >]                                    │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Detail Page (Problem / Article)

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                       │
├──────────────────────────────────────────────────────────────┤
│  ← Back to DSA                                               │
│                                                               │
│  Two Sum                                    [EASY]  ▲ 1.2k   │
│  Amazon · Google · Meta · Microsoft                          │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  VIDEO WALKTHROUGH                                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              [YouTube Embed]                          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  PROBLEM STATEMENT                                           │
│  Given an array of integers nums and an integer target...    │
│                                                               │
│  EXAMPLES                                                    │
│  Input:  nums = [2,7,11,15], target = 9                      │
│  Output: [0,1]                                               │
│                                                               │
│  APPROACH                                                    │
│  Use a hash map to store seen elements...                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  [Diagram Image — admin uploaded]                    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  SOLUTION                                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Python  Java  C++  JavaScript         [COPY]         │    │
│  │ ───────────────────────────────────────────────────  │    │
│  │ def twoSum(nums, target):                            │    │
│  │     seen = {}                                        │    │
│  │     ...                                              │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  COMPLEXITY: Time O(n) · Space O(n)                          │
│                                                               │
│  RELATED PROBLEMS                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Three   │ │  Four    │ │  Hash    │                     │
│  │  Sum     │ │  Sum II  │ │  Map     │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
└──────────────────────────────────────────────────────────────┘
```

### 6.4 User Profile

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────┐  @rahuldev                       [FOLLOW]        │
│  │        │  ─────────────────────────────────────────────  │
│  │ AVATAR │  234 followers · 156 following · Joined Jan 2026│
│  │ 80px   │                                                  │
│  │ square │  "CS senior. FAANG-bound. Love graphs & DP."    │
│  └────────┘                                                  │
│                                                               │
│  EXTERNAL LINKS                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ LEETCODE │ │ GITHUB   │ │ HRANK    │ │ CODEFORCES│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                               │
│  SKILLS                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐                    │
│  │ DSA  │ │React │ │Python│ │ System   │                    │
│  └──────┘ └──────┘ └──────┘ │ Design   │                    │
│                             └──────────┘                    │
│  ACTIVITY                                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ● Asked "What is LRU Cache?" in OS · 2d ago          │    │
│  │ ● Answered "Two Sum" in DSA · 5d ago                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
└──────────────────────────────────────────────────────────────┘
```

### 6.5 Admin Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR (with ADMIN badge)                                   │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│  SIDEBAR      │  DASHBOARD                                   │
│  ─────────    │  ──────────────────────────────────────     │
│  > Overview   │                                              │
│    DSA        │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│    DBMS       │  │ 180    │ │ 45     │ │ 40     │ │ 1.2k   ││
│    OS         │  │ PROBLEMS│ │ DBMS   │ │ OS     │ │ USERS  ││
│    Blog       │  └────────┘ └────────┘ └────────┘ └────────┘│
│    Media      │                                              │
│    Users      │  RECENT CONTENT                             │
│    Q&A        │  ┌──────────────────────────────────────┐   │
│               │  │ Two Sum          EASY   2h ago       │   │
│  ─────────    │  │ SQL Joins        BEGINNER 5h ago     │   │
│  [+ New DSA]  │  │ FCFS Scheduling  BEGINNER 1d ago     │   │
│  [+ New DBMS] │  └──────────────────────────────────────┘   │
│  [+ New OS]   │                                              │
│  [+ New Blog] │                                              │
│               │                                              │
├───────────────┴──────────────────────────────────────────────┤
│  FOOTER                                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Responsive Breakpoints

| Name     | Width     | Behavior                                    |
| -------- | --------- | ------------------------------------------- |
| Mobile   | `< 640px`  | Single column, stacked cards, hamburger nav |
| Tablet   | `640–1024px` | 2-column grids, condensed nav              |
| Desktop  | `> 1024px` | Full layout, multi-column grids             |

### Rules

- Cards: `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`
- Navbar collapses to hamburger under 640px
- Admin sidebar collapses under 768px
- Code blocks: `overflow-x: auto` on all breakpoints
- Font sizes scale down 20% on mobile

---

## 8. Footer (TheWebytes Branding)

```
┌──────────────────────────────────────────────────────────────┐
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  THEWEBYTES              RESOURCES         CONNECT           │
│  Master placements       DSA Problems      Twitter           │
│  Crack the code          DBMS Articles     GitHub            │
│  Land your dream job     OS Articles       LinkedIn          │
│                          Blog              Newsletter        │
│                          Cheatsheets                         │
│                                                               │
│  ──────────────────────────────────────────────────────────  │
│  © 2026 THEWEBYTES. ALL RIGHTS RESERVED.                     │
│  BUILT WITH BRUTALISM. POWERED BY MERN.                      │
└──────────────────────────────────────────────────────────────┘

Footer styling:
  border-top: 4px solid var(--black)
  bg: var(--white) or var(--black) with white text
  padding: 48px 24px
  links: uppercase, 0.75rem, hover: var(--accent)
```

---

## 9. Animations & Transitions

Keep minimal. Neo-brutalism is about being direct.

| Element   | Transition                                      |
| --------- | ----------------------------------------------- |
| Button hover | `transform 0.15s ease, box-shadow 0.15s ease` |
| Card hover   | `transform 0.15s ease, box-shadow 0.15s ease` |
| Modal open   | `opacity 0.2s ease`                             |
| Page load    | None (instant, no fade-in)                      |
| Dropdowns    | None (instant show/hide)                        |

**NO** spinners, **NO** skeleton shimmer, **NO** parallax. If loading, show text "LOADING..." in monospace.

---

## 10. Accessibility

Despite the raw aesthetic, accessibility is non-negotiable:

- All interactive elements have `:focus-visible` with `outline: 4px solid var(--accent)`
- Color contrast ratio minimum `7:1` (AAA) for body text
- Buttons have `aria-label` where icon-only
- Images have `alt` text
- Code blocks have `role="region"` and `aria-label`
- Keyboard navigation works for all interactive elements
- Skip-to-content link at top of every page

---

## 11. ImageKit Integration

All images are served through ImageKit for optimization:

```html
<!-- Original upload -->
<img src="https://ik.imagekit.io/thewebytes/uploads/two-sum-diagram.webp" />

<!-- With transformations (auto-format, auto-quality, resize) -->
<img
  src="https://ik.imagekit.io/thewebytes/uploads/two-sum-diagram.webp?tr=w-800,h-600,fo-auto,q-80,f-webp"
  alt="Two Sum hash map visualization"
/>
```

### Rules

- All `<img>` tags get `border: 3px solid var(--black)` and `box-shadow: 6px 6px 0 var(--black)`
- Use `loading="lazy"` on all images below the fold
- ImageKit URL builder in `client/src/utils/imageKit.js`
- Admin uploads via ImageKit SDK, stores returned URL in MongoDB
