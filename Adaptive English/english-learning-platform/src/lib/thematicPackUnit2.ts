export interface ThematicVocabItem {
  no: number;
  word: string;
  type: string;
  ipa: string;
  meaning: string;
  example?: string;
}

export interface WordFormFamily {
  root: string;
  meaning: string;
  derivatives: { form: string; type: string; meaning: string }[];
}

export interface GrammarRule {
  id: string;
  pattern: string;
  name: string;
  example: string;
  explanation: string;
}

export interface ImportedExercise {
  id: string;
  exerciseNumber: number;
  title: string;
  category: 'vocabulary_grammar' | 'communication' | 'reading' | 'writing' | 'listening';
  type:
    | 'multiple_choice'
    | 'image_multiple_choice'
    | 'word_bank'
    | 'inline_word_selection'
    | 'object_adverb_labeling'
    | 'matching'
    | 'sentence_completion'
    | 'word_form'
    | 'dialogue_ordering_mcq'
    | 'cloze_reading'
    | 'sign_notice_reading'
    | 'reading_comprehension'
    | 'sentence_reorder'
    | 'sentence_transformation'
    | 'paragraph_ordering_mcq'
    | 'listening_mcq'
    | 'listening_true_false_table';
  instruction: string;
  questionCount: number;
  hasImages?: boolean;
  imageCount?: number;
  hasAudio?: boolean;
  audioMissing?: boolean;
  hasSourceError?: boolean;
  sourceErrorNotes?: string;
  suggestedFix?: string;
  originalFormatNote?: string;
  sampleItems: any;
}

export const thematicPackUnit2 = {
  id: 'pack-unit-2',
  title: 'UNIT 2: HEALTHY LIVING',
  cefrLevel: 'A2 - B1',
  targetAudience: 'Secondary / Foundation',
  totalVocabCount: 41,
  totalWordFormCount: 8,
  totalExercisesCount: 27,
  totalImagesCount: 15,
  vocabulary: [
    { no: 1, word: 'health', type: '(n)', ipa: '/helθ/', meaning: 'sức khỏe' },
    { no: 2, word: 'healthy', type: '(adj)', ipa: '/ˈhelθi/', meaning: 'khỏe mạnh' },
    { no: 3, word: 'health problems', type: '(n. phr.)', ipa: '/helθ ˈprɒbləmz/', meaning: 'các vấn đề về sức khỏe' },
    { no: 4, word: 'healthy activities', type: '(n. phr.)', ipa: '/ˈhelθi ækˈtɪvətiz/', meaning: 'các hoạt động lành mạnh' },
    { no: 5, word: 'boating', type: '(n)', ipa: '/ˈboʊtɪŋ/', meaning: 'việc chèo thuyền' },
    { no: 6, word: 'go boating', type: '(v. phr.)', ipa: '/ɡoʊ ˈboʊtɪŋ/', meaning: 'đi chèo thuyền' },
    { no: 7, word: 'cycling', type: '(n)', ipa: '/ˈsaɪklɪŋ/', meaning: 'việc đạp xe' },
    { no: 8, word: 'go cycling', type: '(v. phr.)', ipa: '/ɡoʊ ˈsaɪklɪŋ/', meaning: 'đi đạp xe' },
    { no: 9, word: 'exercise', type: '(n/v)', ipa: '/ˈeksərsaɪz/', meaning: 'bài tập thể dục/tập thể dục' },
    { no: 10, word: 'exercising', type: '(n)', ipa: '/ˈeksərsaɪzɪŋ/', meaning: 'việc tập thể dục' },
    { no: 11, word: 'fit', type: '(adj)', ipa: '/fɪt/', meaning: 'khỏe mạnh, cân đối' },
    { no: 12, word: 'keep fit', type: '(v. phr.)', ipa: '/kiːp fɪt/', meaning: 'giữ dáng, giữ sức khỏe' },
    { no: 13, word: 'active', type: '(adj)', ipa: '/ˈæktɪv/', meaning: 'năng động' },
    { no: 14, word: 'activity', type: '(n)', ipa: '/ækˈtɪvəti/', meaning: 'hoạt động' },
    { no: 15, word: 'indoor', type: '(adj)', ipa: '/ˈɪndɔːr/', meaning: 'trong nhà' },
    { no: 16, word: 'outdoor', type: '(adj)', ipa: '/ˈaʊtdɔːr/', meaning: 'ngoài trời' },
    { no: 17, word: 'outdoor activities', type: '(n. phr.)', ipa: '/ˈaʊtdɔːr ækˈtɪvətiz/', meaning: 'các hoạt động ngoài trời' },
    { no: 18, word: 'suncream', type: '(n)', ipa: '/ˈsʌnkriːm/', meaning: 'kem chống nắng' },
    { no: 19, word: 'sunburn', type: '(n)', ipa: '/ˈsʌnbɜːrn/', meaning: 'cháy nắng' },
    { no: 20, word: 'lunch box', type: '(n)', ipa: '/ˈlʌntʃ bɒks/', meaning: 'hộp đựng thức ăn trưa' },
    { no: 21, word: 'dim', type: '(adj)', ipa: '/dɪm/', meaning: 'mờ, lờ mờ' },
    { no: 22, word: 'dim light', type: '(n. phr.)', ipa: '/dɪm laɪt/', meaning: 'ánh sáng mờ' },
    { no: 23, word: 'lip balm', type: '(n)', ipa: '/ˈlɪp bɑːm/', meaning: 'son dưỡng môi' },
    { no: 24, word: 'chapped', type: '(adj)', ipa: '/tʃæpt/', meaning: 'nứt nẻ' },
    { no: 25, word: 'chapped lips', type: '(n. phr.)', ipa: '/tʃæpt lɪps/', meaning: 'môi nứt nẻ' },
    { no: 26, word: 'chapped skin', type: '(n. phr.)', ipa: '/tʃæpt skɪn/', meaning: 'da nứt nẻ' },
    { no: 27, word: 'skin', type: '(n)', ipa: '/skɪn/', meaning: 'da' },
    { no: 28, word: 'skin condition', type: '(n. phr.)', ipa: '/skɪn kənˈdɪʃn/', meaning: 'tình trạng da' },
    { no: 29, word: 'acne', type: '(n)', ipa: '/ˈækni/', meaning: 'mụn trứng cá' },
    { no: 30, word: 'spot', type: '(n)', ipa: '/spɒt/', meaning: 'mụn nhỏ, đốm' },
    { no: 31, word: 'red spots', type: '(n. phr.)', ipa: '/red spɒts/', meaning: 'các đốm đỏ, nốt đỏ' },
    { no: 32, word: 'tofu', type: '(n)', ipa: '/ˈtoʊfuː/', meaning: 'đậu phụ' },
    { no: 33, word: 'soybean', type: '(n)', ipa: '/ˈsɔɪbiːn/', meaning: 'đậu nành' },
    { no: 34, word: 'protein', type: '(n)', ipa: '/ˈproʊtiːn/', meaning: 'chất đạm, protein' },
    { no: 35, word: 'vegetable', type: '(n)', ipa: '/ˈvedʒtəbl/', meaning: 'rau củ' },
    { no: 36, word: 'soft drinks', type: '(n. phr.)', ipa: '/sɒft drɪŋks/', meaning: 'nước ngọt' },
    { no: 37, word: 'affect', type: '(v)', ipa: '/əˈfekt/', meaning: 'ảnh hưởng' },
    { no: 38, word: 'avoid', type: '(v)', ipa: '/əˈvɔɪd/', meaning: 'tránh' },
    { no: 39, word: 'diet', type: '(n)', ipa: '/ˈdaɪət/', meaning: 'chế độ ăn uống' },
    { no: 40, word: 'vegetarian', type: '(n/adj)', ipa: '/ˌvedʒəˈteəriən/', meaning: 'người ăn chay/ăn chay' },
    { no: 41, word: 'be on a diet', type: '(v. phr.)', ipa: '/bi ɒn ə ˈdaɪət/', meaning: 'đang ăn kiêng' },
  ] as ThematicVocabItem[],

  wordForms: [
    {
      root: 'affect (v)',
      meaning: 'ảnh hưởng',
      derivatives: [
        { form: 'affection', type: '(n)', meaning: 'sự yêu mến, tình cảm' },
        { form: 'affected', type: '(adj)', meaning: 'bị ảnh hưởng, giả tạo' },
        { form: 'affectingly', type: '(adv)', meaning: 'một cách cảm động' },
      ],
    },
    {
      root: 'avoid (v)',
      meaning: 'tránh',
      derivatives: [
        { form: 'avoidance', type: '(n)', meaning: 'sự tránh né' },
        { form: 'avoidable', type: '(adj)', meaning: 'có thể tránh được' },
        { form: 'unavoidable', type: '(adj)', meaning: 'không thể tránh khỏi' },
        { form: 'unavoidably', type: '(adv)', meaning: 'một cách không thể tránh khỏi' },
      ],
    },
    {
      root: 'fat (n)',
      meaning: 'chất béo, mỡ',
      derivatives: [
        { form: 'fat', type: '(adj)', meaning: 'béo, mập' },
        { form: 'fatten', type: '(v)', meaning: 'vỗ béo, làm béo' },
        { form: 'fatty', type: '(adj)', meaning: 'có nhiều mỡ, béo' },
      ],
    },
    {
      root: 'fit (v)',
      meaning: 'vừa vặn, lắp vào',
      derivatives: [
        { form: 'fit', type: '(adj)', meaning: 'vừa vặn, khỏe mạnh, cân đối' },
        { form: 'fitness', type: '(n)', meaning: 'sự vừa vặn, thể lực, sự khỏe mạnh' },
        { form: 'fitting', type: '(adj)', meaning: 'phù hợp, thích hợp' },
      ],
    },
    {
      root: 'health (n)',
      meaning: 'sức khỏe',
      derivatives: [
        { form: 'healthy', type: '(adj)', meaning: 'khỏe mạnh' },
        { form: 'unhealthy', type: '(adj)', meaning: 'không khỏe mạnh' },
        { form: 'healthily', type: '(adv)', meaning: 'một cách khỏe mạnh' },
        { form: 'unhealthily', type: '(adv)', meaning: 'một cách không khỏe mạnh' },
      ],
    },
    {
      root: 'act (v)',
      meaning: 'hành động, diễn xuất',
      derivatives: [
        { form: 'action', type: '(n)', meaning: 'hành động' },
        { form: 'activity', type: '(n)', meaning: 'hoạt động' },
        { form: 'active', type: '(adj)', meaning: 'năng động, tích cực' },
        { form: 'inactive', type: '(adj)', meaning: 'không năng động, thụ động' },
        { form: 'actively', type: '(adv)', meaning: 'một cách năng động' },
      ],
    },
    {
      root: 'differ (v)',
      meaning: 'khác nhau, bất đồng',
      derivatives: [
        { form: 'difference', type: '(n)', meaning: 'sự khác biệt' },
        { form: 'different', type: '(adj)', meaning: 'khác biệt' },
        { form: 'differently', type: '(adv)', meaning: 'một cách khác biệt' },
        { form: 'differentiate', type: '(v)', meaning: 'phân biệt' },
      ],
    },
    {
      root: 'strengthen (v)',
      meaning: 'củng cố, làm mạnh thêm',
      derivatives: [
        { form: 'strength', type: '(n)', meaning: 'sức mạnh' },
        { form: 'strong', type: '(adj)', meaning: 'mạnh mẽ, khỏe' },
        { form: 'strongly', type: '(adv)', meaning: 'một cách mạnh mẽ' },
      ],
    },
  ] as WordFormFamily[],

  grammar: {
    title: '1. Simple sentences (Câu đơn)',
    description:
      'Câu đơn là câu chỉ có 1 mệnh đề chính, gồm có 1 chủ ngữ và 1 động từ hoặc câu có thể có chủ ngữ là 2 danh từ nối bằng "and" hoặc có 2 động từ nối bằng "and" nhưng vẫn là 1 câu đơn. Eg: Linda and Jenny are playing tennis.',
    patterns: [
      { pattern: 'S + V + (+ Adv)', example: 'The Sun rises (in the East).' },
      { pattern: 'S + V + C', example: 'He is a teacher.' },
      { pattern: 'S + V + O', example: 'He likes coffee.' },
      { pattern: 'S + V + prep + O', example: 'They are looking at the picture.' },
    ],
  },

  exercises: [
    {
      id: 'ex-3',
      exerciseNumber: 3,
      title: 'Exercise 3: Choose the odd one out in each group',
      category: 'vocabulary_grammar',
      type: 'multiple_choice',
      instruction: 'Chọn từ khác nhóm trong mỗi nhóm từ sau.',
      questionCount: 5,
      sampleItems: [
        { no: 1, options: ['A. interesting', 'B. popular', 'C. nice', 'D. lunch'], answer: 'D. lunch' },
        { no: 2, options: ['A. sunburn', 'B. chapped lips', 'C. red spots', 'D. cycling'], answer: 'D. cycling' },
        { no: 3, options: ['A. wash', 'B. sad', 'C. wear', 'D. brush'], answer: 'B. sad' },
        { no: 4, options: ['A. carrot', 'B. tomato', 'C. lemonade', 'D. potato'], answer: 'C. lemonade' },
        { no: 5, options: ['A. interesting', 'B. swimming', 'C. cycling', 'D. running'], answer: 'A. interesting' },
      ],
    },
    {
      id: 'ex-4',
      exerciseNumber: 4,
      title: 'Exercise 4: Multiple Choice Grammar & Vocab',
      category: 'vocabulary_grammar',
      type: 'multiple_choice',
      instruction: 'Choose the word/ phrase/ sentence (A, B, C, or D) that best fits the space.',
      questionCount: 2,
      sampleItems: [
        {
          no: 1,
          prompt: 'If people _________ healthy food, they _________ good health.',
          options: ['A. eat - would have', 'B. ate - will Ihave', 'C. eat - will have', 'D. ate - would have'],
          answer: 'C. eat - will have',
        },
        {
          no: 2,
          prompt: 'You should avoid _________ cold water when you _________ a cough.',
          options: ['A. to drink - have', 'B. drinking - have', 'C. to drink - are having', 'D. drinking - are having'],
          answer: 'B. drinking - have',
        },
      ],
    },
    {
      id: 'ex-5',
      exerciseNumber: 5,
      title: 'Exercise 5: Look at the pictures. Choose the most suitable words',
      category: 'vocabulary_grammar',
      type: 'image_multiple_choice',
      instruction: 'Nhìn hình ảnh và chọn từ vựng tương ứng (5 hình nhúng trong tệp gốc).',
      questionCount: 5,
      hasImages: true,
      imageCount: 5,
      sampleItems: [
        { no: 1, imageLabel: 'Hình môi nứt nẻ', options: ['A. sunburn', 'B. dim light', 'C. headache', 'D. chapped lips'], answer: 'D. chapped lips' },
        { no: 2, imageLabel: 'Hình tuýp kem chống nắng', options: ['A. fever', 'B. toothache', 'C. suncream', 'D. cough'], answer: 'C. suncream' },
        { no: 3, imageLabel: 'Hình người bị cháy nắng ngoài trời', options: ['A. obesity', 'B. earache', 'C. sunburn', 'D. flu'], answer: 'C. sunburn' },
        { no: 4, imageLabel: 'Hình rổ rau củ quả', options: ['A. boating', 'B. lip balm', 'C. vegetables', 'D. skin'], answer: 'C. vegetables' },
        { no: 5, imageLabel: 'Hình đĩa đậu phụ sốt', options: ['A. tofu', 'B. meat', 'C. egg', 'D. fish'], answer: 'A. tofu' },
      ],
    },
    {
      id: 'ex-8',
      exerciseNumber: 8,
      title: 'Exercise 8: Put one of the words in each blank (Word Bank)',
      category: 'vocabulary_grammar',
      type: 'word_bank',
      instruction: 'Điền các từ cho sẵn trong hộp vào ô trống thích hợp.',
      questionCount: 6,
      sampleItems: {
        bank: ['soybeans', 'suncream', 'affects', 'early', 'for', 'tired'],
        questions: [
          { id: 'q8-1', prefix: 'Acne', suffix: 'about 70% of young people between 12 and 25.', correctWord: 'affects' },
          { id: 'q8-2', prefix: 'You should go to bed', suffix: 'and get enough sleep.', correctWord: 'early' },
          { id: 'q8-3', prefix: "I get sunburn because I don't use", suffix: '.', correctWord: 'suncream' },
          { id: 'q8-4', prefix: 'We need vitamin A', suffix: 'our eyes.', correctWord: 'for' },
          { id: 'q8-5', prefix: 'Tofu is a product from', suffix: '.', correctWord: 'soybeans' },
          { id: 'q8-6', prefix: 'If your eyes are', suffix: ', you can use eyedrops.', correctWord: 'tired' },
        ],
      },
    },
    {
      id: 'ex-9',
      exerciseNumber: 9,
      title: 'Exercise 9: Underline Subject and Circle Verb in simple sentences',
      category: 'vocabulary_grammar',
      type: 'inline_word_selection',
      instruction: 'Bấm chọn từ trực tiếp trong câu: gạch chân Chủ ngữ (S) và khoanh tròn Động từ (V).',
      questionCount: 5,
      sampleItems: [
        { no: 1, sentence: 'Tofu has vegetable protein and vitamin B.', subject: ['Tofu'], verb: ['has'] },
        { no: 2, sentence: 'Acne is not a serious disease.', subject: ['Acne'], verb: ['is'] },
        { no: 3, sentence: 'You shouldn’t go to bed late.', subject: ['You'], verb: ['shouldn’t', 'go'] },
        { no: 4, sentence: 'We should eat more fruits and vegetables.', subject: ['We'], verb: ['should', 'eat'] },
        { no: 5, sentence: 'My brother does morning exercises every day.', subject: ['My', 'brother'], verb: ['does'] },
      ],
    },
    {
      id: 'ex-10',
      exerciseNumber: 10,
      title: 'Exercise 10: Classify underlined words as Objects (O) or Adverbs (Adv)',
      category: 'vocabulary_grammar',
      type: 'object_adverb_labeling',
      instruction: 'Xác định các từ/cụm từ gạch chân trong câu là Tân ngữ (O) hay Trạng từ (Adv).',
      questionCount: 10,
      sampleItems: [
        { no: 1, sentence: 'I read [a book].', highlighted: 'a book', label: 'O' },
        { no: 2, sentence: 'We [seldom] go out.', highlighted: 'seldom', label: 'Adv' },
        { no: 3, sentence: 'Did they take [you] home?', highlighted: 'you', label: 'O' },
        { no: 4, sentence: 'Please bring [me] the book.', highlighted: 'me', label: 'O' },
        { no: 5, sentence: 'I caught [a terrific headache].', highlighted: 'a terrific headache', label: 'O' },
      ],
    },
    {
      id: 'ex-11',
      exerciseNumber: 11,
      title: 'Exercise 11: Match the questions with the answers',
      category: 'vocabulary_grammar',
      type: 'matching',
      instruction: 'Nối câu hỏi ở cột bên trái với câu trả lời phù hợp ở cột bên phải.',
      questionCount: 5,
      sampleItems: [
        { q: '1. What is the matter with you?', a: 'c. I have a flu.' },
        { q: '2. What do you have for breakfast?', a: 'e. Bread, butter and orange juice' },
        { q: '3. How often do you drink milk?', a: 'a. Every day.' },
        { q: '4. How many hours do you sleep a day?', a: 'b. 7 to 8 hours.' },
        { q: '5. Do you like swimming with me?', a: 'd. Yes, I do.' },
      ],
    },
    {
      id: 'ex-12',
      exerciseNumber: 12,
      title: 'Exercise 12: Fill in each blank with no more than FIVE words',
      category: 'vocabulary_grammar',
      type: 'sentence_completion',
      instruction: 'Viết lại câu đơn bằng cách điền không quá 5 từ vào ô trống.',
      questionCount: 5,
      hasSourceError: true,
      sourceErrorNotes:
        'Câu 2, 3, 4, 5 trong tệp gốc có chữ "should" thừa hoặc sai cấu trúc cú pháp: "Jane feels should...", "Both Johnson and should...", "Diego is should...".',
      suggestedFix:
        'Giữ bản gốc có đánh dấu cảnh báo để Giáo viên phê duyệt sửa: Câu 2 -> "Jane feels tired and dizzy"; Câu 3 -> "Both Johnson and his brother like boating".',
      sampleItems: [
        { no: 1, given: 'You should take some medicine. You should see a doctor.', prompt: 'You should _______________ a doctor.' },
        { no: 2, given: 'Jane feels tired. Jane feels dizzy.', prompt: 'Jane feels should _______________ (Lỗi nguồn trong file DOCX)' },
      ],
    },
    {
      id: 'ex-13',
      exerciseNumber: 13,
      title: 'Exercise 13: Supply the correct form of the words in brackets (Word Form)',
      category: 'vocabulary_grammar',
      type: 'word_form',
      instruction: 'Cho dạng đúng của từ trong ngoặc theo ngữ cảnh câu.',
      questionCount: 8,
      sampleItems: [
        { no: 1, sentence: 'What you eat can directly _______________ your energy levels throughout the day.', root: 'affection', answer: 'affect' },
        { no: 2, sentence: 'Many common colds are _______________ if you wash your hands often.', root: 'avoid', answer: 'avoidable' },
        { no: 3, sentence: 'Eating too many _______________ snacks is not good for your heart.', root: 'fat', answer: 'fatty' },
      ],
    },
    {
      id: 'ex-15',
      exerciseNumber: 15,
      title: 'Exercise 15: Arrange sentences into meaningful conversation (Preserve MCQ A/B/C/D)',
      category: 'communication',
      type: 'dialogue_ordering_mcq',
      instruction: 'Chọn đáp án A, B, C, hoặc D để sắp xếp các câu thành đoạn hội thoại hợp lý (Bảo toàn dạng trắc nghiệm gốc, không chuyển thành kéo thả).',
      originalFormatNote: 'Giữ định dạng trắc nghiệm A/B/C/D theo yêu cầu nghiêm ngặt của đề thi.',
      questionCount: 3,
      sampleItems: [
        {
          no: 1,
          lines: [
            "a. Brian: Oh, you mean the man with the red car? Yes, he's obese.",
            "b. Ally: I hope he's healthy.",
            'c. Ally: I saw a new neighbor today. He looks quite big.',
          ],
          options: ['A. a-b-c', 'B. c-a-b', 'C. b-c-a', 'D. a-c-b'],
          answer: 'B. c-a-b',
        },
      ],
    },
    {
      id: 'ex-17',
      exerciseNumber: 17,
      title: 'Exercise 17: Signs & Notices (Look at the sign or notice)',
      category: 'reading',
      type: 'sign_notice_reading',
      instruction: 'Nhìn biển báo hoặc thông báo và chọn đáp án đúng nhất (5 biển báo hình nhúng).',
      questionCount: 5,
      hasImages: true,
      imageCount: 5,
      sampleItems: [
        { no: 1, signText: 'NO! Pushing', options: ['A. You must push someone...', 'B. Watch your steps.', 'C. It’s very dangerous if you push someone in this place.', 'D. You cannot bring pets...'], answer: 'C' },
        { no: 2, signText: 'Biển cấm bơi', options: ['A. You cannot swim here.', 'B. You can go swimming here.', 'C. You cannot swim alone.', 'D. You can go fishing here.'], answer: 'A' },
        { no: 3, signText: 'TICKETS SOLD OUT', options: ['A. There are no tickets left.', 'B. Tickets are sold outside.', 'C. Please go out...', 'D. Ticket isn’t sold...'], answer: 'A' },
      ],
    },
    {
      id: 'ex-20',
      exerciseNumber: 20,
      title: 'Exercise 20: Reading Comprehension Passages',
      category: 'reading',
      type: 'reading_comprehension',
      instruction: 'Đọc đoạn văn và chọn đáp án A, B, C hoặc D cho từng câu hỏi (2 đoạn đọc dài).',
      questionCount: 10,
      sampleItems: [
        {
          passageTitle: 'Đoạn 1: Right and Balanced Diet',
          questionCount: 5,
          firstQuestion: 'What is the main idea of the passage? -> B. How to have a right and balanced diet.',
        },
        {
          passageTitle: 'Đoạn 2: The Importance of Exercise in America',
          questionCount: 5,
          firstQuestion: 'What can be the best title for the passage? -> A. The Importance of Exercise',
        },
      ],
    },
    {
      id: 'ex-29',
      exerciseNumber: 29,
      title: 'Exercise 29: Listening - Multiple Choice',
      category: 'listening',
      type: 'listening_mcq',
      instruction: 'Nghe đoạn ghi âm và chọn câu trả lời đúng.',
      questionCount: 5,
      hasAudio: true,
      audioMissing: true,
      sourceErrorNotes:
        'CẢNH BÁO THIẾU AUDIO: Tệp Word không có tệp âm thanh nhúng. Giáo viên cần tải lên tệp mp3 hoặc thu âm trực tiếp.',
      sampleItems: [
        { no: 1, prompt: 'David enjoys eating _________.', options: ['A. fish', 'B. vegetables', 'C. meat', 'D. fruit'] },
      ],
    },
    {
      id: 'ex-31',
      exerciseNumber: 31,
      title: 'Exercise 31: Listening - True/False Table (Preserve Table & X mark)',
      category: 'listening',
      type: 'listening_true_false_table',
      instruction: 'Nghe đoạn văn và xác định các nhận định là Đúng (T) hay Sai (F) trên bảng.',
      questionCount: 4,
      hasAudio: true,
      audioMissing: true,
      sourceErrorNotes: 'CẢNH BÁO THIẾU AUDIO: Cần tải lên tệp âm thanh nghe về chăm sóc răng miệng (Dental Care).',
      sampleItems: [
        { order: 1, statement: 'Good teeth help us look nice and chew well.', answer: 'T' },
        { order: 2, statement: 'We ought to visit our dentist twice a month.', answer: 'F' },
        { order: 3, statement: 'We should brush our teeth twice a day.', answer: 'T' },
        { order: 4, statement: 'We should drink much water to keep our teeth healthy.', answer: 'F' },
      ],
    },
  ] as ImportedExercise[],
};

export default thematicPackUnit2;
