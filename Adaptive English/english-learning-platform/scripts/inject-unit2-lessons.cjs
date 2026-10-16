const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let code = fs.readFileSync(mockDataPath, 'utf8');

// 9 Comprehensive Lessons for Grade 7 Unit 2: Healthy Living
const g7u2Lessons = [
  // LESSON 1: READING (10 questions)
  {
    id: "g7-u2-les-01",
    skill: "reading",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Reading: Healthy Eating & Nutritional Principles",
    description: "Bài đọc chuyên sâu về chế độ dinh dưỡng cân bằng, giảm chất béo và kiểm soát lượng calo hàng ngày.",
    durationMinutes: 20,
    targetCefr: "A2",
    status: "ready",
    provenance: "Trích xuất & chuẩn hóa từ GỦI.docx:P#484 (Exercise 20 & Exercise 18)",
    questions: [
      {
        id: "g7-u2-r-q1",
        type: "multiple_choice",
        prompt: "According to paragraph 1, what is the first important rule in healthy eating?",
        passage: "There are two important matters in eating. First is eating enough calories to keep your body active. Second is choosing healthy food. Firstly, we need to reduce the amount of high-calorie food. Fat in fast food can cause heart problems. Secondly, you also should not eat too much sugar. Drinking sugary soft drinks often leads to obesity. Thirdly, it is good to have a rich-fibre diet. We can find fibre from fresh green vegetables, beans, and fresh fruits.",
        options: [
          { id: "A", text: "Eating as much fast food as possible" },
          { id: "B", text: "Eating enough calories to keep the body active" },
          { id: "C", text: "Drinking sugary soft drinks every morning" },
          { id: "D", text: "Skipping all meals during the week" }
        ],
        correctAnswer: "B",
        hint: "Read the first two sentences of the passage carefully.",
        explanation: "Bài đọc nêu rõ ở câu thứ hai: 'First is eating enough calories to keep your body active.' (Trước tiên là nạp đủ calo để giữ cơ thể hoạt động). Do đó đáp án B chính xác.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#484:Ex20"
      },
      {
        id: "g7-u2-r-q2",
        type: "multiple_choice",
        prompt: "Why should we avoid eating too much fat in fast food?",
        passage: "Firstly, we need to reduce the amount of high-calorie food. Fat in fast food can cause heart problems.",
        options: [
          { id: "A", text: "Because it helps us run faster" },
          { id: "B", text: "Because it can cause heart problems" },
          { id: "C", text: "Because it makes our teeth brighter" },
          { id: "D", text: "Because it is completely free" }
        ],
        correctAnswer: "B",
        hint: "Find the word 'heart problems' in paragraph 2.",
        explanation: "Đoạn văn viết: 'Fat in fast food can cause heart problems' (Chất béo trong đồ ăn nhanh có thể gây bệnh tim mạch). Đáp án B đúng.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#485:Ex20"
      },
      {
        id: "g7-u2-r-q3",
        type: "multiple_choice",
        prompt: "Where can people find a good source of dietary fibre?",
        passage: "Thirdly, it is good to have a rich-fibre diet. We can find fibre from fresh green vegetables, beans, and fresh fruits.",
        options: [
          { id: "A", text: "From soft drinks and candies" },
          { id: "B", text: "From fried chicken and burgers" },
          { id: "C", text: "From fresh green vegetables, beans, and fruits" },
          { id: "D", text: "From coffee and energy drinks" }
        ],
        correctAnswer: "C",
        hint: "Look at the sentence mentioning 'find fibre from...'",
        explanation: "Đoạn văn khẳng định: 'We can find fibre from fresh green vegetables, beans, and fresh fruits.' Đáp án C chính xác.",
        difficulty: "A2",
        score: 1.0,
        answer: "C",
        sourceLocator: "GỦI.docx:P#487:Ex20"
      },
      {
        id: "g7-u2-r-q4",
        type: "multiple_choice",
        prompt: "Breakfast is the _______ important meal of the day.",
        passage: "Breakfast is the most important meal of the day. It provides your brain and body with energy after a long night of sleep.",
        options: [
          { id: "A", text: "most" },
          { id: "B", text: "healthy" },
          { id: "C", text: "tasty" },
          { id: "D", text: "more" }
        ],
        correctAnswer: "A",
        hint: "Superlative form: the + most + long adjective.",
        explanation: "Cấu trúc so sánh nhất với tính từ dài: 'the most important' (quan trọng nhất). Đáp án A chính xác.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#469:Ex18"
      },
      {
        id: "g7-u2-r-q5",
        type: "multiple_choice",
        prompt: "A healthy breakfast provides our brain and body with enough _______ for morning classes.",
        passage: "Breakfast is the most important meal of the day. It provides your brain and body with energy after a long night of sleep.",
        options: [
          { id: "A", text: "energy" },
          { id: "B", text: "acne" },
          { id: "C", text: "sunburn" },
          { id: "D", text: "headache" }
        ],
        correctAnswer: "A",
        hint: "Which word means power to be active?",
        explanation: "Bữa sáng cung cấp năng lượng ('energy') cho não bộ và cơ thể sau một đêm dài. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#471:Ex18"
      },
      {
        id: "g7-u2-r-q6",
        type: "true_false",
        prompt: "Statement: Skipping breakfast is recommended for teenagers who want to lose weight.",
        passage: "Breakfast is the most important meal of the day. Doctors say that skipping breakfast makes teenagers tired and unable to concentrate at school.",
        options: [
          { id: "True", text: "True (Đúng)" },
          { id: "False", text: "False (Sai)" }
        ],
        correctAnswer: "False",
        hint: "Does the doctor recommend skipping breakfast?",
        explanation: "Bài đọc khẳng định các bác sĩ cảnh báo rằng bỏ bữa sáng khiến học sinh mệt mỏi và mất tập trung. Do đó câu nhận định trên là False (Sai).",
        difficulty: "A2",
        score: 1.0,
        answer: "False",
        sourceLocator: "GỦI.docx:P#469:Ex18"
      },
      {
        id: "g7-u2-r-q7",
        type: "multiple_choice",
        prompt: "Which of the following foods is rich in vegetable protein according to Vietnamese nutrition?",
        passage: "Tofu and soybeans are popular in Vietnamese meals. They provide high-quality vegetable protein without harmful cholesterol.",
        options: [
          { id: "A", text: "Tofu and soybeans" },
          { id: "B", text: "Butter and cheese" },
          { id: "C", text: "White sugar" },
          { id: "D", text: "French fries" }
        ],
        correctAnswer: "A",
        hint: "Find the two plant foods mentioned at the beginning.",
        explanation: "Bài viết nêu rõ 'Tofu and soybeans... provide high-quality vegetable protein' (Đậu phụ và đậu nành cung cấp đạm thực vật chất lượng cao). Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#323:Ex9"
      },
      {
        id: "g7-u2-r-q8",
        type: "multiple_choice",
        prompt: "What condition often happens if people spend hours in the strong sun without wearing a hat?",
        passage: "The sun is strongest between 10 a.m. and 4 p.m. If you stay outside without suncream and a hat, ultraviolet rays will damage your skin and cause severe sunburn.",
        options: [
          { id: "A", text: "Sunburn" },
          { id: "B", text: "Chapped lips" },
          { id: "C", text: "Stomachache" },
          { id: "D", text: "Toothache" }
        ],
        correctAnswer: "A",
        hint: "Red, painful skin from ultraviolet rays.",
        explanation: "Tia cực tím trong ánh nắng gay gắt gây cháy nắng ('sunburn'). Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#270:Ex3"
      },
      {
        id: "g7-u2-r-q9",
        type: "fill_in_the_blank",
        prompt: "Complete the sentence with one suitable word from the text: Eating too much sugar can lead to _______.",
        passage: "Secondly, you also should not eat too much sugar. Drinking sugary soft drinks often leads to obesity.",
        options: null,
        correctAnswer: "obesity",
        hint: "A medical word for being very overweight.",
        explanation: "Từ cần điền trong đoạn văn là 'obesity' (bệnh béo phì).",
        difficulty: "A2",
        score: 1.0,
        answer: "obesity",
        sourceLocator: "GỦI.docx:P#486:Ex20"
      },
      {
        id: "g7-u2-r-q10",
        type: "multiple_choice",
        prompt: "What is the best title for the entire reading passage?",
        passage: "There are two important matters in eating. First is eating enough calories to keep your body active... Secondly, do not eat too much sugar... Thirdly, eat a rich-fibre diet...",
        options: [
          { id: "A", text: "The History of Fast Food" },
          { id: "B", text: "Principles of a Healthy and Balanced Diet" },
          { id: "C", text: "How to Cook Vietnamese Tofu" },
          { id: "D", text: "The Disadvantages of Drinking Milk" }
        ],
        correctAnswer: "B",
        hint: "What main idea do all three paragraphs discuss?",
        explanation: "Toàn bộ bài đọc hướng dẫn các nguyên tắc xây dựng chế độ ăn uống lành mạnh và cân bằng (Principles of a Healthy and Balanced Diet). Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#484:Ex20"
      }
    ]
  },

  // LESSON 2: VOCABULARY & ODONE OUT (12 questions)
  {
    id: "g7-u2-les-02",
    skill: "vocabulary",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Vocabulary: Health Problems & Odd-One-Out",
    description: "Nhận biết các vấn đề sức khỏe thường gặp (sunburn, acne, flu, fever), phân loại nhóm từ và nối tranh minh họa.",
    durationMinutes: 15,
    targetCefr: "A2",
    status: "ready",
    provenance: "Trích xuất & chuẩn hóa từ GỦI.docx:P#268-316 (Exercise 3, 5, 8)",
    questions: [
      {
        id: "g7-u2-v-q1",
        type: "multiple_choice",
        prompt: "Choose the odd one out in this group: A. interesting  B. popular  C. nice  D. lunch",
        passage: null,
        options: [
          { id: "A", text: "interesting" },
          { id: "B", text: "popular" },
          { id: "C", text: "nice" },
          { id: "D", text: "lunch" }
        ],
        correctAnswer: "D",
        hint: "Ba từ là tính từ chỉ tính chất, từ còn lại là danh từ chỉ bữa ăn.",
        explanation: "'lunch' là danh từ (bữa trưa). Ba từ 'interesting' (thú vị), 'popular' (phổ biến), 'nice' (đẹp, tốt) đều là tính từ.",
        difficulty: "A2",
        score: 1.0,
        answer: "D",
        sourceLocator: "GỦI.docx:P#269:Ex3"
      },
      {
        id: "g7-u2-v-q2",
        type: "multiple_choice",
        prompt: "Choose the odd one out in this group: A. sunburn  B. chapped lips  C. red spots  D. cycling",
        passage: null,
        options: [
          { id: "A", text: "sunburn" },
          { id: "B", text: "chapped lips" },
          { id: "C", text: "red spots" },
          { id: "D", text: "cycling" }
        ],
        correctAnswer: "D",
        hint: "Ba từ là triệu chứng/vấn đề về da, một từ là môn thể thao ngoài trời.",
        explanation: "'cycling' là môn thể thao đạp xe. Ba từ còn lại 'sunburn' (cháy nắng), 'chapped lips' (nứt môi), 'red spots' (đốm đỏ) đều là vấn đề về da.",
        difficulty: "A2",
        score: 1.0,
        answer: "D",
        sourceLocator: "GỦI.docx:P#270:Ex3"
      },
      {
        id: "g7-u2-v-q3",
        type: "multiple_choice",
        prompt: "Choose the odd one out: A. wash  B. sad  C. wear  D. brush",
        passage: null,
        options: [
          { id: "A", text: "wash" },
          { id: "B", text: "sad" },
          { id: "C", text: "wear" },
          { id: "D", text: "brush" }
        ],
        correctAnswer: "B",
        hint: "'sad' là tính từ chỉ cảm xúc, ba từ còn lại là động từ hành động.",
        explanation: "'sad' (buồn bã) là tính từ. 'wash' (rửa), 'wear' (mặc), 'brush' (chải) đều là động từ.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#271:Ex3"
      },
      {
        id: "g7-u2-v-q4",
        type: "multiple_choice",
        prompt: "Choose the odd one out: A. carrot  B. tomato  C. lemonade  D. potato",
        passage: null,
        options: [
          { id: "A", text: "carrot" },
          { id: "B", text: "tomato" },
          { id: "C", text: "lemonade" },
          { id: "D", text: "potato" }
        ],
        correctAnswer: "C",
        hint: "'lemonade' là đồ uống, ba từ còn lại là rau củ.",
        explanation: "'lemonade' (nước chanh) là đồ uống. 'carrot' (cà rốt), 'tomato' (cà chua), 'potato' (khoai tây) là các loại củ quả.",
        difficulty: "A2",
        score: 1.0,
        answer: "C",
        sourceLocator: "GỦI.docx:P#272:Ex3"
      },
      {
        id: "g7-u2-v-q5",
        type: "multiple_choice",
        prompt: "Choose the odd one out: A. fever  B. toothache  C. suncream  D. cough",
        passage: null,
        options: [
          { id: "A", text: "fever" },
          { id: "B", text: "toothache" },
          { id: "C", text: "suncream" },
          { id: "D", text: "cough" }
        ],
        correctAnswer: "C",
        hint: "'suncream' là sản phẩm bảo vệ da, ba từ còn lại là triệu chứng bệnh.",
        explanation: "'suncream' (kem chống nắng) là sản phẩm chăm sóc da. 'fever' (sốt), 'toothache' (đau răng), 'cough' (ho) là các bệnh/triệu chứng.",
        difficulty: "A2",
        score: 1.0,
        answer: "C",
        sourceLocator: "GỦI.docx:P#291:Ex5"
      },
      {
        id: "g7-u2-v-q6",
        type: "multiple_choice",
        prompt: "Acne _______ about 70% of young people between the ages of 12 and 25.",
        passage: null,
        options: [
          { id: "A", text: "affects" },
          { id: "B", text: "suncream" },
          { id: "C", text: "soybeans" },
          { id: "D", text: "tired" }
        ],
        correctAnswer: "A",
        hint: "Which verb means 'to have an influence on'?",
        explanation: "Động từ 'affects' (ảnh hưởng tới). Mụn trứng cá ảnh hưởng đến khoảng 70% thanh thiếu niên trong độ tuổi 12-25. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#316:Ex8"
      },
      {
        id: "g7-u2-v-q7",
        type: "multiple_choice",
        prompt: "You should go to bed _______ and get enough 8 hours of sleep every night.",
        passage: null,
        options: [
          { id: "A", text: "early" },
          { id: "B", text: "late" },
          { id: "C", text: "dim" },
          { id: "D", text: "chapped" }
        ],
        correctAnswer: "A",
        hint: "The opposite of 'late'.",
        explanation: "'go to bed early' (đi ngủ sớm) để ngủ đủ giấc. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#317:Ex8"
      },
      {
        id: "g7-u2-v-q8",
        type: "multiple_choice",
        prompt: "Vegetarians eat a lot of food made from _______, such as tofu and soy milk.",
        passage: null,
        options: [
          { id: "A", text: "soybeans" },
          { id: "B", text: "sunburn" },
          { id: "C", text: "headaches" },
          { id: "D", text: "lip balm" }
        ],
        correctAnswer: "A",
        hint: "Plant food used to make tofu.",
        explanation: "'soybeans' (đậu nành) là nguyên liệu làm đậu phụ và sữa đậu nành. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#314:Ex8"
      },
      {
        id: "g7-u2-v-q9",
        type: "multiple_choice",
        prompt: "When you have dry and _______, you should apply lip balm regularly.",
        passage: null,
        options: [
          { id: "A", text: "chapped lips" },
          { id: "B", text: "strong muscles" },
          { id: "C", text: "fit body" },
          { id: "D", text: "active games" }
        ],
        correctAnswer: "A",
        hint: "Condition of dry lips in windy weather.",
        explanation: "'chapped lips' (môi nứt nẻ). Khi môi bị khô nứt thì nên bôi sáp dưỡng môi. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#288:Ex5"
      },
      {
        id: "g7-u2-v-q10",
        type: "multiple_choice",
        prompt: "Do not read books in _______ because it will cause eye strain.",
        passage: null,
        options: [
          { id: "A", text: "dim light" },
          { id: "B", text: "suncream" },
          { id: "C", text: "clean water" },
          { id: "D", text: "warm clothes" }
        ],
        correctAnswer: "A",
        hint: "Light that is not bright enough.",
        explanation: "'dim light' (ánh sáng mờ/yếu). Không nên đọc sách trong điều kiện thiếu sáng. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#286:Ex5"
      },
      {
        id: "g7-u2-v-q11",
        type: "multiple_choice",
        prompt: "Remember to apply _______ before you go to the beach on sunny days.",
        passage: null,
        options: [
          { id: "A", text: "suncream" },
          { id: "B", text: "acne" },
          { id: "C", text: "headache" },
          { id: "D", text: "fever" }
        ],
        correctAnswer: "A",
        hint: "Lotion to protect skin from sunlight.",
        explanation: "'suncream' (kem chống nắng). Bôi kem chống nắng trước khi đi biển. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#293:Ex5"
      },
      {
        id: "g7-u2-v-q12",
        type: "multiple_choice",
        prompt: "Doing regular exercise helps you burn _______ and keep fit.",
        passage: null,
        options: [
          { id: "A", text: "calories" },
          { id: "B", text: "sunburn" },
          { id: "C", text: "cold water" },
          { id: "D", text: "lip balm" }
        ],
        correctAnswer: "A",
        hint: "Unit of energy burned during sports.",
        explanation: "'burn calories' (đốt cháy calo). Tập thể dục thường xuyên giúp đốt cháy calo và giữ dáng. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:T#1"
      }
    ]
  },

  // LESSON 3: GRAMMAR: SIMPLE SENTENCES (12 questions)
  {
    id: "g7-u2-les-03",
    skill: "grammar",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Grammar: Simple Sentences (S + V + O / Adv)",
    description: "Nhận biết cấu trúc câu đơn, phân biệt Chủ ngữ (S), Động từ (V), Tân ngữ (O) và Trạng từ (Adv); liên từ nối and/but/so/or.",
    durationMinutes: 18,
    targetCefr: "A2",
    status: "ready",
    provenance: "Trích xuất & chuẩn hóa từ GỦI.docx:P#322-353 (Exercise 9, 10, 11)",
    questions: [
      {
        id: "g7-u2-g-q1",
        type: "multiple_choice",
        prompt: "In the sentence 'Tofu has vegetable protein and vitamin B.', what is the subject (S)?",
        passage: null,
        options: [
          { id: "A", text: "Tofu" },
          { id: "B", text: "has" },
          { id: "C", text: "vegetable protein" },
          { id: "D", text: "vitamin B" }
        ],
        correctAnswer: "A",
        hint: "The noun that performs or has the state of the verb.",
        explanation: "Chủ ngữ (Subject) của câu là 'Tofu'. Động từ là 'has'. Tân ngữ là 'vegetable protein and vitamin B'.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#323:Ex9"
      },
      {
        id: "g7-u2-g-q2",
        type: "multiple_choice",
        prompt: "In the sentence 'Acne is not a serious disease.', what is the verb (V)?",
        passage: null,
        options: [
          { id: "A", text: "is not" },
          { id: "B", text: "Acne" },
          { id: "C", text: "serious" },
          { id: "D", text: "disease" }
        ],
        correctAnswer: "A",
        hint: "The linking verb in negative form.",
        explanation: "Động từ chính của câu là động từ to be ở thể phủ định: 'is not'.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#324:Ex9"
      },
      {
        id: "g7-u2-g-q3",
        type: "multiple_choice",
        prompt: "In the sentence 'We should eat more fruits and vegetables.', what is the verb phrase?",
        passage: null,
        options: [
          { id: "A", text: "should eat" },
          { id: "B", text: "We" },
          { id: "C", text: "more fruits" },
          { id: "D", text: "vegetables" }
        ],
        correctAnswer: "A",
        hint: "Modal verb + base form.",
        explanation: "Cụm động từ chính là động từ khuyết thiếu kết hợp động từ nguyên thể: 'should eat'.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#326:Ex9"
      },
      {
        id: "g7-u2-g-q4",
        type: "multiple_choice",
        prompt: "In the sentence 'My brother does morning exercises every day.', what is the object (O)?",
        passage: null,
        options: [
          { id: "A", text: "morning exercises" },
          { id: "B", text: "My brother" },
          { id: "C", text: "does" },
          { id: "D", text: "every day" }
        ],
        correctAnswer: "A",
        hint: "What does the brother do? (Answers 'What?')",
        explanation: "Tân ngữ trực tiếp trả lời cho câu hỏi 'Làm cái gì?': 'morning exercises' (bài tập buổi sáng). 'every day' là trạng từ chỉ thời gian.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#327:Ex9"
      },
      {
        id: "g7-u2-g-q5",
        type: "multiple_choice",
        prompt: "In the sentence 'We seldom go out at night.', what role does the word 'seldom' play?",
        passage: null,
        options: [
          { id: "A", text: "Adverb of frequency (Adv)" },
          { id: "B", text: "Direct Object (O)" },
          { id: "C", text: "Subject (S)" },
          { id: "D", text: "Main verb (V)" }
        ],
        correctAnswer: "A",
        hint: "'seldom' means rarely, describing how often.",
        explanation: "'seldom' (hiếm khi) là trạng từ chỉ tần suất (Adverb of frequency - Adv), không phải tân ngữ.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#331:Ex10"
      },
      {
        id: "g7-u2-g-q6",
        type: "multiple_choice",
        prompt: "In the sentence 'I caught a terrific headache yesterday.', what role does 'a terrific headache' play?",
        passage: null,
        options: [
          { id: "A", text: "Direct Object (O)" },
          { id: "B", text: "Adverb of time (Adv)" },
          { id: "C", text: "Subject (S)" },
          { id: "D", text: "Preposition" }
        ],
        correctAnswer: "A",
        hint: "Answers the question: What did I catch?",
        explanation: "'a terrific headache' đứng sau động từ ngoại động từ 'caught', đóng vai trò là tân ngữ (Object - O) của câu.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#337:Ex10"
      },
      {
        id: "g7-u2-g-q7",
        type: "multiple_choice",
        prompt: "Choose the correct coordinating conjunction: 'He likes swimming, _______ his brother prefers cycling.'",
        passage: null,
        options: [
          { id: "A", text: "but" },
          { id: "B", text: "so" },
          { id: "C", text: "or" },
          { id: "D", text: "because of" }
        ],
        correctAnswer: "A",
        hint: "Shows contrast between two preferences.",
        explanation: "Hai vế câu thể hiện sự đối lập về sở thích (likes swimming vs. prefers cycling), do đó dùng liên từ 'but' (nhưng).",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#254:Grammar"
      },
      {
        id: "g7-u2-g-q8",
        type: "multiple_choice",
        prompt: "Choose the correct conjunction: 'Eat more fresh fruit, _______ you will not have enough vitamins.'",
        passage: null,
        options: [
          { id: "A", text: "or" },
          { id: "B", text: "and" },
          { id: "C", text: "so" },
          { id: "D", text: "but" }
        ],
        correctAnswer: "A",
        hint: "'or' is used in warnings: Do X, or Y will happen.",
        explanation: "Cấu trúc đưa ra lời cảnh báo: Mệnh lệnh thức + or + mệnh đề kết quả tiêu cực ('or' = nếu không thì). Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#254:Grammar"
      },
      {
        id: "g7-u2-g-q9",
        type: "multiple_choice",
        prompt: "Match Question & Answer: 'What is the matter with you?' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "I have a flu and a headache." },
          { id: "B", text: "Every day." },
          { id: "C", text: "7 to 8 hours." },
          { id: "D", text: "Yes, I do." }
        ],
        correctAnswer: "A",
        hint: "Answers about a health problem or symptom.",
        explanation: "Câu hỏi 'What is the matter with you?' (Bạn bị làm sao thế?) hỏi về tình trạng sức khỏe. Câu trả lời phù hợp là 'I have a flu and a headache.'",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#350:Ex11"
      },
      {
        id: "g7-u2-g-q10",
        type: "multiple_choice",
        prompt: "Match Question & Answer: 'How many hours do you sleep a day?' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "7 to 8 hours." },
          { id: "B", text: "I like milk." },
          { id: "C", text: "At 10 p.m." },
          { id: "D", text: "No, she doesn't." }
        ],
        correctAnswer: "A",
        hint: "Answers about duration in hours.",
        explanation: "Câu hỏi 'How many hours do you sleep a day?' hỏi về số lượng giờ ngủ mỗi ngày. Câu trả lời đúng là '7 to 8 hours.'",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#353:Ex11"
      },
      {
        id: "g7-u2-g-q11",
        type: "multiple_choice",
        prompt: "Match Question & Answer: 'How often do you exercise?' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "Every day in the afternoon." },
          { id: "B", text: "With my brother." },
          { id: "C", text: "At school playground." },
          { id: "D", text: "Because I want to be strong." }
        ],
        correctAnswer: "A",
        hint: "'How often' asks about frequency.",
        explanation: "'How often' hỏi tần suất thực hiện. Câu trả lời tương ứng là 'Every day in the afternoon.' (Mỗi ngày vào buổi chiều).",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#352:Ex11"
      },
      {
        id: "g7-u2-g-q12",
        type: "multiple_choice",
        prompt: "Choose the correct sentence structure for a simple sentence with compound subject:",
        passage: null,
        options: [
          { id: "A", text: "Linda and Jenny are playing tennis in the yard." },
          { id: "B", text: "Linda plays tennis but Jenny watches TV." },
          { id: "C", text: "Because Linda is sick, she stays at home." },
          { id: "D", text: "Although it rained, we played football." }
        ],
        correctAnswer: "A",
        hint: "Two subjects connected by 'and' sharing one verb predicate.",
        explanation: "'Linda and Jenny are playing tennis in the yard.' là câu đơn có chủ ngữ ghép gồm 2 danh từ nối bằng 'and' cùng thực hiện một hành động 'are playing'. Ba câu còn lại là câu ghép hoặc câu phức.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#255:Grammar"
      }
    ]
  },

  // LESSON 4: WORD FORMS & SENTENCE TRANSFORMATION (10 questions)
  {
    id: "g7-u2-les-04",
    skill: "grammar",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Word Formation & Sentence Rewriting",
    description: "Biến đổi từ loại (affect, avoid, differ, active, strength) và viết lại câu giữ nguyên nghĩa với từ gợi ý.",
    durationMinutes: 18,
    targetCefr: "A2",
    status: "ready",
    provenance: "Trích xuất & chuẩn hóa từ GỦI.docx:P#368-380 & P#610-630 (Exercise 13 & Exercise 25)",
    questions: [
      {
        id: "g7-u2-wf-q1",
        type: "fill_in_the_blank",
        prompt: "Supply the correct form of the word in brackets: 'What you eat can directly _______ your energy levels throughout the day.' (affection)",
        passage: null,
        options: null,
        correctAnswer: "affect",
        hint: "We need a verb after modal verb 'can' + adverb 'directly'.",
        explanation: "Sau trạng từ 'directly' bổ nghĩa cho động từ, ta cần động từ nguyên thể của gốc từ 'affection' là 'affect' (ảnh hưởng).",
        difficulty: "A2",
        score: 1.0,
        answer: "affect",
        sourceLocator: "GỦI.docx:P#368:Ex13"
      },
      {
        id: "g7-u2-wf-q2",
        type: "fill_in_the_blank",
        prompt: "Supply the correct form of the word in brackets: 'Many common colds are _______ if you wash your hands frequently.' (avoid)",
        passage: null,
        options: null,
        correctAnswer: "avoidable",
        hint: "We need an adjective after linking verb 'are'. (Suffix -able)",
        explanation: "Sau động từ to be 'are' cần một tính từ mang nghĩa 'có thể phòng tránh được'. Dạng tính từ của 'avoid' là 'avoidable'.",
        difficulty: "A2",
        score: 1.0,
        answer: "avoidable",
        sourceLocator: "GỦI.docx:P#370:Ex13"
      },
      {
        id: "g7-u2-wf-q3",
        type: "fill_in_the_blank",
        prompt: "Supply the correct form of the word in brackets: 'Regular physical activity helps _______ your bones and muscles.' (strength)",
        passage: null,
        options: null,
        correctAnswer: "strengthen",
        hint: "We need a verb after 'helps' (help do sth).",
        explanation: "Cấu trúc 'help + (to) V'. Dạng động từ của danh từ 'strength' (sức mạnh) là 'strengthen' (làm mạnh lên, củng cố).",
        difficulty: "A2",
        score: 1.0,
        answer: "strengthen",
        sourceLocator: "GỦI.docx:T#2:WordForms"
      },
      {
        id: "g7-u2-wf-q4",
        type: "fill_in_the_blank",
        prompt: "Supply the correct form of the word in brackets: 'Healthy food and fast food taste very _______.' (differ)",
        passage: null,
        options: null,
        correctAnswer: "differently",
        hint: "We need an adverb after taste / or adjective 'different'.",
        explanation: "Hai cách dùng: 'taste differently' (có vị khác nhau) hoặc 'taste different' (theo ngữ cảnh giao tiếp). Đáp án chuẩn là 'different' hoặc 'differently'.",
        difficulty: "A2",
        score: 1.0,
        answer: "different",
        sourceLocator: "GỦI.docx:T#2:WordForms"
      },
      {
        id: "g7-u2-wf-q5",
        type: "fill_in_the_blank",
        prompt: "Supply the correct form of the word in brackets: 'Children should participate _______ in outdoor games.' (active)",
        passage: null,
        options: null,
        correctAnswer: "actively",
        hint: "Adverb modifying the verb 'participate'. (Suffix -ly)",
        explanation: "Bổ nghĩa cho động từ 'participate' (tham gia) cần một trạng từ: 'actively' (một cách tích cực/năng động).",
        difficulty: "A2",
        score: 1.0,
        answer: "actively",
        sourceLocator: "GỦI.docx:T#2:WordForms"
      },
      {
        id: "g7-u2-wf-q6",
        type: "writing",
        prompt: "Rewrite the sentence using the word in brackets: 'You can learn things better if you do exercise. (help)' -> 'Doing exercise...'",
        passage: null,
        options: null,
        correctAnswer: "Doing exercise helps you learn things better.",
        hint: "Subject is 'Doing exercise', verb is 'helps' (singular).",
        explanation: "Viết lại câu dùng cấu trúc 'help sb do sth': 'Doing exercise helps you learn things better.' (Tập thể dục giúp bạn học tập tốt hơn).",
        difficulty: "A2",
        score: 1.5,
        answer: "Doing exercise helps you learn things better.",
        sourceLocator: "GỦI.docx:P#611:Ex25"
      },
      {
        id: "g7-u2-wf-q7",
        type: "writing",
        prompt: "Rewrite the sentence: 'Giang feels tired, so she doesn't want to eat any food.' -> 'Because Giang...'",
        passage: null,
        options: null,
        correctAnswer: "Because Giang feels tired, she doesn't want to eat any food.",
        hint: "Use clause connector 'Because' at the beginning of the sentence.",
        explanation: "Chuyển từ câu nối bằng 'so' sang câu chỉ nguyên nhân bắt đầu bằng 'Because': 'Because Giang feels tired, she doesn't want to eat any food.'",
        difficulty: "A2",
        score: 1.5,
        answer: "Because Giang feels tired, she doesn't want to eat any food.",
        sourceLocator: "GỦI.docx:P#613:Ex25"
      },
      {
        id: "g7-u2-wf-q8",
        type: "writing",
        prompt: "Rewrite the sentence: 'It is a good idea to drink plenty of water every day.' -> 'You should...'",
        passage: null,
        options: null,
        correctAnswer: "You should drink plenty of water every day.",
        hint: "It is a good idea to V = You should V.",
        explanation: "Cấu trúc đưa ra lời khuyên: 'It is a good idea to do sth' = 'You should do sth'. Viết lại: 'You should drink plenty of water every day.'",
        difficulty: "A2",
        score: 1.5,
        answer: "You should drink plenty of water every day.",
        sourceLocator: "GỦI.docx:P#627:Ex25"
      },
      {
        id: "g7-u2-wf-q9",
        type: "writing",
        prompt: "Rewrite the sentence: 'Mike doesn't like eating fast food.' -> 'Mike dislikes...'",
        passage: null,
        options: null,
        correctAnswer: "Mike dislikes eating fast food.",
        hint: "doesn't like + V-ing = dislikes + V-ing.",
        explanation: "Đồng nghĩa: not like V-ing = dislike V-ing. Với chủ ngữ Mike ngôi thứ ba số ít: 'Mike dislikes eating fast food.'",
        difficulty: "A2",
        score: 1.0,
        answer: "Mike dislikes eating fast food.",
        sourceLocator: "GỦI.docx:P#617:Ex25"
      },
      {
        id: "g7-u2-wf-q10",
        type: "writing",
        prompt: "Rewrite the sentence: 'My mother eats lots of green vegetables. My mother does regular exercise. (and)' -> 'My mother...'",
        passage: null,
        options: null,
        correctAnswer: "My mother eats lots of green vegetables and does regular exercise.",
        hint: "Combine two actions with the same subject using 'and'.",
        explanation: "Nối hai hành động cùng chủ ngữ bằng liên từ 'and': 'My mother eats lots of green vegetables and does regular exercise.'",
        difficulty: "A2",
        score: 1.5,
        answer: "My mother eats lots of green vegetables and does regular exercise.",
        sourceLocator: "GỦI.docx:P#569:Ex23"
      }
    ]
  },

  // LESSON 5: SENTENCE REORDERING & COMMUNICATION (10 questions)
  {
    id: "g7-u2-les-05",
    skill: "grammar",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Communication Exchanges & Sentence Reordering",
    description: "Sắp xếp từ thành câu hoàn chỉnh và chọn câu phản hồi tình huống giao tiếp về lời khuyên sức khỏe.",
    durationMinutes: 15,
    targetCefr: "A2",
    status: "ready",
    provenance: "Trích xuất & chuẩn hóa từ GỦI.docx:P#385-400 & P#539-555 (Exercise 14 & Exercise 22)",
    questions: [
      {
        id: "g7-u2-comm-q1",
        type: "multiple_choice",
        prompt: "Complete the exchange: 'How many hours do we need to sleep a day?' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "8 to 10 hours for teenagers." },
          { id: "B", text: "Sleep as late as possible." },
          { id: "C", text: "I like dreaming." },
          { id: "D", text: "Yes, I need sleep." }
        ],
        correctAnswer: "A",
        hint: "A precise answer giving duration for teenagers.",
        explanation: "Câu hỏi 'How many hours...' cần câu trả lời chỉ số lượng giờ cụ thể: '8 to 10 hours for teenagers.' Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#386:Ex14"
      },
      {
        id: "g7-u2-comm-q2",
        type: "multiple_choice",
        prompt: "Complete the exchange: 'When should we open the bedroom window?' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "In the morning to let fresh air in." },
          { id: "B", text: "When it is raining heavily." },
          { id: "C", text: "Never open windows." },
          { id: "D", text: "At midnight." }
        ],
        correctAnswer: "A",
        hint: "When should fresh air be let in?",
        explanation: "Mở cửa sổ vào buổi sáng ('In the morning to let fresh air in') để đón không khí trong lành. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#389:Ex14"
      },
      {
        id: "g7-u2-comm-q3",
        type: "multiple_choice",
        prompt: "Complete the exchange: 'I have a sore throat and a high fever.' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "You should see a doctor and drink warm water." },
          { id: "B", text: "You should drink cold ice tea." },
          { id: "C", text: "Congratulations on that!" },
          { id: "D", text: "Let's go swimming now." }
        ],
        correctAnswer: "A",
        hint: "Good medical advice for throat ache and fever.",
        explanation: "Lời khuyên y tế hợp lý cho người bị đau họng và sốt cao là đi khám bác sĩ và uống nước ấm ('You should see a doctor and drink warm water').",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#392:Ex14"
      },
      {
        id: "g7-u2-comm-q4",
        type: "multiple_choice",
        prompt: "Complete the exchange: 'Why do you look so tired today, Nam?' — '_______'",
        passage: null,
        options: [
          { id: "A", text: "Because I stayed up late studying for exams." },
          { id: "B", text: "Because I ate a big breakfast." },
          { id: "C", text: "Yes, I am happy." },
          { id: "D", text: "No, thank you." }
        ],
        correctAnswer: "A",
        hint: "Reason for feeling tired.",
        explanation: "Nguyên nhân mệt mỏi là thức khuya học bài ('Because I stayed up late studying for exams'). Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#395:Ex14"
      },
      {
        id: "g7-u2-comm-q5",
        type: "writing",
        prompt: "Reorder the words to make a meaningful sentence: 'sports / should / We / to / a / good / play / health / have / .'",
        passage: null,
        options: null,
        correctAnswer: "We should play sports to have good health.",
        hint: "Subject (We) + Modal verb (should) + Main verb (play sports) + Purpose clause (to have good health).",
        explanation: "Trật tự câu chuẩn: 'We should play sports to have good health.' (Chúng ta nên chơi thể thao để có sức khỏe tốt).",
        difficulty: "A2",
        score: 1.5,
        answer: "We should play sports to have good health.",
        sourceLocator: "GỦI.docx:P#540:Ex22"
      },
      {
        id: "g7-u2-comm-q6",
        type: "writing",
        prompt: "Reorder the words to make a sentence: 'likes / My grandmother / eating / tofu / .'",
        passage: null,
        options: null,
        correctAnswer: "My grandmother likes eating tofu.",
        hint: "Subject (My grandmother) + verb (likes) + gerund object (eating tofu).",
        explanation: "Trật tự câu: 'My grandmother likes eating tofu.' (Bà tôi thích ăn đậu phụ).",
        difficulty: "A2",
        score: 1.5,
        answer: "My grandmother likes eating tofu.",
        sourceLocator: "GỦI.docx:P#542:Ex22"
      },
      {
        id: "g7-u2-comm-q7",
        type: "writing",
        prompt: "Reorder the words to make a sentence: 'acne / Avoid / touching / to / prevent / your face / .'",
        passage: null,
        options: null,
        correctAnswer: "Avoid touching your face to prevent acne.",
        hint: "Imperative: Avoid + V-ing + object + to-infinitive.",
        explanation: "Câu mệnh lệnh thức: 'Avoid touching your face to prevent acne.' (Tránh chạm vào mặt để ngăn ngừa mụn).",
        difficulty: "A2",
        score: 1.5,
        answer: "Avoid touching your face to prevent acne.",
        sourceLocator: "GỦI.docx:P#545:Ex22"
      },
      {
        id: "g7-u2-comm-q8",
        type: "writing",
        prompt: "Reorder the words to make a sentence: 'wear / You / should / sunglasses / your eyes / protect / to / .'",
        passage: null,
        options: null,
        correctAnswer: "You should wear sunglasses to protect your eyes.",
        hint: "Subject + should wear + object + to protect your eyes.",
        explanation: "Cấu trúc: 'You should wear sunglasses to protect your eyes.' (Bạn nên đeo kính râm để bảo vệ mắt).",
        difficulty: "A2",
        score: 1.5,
        answer: "You should wear sunglasses to protect your eyes.",
        sourceLocator: "GỦI.docx:P#548:Ex22"
      },
      {
        id: "g7-u2-comm-q9",
        type: "writing",
        prompt: "Reorder the words to make a sentence: 'plenty / Drink / of / water / fresh / day / every / .'",
        passage: null,
        options: null,
        correctAnswer: "Drink plenty of fresh water every day.",
        hint: "Imperative sentence starting with 'Drink'.",
        explanation: "Câu mệnh lệnh tích cực: 'Drink plenty of fresh water every day.' (Hãy uống nhiều nước lọc mỗi ngày).",
        difficulty: "A2",
        score: 1.0,
        answer: "Drink plenty of fresh water every day.",
        sourceLocator: "GỦI.docx:P#550:Ex22"
      },
      {
        id: "g7-u2-comm-q10",
        type: "multiple_choice",
        prompt: "Which sentence has correct word order and punctuation?",
        passage: null,
        options: [
          { id: "A", text: "Outdoor activities help teenagers stay fit and active." },
          { id: "B", text: "Teenagers outdoor activities stay fit help and active." },
          { id: "C", text: "Help teenagers stay fit active and outdoor activities." },
          { id: "D", text: "Stay fit teenagers help outdoor and activities." }
        ],
        correctAnswer: "A",
        hint: "Subject + Verb + Object + Bare infinitive.",
        explanation: "Cấu trúc 'S + help + O + V (bare)': 'Outdoor activities help teenagers stay fit and active.' Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#555:Ex22"
      }
    ]
  },

  // LESSON 6: LISTENING 1 - DOCTOR CONSULTATION (5 questions + Real Audio)
  {
    id: "g7-u2-les-06",
    skill: "listening",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Listening: Doctor's Consultation on Daily Habits",
    description: "Nghe cuộc tư vấn sức khỏe giữa Bác sĩ Jones và bạn Minh về thói quen ăn sáng, tập thể dục và giảm thời gian nhìn màn hình.",
    durationMinutes: 15,
    targetCefr: "A2",
    status: "ready",
    provenance: "Biên soạn sư phạm đối sánh theo GỦI.docx:P#688 (Exercise 29/30) & Bản thu MP3 giọng bản ngữ chuẩn",
    questions: [
      {
        id: "g7-u2-l1-q1",
        type: "multiple_choice",
        prompt: "Why does Minh usually feel tired in the afternoons?",
        audioUrl: "/audio/g7-u2-healthy-habits.mp3",
        passage: "[Audio Transcript]\nDoctor Jones: Good morning, Minh. How are you feeling today?\nMinh: Good morning, Doctor. I feel a bit tired, and I often have a headache in the afternoons.\nDoctor Jones: I see. Tell me about your daily routine. What do you eat for breakfast?\nMinh: Well, I usually skip breakfast because I wake up late. I just grab a sugary soft drink on the way to school.\nDoctor Jones: Skipping breakfast is very bad for your health. Your body needs energy in the morning. And soft drinks contain too much sugar, which makes you feel tired later. You should eat nutritious food like eggs, bread, and fresh fruit.\nMinh: I understand. What about physical exercise? I spend about four hours every evening playing computer games.\nDoctor Jones: You must reduce your screen time! Staring at screens causes eye strain and headaches. Instead of sitting inside, you should cycle, jog, or play badminton for at least thirty minutes each day. Regular exercise strengthens your heart and muscles.\nMinh: Thank you very much, Doctor Jones. I will start eating breakfast and exercising tomorrow!\nDoctor Jones: Good boy! Remember: a healthy lifestyle is the best medicine.",
        options: [
          { id: "A", text: "Because he runs ten kilometres every morning" },
          { id: "B", text: "Because he skips breakfast and drinks sugary soft drinks" },
          { id: "C", text: "Because he eats too much fresh fruit" },
          { id: "D", text: "Because he wakes up too early" }
        ],
        correctAnswer: "B",
        hint: "Listen to Doctor Jones's explanation after Minh mentions skipping breakfast.",
        explanation: "Trong bài nghe, Minh thú nhận: 'I usually skip breakfast... I just grab a sugary soft drink'. Bác sĩ Jones giải thích việc bỏ bữa sáng và uống đồ ngọt khiến cơ thể mất năng lượng và mệt mỏi về sau. Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#688:Ex29"
      },
      {
        id: "g7-u2-l1-q2",
        type: "multiple_choice",
        prompt: "What does Doctor Jones recommend Minh should eat for breakfast?",
        audioUrl: "/audio/g7-u2-healthy-habits.mp3",
        passage: "Doctor Jones: You should eat nutritious food like eggs, bread, and fresh fruit.",
        options: [
          { id: "A", text: "Candy and soda" },
          { id: "B", text: "Eggs, bread, and fresh fruit" },
          { id: "C", text: "French fries and ice cream" },
          { id: "D", text: "Instant noodles only" }
        ],
        correctAnswer: "B",
        hint: "Listen for the three healthy food items recommended by the doctor.",
        explanation: "Bác sĩ Jones khuyên: 'You should eat nutritious food like eggs, bread, and fresh fruit' (trứng, bánh mì và hoa quả tươi). Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#688:Ex29"
      },
      {
        id: "g7-u2-l1-q3",
        type: "multiple_choice",
        prompt: "How many hours does Minh spend every evening playing computer games?",
        audioUrl: "/audio/g7-u2-healthy-habits.mp3",
        passage: "Minh: What about physical exercise? I spend about four hours every evening playing computer games.",
        options: [
          { id: "A", text: "One hour" },
          { id: "B", text: "Two hours" },
          { id: "C", text: "About four hours" },
          { id: "D", text: "Six hours" }
        ],
        correctAnswer: "C",
        hint: "Listen to Minh's answer about his evening game time.",
        explanation: "Minh cho biết: 'I spend about four hours every evening playing computer games.' Đáp án C là khoảng 4 tiếng.",
        difficulty: "A2",
        score: 1.0,
        answer: "C",
        sourceLocator: "GỦI.docx:P#699:Ex30"
      },
      {
        id: "g7-u2-l1-q4",
        type: "multiple_choice",
        prompt: "What sports does the doctor advise Minh to do for at least thirty minutes a day?",
        audioUrl: "/audio/g7-u2-healthy-habits.mp3",
        passage: "Doctor Jones: Instead of sitting inside, you should cycle, jog, or play badminton for at least thirty minutes each day.",
        options: [
          { id: "A", text: "Cycle, jog, or play badminton" },
          { id: "B", text: "Play video games" },
          { id: "C", text: "Watch action movies" },
          { id: "D", text: "Sleep in bed all day" }
        ],
        correctAnswer: "A",
        hint: "Listen to the outdoor activities mentioned after 'at least thirty minutes'.",
        explanation: "Bác sĩ khuyên: 'you should cycle, jog, or play badminton for at least thirty minutes each day.' Đáp án A chính xác.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#699:Ex30"
      },
      {
        id: "g7-u2-l1-q5",
        type: "multiple_choice",
        prompt: "What is the key message Doctor Jones shares at the end of the consultation?",
        audioUrl: "/audio/g7-u2-healthy-habits.mp3",
        passage: "Doctor Jones: Good boy! Remember: a healthy lifestyle is the best medicine.",
        options: [
          { id: "A", text: "Computer games make you smarter" },
          { id: "B", text: "A healthy lifestyle is the best medicine" },
          { id: "C", text: "Drinking soda gives you energy" },
          { id: "D", text: "Never do physical sports" }
        ],
        correctAnswer: "B",
        hint: "Listen to the very last sentence spoken by Doctor Jones.",
        explanation: "Câu kết luận nổi tiếng của Bác sĩ: 'Remember: a healthy lifestyle is the best medicine.' (Lối sống lành mạnh là phương thuốc tốt nhất). Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#699:Ex30"
      }
    ]
  },

  // LESSON 7: LISTENING 2 - SKIN CARE & SUNBURN (5 questions + Real Audio)
  {
    id: "g7-u2-les-07",
    skill: "listening",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Listening: Skin Care & Sunburn Prevention Talk",
    description: "Nghe bài nói của Y tá Linda về cách bảo vệ làn da trong mùa hè: chống cháy nắng, ngừa mụn và ngăn ngừa nứt môi.",
    durationMinutes: 15,
    targetCefr: "A2",
    status: "ready",
    provenance: "Biên soạn sư phạm đối sánh theo GỦI.docx:P#710 (Exercise 31) & Bản thu MP3 giọng bản ngữ chuẩn",
    questions: [
      {
        id: "g7-u2-l2-q1",
        type: "multiple_choice",
        prompt: "When is the sun's radiation strongest during the day?",
        audioUrl: "/audio/g7-u2-skin-care-tips.mp3",
        passage: "[Audio Transcript]\nNurse Linda: Hello everyone. Welcome to our school health talk about skin care and outdoor wellness.\nDuring the summer, many teenagers suffer from sunburn and acne. Today, I will share three essential tips to protect your skin.\nFirst, always protect yourself from the sun. The sun is strongest between 10 a.m. and 4 p.m. If you go outside or go boating, wear a wide-brimmed hat, sunglasses, and apply suncream with SPF 30 or higher. Suncream prevents painful sunburn and skin damage.\nSecond, drink plenty of fresh water every day. Water keeps your skin hydrated and flushes out harmful toxins. When weather gets dry or windy, use lip balm to prevent chapped lips.\nThird, keep your face clean to prevent acne. Wash your face twice a day with warm water and mild soap. Avoid touching your face with dirty hands, and never squeeze red spots or pimples.\nFinally, remember to eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes. Nutritious food gives your skin a healthy glow!\nThank you for listening. Stay healthy and enjoy your summer!",
        options: [
          { id: "A", text: "Before 7 a.m." },
          { id: "B", text: "Between 10 a.m. and 4 p.m." },
          { id: "C", text: "After 6 p.m. in the evening" },
          { id: "D", text: "Only at midnight" }
        ],
        correctAnswer: "B",
        hint: "Listen for the specific time interval in tip number one.",
        explanation: "Y tá Linda nêu rõ: 'The sun is strongest between 10 a.m. and 4 p.m.' (Ánh nắng gay gắt nhất từ 10 giờ sáng đến 4 giờ chiều). Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#710:Ex31"
      },
      {
        id: "g7-u2-l2-q2",
        type: "multiple_choice",
        prompt: "What should you apply to your lips when the weather is dry or windy?",
        audioUrl: "/audio/g7-u2-skin-care-tips.mp3",
        passage: "Nurse Linda: When weather gets dry or windy, use lip balm to prevent chapped lips.",
        options: [
          { id: "A", text: "Cold water only" },
          { id: "B", text: "Lip balm" },
          { id: "C", text: "Toothpaste" },
          { id: "D", text: "Spicy sauce" }
        ],
        correctAnswer: "B",
        hint: "A common cosmetic product for lips mentioned in the speech.",
        explanation: "Y tá khuyên: 'use lip balm to prevent chapped lips' (dùng sáp dưỡng môi để tránh nẻ môi). Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#710:Ex31"
      },
      {
        id: "g7-u2-l2-q3",
        type: "true_false",
        prompt: "Statement: According to Nurse Linda, teenagers should squeeze pimples and red spots to heal acne faster.",
        audioUrl: "/audio/g7-u2-skin-care-tips.mp3",
        passage: "Nurse Linda: Avoid touching your face with dirty hands, and never squeeze red spots or pimples.",
        options: [
          { id: "True", text: "True (Đúng)" },
          { id: "False", text: "False (Sai)" }
        ],
        correctAnswer: "False",
        hint: "Listen to the word 'never squeeze...'",
        explanation: "Y tá nhấn mạnh: 'never squeeze red spots or pimples' (tuyệt đối không nặn mụn nhọt). Vì vậy nhận định trên là Sai (False).",
        difficulty: "A2",
        score: 1.0,
        answer: "False",
        sourceLocator: "GỦI.docx:P#710:Ex31"
      },
      {
        id: "g7-u2-l2-q4",
        type: "multiple_choice",
        prompt: "How many times a day should teenagers wash their faces with warm water and mild soap?",
        audioUrl: "/audio/g7-u2-skin-care-tips.mp3",
        passage: "Nurse Linda: Wash your face twice a day with warm water and mild soap.",
        options: [
          { id: "A", text: "Once a week" },
          { id: "B", text: "Twice a day" },
          { id: "C", text: "Ten times a day" },
          { id: "D", text: "Only when having a party" }
        ],
        correctAnswer: "B",
        hint: "Listen to the frequency: 'Wash your face... a day.'",
        explanation: "Bài nói nêu rõ: 'Wash your face twice a day' (rửa mặt 2 lần mỗi ngày). Chọn B.",
        difficulty: "A2",
        score: 1.0,
        answer: "B",
        sourceLocator: "GỦI.docx:P#710:Ex31"
      },
      {
        id: "g7-u2-l2-q5",
        type: "multiple_choice",
        prompt: "Which healthy foods does Nurse Linda recommend to give skin a healthy glow?",
        audioUrl: "/audio/g7-u2-skin-care-tips.mp3",
        passage: "Nurse Linda: Finally, remember to eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes.",
        options: [
          { id: "A", text: "Green vegetables, tofu, and fruits like oranges and tomatoes" },
          { id: "B", text: "Chips and hamburgers" },
          { id: "C", text: "Salty snacks and soda" },
          { id: "D", text: "Chocolates only" }
        ],
        correctAnswer: "A",
        hint: "Listen for green vegetables, tofu, and fruits.",
        explanation: "Y tá kết luận: 'eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes'. Chọn A.",
        difficulty: "A2",
        score: 1.0,
        answer: "A",
        sourceLocator: "GỦI.docx:P#710:Ex31"
      }
    ]
  },

  // LESSON 8: WRITING WORKSHOP (3 Prompts with Detailed Rubrics)
  {
    id: "g7-u2-les-08",
    skill: "writing",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Writing: Healthy Habits Paragraph & Email of Advice",
    description: "Xưởng thực hành Viết: Đoạn văn ngắn về bí quyết giữ sức khỏe, email khuyên bạn điều chỉnh lối sống và kết hợp câu.",
    durationMinutes: 20,
    targetCefr: "A2",
    status: "ready",
    provenance: "Biên soạn sư phạm theo CT GDPT 2018 Tiếng Anh 7 Unit 2 & GỦI.docx:P#562 (Exercise 23)",
    questions: [
      {
        id: "g7-u2-w-q1",
        type: "writing",
        prompt: "Prompt 1: Write a paragraph (50 - 60 words) about how to keep fit and stay healthy. Guiding questions:\n1. What healthy food should you eat daily?\n2. What sports or outdoor exercises do you do?\n3. Why is getting enough sleep important?",
        passage: null,
        options: null,
        correctAnswer: "To keep fit and stay healthy, I eat lots of fresh green vegetables, tofu, and fruit every day. I also avoid drinking sugary soft drinks. In the late afternoon, I cycle around the park with my brother for thirty minutes. Finally, I always go to bed before 10 p.m. because getting enough sleep keeps my mind fresh and energetic.",
        hint: "Use coordinating conjunctions (and, but, so) and modal verb 'should'.",
        explanation: "Tiêu chí chấm đoạn văn (Thang điểm 3.0):\n- Task Achievement (1.0đ): Trả lời đủ 3 câu hỏi gợi ý, độ dài 50-60 từ.\n- Lexical Resource (1.0đ): Dùng đúng từ vựng Unit 2 (keep fit, tofu, sugary soft drinks, cycle, energetic).\n- Grammatical Accuracy (1.0đ): Dùng chuẩn thì Hiện tại đơn, liên từ nối and/but/so/because, không mắc lỗi chính tả.",
        difficulty: "A2",
        score: 3.0,
        answer: "To keep fit and stay healthy, I eat lots of fresh green vegetables, tofu, and fruit every day. I also avoid drinking sugary soft drinks. In the late afternoon, I cycle around the park with my brother for thirty minutes. Finally, I always go to bed before 10 p.m. because getting enough sleep keeps my mind fresh and energetic."
      },
      {
        id: "g7-u2-w-q2",
        type: "writing",
        prompt: "Prompt 2: Your friend Linh often skips breakfast, stays up late playing video games, and has acne on her face. Write a short email (60 - 80 words) giving her healthy advice.",
        passage: null,
        options: null,
        correctAnswer: "Dear Linh,\nI am writing to share some health advice with you. You should never skip breakfast because your body needs morning energy. You should also stop playing computer games late at night and sleep at least eight hours. To treat your acne, wash your face twice a day with warm water and avoid touching red spots with dirty hands. Drink plenty of fresh water and eat more fruits!\nTake care,\nAn",
        hint: "Format: Dear [Name], Advice with 'You should / shouldn't', Closing.",
        explanation: "Tiêu chí chấm Email (Thang điểm 4.0):\n- Task Completion (1.5đ): Khuyên đủ 3 vấn đề (bỏ bữa sáng, thức khuya, trị mụn).\n- Cohesion & Register (1.0đ): Định dạng email thân mật (Dear..., Take care, An), sử dụng liên từ.\n- Grammar & Vocabulary (1.5đ): Sử dụng linh hoạt cấu trúc lời khuyên 'You should/shouldn't...', từ vựng chăm sóc da chuẩn xác.",
        difficulty: "A2",
        score: 4.0,
        answer: "Dear Linh,\nI am writing to share some health advice with you. You should never skip breakfast because your body needs morning energy. You should also stop playing computer games late at night and sleep at least eight hours. To treat your acne, wash your face twice a day with warm water and avoid touching red spots with dirty hands. Drink plenty of fresh water and eat more fruits!\nTake care,\nAn"
      },
      {
        id: "g7-u2-w-q3",
        type: "writing",
        prompt: "Prompt 3: Combine each pair of sentences into one compound sentence using the conjunction in brackets:\n1. Phong eats a lot of fruit. He does not gain weight. (but)\n2. Wear a warm coat. You will catch a cold. (or)\n3. Linda was very tired. She went to bed early last night. (so)",
        passage: null,
        options: null,
        correctAnswer: "1. Phong eats a lot of fruit, but he does not gain weight.\n2. Wear a warm coat, or you will catch a cold.\n3. Linda was very tired, so she went to bed early last night.",
        hint: "Remember to place a comma before coordinating conjunctions when connecting two independent clauses.",
        explanation: "Tiêu chí chấm (Thang điểm 3.0 - mỗi câu 1.0đ):\n1. Nối bằng 'but' chỉ sự đối lập có dấu phẩy.\n2. Nối bằng 'or' đưa ra lời cảnh báo có dấu phẩy.\n3. Nối bằng 'so' chỉ kết quả nguyên nhân có dấu phẩy.",
        difficulty: "A2",
        score: 3.0,
        answer: "1. Phong eats a lot of fruit, but he does not gain weight.\n2. Wear a warm coat, or you will catch a cold.\n3. Linda was very tired, so she went to bed early last night."
      }
    ]
  },

  // LESSON 9: SPEAKING STUDIO (3 Prompts with Detailed Rubrics)
  {
    id: "g7-u2-les-09",
    skill: "speaking",
    unitId: "unit-g7-u2",
    unitTitle: "Unit 2: Healthy Living",
    courseTitle: "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    title: "Speaking: Health Advice & Daily Lifestyle Interview",
    description: "Phòng thực hành Nói: Thuyết trình về lối sống lành mạnh, đóng vai bác sĩ tư vấn và tranh luận về màn hình điện tử (có ghi âm & tiêu chí chấm).",
    durationMinutes: 20,
    targetCefr: "A2",
    status: "ready",
    provenance: "Biên soạn sư phạm theo chuẩn GDPT 2018 Tiếng Anh 7 Unit 2 & GỦI.docx:P#385 (Exercise 14)",
    questions: [
      {
        id: "g7-u2-s-q1",
        type: "speaking",
        prompt: "Prompt 1: Talk about your daily eating habits and outdoor activities (1 - 1.5 minutes).\nGuiding cues:\n- What do you eat and drink for breakfast and lunch?\n- What physical exercise or sport do you practice?\n- How do you feel after doing sports?\n[Click Record to record your speech in English]",
        passage: null,
        options: null,
        correctAnswer: "Hello teacher. Today I would like to tell you about my daily habits. Every morning, I have breakfast with bread, boiled eggs, and a glass of warm milk. For lunch, I eat rice with fish, tofu, and plenty of green vegetables. In the afternoon, I often play badminton with my father in the schoolyard for forty minutes. Playing sports makes me sweat and feel very energetic. I think eating fresh food and exercising every day helps me avoid illnesses.",
        hint: "Speak clearly. Focus on pronunciation of sounds /f/ (fish, fresh) and /v/ (vegetables, avoid).",
        explanation: "Tiêu chí AI & Giáo viên đánh giá (Thang điểm 5.0):\n1. Pronunciation (1.5đ): Phát âm rõ ràng các âm /f/ (food, fit) và /v/ (vegetables, avoid).\n2. Fluency (1.5đ): Nói liền mạch, tốc độ vừa phải, ngắt nghỉ hợp lý.\n3. Vocabulary & Grammar (2.0đ): Dùng đúng thì Hiện tại đơn, vốn từ vựng phong phú thuộc chủ đề Healthy Living.",
        difficulty: "A2",
        score: 5.0,
        answer: "Hello teacher. Today I would like to tell you about my daily habits. Every morning, I have breakfast with bread, boiled eggs, and a glass of warm milk. For lunch, I eat rice with fish, tofu, and plenty of green vegetables. In the afternoon, I often play badminton with my father in the schoolyard for forty minutes. Playing sports makes me sweat and feel very energetic. I think eating fresh food and exercising every day helps me avoid illnesses."
      },
      {
        id: "g7-u2-s-q2",
        type: "speaking",
        prompt: "Prompt 2: Roleplay - You are a school health adviser. Give practical suggestions to a student who has sunburn and eye strain from playing computer games (1 - 1.5 minutes).\n[Click Record to deliver your advice]",
        passage: null,
        options: null,
        correctAnswer: "Hello! Don't worry, I can help you with your health problems. First, about your eye strain, you must reduce your computer screen time. Staring at screens in dim light makes your eyes very tired. Remember to take a five-minute break after every thirty minutes of computer use. Second, to treat your sunburn, apply aloe vera gel and drink plenty of fresh water. When you go outside, always wear a wide-brimmed hat and apply suncream. Follow these tips and you will feel much better soon!",
        hint: "Use modal verbs: 'You should...', 'You must...', 'Remember to...'",
        explanation: "Tiêu chí chấm Roleplay (Thang điểm 5.0):\n1. Communicative Purpose (2.0đ): Đưa ra đúng lời khuyên y tế cho 2 triệu chứng cháy nắng và mỏi mắt.\n2. Language Structure (1.5đ): Sử dụng thành thạo các cấu trúc khuyên nhủ (You should, You must, Don't worry).\n3. Pronunciation & Intonation (1.5đ): Ngữ điệu động viên, ngữ âm rõ ràng.",
        difficulty: "A2",
        score: 5.0,
        answer: "Hello! Don't worry, I can help you with your health problems. First, about your eye strain, you must reduce your computer screen time. Staring at screens in dim light makes your eyes very tired. Remember to take a five-minute break after every thirty minutes of computer use. Second, to treat your sunburn, apply aloe vera gel and drink plenty of fresh water. When you go outside, always wear a wide-brimmed hat and apply suncream. Follow these tips and you will feel much better soon!"
      },
      {
        id: "g7-u2-s-q3",
        type: "speaking",
        prompt: "Prompt 3: Presentation - 'Screen Time vs. Outdoor Activities for Teenagers' (1.5 - 2 minutes).\nDiscuss: Why many teens spend too much time on screens, the negative effects on health, and why outdoor sports are essential.\n[Click Record to deliver your presentation]",
        passage: null,
        options: null,
        correctAnswer: "Good morning teacher and classmates. Today I want to discuss screen time and outdoor activities. Nowadays, many teenagers spend four to five hours every day on smartphones and computer games. This sedentary habit causes serious health issues such as eye strain, headaches, and obesity. Furthermore, lack of sleep makes students unable to concentrate at school. In my opinion, teenagers should balance their life by participating in outdoor sports like cycling, jogging, or playing football. Outdoor activities strengthen our muscles, give us fresh air, and help us make new friends. Let us turn off our screens and step outside to stay healthy!",
        hint: "Structure your speech: Introduction, Problems of screen time, Benefits of outdoor sports, Conclusion.",
        explanation: "Tiêu chí chấm Thuyết trình (Thang điểm 5.0):\n1. Content & Structure (2.0đ): Bố cục 3 phần rõ ràng, lập luận chặt chẽ có dẫn chứng.\n2. Coherence & Fluency (1.5đ): Dùng các từ nối (Nowadays, Furthermore, In my opinion, Let us).\n3. Pronunciation & Range (1.5đ): Vốn từ học thuật A2-B1 (sedentary, concentration, obesity, essential).",
        difficulty: "A2",
        score: 5.0,
        answer: "Good morning teacher and classmates. Today I want to discuss screen time and outdoor activities. Nowadays, many teenagers spend four to five hours every day on smartphones and computer games. This sedentary habit causes serious health issues such as eye strain, headaches, and obesity. Furthermore, lack of sleep makes students unable to concentrate at school. In my opinion, teenagers should balance their life by participating in outdoor sports like cycling, jogging, or playing football. Outdoor activities strengthen our muscles, give us fresh air, and help us make new friends. Let us turn off our screens and step outside to stay healthy!"
      }
    ]
  }
];

// Append new lessons to initialLessons
const lessonInsertMarker = 'export const initialLessons: Lesson[] = [';
const lessonInsertIndex = code.indexOf(lessonInsertMarker);
if (lessonInsertIndex !== -1) {
  const lessonArrayStart = lessonInsertIndex + lessonInsertMarker.length;
  const newLessonsString = '\n' + g7u2Lessons.map(l => '  ' + JSON.stringify(l, null, 2).replace(/\n/g, '\n  ') + ',').join('\n');
  code = code.slice(0, lessonArrayStart) + newLessonsString + code.slice(lessonArrayStart);
  console.log(`Injected ${g7u2Lessons.length} comprehensive Grade 7 Unit 2 lessons into initialLessons.`);
}

fs.writeFileSync(mockDataPath, code, 'utf8');
console.log('Successfully written updated mockData.ts with complete Grade 7 Unit 2 module.');
