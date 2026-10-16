export type PlacementSection = "reading" | "listening" | "grammar" | "vocabulary" | "writing" | "speaking";

export interface TestQuestion {
  id: string;
  section: PlacementSection;
  sectionTitle: string;
  passage?: string;
  hasAudio?: boolean;
  audioUrl?: string;
  prompt: string;
  /** Multiple-choice options — absent for writing/speaking tasks */
  options?: { id: string; text: string }[];
  /** Correct option key — absent for writing/speaking tasks */
  correct?: string;
  explanation?: string;
  /** writing | speaking task type */
  taskType?: "mcq" | "writing" | "speaking";
  /** Suggested word count / time guide shown to the student */
  taskGuide?: string;
}

export const PLACEMENT_VERSION = 4;

function mcq(
  section: PlacementSection,
  number: number,
  prompt: string,
  choices: [string, string, string, string],
  correct: string,
  explanation: string,
  source?: string,
): TestQuestion {
  const titles: Record<PlacementSection, string> = {
    reading: "Phần 1: Đọc hiểu (Reading)",
    listening: "Phần 2: Nghe hiểu (Listening)",
    grammar: "Phần 3: Ngữ pháp (Grammar)",
    vocabulary: "Phần 4: Từ vựng (Vocabulary)",
    writing: "Phần 5: Viết (Writing)",
    speaking: "Phần 6: Nói (Speaking)",
  };
  return {
    id: `pt-${section[0]}-${number}`,
    section,
    sectionTitle: titles[section],
    taskType: "mcq",
    prompt,
    options: choices.map((text, index) => ({ id: "ABCD"[index], text })),
    correct,
    explanation,
    ...(section === "reading" ? { passage: source } : {}),
    ...(section === "listening" ? { hasAudio: true, audioUrl: source } : {}),
  };
}

// ── Reading passages ──────────────────────────────────────────────────────────
const clubPassage =
  "Hi Sam, our school gardening club meets every Wednesday after lessons, from 3:30 to 4:30 p.m. We grow vegetables behind the library and donate some of them to the school kitchen. You don't need any gardening experience to join. Please bring a hat and a bottle of water. If it rains, we meet in Room 12 to plan our next activities. You can sign up by emailing Ms Green before Tuesday evening. — Mia";
const libraryPassage =
  "Last year, Riverside Library extended its opening hours after a survey showed that many residents could only visit after work. It now stays open until 8 p.m. on weekdays. The library also introduced a free tool-lending service: members can borrow items such as drills and gardening tools for up to seven days. The aim is to help people save money and reduce waste by sharing equipment they rarely use. Although the service has proved popular, staff ask members to reserve tools online because there are only a few of each item. Tools must be returned to the service desk rather than placed in the book-return box.";

const extraReading: TestQuestion[] = [
  mcq("reading", 3, "When does the gardening club meet?", ["Tuesday morning", "Wednesday after lessons", "Friday lunchtime", "Saturday afternoon"], "B", "Câu lạc bộ họp thứ Tư sau giờ học, từ 3:30 đến 4:30.", clubPassage),
  mcq("reading", 4, "What should Sam bring to the club?", ["Vegetables and a notebook", "A gardening tool and a bag", "A hat and a bottle of water", "A library card and an umbrella"], "C", "Mia dặn mang theo mũ và một chai nước.", clubPassage),
  mcq("reading", 5, "What happens if it rains?", ["The club meets indoors to plan activities.", "Everyone goes to the school kitchen.", "The club cancels all future meetings.", "Members work outside as usual."], "A", "Khi trời mưa, thành viên gặp ở phòng 12 để lên kế hoạch.", clubPassage),
  mcq("reading", 6, "Who can join the gardening club?", ["Only students who own a garden", "Only students who can cook", "Only experienced gardeners", "Students with or without gardening experience"], "D", "You don't need any gardening experience nghĩa là không cần kinh nghiệm để tham gia.", clubPassage),
  mcq("reading", 7, "Why did Riverside Library extend its opening hours?", ["Its staff wanted to work only at night.", "Many residents were available only after work.", "All books had to be returned in the evening.", "The tool service was closed during the day."], "B", "Khảo sát cho thấy nhiều cư dân chỉ có thể đến sau giờ làm.", libraryPassage),
  mcq("reading", 8, "What is one aim of the tool-lending service?", ["To sell new equipment to every member", "To replace the library's book collection", "To help people save money by sharing equipment", "To teach staff how to repair tools"], "C", "Chia sẻ dụng cụ ít dùng giúp tiết kiệm tiền và giảm lãng phí.", libraryPassage),
  mcq("reading", 9, "Why are members asked to reserve tools online?", ["There is a limited number of each tool.", "Online reservations cost less than borrowing.", "Tools can only be used inside the library.", "The service desk no longer accepts returns."], "A", "Thư viện chỉ có một vài dụng cụ mỗi loại, nên cần đặt trước.", libraryPassage),
  mcq("reading", 10, "Which action follows the library's rules?", ["Keeping a borrowed drill for a month", "Leaving a tool in the book-return box", "Borrowing tools without library membership", "Returning a borrowed tool to the service desk within seven days"], "D", "Thành viên mượn tối đa bảy ngày và trả dụng cụ tại quầy dịch vụ.", libraryPassage),
];

// ── Listening questions ───────────────────────────────────────────────────────
const extraListening: TestQuestion[] = [
  mcq("listening", 3, "Why does the woman not enrol in the photography workshop?", ["It is fully booked.", "It has been cancelled.", "It is too expensive.", "It takes place on Thursday."], "A", "Người tư vấn nói lớp nhiếp ảnh đã đầy: currently fully booked.", "/audio/placement-test-dialogue.mp3"),
  mcq("listening", 4, "What time does the digital graphic design class run?", ["9 a.m. to 11 a.m.", "1 p.m. to 3 p.m.", "4 p.m. to 6 p.m.", "2 p.m. to 4 p.m."], "D", "Lớp diễn ra chiều thứ Năm từ two to four PM.", "/audio/placement-test-dialogue.mp3"),
  mcq("listening", 5, "Listen to the study-room conversation: Why does the student want to reserve a room?", ["To attend a chemistry lesson", "To work on a group economics project", "To interview a librarian", "To practise for an art exhibition"], "B", "Sinh viên đặt phòng cho dự án nhóm môn kinh tế.", "/audio/study-room-dialogue.mp3"),
  mcq("listening", 6, "Which room is available for the group?", ["Room 204", "Room 403", "Room 304", "Room 302"], "C", "Nhân viên xác nhận Room 304 còn trống từ 2 đến 4 giờ chiều.", "/audio/study-room-dialogue.mp3"),
  mcq("listening", 7, "What must the student bring to activate the room's electronic door lock?", ["A student ID card", "A printed project report", "A library book", "A notebook"], "A", "Sinh viên cần mang thẻ sinh viên để kích hoạt khóa cửa điện tử.", "/audio/study-room-dialogue.mp3"),
  mcq("listening", 8, "Listen to the library conversation: When is the student's orientation appointment?", ["Monday at 9 a.m.", "Monday at 2:30 p.m.", "Wednesday at 9 a.m.", "Wednesday at 2:30 p.m."], "D", "Sinh viên chọn lịch chiều thứ Tư lúc 2:30.", "/audio/library-appointment.mp3"),
  mcq("listening", 9, "Why can the student not attend the Monday morning session?", ["He has an economics project meeting.", "He has an advanced chemistry laboratory.", "He is working at the library.", "He has a photography workshop."], "B", "Sinh viên có buổi thực hành hóa học nâng cao vào sáng thứ Hai.", "/audio/library-appointment.mp3"),
  mcq("listening", 10, "Which floor has the quiet archive?", ["The ground floor", "The second floor", "The fourth floor", "The third floor"], "C", "Kho lưu trữ yên tĩnh ở tầng bốn: fourth floor quiet archive.", "/audio/library-appointment.mp3"),
];

// ── Grammar questions ─────────────────────────────────────────────────────────
const extraGrammar: TestQuestion[] = [
  mcq("grammar", 3, "Choose the correct option: 'My brother ___ to school by bus every day.'", ["go", "going", "goes", "gone"], "C", "Thói quen dùng hiện tại đơn; chủ ngữ số ít my brother đi với goes."),
  mcq("grammar", 4, "Choose the correct option: 'There isn't ___ milk left in the fridge.'", ["many", "a few", "an", "any"], "D", "Milk không đếm được; câu phủ định dùng any."),
  mcq("grammar", 5, "Choose the correct option: 'Look! The children ___ football in the park.'", ["are playing", "play", "played", "have played"], "A", "Look! chỉ hành động đang diễn ra, dùng hiện tại tiếp diễn are playing."),
  mcq("grammar", 6, "Choose the correct option: 'This exercise is ___ than the one we did yesterday.'", ["easy", "easier", "easiest", "easily"], "B", "So sánh hai bài tập dùng easier than."),
  mcq("grammar", 7, "Choose the correct option: 'We ___ in this town since 2020.'", ["live", "are living", "lived", "have lived"], "D", "Since 2020 chỉ trạng thái kéo dài đến hiện tại, dùng have lived."),
  mcq("grammar", 8, "Choose the correct option: 'The new bridge ___ last year.'", ["builds", "has built", "was built", "is building"], "C", "Cầu được xây năm ngoái: bị động quá khứ đơn was built."),
  mcq("grammar", 9, "Choose the best word: 'Please ___ your homework before Friday's lesson.'", ["submit", "borrow", "invite", "repair"], "A", "Submit your homework nghĩa là nộp bài tập."),
  mcq("grammar", 10, "Choose the correct option: 'Although it was raining, ___.'", ["but we went for a walk", "we went for a walk", "so we went for a walk", "because we went for a walk"], "B", "Although đã nối mệnh đề nhượng bộ, nên mệnh đề chính không thêm but, so hoặc because."),
];

// ── Vocabulary questions (NEW — Phần 4) ──────────────────────────────────────
const vocabQuestions: TestQuestion[] = [
  mcq(
    "vocabulary", 1,
    "Choose the word that best completes the sentence: 'The scientist made a ___ discovery that changed our understanding of the universe.'",
    ["groundbreaking", "boring", "ordinary", "harmful"],
    "A",
    "'Groundbreaking' có nghĩa là mang tính đột phá, mang tính cách mạng trong ngữ cảnh khám phá khoa học."
  ),
  mcq(
    "vocabulary", 2,
    "Which word is a synonym of 'abundant'?",
    ["scarce", "plentiful", "ancient", "fragile"],
    "B",
    "'Abundant' đồng nghĩa với 'plentiful' (dồi dào, phong phú)."
  ),
  mcq(
    "vocabulary", 3,
    "Choose the correct definition of the phrasal verb 'give up':",
    ["To start doing something new", "To stop trying or quit", "To give a present to someone", "To stand up quickly"],
    "B",
    "'Give up' có nghĩa là từ bỏ, không tiếp tục cố gắng nữa."
  ),
  mcq(
    "vocabulary", 4,
    "Select the word that does NOT belong in the same group: 'optimistic, hopeful, cheerful, pessimistic'",
    ["optimistic", "hopeful", "cheerful", "pessimistic"],
    "D",
    "Optimistic, hopeful và cheerful đều mang nghĩa tích cực. Pessimistic là từ mang nghĩa tiêu cực (bi quan)."
  ),
  mcq(
    "vocabulary", 5,
    "Choose the word that best fits: 'She felt very ___ after walking 10 km without any rest.'",
    ["energetic", "exhausted", "excited", "delighted"],
    "B",
    "Đi bộ 10 km không nghỉ dẫn đến kiệt sức ('exhausted')."
  ),
];

// ── Writing task (NEW — Phần 5) ───────────────────────────────────────────────
const writingTask: TestQuestion = {
  id: "pt-w-1",
  section: "writing",
  sectionTitle: "Phần 5: Viết (Writing)",
  taskType: "writing",
  taskGuide: "Viết 50–80 từ tiếng Anh. Không cần hoàn hảo — hãy viết tự nhiên nhất có thể.",
  prompt:
    "Write a short paragraph (50–80 words) about your daily routine. Include: (1) what time you usually wake up, (2) two or three activities you do during the day, and (3) what you do in the evening to relax.",
};

// ── Speaking task (NEW — Phần 6) ──────────────────────────────────────────────
const speakingTask: TestQuestion = {
  id: "pt-s-1",
  section: "speaking",
  sectionTitle: "Phần 6: Nói (Speaking)",
  taskType: "speaking",
  taskGuide: "Chuẩn bị 30 giây, nói 60–90 giây. Nói rõ ràng, tự nhiên — đây là mức cơ bản ban đầu.",
  prompt:
    "Talk about your favourite hobby or free-time activity (60–90 seconds). Answer these questions in your response:\n1. What is your hobby?\n2. How often do you do it and with whom?\n3. Why do you enjoy it?",
};

// ── Full question bank ────────────────────────────────────────────────────────
export const placementQuestions: TestQuestion[] = [
  // Phần 1: Reading (10 câu)
  {
    id: "pt-r-1",
    section: "reading",
    sectionTitle: "Phần 1: Đọc hiểu (Reading)",
    taskType: "mcq",
    passage:
      "Renewable energy technologies such as solar and wind power have witnessed a dramatic reduction in implementation costs over the past decade. However, the intermittent nature of sunshine and wind requires reliable grid-scale battery storage solutions.",
    prompt: "According to the passage, what is the primary challenge associated with solar and wind energy?",
    options: [
      { id: "A", text: "Implementation costs have increased steadily over the past decade." },
      { id: "B", text: "Their intermittent nature relies heavily on weather conditions." },
      { id: "C", text: "They cannot be integrated into the national electrical grid." },
      { id: "D", text: "Battery storage technology has become obsolete." },
    ],
    correct: "B",
    explanation:
      "Đoạn văn nêu rõ: 'the intermittent nature of sunshine and wind requires reliable grid-scale battery storage solutions' (tính chất ngắt quãng phụ thuộc thời tiết).",
  },
  {
    id: "pt-r-2",
    section: "reading",
    sectionTitle: "Phần 1: Đọc hiểu (Reading)",
    taskType: "mcq",
    prompt: "Which of the following is closest in meaning to the word 'intermittent' in the passage?",
    options: [
      { id: "A", text: "Constant" },
      { id: "B", text: "Irregular" },
      { id: "C", text: "Hazardous" },
      { id: "D", text: "Economical" },
    ],
    correct: "B",
    explanation:
      "'Intermittent' có nghĩa là diễn ra ngắt quãng, không liên tục, đồng nghĩa với 'irregular' hoặc 'sporadic'.",
  },
  ...extraReading,

  // Phần 2: Listening (10 câu)
  {
    id: "pt-l-1",
    section: "listening",
    sectionTitle: "Phần 2: Nghe hiểu (Listening)",
    taskType: "mcq",
    hasAudio: true,
    audioUrl: "/audio/placement-test-dialogue.mp3",
    prompt: "Listen to the conversation: Which course does the woman decide to enrol in?",
    options: [
      { id: "A", text: "Saturday morning photography workshop" },
      { id: "B", text: "Thursday afternoon digital graphic design class" },
      { id: "C", text: "Weekend watercolour painting class" },
      { id: "D", text: "Introductory web development course" },
    ],
    correct: "B",
    explanation:
      "Người phụ nữ nói: 'I will definitely take the Thursday afternoon digital graphic design class then.'",
  },
  {
    id: "pt-l-2",
    section: "listening",
    sectionTitle: "Phần 2: Nghe hiểu (Listening)",
    taskType: "mcq",
    hasAudio: true,
    audioUrl: "/audio/placement-test-dialogue.mp3",
    prompt: "What percentage discount is offered if she completes her registration before the 15th?",
    options: [
      { id: "A", text: "10%" },
      { id: "B", text: "15%" },
      { id: "C", text: "20%" },
      { id: "D", text: "25%" },
    ],
    correct: "C",
    explanation:
      "Người tư vấn cho biết: 'if you complete your registration before the 15th of this month, you will receive an early bird discount of twenty percent.'",
  },
  ...extraListening,

  // Phần 3: Grammar (10 câu)
  {
    id: "pt-g-1",
    section: "grammar",
    sectionTitle: "Phần 3: Ngữ pháp (Grammar)",
    taskType: "mcq",
    prompt: "Choose the correct option: 'If she ___ earlier, she would not have missed the academic conference.'",
    options: [
      { id: "A", text: "arrived" },
      { id: "B", text: "had arrived" },
      { id: "C", text: "would arrive" },
      { id: "D", text: "has arrived" },
    ],
    correct: "B",
    explanation:
      "Câu điều kiện loại 3 diễn tả giả định trái với quá khứ: Mệnh đề If dùng Past Perfect ('had arrived'), mệnh đề chính dùng 'would not have + V3'.",
  },
  {
    id: "pt-g-2",
    section: "grammar",
    sectionTitle: "Phần 3: Ngữ pháp (Grammar)",
    taskType: "mcq",
    prompt: "Fill in the blank: 'The municipal government took ________ measures to curb environmental pollution.'",
    options: [
      { id: "A", text: "substantial" },
      { id: "B", text: "substance" },
      { id: "C", text: "substantially" },
      { id: "D", text: "substantiate" },
    ],
    correct: "A",
    explanation:
      "Đứng trước danh từ 'measures' cần một tính từ bổ nghĩa ('substantial measures' = các biện pháp đáng kể/mạnh mẽ).",
  },
  ...extraGrammar,

  // Phần 4: Vocabulary (5 câu)
  ...vocabQuestions,

  // Phần 5: Writing (1 task)
  writingTask,

  // Phần 6: Speaking (1 task)
  speakingTask,
];
