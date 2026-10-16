const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Transpile mockData.ts
const mockPath = path.join(__dirname, 'src/lib/mockData.ts');
let mockSrc = fs.readFileSync(mockPath, 'utf8');
// remove import from @/types
mockSrc = mockSrc.replace(/import\s+{[^}]+}\s+from\s+["']@\/types["'];?/g, '');
const compiled = ts.transpileModule(mockSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mockModule = { exports: {} };
new Function('module', 'exports', 'require', compiled)(mockModule, mockModule.exports, require);

const { initialLessons } = mockModule.exports;

console.log('=== TỔNG QUAN HỌC LIỆU TRONG HỆ THỐNG ===');
console.log('Tổng số bài học (Lessons):', initialLessons.length);

const byGrade = {};
const bySkill = {};
let totalQuestions = 0;
let questionsWithAudio = 0;
let questionsWithExplanation = 0;
let questionsWithAnswer = 0;
const questionTypes = {};
const unreadyLessons = [];

initialLessons.forEach((lesson) => {
  // Phân loại khối lớp
  let grade = 'Bổ trợ / Academic';
  if (lesson.courseTitle?.includes('Tiếng Anh 6') || lesson.id.startsWith('g6')) grade = 'Lớp 6 (Global Success)';
  else if (lesson.courseTitle?.includes('Tiếng Anh 7') || lesson.id.startsWith('g7')) grade = 'Lớp 7 (Global Success)';
  else if (lesson.courseTitle?.includes('Tiếng Anh 8') || lesson.id.startsWith('g8')) grade = 'Lớp 8 (Global Success)';
  else if (lesson.courseTitle?.includes('Tiếng Anh 9') || lesson.id.startsWith('g9')) grade = 'Lớp 9 (Global Success)';

  byGrade[grade] = (byGrade[grade] || 0) + 1;
  bySkill[lesson.skill] = (bySkill[lesson.skill] || 0) + 1;

  let isLessonReady = true;

  (lesson.questions || []).forEach((q) => {
    totalQuestions++;
    questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
    if (q.audioUrl) questionsWithAudio++;
    if (q.explanation && q.explanation.trim().length > 0) questionsWithExplanation++;
    if (q.correctAnswer !== undefined && q.correctAnswer !== null) questionsWithAnswer++;

    // Kiểm tra tính sẵn sàng của câu hỏi:
    if (q.type === 'multiple_choice' && (!q.options || q.options.length < 2)) isLessonReady = false;
    if (!q.correctAnswer && q.type !== 'speaking' && q.type !== 'writing') isLessonReady = false;
  });

  if (!isLessonReady) {
    unreadyLessons.push(lesson.id);
  }
});

console.log('\nPhân bố theo khối lớp:');
console.log(byGrade);

console.log('\nPhân bố theo 4 kỹ năng:');
console.log(bySkill);

console.log('\nThống kê câu hỏi:');
console.log('- Tổng số câu hỏi:', totalQuestions);
console.log('- Số câu hỏi có đáp án chuẩn:', questionsWithAnswer);
console.log('- Số câu hỏi có giải thích chi tiết:', questionsWithExplanation);
console.log('- Số câu hỏi có Audio track:', questionsWithAudio);
console.log('- Các dạng câu hỏi:', questionTypes);

// Kiểm tra các audio file thực tế trên ổ đĩa
const audioDir = path.join(__dirname, 'public/audio');
if (fs.existsSync(audioDir)) {
  const audioFiles = fs.readdirSync(audioDir);
  console.log('\nCác tệp Audio thực tế trong public/audio:', audioFiles.length, 'tệp:');
  console.log(audioFiles);
}

// Báo bài chưa sẵn sàng
console.log('\nBài học chưa đủ dữ liệu (Cần ẩn khỏi chấm chính thức / hiện trạng thái chưa sẵn sàng):', unreadyLessons);
