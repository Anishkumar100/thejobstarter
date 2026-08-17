# OS Learning Document — Memory Management Basics

> A comprehensive, student-friendly guide to Memory Management Basics — the foundation every OS course stands on.
> Master contiguous memory allocation, fragmentation, with exam-style problems and fully worked solutions.

---

# 12. Memory Management Basics

> **Lesson Overview:** RAM is scarce, programs are greedy. Start managing memory with contiguous allocation — partitions, dynamic holes, and the three-fit family (best, worst, first) with a full hole-tracking trace — and meet the two fragmentation monsters (internal and external) that force the invention of paging.
> - **Category:** Memory Management
> - **Difficulty:** Medium
> - **Problems:** 1

---

## 12.1 Contiguous Memory Allocation

### One Slab per Tenant

**Contiguous allocation** hands each process a single, unbroken region of memory. The OS tracks free intervals ("holes") and picks a hole for each new process.

### The Memory Layout

```
0          OS kernel (resident)
│──────────│
│  hole A  │  free 100K
│──────────│
│  P1      │  80K
│──────────│
│  hole B  │  free 300K
│──────────│
│  P2      │  50K
│──────────│
│  hole C  │  free 200K
└──────────┘
```

### The Three Fit Strategies

| Strategy | Pick | Example: request 112K on holes 100K, 500K, 200K, 300K |
|---|---|---|
| **First fit** | the FIRST hole big enough | 500K |
| **Best fit** | the SMALLEST hole big enough | 300K (leaves the smallest leftover) |
| **Worst fit** | the LARGEST hole — keep big chunks for big future requests | 500K (leaves 388K, still usable) |

| Strategy | Speed | Fragmentation behaviour |
|---|---|---|
| first fit | fastest scan | medium |
| best fit | scans all holes | LEAST external fragmentation but many tiny leftovers |
| worst fit | scans all holes | biggest leftovers each time — paradoxically can leave the most usable space |

### The Trace — Request Sequence on Holes {100, 500, 200, 300}

| Request | First fit | Best fit | Worst fit |
|---|---|---|---|
| 212K | 500K → leaves 288K | 300K → leaves 88K | 500K → leaves 288K |
| 417K | 288K is too small, 200 too, 300 too → FAILS | 288K too small… 88K… 200, 300 → FAILS | 288K too small → FAILS |

Different victims: best fit burned the 300K hole on the 212K request, leaving three small holes; first fit ate the 500K — both then fail on 417K. Moral: **hole sizes, not algorithms, doom a request.**

### The Two Kinds of Space Wasted

| Kind | Where it lives | Fix |
|---|---|---|
| **External fragmentation** | BETWEEN processes — many small unusable holes | compaction (move processes to pack holes together), or paging |
| **Internal fragmentation** | INSIDE a process's allocation (memory given extra, unused) | exact-fit sizing, or page-based allocation |

### Compaction

Move all processes towards lower addresses so the scattered holes merge:

```
BEFORE:  [P1][hole][P2][hole][P3][hole]    usable total: 60K but split
AFTER:   [P1][P2][P3][      hole 60K   ]   one BIG hole — a 55K process now fits
```

Cost: everything must be RELOCATED (base-register relocation hardware) — expensive, done only when a request cannot fit otherwise.

### Common Traps

❌ Best fit minimises leftover size, NOT "uses memory best" overall — it creates the tiniest holes and can force compaction sooner.❌ Worst fit prefers the largest hole — the leftover stays big, but the strategy is not "worst for you".❌ First fit makes 2 passes in theory (OS, then user region) — but between holes it is one scan.❌ Internal fragmentation is about the ALLOCATION being bigger than the request — the process cannot use it, and neither can anyone else.

### Quick Self-Test (answers at the bottom)

1. Best fit picks the hole that is:
(a) first in address order (b) smallest but sufficient (c) largest
2. Compaction cures:
(a) internal fragmentation (b) external fragmentation (c) paging
3. Worst fit leaves behind:
(a) the smallest leftovers (b) the largest leftovers (c) nothing
4. Holes BETWEEN processes are:
(a) internal fragmentation (b) external fragmentation (c) swapping

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 12.2 Fragmentation

### The Two Holes in Every Slab

Contiguous allocation wastes memory in exactly two ways. Knowing the difference is a guaranteed interview question.

### External Fragmentation — Cracks Between the Slabs

Total free memory is plenty, but it is SPLIT into small pieces — no single hole fits the next request.

```
[P1] [free 20K] [P2] [free 30K] [P3] [free 25K] [P4]
     total free = 75K, but a 40K process cannot fit anywhere!
```

| Real-world smell | Fixes |
|---|---|
| 60% of memory free, yet requests fail | compaction (expensive), or give up contiguity → **paging** |

### Internal Fragmentation — Wasted Space INSIDE an Allocation

Memory is given to a process in fixed multiples (say 2K units). A process needing 4.5K gets 6K — the last 1.5K is inside its slab and unusable by anyone.

```
requested: 4.5K   allocated: 6K (3 × 2K units)
[ 2K ][ 2K ][ 2K ]  ← 1.5K of the last chunk is dead weight
```

| Kind | Where | Can another process use it? | Caused by |
|---|---|---|---|
| External | between processes | no — it is in pieces | variable-size allocations + churn |
| Internal | inside an allocation | no — it is reserved | fixed-size allocation units |

### Why Paging Wipes Both Out

**Paging** splits both memory AND processes into small fixed frames (say 4K): a process's pages can live in ANY free frames — the "slab" is gone, so external fragmentation cannot form (holes merge into free-frame lists). Small leftover inside a process's last frame is bounded by one frame size — internal fragmentation shrinks to ≤ one frame per process.

| Metric | Contiguous | Paged |
|---|---|---|
| external fragmentation | happens | impossible |
| internal fragmentation | none (exact fit) | ≤ one frame per process |
| compaction needed | sometimes | never |

### Common Traps

❌ External fragmentation is a FUNCTION of variable-size allocations — fixed-size slots cannot create it.❌ Internal fragmentation is ownership: the wasted space belongs to the process, no one else may touch it.❌ Compaction fixes external, NOT internal — paging fixes both effectively.❌ "Memory is 40% free but a request fails" is the signature of external fragmentation (or of a hole list with no fitting hole).

### Quick Self-Test (answers at the bottom)

1. External fragmentation lives:
(a) between processes (b) inside a process (c) in the TLB
2. Internal fragmentation is caused by:
(a) variable allocations (b) fixed-size allocation units (c) paging
3. Paging eliminates:
(a) internal fragmentation completely (b) external fragmentation (c) both perfectly at zero cost
4. Compaction is a fix for:
(a) internal fragmentation (b) external fragmentation (c) segmentation faults

**Answers:** 1→a, 2→b, 3→b, 4→b.

---

# 13. Problems

## 13.1 Apply Best-Fit, Worst-Fit and First-Fit Allocation

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Contiguous Memory Allocation |
| **Companies** | Google, Amazon |

### Problem Statement

Memory holds free holes: 100K, 500K, 200K, 300K (in address order). Requests arrive: 212K, 417K, 112K. For EACH strategy (first fit, best fit, worst fit), show which hole satisfies each request and the hole list after every grant. Which strategies satisfy ALL THREE requests? Assume each strategy starts from the same initial holes and requests are served in order (no compaction, no merging after releases).

### Examples

| Input | Output | Explanation |
|---|---|---|
| First fit — request 212K. | Scans holes in order: 100K too small, 500K fits → 212K goes into 500K, which shrinks to 288K. Holes: [100, 288, 200, 300]. | First fit takes the FIRST hole big enough — speed comes from stopping the scan early at 500K. |
| Best fit vs worst fit for 212K. | Best fit: smallest sufficient hole = 300K → leaves 88K → [100, 500, 200, 88]. Worst fit: largest hole = 500K → leaves 288K → [100, 288, 200, 300] (same as first fit this round). | Best fit minimises the leftover (88K); worst fit maximises it (288K). Different residue — and different futures. |
| Which strategy serves all three requests? | After 212K: first/worst have [100,288,200,300]; best has [100,500,200,88]. Request 417K: first/worst scan — 288 < 417, 200 < 417, 300 < 417 → FAIL. Best: 500K fits → leaves 83K → [100,83,200,88]. Request 112K: best fit scans candidates 100 (too small), 83 (too small), 200 (fits, leaves 88), 88 (too small) → pushes 112K into 200K → [100,83,88,88]. BEST FIT serves all three; first fit and worst fit both fail the 417K request. | The order rescues best fit: it hoarded the 500K hole by using 300K for 212K, so 417K had a home. Strategy choice changes survivability, not just leftover sizes. |

### Constraints

- Each strategy restarts from the ORIGINAL hole list [100, 500, 200, 300].
- Requests are served in the given order: 212K, 417K, 112K.
- A request that no hole satisfies is rejected and never retried.

### Approach

**The Three Strategies in One Shot**

```
FIRST FIT: first hole with size ≥ request
BEST  FIT: smallest hole with size ≥ request
WORST FIT: largest hole overall (even if other holes also fit)
```

**Full Trace — Request 212K, then 417K, then 112K**

| Step | First fit | Best fit | Worst fit |
|---|---|---|---|
| initial | [100, 500, 200, 300] | same | same |
| 212K → | 500K → [100, 288, 200, 300] | 300K → [100, 500, 200, 88] | 500K → [100, 288, 200, 300] |
| 417K → | FAILS (no hole ≥ 417) | 500K → [100, 83, 200, 88] | FAILS |
| 112K → | — | 200K → [100, 83, 88, 88] | — |

Winner: **best fit** — only it keeps a large enough hole until the 417K request arrives.

**Strategy Character Sheet**

| Strategy | Scan | Leftover | Risk |
|---|---|---|---|
| first fit | stops early | medium | burns big holes early |
| best fit | full scan | smallest | many tiny unusable holes → external fragmentation |
| worst fit | full scan | largest | big process may still fail if the big hole was split |

**Common Traps**

❌ Best fit takes the SMALLEST SUFFICIENT hole — 200K would be used for 112K only if no smaller fits.❌ Worst fit takes the largest hole REGARDLESS of surplus — that is its definition.❌ Expensive fragmentation: a failing strategy leaves memory free but unusable — exactly the external-fragmentation signature.
