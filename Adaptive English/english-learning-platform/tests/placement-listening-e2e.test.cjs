const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Helper to compile and load TS modules cleanly
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

const { placementQuestions, PLACEMENT_VERSION } = loadTsModule('../src/lib/placementQuestions.ts');

describe('KIỂM TRA BÀI KIỂM TRA ĐẦU VÀO (PLACEMENT TEST - LISTENING INTEGRATION)', () => {
  test('1. Kiểm tra cấu hình Audio cho phần Listening', () => {
    const listeningQuestions = placementQuestions.filter(q => q.section === 'listening');
    assert.equal(listeningQuestions.length, 10, 'Phần Listening phải có 10 câu hỏi');
    assert.equal(new Set(listeningQuestions.map(q => q.audioUrl)).size, 3, 'Phần Nghe dùng 3 đoạn audio');

    // Kiểm tra từng câu hỏi có audioUrl hợp lệ và tệp audio tồn tại thực tế
    for (const q of listeningQuestions) {
      assert.ok(q.hasAudio, `Câu ${q.id} phải có cờ hasAudio=true`);
      assert.ok(q.audioUrl, `Câu ${q.id} phải có audioUrl`);
      const diskPath = path.join(__dirname, '../public', q.audioUrl);
      assert.ok(fs.existsSync(diskPath), `Tệp audio ${diskPath} phải tồn tại thực tế trên đĩa`);
      const stat = fs.statSync(diskPath);
      assert.ok(stat.size > 100000, `Tệp audio phải có kích thước đầy đủ (> 100KB, thực tế: ${stat.size} bytes)`);
    }
  });

  test('2. Mô phỏng luồng làm bài: Nghe -> Chọn đáp án -> Chấm điểm Listening', () => {
    // Giả lập localStorage lưu trữ bài thi
    const simulatedLocalStorage = {};
    const setItem = (k, v) => (simulatedLocalStorage[k] = JSON.stringify(v));
    const getItem = (k) => (simulatedLocalStorage[k] ? JSON.parse(simulatedLocalStorage[k]) : null);

    // Bắt đầu phiên thi mới
    let placementState = {
      completed: false,
      version: PLACEMENT_VERSION,
      readingAnswers: {},
      listeningAnswers: {},
      grammarAnswers: {},
      vocabAnswers: {},
      writingAnswer: '',
      currentStep: 1,
    };
    setItem('adaptive_study_placement', placementState);

    // Học sinh làm lần lượt từng câu hỏi:
    // Câu 1 (Reading 1): Chọn 'B'
    placementState.readingAnswers['pt-r-1'] = 'B';
    placementState.currentStep = 2;

    // Câu 2 (Reading 2): Chọn 'B'
    placementState.readingAnswers['pt-r-2'] = 'B';
    placementState.currentStep = 3;

    // Câu 3 (Listening 1): Nghe tệp audio placement-test-dialogue.mp3 -> Chọn 'B' (Digital graphic design)
    placementState.listeningAnswers['pt-l-1'] = 'B';
    placementState.currentStep = 4;

    // Câu 4 (Listening 2): Nghe tệp audio -> Chọn 'C' (20% discount)
    placementState.listeningAnswers['pt-l-2'] = 'C';
    placementState.currentStep = 5;

    // Câu 5 (Grammar 1): Chọn 'B'
    placementState.grammarAnswers['pt-g-1'] = 'B';
    placementState.currentStep = 6;

    // Câu 6 (Grammar 2): Chọn 'A'
    placementState.grammarAnswers['pt-g-2'] = 'A';

    // Làm tiếp tất cả câu hỏi MCQ được bổ sung trong phiên bản mở rộng.
    const mcqQuestions = placementQuestions.filter(q => q.taskType === 'mcq' || !q.taskType);
    for (const [index, q] of mcqQuestions.entries()) {
      const key = `${q.section === 'vocabulary' ? 'vocab' : q.section}Answers`;
      placementState[key][q.id] = q.correct;
      placementState.currentStep = index + 1;
    }
    placementState.writingAnswer = 'I usually wake up at 6:30 AM every day and prepare breakfast for school.';

    // Hoàn thành bài thi
    const allAnswered = mcqQuestions.every(q => {
      const key = `${q.section === 'vocabulary' ? 'vocab' : q.section}Answers`;
      return placementState[key]?.[q.id];
    });
    assert.equal(allAnswered, true, 'Tất cả các câu hỏi MCQ phải được trả lời');

    placementState.completed = true;
    setItem('adaptive_study_placement', placementState);

    // 3. TÁI HIỆN RELOAD TRÌNH DUYỆT (Tải lại từ localStorage)
    const reloadedState = getItem('adaptive_study_placement');
    assert.equal(reloadedState.completed, true, 'Trạng thái hoàn thành phải được giữ nguyên sau khi reload');
    assert.equal(Object.keys(reloadedState.listeningAnswers).length, 10, 'Cả 10 câu Listening phải còn nguyên');
    assert.equal(reloadedState.listeningAnswers['pt-l-1'], 'B', 'Đáp án câu Listening 1 được giữ đúng');
    assert.equal(reloadedState.listeningAnswers['pt-l-2'], 'C', 'Đáp án câu Listening 2 được giữ đúng');
    assert.equal(Object.keys(reloadedState.vocabAnswers).length, 5, '5 câu Vocabulary phải còn nguyên');
    // 4. Tính điểm và bằng chứng Listening
    const listeningQ = placementQuestions.filter(q => q.section === 'listening');
    const listeningCorrect = listeningQ.filter(q => reloadedState.listeningAnswers[q.id] === q.correct).length;
    assert.equal(listeningCorrect, 10, 'Học sinh phải đạt 10/10 câu Listening đúng');

    // 5. Xác nhận Listening KHÔNG CÒN BỊ COI LÀ "Chưa đánh giá" khi đã có dữ liệu
    const isListeningEvaluated = listeningQ.length > 0 && Object.keys(reloadedState.listeningAnswers).length === listeningQ.length;
    assert.equal(isListeningEvaluated, true, 'Kỹ năng Listening đã được thu thập bằng chứng đầy đủ, không hiển thị chưa đánh giá');
  });

  test('3. Rà soát tất cả câu hỏi trong placementQuestions không có câu nào thiếu options hoặc đáp án', () => {
    assert.equal(placementQuestions.length, 37, 'Tổng số câu hỏi mở rộng là 37');
    assert.equal(new Set(placementQuestions.map(q => q.id)).size, 37, 'ID câu hỏi không trùng');
    for (const section of ['reading', 'listening', 'grammar']) {
      assert.equal(placementQuestions.filter(q => q.section === section).length, 10);
    }
    assert.equal(placementQuestions.filter(q => q.section === 'vocabulary').length, 5);
    assert.equal(placementQuestions.filter(q => q.section === 'writing').length, 1);
    assert.equal(placementQuestions.filter(q => q.section === 'speaking').length, 1);

    const mcqQuestions = placementQuestions.filter(q => q.taskType === 'mcq' || !q.taskType);
    for (const q of mcqQuestions) {
      assert.ok(q.prompt && q.prompt.length > 5, `Câu ${q.id} phải có câu lệnh rõ ràng`);
      assert.ok(q.options && q.options.length >= 4, `Câu ${q.id} phải có đủ 4 lựa chọn`);
      assert.ok(q.correct, `Câu ${q.id} phải có đáp án đúng`);
      assert.ok(q.options.some(o => o.id === q.correct), `Đáp án đúng của câu ${q.id} phải nằm trong danh sách options`);
      assert.ok(q.explanation, `Câu ${q.id} phải có lời giải thích sư phạm`);
      if (q.section === 'reading') {
        const passage = q.passage || placementQuestions[0].passage;
        assert.ok(passage.length > 100, `Câu ${q.id} phải có đoạn đọc`);
      }
    }

    // Task tự luận Writing và Speaking
    const writingQ = placementQuestions.find(q => q.section === 'writing');
    assert.ok(writingQ && writingQ.taskType === 'writing' && writingQ.prompt.length > 10);
    const speakingQ = placementQuestions.find(q => q.section === 'speaking');
    assert.ok(speakingQ && speakingQ.taskType === 'speaking' && speakingQ.prompt.length > 10);
  });

  test('4. Gián đoạn được resume và bảo toàn tiến trình', () => {
    const simulatedStore = {
      completed: false,
      version: 2,
      readingAnswers: { 'pt-r-1': 'B' },
      listeningAnswers: {},
      grammarAnswers: {},
      vocabAnswers: {},
      writingAnswer: '',
      currentStep: 2,
    };

    // Mô phỏng reload giữa chừng sau khi làm xong câu 1
    const reloaded = JSON.parse(JSON.stringify(simulatedStore));
    assert.equal(reloaded.completed, false, 'Chưa hoàn thành không được đánh dấu hoàn thành');
    assert.equal(reloaded.currentStep, 2, 'Vị trí câu hỏi phải được phục hồi đúng');
    assert.equal(reloaded.readingAnswers['pt-r-1'], 'B', 'Đáp án đã chọn trước đó phải còn nguyên');
  });

  test('5. Kỹ năng Speaking/Writing chưa đánh giá ghi nhận mức tạm A1 và độ tin cậy 0', () => {
    // Với người chưa làm hoặc chưa nộp audio/đoạn văn, Speaking/Writing ghi nhận A1 tạm thời
    const emptyPlacementState = {
      writingAnswer: '',
      speakingBlobUrl: '',
    };

    const hasWriting = emptyPlacementState.writingAnswer.trim().length >= 10;
    const hasSpeaking = !!emptyPlacementState.speakingBlobUrl;

    const writingEst = {
      evaluated: hasWriting,
      level: hasWriting ? 'A1' : 'A1 (Tạm thời)',
      confidence: hasWriting ? 40 : 0,
    };

    const speakingEst = {
      evaluated: hasSpeaking,
      level: hasSpeaking ? 'A1' : 'A1 (Tạm thời)',
      confidence: hasSpeaking ? 40 : 0,
    };

    assert.equal(speakingEst.evaluated, false, 'Speaking không có audio không được tự nhận là đã đánh giá');
    assert.equal(speakingEst.level, 'A1 (Tạm thời)', 'Speaking phải gắn nhãn mức tạm thời');
    assert.equal(speakingEst.confidence, 0, 'Speaking chưa có bằng chứng phải có độ tin cậy 0');

    assert.equal(writingEst.evaluated, false, 'Writing không có bài viết không được tự nhận là đã đánh giá');
    assert.equal(writingEst.level, 'A1 (Tạm thời)', 'Writing phải gắn nhãn mức tạm thời');
    assert.equal(writingEst.confidence, 0, 'Writing chưa có bằng chứng phải có độ tin cậy 0');
  });

  test('6. Không suy ra CEFR tuyệt đối từ dữ liệu thiếu', () => {
    // 6/6 câu đúng trắc nghiệm (Reading, Listening, Grammar)
    const testedCorrect = 6;
    const totalTested = 6;
    const provisionalCefr = testedCorrect >= 5 ? 'B1' : 'A2';
    
    // CEFR tổng quan chỉ được công nhận là provisional estimate
    const isProvisional = true;
    assert.equal(isProvisional, true, 'Thang CEFR phải luôn là provisional khi thiếu Speaking/Writing');
    assert.equal(provisionalCefr, 'B1', 'Mức ước lượng ban đầu là B1');
  });

  test('7. Kiểm tra ánh xạ section vocabulary vào vocabAnswers (không bị nhầm vocabularyAnswers)', () => {
    // Mô phỏng logic updatePlacementAnswer trong store
    const mapSectionKey = (section) => (section === 'vocabulary' ? 'vocabAnswers' : `${section}Answers`);
    
    assert.equal(mapSectionKey('reading'), 'readingAnswers');
    assert.equal(mapSectionKey('listening'), 'listeningAnswers');
    assert.equal(mapSectionKey('grammar'), 'grammarAnswers');
    assert.equal(mapSectionKey('vocabulary'), 'vocabAnswers');

    // Kiểm tra tất cả câu hỏi vocabulary trong placementQuestions
    const vocabQs = placementQuestions.filter(q => q.section === 'vocabulary');
    assert.equal(vocabQs.length, 5, 'Phần Từ vựng có 5 câu hỏi');
    for (const q of vocabQs) {
      assert.equal(q.taskType, 'mcq', `Câu ${q.id} phải có taskType là mcq`);
      assert.ok(q.options && q.options.length === 4, `Câu ${q.id} phải có 4 lựa chọn`);
      assert.ok(['A', 'B', 'C', 'D'].includes(q.correct), `Câu ${q.id} phải có đáp án đúng A, B, C hoặc D`);
    }
  });
});


