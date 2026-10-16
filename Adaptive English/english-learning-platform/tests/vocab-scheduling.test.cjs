const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Transpile and load FSRS module directly
const fsrsPath = path.join(__dirname, '../src/lib/fsrs.ts');
const fsrsSource = fs.readFileSync(fsrsPath, 'utf8');
const fsrsCompiled = ts.transpileModule(fsrsSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const fsrsModule = { exports: {} };
new Function('module', 'exports', 'require', fsrsCompiled)(fsrsModule, fsrsModule.exports, require);
const { calculateFSRS, RATING_LABELS, LABEL_TO_RATING } = fsrsModule.exports;

// Transpile and load learning module directly
const learningPath = path.join(__dirname, '../src/lib/learning.ts');
const learningSource = fs.readFileSync(learningPath, 'utf8');
const learningCompiled = ts.transpileModule(learningSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const learningModule = { exports: {} };
const customRequire = (id) => {
  if (id === './fsrs') return fsrsModule.exports;
  return require(id);
};
new Function('module', 'exports', 'require', learningCompiled)(learningModule, learningModule.exports, customRequire);
const { isWordDue, reviewWord } = learningModule.exports;

describe('COMMAND 7: VOCABULARY VÀ FSRS SCHEDULING VERIFICATION', () => {

  test('1. FSRS Algorithmic Transitions & Ratings (ts-fsrs library)', () => {
    const now = new Date('2026-10-08T08:00:00Z');

    // Rating 1: Again -> learning, 1 day
    const againResult = calculateFSRS({
      currentState: 'new',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      rating: 1,
      lastReviewedAt: null,
      now,
    });
    assert.equal(againResult.nextState, 'learning');
    assert.equal(againResult.intervalDays, 1);
    assert.ok(againResult.nextStability > 0);

    // Rating 2: Hard -> learning, 2 days
    const hardResult = calculateFSRS({
      currentState: 'new',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      rating: 2,
      lastReviewedAt: null,
      now,
    });
    assert.equal(hardResult.nextState, 'learning');
    assert.equal(hardResult.intervalDays, 2);

    // Rating 3: Good -> reviewing, 4 days
    const goodResult = calculateFSRS({
      currentState: 'new',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      rating: 3,
      lastReviewedAt: null,
      now,
    });
    assert.equal(goodResult.nextState, 'reviewing');
    assert.equal(goodResult.intervalDays, 4);

    // Rating 4: Easy -> reviewing, 7 days
    const easyResult = calculateFSRS({
      currentState: 'new',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      rating: 4,
      lastReviewedAt: null,
      now,
    });
    assert.equal(easyResult.nextState, 'reviewing');
    assert.equal(easyResult.intervalDays, 7);
  });

  test('2. FSRS Lapses & Configurable Mastery Rules', () => {
    const now = new Date('2026-10-08T08:00:00Z');

    // Reviewing card lapsed (Rating 1 - Again)
    const lapseResult = calculateFSRS({
      currentState: 'reviewing',
      stability: 15,
      difficulty: 4.5,
      reps: 4,
      lapses: 0,
      rating: 1,
      lastReviewedAt: new Date('2026-09-20T08:00:00Z'),
      now,
    });
    assert.equal(lapseResult.nextState, 'relearning');
    assert.equal(lapseResult.lapses, 1);
    assert.equal(lapseResult.intervalDays, 1);

    // Long interval qualifies for mastery when interval >= configurable threshold (default 21 days)
    const masteredResult = calculateFSRS({
      currentState: 'reviewing',
      stability: 25,
      difficulty: 3.0,
      reps: 5,
      lapses: 0,
      rating: 4, // Easy
      lastReviewedAt: new Date('2026-09-10T08:00:00Z'),
      now,
      masteryIntervalDays: 21,
    });
    assert.equal(masteredResult.nextState, 'mastered');
    assert.ok(masteredResult.intervalDays >= 21);
  });

  test('3. Same-Day Review Anti-Double-Counting and Queue Inclusions', () => {
    const now = new Date('2026-10-08T08:00:00Z');
    const word = {
      id: 'w-test',
      state: 'reviewing',
      nextReviewDate: 'Hôm nay',
      intervalDays: 5,
      recallSuccessDays: 1,
      lastSuccessDay: '2026-10-07',
    };

    // Reviewing for the first time today
    const firstReview = reviewWord(word, 'good', now);
    assert.equal(firstReview.recallSuccessDays, 2);
    assert.equal(firstReview.state, 'reviewing');

    // Reviewing again on the SAME day: recallSuccessDays must NOT increase
    const secondReview = reviewWord(firstReview, 'good', now);
    assert.equal(secondReview.recallSuccessDays, 2, 'Same-day second review must not increment recallSuccessDays');

    // Again rating resets recallSuccessDays and marks state as relearning
    const againReview = reviewWord(secondReview, 'again', now);
    assert.equal(againReview.state, 'relearning');
    assert.equal(againReview.recallSuccessDays, 0);

    // Queue test: saved cards are NOT due
    assert.equal(isWordDue({ ...word, state: 'saved' }, now), false);
    // Overdue mastered card IS due
    assert.equal(isWordDue({ ...word, state: 'mastered', dueAt: '2026-10-07T00:00:00Z' }, now), true);
  });

  test('4. API /api/vocab: Queue Separation, Import-to-Saved, & Daily Limit', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const studentCookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    const authHeaders = studentCookie ? { Cookie: studentCookie } : {};

    const res = await fetch(`${BASE_URL}/api/vocab`, { headers: authHeaders });
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(data.queues, 'Response should contain separated queues');
    assert.ok(Array.isArray(data.queues.saved), 'queues.saved must be an array');
    assert.ok(Array.isArray(data.queues.new), 'queues.new must be an array');
    assert.ok(Array.isArray(data.queues.due), 'queues.due must be an array');
    assert.ok(Array.isArray(data.queues.reviewing), 'queues.reviewing must be an array');
    assert.ok(Array.isArray(data.queues.mastered), 'queues.mastered must be an array');
    assert.ok(Array.isArray(data.queues.relearning), 'queues.relearning must be an array');
    assert.ok(typeof data.dailyNewLimit === 'number', 'dailyNewLimit must be defined');

    // Verify imported words go to saved queue and do NOT auto-activate
    const uniqueWord = `serendipitous_${Date.now()}`;
    const importRes = await fetch(`${BASE_URL}/api/vocab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        wordsList: [
          {
            word: uniqueWord,
            phonetic: '/ˌser.ənˈdɪp.ə.təs/',
            translation: 'may mắn tình cờ',
            partOfSpeech: 'adjective',
            example: 'A serendipitous discovery.',
            exampleVi: 'Một phát hiện tình cờ may mắn.',
            topic: 'Advanced',
          }
        ]
      })
    });
    assert.equal(importRes.status, 200);
    const importData = await importRes.json();
    assert.equal(importData.success, true);

    // Check that the word is in the saved queue (state === 'saved')
    const verifyQueueRes = await fetch(`${BASE_URL}/api/vocab`, { headers: authHeaders });
    const verifyQueueData = await verifyQueueRes.json();
    const importedCard = verifyQueueData.words.find(w => w.word === uniqueWord);
    assert.ok(importedCard, `Imported word ${uniqueWord} should exist`);
    assert.equal(importedCard.state, 'saved', 'Imported word must strictly be saved, never auto-activated');
  });

  test('5. API /api/vocab/settings: 5/10/20/custom/unlimited & Mastery Rule Persistence', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const studentCookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    const authHeaders = studentCookie ? { Cookie: studentCookie } : {};

    // Update dailyNewLimit and masteryIntervalDays
    const updateRes = await fetch(`${BASE_URL}/api/vocab/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        dailyNewLimit: 15,
        masteryIntervalDays: 28,
      })
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.dailyNewLimit, 15);
    assert.equal(updateData.masteryIntervalDays, 28);

    // Verify persistence via GET /api/vocab
    const getRes = await fetch(`${BASE_URL}/api/vocab`, { headers: authHeaders });
    const getData = await getRes.json();
    assert.equal(getData.dailyNewLimit, 15);
    assert.equal(getData.masteryIntervalDays, 28);
  });

  test('6. API /api/vocab/review: FSRS Execution & VocabReviewHistory Persistence', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const studentCookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    const authHeaders = studentCookie ? { Cookie: studentCookie } : {};

    // Find or pick a card to review
    const getRes = await fetch(`${BASE_URL}/api/vocab`, { headers: authHeaders });
    const getData = await getRes.json();
    const targetCard = getData.words[0];
    assert.ok(targetCard, 'Should have at least one card to review');

    // Review with Rating 'good'
    const reviewRes = await fetch(`${BASE_URL}/api/vocab/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        wordId: targetCard.id,
        rating: 'good',
      })
    });
    assert.equal(reviewRes.status, 200);
    const reviewData = await reviewRes.json();
    assert.equal(reviewData.success, true);
    assert.ok(reviewData.userVocab, 'Should return updated userVocab');
    assert.equal(reviewData.userVocab.lastRating, 'good');
    assert.ok(reviewData.userVocab.stability > 0, 'Stability must be positive');
    assert.ok(reviewData.userVocab.difficulty > 0, 'Difficulty must be positive');
    assert.ok(reviewData.fsrsResult, 'Should return FSRS calculation result');

    // Verify persistence on reload: query again and verify fields remain
    const reloadRes = await fetch(`${BASE_URL}/api/vocab`, { headers: authHeaders });
    const reloadData = await reloadRes.json();
    const reloadedCard = reloadData.words.find(w => w.id === targetCard.id);
    assert.ok(reloadedCard, 'Card should persist on reload');
    assert.equal(reloadedCard.lastRating, 'good');
    assert.equal(reloadedCard.state, reviewData.userVocab.state);
    assert.equal(reloadedCard.intervalDays, reviewData.userVocab.intervalDays);
  });

});
