const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let code = fs.readFileSync(mockDataPath, 'utf8');

// 1. New Vocabulary items for Grade 7 Unit 2 (Healthy Living)
const newVocab = [
  {
    id: "vocab-g7-u2-01",
    term: "sunburn",
    phonetic: "/ˈsʌnbɜːn/",
    partOfSpeech: "noun",
    definition: "Red, painful skin caused by being in the sun too long.",
    example: "Wear a hat and apply suncream to prevent sunburn.",
    cefr: "A2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-02",
    term: "chapped lips",
    phonetic: "/tʃæpt lɪps/",
    partOfSpeech: "noun phr.",
    definition: "Dry, cracked skin on your lips caused by cold weather or wind.",
    example: "In winter, I always use lip balm to avoid chapped lips.",
    cefr: "A2",
    state: "learning",
    intervalDays: 2,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-03",
    term: "acne",
    phonetic: "/ˈækni/",
    partOfSpeech: "noun",
    definition: "A skin condition common in teenagers that causes red spots on the face.",
    example: "Acne affects many young people between the ages of 12 and 20.",
    cefr: "A2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 0,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-04",
    term: "dim light",
    phonetic: "/dɪm laɪt/",
    partOfSpeech: "noun phr.",
    definition: "Light that is not bright enough, which can cause eye strain.",
    example: "Reading in dim light can tire your eyes quickly.",
    cefr: "A2",
    state: "reviewing",
    intervalDays: 3,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 2,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-05",
    term: "vegetarian",
    phonetic: "/ˌvedʒəˈteəriən/",
    partOfSpeech: "noun/adj",
    definition: "A person who does not eat meat or fish.",
    example: "My sister has been a vegetarian for two years and eats lots of vegetables.",
    cefr: "A2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Diet", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-06",
    term: "tofu",
    phonetic: "/ˈtəʊfuː/",
    partOfSpeech: "noun",
    definition: "A soft, white food made from soybeans, rich in vegetable protein.",
    example: "Tofu is a healthy source of protein for vegetarians.",
    cefr: "A2",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Diet", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-07",
    term: "soybeans",
    phonetic: "/ˈsɔɪbiːnz/",
    partOfSpeech: "noun",
    definition: "Small beans from an Asian plant used to make milk, tofu, and oil.",
    example: "Soybeans contain essential vitamins and minerals for the body.",
    cefr: "A2",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Diet", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-08",
    term: "calorie",
    phonetic: "/ˈkæləri/",
    partOfSpeech: "noun",
    definition: "A unit for measuring the amount of energy food provides.",
    example: "Jogging for thirty minutes burns about two hundred calories.",
    cefr: "A2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Fitness", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-09",
    term: "nutrient",
    phonetic: "/ˈnjuːtriənt/",
    partOfSpeech: "noun",
    definition: "A substance that plants and animals need to live and grow.",
    example: "Fresh vegetables provide essential nutrients for our immune system.",
    cefr: "B1",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-10",
    term: "affect",
    phonetic: "/əˈfekt/",
    partOfSpeech: "verb",
    definition: "To have an influence on someone or something.",
    example: "What you eat can directly affect your energy throughout the day.",
    cefr: "A2",
    state: "reviewing",
    intervalDays: 4,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 2,
    tags: ["Word Form", "Grade 7 Unit 2", "GỦI.docx:T#2"]
  },
  {
    id: "vocab-g7-u2-11",
    term: "avoid",
    phonetic: "/əˈvɔɪd/",
    partOfSpeech: "verb",
    definition: "To stay away from someone or something; prevent something from happening.",
    example: "You should avoid eating too much sugar and fast food.",
    cefr: "A2",
    state: "mastered",
    intervalDays: 14,
    nextReviewDate: "Sau 10 ngày",
    recallSuccessDays: 3,
    tags: ["Word Form", "Grade 7 Unit 2", "GỦI.docx:T#2"]
  },
  {
    id: "vocab-g7-u2-12",
    term: "strengthen",
    phonetic: "/ˈstreŋθn/",
    partOfSpeech: "verb",
    definition: "To make something stronger or more effective.",
    example: "Swimming and cycling help strengthen your heart and muscles.",
    cefr: "B1",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Word Form", "Grade 7 Unit 2", "GỦI.docx:T#2"]
  },
  {
    id: "vocab-g7-u2-13",
    term: "lip balm",
    phonetic: "/lɪp bɑːm/",
    partOfSpeech: "noun phr.",
    definition: "A soft substance put on the lips to keep them moist and prevent cracking.",
    example: "She carries lip balm in her pocket during cold weather.",
    cefr: "A2",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-14",
    term: "suncream",
    phonetic: "/ˈsʌnkriːm/",
    partOfSpeech: "noun",
    definition: "A cream put on skin to protect it from damage by the sun.",
    example: "Apply suncream twenty minutes before going swimming.",
    cefr: "A2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-15",
    term: "lifestyle",
    phonetic: "/ˈlaɪfstaɪl/",
    partOfSpeech: "noun",
    definition: "The particular way that a person or group lives.",
    example: "Adopting an active lifestyle brings long-term health benefits.",
    cefr: "A2",
    state: "mastered",
    intervalDays: 20,
    nextReviewDate: "Sau 15 ngày",
    recallSuccessDays: 3,
    tags: ["General", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-16",
    term: "boating",
    phonetic: "/ˈbəʊtɪŋ/",
    partOfSpeech: "noun",
    definition: "The activity of travelling in a small boat for pleasure.",
    example: "Going boating on West Lake is an enjoyable outdoor exercise.",
    cefr: "A2",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Activities", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-17",
    term: "active",
    phonetic: "/ˈæktɪv/",
    partOfSpeech: "adj",
    definition: "Busy with or ready to perform physical action.",
    example: "Teenagers should stay active by participating in school sports.",
    cefr: "A2",
    state: "reviewing",
    intervalDays: 5,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 2,
    tags: ["Word Form", "Grade 7 Unit 2", "GỦI.docx:T#2"]
  },
  {
    id: "vocab-g7-u2-18",
    term: "differ",
    phonetic: "/ˈdɪfə/",
    partOfSpeech: "verb",
    definition: "To be not like something or someone else; disagree.",
    example: "Our daily calorie needs differ depending on our physical activity.",
    cefr: "B1",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Word Form", "Grade 7 Unit 2", "GỦI.docx:T#2"]
  },
  {
    id: "vocab-g7-u2-19",
    term: "energy",
    phonetic: "/ˈenədʒi/",
    partOfSpeech: "noun",
    definition: "The power and ability to be physically and mentally active.",
    example: "A healthy breakfast gives students energy for morning classes.",
    cefr: "A2",
    state: "mastered",
    intervalDays: 25,
    nextReviewDate: "Sau 18 ngày",
    recallSuccessDays: 4,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  },
  {
    id: "vocab-g7-u2-20",
    term: "fit",
    phonetic: "/fɪt/",
    partOfSpeech: "adj",
    definition: "Healthy and strong, especially as a result of regular exercise.",
    example: "He runs five kilometres every weekend to keep fit.",
    cefr: "A2",
    state: "reviewing",
    intervalDays: 4,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 2,
    tags: ["Health", "Grade 7 Unit 2", "GỦI.docx:T#1"]
  }
];

// Append new vocab to initialVocabWords
const vocabInsertMarker = 'export const initialVocabWords: VocabularyWord[] = [';
const vocabInsertIndex = code.indexOf(vocabInsertMarker);
if (vocabInsertIndex !== -1) {
  const vocabArrayStart = vocabInsertIndex + vocabInsertMarker.length;
  const newVocabString = '\n' + newVocab.map(v => '  ' + JSON.stringify(v, null, 2).replace(/\n/g, '\n  ') + ',').join('\n');
  code = code.slice(0, vocabArrayStart) + newVocabString + code.slice(vocabArrayStart);
  console.log(`Injected ${newVocab.length} authentic Grade 7 Unit 2 vocab items into initialVocabWords.`);
}

fs.writeFileSync(mockDataPath, code, 'utf8');
console.log('Successfully updated mockData.ts with new vocabulary.');
