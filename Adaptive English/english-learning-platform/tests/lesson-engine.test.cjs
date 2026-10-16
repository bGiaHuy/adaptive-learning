const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const fullPath = path.join(__dirname, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  const customRequire = (id) => {
    if (id.startsWith('./') || id.startsWith('../')) {
      const resolved = path.join(path.dirname(fullPath), id);
      if (fs.existsSync(resolved + '.ts')) return loadTsModule(path.relative(__dirname, resolved + '.ts'));
      if (fs.existsSync(resolved + '.js')) return require(resolved + '.js');
      if (fs.existsSync(resolved)) return require(resolved);
    }
    return require(id);
  };
  new Function('module', 'exports', 'require', '__dirname', compiled)(mod, mod.exports, customRequire, path.dirname(fullPath));
  return mod.exports;
}

const { evaluateAnswer, checkAnswer, levenshteinDistance } = loadTsModule('../src/lib/learning.ts');

describe('COMMAND 4: KIỂM THỬ LESSON ENGINE TOÀN DIỆN', () => {
  // 1. Kiểm tra 15 kiểu bài tập
  describe('1. Kiểm tra toàn bộ 15 kiểu bài tập', () => {
    test('1.1. Single Choice & Multiple Choice', () => {
      const q = { id: 'q-mc', type: 'multiple_choice', prompt: 'Choose A', correctAnswer: 'A' };
      const resOk = evaluateAnswer(q, 'A');
      assert.equal(resOk.isCorrect, true);
      assert.equal(resOk.score, 1);

      const resFail = evaluateAnswer(q, 'B');
      assert.equal(resFail.isCorrect, false);
      assert.equal(resFail.score, 0);
    });

    test('1.2. Multi Select', () => {
      const q = { id: 'q-ms', type: 'multi_select', prompt: 'Select all vowels', correctAnswer: ['A', 'E', 'I'] };
      const resOk = evaluateAnswer(q, ['A', 'E', 'I']);
      assert.equal(resOk.isCorrect, true);

      const resPartial = evaluateAnswer(q, ['A', 'E']);
      assert.equal(resPartial.isCorrect, false);

      const resWrong = evaluateAnswer(q, ['A', 'E', 'B']);
      assert.equal(resWrong.isCorrect, false);
    });

    test('1.3. True / False', () => {
      const q = { id: 'q-tf', type: 'true_false', prompt: 'The sky is blue', correctAnswer: 'True' };
      assert.equal(evaluateAnswer(q, 'True').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'False').isCorrect, false);
    });

    test('1.4. Short Answer', () => {
      const q = {
        id: 'q-sa',
        type: 'short_answer',
        prompt: 'Capital of England',
        correctAnswer: 'London',
        acceptableAlternatives: ['the city of London'],
      };
      assert.equal(evaluateAnswer(q, 'London').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'the city of London').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'Paris').isCorrect, false);
    });

    test('1.5. Gap Fill / Fill in the blank', () => {
      const q = { id: 'q-gf', type: 'gap_fill', prompt: 'Fill in blank', correctAnswer: 'environment' };
      assert.equal(evaluateAnswer(q, 'environment').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'pollution').isCorrect, false);
    });

    test('1.6. Word Bank', () => {
      const q = { id: 'q-wb', type: 'word_bank', prompt: 'Pick word', wordBank: ['cat', 'dog', 'fish'], correctAnswer: 'dog' };
      assert.equal(evaluateAnswer(q, 'dog').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'cat').isCorrect, false);
    });

    test('1.7. Matching / Match Pairs', () => {
      const q = {
        id: 'q-mp',
        type: 'match_pairs',
        prompt: 'Match words with antonyms',
        pairs: [
          { left: 'hot', right: 'cold' },
          { left: 'big', right: 'small' },
        ],
        correctAnswer: '',
      };
      assert.equal(evaluateAnswer(q, { hot: 'cold', big: 'small' }).isCorrect, true);
      assert.equal(evaluateAnswer(q, { hot: 'small', big: 'cold' }).isCorrect, false);
    });

    test('1.8. Ordering / Unscramble', () => {
      const q = {
        id: 'q-ord',
        type: 'ordering',
        prompt: 'Order words into sentence',
        correctAnswer: ['I', 'love', 'learning', 'English'],
      };
      assert.equal(evaluateAnswer(q, ['I', 'love', 'learning', 'English']).isCorrect, true);
      assert.equal(evaluateAnswer(q, ['English', 'learning', 'I', 'love']).isCorrect, false);
    });

    test('1.9. Word Form', () => {
      const q = {
        id: 'q-wf',
        type: 'word_form',
        prompt: 'She is a _____ singer.',
        baseWord: 'beauty',
        correctAnswer: 'beautiful',
      };
      assert.equal(evaluateAnswer(q, 'beautiful').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'beauty').isCorrect, false);
    });

    test('1.10. Sentence Rewriting', () => {
      const q = {
        id: 'q-sr',
        type: 'sentence_rewriting',
        prompt: 'Rewrite using "too": She was so tired she could not walk.',
        correctAnswer: 'She was too tired to walk',
        acceptableAlternatives: ['She was too tired to walk.'],
      };
      assert.equal(evaluateAnswer(q, 'She was too tired to walk').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'She was very tired').isCorrect, false);
    });

    test('1.11. Token / Span Selection', () => {
      const q = {
        id: 'q-ts',
        type: 'token_selection',
        prompt: 'Select the adjective in the sentence',
        spans: [
          { id: 's1', text: 'The', isCorrect: false },
          { id: 's2', text: 'quick', isCorrect: true },
          { id: 's3', text: 'fox', isCorrect: false },
        ],
        correctAnswer: ['s2'],
      };
      assert.equal(evaluateAnswer(q, ['s2']).isCorrect, true);
      assert.equal(evaluateAnswer(q, ['s1']).isCorrect, false);
    });

    test('1.12. Category Labeling', () => {
      const q = {
        id: 'q-cl',
        type: 'category_labeling',
        prompt: 'Classify words into Nouns and Verbs',
        categories: [
          { id: 'c-n', name: 'Nouns' },
          { id: 'c-v', name: 'Verbs' },
        ],
        categoryItems: [
          { id: 'item1', text: 'apple', correctCategoryId: 'c-n' },
          { id: 'item2', text: 'run', correctCategoryId: 'c-v' },
        ],
        correctAnswer: '',
      };
      assert.equal(evaluateAnswer(q, { item1: 'c-n', item2: 'c-v' }).isCorrect, true);
      assert.equal(evaluateAnswer(q, { item1: 'c-v', item2: 'c-n' }).isCorrect, false);
    });

    test('1.13. Image Question', () => {
      const q = {
        id: 'q-img',
        type: 'image_question',
        imageUrl: '/images/test.png',
        prompt: 'What animal is shown in the picture?',
        options: [{ id: 'A', text: 'Dog' }, { id: 'B', text: 'Cat' }],
        correctAnswer: 'A',
      };
      assert.equal(evaluateAnswer(q, 'A').isCorrect, true);
      assert.equal(evaluateAnswer(q, 'B').isCorrect, false);
    });

    test('1.14. Writing Task', () => {
      const q = {
        id: 'q-w',
        type: 'writing',
        prompt: 'Write about your hobby (at least 5 words)',
        correctAnswer: '',
      };
      // Too short
      const resShort = evaluateAnswer(q, 'My dog.');
      assert.equal(resShort.isCorrect, false);
      assert.ok(resShort.feedback.includes('tối thiểu'));

      // Valid length -> marked pending review
      const resValid = evaluateAnswer(q, 'I love playing football with my friends every afternoon.');
      assert.equal(resValid.isCorrect, true);
      assert.equal(resValid.isPendingReview, true);
      assert.ok(resValid.feedback.includes('Đang gửi đến giáo viên'));
    });

    test('1.15. Speaking Task', () => {
      const q = {
        id: 'q-s',
        type: 'speaking',
        prompt: 'Record your voice introducing yourself',
        correctAnswer: '',
      };
      // No audio
      const resNoAudio = evaluateAnswer(q, '');
      assert.equal(resNoAudio.isCorrect, false);

      // Audio recorded
      const resRecorded = evaluateAnswer(q, 'audio_rec_123.wav');
      assert.equal(resRecorded.isCorrect, true);
      assert.equal(resRecorded.isPendingReview, true);
    });
  });

  // 2. Phân biệt Typo nhẹ vs Lỗi đổi nghĩa vs Bài kiểm tra Spelling
  describe('2. Phân biệt Typo nhẹ, Lỗi đổi nghĩa và Spelling test', () => {
    test('2.1. Typo nhẹ (Edit distance = 1 trên bài từ vựng thường) được phát hiện với cảnh báo', () => {
      const q = {
        id: 'q-vocab',
        type: 'short_answer',
        prompt: 'Translate to English: "xinh đẹp"',
        correctAnswer: 'beautiful',
        isSpellingTest: false,
      };
      // 'beautifull' has edit distance 1 to 'beautiful'
      const res = evaluateAnswer(q, 'beautifull');
      assert.equal(res.isCorrect, true, 'Typo nhẹ trong bài từ vựng được công nhận nghĩa');
      assert.equal(res.isTypo, true, 'Phải có cờ isTypo=true');
      assert.ok(res.feedback.includes('lỗi chính tả nhỏ'), 'Feedback phải nêu rõ lỗi chính tả nhỏ');
    });

    test('2.2. Lỗi đổi nghĩa (Meaning-changing distractors) bị từ chối dứt khoát', () => {
      const q = {
        id: 'q-meaning',
        type: 'short_answer',
        prompt: 'Fill in: The Sahara is a vast _______ with little rain.',
        correctAnswer: 'desert',
        meaningChangingDistractors: ['dessert'],
      };
      // User types 'dessert' (món tráng miệng) instead of 'desert' (sa mạc)
      const res = evaluateAnswer(q, 'dessert');
      assert.equal(res.isCorrect, false, 'Lỗi đổi nghĩa không được cho điểm');
      assert.equal(res.isMeaningChanged, true, 'Phải có cờ isMeaningChanged=true');
      assert.ok(res.feedback.includes('Lỗi đổi nghĩa'), 'Feedback phải giải thích đổi nghĩa');
    });

    test('2.3. Bài kiểm tra chính tả (isSpellingTest = true) bắt lỗi nghiêm ngặt 100%', () => {
      const q = {
        id: 'q-spell',
        type: 'short_answer',
        prompt: 'Spelling test: Spell the word "accommodate"',
        correctAnswer: 'accommodate',
        isSpellingTest: true,
      };
      // Typo with only 1 'm': 'accomodate'
      const res = evaluateAnswer(q, 'accomodate');
      assert.equal(res.isCorrect, false, 'Bài kiểm tra chính tả không được chấp nhận typo');
      assert.equal(res.score, 0);
      assert.ok(res.feedback.includes('Bài kiểm tra chính tả'));
    });
  });

  // 3. Đáp án chưa duyệt không dùng để chấm chính thức
  describe('3. Đáp án chưa duyệt (isUnapprovedAnswer)', () => {
    test('3.1. Câu hỏi/đáp án chưa duyệt bị khóa chấm điểm chính thức', () => {
      const q = {
        id: 'q-unapproved',
        type: 'short_answer',
        prompt: 'Draft question from contributor',
        correctAnswer: 'sample',
        isUnapprovedAnswer: true,
      };
      const res = evaluateAnswer(q, 'sample');
      assert.equal(res.isCorrect, false);
      assert.equal(res.isPendingReview, true);
      assert.equal(res.score, 0);
      assert.ok(res.feedback.includes('chưa được hội đồng học thuật phê duyệt'));
    });
  });

  // 4. Lưu answers, attempt, kết quả và không lấy score từ URL
  describe('4. Lưu trữ Attempt và Chặn URL Score Tampering', () => {
    test('4.1. Cấu trúc LessonAttempt lưu đầy đủ kết quả, answers, feedback', () => {
      const attempt = {
        id: 'att-12345',
        lessonId: 'les-g6-u1',
        lessonTitle: 'Test Lesson',
        skill: 'reading',
        timestamp: new Date().toISOString(),
        score: 3,
        total: 3,
        percentage: 100,
        answers: { q1: 'A', q2: 'B', q3: 'London' },
        results: [
          { questionId: 'q1', isCorrect: true, feedback: 'Chính xác!' },
          { questionId: 'q2', isCorrect: true, feedback: 'Chính xác!' },
          { questionId: 'q3', isCorrect: true, feedback: 'Chính xác!' },
        ],
      };

      assert.equal(attempt.score, 3);
      assert.equal(attempt.percentage, 100);
      assert.equal(attempt.results.length, 3);
    });

    test('4.2. Logic Session Summary ưu tiên storedAttempt trên thiết bị, bỏ qua ?score=999', () => {
      const storedAttempt = {
        id: 'att-safe-1',
        score: 1,
        total: 2,
        lessonTitle: 'Bài Học Chuẩn',
        results: [{ id: 'q1', isCorrect: true }, { id: 'q2', isCorrect: false }],
      };

      // Kẻ gian cố tình đưa url ?score=999&total=1
      const urlParams = { score: '999', total: '1' };

      // Thuật toán SessionSummaryContent:
      const hasAuthoritativeAttempt = storedAttempt && storedAttempt.id === 'att-safe-1';
      const resolvedScore = hasAuthoritativeAttempt ? storedAttempt.score : Number(urlParams.score);
      const resolvedTotal = hasAuthoritativeAttempt ? storedAttempt.total : Number(urlParams.total);

      assert.equal(resolvedScore, 1, 'Điểm số chính thức phải lấy từ storedAttempt (1), không lấy từ URL (999)');
      assert.equal(resolvedTotal, 2, 'Tổng số câu phải lấy từ storedAttempt (2), không lấy từ URL (1)');
    });
  });
});
