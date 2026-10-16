const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Transpile and load aiEngine directly for pure logic assertions
const aiEnginePath = path.join(__dirname, '../src/lib/aiEngine.ts');
const aiEngineSrc = fs.readFileSync(aiEnginePath, 'utf8');
const aiEngineCompiled = ts.transpileModule(aiEngineSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const aiEngineModule = { exports: {} };
new Function('module', 'exports', 'require', aiEngineCompiled)(aiEngineModule, aiEngineModule.exports, require);
const {
  getAiProviderInfo,
  generateSocraticHint,
  evaluateWritingTask,
  evaluateSpeakingTask,
} = aiEngineModule.exports;

describe('COMMAND 8 — AI VÀ SPEAKING THẬT: VERIFICATION SUITE', () => {

  test('1. Phân biệt Real Provider / Rule-based / Mock & Bảo mật Secret', async () => {
    // 1.1. getAiProviderInfo không bao giờ lộ API key string
    const providerInfo = getAiProviderInfo();
    assert.ok(typeof providerInfo.isConfigured === 'boolean');
    assert.ok(['google-gemini', 'openai', 'none'].includes(providerInfo.provider));
    assert.equal(providerInfo.apiKey, undefined, 'Tuyệt đối không gửi key/secret ra ngoài');

    // 1.2. GET /api/ai/tutor không trả secret
    const res = await fetch(`${BASE_URL}/api/ai/tutor`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.providerInfo);
    assert.equal(body.providerInfo.apiKey, undefined);

    // 1.3. Nếu thiếu key và yêu cầu real: TUYỆT ĐỐI không trả điểm giả mạo, phải báo BLOCKED rõ ràng
    if (!providerInfo.isConfigured) {
      const realWritingEval = await evaluateWritingTask({
        content: 'This is an essay discussing the benefits and drawbacks of technology in modern high school education.',
        mode: 'real',
      });
      assert.equal(realWritingEval.status, 'blocked');
      assert.equal(realWritingEval.isBlocked, true);
      assert.equal(realWritingEval.estimatedBand, 'N/A', 'Không trả điểm giả khi thiếu real provider');
      assert.ok(realWritingEval.reason.includes('Chưa cấu hình API Key'));

      const realSpeakingEval = await evaluateSpeakingTask({
        audioUrl: '/uploads/audio/test.webm',
        duration: 45,
        audioSize: 15000,
        mode: 'real',
      });
      assert.equal(realSpeakingEval.status, 'blocked');
      assert.equal(realSpeakingEval.isBlocked, true);
      assert.equal(realSpeakingEval.estimatedBand, 'N/A');
    }

    // 1.4. Chế độ Rule-based: Gắn nhãn chuẩn xác
    const ruleWritingEval = await evaluateWritingTask({
      content: 'In modern society, education plays a vital role. Furthermore, high school students should engage in community services. However, some parents disagree. Consequently, schools must balance academics and extracurriculars.',
      mode: 'rule-based',
    });
    assert.equal(ruleWritingEval.status, 'success');
    assert.equal(ruleWritingEval.source, 'rule-based');
    assert.equal(ruleWritingEval.badge, 'Đánh giá bằng thuật toán sư phạm (Rule-based)');
    assert.ok(ruleWritingEval.rubric.taskAchievementOrCoherence > 0);

    // 1.5. Chế độ Mock / Demo: Gắn nhãn rõ ràng
    const demoWritingEval = await evaluateWritingTask({
      content: 'Sample demo content for preview.',
      mode: 'demo',
    });
    assert.equal(demoWritingEval.status, 'demo');
    assert.equal(demoWritingEval.source, 'mock');
    assert.equal(demoWritingEval.badge, 'Bản mô phỏng minh họa (Demo Preview)');
  });

  test('2. AI Tutor dùng trạng thái bài (in_progress vs review) và quyền xem đáp án', () => {
    // 2.1. Đang làm bài (in_progress): Không được tiết lộ đáp án, chỉ trả về gợi ý Socratic
    const inProgressResult = generateSocraticHint({
      skill: 'reading',
      questionPrompt: 'What is the main purpose of paragraph 2?',
      correctAnswer: 'To explain climate patterns',
      lessonStatus: 'in_progress',
      canViewAnswers: false,
    });
    assert.equal(inProgressResult.allowed, true);
    assert.equal(inProgressResult.mode, 'socratic_hint');
    assert.equal(inProgressResult.allowAnswerReveal, false);
    assert.ok(!inProgressResult.hint.includes('To explain climate patterns'), 'Socratic hint không được chứa đáp án');

    // 2.2. Sau khi nộp bài / xem lại (review / canViewAnswers=true): Trả về giải thích chi tiết
    const reviewResult = generateSocraticHint({
      skill: 'reading',
      questionPrompt: 'What is the main purpose of paragraph 2?',
      correctAnswer: 'To explain climate patterns',
      lessonStatus: 'review',
      canViewAnswers: true,
    });
    assert.equal(reviewResult.allowed, true);
    assert.equal(reviewResult.mode, 'explanatory_review');
    assert.equal(reviewResult.allowAnswerReveal, true);
    assert.ok(reviewResult.hint.includes('To explain climate patterns'), 'Explanatory review phải giải thích rõ đáp án');
  });

  test('3. Giáo viên có thể tắt hỗ trợ AI (Classroom & Assignment level)', async () => {
    // 3.1. Logic kiểm tra allowAiAssistance = false bị chặn
    const blockedHint = generateSocraticHint({
      skill: 'writing',
      questionPrompt: 'Write an essay',
      allowAiAssistance: false,
    });
    assert.equal(blockedHint.allowed, false);
    assert.equal(blockedHint.blocked, true);
    assert.ok(blockedHint.reason.includes('Giáo viên đã tắt'));

    // 3.2. Đánh giá Writing bị chặn khi giáo viên tắt AI
    const blockedWriting = await evaluateWritingTask({
      content: 'Long essay content here that would normally be evaluated.',
      allowAiAssistance: false,
    });
    assert.equal(blockedWriting.status, 'blocked');
    assert.equal(blockedWriting.isBlocked, true);
    assert.ok(blockedWriting.reason.includes('Giáo viên đã tắt'));

    // 3.3. Test API endpoint POST /api/ai/tutor với allowAiAssistance qua Assignment
    // Login as teacher để có quyền chỉnh sửa assignment
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@example.com', password: 'password123' }),
    });
    const setCookie = loginRes.headers.get('set-cookie');
    const cookie = setCookie ? setCookie.split(';')[0] : '';

    const assignRes = await fetch(`${BASE_URL}/api/assignments`, {
      headers: { Cookie: cookie },
    });
    if (assignRes.ok) {
      const assignData = await assignRes.json();
      const targetAssignment = assignData.assignments?.[0];
      if (targetAssignment) {
        // Teacher tắt AI Tutor trên assignment
        const toggleRes = await fetch(`${BASE_URL}/api/assignments/${targetAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ allowAiTutor: false }),
        });
        assert.equal(toggleRes.status, 200);
        
        // Gọi AI tutor với assignmentId bị tắt
        const tutorRes = await fetch(`${BASE_URL}/api/ai/tutor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({
            skill: 'writing',
            questionPrompt: 'Test Prompt',
            assignmentId: targetAssignment.id,
          }),
        });
        assert.equal(tutorRes.status, 403, 'Server phải trả 403 Forbidden khi giáo viên đã tắt AI');
        const tutorData = await tutorRes.json();
        assert.equal(tutorData.blocked, true);

        // Khôi phục lại allowAiTutor: true
        await fetch(`${BASE_URL}/api/assignments/${targetAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Cookie: cookie },
          body: JSON.stringify({ allowAiTutor: true }),
        });
      }
    }
  });

  test('4. Upload Audio & Xử lý Microphone, Audio rỗng, và Cleanup', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    const authHeaders = cookie ? { Cookie: cookie } : {};

    // 4.1. Từ chối upload audio rỗng (size < 500 bytes)
    const emptyFormData = new FormData();
    const emptyBlob = new Blob(['tiny'], { type: 'audio/webm' }); // ~4 bytes
    emptyFormData.append('audio', emptyBlob, 'empty.webm');

    const emptyRes = await fetch(`${BASE_URL}/api/audio/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: emptyFormData,
    });
    assert.equal(emptyRes.status, 400);
    const emptyBody = await emptyRes.json();
    assert.equal(emptyBody.code, 'AUDIO_EMPTY');

    // 4.2. Upload thành công file audio hợp lệ (> 500 bytes)
    const validFormData = new FormData();
    // Tạo 2KB audio buffer giả lập
    const fakeAudioBuffer = new Uint8Array(2048);
    for (let i = 0; i < fakeAudioBuffer.length; i++) fakeAudioBuffer[i] = i % 256;
    const validBlob = new Blob([fakeAudioBuffer], { type: 'audio/webm' });
    validFormData.append('audio', validBlob, 'real-voice.webm');

    const uploadRes = await fetch(`${BASE_URL}/api/audio/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: validFormData,
    });
    assert.equal(uploadRes.status, 200);
    const uploadBody = await uploadRes.json();
    assert.equal(uploadBody.success, true);
    assert.ok(uploadBody.url.startsWith('/uploads/audio/'));
    assert.ok(uploadBody.size >= 2048);

    // 4.3. Kiểm tra tệp thật sự đã được ghi vào đĩa
    const savedDiskPath = path.join(process.cwd(), 'public', uploadBody.url);
    assert.ok(fs.existsSync(savedDiskPath), 'Tệp âm thanh phải tồn tại trên ổ đĩa');

    // 4.4. Xử lý đánh giá speaking với audio rỗng hoặc thời lượng < 2s
    const tooShortEval = await evaluateSpeakingTask({
      audioUrl: uploadBody.url,
      duration: 1, // 1 giây -> quá ngắn
      audioSize: uploadBody.size,
      mode: 'rule-based',
    });
    assert.equal(tooShortEval.status, 'blocked');
    assert.equal(tooShortEval.isBlocked, true);
    assert.ok(tooShortEval.reason.includes('quá ngắn'));
  });

  test('5. Đánh giá Speaking thật qua API chủ động POST /api/ai/evaluate', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    const authHeaders = cookie ? { Cookie: cookie } : {};

    const validVoiceEval = await fetch(`${BASE_URL}/api/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        skill: 'speaking',
        audioUrl: '/uploads/audio/sample-test.webm',
        duration: 48, // 48 giây
        audioSize: 45000,
        mode: 'rule-based',
      }),
    });
    assert.equal(validVoiceEval.status, 200);
    const evalBody = await validVoiceEval.json();
    assert.equal(evalBody.success, true);
    assert.equal(evalBody.result.badge, 'Đánh giá bằng thuật toán sư phạm (Rule-based)');
    assert.ok(evalBody.result.estimatedBand.includes('6.5'));
    assert.ok(evalBody.result.rubric.pronunciationOrFluency >= 6.0);
    assert.ok(evalBody.result.strengthPoints.length > 0);
  });

  test('6. Đánh giá Writing thật qua API chủ động POST /api/ai/evaluate', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    const authHeaders = cookie ? { Cookie: cookie } : {};

    // 6.1. Từ chối bài viết quá ngắn (< 10 từ)
    const shortWritingRes = await fetch(`${BASE_URL}/api/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        skill: 'writing',
        content: 'Hi, this is short.',
        mode: 'rule-based',
      }),
    });
    assert.equal(shortWritingRes.status, 400);
    const shortData = await shortWritingRes.json();
    assert.equal(shortData.blocked, true);

    // 6.2. Đánh giá bài viết đầy đủ (trên 250 từ chuẩn Task 2)
    const fullEssay = `In recent decades, community service has become a topic of extensive debate among educators and policymakers worldwide. Many people strongly believe that mandatory volunteering instills vital civic responsibilities and ethical values in high school students before they transition into adulthood.

To begin with, practical volunteer activities provide teenagers with essential soft skills that cannot be acquired solely through textbook study. When students participate in environmental cleanup projects or help vulnerable elderly citizens, they cultivate effective communication, teamwork, empathy, and problem-solving abilities. Furthermore, having hands-on social experience allows young learners to broaden their horizons and appreciate their societal privileges, ultimately molding them into compassionate, conscientious citizens.

On the other hand, critics argue that compulsory service creates undue academic pressure on pupils who are already overburdened by college entrance examinations and demanding coursework. If students perceive volunteering as a rigid graduation requirement rather than a meaningful contribution, it may foster resentment and defeat the noble purpose of altruism.

In conclusion, while community engagement is undeniably beneficial, educational institutions should inspire and incentivize students through recognition awards rather than imposing coercive obligations. A balanced approach ensures genuine philanthropic enthusiasm.`;
    const fullWritingRes = await fetch(`${BASE_URL}/api/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        skill: 'writing',
        content: fullEssay,
        mode: 'rule-based',
      }),
    });
    assert.equal(fullWritingRes.status, 200);
    const fullData = await fullWritingRes.json();
    assert.equal(fullData.success, true);
    assert.equal(fullData.result.badge, 'Đánh giá bằng thuật toán sư phạm (Rule-based)');
    assert.ok(fullData.result.rubric.taskAchievementOrCoherence >= 6.0);
    assert.ok(fullData.result.strengthPoints.length > 0);
  });

});
