const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let code = fs.readFileSync(mockDataPath, 'utf8');

const draftUnits = [
  // Grade 6 Unit 2: My Home
  {
    id: "g6-u2-prep-01",
    skill: "reading",
    unitId: "unit-g6-u2",
    unitTitle: "Unit 2: My Home",
    courseTitle: "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Types of Houses & Rooms (Bản Thảo Đang Biên Soạn)",
    description: "Bài đọc về các kiểu nhà và đồ vật trong gia đình theo chương trình GDPT 2018.",
    durationMinutes: 15,
    targetCefr: "A1",
    status: "in_preparation",
    provenance: "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 2 (Đang biên soạn - Chờ thẩm định sư phạm)",
    questions: []
  },
  // Grade 6 Unit 3: My Friends
  {
    id: "g6-u3-prep-01",
    skill: "reading",
    unitId: "unit-g6-u3",
    unitTitle: "Unit 3: My Friends",
    courseTitle: "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Personalities and Camp Activities (Bản Thảo Đang Biên Soạn)",
    description: "Bài đọc về tính cách bạn bè và hoạt động cắm trại dã ngoại.",
    durationMinutes: 15,
    targetCefr: "A1",
    status: "in_preparation",
    provenance: "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    questions: []
  },
  // Grade 7 Unit 3: Community Service
  {
    id: "g7-u3-prep-01",
    skill: "reading",
    unitId: "unit-g7-u3",
    unitTitle: "Unit 3: Community Service",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Volunteering & Green Community Projects (Bản Thảo Đang Biên Soạn)",
    description: "Bài đọc về các dự án tình nguyện dọn rác và quyên góp sách vở cho trẻ em vùng cao.",
    durationMinutes: 15,
    targetCefr: "A2",
    status: "in_preparation",
    provenance: "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    questions: []
  },
  // Grade 8 Unit 3: Teenagers
  {
    id: "g8-u3-prep-01",
    skill: "reading",
    unitId: "unit-g8-u3",
    unitTitle: "Unit 3: Teenagers",
    courseTitle: "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Teen Pressure and Club Activities (Bản Thảo Đang Biên Soạn)",
    description: "Bài đọc về áp lực học tập và các câu lạc bộ giải tỏa căng thẳng cho lứa tuổi thanh thiếu niên.",
    durationMinutes: 15,
    targetCefr: "A2",
    status: "in_preparation",
    provenance: "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    questions: []
  },
  // Grade 9 Unit 2: City Life
  {
    id: "g9-u2-prep-01",
    skill: "reading",
    unitId: "unit-g9-u2",
    unitTitle: "Unit 2: City Life",
    courseTitle: "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Modern Metropolis Challenges (Bản Thảo Đang Biên Soạn)",
    description: "Bài đọc về những cơ hội và thách thức của cuộc sống đô thị hiện đại.",
    durationMinutes: 15,
    targetCefr: "B1",
    status: "in_preparation",
    provenance: "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 2 (Đang biên soạn - Chờ thẩm định sư phạm)",
    questions: []
  },
  // Grade 9 Unit 3: Healthy Living for Teens
  {
    id: "g9-u3-prep-01",
    skill: "reading",
    unitId: "unit-g9-u3",
    unitTitle: "Unit 3: Healthy Living for Teens",
    courseTitle: "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Mental Health and Time Management (Bản Thảo Đang Biên Soạn)",
    description: "Bài đọc về sức khỏe tinh thần và phương pháp quản lý thời gian hiệu quả cho học sinh cuối cấp.",
    durationMinutes: 15,
    targetCefr: "B1",
    status: "in_preparation",
    provenance: "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    questions: []
  }
];

const lessonInsertMarker = 'export const initialLessons: Lesson[] = [';
const lessonInsertIndex = code.indexOf(lessonInsertMarker);
if (lessonInsertIndex !== -1) {
  const lessonArrayStart = lessonInsertIndex + lessonInsertMarker.length;
  const newLessonsString = '\n' + draftUnits.map(l => '  ' + JSON.stringify(l, null, 2).replace(/\n/g, '\n  ') + ',').join('\n');
  code = code.slice(0, lessonArrayStart) + newLessonsString + code.slice(lessonArrayStart);
  console.log(`Injected ${draftUnits.length} curriculum expansion units (status: in_preparation).`);
}

fs.writeFileSync(mockDataPath, code, 'utf8');
console.log('Successfully written updated mockData.ts with curriculum expansion mapping.');
