# DBMS Curriculum Content Map — v1 Launch Scope (thejobstarter)

> **Progress:** Lessons 12 of 23 seeded — 8/11/2026: categories 0–2 started (Introduction to DBMS → Normal Forms: 24 subtopics, 23 problems, 23 quizzes, 35 meta entries). Verify with `node dbms-content/verify_seed.mjs`. Content lives in `server/seeds/seedDbmsContent.js`. Lesson docs generated — 8/12/2026: `01-introduction-to-dbms.md` → `12-normal-forms-1nf-bcnf.md` via `node dbms-content/generate_docs.mjs`.

This file contains the full v1 build scope for the DBMS subject, following the same structure as the DSA and Aptitude content maps (Category → Lesson → Subtopic → Problem).

**v1 Totals:** 5 categories · 23 lessons · 46 subtopics · 43 problems
`*Theory only*` = pure concept subtopic, no problem attached.

## Categories

| Order | Category | Slug | Lessons Inside |
|---|---|---|---|
| 0 | Database Fundamentals & ER Modeling | `database-fundamentals` | Introduction to DBMS, Entity-Relationship Modeling, Extended ER Features, ER to Relational Mapping |
| 1 | Relational Model & SQL | `relational-model-sql` | Relational Model Basics, Relational Algebra & Calculus, SQL DDL & DML, SQL SELECT Queries, SQL Joins, Subqueries & Set Operations, Views & Constraints |
| 2 | Normalization & Schema Design | `normalization-schema-design` | Functional Dependencies, Normal Forms (1NF–BCNF), Higher Normal Forms, Decomposition |
| 3 | Transactions, Concurrency & Recovery | `transactions-concurrency-recovery` | Transaction Fundamentals, Concurrency Control, Advanced Concurrency Control, Recovery Techniques |
| 4 | Indexing, Query Processing & Storage | `indexing-query-processing-storage` | Storage & File Organization, Indexing, Hashing, Query Processing & Optimization |

## Full Breakdown

| Order | Category | Lesson | Subtopic | Problem |
|---|---|---|---|---|
| 0 | Database Fundamentals & ER Modeling | Introduction to DBMS | DBMS vs File System | *Theory only* |
| 0 | Database Fundamentals & ER Modeling | Introduction to DBMS | Database Architecture & Data Models | Identify the Three-Schema Architecture Level |
| 0 | Database Fundamentals & ER Modeling | Entity-Relationship Modeling | ER Diagram Basics | Identify Entities, Attributes and Relationships |
| 0 | Database Fundamentals & ER Modeling | Entity-Relationship Modeling | Relationship Types & Cardinality | Determine the Cardinality of a Relationship |
| 0 | Database Fundamentals & ER Modeling | Extended ER Features | Generalization, Specialization & Aggregation | Convert an ER Diagram with Specialization |
| 0 | Database Fundamentals & ER Modeling | Extended ER Features | Weak Entities & Keys | Identify the Weak Entity and Its Discriminator |
| 0 | Database Fundamentals & ER Modeling | ER to Relational Mapping | Mapping ER Diagrams to Tables | Convert an ER Diagram to a Relational Schema |
| 0 | Database Fundamentals & ER Modeling | ER to Relational Mapping | Mapping Constraints | Represent Cardinality Constraints in Schema |
| 1 | Relational Model & SQL | Relational Model Basics | Keys (Candidate, Primary, Foreign, Super) | Identify All Candidate Keys |
| 1 | Relational Model & SQL | Relational Model Basics | Relational Algebra Basics | Write a Relational Algebra Expression |
| 1 | Relational Model & SQL | Relational Algebra & Calculus | Set Operations in Relational Algebra | Apply Union, Intersect, and Minus |
| 1 | Relational Model & SQL | Relational Algebra & Calculus | Joins in Relational Algebra | Compute a Natural Join Result |
| 1 | Relational Model & SQL | SQL DDL & DML | CREATE, ALTER, DROP Statements | Write a CREATE TABLE Statement with Constraints |
| 1 | Relational Model & SQL | SQL DDL & DML | INSERT, UPDATE, DELETE | Write DML Statements for a Given Scenario |
| 1 | Relational Model & SQL | SQL SELECT Queries | Basic SELECT, WHERE, ORDER BY | Write a Filtered and Sorted Query |
| 1 | Relational Model & SQL | SQL SELECT Queries | Aggregate Functions & GROUP BY | Write a Query Using GROUP BY and HAVING |
| 1 | Relational Model & SQL | SQL Joins | Inner & Outer Joins | Write a Query Using an Outer Join |
| 1 | Relational Model & SQL | SQL Joins | Self Joins & Cross Joins | Write a Self-Join Query |
| 1 | Relational Model & SQL | Subqueries & Set Operations | Nested Subqueries | Write a Query Using a Correlated Subquery |
| 1 | Relational Model & SQL | Subqueries & Set Operations | UNION, INTERSECT, EXCEPT | Combine Results Using Set Operators |
| 1 | Relational Model & SQL | Views & Constraints | Views | Create and Query a View |
| 1 | Relational Model & SQL | Views & Constraints | Integrity Constraints | Identify Constraint Violations |
| 2 | Normalization & Schema Design | Functional Dependencies | Functional Dependency Basics | Determine if a Functional Dependency Holds |
| 2 | Normalization & Schema Design | Functional Dependencies | Closure of Attributes | Compute the Closure of an Attribute Set |
| 2 | Normalization & Schema Design | Normal Forms (1NF–BCNF) | 1NF, 2NF & 3NF | Normalize a Relation to 3NF |
| 2 | Normalization & Schema Design | Normal Forms (1NF–BCNF) | BCNF | Determine if a Relation is in BCNF |
| 2 | Normalization & Schema Design | Higher Normal Forms | Multivalued Dependencies & 4NF | Identify a Multivalued Dependency |
| 2 | Normalization & Schema Design | Higher Normal Forms | Join Dependencies & 5NF | *Theory only* |
| 2 | Normalization & Schema Design | Decomposition | Lossless Join Decomposition | Verify a Lossless-Join Decomposition |
| 2 | Normalization & Schema Design | Decomposition | Dependency-Preserving Decomposition | Check Dependency Preservation |
| 3 | Transactions, Concurrency & Recovery | Transaction Fundamentals | ACID Properties | Identify Which ACID Property is Violated |
| 3 | Transactions, Concurrency & Recovery | Transaction Fundamentals | Transaction States | Trace the Transaction State Diagram |
| 3 | Transactions, Concurrency & Recovery | Concurrency Control | Schedules & Serializability | Check if a Schedule is Conflict Serializable |
| 3 | Transactions, Concurrency & Recovery | Concurrency Control | Locking Protocols (Two-Phase Locking) | Apply Two-Phase Locking to a Schedule |
| 3 | Transactions, Concurrency & Recovery | Advanced Concurrency Control | Timestamp Ordering | Apply the Timestamp Ordering Protocol |
| 3 | Transactions, Concurrency & Recovery | Advanced Concurrency Control | Deadlock Detection & Prevention | Detect a Deadlock in a Wait-For Graph |
| 3 | Transactions, Concurrency & Recovery | Recovery Techniques | Log-Based Recovery | Apply ARIES Recovery Algorithm Steps |
| 3 | Transactions, Concurrency & Recovery | Recovery Techniques | Checkpoints & Shadow Paging | Determine Recovery Actions After a Checkpoint |
| 4 | Indexing, Query Processing & Storage | Storage & File Organization | File Organization Methods | Choose the Best File Organization for a Scenario |
| 4 | Indexing, Query Processing & Storage | Storage & File Organization | RAID Levels | *Theory only* |
| 4 | Indexing, Query Processing & Storage | Indexing | Single-Level & Multi-Level Indexes | Calculate the Number of Index Levels |
| 4 | Indexing, Query Processing & Storage | Indexing | B and B+ Trees | Insert Keys into a B+ Tree |
| 4 | Indexing, Query Processing & Storage | Hashing | Static Hashing | Compute the Hash Bucket for a Given Key |
| 4 | Indexing, Query Processing & Storage | Hashing | Dynamic & Extendible Hashing | Trace an Extendible Hash Table Split |
| 4 | Indexing, Query Processing & Storage | Query Processing & Optimization | Query Processing Steps | Identify the Steps in Query Execution |
| 4 | Indexing, Query Processing & Storage | Query Processing & Optimization | Query Optimization & Cost Estimation | Estimate the Cost of a Query Plan |
