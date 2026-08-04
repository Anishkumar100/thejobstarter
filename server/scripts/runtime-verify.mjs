/*
 * Runtime verification for the Aptitude subject (Phase 5.5 §12 checklist).
 * Uses the running server on :3001 + seeded aptitude content + Clerk test users.
 * Reads tokens from runtime-tokens.json (created by create-runtime-tokens.mjs).
 * Cleans up every artifact it creates (lesson, subtopic, plan, quiz, attempt, progress).
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { createClerkClient } from '@clerk/backend';
import mongoose from 'mongoose';
import User from '../models/User.js';
import CoachingCenter from '../models/CoachingCenter.js';
import AptitudeLesson from '../models/AptitudeLesson.js';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';
import AptitudeProblem from '../models/AptitudeProblem.js';
import Plan from '../models/Plan.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Progress from '../models/Progress.js';

const API = 'http://localhost:3001';
const tokens = JSON.parse(readFileSync(process.env.TEMP + '/opencode/runtime-tokens.json', 'utf8'));
const { adminToken, normalToken, adminUserId, normalUserId } = tokens;

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa');
console.log('[RV] Connected to MongoDB');

let passed = 0, failed = 0;
const results = [];
const check = (name, cond, extra = '') => {
  if (cond) { passed++; results.push(`PASS  ${name}`); }
  else { failed++; results.push(`FAIL  ${name} ${extra}`); }
};

async function api(path, { token, method = 'GET', body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  let json = null;
  const text = await res.text();
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON (CSV) */ }
  return { status: res.status, json, text };
}

/* Poll until a condition holds or timeout (used for the async cascade) */
async function poll(fn, timeoutMs = 8000, intervalMs = 400) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await fn();
    if (v) return v;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return null;
}

/* ── Setup: Clerk coordinator user + Mongo User docs + CoachingCenter ── */
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY });
let coordUser = null;
try {
  const list = await clerk.users.getUserList({ emailAddress: ['runtime-coordinator@thejobstarter.in'] });
  coordUser = list.data[0];
  if (!coordUser) {
    coordUser = await clerk.users.createUser({ emailAddress: ['runtime-coordinator@thejobstarter.in'], password: 'Rt!verif-2026-xQz', publicMetadata: { role: 'coordinator' } });
  }
  await clerk.users.updateUser(coordUser.id, { publicMetadata: { role: 'coordinator' } });
} catch (e) { console.error('coordinator setup failed:', e.message); }

const center = await CoachingCenter.findOneAndUpdate(
  { code: 'RV-CENTER' },
  { name: 'Runtime Verify Center', code: 'RV-CENTER', createdBy: new mongoose.Types.ObjectId() },
  { upsert: true, new: true }
);

const usersToSync = [
  { clerkId: adminUserId, username: 'runtime_admin', displayName: 'Runtime Admin', role: 'admin' },
  { clerkId: normalUserId, username: 'runtime_user', displayName: 'Runtime User', role: 'user' },
  ...(coordUser ? [{ clerkId: coordUser.id, username: 'runtime_coord', displayName: 'Runtime Coord', role: 'coordinator', coordinatorFor: center._id }] : [])
];
for (const u of usersToSync) {
  await User.findOneAndUpdate({ clerkId: u.clerkId }, u, { upsert: true, new: true });
}
const normalUserDoc = await User.findOne({ clerkId: normalUserId });
console.log('[RV] Setup done — center:', center._id, '| normal user doc:', normalUserDoc?._id);

/* ════════════════════════════════════════════════════════════════
 * A. Content reads
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— A. Content reads —');
{
  const lessons = await api('/api/aptitude/lessons', { token: normalToken });
  check('A1 GET lessons → 200, 5 lessons', lessons.status === 200 && lessons.json?.data?.length === 5, JSON.stringify(lessons.json?.data?.length));

  const lesson = await api('/api/aptitude/lessons/number-systems-hcf-lcm', { token: normalToken });
  check('A2 GET lesson by slug → 200, problemCount 2', lesson.status === 200 && lesson.json?.data?.problemCount === 2);

  const subs = await api('/api/aptitude/subtopics?lessonSlug=number-systems-hcf-lcm', { token: normalToken });
  check('A3 GET subtopics by lesson → 2', subs.status === 200 && subs.json?.data?.length === 2);

  const sub = await api('/api/aptitude/subtopics/hcf-lcm-basics', { token: normalToken });
  check('A4 GET subtopic by slug → 200', sub.status === 200 && !!sub.json?.data?.explanation);

  const probs = await api('/api/aptitude/problems', { token: normalToken });
  check('A5 GET problems → total 10', probs.status === 200 && probs.json?.total === 10, JSON.stringify(probs.json?.total));

  const easy = await api('/api/aptitude/problems?difficulty=easy', { token: normalToken });
  check('A6 GET problems filtered difficulty=easy → 5', easy.status === 200 && easy.json?.total === 5, JSON.stringify(easy.json?.total));

  const subProbs = await api('/api/aptitude/subtopics/hcf-lcm-basics/problems', { token: normalToken });
  check('A7 GET subtopic problems → 1', subProbs.status === 200 && subProbs.json?.data?.length === 1);

  const prob = await api('/api/aptitude/problems/hcf-lcm-two-numbers', { token: normalToken });
  const hasSolution = !!prob.json?.data?.solution && prob.json.data.solution.includes('360');
  const hasCompanies = Array.isArray(prob.json?.data?.companies) && prob.json.data.companies.includes('Infosys');
  check('A8 GET problem by slug → solution + companies present', prob.status === 200 && hasSolution && hasCompanies);

  const meta = await api('/api/aptitude-meta', { token: normalToken });
  const cats = (meta.json?.data || []).filter(m => m.type === 'category');
  check('A9 GET aptitude-meta → 22 items, 4 categories', meta.status === 200 && meta.json?.data?.length === 22 && cats.length === 4, `len=${meta.json?.data?.length}`);
}

/* ════════════════════════════════════════════════════════════════
 * B. Auth gating
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— B. Auth gating —');
{
  const noToken = await api('/api/aptitude/lessons');
  check('B1 GET lessons without token → 401', noToken.status === 401);

  const normalWrite = await api('/api/aptitude/lessons', { token: normalToken, method: 'POST', body: { title: 'x', slug: 'x', description: 'x' } });
  check('B2 POST lesson as normal user → 403', normalWrite.status === 403);

  const adminWrite = await api('/api/aptitude/lessons', {
    token: adminToken, method: 'POST',
    body: { title: 'Runtime Test Lesson', slug: 'runtime-test-lesson', description: 'temporary', category: 'quantitative', order: 99, difficulty: 'easy' }
  });
  check('B3 POST lesson as admin → 201', adminWrite.status === 201, JSON.stringify(adminWrite.status));
  const testLessonId = adminWrite.json?.data?._id;
  if (testLessonId) {
    const del = await api(`/api/aptitude/lessons/${testLessonId}`, { token: adminToken, method: 'DELETE' });
    check('B4 DELETE test lesson (cleanup) → 200', del.status === 200);
  }

  const mediaNoToken = await api('/api/media/upload', { method: 'POST', body: {} });
  check('B5 POST /api/media/upload without token → 401', mediaNoToken.status === 401);

  const mediaNormal = await api('/api/media/upload', { token: normalToken, method: 'POST', body: {} });
  check('B6 POST /api/media/upload as normal user → 403', mediaNormal.status === 403);

  const quizNoToken = await api('/api/quizzes/by-problem/AptitudeProblem/hcf-lcm-two-numbers');
  check('B7 GET quiz without token → 401', quizNoToken.status === 401);
}

/* ════════════════════════════════════════════════════════════════
 * C. Progress + theory-only auto-complete + cascade
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— C. Progress —');
let testSubtopicId = null;
{
  const badSubject = await api('/api/progress', { token: normalToken, method: 'POST', body: { subject: 'bogus', targetType: 'problem', targetSlug: 'x' } });
  check('C1 POST progress invalid subject → 400', badSubject.status === 400 && /Invalid subject/.test(badSubject.json?.error || ''));

  const mark = await api('/api/progress', { token: normalToken, method: 'POST', body: { subject: 'aptitude', targetType: 'problem', targetSlug: 'hcf-lcm-two-numbers' } });
  check('C2 POST progress subject:aptitude → 200', mark.status === 200, JSON.stringify(mark.status));

  const checked = await api('/api/progress/check-completed?subject=aptitude&targetType=problem&targetSlug=hcf-lcm-two-numbers', { token: normalToken });
  check('C3 check-completed problem → true', checked.status === 200 && checked.json?.completed === true);

  /* Cascade: completing the only problem in hcf-lcm-basics should complete subtopic → lesson */
  const cascade = await poll(async () => {
    const r = await api('/api/progress/check-completed?subject=aptitude&targetType=subtopic&targetSlug=hcf-lcm-basics', { token: normalToken });
    return r.json?.completed ? true : null;
  });
  check('C4 cascade: subtopic auto-completed after its problem', cascade === true);

  const cascadeLesson = await poll(async () => {
    const r = await api('/api/progress/check-completed?subject=aptitude&targetType=lesson&targetSlug=number-systems-hcf-lcm', { token: normalToken });
    return r.json?.completed ? true : null;
  });
  check('C5 cascade: lesson completed when all subtopics done', cascadeLesson === true);

  /* Theory-only subtopic (zero problems) → checkCompleted auto-completes it */
  const createTheory = await api('/api/aptitude/subtopics', {
    token: adminToken, method: 'POST',
    body: { title: 'Runtime Theory Only', slug: 'runtime-theory-only', description: 'temp', explanation: 'temp', lessonSlug: 'percentages-profit-loss', order: 99 }
  });
  testSubtopicId = createTheory.json?.data?._id;
  check('C6 admin creates theory-only subtopic → 201', createTheory.status === 201);

  const theoryCheck = await poll(async () => {
    const r = await api('/api/progress/check-completed?subject=aptitude&targetType=subtopic&targetSlug=runtime-theory-only', { token: normalToken });
    return r.json?.completed ? true : null;
  });
  check('C7 theory-only subtopic auto-completed (zero problems)', theoryCheck === true);

  const summary = await api('/api/progress/summary', { token: normalToken });
  const aptStat = (summary.json?.subjects || []).find(s => s.subject === 'aptitude') || (summary.json?.data || []).find(s => s.subject === 'aptitude');
  check('C8 progress summary includes aptitude', summary.status === 200 && !!aptStat, JSON.stringify(summary.json?.subjects || summary.json?.data || 'no subjects key'));
}

/* ════════════════════════════════════════════════════════════════
 * D. Quiz flow (create → student fetch → attempt → history)
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— D. Quiz flow —');
let quizId = null;
{
  const prob = await api('/api/aptitude/problems/hcf-lcm-two-numbers', { token: adminToken });
  const problemId = prob.json?.data?._id;
  check('D0 got problem _id for quiz', !!problemId);

  const created = await api('/api/quizzes', {
    token: adminToken, method: 'POST',
    body: {
      problemId, problemModel: 'AptitudeProblem',
      questions: [
        { text: 'Q1: LCM if HCF=12 and product=4320?', options: ['360', '180', '720', '120'], correctIndex: 0 },
        { text: 'Q2: dummy', options: ['a', 'b', 'c', 'd'], correctIndex: 2 }
      ]
    }
  });
  quizId = created.json?.data?._id;
  check('D1 POST /api/quizzes problemModel:AptitudeProblem → 201', created.status === 201, JSON.stringify(created.status));

  const studentQuiz = await api('/api/quizzes/by-problem/AptitudeProblem/hcf-lcm-two-numbers', { token: normalToken });
  const leaked = JSON.stringify(studentQuiz.json).includes('correctIndex');
  check('D2 student quiz fetch → 200, no correctIndex leaked', studentQuiz.status === 200 && !leaked);

  const attempt = await api(`/api/quizzes/${quizId}/attempt`, { token: normalToken, method: 'POST', body: { answers: [0, 2] } });
  check('D3 submit attempt → 200, score 100', attempt.status === 200 && attempt.json?.score === 100, JSON.stringify(attempt.json));

  const dup = await api(`/api/quizzes/${quizId}/attempt`, { token: normalToken, method: 'POST', body: { answers: [0, 2] } });
  check('D4 duplicate attempt → 409 (single-shot)', dup.status === 409);

  const attempts = await api('/api/quizzes/my-attempts', { token: normalToken });
  const mine = (attempts.json?.data || []).find(a => a.quiz?.problemModel === 'AptitudeProblem');
  check('D5 my-attempts → aptitude attempt with resolvable problem slug',
    attempts.status === 200 && !!mine && (mine.subject === 'aptitude') && mine.problemSlug === 'hcf-lcm-two-numbers',
    JSON.stringify(mine));
}

/* ════════════════════════════════════════════════════════════════
 * E. Plans
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— E. Plans —');
let planId = null;
{
  const created = await api('/api/plans', {
    token: adminToken, method: 'POST',
    body: {
      coachingCenter: center._id.toString(), name: 'Runtime Aptitude Plan', durationDays: 10,
      items: [
        { subject: 'aptitude', targetType: 'problem', targetSlug: 'hcf-lcm-two-numbers' },
        { subject: 'aptitude', targetType: 'subtopic', targetSlug: 'hcf-lcm-basics' }
      ]
    }
  });
  planId = created.json?.data?._id;
  check('E1 POST /api/plans with aptitude item → 201 (Plan enum accepts)', created.status === 201 && created.json?.data?.items?.length === 2, JSON.stringify(created.status));

  const hierarchy = await api('/api/plans/hierarchy?subject=aptitude');
  check('E2 GET plans/hierarchy?subject=aptitude → has lessons', hierarchy.status === 200 && (hierarchy.json?.data?.length || hierarchy.json?.lessons?.length) >= 5, JSON.stringify(hierarchy.status));

  const search = await api('/api/plans/content-search?subject=aptitude&q=hcf');
  const searchData = search.json?.data || search.json?.results || [];
  check('E3 GET plans/content-search?subject=aptitude → results', search.status === 200 && Array.isArray(searchData) && searchData.length > 0, JSON.stringify(search.status));

  const hierAll = await api('/api/plans/hierarchy');
  const allKeys = Object.keys(hierAll.json?.data || hierAll.json || {});
  check('E4 plans/hierarchy (all) includes aptitude', hierAll.status === 200 && allKeys.some(k => k.includes('aptitude')), allKeys.join(','));
}

/* ════════════════════════════════════════════════════════════════
 * F. Stats (admin / coordinator / CSV)
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— F. Stats —');
{
  const stats = await api('/api/admin/stats', { token: adminToken });
  const s = JSON.stringify(stats.json);
  check('F1 GET /api/admin/stats → includes aptitude', stats.status === 200 && /aptitude/i.test(s));

  const csv = await api('/api/admin/users/export', { token: adminToken });
  check('F2 GET /api/admin/users/export → CSV header includes aptitude', csv.status === 200 && /aptitude/i.test(csv.text));

  const coord = await api('/api/coordinator/stats', { token: null });
  /* coordinator needs its own token — tokens file only has admin+normal; use admin token if coordinator IS admin? No — create token for coordinator */
  void coord;
}
{
  /* Coordinator: create a test token for the coordinator user and hit stats */
  const coordList = await clerk.users.getUserList({ emailAddress: ['runtime-coordinator@thejobstarter.in'] });
  const coord = coordList.data[0];
  let coordToken = null;
  if (coord) {
    const t = await clerk.testingTokens.createTestingToken({ userId: coord.id });
    coordToken = t.token;
  }
  const coordStats = await api('/api/coordinator/stats', { token: coordToken });
  const cs = JSON.stringify(coordStats.json);
  check('F3 GET /api/coordinator/stats → 200 + includes aptitude', coordStats.status === 200 && /aptitude/i.test(cs), `status=${coordStats.status} body=${cs.slice(0, 200)}`);
}

/* ════════════════════════════════════════════════════════════════
 * G. Homepage + content surfaces
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— G. Homepage/content —');
{
  const topics = await api('/api/topics');
  const apt = (topics.json?.data || []).find(t => t.category === 'APT');
  check('G1 GET /api/topics → 5 cards incl. APT', topics.status === 200 && (topics.json?.data || []).length === 5 && !!apt, JSON.stringify((topics.json?.data || []).map(t => t.category)));
  check('G2 APT card links to /aptitude', apt?.link === '/aptitude', JSON.stringify(apt?.link));
}

/* ════════════════════════════════════════════════════════════════
 * Cleanup — delete everything created during this run
 * ════════════════════════════════════════════════════════════════ */
console.log('\n— Cleanup —');
try {
  if (testSubtopicId) await AptitudeSubtopic.deleteOne({ _id: testSubtopicId });
  if (planId) await Plan.deleteOne({ _id: planId });
  if (quizId) {
    await QuizAttempt.deleteMany({ quiz: quizId });
    await Quiz.deleteOne({ _id: quizId });
  }
  if (normalUserDoc) {
    await Progress.deleteMany({ user: normalUserDoc._id });
  }
  /* Keep the coaching center + test users (harmless in test instance) */
  console.log('[RV] Cleanup done');
} catch (e) {
  console.error('[RV] Cleanup error:', e.message);
}

console.log('\n════════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════════════');
for (const r of results) console.log(r);
await mongoose.disconnect();
process.exit(failed ? 1 : 0);
