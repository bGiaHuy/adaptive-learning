import {
  VocabularyWord,
  Lesson,
  Classroom,
  Assignment,
  Submission,
  SkillEstimate,
  NotificationItem,
} from "@/types";

export const initialSkillEstimates: Record<string, SkillEstimate> = {
  reading: {
    level: "B1",
    scoreDisplay: "B1 (Intermediate)",
    confidence: 82,
    evidenceCount: 24,
    evaluated: true,
    independentRate: 75,
  },
  listening: {
    level: "B1",
    scoreDisplay: "B1+ (Threshold High)",
    confidence: 78,
    evidenceCount: 19,
    evaluated: true,
    independentRate: 80,
  },
  writing: {
    level: "Chưa đánh giá",
    scoreDisplay: "Chưa có dữ liệu bài làm",
    confidence: 15,
    evidenceCount: 1,
    evaluated: false,
    independentRate: 0,
  },
  speaking: {
    level: "Chưa đánh giá",
    scoreDisplay: "Chưa có dữ liệu ghi âm",
    confidence: 10,
    evidenceCount: 0,
    evaluated: false,
    independentRate: 0,
  },
  vocabulary: {
    level: "B1",
    scoreDisplay: "B1 (640 từ đã ghi nhận)",
    confidence: 85,
    evidenceCount: 52,
    evaluated: true,
    independentRate: 88,
  },
  grammar: {
    level: "B1",
    scoreDisplay: "B1 (Thì & Cấu trúc phức)",
    confidence: 80,
    evidenceCount: 30,
    evaluated: true,
    independentRate: 70,
  },
};

export const initialVocabWords: VocabularyWord[] = [
  {"id": "vocab-g6-u2-01", "term": "town house", "phonetic": "/ˈtaʊn haʊs/", "partOfSpeech": "noun", "definition": "A house that is joined to other houses in a town or city row.", "example": "Mi lives with her family in a modern town house in Da Nang.", "cefr": "A1", "state": "learning", "intervalDays": 1, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-02", "term": "country house", "phonetic": "/ˈkʌntri haʊs/", "partOfSpeech": "noun", "definition": "A house situated in the countryside, often with a large garden.", "example": "Nick lives in a peaceful country house surrounded by trees.", "cefr": "A1", "state": "learning", "intervalDays": 2, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-03", "term": "stilt house", "phonetic": "/stɪlt haʊs/", "partOfSpeech": "noun", "definition": "A house raised on tall wooden posts over land or water.", "example": "Many ethnic minority families live in traditional stilt houses in northwestern Vietnam.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-04", "term": "villa", "phonetic": "/ˈvɪlə/", "partOfSpeech": "noun", "definition": "A large and luxurious house, often with a garden and swimming pool.", "example": "They rented a beautiful seaside villa for their summer holiday.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-05", "term": "flat", "phonetic": "/flæt/", "partOfSpeech": "noun", "definition": "A set of rooms for living in that is part of a larger building; an apartment.", "example": "Mi's family is moving to a new flat with three bedrooms next month.", "cefr": "A1", "state": "mastered", "intervalDays": 21, "nextReviewDate": "Sau 18 ngày", "recallSuccessDays": 3, "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-06", "term": "chest of drawers", "phonetic": "/ˌtʃest əv ˈdrɔːz/", "partOfSpeech": "noun phr.", "definition": "A piece of furniture with several sliding boxes for keeping clothes.", "example": "I keep my socks and T-shirts in the wooden chest of drawers.", "cefr": "A1", "state": "learning", "intervalDays": 1, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Furniture", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-07", "term": "wardrobe", "phonetic": "/ˈwɔːdrəʊb/", "partOfSpeech": "noun", "definition": "A tall cupboard in which you can hang your clothes.", "example": "There is a large wardrobe next to the bed in my bedroom.", "cefr": "A1", "state": "mastered", "intervalDays": 30, "nextReviewDate": "Sau 25 ngày", "recallSuccessDays": 4, "tags": ["Furniture", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-08", "term": "dishwasher", "phonetic": "/ˈdɪʃwɒʃə/", "partOfSpeech": "noun", "definition": "An electrical machine used for washing dishes and cutlery automatically.", "example": "Using a modern dishwasher saves our family a lot of time after dinner.", "cefr": "A1", "state": "learning", "intervalDays": 2, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Appliances", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-09", "term": "microwave", "phonetic": "/ˈmaɪkrəweɪv/", "partOfSpeech": "noun", "definition": "An electric oven that uses electromagnetic waves to heat food quickly.", "example": "She warmed up a bowl of soup in the microwave.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["Appliances", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-10", "term": "hall", "phonetic": "/hɔːl/", "partOfSpeech": "noun", "definition": "An entrance area or passage connecting rooms in a house.", "example": "Leave your coat and shoes on the rack in the entrance hall.", "cefr": "A1", "state": "learning", "intervalDays": 1, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Rooms", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-11", "term": "cupboard", "phonetic": "/ˈkʌbəd/", "partOfSpeech": "noun", "definition": "A piece of furniture or cabinet with shelves used for storing cups, plates, and food.", "example": "We store all our cereal bowls in the kitchen cupboard.", "cefr": "A1", "state": "mastered", "intervalDays": 25, "nextReviewDate": "Sau 20 ngày", "recallSuccessDays": 3, "tags": ["Furniture", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u2-12", "term": "balcony", "phonetic": "/ˈbælkəni/", "partOfSpeech": "noun", "definition": "A platform enclosed by a railing that projects from the outer wall of a building.", "example": "Our living room has a wide balcony with lots of colourful flower pots.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]},
  {"id": "vocab-g6-u7-01", "term": "animated film", "phonetic": "/ˈænɪmeɪtɪd fɪlm/", "partOfSpeech": "noun phr.", "definition": "A film made by using computer-generated drawings or cartoons rather than real actors.", "example": "Phong loves animated films like The Lion King and Coco.", "cefr": "A1", "state": "learning", "intervalDays": 1, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-02", "term": "educational programme", "phonetic": "/ˌedʒuˈkeɪʃənl ˈprəʊɡræm/", "partOfSpeech": "noun phr.", "definition": "A TV broadcast designed to instruct or teach viewers useful knowledge.", "example": "English in a Minute is a very popular educational programme for secondary students.", "cefr": "A1", "state": "learning", "intervalDays": 2, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-03", "term": "talent show", "phonetic": "/ˈtælənt ʃəʊ/", "partOfSpeech": "noun phr.", "definition": "A television competition where amateur performers show their singing, dancing, or skills.", "example": "The Voice Kids is an exciting music talent show watched by millions of teenagers.", "cefr": "A1", "state": "learning", "intervalDays": 1, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-04", "term": "comedy", "phonetic": "/ˈkɒmədi/", "partOfSpeech": "noun", "definition": "A film, play, or programme that is funny and intended to make people laugh.", "example": "Watching a comedy after a stressful school day helps me relax.", "cefr": "A1", "state": "mastered", "intervalDays": 28, "nextReviewDate": "Sau 22 ngày", "recallSuccessDays": 4, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-05", "term": "game show", "phonetic": "/ˈɡeɪm ʃəʊ/", "partOfSpeech": "noun phr.", "definition": "A TV show in which contestants answer questions or play games to win prizes.", "example": "Children are Always Right is a fun game show with questions about domestic pets.", "cefr": "A1", "state": "learning", "intervalDays": 3, "nextReviewDate": "Hôm nay", "recallSuccessDays": 2, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-06", "term": "wildlife", "phonetic": "/ˈwaɪldlaɪf/", "partOfSpeech": "noun", "definition": "Wild animals and plants living in their natural environment.", "example": "The wildlife documentary shows colourful birds and flowers in Cuc Phuong National Park.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["Nature", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-07", "term": "viewer", "phonetic": "/ˈvjuːə/", "partOfSpeech": "noun", "definition": "A person who watches a television programme or video.", "example": "A successful television show attracts millions of enthusiastic viewers.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-08", "term": "remote control", "phonetic": "/rɪˌməʊt kənˈtrəʊl/", "partOfSpeech": "noun phr.", "definition": "A handheld device used to operate a television from a distance.", "example": "Please pass me the remote control so I can turn to VTV7.", "cefr": "A1", "state": "learning", "intervalDays": 1, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Technology", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-09", "term": "channel", "phonetic": "/ˈtʃænl/", "partOfSpeech": "noun", "definition": "A television station and its scheduled programmes.", "example": "VTV1 is the national news channel in Vietnam.", "cefr": "A1", "state": "mastered", "intervalDays": 24, "nextReviewDate": "Sau 19 ngày", "recallSuccessDays": 3, "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-10", "term": "character", "phonetic": "/ˈkærəktə/", "partOfSpeech": "noun", "definition": "A person or animal represented in a film, play, or story.", "example": "Jerry the mouse is a clever cartoon character loved by children.", "cefr": "A1", "state": "learning", "intervalDays": 2, "nextReviewDate": "Hôm nay", "recallSuccessDays": 1, "tags": ["Story", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-11", "term": "clever", "phonetic": "/ˈklevə/", "partOfSpeech": "adj", "definition": "Quick at learning and understanding things; intelligent.", "example": "Dolphins are very clever sea animals that can perform amazing tricks.", "cefr": "A1", "state": "mastered", "intervalDays": 30, "nextReviewDate": "Sau 26 ngày", "recallSuccessDays": 4, "tags": ["Personality", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},
  {"id": "vocab-g6-u7-12", "term": "newsreader", "phonetic": "/ˈnjuːzriːdə/", "partOfSpeech": "noun", "definition": "A person who reads the news reports on television or radio.", "example": "The evening newsreader speaks clearly and professionally.", "cefr": "A1", "state": "saved", "intervalDays": 0, "nextReviewDate": "Chưa kích hoạt", "recallSuccessDays": 0, "tags": ["Jobs", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]},

  {
    "id": "vocab-g7-u2-01",
    "term": "sunburn",
    "phonetic": "/ˈsʌnbɜːn/",
    "partOfSpeech": "noun",
    "definition": "Red, painful skin caused by being in the sun too long.",
    "example": "Wear a hat and apply suncream to prevent sunburn.",
    "cefr": "A2",
    "state": "learning",
    "intervalDays": 1,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 1,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-02",
    "term": "chapped lips",
    "phonetic": "/tʃæpt lɪps/",
    "partOfSpeech": "noun phr.",
    "definition": "Dry, cracked skin on your lips caused by cold weather or wind.",
    "example": "In winter, I always use lip balm to avoid chapped lips.",
    "cefr": "A2",
    "state": "learning",
    "intervalDays": 2,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 1,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-03",
    "term": "acne",
    "phonetic": "/ˈækni/",
    "partOfSpeech": "noun",
    "definition": "A skin condition common in teenagers that causes red spots on the face.",
    "example": "Acne affects many young people between the ages of 12 and 20.",
    "cefr": "A2",
    "state": "learning",
    "intervalDays": 1,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 0,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-04",
    "term": "dim light",
    "phonetic": "/dɪm laɪt/",
    "partOfSpeech": "noun phr.",
    "definition": "Light that is not bright enough, which can cause eye strain.",
    "example": "Reading in dim light can tire your eyes quickly.",
    "cefr": "A2",
    "state": "reviewing",
    "intervalDays": 3,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 2,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-05",
    "term": "vegetarian",
    "phonetic": "/ˌvedʒəˈteəriən/",
    "partOfSpeech": "noun/adj",
    "definition": "A person who does not eat meat or fish.",
    "example": "My sister has been a vegetarian for two years and eats lots of vegetables.",
    "cefr": "A2",
    "state": "learning",
    "intervalDays": 1,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 1,
    "tags": [
      "Diet",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-06",
    "term": "tofu",
    "phonetic": "/ˈtəʊfuː/",
    "partOfSpeech": "noun",
    "definition": "A soft, white food made from soybeans, rich in vegetable protein.",
    "example": "Tofu is a healthy source of protein for vegetarians.",
    "cefr": "A2",
    "state": "saved",
    "intervalDays": 0,
    "nextReviewDate": "Chưa kích hoạt",
    "recallSuccessDays": 0,
    "tags": [
      "Diet",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-07",
    "term": "soybeans",
    "phonetic": "/ˈsɔɪbiːnz/",
    "partOfSpeech": "noun",
    "definition": "Small beans from an Asian plant used to make milk, tofu, and oil.",
    "example": "Soybeans contain essential vitamins and minerals for the body.",
    "cefr": "A2",
    "state": "saved",
    "intervalDays": 0,
    "nextReviewDate": "Chưa kích hoạt",
    "recallSuccessDays": 0,
    "tags": [
      "Diet",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-08",
    "term": "calorie",
    "phonetic": "/ˈkæləri/",
    "partOfSpeech": "noun",
    "definition": "A unit for measuring the amount of energy food provides.",
    "example": "Jogging for thirty minutes burns about two hundred calories.",
    "cefr": "A2",
    "state": "learning",
    "intervalDays": 1,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 1,
    "tags": [
      "Fitness",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-09",
    "term": "nutrient",
    "phonetic": "/ˈnjuːtriənt/",
    "partOfSpeech": "noun",
    "definition": "A substance that plants and animals need to live and grow.",
    "example": "Fresh vegetables provide essential nutrients for our immune system.",
    "cefr": "B1",
    "state": "saved",
    "intervalDays": 0,
    "nextReviewDate": "Chưa kích hoạt",
    "recallSuccessDays": 0,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-10",
    "term": "affect",
    "phonetic": "/əˈfekt/",
    "partOfSpeech": "verb",
    "definition": "To have an influence on someone or something.",
    "example": "What you eat can directly affect your energy throughout the day.",
    "cefr": "A2",
    "state": "reviewing",
    "intervalDays": 4,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 2,
    "tags": [
      "Word Form",
      "Grade 7 Unit 2",
      "GỦI.docx:T#2"
    ]
  },
  {
    "id": "vocab-g7-u2-11",
    "term": "avoid",
    "phonetic": "/əˈvɔɪd/",
    "partOfSpeech": "verb",
    "definition": "To stay away from someone or something; prevent something from happening.",
    "example": "You should avoid eating too much sugar and fast food.",
    "cefr": "A2",
    "state": "mastered",
    "intervalDays": 14,
    "nextReviewDate": "Sau 10 ngày",
    "recallSuccessDays": 3,
    "tags": [
      "Word Form",
      "Grade 7 Unit 2",
      "GỦI.docx:T#2"
    ]
  },
  {
    "id": "vocab-g7-u2-12",
    "term": "strengthen",
    "phonetic": "/ˈstreŋθn/",
    "partOfSpeech": "verb",
    "definition": "To make something stronger or more effective.",
    "example": "Swimming and cycling help strengthen your heart and muscles.",
    "cefr": "B1",
    "state": "learning",
    "intervalDays": 1,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 1,
    "tags": [
      "Word Form",
      "Grade 7 Unit 2",
      "GỦI.docx:T#2"
    ]
  },
  {
    "id": "vocab-g7-u2-13",
    "term": "lip balm",
    "phonetic": "/lɪp bɑːm/",
    "partOfSpeech": "noun phr.",
    "definition": "A soft substance put on the lips to keep them moist and prevent cracking.",
    "example": "She carries lip balm in her pocket during cold weather.",
    "cefr": "A2",
    "state": "saved",
    "intervalDays": 0,
    "nextReviewDate": "Chưa kích hoạt",
    "recallSuccessDays": 0,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-14",
    "term": "suncream",
    "phonetic": "/ˈsʌnkriːm/",
    "partOfSpeech": "noun",
    "definition": "A cream put on skin to protect it from damage by the sun.",
    "example": "Apply suncream twenty minutes before going swimming.",
    "cefr": "A2",
    "state": "learning",
    "intervalDays": 1,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 1,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-15",
    "term": "lifestyle",
    "phonetic": "/ˈlaɪfstaɪl/",
    "partOfSpeech": "noun",
    "definition": "The particular way that a person or group lives.",
    "example": "Adopting an active lifestyle brings long-term health benefits.",
    "cefr": "A2",
    "state": "mastered",
    "intervalDays": 20,
    "nextReviewDate": "Sau 15 ngày",
    "recallSuccessDays": 3,
    "tags": [
      "General",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-16",
    "term": "boating",
    "phonetic": "/ˈbəʊtɪŋ/",
    "partOfSpeech": "noun",
    "definition": "The activity of travelling in a small boat for pleasure.",
    "example": "Going boating on West Lake is an enjoyable outdoor exercise.",
    "cefr": "A2",
    "state": "saved",
    "intervalDays": 0,
    "nextReviewDate": "Chưa kích hoạt",
    "recallSuccessDays": 0,
    "tags": [
      "Activities",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-17",
    "term": "active",
    "phonetic": "/ˈæktɪv/",
    "partOfSpeech": "adj",
    "definition": "Busy with or ready to perform physical action.",
    "example": "Teenagers should stay active by participating in school sports.",
    "cefr": "A2",
    "state": "reviewing",
    "intervalDays": 5,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 2,
    "tags": [
      "Word Form",
      "Grade 7 Unit 2",
      "GỦI.docx:T#2"
    ]
  },
  {
    "id": "vocab-g7-u2-18",
    "term": "differ",
    "phonetic": "/ˈdɪfə/",
    "partOfSpeech": "verb",
    "definition": "To be not like something or someone else; disagree.",
    "example": "Our daily calorie needs differ depending on our physical activity.",
    "cefr": "B1",
    "state": "saved",
    "intervalDays": 0,
    "nextReviewDate": "Chưa kích hoạt",
    "recallSuccessDays": 0,
    "tags": [
      "Word Form",
      "Grade 7 Unit 2",
      "GỦI.docx:T#2"
    ]
  },
  {
    "id": "vocab-g7-u2-19",
    "term": "energy",
    "phonetic": "/ˈenədʒi/",
    "partOfSpeech": "noun",
    "definition": "The power and ability to be physically and mentally active.",
    "example": "A healthy breakfast gives students energy for morning classes.",
    "cefr": "A2",
    "state": "mastered",
    "intervalDays": 25,
    "nextReviewDate": "Sau 18 ngày",
    "recallSuccessDays": 4,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    "id": "vocab-g7-u2-20",
    "term": "fit",
    "phonetic": "/fɪt/",
    "partOfSpeech": "adj",
    "definition": "Healthy and strong, especially as a result of regular exercise.",
    "example": "He runs five kilometres every weekend to keep fit.",
    "cefr": "A2",
    "state": "reviewing",
    "intervalDays": 4,
    "nextReviewDate": "Hôm nay",
    "recallSuccessDays": 2,
    "tags": [
      "Health",
      "Grade 7 Unit 2",
      "GỦI.docx:T#1"
    ]
  },
  {
    id: "vocab-1",
    term: "curious",
    phonetic: "/ˈkjʊə.ri.əs/",
    partOfSpeech: "adj",
    definition: "Wanting to learn or know more about something.",
    example: "Babies are curious about everything around them.",
    cefr: "A2",
    state: "reviewing",
    intervalDays: 4,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 2,
    tags: ["Daily Life", "Personality"],
  },
  {
    id: "vocab-2",
    term: "resilient",
    phonetic: "/rɪˈzɪl.jənt/",
    partOfSpeech: "adj",
    definition: "Able to recover quickly from difficult conditions or changes.",
    example: "The local economy proved remarkably resilient during the crisis.",
    cefr: "B2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Academic", "Psychology"],
  },
  {
    id: "vocab-3",
    term: "subtle",
    phonetic: "/ˈsʌt.əl/",
    partOfSpeech: "adj",
    definition: "Not loud, bright, or noticeable; fine and delicate.",
    example: "There is a subtle difference between the two terms.",
    cefr: "B2",
    state: "relearning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 0,
    tags: ["Academic", "Writing"],
  },
  {
    id: "vocab-4",
    term: "collaborate",
    phonetic: "/kəˈlæb.ə.reɪt/",
    partOfSpeech: "verb",
    definition: "To work jointly with others on an activity or project.",
    example: "Students are encouraged to collaborate on group presentations.",
    cefr: "B1",
    state: "mastered",
    intervalDays: 28,
    nextReviewDate: "Sau 21 ngày",
    recallSuccessDays: 4,
    tags: ["Classroom", "Work"],
  },
  {
    id: "vocab-5",
    term: "perceive",
    phonetic: "/pəˈsiːv/",
    partOfSpeech: "verb",
    definition: "To become aware or conscious of something through the senses.",
    example: "Children perceive colors and shapes at an early age.",
    cefr: "B2",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Psychology", "Academic"],
  },
  {
    id: "vocab-6",
    term: "fluctuate",
    phonetic: "/ˈflʌk.tʃu.eɪt/",
    partOfSpeech: "verb",
    definition: "To change continually; shift back and forth irregularly.",
    example: "The prices of fresh vegetables fluctuate according to the season.",
    cefr: "B2",
    state: "reviewing",
    intervalDays: 6,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 2,
    tags: ["IELTS Task 1", "Data"],
  },
  {
    id: "vocab-7",
    term: "substantial",
    phonetic: "/səbˈstæn.ʃəl/",
    partOfSpeech: "adj",
    definition: "Of considerable importance, size, or worth.",
    example: "A substantial amount of cash was donated to the hospital.",
    cefr: "B2",
    state: "saved",
    intervalDays: 0,
    nextReviewDate: "Chưa kích hoạt",
    recallSuccessDays: 0,
    tags: ["Academic", "Quantity"],
  },
  {
    id: "vocab-8",
    term: "advocate",
    phonetic: "/ˈæd.və.keɪt/",
    partOfSpeech: "verb",
    definition: "To publicly recommend or support a particular cause or policy.",
    example: "Health experts advocate a balanced diet and regular exercise.",
    cefr: "B2",
    state: "learning",
    intervalDays: 1,
    nextReviewDate: "Hôm nay",
    recallSuccessDays: 1,
    tags: ["Social", "Debate"],
  },
];

export const initialLessons: Lesson[] = [
  {"id": "g6-u2-les-01", "skill": "reading", "unitId": "unit-g6-u2", "unitTitle": "Unit 2: My House", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Reading: A Room at the Crazy House Hotel, Da Lat", "description": "Đọc email của Nick gửi cho Phong và Mi miêu tả khách sạn Kỳ Dị (Crazy House Hotel) ở Đà Lạt và phòng Con Hổ.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 22)", "questions": [{"id": "g6-u2-r-q1", "type": "multiple_choice", "prompt": "Who is Nick in Da Lat with?", "passage": "Hi Phong and Mi,\n\nHow are you? I'm in Da Lat with my parents. We're staying at the Crazy House Hotel. Wow! It really is crazy.\n\nThere are ten rooms in the hotel. There's a Kangaroo Room, an Eagle Room, and even an Ant Room. I'm staying in the Tiger Room because there's a big tiger on the wall.\n\nThe tiger is between the bathroom door and the window. The bed is next to the window, but the window is a strange shape. I put my bag under the bed. There's a lamp, a wardrobe and a desk.\n\nYou should stay here when you visit Da Lat. It's great.\n\nSee you soon!\nNick", "options": [{"id": "A", "text": "With his classmates"}, {"id": "B", "text": "With his parents"}, {"id": "C", "text": "With his teacher"}, {"id": "D", "text": "With his grandparents"}], "correctAnswer": "B", "hint": "Check the second line of Nick's email: 'I'm in Da Lat with...'", "explanation": "Trong đoạn 1, Nick viết: 'I'm in Da Lat with my parents.' (Tôi đang ở Đà Lạt cùng với bố mẹ). Đáp án đúng là B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-r-q2", "type": "multiple_choice", "prompt": "How many rooms are there in the Crazy House Hotel?", "passage": "There are ten rooms in the hotel. There's a Kangaroo Room, an Eagle Room, and even an Ant Room. I'm staying in the Tiger Room because there's a big tiger on the wall.", "options": [{"id": "A", "text": "Five rooms"}, {"id": "B", "text": "Eight rooms"}, {"id": "C", "text": "Ten rooms"}, {"id": "D", "text": "Twelve rooms"}], "correctAnswer": "C", "hint": "Look for the sentence starting with 'There are... rooms in the hotel.'", "explanation": "Đoạn 2 nêu rõ: 'There are ten rooms in the hotel.' (Có 10 phòng trong khách sạn). Do đó chọn đáp án C.", "difficulty": "A1", "score": 1.0, "answer": "C"}, {"id": "g6-u2-r-q3", "type": "multiple_choice", "prompt": "Why is the room called the Tiger Room?", "passage": "I'm staying in the Tiger Room because there's a big tiger on the wall.", "options": [{"id": "A", "text": "Because there is a live tiger in the garden."}, {"id": "B", "text": "Because there is a big tiger on the wall."}, {"id": "C", "text": "Because it looks like a tiger cage."}, {"id": "D", "text": "Because tigers are Nick's favourite animals."}], "correctAnswer": "B", "hint": "Find the reason after 'because there's...'", "explanation": "Nick giải thích: 'I'm staying in the Tiger Room because there's a big tiger on the wall.' (vì có một con hổ lớn trên tường). Đáp án B đúng.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-r-q4", "type": "multiple_choice", "prompt": "Where did Nick put his bag?", "passage": "The tiger is between the bathroom door and the window. The bed is next to the window, but the window is a strange shape. I put my bag under the bed. There's a lamp, a wardrobe and a desk.", "options": [{"id": "A", "text": "On the desk"}, {"id": "B", "text": "In the wardrobe"}, {"id": "C", "text": "Under the bed"}, {"id": "D", "text": "Next to the bathroom door"}], "correctAnswer": "C", "hint": "Look for 'I put my bag...'", "explanation": "Trong đoạn 3: 'I put my bag under the bed.' (Tôi để túi xách ở dưới gầm giường). Chọn C.", "difficulty": "A1", "score": 1.0, "answer": "C"}, {"id": "g6-u2-r-q5", "type": "multiple_choice", "prompt": "Which of the following items is NOT in the Tiger Room?", "passage": "There's a lamp, a wardrobe and a desk.", "options": [{"id": "A", "text": "A desk"}, {"id": "B", "text": "A wardrobe"}, {"id": "C", "text": "A cooker"}, {"id": "D", "text": "A lamp"}], "correctAnswer": "C", "hint": "Check the list of furniture in the Tiger Room.", "explanation": "Nick liệt kê đồ đạc gồm 'a lamp, a wardrobe and a desk'. Bếp nấu (a cooker) không có trong phòng khách sạn này. Đáp án C đúng.", "difficulty": "A1", "score": 1.0, "answer": "C"}]},

  {"id": "g6-u2-les-02", "skill": "listening", "unitId": "unit-g6-u2", "unitTitle": "Unit 2: My House", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: Mai's Town House in Da Nang", "description": "Nghe đoạn giới thiệu của bạn Mai về ngôi nhà phố ở Đà Nẵng, số lượng phòng và đồ đạc trong phòng ngủ.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 23)", "questions": [{"id": "g6-u2-l-q1", "type": "multiple_choice", "prompt": "How many people are there in Mai's family?", "audioUrl": "/audio/g6-u2-mai-house.mp3", "passage": "[Audio Transcript]\nHello, I'm Mai. I live in a town house in Da Nang with my family.\nThere are four people in my family: my parents, my younger brother, and me.\nOur house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.\nThe living room is on the first floor, next to the kitchen.\nMy bedroom is on the second floor. It is small but very cosy.\nThere is a bed, a study desk, a chair, and a wardrobe in my bedroom.\nOn the wall, there is a big picture of my family, but there is no clock.\nI love my bedroom the most because I can do my homework and listen to music there after school.", "options": [{"id": "A", "text": "Three people"}, {"id": "B", "text": "Four people"}, {"id": "C", "text": "Five people"}, {"id": "D", "text": "Six people"}], "correctAnswer": "B", "hint": "Nghe câu: 'There are... people in my family: my parents, my younger brother, and me.'", "explanation": "Mai nói: 'There are four people in my family: my parents, my younger brother, and me.' (Bố mẹ, em trai và Mai = 4 người). Chọn B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-l-q2", "type": "multiple_choice", "prompt": "Where is the living room located in Mai's house?", "audioUrl": "/audio/g6-u2-mai-house.mp3", "passage": "The living room is on the first floor, next to the kitchen.", "options": [{"id": "A", "text": "On the first floor, next to the kitchen"}, {"id": "B", "text": "On the second floor, next to her bedroom"}, {"id": "C", "text": "In the attic"}, {"id": "D", "text": "Behind the garden"}], "correctAnswer": "A", "hint": "Nghe vị trí tầng và phòng bên cạnh: 'on the first floor, next to...'", "explanation": "Trong bài nghe: 'The living room is on the first floor, next to the kitchen.' Đáp án A chính xác.", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u2-l-q3", "type": "multiple_choice", "prompt": "How many rooms are there in Mai's house in total?", "audioUrl": "/audio/g6-u2-mai-house.mp3", "passage": "Our house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.", "options": [{"id": "A", "text": "Five rooms"}, {"id": "B", "text": "Six rooms"}, {"id": "C", "text": "Seven rooms"}, {"id": "D", "text": "Eight rooms"}], "correctAnswer": "B", "hint": "Nghe câu: 'Our house has... rooms.'", "explanation": "Mai nói rõ: 'Our house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.' Tổng cộng là 6 phòng (six rooms). Chọn B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-l-q4", "type": "multiple_choice", "prompt": "What is on the wall of Mai's bedroom?", "audioUrl": "/audio/g6-u2-mai-house.mp3", "passage": "On the wall, there is a big picture of my family, but there is no clock.", "options": [{"id": "A", "text": "A round wall clock"}, {"id": "B", "text": "A big picture of her family"}, {"id": "C", "text": "A television set"}, {"id": "D", "text": "A bookshelf"}], "correctAnswer": "B", "hint": "Nghe kĩ câu: 'there is a big picture... but there is no clock.'", "explanation": "Mai chia sẻ: 'On the wall, there is a big picture of my family, but there is no clock.' Vì vậy trên tường có một bức ảnh lớn của gia đình. Chọn B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-l-q5", "type": "multiple_choice", "prompt": "What does Mai often do in her bedroom after school?", "audioUrl": "/audio/g6-u2-mai-house.mp3", "passage": "I love my bedroom the most because I can do my homework and listen to music there after school.", "options": [{"id": "A", "text": "She plays video games with her brother."}, {"id": "B", "text": "She cooks dinner with her mother."}, {"id": "C", "text": "She does her homework and listens to music."}, {"id": "D", "text": "She watches movies on television."}], "correctAnswer": "C", "hint": "Nghe câu cuối về lý do Mai thích phòng ngủ.", "explanation": "Mai nói: 'I can do my homework and listen to music there after school.' Do đó đáp án C chính xác.", "difficulty": "A1", "score": 1.0, "answer": "C"}]},

  {"id": "g6-u2-les-03", "skill": "grammar", "unitId": "unit-g6-u2", "unitTitle": "Unit 2: My House", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Grammar: Possessive Case ('s) & Prepositions of Place", "description": "Luyện tập ngữ pháp trọng tâm Unit 2: Sở hữu cách danh từ ('s), giới từ chỉ nơi chốn (between, next to, under, behind) và phát âm /s/ - /z/.", "durationMinutes": 12, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 18-20, 24)", "questions": [{"id": "g6-u2-g-q1", "type": "multiple_choice", "prompt": "Choose the correct possessive form: 'This is my _______ desk.'", "passage": null, "options": [{"id": "A", "text": "sister"}, {"id": "B", "text": "sister's"}, {"id": "C", "text": "sisters'"}, {"id": "D", "text": "sister is"}], "correctAnswer": "B", "hint": "Cấu trúc sở hữu cách sau danh từ số ít: N + 's + N.", "explanation": "Quy tắc ngữ pháp Unit 2: Dùng 's sau tên riêng hoặc danh từ số ít để chỉ quyền sở hữu. Ở đây là bàn của chị gái ('sister's desk').", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-g-q2", "type": "multiple_choice", "prompt": "Choose the correct sentence with the possessive case:", "passage": null, "options": [{"id": "A", "text": "My cousin's dad is my uncle."}, {"id": "B", "text": "My cousins dad is my uncle."}, {"id": "C", "text": "My cousin dad is my uncle."}, {"id": "D", "text": "My cousins's dad is my uncle."}], "correctAnswer": "A", "hint": "Danh từ số ít 'cousin' khi thêm sở hữu cách sẽ có dạng như thế nào?", "explanation": "Cấu trúc sở hữu cách cho 'cousin' là 'cousin's dad' (bố của anh em họ tôi). Đáp án A chính xác.", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u2-g-q3", "type": "multiple_choice", "prompt": "Preposition of place: 'Look at the picture on page 19: The cat is sitting _______ the lamp and the armchair.'", "passage": null, "options": [{"id": "A", "text": "in"}, {"id": "B", "text": "between"}, {"id": "C", "text": "behind"}, {"id": "D", "text": "under"}], "correctAnswer": "B", "hint": "Khi một vật nằm ở khoảng giữa hai vật ('the lamp and the armchair'), ta dùng giới từ nào?", "explanation": "Giới từ 'between... and...' có nghĩa là ở giữa hai đối tượng. Ở đây con mèo ngồi ở giữa đèn và ghế bành nên chọn 'between'.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u2-g-q4", "type": "multiple_choice", "prompt": "Preposition of place: 'The dog is sleeping _______ the comfortable armchair.'", "passage": null, "options": [{"id": "A", "text": "next to"}, {"id": "B", "text": "between"}, {"id": "C", "text": "among"}, {"id": "D", "text": "through"}], "correctAnswer": "A", "hint": "Chọn giới từ có nghĩa là 'ở bên cạnh'.", "explanation": "'next to' mang nghĩa là bên cạnh ('next to the comfortable armchair'). Chọn A.", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u2-g-q5", "type": "multiple_choice", "prompt": "Pronunciation: Choose the word whose final 's' is pronounced as /z/:", "passage": null, "options": [{"id": "A", "text": "lamps (/s/)"}, {"id": "B", "text": "sinks (/s/)"}, {"id": "C", "text": "flats (/s/)"}, {"id": "D", "text": "cupboards (/z/)"}], "correctAnswer": "D", "hint": "Âm đuôi 'd' là âm hữu thanh nên khi thêm 's' sẽ phát âm là /z/.", "explanation": "Quy tắc phát âm đuôi 's' trong Unit 2: lamps (/p/ + s = /s/), sinks (/k/ + s = /s/), flats (/t/ + s = /s/). Riêng cupboards kết thúc bằng phụ âm hữu thanh /d/ nên đuôi 's' phát âm là /z/ (/ˈkʌbədz/). Do đó chọn D.", "difficulty": "A1", "score": 1.0, "answer": "D"}]},

  {"id": "g6-u2-les-04", "skill": "writing", "unitId": "unit-g6-u2", "unitTitle": "Unit 2: My House", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Writing: Describing Your House & Favourite Room", "description": "Thực hành sắp xếp câu hoàn chỉnh và viết email 40-50 từ miêu tả ngôi nhà cho bạn qua thư.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 23)", "questions": [{"id": "g6-u2-w-q1", "type": "writing", "prompt": "Rearrange the given words to make a complete sentence: 'next / The / to / living room / the / is / kitchen / .'", "passage": null, "options": null, "correctAnswer": "The living room is next to the kitchen.", "hint": "Cấu trúc khẳng định: Chủ ngữ (The living room) + Động từ to be (is) + Cụm giới từ (next to the kitchen).", "explanation": "Trật tự từ đúng trong câu là: 'The living room is next to the kitchen.' (Phòng khách ở bên cạnh nhà bếp).", "difficulty": "A1", "score": 2.0, "answer": "The living room is next to the kitchen."}, {"id": "g6-u2-w-q2", "type": "writing", "prompt": "Write an email (40 - 50 words) to your pen friend Mira describing your house and your favourite room. Answer: 1. Where do you live? 2. How many rooms are there? 3. Which room do you like the best and why?", "passage": null, "options": null, "correctAnswer": "Dear Mira, Thanks for your email. I live in a town house in Hanoi with my family. My house has five rooms: a living room, a kitchen, two bedrooms, and a bathroom. My favourite room is my bedroom because it is quiet and comfortable. What about your house? Best, Nam.", "hint": "Bắt đầu bằng 'Dear Mira,', trả lời 3 câu hỏi gợi ý và kết thư bằng 'Best, [Tên của bạn]'.", "explanation": "Tiêu chí chấm: 1. Đủ bố cục email thân mật (chào hỏi, nội dung, chào tạm biệt). 2. Độ dài 40-50 từ. 3. Sử dụng đúng từ vựng Unit 2 (town house, bedrooms, comfortable). 4. Đúng thì hiện tại đơn.", "difficulty": "A1", "score": 3.0, "answer": "Dear Mira, Thanks for your email. I live in a town house in Hanoi with my family. My house has five rooms: a living room, a kitchen, two bedrooms, and a bathroom. My favourite room is my bedroom because it is quiet and comfortable. What about your house? Best, Nam."}]},

  {"id": "g6-u2-les-05", "skill": "speaking", "unitId": "unit-g6-u2", "unitTitle": "Unit 2: My House", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Speaking: Presenting Your Dream House", "description": "Luyện nói miêu tả ngôi nhà hoặc căn phòng mơ ước của em (1-2 phút) có ghi âm và AI chấm điểm.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 22 & 25)", "questions": [{"id": "g6-u2-s-q1", "type": "speaking", "prompt": "Talk about your dream house or room (1-2 minutes). Guiding questions:\n1. Where is your dream house (in the city, country, or by the sea)?\n2. What rooms and special furniture does it have?\n3. Why do you like it?\n[Click Record and speak clearly in English]", "passage": null, "options": null, "correctAnswer": "Hello everyone, today I want to talk about my dream house. My dream house is a villa by the sea in Da Nang. It has six large rooms: a modern living room, a bright kitchen, three comfortable bedrooms, and a big balcony. In my bedroom, there is a soft bed next to a large window overlooking the ocean, and a smart bookshelf. I love this house because it is peaceful and full of fresh air. Thank you for listening.", "hint": "Chuẩn bị trong 30 giây. Sử dụng các mẫu câu: 'My dream house is a...', 'It has... rooms', 'In my room, there is... next to...'", "explanation": "Tiêu chí AI & Giáo viên đánh giá: 1. Phát âm rõ ràng các âm /s/ và /z/. 2. Trôi chảy, tự nhiên. 3. Sử dụng đúng cấu trúc There is/There are và giới từ chỉ vị trí (by, next to, in). 4. Trả lời đầy đủ 3 ý gợi ý.", "difficulty": "A1", "score": 5.0, "answer": "Hello everyone, today I want to talk about my dream house. My dream house is a villa by the sea in Da Nang. It has six large rooms: a modern living room, a bright kitchen, three comfortable bedrooms, and a big balcony. In my bedroom, there is a soft bed next to a large window overlooking the ocean, and a smart bookshelf. I love this house because it is peaceful and full of fresh air. Thank you for listening."}]},

  {"id": "g6-u7-les-01", "skill": "reading", "unitId": "unit-g6-u7", "unitTitle": "Unit 7: Television", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Reading: TV Guide & Programme Schedule", "description": "Đọc bảng lịch phát sóng truyền hình (TV Guide) và trả lời các câu hỏi về thời gian, thể loại chương trình.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 12)", "questions": [{"id": "g6-u7-r-q1", "type": "multiple_choice", "prompt": "What is shown in the Wildlife programme at 8.00?", "passage": "TV GUIDE TODAY:\n• 8.00 - Wildlife: Cuc Phuong Forest (Watch the colourful world of plants, flowers, and animals in their real life.)\n• 9.00 - Comedy: The Fox Teacher (Have a lot of fun with a fox teacher and his students on their first day at school.)\n• 10.30 - Sports: The Pig Race (Watch the cute pigs compete in the most exciting races. Who wins?)\n• 11.00 - Game show: Children are Always Right (Join this game show today and try to answer interesting questions about pets.)\n• 12.15 - Science: The Dolphins (Watch funny and interesting clips of intelligent dolphins in their natural life - the sea.)", "options": [{"id": "A", "text": "Funny clips about dolphins in the sea"}, {"id": "B", "text": "The colourful world of plants, flowers, and animals in Cuc Phuong Forest"}, {"id": "C", "text": "A race between cute little pigs"}, {"id": "D", "text": "A comedy show about school students"}], "correctAnswer": "B", "hint": "Check the programme description at 8.00 in the TV Guide.", "explanation": "Mục 8.00 ghi: 'Watch the colourful world of plants, flowers, and animals in their real life' ở rừng Cúc Phương. Đáp án B đúng.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u7-r-q2", "type": "multiple_choice", "prompt": "Which programme should Bob watch if he likes shows that make him laugh?", "passage": "• 9.00 - Comedy: The Fox Teacher (Have a lot of fun with a fox teacher and his students on their first day at school.)", "options": [{"id": "A", "text": "Wildlife: Cuc Phuong Forest"}, {"id": "B", "text": "Comedy: The Fox Teacher"}, {"id": "C", "text": "Science: The Dolphins"}, {"id": "D", "text": "Game show: Children are Always Right"}], "correctAnswer": "B", "hint": "Look for the programme categorized as 'Comedy' (phim hài).", "explanation": "'Comedy: The Fox Teacher' là chương trình hài kịch ('Have a lot of fun...'), giúp khán giả cười thư giãn. Chọn B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u7-r-q3", "type": "multiple_choice", "prompt": "What time is the Sports programme broadcast?", "passage": "• 10.30 - Sports: The Pig Race (Watch the cute pigs compete in the most exciting races. Who wins?)", "options": [{"id": "A", "text": "At 8.00"}, {"id": "B", "text": "At 9.00"}, {"id": "C", "text": "At 10.30"}, {"id": "D", "text": "At 11.00"}], "correctAnswer": "C", "hint": "Find 'Sports: The Pig Race' in the time column.", "explanation": "Chương trình thể thao 'Sports: The Pig Race' phát sóng lúc 10.30. Chọn C.", "difficulty": "A1", "score": 1.0, "answer": "C"}, {"id": "g6-u7-r-q4", "type": "multiple_choice", "prompt": "Phong wants to know more about dogs and cats. Which programme is best for him?", "passage": "• 11.00 - Game show: Children are Always Right (Join this game show today and try to answer interesting questions about pets.)", "options": [{"id": "A", "text": "Game show: Children are Always Right"}, {"id": "B", "text": "Comedy: The Fox Teacher"}, {"id": "C", "text": "Wildlife: Cuc Phuong Forest"}, {"id": "D", "text": "Sports: The Pig Race"}], "correctAnswer": "A", "hint": "Which programme features questions about 'pets' (thú cưng như chó, mèo)?", "explanation": "Game show 'Children are Always Right' lúc 11.00 có nội dung: 'answer interesting questions about pets' (chó mèo là thú cưng - pets). Chọn A.", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u7-r-q5", "type": "multiple_choice", "prompt": "What is the main subject of the Science programme at 12.15?", "passage": "• 12.15 - Science: The Dolphins (Watch funny and interesting clips of intelligent dolphins in their natural life - the sea.)", "options": [{"id": "A", "text": "Flowers and trees in natural forests"}, {"id": "B", "text": "Intelligent dolphins in their natural sea life"}, {"id": "C", "text": "School children participating in singing contests"}, {"id": "D", "text": "Famous athletes in international matches"}], "correctAnswer": "B", "hint": "Check the programme title and description at 12.15.", "explanation": "Chương trình Science lúc 12.15 nói về cá heo thông minh: 'intelligent dolphins in their natural life - the sea'. Đáp án B chính xác.", "difficulty": "A1", "score": 1.0, "answer": "B"}]},

  {"id": "g6-u7-les-02", "skill": "listening", "unitId": "unit-g6-u7", "unitTitle": "Unit 7: Television", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: Evening TV Guide & Channels", "description": "Nghe bản tin giới thiệu các kênh và chương trình truyền hình buổi tối (Green Summer, My Childhood, Harry Potter, English and Fun).", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 13)", "questions": [{"id": "g6-u7-l-q1", "type": "multiple_choice", "prompt": "Which channel broadcasts the music programme 'Green Summer'?", "audioUrl": "/audio/g6-u7-tv-programmes.mp3", "passage": "[Audio Transcript]\nWelcome to What's On Today! Here are some great TV programmes for you this evening.\nFirst, on Channel 1 at seven o'clock, we have Green Summer. It is a fantastic music programme with songs performed by famous young singers.\nNext, on Channel 2 at eight o'clock, don't miss the movie My Childhood. It is a touching story about a lovely girl and her faithful dog in a peaceful village.\nIf you love magic and adventure, tune in to Channel 3 at eight thirty for Harry Potter. Children and teenagers all over the world love this magical movie series.\nFinally, on Channel 1 at five o'clock tomorrow afternoon, watch English and Fun. This educational programme helps you learn English vocabulary and songs. Enjoy your viewing!", "options": [{"id": "A", "text": "Channel 1"}, {"id": "B", "text": "Channel 2"}, {"id": "C", "text": "Channel 3"}, {"id": "D", "text": "Channel 7"}], "correctAnswer": "A", "hint": "Nghe câu: 'First, on Channel... at seven o'clock, we have Green Summer.'", "explanation": "Người dẫn chương trình nói rõ: 'First, on Channel 1 at seven o'clock, we have Green Summer.' Do đó phát sóng trên Kênh 1 (Channel 1).", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u7-l-q2", "type": "multiple_choice", "prompt": "What is the movie 'My Childhood' on Channel 2 about?", "audioUrl": "/audio/g6-u7-tv-programmes.mp3", "passage": "Next, on Channel 2 at eight o'clock, don't miss the movie My Childhood. It is a touching story about a lovely girl and her faithful dog in a peaceful village.", "options": [{"id": "A", "text": "A school of magic for young wizards"}, {"id": "B", "text": "A lovely girl and her faithful dog"}, {"id": "C", "text": "An exciting football tournament"}, {"id": "D", "text": "Wild dolphins living in the sea"}], "correctAnswer": "B", "hint": "Nghe nội dung sau 'It is a touching story about...'", "explanation": "Bài nghe mô tả: 'It is a touching story about a lovely girl and her faithful dog in a peaceful village.' Chọn B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u7-l-q3", "type": "multiple_choice", "prompt": "At what time can viewers watch the film 'Harry Potter' on Channel 3?", "audioUrl": "/audio/g6-u7-tv-programmes.mp3", "passage": "If you love magic and adventure, tune in to Channel 3 at eight thirty for Harry Potter.", "options": [{"id": "A", "text": "At 7:00"}, {"id": "B", "text": "At 8:00"}, {"id": "C", "text": "At 8:30"}, {"id": "D", "text": "At 5:00"}], "correctAnswer": "C", "hint": "Nghe mốc thời gian: 'tune in to Channel 3 at...'", "explanation": "Trong bài nghe: 'tune in to Channel 3 at eight thirty for Harry Potter' (8:30). Đáp án C đúng.", "difficulty": "A1", "score": 1.0, "answer": "C"}, {"id": "g6-u7-l-q4", "type": "multiple_choice", "prompt": "What type of programme is 'English and Fun'?", "audioUrl": "/audio/g6-u7-tv-programmes.mp3", "passage": "Finally, on Channel 1 at five o'clock tomorrow afternoon, watch English and Fun. This educational programme helps you learn English vocabulary and songs.", "options": [{"id": "A", "text": "A sports competition"}, {"id": "B", "text": "A comedy show for adults"}, {"id": "C", "text": "An educational programme for learning English"}, {"id": "D", "text": "A horror movie"}], "correctAnswer": "C", "hint": "Nghe cụm từ 'This educational programme helps you learn...'", "explanation": "Bài nghe nêu: 'This educational programme helps you learn English vocabulary and songs.' Do đó đây là chương trình giáo dục tiếng Anh. Chọn C.", "difficulty": "A1", "score": 1.0, "answer": "C"}]},

  {"id": "g6-u7-les-03", "skill": "grammar", "unitId": "unit-g6-u7", "unitTitle": "Unit 7: Television", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Grammar & Vocab: Wh-Questions & Conjunctions (and, but, so)", "description": "Nắm vững các từ để hỏi (What, When, Where, Why, How many, How often) và các liên từ kết hợp câu (and, but, so) cùng phát âm /θ/ - /ð/.", "durationMinutes": 12, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 8-10, 14)", "questions": [{"id": "g6-u7-g-q1", "type": "multiple_choice", "prompt": "Choose the correct question word: '_______ days a week do you go to class? - I go to class five days a week.'", "passage": null, "options": [{"id": "A", "text": "How many"}, {"id": "B", "text": "How often"}, {"id": "C", "text": "When"}, {"id": "D", "text": "Why"}], "correctAnswer": "A", "hint": "Hỏi về số lượng danh từ đếm được số nhiều ('days a week') dùng từ để hỏi nào?", "explanation": "Quy tắc ngữ pháp Unit 7: 'How many' + danh từ số nhiều dùng để hỏi số lượng ('How many days a week...?'). Chọn A.", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u7-g-q2", "type": "multiple_choice", "prompt": "Choose the correct question word: '_______ do you like the Wildlife programme? - Because I love animals.'", "passage": null, "options": [{"id": "A", "text": "What"}, {"id": "B", "text": "Where"}, {"id": "C", "text": "Why"}, {"id": "D", "text": "Who"}], "correctAnswer": "C", "hint": "Câu trả lời bắt đầu bằng 'Because' (bởi vì) chỉ lý do.", "explanation": "Từ để hỏi lý do/nguyên nhân là 'Why'. Câu trả lời bắt đầu bằng 'Because I love animals.' Do đó chọn C.", "difficulty": "A1", "score": 1.0, "answer": "C"}, {"id": "g6-u7-g-q3", "type": "multiple_choice", "prompt": "Conjunctions: Choose the correct conjunction: 'I'm tired, _______ I'll go to bed early tonight.'", "passage": null, "options": [{"id": "A", "text": "so"}, {"id": "B", "text": "but"}, {"id": "C", "text": "and"}, {"id": "D", "text": "although"}], "correctAnswer": "A", "hint": "Vế sau là kết quả của vế trước: 'Tôi mệt, vì thế tôi sẽ đi ngủ sớm'.", "explanation": "Liên từ 'so' dùng để diễn tả kết quả (so = vì vậy, cho nên). Chọn A.", "difficulty": "A1", "score": 1.0, "answer": "A"}, {"id": "g6-u7-g-q4", "type": "multiple_choice", "prompt": "Conjunctions: 'The television programme is very interesting, _______ it is too long.'", "passage": null, "options": [{"id": "A", "text": "so"}, {"id": "B", "text": "but"}, {"id": "C", "text": "and"}, {"id": "D", "text": "because"}], "correctAnswer": "B", "hint": "Hai vế mang nghĩa đối lập tương phản (rất hay nhưng quá dài).", "explanation": "Liên từ 'but' dùng để nối hai mệnh đề mang ý nghĩa tương phản (nhưng). Do đó chọn B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u7-g-q5", "type": "multiple_choice", "prompt": "Pronunciation: Choose the word with the underlined sound pronounced as /θ/ (voiceless):", "passage": null, "options": [{"id": "A", "text": "there (/ð/)"}, {"id": "B", "text": "weather (/ð/)"}, {"id": "C", "text": "theatre (/θ/)"}, {"id": "D", "text": "them (/ð/)"}], "correctAnswer": "C", "hint": "Từ 'theatre' phát âm âm đầu vô thanh /θ/, không rung dây thanh quản.", "explanation": "'theatre' (/ˈθɪətə/) có âm /θ/ vô thanh. Trong khi 'there' (/ðeə/), 'weather' (/ˈweðə/), 'them' (/ðem/) đều có âm /ð/ hữu thanh. Chọn C.", "difficulty": "A1", "score": 1.0, "answer": "C"}]},

  {"id": "g6-u7-les-04", "skill": "writing", "unitId": "unit-g6-u7", "unitTitle": "Unit 7: Television", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Writing: Your TV-Viewing Habits", "description": "Nối câu bằng liên từ kết hợp và viết đoạn văn khoảng 50 từ về thói quen xem truyền hình của bản thân.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 13 & 14)", "questions": [{"id": "g6-u7-w-q1", "type": "writing", "prompt": "Connect the two sentences using the conjunction 'so': 'I like The Seven Kitties very much. I watch it every day.'", "passage": null, "options": null, "correctAnswer": "I like The Seven Kitties very much, so I watch it every day.", "hint": "Đặt dấu phẩy và từ 'so' vào giữa hai mệnh đề: S + V, so + S + V.", "explanation": "Câu ghép với liên từ 'so' tạo thành: 'I like The Seven Kitties very much, so I watch it every day.'", "difficulty": "A1", "score": 2.0, "answer": "I like The Seven Kitties very much, so I watch it every day."}, {"id": "g6-u7-w-q2", "type": "writing", "prompt": "Write a paragraph (about 50 words) about your TV-viewing habits. Answer: 1. How much do you like watching TV? 2. How many hours a day do you watch? 3. When do you watch TV the most? 4. What is your favourite programme?", "passage": null, "options": null, "correctAnswer": "I like watching TV very much. I usually watch about one hour of TV a day, mostly in the evening after finishing my homework. I never watch TV while eating dinner because my family talks together. My favourite programme is English in a Minute because it is fun and educational.", "hint": "Dùng các từ: 'I like...', 'I usually watch... hours a day', 'in the evening', 'My favourite programme is... because...'", "explanation": "Tiêu chí chấm: Đầy đủ 4 ý theo hướng dẫn, độ dài khoảng 50 từ, sử dụng đúng thì Hiện tại đơn, liên từ 'because', 'and' và từ vựng Unit 7.", "difficulty": "A1", "score": 3.0, "answer": "I like watching TV very much. I usually watch about one hour of TV a day, mostly in the evening after finishing my homework. I never watch TV while eating dinner because my family talks together. My favourite programme is English in a Minute because it is fun and educational."}]},

  {"id": "g6-u7-les-05", "skill": "speaking", "unitId": "unit-g6-u7", "unitTitle": "Unit 7: Television", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Speaking: Talking About Your Favourite TV Programme", "description": "Luyện nói giới thiệu chương trình truyền hình yêu thích (tên chương trình, kênh, nội dung, lý do thích) có ghi âm & AI chấm điểm.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 7 & 13)", "questions": [{"id": "g6-u7-s-q1", "type": "speaking", "prompt": "Talk about your favourite TV programme (1-2 minutes). Guiding questions:\n1. What is the name of your favourite programme and which channel is it on?\n2. What is the programme about?\n3. Why do you like it?\n[Click Record and speak clearly in English]", "passage": null, "options": null, "correctAnswer": "Hello everyone! Today I want to tell you about my favourite TV programme. It is The Voice Kids on VTV3. It is a wonderful music talent show for children and teenagers. In this show, young singers from across Vietnam sing beautifully on stage. I love this programme because the songs are exciting and inspiring, and the judges are very friendly and funny. I always watch it with my family every Saturday night. Thank you for listening!", "hint": "Mẫu câu: 'My favourite TV programme is... on channel...', 'It is about...', 'I like it because...'", "explanation": "Tiêu chí AI & Giáo viên đánh giá: 1. Phát âm chuẩn từ vựng chủ đề truyền hình (programme, channel, talent show). 2. Phát âm chính xác âm /θ/ và /ð/. 3. Trôi chảy, tự nhiên. 4. Cấu trúc câu phong phú với các liên từ and, but, so.", "difficulty": "A1", "score": 5.0, "answer": "Hello everyone! Today I want to tell you about my favourite TV programme. It is The Voice Kids on VTV3. It is a wonderful music talent show for children and teenagers. In this show, young singers from across Vietnam sing beautifully on stage. I love this programme because the songs are exciting and inspiring, and the judges are very friendly and funny. I always watch it with my family every Saturday night. Thank you for listening!"}]},
  {
    "id": "g6-u3-prep-01",
    "skill": "reading",
    "unitId": "unit-g6-u3",
    "unitTitle": "Unit 3: My Friends",
    "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Reading: Personalities and Camp Activities (Bản Thảo Đang Biên Soạn)",
    "description": "Bài đọc về tính cách bạn bè và hoạt động cắm trại dã ngoại.",
    "durationMinutes": 15,
    "targetCefr": "A1",
    "status": "in_preparation",
    "provenance": "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    "questions": []
  },
  {
    "id": "g7-u3-prep-01",
    "skill": "reading",
    "unitId": "unit-g7-u3",
    "unitTitle": "Unit 3: Community Service",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Reading: Volunteering & Green Community Projects (Bản Thảo Đang Biên Soạn)",
    "description": "Bài đọc về các dự án tình nguyện dọn rác và quyên góp sách vở cho trẻ em vùng cao.",
    "durationMinutes": 15,
    "targetCefr": "A2",
    "status": "in_preparation",
    "provenance": "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    "questions": []
  },
  {
    "id": "g8-u3-prep-01",
    "skill": "reading",
    "unitId": "unit-g8-u3",
    "unitTitle": "Unit 3: Teenagers",
    "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Reading: Teen Pressure and Club Activities (Bản Thảo Đang Biên Soạn)",
    "description": "Bài đọc về áp lực học tập và các câu lạc bộ giải tỏa căng thẳng cho lứa tuổi thanh thiếu niên.",
    "durationMinutes": 15,
    "targetCefr": "A2",
    "status": "in_preparation",
    "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    "questions": []
  },
  {
    "id": "g9-u2-prep-01",
    "skill": "reading",
    "unitId": "unit-g9-u2",
    "unitTitle": "Unit 2: City Life",
    "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Reading: Modern Metropolis Challenges (Bản Thảo Đang Biên Soạn)",
    "description": "Bài đọc về những cơ hội và thách thức của cuộc sống đô thị hiện đại.",
    "durationMinutes": 15,
    "targetCefr": "B1",
    "status": "in_preparation",
    "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 2 (Đang biên soạn - Chờ thẩm định sư phạm)",
    "questions": []
  },
  {
    "id": "g9-u3-prep-01",
    "skill": "reading",
    "unitId": "unit-g9-u3",
    "unitTitle": "Unit 3: Healthy Living for Teens",
    "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Reading: Mental Health and Time Management (Bản Thảo Đang Biên Soạn)",
    "description": "Bài đọc về sức khỏe tinh thần và phương pháp quản lý thời gian hiệu quả cho học sinh cuối cấp.",
    "durationMinutes": 15,
    "targetCefr": "B1",
    "status": "in_preparation",
    "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 3 (Đang biên soạn - Chờ thẩm định sư phạm)",
    "questions": []
  },
  {
    "id": "g7-u2-les-01",
    "skill": "reading",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Reading: Healthy Eating & Nutritional Principles",
    "description": "Bài đọc chuyên sâu về chế độ dinh dưỡng cân bằng, giảm chất béo và kiểm soát lượng calo hàng ngày.",
    "durationMinutes": 20,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Trích xuất & chuẩn hóa từ GỦI.docx:P#484 (Exercise 20 & Exercise 18)",
    "questions": [
      {
        "id": "g7-u2-r-q1",
        "type": "multiple_choice",
        "prompt": "According to paragraph 1, what is the first important rule in healthy eating?",
        "passage": "There are two important matters in eating. First is eating enough calories to keep your body active. Second is choosing healthy food. Firstly, we need to reduce the amount of high-calorie food. Fat in fast food can cause heart problems. Secondly, you also should not eat too much sugar. Drinking sugary soft drinks often leads to obesity. Thirdly, it is good to have a rich-fibre diet. We can find fibre from fresh green vegetables, beans, and fresh fruits.",
        "options": [
          {
            "id": "A",
            "text": "Eating as much fast food as possible"
          },
          {
            "id": "B",
            "text": "Eating enough calories to keep the body active"
          },
          {
            "id": "C",
            "text": "Drinking sugary soft drinks every morning"
          },
          {
            "id": "D",
            "text": "Skipping all meals during the week"
          }
        ],
        "correctAnswer": "B",
        "hint": "Read the first two sentences of the passage carefully.",
        "explanation": "Bài đọc nêu rõ ở câu thứ hai: 'First is eating enough calories to keep your body active.' (Trước tiên là nạp đủ calo để giữ cơ thể hoạt động). Do đó đáp án B chính xác.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#484:Ex20"
      },
      {
        "id": "g7-u2-r-q2",
        "type": "multiple_choice",
        "prompt": "Why should we avoid eating too much fat in fast food?",
        "passage": "Firstly, we need to reduce the amount of high-calorie food. Fat in fast food can cause heart problems.",
        "options": [
          {
            "id": "A",
            "text": "Because it helps us run faster"
          },
          {
            "id": "B",
            "text": "Because it can cause heart problems"
          },
          {
            "id": "C",
            "text": "Because it makes our teeth brighter"
          },
          {
            "id": "D",
            "text": "Because it is completely free"
          }
        ],
        "correctAnswer": "B",
        "hint": "Find the word 'heart problems' in paragraph 2.",
        "explanation": "Đoạn văn viết: 'Fat in fast food can cause heart problems' (Chất béo trong đồ ăn nhanh có thể gây bệnh tim mạch). Đáp án B đúng.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#485:Ex20"
      },
      {
        "id": "g7-u2-r-q3",
        "type": "multiple_choice",
        "prompt": "Where can people find a good source of dietary fibre?",
        "passage": "Thirdly, it is good to have a rich-fibre diet. We can find fibre from fresh green vegetables, beans, and fresh fruits.",
        "options": [
          {
            "id": "A",
            "text": "From soft drinks and candies"
          },
          {
            "id": "B",
            "text": "From fried chicken and burgers"
          },
          {
            "id": "C",
            "text": "From fresh green vegetables, beans, and fruits"
          },
          {
            "id": "D",
            "text": "From coffee and energy drinks"
          }
        ],
        "correctAnswer": "C",
        "hint": "Look at the sentence mentioning 'find fibre from...'",
        "explanation": "Đoạn văn khẳng định: 'We can find fibre from fresh green vegetables, beans, and fresh fruits.' Đáp án C chính xác.",
        "difficulty": "A2",
        "score": 1,
        "answer": "C",
        "sourceLocator": "GỦI.docx:P#487:Ex20"
      },
      {
        "id": "g7-u2-r-q4",
        "type": "multiple_choice",
        "prompt": "Breakfast is the _______ important meal of the day.",
        "passage": "Breakfast is the most important meal of the day. It provides your brain and body with energy after a long night of sleep.",
        "options": [
          {
            "id": "A",
            "text": "most"
          },
          {
            "id": "B",
            "text": "healthy"
          },
          {
            "id": "C",
            "text": "tasty"
          },
          {
            "id": "D",
            "text": "more"
          }
        ],
        "correctAnswer": "A",
        "hint": "Superlative form: the + most + long adjective.",
        "explanation": "Cấu trúc so sánh nhất với tính từ dài: 'the most important' (quan trọng nhất). Đáp án A chính xác.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#469:Ex18"
      },
      {
        "id": "g7-u2-r-q5",
        "type": "multiple_choice",
        "prompt": "A healthy breakfast provides our brain and body with enough _______ for morning classes.",
        "passage": "Breakfast is the most important meal of the day. It provides your brain and body with energy after a long night of sleep.",
        "options": [
          {
            "id": "A",
            "text": "energy"
          },
          {
            "id": "B",
            "text": "acne"
          },
          {
            "id": "C",
            "text": "sunburn"
          },
          {
            "id": "D",
            "text": "headache"
          }
        ],
        "correctAnswer": "A",
        "hint": "Which word means power to be active?",
        "explanation": "Bữa sáng cung cấp năng lượng ('energy') cho não bộ và cơ thể sau một đêm dài. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#471:Ex18"
      },
      {
        "id": "g7-u2-r-q6",
        "type": "true_false",
        "prompt": "Statement: Skipping breakfast is recommended for teenagers who want to lose weight.",
        "passage": "Breakfast is the most important meal of the day. Doctors say that skipping breakfast makes teenagers tired and unable to concentrate at school.",
        "options": [
          {
            "id": "True",
            "text": "True (Đúng)"
          },
          {
            "id": "False",
            "text": "False (Sai)"
          }
        ],
        "correctAnswer": "False",
        "hint": "Does the doctor recommend skipping breakfast?",
        "explanation": "Bài đọc khẳng định các bác sĩ cảnh báo rằng bỏ bữa sáng khiến học sinh mệt mỏi và mất tập trung. Do đó câu nhận định trên là False (Sai).",
        "difficulty": "A2",
        "score": 1,
        "answer": "False",
        "sourceLocator": "GỦI.docx:P#469:Ex18"
      },
      {
        "id": "g7-u2-r-q7",
        "type": "multiple_choice",
        "prompt": "Which of the following foods is rich in vegetable protein according to Vietnamese nutrition?",
        "passage": "Tofu and soybeans are popular in Vietnamese meals. They provide high-quality vegetable protein without harmful cholesterol.",
        "options": [
          {
            "id": "A",
            "text": "Tofu and soybeans"
          },
          {
            "id": "B",
            "text": "Butter and cheese"
          },
          {
            "id": "C",
            "text": "White sugar"
          },
          {
            "id": "D",
            "text": "French fries"
          }
        ],
        "correctAnswer": "A",
        "hint": "Find the two plant foods mentioned at the beginning.",
        "explanation": "Bài viết nêu rõ 'Tofu and soybeans... provide high-quality vegetable protein' (Đậu phụ và đậu nành cung cấp đạm thực vật chất lượng cao). Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#323:Ex9"
      },
      {
        "id": "g7-u2-r-q8",
        "type": "multiple_choice",
        "prompt": "What condition often happens if people spend hours in the strong sun without wearing a hat?",
        "passage": "The sun is strongest between 10 a.m. and 4 p.m. If you stay outside without suncream and a hat, ultraviolet rays will damage your skin and cause severe sunburn.",
        "options": [
          {
            "id": "A",
            "text": "Sunburn"
          },
          {
            "id": "B",
            "text": "Chapped lips"
          },
          {
            "id": "C",
            "text": "Stomachache"
          },
          {
            "id": "D",
            "text": "Toothache"
          }
        ],
        "correctAnswer": "A",
        "hint": "Red, painful skin from ultraviolet rays.",
        "explanation": "Tia cực tím trong ánh nắng gay gắt gây cháy nắng ('sunburn'). Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#270:Ex3"
      },
      {
        "id": "g7-u2-r-q9",
        "type": "fill_in_the_blank",
        "prompt": "Complete the sentence with one suitable word from the text: Eating too much sugar can lead to _______.",
        "passage": "Secondly, you also should not eat too much sugar. Drinking sugary soft drinks often leads to obesity.",
        "options": null,
        "correctAnswer": "obesity",
        "hint": "A medical word for being very overweight.",
        "explanation": "Từ cần điền trong đoạn văn là 'obesity' (bệnh béo phì).",
        "difficulty": "A2",
        "score": 1,
        "answer": "obesity",
        "sourceLocator": "GỦI.docx:P#486:Ex20"
      },
      {
        "id": "g7-u2-r-q10",
        "type": "multiple_choice",
        "prompt": "What is the best title for the entire reading passage?",
        "passage": "There are two important matters in eating. First is eating enough calories to keep your body active... Secondly, do not eat too much sugar... Thirdly, eat a rich-fibre diet...",
        "options": [
          {
            "id": "A",
            "text": "The History of Fast Food"
          },
          {
            "id": "B",
            "text": "Principles of a Healthy and Balanced Diet"
          },
          {
            "id": "C",
            "text": "How to Cook Vietnamese Tofu"
          },
          {
            "id": "D",
            "text": "The Disadvantages of Drinking Milk"
          }
        ],
        "correctAnswer": "B",
        "hint": "What main idea do all three paragraphs discuss?",
        "explanation": "Toàn bộ bài đọc hướng dẫn các nguyên tắc xây dựng chế độ ăn uống lành mạnh và cân bằng (Principles of a Healthy and Balanced Diet). Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#484:Ex20"
      }
    ]
  },
  {
    "id": "g7-u2-les-02",
    "skill": "vocabulary",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Vocabulary: Health Problems & Odd-One-Out",
    "description": "Nhận biết các vấn đề sức khỏe thường gặp (sunburn, acne, flu, fever), phân loại nhóm từ và nối tranh minh họa.",
    "durationMinutes": 15,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Trích xuất & chuẩn hóa từ GỦI.docx:P#268-316 (Exercise 3, 5, 8)",
    "questions": [
      {
        "id": "g7-u2-v-q1",
        "type": "multiple_choice",
        "prompt": "Choose the odd one out in this group: A. interesting  B. popular  C. nice  D. lunch",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "interesting"
          },
          {
            "id": "B",
            "text": "popular"
          },
          {
            "id": "C",
            "text": "nice"
          },
          {
            "id": "D",
            "text": "lunch"
          }
        ],
        "correctAnswer": "D",
        "hint": "Ba từ là tính từ chỉ tính chất, từ còn lại là danh từ chỉ bữa ăn.",
        "explanation": "'lunch' là danh từ (bữa trưa). Ba từ 'interesting' (thú vị), 'popular' (phổ biến), 'nice' (đẹp, tốt) đều là tính từ.",
        "difficulty": "A2",
        "score": 1,
        "answer": "D",
        "sourceLocator": "GỦI.docx:P#269:Ex3"
      },
      {
        "id": "g7-u2-v-q2",
        "type": "multiple_choice",
        "prompt": "Choose the odd one out in this group: A. sunburn  B. chapped lips  C. red spots  D. cycling",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "sunburn"
          },
          {
            "id": "B",
            "text": "chapped lips"
          },
          {
            "id": "C",
            "text": "red spots"
          },
          {
            "id": "D",
            "text": "cycling"
          }
        ],
        "correctAnswer": "D",
        "hint": "Ba từ là triệu chứng/vấn đề về da, một từ là môn thể thao ngoài trời.",
        "explanation": "'cycling' là môn thể thao đạp xe. Ba từ còn lại 'sunburn' (cháy nắng), 'chapped lips' (nứt môi), 'red spots' (đốm đỏ) đều là vấn đề về da.",
        "difficulty": "A2",
        "score": 1,
        "answer": "D",
        "sourceLocator": "GỦI.docx:P#270:Ex3"
      },
      {
        "id": "g7-u2-v-q3",
        "type": "multiple_choice",
        "prompt": "Choose the odd one out: A. wash  B. sad  C. wear  D. brush",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "wash"
          },
          {
            "id": "B",
            "text": "sad"
          },
          {
            "id": "C",
            "text": "wear"
          },
          {
            "id": "D",
            "text": "brush"
          }
        ],
        "correctAnswer": "B",
        "hint": "'sad' là tính từ chỉ cảm xúc, ba từ còn lại là động từ hành động.",
        "explanation": "'sad' (buồn bã) là tính từ. 'wash' (rửa), 'wear' (mặc), 'brush' (chải) đều là động từ.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#271:Ex3"
      },
      {
        "id": "g7-u2-v-q4",
        "type": "multiple_choice",
        "prompt": "Choose the odd one out: A. carrot  B. tomato  C. lemonade  D. potato",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "carrot"
          },
          {
            "id": "B",
            "text": "tomato"
          },
          {
            "id": "C",
            "text": "lemonade"
          },
          {
            "id": "D",
            "text": "potato"
          }
        ],
        "correctAnswer": "C",
        "hint": "'lemonade' là đồ uống, ba từ còn lại là rau củ.",
        "explanation": "'lemonade' (nước chanh) là đồ uống. 'carrot' (cà rốt), 'tomato' (cà chua), 'potato' (khoai tây) là các loại củ quả.",
        "difficulty": "A2",
        "score": 1,
        "answer": "C",
        "sourceLocator": "GỦI.docx:P#272:Ex3"
      },
      {
        "id": "g7-u2-v-q5",
        "type": "multiple_choice",
        "prompt": "Choose the odd one out: A. fever  B. toothache  C. suncream  D. cough",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "fever"
          },
          {
            "id": "B",
            "text": "toothache"
          },
          {
            "id": "C",
            "text": "suncream"
          },
          {
            "id": "D",
            "text": "cough"
          }
        ],
        "correctAnswer": "C",
        "hint": "'suncream' là sản phẩm bảo vệ da, ba từ còn lại là triệu chứng bệnh.",
        "explanation": "'suncream' (kem chống nắng) là sản phẩm chăm sóc da. 'fever' (sốt), 'toothache' (đau răng), 'cough' (ho) là các bệnh/triệu chứng.",
        "difficulty": "A2",
        "score": 1,
        "answer": "C",
        "sourceLocator": "GỦI.docx:P#291:Ex5"
      },
      {
        "id": "g7-u2-v-q6",
        "type": "multiple_choice",
        "prompt": "Acne _______ about 70% of young people between the ages of 12 and 25.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "affects"
          },
          {
            "id": "B",
            "text": "suncream"
          },
          {
            "id": "C",
            "text": "soybeans"
          },
          {
            "id": "D",
            "text": "tired"
          }
        ],
        "correctAnswer": "A",
        "hint": "Which verb means 'to have an influence on'?",
        "explanation": "Động từ 'affects' (ảnh hưởng tới). Mụn trứng cá ảnh hưởng đến khoảng 70% thanh thiếu niên trong độ tuổi 12-25. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#316:Ex8"
      },
      {
        "id": "g7-u2-v-q7",
        "type": "multiple_choice",
        "prompt": "You should go to bed _______ and get enough 8 hours of sleep every night.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "early"
          },
          {
            "id": "B",
            "text": "late"
          },
          {
            "id": "C",
            "text": "dim"
          },
          {
            "id": "D",
            "text": "chapped"
          }
        ],
        "correctAnswer": "A",
        "hint": "The opposite of 'late'.",
        "explanation": "'go to bed early' (đi ngủ sớm) để ngủ đủ giấc. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#317:Ex8"
      },
      {
        "id": "g7-u2-v-q8",
        "type": "multiple_choice",
        "prompt": "Vegetarians eat a lot of food made from _______, such as tofu and soy milk.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "soybeans"
          },
          {
            "id": "B",
            "text": "sunburn"
          },
          {
            "id": "C",
            "text": "headaches"
          },
          {
            "id": "D",
            "text": "lip balm"
          }
        ],
        "correctAnswer": "A",
        "hint": "Plant food used to make tofu.",
        "explanation": "'soybeans' (đậu nành) là nguyên liệu làm đậu phụ và sữa đậu nành. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#314:Ex8"
      },
      {
        "id": "g7-u2-v-q9",
        "type": "multiple_choice",
        "prompt": "When you have dry and _______, you should apply lip balm regularly.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "chapped lips"
          },
          {
            "id": "B",
            "text": "strong muscles"
          },
          {
            "id": "C",
            "text": "fit body"
          },
          {
            "id": "D",
            "text": "active games"
          }
        ],
        "correctAnswer": "A",
        "hint": "Condition of dry lips in windy weather.",
        "explanation": "'chapped lips' (môi nứt nẻ). Khi môi bị khô nứt thì nên bôi sáp dưỡng môi. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#288:Ex5"
      },
      {
        "id": "g7-u2-v-q10",
        "type": "multiple_choice",
        "prompt": "Do not read books in _______ because it will cause eye strain.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "dim light"
          },
          {
            "id": "B",
            "text": "suncream"
          },
          {
            "id": "C",
            "text": "clean water"
          },
          {
            "id": "D",
            "text": "warm clothes"
          }
        ],
        "correctAnswer": "A",
        "hint": "Light that is not bright enough.",
        "explanation": "'dim light' (ánh sáng mờ/yếu). Không nên đọc sách trong điều kiện thiếu sáng. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#286:Ex5"
      },
      {
        "id": "g7-u2-v-q11",
        "type": "multiple_choice",
        "prompt": "Remember to apply _______ before you go to the beach on sunny days.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "suncream"
          },
          {
            "id": "B",
            "text": "acne"
          },
          {
            "id": "C",
            "text": "headache"
          },
          {
            "id": "D",
            "text": "fever"
          }
        ],
        "correctAnswer": "A",
        "hint": "Lotion to protect skin from sunlight.",
        "explanation": "'suncream' (kem chống nắng). Bôi kem chống nắng trước khi đi biển. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#293:Ex5"
      },
      {
        "id": "g7-u2-v-q12",
        "type": "multiple_choice",
        "prompt": "Doing regular exercise helps you burn _______ and keep fit.",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "calories"
          },
          {
            "id": "B",
            "text": "sunburn"
          },
          {
            "id": "C",
            "text": "cold water"
          },
          {
            "id": "D",
            "text": "lip balm"
          }
        ],
        "correctAnswer": "A",
        "hint": "Unit of energy burned during sports.",
        "explanation": "'burn calories' (đốt cháy calo). Tập thể dục thường xuyên giúp đốt cháy calo và giữ dáng. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:T#1"
      }
    ]
  },
  {
    "id": "g7-u2-les-03",
    "skill": "grammar",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Grammar: Simple Sentences (S + V + O / Adv)",
    "description": "Nhận biết cấu trúc câu đơn, phân biệt Chủ ngữ (S), Động từ (V), Tân ngữ (O) và Trạng từ (Adv); liên từ nối and/but/so/or.",
    "durationMinutes": 18,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Trích xuất & chuẩn hóa từ GỦI.docx:P#322-353 (Exercise 9, 10, 11)",
    "questions": [
      {
        "id": "g7-u2-g-q1",
        "type": "multiple_choice",
        "prompt": "In the sentence 'Tofu has vegetable protein and vitamin B.', what is the subject (S)?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Tofu"
          },
          {
            "id": "B",
            "text": "has"
          },
          {
            "id": "C",
            "text": "vegetable protein"
          },
          {
            "id": "D",
            "text": "vitamin B"
          }
        ],
        "correctAnswer": "A",
        "hint": "The noun that performs or has the state of the verb.",
        "explanation": "Chủ ngữ (Subject) của câu là 'Tofu'. Động từ là 'has'. Tân ngữ là 'vegetable protein and vitamin B'.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#323:Ex9"
      },
      {
        "id": "g7-u2-g-q2",
        "type": "multiple_choice",
        "prompt": "In the sentence 'Acne is not a serious disease.', what is the verb (V)?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "is not"
          },
          {
            "id": "B",
            "text": "Acne"
          },
          {
            "id": "C",
            "text": "serious"
          },
          {
            "id": "D",
            "text": "disease"
          }
        ],
        "correctAnswer": "A",
        "hint": "The linking verb in negative form.",
        "explanation": "Động từ chính của câu là động từ to be ở thể phủ định: 'is not'.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#324:Ex9"
      },
      {
        "id": "g7-u2-g-q3",
        "type": "multiple_choice",
        "prompt": "In the sentence 'We should eat more fruits and vegetables.', what is the verb phrase?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "should eat"
          },
          {
            "id": "B",
            "text": "We"
          },
          {
            "id": "C",
            "text": "more fruits"
          },
          {
            "id": "D",
            "text": "vegetables"
          }
        ],
        "correctAnswer": "A",
        "hint": "Modal verb + base form.",
        "explanation": "Cụm động từ chính là động từ khuyết thiếu kết hợp động từ nguyên thể: 'should eat'.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#326:Ex9"
      },
      {
        "id": "g7-u2-g-q4",
        "type": "multiple_choice",
        "prompt": "In the sentence 'My brother does morning exercises every day.', what is the object (O)?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "morning exercises"
          },
          {
            "id": "B",
            "text": "My brother"
          },
          {
            "id": "C",
            "text": "does"
          },
          {
            "id": "D",
            "text": "every day"
          }
        ],
        "correctAnswer": "A",
        "hint": "What does the brother do? (Answers 'What?')",
        "explanation": "Tân ngữ trực tiếp trả lời cho câu hỏi 'Làm cái gì?': 'morning exercises' (bài tập buổi sáng). 'every day' là trạng từ chỉ thời gian.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#327:Ex9"
      },
      {
        "id": "g7-u2-g-q5",
        "type": "multiple_choice",
        "prompt": "In the sentence 'We seldom go out at night.', what role does the word 'seldom' play?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Adverb of frequency (Adv)"
          },
          {
            "id": "B",
            "text": "Direct Object (O)"
          },
          {
            "id": "C",
            "text": "Subject (S)"
          },
          {
            "id": "D",
            "text": "Main verb (V)"
          }
        ],
        "correctAnswer": "A",
        "hint": "'seldom' means rarely, describing how often.",
        "explanation": "'seldom' (hiếm khi) là trạng từ chỉ tần suất (Adverb of frequency - Adv), không phải tân ngữ.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#331:Ex10"
      },
      {
        "id": "g7-u2-g-q6",
        "type": "multiple_choice",
        "prompt": "In the sentence 'I caught a terrific headache yesterday.', what role does 'a terrific headache' play?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Direct Object (O)"
          },
          {
            "id": "B",
            "text": "Adverb of time (Adv)"
          },
          {
            "id": "C",
            "text": "Subject (S)"
          },
          {
            "id": "D",
            "text": "Preposition"
          }
        ],
        "correctAnswer": "A",
        "hint": "Answers the question: What did I catch?",
        "explanation": "'a terrific headache' đứng sau động từ ngoại động từ 'caught', đóng vai trò là tân ngữ (Object - O) của câu.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#337:Ex10"
      },
      {
        "id": "g7-u2-g-q7",
        "type": "multiple_choice",
        "prompt": "Choose the correct coordinating conjunction: 'He likes swimming, _______ his brother prefers cycling.'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "but"
          },
          {
            "id": "B",
            "text": "so"
          },
          {
            "id": "C",
            "text": "or"
          },
          {
            "id": "D",
            "text": "because of"
          }
        ],
        "correctAnswer": "A",
        "hint": "Shows contrast between two preferences.",
        "explanation": "Hai vế câu thể hiện sự đối lập về sở thích (likes swimming vs. prefers cycling), do đó dùng liên từ 'but' (nhưng).",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#254:Grammar"
      },
      {
        "id": "g7-u2-g-q8",
        "type": "multiple_choice",
        "prompt": "Choose the correct conjunction: 'Eat more fresh fruit, _______ you will not have enough vitamins.'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "or"
          },
          {
            "id": "B",
            "text": "and"
          },
          {
            "id": "C",
            "text": "so"
          },
          {
            "id": "D",
            "text": "but"
          }
        ],
        "correctAnswer": "A",
        "hint": "'or' is used in warnings: Do X, or Y will happen.",
        "explanation": "Cấu trúc đưa ra lời cảnh báo: Mệnh lệnh thức + or + mệnh đề kết quả tiêu cực ('or' = nếu không thì). Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#254:Grammar"
      },
      {
        "id": "g7-u2-g-q9",
        "type": "multiple_choice",
        "prompt": "Match Question & Answer: 'What is the matter with you?' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "I have a flu and a headache."
          },
          {
            "id": "B",
            "text": "Every day."
          },
          {
            "id": "C",
            "text": "7 to 8 hours."
          },
          {
            "id": "D",
            "text": "Yes, I do."
          }
        ],
        "correctAnswer": "A",
        "hint": "Answers about a health problem or symptom.",
        "explanation": "Câu hỏi 'What is the matter with you?' (Bạn bị làm sao thế?) hỏi về tình trạng sức khỏe. Câu trả lời phù hợp là 'I have a flu and a headache.'",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#350:Ex11"
      },
      {
        "id": "g7-u2-g-q10",
        "type": "multiple_choice",
        "prompt": "Match Question & Answer: 'How many hours do you sleep a day?' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "7 to 8 hours."
          },
          {
            "id": "B",
            "text": "I like milk."
          },
          {
            "id": "C",
            "text": "At 10 p.m."
          },
          {
            "id": "D",
            "text": "No, she doesn't."
          }
        ],
        "correctAnswer": "A",
        "hint": "Answers about duration in hours.",
        "explanation": "Câu hỏi 'How many hours do you sleep a day?' hỏi về số lượng giờ ngủ mỗi ngày. Câu trả lời đúng là '7 to 8 hours.'",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#353:Ex11"
      },
      {
        "id": "g7-u2-g-q11",
        "type": "multiple_choice",
        "prompt": "Match Question & Answer: 'How often do you exercise?' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Every day in the afternoon."
          },
          {
            "id": "B",
            "text": "With my brother."
          },
          {
            "id": "C",
            "text": "At school playground."
          },
          {
            "id": "D",
            "text": "Because I want to be strong."
          }
        ],
        "correctAnswer": "A",
        "hint": "'How often' asks about frequency.",
        "explanation": "'How often' hỏi tần suất thực hiện. Câu trả lời tương ứng là 'Every day in the afternoon.' (Mỗi ngày vào buổi chiều).",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#352:Ex11"
      },
      {
        "id": "g7-u2-g-q12",
        "type": "multiple_choice",
        "prompt": "Choose the correct sentence structure for a simple sentence with compound subject:",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Linda and Jenny are playing tennis in the yard."
          },
          {
            "id": "B",
            "text": "Linda plays tennis but Jenny watches TV."
          },
          {
            "id": "C",
            "text": "Because Linda is sick, she stays at home."
          },
          {
            "id": "D",
            "text": "Although it rained, we played football."
          }
        ],
        "correctAnswer": "A",
        "hint": "Two subjects connected by 'and' sharing one verb predicate.",
        "explanation": "'Linda and Jenny are playing tennis in the yard.' là câu đơn có chủ ngữ ghép gồm 2 danh từ nối bằng 'and' cùng thực hiện một hành động 'are playing'. Ba câu còn lại là câu ghép hoặc câu phức.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#255:Grammar"
      }
    ]
  },
  {
    "id": "g7-u2-les-04",
    "skill": "grammar",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Word Formation & Sentence Rewriting",
    "description": "Biến đổi từ loại (affect, avoid, differ, active, strength) và viết lại câu giữ nguyên nghĩa với từ gợi ý.",
    "durationMinutes": 18,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Trích xuất & chuẩn hóa từ GỦI.docx:P#368-380 & P#610-630 (Exercise 13 & Exercise 25)",
    "questions": [
      {
        "id": "g7-u2-wf-q1",
        "type": "fill_in_the_blank",
        "prompt": "Supply the correct form of the word in brackets: 'What you eat can directly _______ your energy levels throughout the day.' (affection)",
        "passage": null,
        "options": null,
        "correctAnswer": "affect",
        "hint": "We need a verb after modal verb 'can' + adverb 'directly'.",
        "explanation": "Sau trạng từ 'directly' bổ nghĩa cho động từ, ta cần động từ nguyên thể của gốc từ 'affection' là 'affect' (ảnh hưởng).",
        "difficulty": "A2",
        "score": 1,
        "answer": "affect",
        "sourceLocator": "GỦI.docx:P#368:Ex13"
      },
      {
        "id": "g7-u2-wf-q2",
        "type": "fill_in_the_blank",
        "prompt": "Supply the correct form of the word in brackets: 'Many common colds are _______ if you wash your hands frequently.' (avoid)",
        "passage": null,
        "options": null,
        "correctAnswer": "avoidable",
        "hint": "We need an adjective after linking verb 'are'. (Suffix -able)",
        "explanation": "Sau động từ to be 'are' cần một tính từ mang nghĩa 'có thể phòng tránh được'. Dạng tính từ của 'avoid' là 'avoidable'.",
        "difficulty": "A2",
        "score": 1,
        "answer": "avoidable",
        "sourceLocator": "GỦI.docx:P#370:Ex13"
      },
      {
        "id": "g7-u2-wf-q3",
        "type": "fill_in_the_blank",
        "prompt": "Supply the correct form of the word in brackets: 'Regular physical activity helps _______ your bones and muscles.' (strength)",
        "passage": null,
        "options": null,
        "correctAnswer": "strengthen",
        "hint": "We need a verb after 'helps' (help do sth).",
        "explanation": "Cấu trúc 'help + (to) V'. Dạng động từ của danh từ 'strength' (sức mạnh) là 'strengthen' (làm mạnh lên, củng cố).",
        "difficulty": "A2",
        "score": 1,
        "answer": "strengthen",
        "sourceLocator": "GỦI.docx:T#2:WordForms"
      },
      {
        "id": "g7-u2-wf-q4",
        "type": "fill_in_the_blank",
        "prompt": "Supply the correct form of the word in brackets: 'Healthy food and fast food taste very _______.' (differ)",
        "passage": null,
        "options": null,
        "correctAnswer": "differently",
        "hint": "We need an adverb after taste / or adjective 'different'.",
        "explanation": "Hai cách dùng: 'taste differently' (có vị khác nhau) hoặc 'taste different' (theo ngữ cảnh giao tiếp). Đáp án chuẩn là 'different' hoặc 'differently'.",
        "difficulty": "A2",
        "score": 1,
        "answer": "different",
        "sourceLocator": "GỦI.docx:T#2:WordForms"
      },
      {
        "id": "g7-u2-wf-q5",
        "type": "fill_in_the_blank",
        "prompt": "Supply the correct form of the word in brackets: 'Children should participate _______ in outdoor games.' (active)",
        "passage": null,
        "options": null,
        "correctAnswer": "actively",
        "hint": "Adverb modifying the verb 'participate'. (Suffix -ly)",
        "explanation": "Bổ nghĩa cho động từ 'participate' (tham gia) cần một trạng từ: 'actively' (một cách tích cực/năng động).",
        "difficulty": "A2",
        "score": 1,
        "answer": "actively",
        "sourceLocator": "GỦI.docx:T#2:WordForms"
      },
      {
        "id": "g7-u2-wf-q6",
        "type": "writing",
        "prompt": "Rewrite the sentence using the word in brackets: 'You can learn things better if you do exercise. (help)' -> 'Doing exercise...'",
        "passage": null,
        "options": null,
        "correctAnswer": "Doing exercise helps you learn things better.",
        "hint": "Subject is 'Doing exercise', verb is 'helps' (singular).",
        "explanation": "Viết lại câu dùng cấu trúc 'help sb do sth': 'Doing exercise helps you learn things better.' (Tập thể dục giúp bạn học tập tốt hơn).",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "Doing exercise helps you learn things better.",
        "sourceLocator": "GỦI.docx:P#611:Ex25"
      },
      {
        "id": "g7-u2-wf-q7",
        "type": "writing",
        "prompt": "Rewrite the sentence: 'Giang feels tired, so she doesn't want to eat any food.' -> 'Because Giang...'",
        "passage": null,
        "options": null,
        "correctAnswer": "Because Giang feels tired, she doesn't want to eat any food.",
        "hint": "Use clause connector 'Because' at the beginning of the sentence.",
        "explanation": "Chuyển từ câu nối bằng 'so' sang câu chỉ nguyên nhân bắt đầu bằng 'Because': 'Because Giang feels tired, she doesn't want to eat any food.'",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "Because Giang feels tired, she doesn't want to eat any food.",
        "sourceLocator": "GỦI.docx:P#613:Ex25"
      },
      {
        "id": "g7-u2-wf-q8",
        "type": "writing",
        "prompt": "Rewrite the sentence: 'It is a good idea to drink plenty of water every day.' -> 'You should...'",
        "passage": null,
        "options": null,
        "correctAnswer": "You should drink plenty of water every day.",
        "hint": "It is a good idea to V = You should V.",
        "explanation": "Cấu trúc đưa ra lời khuyên: 'It is a good idea to do sth' = 'You should do sth'. Viết lại: 'You should drink plenty of water every day.'",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "You should drink plenty of water every day.",
        "sourceLocator": "GỦI.docx:P#627:Ex25"
      },
      {
        "id": "g7-u2-wf-q9",
        "type": "writing",
        "prompt": "Rewrite the sentence: 'Mike doesn't like eating fast food.' -> 'Mike dislikes...'",
        "passage": null,
        "options": null,
        "correctAnswer": "Mike dislikes eating fast food.",
        "hint": "doesn't like + V-ing = dislikes + V-ing.",
        "explanation": "Đồng nghĩa: not like V-ing = dislike V-ing. Với chủ ngữ Mike ngôi thứ ba số ít: 'Mike dislikes eating fast food.'",
        "difficulty": "A2",
        "score": 1,
        "answer": "Mike dislikes eating fast food.",
        "sourceLocator": "GỦI.docx:P#617:Ex25"
      },
      {
        "id": "g7-u2-wf-q10",
        "type": "writing",
        "prompt": "Rewrite the sentence: 'My mother eats lots of green vegetables. My mother does regular exercise. (and)' -> 'My mother...'",
        "passage": null,
        "options": null,
        "correctAnswer": "My mother eats lots of green vegetables and does regular exercise.",
        "hint": "Combine two actions with the same subject using 'and'.",
        "explanation": "Nối hai hành động cùng chủ ngữ bằng liên từ 'and': 'My mother eats lots of green vegetables and does regular exercise.'",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "My mother eats lots of green vegetables and does regular exercise.",
        "sourceLocator": "GỦI.docx:P#569:Ex23"
      }
    ]
  },
  {
    "id": "g7-u2-les-05",
    "skill": "grammar",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Communication Exchanges & Sentence Reordering",
    "description": "Sắp xếp từ thành câu hoàn chỉnh và chọn câu phản hồi tình huống giao tiếp về lời khuyên sức khỏe.",
    "durationMinutes": 15,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Trích xuất & chuẩn hóa từ GỦI.docx:P#385-400 & P#539-555 (Exercise 14 & Exercise 22)",
    "questions": [
      {
        "id": "g7-u2-comm-q1",
        "type": "multiple_choice",
        "prompt": "Complete the exchange: 'How many hours do we need to sleep a day?' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "8 to 10 hours for teenagers."
          },
          {
            "id": "B",
            "text": "Sleep as late as possible."
          },
          {
            "id": "C",
            "text": "I like dreaming."
          },
          {
            "id": "D",
            "text": "Yes, I need sleep."
          }
        ],
        "correctAnswer": "A",
        "hint": "A precise answer giving duration for teenagers.",
        "explanation": "Câu hỏi 'How many hours...' cần câu trả lời chỉ số lượng giờ cụ thể: '8 to 10 hours for teenagers.' Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#386:Ex14"
      },
      {
        "id": "g7-u2-comm-q2",
        "type": "multiple_choice",
        "prompt": "Complete the exchange: 'When should we open the bedroom window?' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "In the morning to let fresh air in."
          },
          {
            "id": "B",
            "text": "When it is raining heavily."
          },
          {
            "id": "C",
            "text": "Never open windows."
          },
          {
            "id": "D",
            "text": "At midnight."
          }
        ],
        "correctAnswer": "A",
        "hint": "When should fresh air be let in?",
        "explanation": "Mở cửa sổ vào buổi sáng ('In the morning to let fresh air in') để đón không khí trong lành. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#389:Ex14"
      },
      {
        "id": "g7-u2-comm-q3",
        "type": "multiple_choice",
        "prompt": "Complete the exchange: 'I have a sore throat and a high fever.' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "You should see a doctor and drink warm water."
          },
          {
            "id": "B",
            "text": "You should drink cold ice tea."
          },
          {
            "id": "C",
            "text": "Congratulations on that!"
          },
          {
            "id": "D",
            "text": "Let's go swimming now."
          }
        ],
        "correctAnswer": "A",
        "hint": "Good medical advice for throat ache and fever.",
        "explanation": "Lời khuyên y tế hợp lý cho người bị đau họng và sốt cao là đi khám bác sĩ và uống nước ấm ('You should see a doctor and drink warm water').",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#392:Ex14"
      },
      {
        "id": "g7-u2-comm-q4",
        "type": "multiple_choice",
        "prompt": "Complete the exchange: 'Why do you look so tired today, Nam?' — '_______'",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Because I stayed up late studying for exams."
          },
          {
            "id": "B",
            "text": "Because I ate a big breakfast."
          },
          {
            "id": "C",
            "text": "Yes, I am happy."
          },
          {
            "id": "D",
            "text": "No, thank you."
          }
        ],
        "correctAnswer": "A",
        "hint": "Reason for feeling tired.",
        "explanation": "Nguyên nhân mệt mỏi là thức khuya học bài ('Because I stayed up late studying for exams'). Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#395:Ex14"
      },
      {
        "id": "g7-u2-comm-q5",
        "type": "writing",
        "prompt": "Reorder the words to make a meaningful sentence: 'sports / should / We / to / a / good / play / health / have / .'",
        "passage": null,
        "options": null,
        "correctAnswer": "We should play sports to have good health.",
        "hint": "Subject (We) + Modal verb (should) + Main verb (play sports) + Purpose clause (to have good health).",
        "explanation": "Trật tự câu chuẩn: 'We should play sports to have good health.' (Chúng ta nên chơi thể thao để có sức khỏe tốt).",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "We should play sports to have good health.",
        "sourceLocator": "GỦI.docx:P#540:Ex22"
      },
      {
        "id": "g7-u2-comm-q6",
        "type": "writing",
        "prompt": "Reorder the words to make a sentence: 'likes / My grandmother / eating / tofu / .'",
        "passage": null,
        "options": null,
        "correctAnswer": "My grandmother likes eating tofu.",
        "hint": "Subject (My grandmother) + verb (likes) + gerund object (eating tofu).",
        "explanation": "Trật tự câu: 'My grandmother likes eating tofu.' (Bà tôi thích ăn đậu phụ).",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "My grandmother likes eating tofu.",
        "sourceLocator": "GỦI.docx:P#542:Ex22"
      },
      {
        "id": "g7-u2-comm-q7",
        "type": "writing",
        "prompt": "Reorder the words to make a sentence: 'acne / Avoid / touching / to / prevent / your face / .'",
        "passage": null,
        "options": null,
        "correctAnswer": "Avoid touching your face to prevent acne.",
        "hint": "Imperative: Avoid + V-ing + object + to-infinitive.",
        "explanation": "Câu mệnh lệnh thức: 'Avoid touching your face to prevent acne.' (Tránh chạm vào mặt để ngăn ngừa mụn).",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "Avoid touching your face to prevent acne.",
        "sourceLocator": "GỦI.docx:P#545:Ex22"
      },
      {
        "id": "g7-u2-comm-q8",
        "type": "writing",
        "prompt": "Reorder the words to make a sentence: 'wear / You / should / sunglasses / your eyes / protect / to / .'",
        "passage": null,
        "options": null,
        "correctAnswer": "You should wear sunglasses to protect your eyes.",
        "hint": "Subject + should wear + object + to protect your eyes.",
        "explanation": "Cấu trúc: 'You should wear sunglasses to protect your eyes.' (Bạn nên đeo kính râm để bảo vệ mắt).",
        "difficulty": "A2",
        "score": 1.5,
        "answer": "You should wear sunglasses to protect your eyes.",
        "sourceLocator": "GỦI.docx:P#548:Ex22"
      },
      {
        "id": "g7-u2-comm-q9",
        "type": "writing",
        "prompt": "Reorder the words to make a sentence: 'plenty / Drink / of / water / fresh / day / every / .'",
        "passage": null,
        "options": null,
        "correctAnswer": "Drink plenty of fresh water every day.",
        "hint": "Imperative sentence starting with 'Drink'.",
        "explanation": "Câu mệnh lệnh tích cực: 'Drink plenty of fresh water every day.' (Hãy uống nhiều nước lọc mỗi ngày).",
        "difficulty": "A2",
        "score": 1,
        "answer": "Drink plenty of fresh water every day.",
        "sourceLocator": "GỦI.docx:P#550:Ex22"
      },
      {
        "id": "g7-u2-comm-q10",
        "type": "multiple_choice",
        "prompt": "Which sentence has correct word order and punctuation?",
        "passage": null,
        "options": [
          {
            "id": "A",
            "text": "Outdoor activities help teenagers stay fit and active."
          },
          {
            "id": "B",
            "text": "Teenagers outdoor activities stay fit help and active."
          },
          {
            "id": "C",
            "text": "Help teenagers stay fit active and outdoor activities."
          },
          {
            "id": "D",
            "text": "Stay fit teenagers help outdoor and activities."
          }
        ],
        "correctAnswer": "A",
        "hint": "Subject + Verb + Object + Bare infinitive.",
        "explanation": "Cấu trúc 'S + help + O + V (bare)': 'Outdoor activities help teenagers stay fit and active.' Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#555:Ex22"
      }
    ]
  },
  {
    "id": "g7-u2-les-06",
    "skill": "listening",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Listening: Doctor's Consultation on Daily Habits",
    "description": "Nghe cuộc tư vấn sức khỏe giữa Bác sĩ Jones và bạn Minh về thói quen ăn sáng, tập thể dục và giảm thời gian nhìn màn hình.",
    "durationMinutes": 15,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Biên soạn sư phạm đối sánh theo GỦI.docx:P#688 (Exercise 29/30) & Bản thu MP3 giọng bản ngữ chuẩn",
    "questions": [
      {
        "id": "g7-u2-l1-q1",
        "type": "multiple_choice",
        "prompt": "Why does Minh usually feel tired in the afternoons?",
        "audioUrl": "/audio/g7-u2-healthy-habits.mp3",
        "passage": "[Audio Transcript]\nDoctor Jones: Good morning, Minh. How are you feeling today?\nMinh: Good morning, Doctor. I feel a bit tired, and I often have a headache in the afternoons.\nDoctor Jones: I see. Tell me about your daily routine. What do you eat for breakfast?\nMinh: Well, I usually skip breakfast because I wake up late. I just grab a sugary soft drink on the way to school.\nDoctor Jones: Skipping breakfast is very bad for your health. Your body needs energy in the morning. And soft drinks contain too much sugar, which makes you feel tired later. You should eat nutritious food like eggs, bread, and fresh fruit.\nMinh: I understand. What about physical exercise? I spend about four hours every evening playing computer games.\nDoctor Jones: You must reduce your screen time! Staring at screens causes eye strain and headaches. Instead of sitting inside, you should cycle, jog, or play badminton for at least thirty minutes each day. Regular exercise strengthens your heart and muscles.\nMinh: Thank you very much, Doctor Jones. I will start eating breakfast and exercising tomorrow!\nDoctor Jones: Good boy! Remember: a healthy lifestyle is the best medicine.",
        "options": [
          {
            "id": "A",
            "text": "Because he runs ten kilometres every morning"
          },
          {
            "id": "B",
            "text": "Because he skips breakfast and drinks sugary soft drinks"
          },
          {
            "id": "C",
            "text": "Because he eats too much fresh fruit"
          },
          {
            "id": "D",
            "text": "Because he wakes up too early"
          }
        ],
        "correctAnswer": "B",
        "hint": "Listen to Doctor Jones's explanation after Minh mentions skipping breakfast.",
        "explanation": "Trong bài nghe, Minh thú nhận: 'I usually skip breakfast... I just grab a sugary soft drink'. Bác sĩ Jones giải thích việc bỏ bữa sáng và uống đồ ngọt khiến cơ thể mất năng lượng và mệt mỏi về sau. Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#688:Ex29"
      },
      {
        "id": "g7-u2-l1-q2",
        "type": "multiple_choice",
        "prompt": "What does Doctor Jones recommend Minh should eat for breakfast?",
        "audioUrl": "/audio/g7-u2-healthy-habits.mp3",
        "passage": "Doctor Jones: You should eat nutritious food like eggs, bread, and fresh fruit.",
        "options": [
          {
            "id": "A",
            "text": "Candy and soda"
          },
          {
            "id": "B",
            "text": "Eggs, bread, and fresh fruit"
          },
          {
            "id": "C",
            "text": "French fries and ice cream"
          },
          {
            "id": "D",
            "text": "Instant noodles only"
          }
        ],
        "correctAnswer": "B",
        "hint": "Listen for the three healthy food items recommended by the doctor.",
        "explanation": "Bác sĩ Jones khuyên: 'You should eat nutritious food like eggs, bread, and fresh fruit' (trứng, bánh mì và hoa quả tươi). Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#688:Ex29"
      },
      {
        "id": "g7-u2-l1-q3",
        "type": "multiple_choice",
        "prompt": "How many hours does Minh spend every evening playing computer games?",
        "audioUrl": "/audio/g7-u2-healthy-habits.mp3",
        "passage": "Minh: What about physical exercise? I spend about four hours every evening playing computer games.",
        "options": [
          {
            "id": "A",
            "text": "One hour"
          },
          {
            "id": "B",
            "text": "Two hours"
          },
          {
            "id": "C",
            "text": "About four hours"
          },
          {
            "id": "D",
            "text": "Six hours"
          }
        ],
        "correctAnswer": "C",
        "hint": "Listen to Minh's answer about his evening game time.",
        "explanation": "Minh cho biết: 'I spend about four hours every evening playing computer games.' Đáp án C là khoảng 4 tiếng.",
        "difficulty": "A2",
        "score": 1,
        "answer": "C",
        "sourceLocator": "GỦI.docx:P#699:Ex30"
      },
      {
        "id": "g7-u2-l1-q4",
        "type": "multiple_choice",
        "prompt": "What sports does the doctor advise Minh to do for at least thirty minutes a day?",
        "audioUrl": "/audio/g7-u2-healthy-habits.mp3",
        "passage": "Doctor Jones: Instead of sitting inside, you should cycle, jog, or play badminton for at least thirty minutes each day.",
        "options": [
          {
            "id": "A",
            "text": "Cycle, jog, or play badminton"
          },
          {
            "id": "B",
            "text": "Play video games"
          },
          {
            "id": "C",
            "text": "Watch action movies"
          },
          {
            "id": "D",
            "text": "Sleep in bed all day"
          }
        ],
        "correctAnswer": "A",
        "hint": "Listen to the outdoor activities mentioned after 'at least thirty minutes'.",
        "explanation": "Bác sĩ khuyên: 'you should cycle, jog, or play badminton for at least thirty minutes each day.' Đáp án A chính xác.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#699:Ex30"
      },
      {
        "id": "g7-u2-l1-q5",
        "type": "multiple_choice",
        "prompt": "What is the key message Doctor Jones shares at the end of the consultation?",
        "audioUrl": "/audio/g7-u2-healthy-habits.mp3",
        "passage": "Doctor Jones: Good boy! Remember: a healthy lifestyle is the best medicine.",
        "options": [
          {
            "id": "A",
            "text": "Computer games make you smarter"
          },
          {
            "id": "B",
            "text": "A healthy lifestyle is the best medicine"
          },
          {
            "id": "C",
            "text": "Drinking soda gives you energy"
          },
          {
            "id": "D",
            "text": "Never do physical sports"
          }
        ],
        "correctAnswer": "B",
        "hint": "Listen to the very last sentence spoken by Doctor Jones.",
        "explanation": "Câu kết luận nổi tiếng của Bác sĩ: 'Remember: a healthy lifestyle is the best medicine.' (Lối sống lành mạnh là phương thuốc tốt nhất). Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#699:Ex30"
      }
    ]
  },
  {
    "id": "g7-u2-les-07",
    "skill": "listening",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Listening: Skin Care & Sunburn Prevention Talk",
    "description": "Nghe bài nói của Y tá Linda về cách bảo vệ làn da trong mùa hè: chống cháy nắng, ngừa mụn và ngăn ngừa nứt môi.",
    "durationMinutes": 15,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Biên soạn sư phạm đối sánh theo GỦI.docx:P#710 (Exercise 31) & Bản thu MP3 giọng bản ngữ chuẩn",
    "questions": [
      {
        "id": "g7-u2-l2-q1",
        "type": "multiple_choice",
        "prompt": "When is the sun's radiation strongest during the day?",
        "audioUrl": "/audio/g7-u2-skin-care-tips.mp3",
        "passage": "[Audio Transcript]\nNurse Linda: Hello everyone. Welcome to our school health talk about skin care and outdoor wellness.\nDuring the summer, many teenagers suffer from sunburn and acne. Today, I will share three essential tips to protect your skin.\nFirst, always protect yourself from the sun. The sun is strongest between 10 a.m. and 4 p.m. If you go outside or go boating, wear a wide-brimmed hat, sunglasses, and apply suncream with SPF 30 or higher. Suncream prevents painful sunburn and skin damage.\nSecond, drink plenty of fresh water every day. Water keeps your skin hydrated and flushes out harmful toxins. When weather gets dry or windy, use lip balm to prevent chapped lips.\nThird, keep your face clean to prevent acne. Wash your face twice a day with warm water and mild soap. Avoid touching your face with dirty hands, and never squeeze red spots or pimples.\nFinally, remember to eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes. Nutritious food gives your skin a healthy glow!\nThank you for listening. Stay healthy and enjoy your summer!",
        "options": [
          {
            "id": "A",
            "text": "Before 7 a.m."
          },
          {
            "id": "B",
            "text": "Between 10 a.m. and 4 p.m."
          },
          {
            "id": "C",
            "text": "After 6 p.m. in the evening"
          },
          {
            "id": "D",
            "text": "Only at midnight"
          }
        ],
        "correctAnswer": "B",
        "hint": "Listen for the specific time interval in tip number one.",
        "explanation": "Y tá Linda nêu rõ: 'The sun is strongest between 10 a.m. and 4 p.m.' (Ánh nắng gay gắt nhất từ 10 giờ sáng đến 4 giờ chiều). Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#710:Ex31"
      },
      {
        "id": "g7-u2-l2-q2",
        "type": "multiple_choice",
        "prompt": "What should you apply to your lips when the weather is dry or windy?",
        "audioUrl": "/audio/g7-u2-skin-care-tips.mp3",
        "passage": "Nurse Linda: When weather gets dry or windy, use lip balm to prevent chapped lips.",
        "options": [
          {
            "id": "A",
            "text": "Cold water only"
          },
          {
            "id": "B",
            "text": "Lip balm"
          },
          {
            "id": "C",
            "text": "Toothpaste"
          },
          {
            "id": "D",
            "text": "Spicy sauce"
          }
        ],
        "correctAnswer": "B",
        "hint": "A common cosmetic product for lips mentioned in the speech.",
        "explanation": "Y tá khuyên: 'use lip balm to prevent chapped lips' (dùng sáp dưỡng môi để tránh nẻ môi). Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#710:Ex31"
      },
      {
        "id": "g7-u2-l2-q3",
        "type": "true_false",
        "prompt": "Statement: According to Nurse Linda, teenagers should squeeze pimples and red spots to heal acne faster.",
        "audioUrl": "/audio/g7-u2-skin-care-tips.mp3",
        "passage": "Nurse Linda: Avoid touching your face with dirty hands, and never squeeze red spots or pimples.",
        "options": [
          {
            "id": "True",
            "text": "True (Đúng)"
          },
          {
            "id": "False",
            "text": "False (Sai)"
          }
        ],
        "correctAnswer": "False",
        "hint": "Listen to the word 'never squeeze...'",
        "explanation": "Y tá nhấn mạnh: 'never squeeze red spots or pimples' (tuyệt đối không nặn mụn nhọt). Vì vậy nhận định trên là Sai (False).",
        "difficulty": "A2",
        "score": 1,
        "answer": "False",
        "sourceLocator": "GỦI.docx:P#710:Ex31"
      },
      {
        "id": "g7-u2-l2-q4",
        "type": "multiple_choice",
        "prompt": "How many times a day should teenagers wash their faces with warm water and mild soap?",
        "audioUrl": "/audio/g7-u2-skin-care-tips.mp3",
        "passage": "Nurse Linda: Wash your face twice a day with warm water and mild soap.",
        "options": [
          {
            "id": "A",
            "text": "Once a week"
          },
          {
            "id": "B",
            "text": "Twice a day"
          },
          {
            "id": "C",
            "text": "Ten times a day"
          },
          {
            "id": "D",
            "text": "Only when having a party"
          }
        ],
        "correctAnswer": "B",
        "hint": "Listen to the frequency: 'Wash your face... a day.'",
        "explanation": "Bài nói nêu rõ: 'Wash your face twice a day' (rửa mặt 2 lần mỗi ngày). Chọn B.",
        "difficulty": "A2",
        "score": 1,
        "answer": "B",
        "sourceLocator": "GỦI.docx:P#710:Ex31"
      },
      {
        "id": "g7-u2-l2-q5",
        "type": "multiple_choice",
        "prompt": "Which healthy foods does Nurse Linda recommend to give skin a healthy glow?",
        "audioUrl": "/audio/g7-u2-skin-care-tips.mp3",
        "passage": "Nurse Linda: Finally, remember to eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes.",
        "options": [
          {
            "id": "A",
            "text": "Green vegetables, tofu, and fruits like oranges and tomatoes"
          },
          {
            "id": "B",
            "text": "Chips and hamburgers"
          },
          {
            "id": "C",
            "text": "Salty snacks and soda"
          },
          {
            "id": "D",
            "text": "Chocolates only"
          }
        ],
        "correctAnswer": "A",
        "hint": "Listen for green vegetables, tofu, and fruits.",
        "explanation": "Y tá kết luận: 'eat plenty of green vegetables, tofu, and fruits like oranges and tomatoes'. Chọn A.",
        "difficulty": "A2",
        "score": 1,
        "answer": "A",
        "sourceLocator": "GỦI.docx:P#710:Ex31"
      }
    ]
  },
  {
    "id": "g7-u2-les-08",
    "skill": "writing",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Writing: Healthy Habits Paragraph & Email of Advice",
    "description": "Xưởng thực hành Viết: Đoạn văn ngắn về bí quyết giữ sức khỏe, email khuyên bạn điều chỉnh lối sống và kết hợp câu.",
    "durationMinutes": 20,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Biên soạn sư phạm theo CT GDPT 2018 Tiếng Anh 7 Unit 2 & GỦI.docx:P#562 (Exercise 23)",
    "questions": [
      {
        "id": "g7-u2-w-q1",
        "type": "writing",
        "prompt": "Prompt 1: Write a paragraph (50 - 60 words) about how to keep fit and stay healthy. Guiding questions:\n1. What healthy food should you eat daily?\n2. What sports or outdoor exercises do you do?\n3. Why is getting enough sleep important?",
        "passage": null,
        "options": null,
        "correctAnswer": "To keep fit and stay healthy, I eat lots of fresh green vegetables, tofu, and fruit every day. I also avoid drinking sugary soft drinks. In the late afternoon, I cycle around the park with my brother for thirty minutes. Finally, I always go to bed before 10 p.m. because getting enough sleep keeps my mind fresh and energetic.",
        "hint": "Use coordinating conjunctions (and, but, so) and modal verb 'should'.",
        "explanation": "Tiêu chí chấm đoạn văn (Thang điểm 3.0):\n- Task Achievement (1.0đ): Trả lời đủ 3 câu hỏi gợi ý, độ dài 50-60 từ.\n- Lexical Resource (1.0đ): Dùng đúng từ vựng Unit 2 (keep fit, tofu, sugary soft drinks, cycle, energetic).\n- Grammatical Accuracy (1.0đ): Dùng chuẩn thì Hiện tại đơn, liên từ nối and/but/so/because, không mắc lỗi chính tả.",
        "difficulty": "A2",
        "score": 3,
        "answer": "To keep fit and stay healthy, I eat lots of fresh green vegetables, tofu, and fruit every day. I also avoid drinking sugary soft drinks. In the late afternoon, I cycle around the park with my brother for thirty minutes. Finally, I always go to bed before 10 p.m. because getting enough sleep keeps my mind fresh and energetic."
      },
      {
        "id": "g7-u2-w-q2",
        "type": "writing",
        "prompt": "Prompt 2: Your friend Linh often skips breakfast, stays up late playing video games, and has acne on her face. Write a short email (60 - 80 words) giving her healthy advice.",
        "passage": null,
        "options": null,
        "correctAnswer": "Dear Linh,\nI am writing to share some health advice with you. You should never skip breakfast because your body needs morning energy. You should also stop playing computer games late at night and sleep at least eight hours. To treat your acne, wash your face twice a day with warm water and avoid touching red spots with dirty hands. Drink plenty of fresh water and eat more fruits!\nTake care,\nAn",
        "hint": "Format: Dear [Name], Advice with 'You should / shouldn't', Closing.",
        "explanation": "Tiêu chí chấm Email (Thang điểm 4.0):\n- Task Completion (1.5đ): Khuyên đủ 3 vấn đề (bỏ bữa sáng, thức khuya, trị mụn).\n- Cohesion & Register (1.0đ): Định dạng email thân mật (Dear..., Take care, An), sử dụng liên từ.\n- Grammar & Vocabulary (1.5đ): Sử dụng linh hoạt cấu trúc lời khuyên 'You should/shouldn't...', từ vựng chăm sóc da chuẩn xác.",
        "difficulty": "A2",
        "score": 4,
        "answer": "Dear Linh,\nI am writing to share some health advice with you. You should never skip breakfast because your body needs morning energy. You should also stop playing computer games late at night and sleep at least eight hours. To treat your acne, wash your face twice a day with warm water and avoid touching red spots with dirty hands. Drink plenty of fresh water and eat more fruits!\nTake care,\nAn"
      },
      {
        "id": "g7-u2-w-q3",
        "type": "writing",
        "prompt": "Prompt 3: Combine each pair of sentences into one compound sentence using the conjunction in brackets:\n1. Phong eats a lot of fruit. He does not gain weight. (but)\n2. Wear a warm coat. You will catch a cold. (or)\n3. Linda was very tired. She went to bed early last night. (so)",
        "passage": null,
        "options": null,
        "correctAnswer": "1. Phong eats a lot of fruit, but he does not gain weight.\n2. Wear a warm coat, or you will catch a cold.\n3. Linda was very tired, so she went to bed early last night.",
        "hint": "Remember to place a comma before coordinating conjunctions when connecting two independent clauses.",
        "explanation": "Tiêu chí chấm (Thang điểm 3.0 - mỗi câu 1.0đ):\n1. Nối bằng 'but' chỉ sự đối lập có dấu phẩy.\n2. Nối bằng 'or' đưa ra lời cảnh báo có dấu phẩy.\n3. Nối bằng 'so' chỉ kết quả nguyên nhân có dấu phẩy.",
        "difficulty": "A2",
        "score": 3,
        "answer": "1. Phong eats a lot of fruit, but he does not gain weight.\n2. Wear a warm coat, or you will catch a cold.\n3. Linda was very tired, so she went to bed early last night."
      }
    ]
  },
  {
    "id": "g7-u2-les-09",
    "skill": "speaking",
    "unitId": "unit-g7-u2",
    "unitTitle": "Unit 2: Healthy Living",
    "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
    "title": "Speaking: Health Advice & Daily Lifestyle Interview",
    "description": "Phòng thực hành Nói: Thuyết trình về lối sống lành mạnh, đóng vai bác sĩ tư vấn và tranh luận về màn hình điện tử (có ghi âm & tiêu chí chấm).",
    "durationMinutes": 20,
    "targetCefr": "A2",
    "status": "ready",
    "provenance": "Biên soạn sư phạm theo chuẩn GDPT 2018 Tiếng Anh 7 Unit 2 & GỦI.docx:P#385 (Exercise 14)",
    "questions": [
      {
        "id": "g7-u2-s-q1",
        "type": "speaking",
        "prompt": "Prompt 1: Talk about your daily eating habits and outdoor activities (1 - 1.5 minutes).\nGuiding cues:\n- What do you eat and drink for breakfast and lunch?\n- What physical exercise or sport do you practice?\n- How do you feel after doing sports?\n[Click Record to record your speech in English]",
        "passage": null,
        "options": null,
        "correctAnswer": "Hello teacher. Today I would like to tell you about my daily habits. Every morning, I have breakfast with bread, boiled eggs, and a glass of warm milk. For lunch, I eat rice with fish, tofu, and plenty of green vegetables. In the afternoon, I often play badminton with my father in the schoolyard for forty minutes. Playing sports makes me sweat and feel very energetic. I think eating fresh food and exercising every day helps me avoid illnesses.",
        "hint": "Speak clearly. Focus on pronunciation of sounds /f/ (fish, fresh) and /v/ (vegetables, avoid).",
        "explanation": "Tiêu chí AI & Giáo viên đánh giá (Thang điểm 5.0):\n1. Pronunciation (1.5đ): Phát âm rõ ràng các âm /f/ (food, fit) và /v/ (vegetables, avoid).\n2. Fluency (1.5đ): Nói liền mạch, tốc độ vừa phải, ngắt nghỉ hợp lý.\n3. Vocabulary & Grammar (2.0đ): Dùng đúng thì Hiện tại đơn, vốn từ vựng phong phú thuộc chủ đề Healthy Living.",
        "difficulty": "A2",
        "score": 5,
        "answer": "Hello teacher. Today I would like to tell you about my daily habits. Every morning, I have breakfast with bread, boiled eggs, and a glass of warm milk. For lunch, I eat rice with fish, tofu, and plenty of green vegetables. In the afternoon, I often play badminton with my father in the schoolyard for forty minutes. Playing sports makes me sweat and feel very energetic. I think eating fresh food and exercising every day helps me avoid illnesses."
      },
      {
        "id": "g7-u2-s-q2",
        "type": "speaking",
        "prompt": "Prompt 2: Roleplay - You are a school health adviser. Give practical suggestions to a student who has sunburn and eye strain from playing computer games (1 - 1.5 minutes).\n[Click Record to deliver your advice]",
        "passage": null,
        "options": null,
        "correctAnswer": "Hello! Don't worry, I can help you with your health problems. First, about your eye strain, you must reduce your computer screen time. Staring at screens in dim light makes your eyes very tired. Remember to take a five-minute break after every thirty minutes of computer use. Second, to treat your sunburn, apply aloe vera gel and drink plenty of fresh water. When you go outside, always wear a wide-brimmed hat and apply suncream. Follow these tips and you will feel much better soon!",
        "hint": "Use modal verbs: 'You should...', 'You must...', 'Remember to...'",
        "explanation": "Tiêu chí chấm Roleplay (Thang điểm 5.0):\n1. Communicative Purpose (2.0đ): Đưa ra đúng lời khuyên y tế cho 2 triệu chứng cháy nắng và mỏi mắt.\n2. Language Structure (1.5đ): Sử dụng thành thạo các cấu trúc khuyên nhủ (You should, You must, Don't worry).\n3. Pronunciation & Intonation (1.5đ): Ngữ điệu động viên, ngữ âm rõ ràng.",
        "difficulty": "A2",
        "score": 5,
        "answer": "Hello! Don't worry, I can help you with your health problems. First, about your eye strain, you must reduce your computer screen time. Staring at screens in dim light makes your eyes very tired. Remember to take a five-minute break after every thirty minutes of computer use. Second, to treat your sunburn, apply aloe vera gel and drink plenty of fresh water. When you go outside, always wear a wide-brimmed hat and apply suncream. Follow these tips and you will feel much better soon!"
      },
      {
        "id": "g7-u2-s-q3",
        "type": "speaking",
        "prompt": "Prompt 3: Presentation - 'Screen Time vs. Outdoor Activities for Teenagers' (1.5 - 2 minutes).\nDiscuss: Why many teens spend too much time on screens, the negative effects on health, and why outdoor sports are essential.\n[Click Record to deliver your presentation]",
        "passage": null,
        "options": null,
        "correctAnswer": "Good morning teacher and classmates. Today I want to discuss screen time and outdoor activities. Nowadays, many teenagers spend four to five hours every day on smartphones and computer games. This sedentary habit causes serious health issues such as eye strain, headaches, and obesity. Furthermore, lack of sleep makes students unable to concentrate at school. In my opinion, teenagers should balance their life by participating in outdoor sports like cycling, jogging, or playing football. Outdoor activities strengthen our muscles, give us fresh air, and help us make new friends. Let us turn off our screens and step outside to stay healthy!",
        "hint": "Structure your speech: Introduction, Problems of screen time, Benefits of outdoor sports, Conclusion.",
        "explanation": "Tiêu chí chấm Thuyết trình (Thang điểm 5.0):\n1. Content & Structure (2.0đ): Bố cục 3 phần rõ ràng, lập luận chặt chẽ có dẫn chứng.\n2. Coherence & Fluency (1.5đ): Dùng các từ nối (Nowadays, Furthermore, In my opinion, Let us).\n3. Pronunciation & Range (1.5đ): Vốn từ học thuật A2-B1 (sedentary, concentration, obesity, essential).",
        "difficulty": "A2",
        "score": 5,
        "answer": "Good morning teacher and classmates. Today I want to discuss screen time and outdoor activities. Nowadays, many teenagers spend four to five hours every day on smartphones and computer games. This sedentary habit causes serious health issues such as eye strain, headaches, and obesity. Furthermore, lack of sleep makes students unable to concentrate at school. In my opinion, teenagers should balance their life by participating in outdoor sports like cycling, jogging, or playing football. Outdoor activities strengthen our muscles, give us fresh air, and help us make new friends. Let us turn off our screens and step outside to stay healthy!"
      }
    ]
  },
  {"id": "g6-u1-les-01", "skill": "reading", "unitId": "unit-g6-u1", "unitTitle": "Unit 1: My New School", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Reading: Phong's First Day at Duy Tan School", "description": "Đọc bài viết về ngày đầu tiên đi học ở trường mới của bạn Phong, tìm chi tiết và suy luận.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g6-u1-r-q1", "type": "multiple_choice", "prompt": "According to the passage, how does Phong travel to his new school?", "passage": "Hi, I am Phong. Today is my first day at Duy Tan Secondary School. The school has a large library, a modern computer room, and a big playground. I wear my new uniform and cycle to school with Duy, my new neighbour. Duy is very friendly and smart. We are in class 6A.", "options": [{"id": "A", "text": "He goes to school by bus."}, {"id": "B", "text": "He rides a bicycle with his friend Duy."}, {"id": "C", "text": "His father drives him by car."}, {"id": "D", "text": "He walks to school on foot."}], "correctAnswer": "B", "hint": "Look for the sentence with 'cycle to school' in the reading text.", "explanation": "Trong đoạn văn có câu: 'I wear my new uniform and cycle to school with Duy'. Động từ 'cycle' có nghĩa là đi xe đạp (rides a bicycle). Vì vậy đáp án đúng là B.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u1-r-q2", "type": "multiple_choice", "prompt": "Which of the following statements about Duy Tan School is TRUE?", "passage": "Hi, I am Phong. Today is my first day at Duy Tan Secondary School. The school has a large library, a modern computer room, and a big playground. I wear my new uniform and cycle to school with Duy, my new neighbour. Duy is very friendly and smart. We are in class 6A.", "options": [{"id": "A", "text": "The school does not have a playground."}, {"id": "B", "text": "The school features a large library and a modern computer lab."}, {"id": "C", "text": "Phong and Duy study in different classes."}, {"id": "D", "text": "Duy was Phong's classmate in primary school."}], "correctAnswer": "B", "hint": "Check the sentence describing the school's facilities.", "explanation": "Bài đọc nêu rõ: 'The school has a large library, a modern computer room, and a big playground.' Do đó đáp án B là hoàn toàn chính xác.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u1-r-q3", "type": "fill_in_the_blank", "prompt": "Complete the sentence with the correct class: Duy and Phong are in class _______.", "passage": "Duy is very friendly and smart. We are in class 6A.", "options": null, "correctAnswer": "6A", "hint": "Find the class name mentioned at the end of the paragraph.", "explanation": "Câu cuối đoạn văn viết: 'We are in class 6A'. Từ cần điền là '6A'.", "difficulty": "A1", "score": 1.0, "answer": "6A"}]},

  {"id": "g6-u1-les-02", "skill": "listening", "unitId": "unit-g6-u1", "unitTitle": "Unit 1: My New School", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: School Clubs and Timetable", "description": "Nghe đoạn hội thoại giữa An và Vy về các câu lạc bộ và môn học yêu thích ở trường.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g6-u1-l-q1", "type": "multiple_choice", "prompt": "What club does Vy want to join after school?", "audioUrl": "/audio/g6-u1-school-clubs.mp3", "passage": "[Audio Transcript]\nAn: Hi Vy, what are you doing?\nVy: Hi An, I'm filling out the registration form for the art club. I love drawing pictures.\nAn: That sounds fun! I want to join the judo club with Duy on Tuesday afternoons.\nVy: Great! Do we have English lessons tomorrow morning?\nAn: Yes, we have English, Maths, and Science.", "options": [{"id": "A", "text": "The judo club"}, {"id": "B", "text": "The art club"}, {"id": "C", "text": "The science club"}, {"id": "D", "text": "The football club"}], "correctAnswer": "B", "hint": "Nghe câu trả lời của Vy: 'I'm filling out the registration form for the...'", "explanation": "Trong hội thoại, Vy nói: 'I'm filling out the registration form for the art club. I love drawing pictures.' Do đó Vy muốn tham gia câu lạc bộ mỹ thuật (art club).", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u1-l-q2", "type": "multiple_choice", "prompt": "When does An practice judo?", "audioUrl": "/audio/g6-u1-school-clubs.mp3", "passage": "An: That sounds fun! I want to join the judo club with Duy on Tuesday afternoons.", "options": [{"id": "A", "text": "On Tuesday afternoons"}, {"id": "B", "text": "On Monday mornings"}, {"id": "C", "text": "On Saturday weekends"}, {"id": "D", "text": "Every morning"}], "correctAnswer": "A", "hint": "Chú ý mốc thời gian sau từ 'on...'", "explanation": "An nói rõ: 'I want to join the judo club with Duy on Tuesday afternoons.' Đáp án A chính xác.", "difficulty": "A1", "score": 1.0, "answer": "A"}]},

  {"id": "g6-u1-les-03", "skill": "grammar", "unitId": "unit-g6-u1", "unitTitle": "Unit 1: My New School", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Grammar & Vocab: Present Simple & School Verbs", "description": "Luyện tập thì Hiện tại đơn và cách dùng 4 động từ trọng tâm: play, do, have, study.", "durationMinutes": 12, "targetCefr": "A1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g6-u1-g-q1", "type": "multiple_choice", "prompt": "Choose the correct verb to complete the sentence: 'Students usually _______ their homework before dinner.'", "passage": null, "options": [{"id": "A", "text": "play"}, {"id": "B", "text": "do"}, {"id": "C", "text": "have"}, {"id": "D", "text": "study"}], "correctAnswer": "B", "hint": "Which verb forms a standard collocation with 'homework'?", "explanation": "Quy tắc kết hợp từ (collocation) trong Unit 1: 'do homework' (làm bài tập về nhà), 'play sports/games' (chơi thể thao), 'have lunch/lessons' (ăn trưa/có tiết học), 'study English/maths' (học môn học). Do đó chọn 'do'.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-u1-g-q2", "type": "multiple_choice", "prompt": "Pronunciation: Choose the word whose underlined part is pronounced differently from the others (/ɑː/ and /ʌ/):", "passage": null, "options": [{"id": "A", "text": "smart (/ɑː/)"}, {"id": "B", "text": "art (/ɑː/)"}, {"id": "C", "text": "rubber (/ʌ/)"}, {"id": "D", "text": "start (/ɑː/)"}], "correctAnswer": "C", "hint": "The vowel sound in 'rubber' is short /ʌ/, unlike the long /ɑː/ in the other words.", "explanation": "'rubber' có nguyên âm phát âm là /ʌ/ (/ˈrʌbə/). Ba từ còn lại 'smart' (/smɑːt/), 'art' (/ɑːt/), 'start' (/stɑːt/) đều có nguyên âm là /ɑː/ dài.", "difficulty": "A1", "score": 1.0, "answer": "C"}]},

  {"id": "g6-u1-les-04", "skill": "writing", "unitId": "unit-g6-u1", "unitTitle": "Unit 1: My New School", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Writing: Sentence Transformation & School Description", "description": "Viết lại câu hoàn chỉnh và viết đoạn văn 40-50 từ miêu tả trường học mới.", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g6-u1-w-q1", "type": "writing", "prompt": "Rearrange the given words to make a complete sentence: 'playground / has / a / school / My / big / .'", "passage": null, "options": null, "correctAnswer": "My school has a big playground.", "hint": "Affirmative sentence order: Subject (My school) + Verb (has) + Object (a big playground).", "explanation": "Trật tự từ đúng theo cấu trúc S + V + O là: 'My school has a big playground.' (Trường của tôi có một sân chơi lớn).", "difficulty": "A1", "score": 2.0, "answer": "My school has a big playground."}, {"id": "g6-u1-w-q2", "type": "writing", "prompt": "Write a short paragraph (40 - 50 words) about your school. Answer the following questions: 1. What is the name of your school? 2. What do you like about it? 3. What activities do you do with your friends?", "passage": null, "options": null, "correctAnswer": "My school is Duy Tan Secondary School. It is very modern with a large library and clean classrooms. I love my teachers because they are very kind. At break time, I often play badminton and chat with my friends in the school yard.", "hint": "Use the Present Simple tense and vocabulary learned in Unit 1 (modern, library, play badminton...).", "explanation": "Tiêu chí chấm đoạn văn: Đủ số từ (40-50 từ), dùng đúng thì Hiện tại đơn, có đủ ý về tên trường, điểm yêu thích và hoạt động cùng bạn bè, không mắc lỗi chính tả cơ bản.", "difficulty": "A1", "score": 3.0, "answer": "My school is Duy Tan Secondary School. It is very modern with a large library and clean classrooms. I love my teachers because they are very kind. At break time, I often play badminton and chat with my friends in the school yard."}]},

  {"id": "g6-u1-les-05", "skill": "speaking", "unitId": "unit-g6-u1", "unitTitle": "Unit 1: My New School", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Speaking: Introducing Yourself & Your New School", "description": "Luyện nói tự giới thiệu bản thân, lớp học và môn học yêu thích (có ghi âm & AI chấm điểm).", "durationMinutes": 15, "targetCefr": "A1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 6 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g6-u1-s-q1", "type": "speaking", "prompt": "Talk about your new school (1-2 minutes). Guiding questions:\n1. What is your school's name and where is it located?\n2. What is your favourite subject and why?\n3. What uniform do you wear to school?\n[Click Record and speak clearly in English]", "passage": null, "options": null, "correctAnswer": "Hello teacher, my name is Nam. I am studying at Nguyen Du Secondary School in Hanoi. My school is big and beautiful. My favourite subject is English because it is very fun and interesting. Every morning, I wear a white shirt and blue trousers. I really love my new school.", "hint": "Prepare for 30 seconds. Use: 'My name is...', 'My school is...', 'My favourite subject is... because...'", "explanation": "Tiêu chí AI & Giáo viên đánh giá: 1. Phát âm rõ ràng các âm /ɑː/ và /ʌ/. 2. Trôi chảy, tốc độ vừa phải. 3. Sử dụng đúng thì hiện tại đơn. 4. Trả lời đủ 3 câu hỏi gợi ý.", "difficulty": "A1", "score": 5.0, "answer": "Hello teacher, my name is Nam. I am studying at Nguyen Du Secondary School in Hanoi. My school is big and beautiful. My favourite subject is English because it is very fun and interesting. Every morning, I wear a white shirt and blue trousers. I really love my new school."}]},

  {"id": "g6-midterm-exam-01", "skill": "reading", "unitId": "unit-g6-midterm", "unitTitle": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)", "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 6 (Thời Gian: 45 Phút)", "description": "Đề kiểm tra định kỳ đầy đủ: Ngữ âm, Trắc nghiệm từ vựng - ngữ pháp, Đọc hiểu, Điền từ, Viết lại câu.", "durationMinutes": 45, "targetCefr": "A1", "status": "ready", "provenance": "Đề khảo sát định kỳ GDPT 2018 Tiếng Anh 6 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g6-mt-q1", "type": "multiple_choice", "prompt": "Pronunciation: Choose the word whose underlined part is pronounced differently: A. smart  B. art  C. study  D. father", "passage": null, "options": [{"id": "A", "text": "smart (/ɑː/)"}, {"id": "B", "text": "art (/ɑː/)"}, {"id": "C", "text": "study (/ʌ/)"}, {"id": "D", "text": "father (/ɑː/)"}], "correctAnswer": "C", "hint": "Phân biệt nguyên âm ngắn /ʌ/ và nguyên âm dài /ɑː/.", "explanation": "'study' có chữ 'u' phát âm là /ʌ/. Ba từ còn lại chữ 'a' phát âm là /ɑː/.", "difficulty": "A1", "score": 0.5, "answer": "C"}, {"id": "g6-mt-q2", "type": "multiple_choice", "prompt": "Grammar: My brother _______ judo twice a week at the school sport center.", "passage": null, "options": [{"id": "A", "text": "plays"}, {"id": "B", "text": "does"}, {"id": "C", "text": "has"}, {"id": "D", "text": "studies"}], "correctAnswer": "B", "hint": "Môn võ judo đi kèm động từ nào và chủ ngữ là ngôi thứ 3 số ít?", "explanation": "Môn võ judo luôn đi với động từ 'do'. Chủ ngữ 'My brother' là ngôi thứ 3 số ít nên động từ thêm 'es' thành 'does'.", "difficulty": "A1", "score": 0.5, "answer": "B"}, {"id": "g6-mt-q3", "type": "multiple_choice", "prompt": "Vocabulary: Look at that girl! She has _______ hair and big brown eyes.", "passage": null, "options": [{"id": "A", "text": "long black"}, {"id": "B", "text": "black long"}, {"id": "C", "text": "a long black"}, {"id": "D", "text": "longs black"}], "correctAnswer": "A", "hint": "Quy tắc trật tự tính từ: Kích cỡ (long) đứng trước màu sắc (black).", "explanation": "Quy tắc trật tự tính từ mô tả ngoại hình: Kích thước / độ dài (Size/Length) đứng trước Màu sắc (Color) + danh từ. 'Hair' là danh từ không đếm được nên không dùng mạo từ 'a'. Vì vậy 'long black hair' là đáp án đúng.", "difficulty": "A1", "score": 0.5, "answer": "A"}, {"id": "g6-mt-q4", "type": "multiple_choice", "prompt": "Reading Comprehension: What does Nam do after dinner according to the text?", "passage": "Nam is a pupil at Sunrise School. On weekdays, he wakes up at 6:00 a.m. He has breakfast with bread and milk, then goes to school by bike. In the afternoon, he plays football with his classmates. In the evening, after dinner, he always does his homework and reads books before going to bed at 10:00 p.m.", "options": [{"id": "A", "text": "He plays football with friends."}, {"id": "B", "text": "He does his homework and reads books."}, {"id": "C", "text": "He watches television with his family."}, {"id": "D", "text": "He goes to bed immediately."}], "correctAnswer": "B", "hint": "Tìm cụm từ 'In the evening, after dinner...'", "explanation": "Đoạn văn viết: 'In the evening, after dinner, he always does his homework and reads books'. Đáp án B hoàn toàn chính xác.", "difficulty": "A1", "score": 1.0, "answer": "B"}, {"id": "g6-mt-q5", "type": "writing", "prompt": "Sentence Transformation: Rewrite the sentence without changing its meaning: 'There are twenty-five classrooms in our school.' -> 'Our school has...'", "passage": null, "options": null, "correctAnswer": "Our school has twenty-five classrooms.", "hint": "Cấu trúc tương đương: There is/are + N = S + have/has + N.", "explanation": "Cấu trúc chuyển đổi giữa 'There are...' và 'S + have/has...': 'There are twenty-five classrooms in our school' tương đương với 'Our school has twenty-five classrooms.'", "difficulty": "A1", "score": 1.5, "answer": "Our school has twenty-five classrooms."}]},

  {"id": "g7-u1-les-01", "skill": "reading", "unitId": "unit-g7-u1", "unitTitle": "Unit 1: Hobbies", "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Reading: A Creative Hobby - Building Dollhouses", "description": "Bài đọc về sở thích làm nhà búp bê từ bìa các tông và đồ tái chế của bạn Mi.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g7-u1-r-q1", "type": "multiple_choice", "prompt": "What materials does Mi use to build dollhouses?", "passage": "My hobby is building dollhouses. Three years ago, my cousin showed me how to make a small house from cardboard. Since then, I have collected old boxes, glue, coloured paper, and cloth scraps. Building dollhouses teaches me patience and creativity. My cousin and I often share ideas on weekends.", "options": [{"id": "A", "text": "Clay and bricks"}, {"id": "B", "text": "Cardboard, glue, coloured paper, and cloth scraps"}, {"id": "C", "text": "Wood and glass"}, {"id": "D", "text": "Metal and plastic bottles"}], "correctAnswer": "B", "hint": "Tìm danh sách các vật liệu sau câu 'I have collected...'", "explanation": "Trong bài đọc, Mi kể: 'I have collected old boxes, glue, coloured paper, and cloth scraps.' Cụm 'old boxes' tương đương 'cardboard'. Đáp án B là chính xác.", "difficulty": "A2", "score": 1.0, "answer": "B"}, {"id": "g7-u1-r-q2", "type": "multiple_choice", "prompt": "What benefits does Mi get from her hobby?", "passage": "Building dollhouses teaches me patience and creativity. My cousin and I often share ideas on weekends.", "options": [{"id": "A", "text": "It helps her earn a lot of money."}, {"id": "B", "text": "It teaches her patience and creativity."}, {"id": "C", "text": "It makes her stronger physically."}, {"id": "D", "text": "It helps her speak English fluently."}], "correctAnswer": "B", "hint": "Đọc câu: 'Building dollhouses teaches me...'", "explanation": "Bài đọc khẳng định rõ: 'Building dollhouses teaches me patience and creativity' (rèn luyện tính kiên nhẫn và sự sáng tạo). Do đó chọn B.", "difficulty": "A2", "score": 1.0, "answer": "B"}]},

  {"id": "g7-u1-les-02", "skill": "listening", "unitId": "unit-g7-u1", "unitTitle": "Unit 1: Hobbies", "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: Unusual Hobbies Discussion", "description": "Nghe cuộc trò chuyện giữa Mark và Lan về những sở thích khác thường và thú vị.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g7-u1-l-q1", "type": "multiple_choice", "prompt": "What is Mark's hobby?", "audioUrl": "/audio/g7-u1-unusual-hobbies.mp3", "passage": "[Audio Transcript]\nLan: Hi Mark, do you play computer games in your free time?\nMark: No, Lan. I think playing computer games is boring. My hobby is horse riding. My uncle has a horse farm in Da Lat.\nLan: Wow, that sounds unusual and exciting! Isn't it dangerous?\nMark: It can be challenging, but an instructor teaches me carefully. It helps me stay healthy and love animals.", "options": [{"id": "A", "text": "Playing computer games"}, {"id": "B", "text": "Horse riding"}, {"id": "C", "text": "Gardening"}, {"id": "D", "text": "Swimming"}], "correctAnswer": "B", "hint": "Nghe câu trả lời của Mark khi Lan hỏi về computer games.", "explanation": "Mark nói: 'My hobby is horse riding.' (Cưỡi ngựa). Đáp án B đúng.", "difficulty": "A2", "score": 1.0, "answer": "B"}]},

  {"id": "g7-u1-les-03", "skill": "grammar", "unitId": "unit-g7-u1", "unitTitle": "Unit 1: Hobbies", "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Grammar: Verbs of Liking + V-ing & Pronunciation (/ə/, /ɜː/)", "description": "Thành thạo cấu trúc Like/Love/Enjoy/Dislike + V-ing và phân biệt nguyên âm /ə/ và /ɜː/.", "durationMinutes": 12, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g7-u1-g-q1", "type": "multiple_choice", "prompt": "She loves _______ teddy bears because they look very cute.", "passage": null, "options": [{"id": "A", "text": "collect"}, {"id": "B", "text": "collecting"}, {"id": "C", "text": "collected"}, {"id": "D", "text": "collection"}], "correctAnswer": "B", "hint": "Sau động từ chỉ sự yêu thích 'love/like/enjoy' ta dùng động từ ở dạng nào?", "explanation": "Quy tắc ngữ pháp Unit 1 Lớp 7: Sau các động từ chỉ cảm xúc yêu thích (love, like, enjoy, fancy, prefer) theo sau là Danh động từ (V-ing). Do đó 'collecting' là đáp án chính xác.", "difficulty": "A2", "score": 1.0, "answer": "B"}, {"id": "g7-u1-g-q2", "type": "multiple_choice", "prompt": "Pronunciation: Which word has the underlined sound pronounced as /ɜː/ (âm dài)? A. away (/ə/)  B. dirty (/ɜː/)  C. sofa (/ə/)  D. about (/ə/)", "passage": null, "options": [{"id": "A", "text": "away"}, {"id": "B", "text": "dirty"}, {"id": "C", "text": "sofa"}, {"id": "D", "text": "about"}], "correctAnswer": "B", "hint": "Tìm từ có nguyên âm phát âm kéo dài và có chữ 'ir'.", "explanation": "'dirty' phát âm là /ˈdɜːti/ chứa âm /ɜː/ dài. Ba từ còn lại: 'away' (/əˈweɪ/), 'sofa' (/ˈsəʊfə/), 'about' (/əˈbaʊt/) đều chứa âm /ə/ ngắn.", "difficulty": "A2", "score": 1.0, "answer": "B"}]},

  {"id": "g7-u1-les-04", "skill": "writing", "unitId": "unit-g7-u1", "unitTitle": "Unit 1: Hobbies", "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Writing: Writing About Your Favourite Hobby", "description": "Viết đoạn văn ngắn 50-60 từ về sở thích yêu thích và lợi ích của sở thích đó.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g7-u1-w-q1", "type": "writing", "prompt": "Write a paragraph (50 - 60 words) about your hobby. Use the following questions: 1. What is your hobby? 2. When did you start it? 3. Who do you share it with? 4. Why do you enjoy it?", "passage": null, "options": null, "correctAnswer": "My favourite hobby is gardening. I started it two years ago when my grandmother gave me some flower seeds. On weekends, I water the roses and plant vegetables with my brother. I love gardening because it helps me relax after school and makes our home green and beautiful.", "hint": "Sử dụng các cấu trúc: 'My hobby is...', 'I started it... ago', 'I share it with...', 'I like it because it helps me...'", "explanation": "Tiêu chí chấm: Đầy đủ 4 ý theo hướng dẫn, độ dài 50-60 từ, sử dụng thì Hiện tại đơn và Quá khứ đơn (started), dùng đúng liên từ 'because' và 'and'.", "difficulty": "A2", "score": 3.0, "answer": "My favourite hobby is gardening. I started it two years ago when my grandmother gave me some flower seeds. On weekends, I water the roses and plant vegetables with my brother. I love gardening because it helps me relax after school and makes our home green and beautiful."}]},

  {"id": "g7-u1-les-05", "skill": "speaking", "unitId": "unit-g7-u1", "unitTitle": "Unit 1: Hobbies", "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Speaking: Interview About Hobbies and Free Time", "description": "Phỏng vấn và trình bày về sở thích cá nhân, rèn luyện độ trôi chảy và phát âm âm /ə/, /ɜː/.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 7 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g7-u1-s-q1", "type": "speaking", "prompt": "Talk about a hobby you want to take up in the future (1-2 minutes):\n1. What is the hobby?\n2. What equipment do you need for it?\n3. What benefits will it bring to you?\n[Click Record and deliver your speech in English]", "passage": null, "options": null, "correctAnswer": "Hello teacher, in the future, I want to take up photography. To do this hobby, I need a digital camera and a photo editing app. Photography will help me capture memorable moments with my family and friends. Furthermore, it teaches me how to look at the world creatively and patiently.", "hint": "Dùng cụm từ: 'take up a hobby' (bắt đầu một sở thích), 'equipment' (dụng cụ), 'benefits' (lợi ích).", "explanation": "Tiêu chí AI & Giáo viên đánh giá: Độ chính xác ngữ âm âm /ɜː/ (learn, world) và /ə/ (camera, family), mạch lạc, từ vựng phong phú bám sát chủ đề Hobbies.", "difficulty": "A2", "score": 5.0, "answer": "Hello teacher, in the future, I want to take up photography. To do this hobby, I need a digital camera and a photo editing app. Photography will help me capture memorable moments with my family and friends. Furthermore, it teaches me how to look at the world creatively and patiently."}]},

  {"id": "g7-midterm-exam-01", "skill": "reading", "unitId": "unit-g7-midterm", "unitTitle": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)", "courseTitle": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 7 (Thời Gian: 45 Phút)", "description": "Đề kiểm tra chuẩn: Ngữ âm (/ə/, /ɜː/), Ngữ pháp (Thì HTĐ, QKĐ, V-ing), Đọc hiểu lối sống lành mạnh, Viết câu.", "durationMinutes": 45, "targetCefr": "A2", "status": "ready", "provenance": "Đề khảo sát định kỳ GDPT 2018 Tiếng Anh 7 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g7-mt-q1", "type": "multiple_choice", "prompt": "Choose the word with different stress pattern: A. hobby  B. collect  C. model  D. garden", "passage": null, "options": [{"id": "A", "text": "hobby (âm 1)"}, {"id": "B", "text": "collect (âm 2)"}, {"id": "C", "text": "model (âm 1)"}, {"id": "D", "text": "garden (âm 1)"}], "correctAnswer": "B", "hint": "'collect' là động từ 2 âm tiết, thường nhấn trọng âm ở âm tiết thứ mấy?", "explanation": "'collect' là động từ 2 âm tiết có trọng âm rơi vào âm tiết thứ 2 (/kəˈlekt/). Ba từ còn lại là danh từ 2 âm tiết có trọng âm rơi vào âm tiết thứ 1: 'hobby' (/ˈhɒbi/), 'model' (/ˈmɒdl/), 'garden' (/ˈɡɑːdn/).", "difficulty": "A2", "score": 0.5, "answer": "B"}, {"id": "g7-mt-q2", "type": "multiple_choice", "prompt": "Grammar: We should drink more water and eat more vegetables to avoid _______ acne and tiredness.", "passage": null, "options": [{"id": "A", "text": "having"}, {"id": "B", "text": "have"}, {"id": "C", "text": "to have"}, {"id": "D", "text": "had"}], "correctAnswer": "A", "hint": "Sau động từ 'avoid' ta dùng V-ing hay to V?", "explanation": "Sau động từ 'avoid' (tránh) bắt buộc dùng V-ing: avoid doing sth. Vì vậy chọn 'having'.", "difficulty": "A2", "score": 0.5, "answer": "A"}, {"id": "g7-mt-q3", "type": "writing", "prompt": "Rewrite the sentence: 'Lan enjoys doing morning exercise every day.' -> 'Lan is interested...'", "passage": null, "options": null, "correctAnswer": "Lan is interested in doing morning exercise every day.", "hint": "Cấu trúc tương đương: enjoy doing sth = be interested in doing sth.", "explanation": "Cấu trúc tương đương chỉ sự yêu thích: S + enjoy + V-ing = S + be interested in + V-ing. Với chủ ngữ Lan thì dùng 'is interested in doing morning exercise every day.'", "difficulty": "A2", "score": 1.5, "answer": "Lan is interested in doing morning exercise every day."}]},

  {"id": "g8-u1-les-01", "skill": "reading", "unitId": "unit-g8-u1", "unitTitle": "Unit 1: Leisure Time", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Reading: Teenagers and Modern Leisure Activities", "description": "Bài đọc về xu hướng giải trí của thanh thiếu niên hiện đại: giữa hoạt động thể chất ngoài trời và giải trí số.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g8-u1-r-q1", "type": "multiple_choice", "prompt": "According to the passage, why do many teens enjoy DIY projects?", "passage": "Today, teenagers spend their leisure time in various ways. While some teens enjoy surfing social media or playing online games, many others adore doing DIY (Do-It-Yourself) projects. Making origami, knitting scarves, or building wooden bookshelves gives them a great sense of satisfaction. Psychologists say that creating something with their own hands helps teenagers reduce study pressure and boost practical life skills.", "options": [{"id": "A", "text": "Because it is completely free of charge."}, {"id": "B", "text": "Because creating things by hand gives them satisfaction and reduces study pressure."}, {"id": "C", "text": "Because they don't have internet access."}, {"id": "D", "text": "Because their teachers force them to do so."}], "correctAnswer": "B", "hint": "Đọc câu: 'gives them a great sense of satisfaction... helps teenagers reduce study pressure'.", "explanation": "Bài đọc nêu rõ: 'gives them a great sense of satisfaction. Psychologists say that creating something with their own hands helps teenagers reduce study pressure...' Đáp án B tóm lược chính xác hai ý này.", "difficulty": "A2", "score": 1.0, "answer": "B"}]},

  {"id": "g8-u1-les-02", "skill": "grammar", "unitId": "unit-g8-u1", "unitTitle": "Unit 1: Leisure Time", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Grammar: Verbs of Liking / Disliking & Pronunciation (/ʊ/, /uː/)", "description": "Nắm vững các động từ chỉ mức độ: adore, fancy, detest, don't mind và phân biệt nguyên âm /ʊ/ và /uː/.", "durationMinutes": 12, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g8-u1-g-q1", "type": "multiple_choice", "prompt": "Tom detests _______ in crowded places, so he prefers reading at home.", "passage": null, "options": [{"id": "A", "text": "hanging out"}, {"id": "B", "text": "hang out"}, {"id": "C", "text": "hung out"}, {"id": "D", "text": "to hanging out"}], "correctAnswer": "A", "hint": "Sau 'detest' (cực kỳ ghét) luôn đi với hình thức V-ing.", "explanation": "Quy tắc ngữ pháp Unit 1 Lớp 8: Động từ 'detest' (ghét cay ghét đắng) luôn đi với Danh động từ (V-ing). Vì vậy chọn 'hanging out'.", "difficulty": "A2", "score": 1.0, "answer": "A"}, {"id": "g8-u1-g-q2", "type": "multiple_choice", "prompt": "Pronunciation: Choose the word whose underlined part is pronounced as /uː/ (âm u dài): A. book (/ʊ/)  B. foot (/ʊ/)  C. school (/uː/)  D. cook (/ʊ/)", "passage": null, "options": [{"id": "A", "text": "book"}, {"id": "B", "text": "foot"}, {"id": "C", "text": "school"}, {"id": "D", "text": "cook"}], "correctAnswer": "C", "hint": "Từ 'school' có âm /uː/ ngân dài hơn so với âm ngắn trong book, foot, cook.", "explanation": "'school' phát âm là /skuːl/ chứa âm /uː/ dài. Trong khi 'book' (/bʊk/), 'foot' (/fʊt/), 'cook' (/kʊk/) đều chứa âm /ʊ/ ngắn.", "difficulty": "A2", "score": 1.0, "answer": "C"}]},

  {"id": "g8-u1-les-03", "skill": "speaking", "unitId": "unit-g8-u1", "unitTitle": "Unit 1: Leisure Time", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Speaking: Healthy Leisure Lifestyle Presentation", "description": "Thuyết trình ngắn về lối sống giải trí cân bằng giữa học tập, thể thao và màn hình điện tử.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g8-u1-s-q1", "type": "speaking", "prompt": "Give a presentation about how you balance your leisure time and study (1-2 minutes). Focus on:\n1. Your favourite leisure activity\n2. How much time you spend on screens every day\n3. One outdoor activity you do to stay healthy\n[Click Record and deliver your speech in English]", "passage": null, "options": null, "correctAnswer": "Good morning teacher and friends. Today I would like to talk about my leisure time. My favourite leisure activity is reading science fiction books. To avoid eye strain and stay fit, I limit my screen time to one hour a day. In the late afternoon, I often cycle around the lake with my father. I believe balancing physical activities and quiet hobbies makes our life happier.", "hint": "Sử dụng từ vựng Unit 1: 'balance', 'leisure activity', 'screen time', 'eye strain', 'stay fit'.", "explanation": "Tiêu chí AI & Giáo viên chấm: Phát âm chuẩn các âm /uː/ và /ʊ/, ngữ điệu tự nhiên, từ vựng mạch lạc, đáp ứng đầy đủ 3 ý gợi ý.", "difficulty": "A2", "score": 5.0, "answer": "Good morning teacher and friends. Today I would like to talk about my leisure time. My favourite leisure activity is reading science fiction books. To avoid eye strain and stay fit, I limit my screen time to one hour a day. In the late afternoon, I often cycle around the lake with my father. I believe balancing physical activities and quiet hobbies makes our life happier."}]},

  {"id": "g8-u1-les-04", "skill": "listening", "unitId": "unit-g8-u1", "unitTitle": "Unit 1: Leisure Time", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: Leisure Habits of Teens", "description": "Nghe đoạn hội thoại giữa Mark và Trang về các hoạt động giải trí yêu thích cuối tuần.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g8-u1-l-q1", "type": "multiple_choice", "prompt": "What outdoor sport does Mark enjoy doing at the weekend?", "audioUrl": "/audio/g8-u1-leisure-habits.mp3", "passage": "[Audio Transcript]\nMark: Hi Trang, what do you usually do in your free time?\nTrang: I love doing DIY crafts and making origami paper flowers.\nMark: That sounds relaxing! I prefer cycling around West Lake and playing badminton with my cousins.\nTrang: How often do you play badminton?\nMark: Twice a week, usually on Saturday and Sunday mornings.", "options": [{"id": "A", "text": "Cycling and playing badminton"}, {"id": "B", "text": "Playing computer games"}, {"id": "C", "text": "Swimming in the pool"}, {"id": "D", "text": "Watching television all day"}], "correctAnswer": "A", "hint": "Listen to Mark's words: 'I prefer cycling... and playing badminton...'", "explanation": "Trong đoạn hội thoại, Mark nói: 'I prefer cycling around West Lake and playing badminton with my cousins.' Do đó đáp án A là chính xác.", "difficulty": "A2", "score": 1.0, "answer": "A"}, {"id": "g8-u1-l-q2", "type": "multiple_choice", "prompt": "How often does Mark practice badminton?", "audioUrl": "/audio/g8-u1-leisure-habits.mp3", "passage": "Mark: Twice a week, usually on Saturday and Sunday mornings.", "options": [{"id": "A", "text": "Every single day"}, {"id": "B", "text": "Twice a week (Saturday and Sunday mornings)"}, {"id": "C", "text": "Once a month"}, {"id": "D", "text": "Only during summer holidays"}], "correctAnswer": "B", "hint": "Chú ý câu trả lời của Mark cho câu hỏi 'How often...'", "explanation": "Mark trả lời: 'Twice a week, usually on Saturday and Sunday mornings.' Đáp án B chính xác.", "difficulty": "A2", "score": 1.0, "answer": "B"}]},

  {"id": "g8-u1-les-05", "skill": "writing", "unitId": "unit-g8-u1", "unitTitle": "Unit 1: Leisure Time", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Writing: Writing an Email About Leisure Activities", "description": "Viết email (80-100 từ) cho một người bạn qua mạng kể về các hoạt động giải trí yêu thích.", "durationMinutes": 15, "targetCefr": "A2", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g8-u1-w-q1", "type": "writing", "prompt": "Write an email (80 - 100 words) to a penfriend to tell him/her about your leisure activities. Mention: 1. Your favourite leisure activity and who you do it with. 2. How much time you spend on it per week. 3. Why you like it and how you feel afterwards.", "passage": null, "options": null, "correctAnswer": "Dear Alex, I am very happy to tell you about my leisure activities. In my free time, I really enjoy playing football with my classmates. We usually gather at the local stadium twice a week on Tuesday and Friday afternoons. Playing football helps me stay fit and improves my teamwork skills. After each match, I feel energetic and ready for new study challenges. How about your hobbies? Write back soon! Best, Minh.", "hint": "Format of an informal email: Dear [Name], Opening, Body paragraph (activities & feelings), Closing (Best / Warm regards).", "explanation": "Tiêu chí chấm: Đúng bố cục email, đủ số lượng từ (80-100 từ), sử dụng các động từ chỉ sự yêu thích (enjoy, love, prefer) và liên từ nối ý.", "difficulty": "A2", "score": 3.0, "answer": "Dear Alex, I am very happy to tell you about my leisure activities. In my free time, I really enjoy playing football with my classmates. We usually gather at the local stadium twice a week on Tuesday and Friday afternoons. Playing football helps me stay fit and improves my teamwork skills. After each match, I feel energetic and ready for new study challenges. How about your hobbies? Write back soon! Best, Minh."}]},

  {"id": "g8-midterm-exam-01", "skill": "reading", "unitId": "unit-g8-midterm", "unitTitle": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 8 (Thời Gian: 45 Phút)", "description": "Đề thi chuẩn cấu trúc: Ngữ âm (/ʊ/, /uː/), So sánh hơn của trạng từ, Động từ chỉ cảm xúc, Đọc hiểu nông thôn và thành thị.", "durationMinutes": 45, "targetCefr": "A2", "status": "ready", "provenance": "Đề khảo sát định kỳ GDPT 2018 Tiếng Anh 8 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g8-mt-q1", "type": "multiple_choice", "prompt": "Grammar (Comparative adverbs): Life in the countryside moves _______ than life in the bustling city.", "passage": null, "options": [{"id": "A", "text": "more slowly"}, {"id": "B", "text": "slower"}, {"id": "C", "text": "more slow"}, {"id": "D", "text": "slowlier"}], "correctAnswer": "A", "hint": "Động từ 'moves' cần trạng từ so sánh hơn: more + adv.", "explanation": "Động từ 'move' là động từ hành động nên bổ nghĩa cho nó phải là trạng từ 'slowly'. Dạng so sánh hơn của trạng từ có đuôi -ly là 'more slowly'. Vì vậy chọn đáp án A.", "difficulty": "A2", "score": 0.5, "answer": "A"}, {"id": "g8-mt-q2", "type": "writing", "prompt": "Rewrite the sentence: 'Minh is keen on playing sports after school.' -> 'Minh fancies...'", "passage": null, "options": null, "correctAnswer": "Minh fancies playing sports after school.", "hint": "Cấu trúc tương đương: be keen on + V-ing = fancy + V-ing.", "explanation": "'be keen on V-ing' đồng nghĩa với 'fancy V-ing' (rất thích làm gì). Do đó viết lại thành: 'Minh fancies playing sports after school.'", "difficulty": "A2", "score": 1.5, "answer": "Minh fancies playing sports after school."}]},

  {"id": "g8-u2-draft-01", "skill": "listening", "unitId": "unit-g8-u2", "unitTitle": "Unit 2: Life in the Countryside", "courseTitle": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: Harvest Season in the Countryside (Bản Thảo Đang Hoàn Thiện)", "description": "Bài nghe đang được ban sư phạm hoàn thiện nội dung audio và bộ câu hỏi đánh giá theo chuẩn GDPT 2018.", "durationMinutes": 15, "targetCefr": "A2", "status": "in_preparation", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 8 Global Success Unit 2 (Đang biên soạn - Chưa đưa vào luồng chấm chính thức)", "questions": []},

  {"id": "g9-u1-les-01", "skill": "reading", "unitId": "unit-g9-u1", "unitTitle": "Unit 1: Local Community", "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Reading: Preserving Traditional Craft Villages", "description": "Bài đọc về làng gốm Bát Tràng và nỗ lực gìn giữ nghề thủ công truyền thống của các nghệ nhân trẻ.", "durationMinutes": 15, "targetCefr": "B1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g9-u1-r-q1", "type": "multiple_choice", "prompt": "According to the passage, how do young artisans pass down traditional pottery skills?", "passage": "Bat Trang is a famous traditional pottery village located on the bank of the Red River in Hanoi. For centuries, artisans have passed down their pottery-making secrets from generation to generation. Nowadays, young artisans not only keep the authentic craftsmanship but also combine modern artistic designs. They organise hands-on workshops for tourists and sell handcrafted ceramic products worldwide via e-commerce platforms, helping the local community thrive economically.", "options": [{"id": "A", "text": "They only sell products in local markets."}, {"id": "B", "text": "They combine authentic craftsmanship with modern designs and organize workshops for visitors."}, {"id": "C", "text": "They stop handmade production and use factory machines completely."}, {"id": "D", "text": "They refuse to teach skills to the younger generation."}], "correctAnswer": "B", "hint": "Tìm câu: 'young artisans not only keep the authentic craftsmanship but also combine modern artistic designs...'", "explanation": "Đoạn văn nêu rõ: 'young artisans not only keep the authentic craftsmanship but also combine modern artistic designs. They organise hands-on workshops for tourists...' Đáp án B diễn đạt chính xác nội dung này.", "difficulty": "B1", "score": 1.0, "answer": "B"}]},

  {"id": "g9-u1-les-02", "skill": "grammar", "unitId": "unit-g9-u1", "unitTitle": "Unit 1: Local Community", "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Grammar: Phrasal Verbs & Wh-word + To-Infinitive", "description": "Luyện tập các cụm động từ quan trọng (pass down, set up, look around, deal with) và cấu trúc Wh-word + To-infinitive.", "durationMinutes": 12, "targetCefr": "B1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g9-u1-g-q1", "type": "multiple_choice", "prompt": "This handicraft workshop was _______ by my grandfather fifty years ago.", "passage": null, "options": [{"id": "A", "text": "set up"}, {"id": "B", "text": "looked after"}, {"id": "C", "text": "passed down"}, {"id": "D", "text": "turned off"}], "correctAnswer": "A", "hint": "Cụm động từ mang nghĩa 'thành lập, mở xưởng' là gì?", "explanation": "'set up' có nghĩa là thành lập, xây dựng xưởng. Dạng bị động quá khứ: was set up. 'look after' là chăm sóc; 'pass down' là truyền lại; 'turn off' là tắt.", "difficulty": "B1", "score": 1.0, "answer": "A"}, {"id": "g9-u1-g-q2", "type": "multiple_choice", "prompt": "I asked my teacher _______ to solve the complex physics exercise.", "passage": null, "options": [{"id": "A", "text": "how"}, {"id": "B", "text": "how to"}, {"id": "C", "text": "what to"}, {"id": "D", "text": "where to"}], "correctAnswer": "B", "hint": "Cấu trúc từ để hỏi chỉ cách thức + To-infinitive: Wh-word + to V.", "explanation": "Cấu trúc ngữ pháp trọng tâm Unit 1 Lớp 9: Từ để hỏi (how, what, where, when, who) + to-infinitive để biểu đạt sự phân vân hoặc cách thực hiện: 'how to solve' (cách giải bài tập). Vì vậy chọn B.", "difficulty": "B1", "score": 1.0, "answer": "B"}]},

  {"id": "g9-u1-les-03", "skill": "writing", "unitId": "unit-g9-u1", "unitTitle": "Unit 1: Local Community", "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Writing: Describing a Local Community Service", "description": "Viết đoạn văn 80-100 từ mô tả các tiện ích cộng đồng hoặc một dịch vụ địa phương hữu ích.", "durationMinutes": 15, "targetCefr": "B1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g9-u1-w-q1", "type": "writing", "prompt": "Rewrite the sentence using a question word + to-infinitive: 'We don't know where we should buy authentic souvenirs in this city.' -> 'We don't know...'", "passage": null, "options": null, "correctAnswer": "We don't know where to buy authentic souvenirs in this city.", "hint": "Rút gọn mệnh đề 'where we should buy' thành 'where to buy'.", "explanation": "Quy tắc rút gọn mệnh đề danh từ có đại từ trùng với chủ ngữ mệnh đề chính: 'where we should buy' -> 'where to buy'. Câu viết lại hoàn chỉnh: 'We don't know where to buy authentic souvenirs in this city.'", "difficulty": "B1", "score": 1.5, "answer": "We don't know where to buy authentic souvenirs in this city."}, {"id": "g9-u1-w-q2", "type": "writing", "prompt": "Write a paragraph (80 - 100 words) about a community helper who plays an important role in your neighbourhood (e.g., a garbage collector, a firefighter, a police officer, or an electrician). Mention: What they do, why their job is important, and how people can help them.", "passage": null, "options": null, "correctAnswer": "In my neighbourhood, garbage collectors play a vital role in keeping our environment clean and hygienic. Every evening, regardless of rain or heat, they collect household waste from every doorstep and transport it to recycling centers. Without their hard work, our streets would be polluted with foul odors and litter. To support these hardworking community helpers, residents should sort their household garbage into recyclable and organic bins before disposal.", "hint": "Sử dụng các từ vựng: 'community helper', 'vital role', 'hygienic', 'sort garbage', 'support'.", "explanation": "Tiêu chí chấm: Đúng chủ đề, dung lượng 80-100 từ, cấu trúc câu phức kết hợp mệnh đề quan hệ và liên từ chỉ nguyên nhân/kết quả, không sai lỗi chia động từ.", "difficulty": "B1", "score": 3.5, "answer": "In my neighbourhood, garbage collectors play a vital role in keeping our environment clean and hygienic. Every evening, regardless of rain or heat, they collect household waste from every doorstep and transport it to recycling centers. Without their hard work, our streets would be polluted with foul odors and litter. To support these hardworking community helpers, residents should sort their household garbage into recyclable and organic bins before disposal."}]},

  {"id": "g9-u1-les-04", "skill": "speaking", "unitId": "unit-g9-u1", "unitTitle": "Unit 1: Local Community", "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Speaking: Improving Local Community Facilities", "description": "Thảo luận về các vấn đề trong khu dân cư và đề xuất giải pháp cải thiện môi trường sống.", "durationMinutes": 15, "targetCefr": "B1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g9-u1-s-q1", "type": "speaking", "prompt": "Discuss a problem in your local area and propose practical solutions (1.5 - 2 minutes). Suggestion:\n- Identify the problem (e.g. traffic congestion, lack of green parks, littering)\n- Explain how it affects residents\n- Propose 2 solutions that teens can contribute to\n[Click Record and deliver your speech in English]", "passage": null, "options": null, "correctAnswer": "Good morning. In our neighbourhood, one pressing issue is the lack of green recreational spaces and public parks for children and teenagers. Because there are few playgrounds, many young people spend their free time indoors glued to electronic devices. To address this issue, the local youth union can plant more trees in empty residential lots. Additionally, teenagers can organise weekend clean-up campaigns to make existing public areas safer and greener.", "hint": "Sử dụng các từ nối lập luận: 'one pressing issue is...', 'because...', 'to address this issue...', 'additionally...'", "explanation": "Tiêu chí AI & Giáo viên chấm: Phát âm chuẩn trọng âm từ 2 âm tiết, độ trôi chảy B1 (110-130 wpm), ngữ pháp câu phức chuẩn xác, tính thực tiễn của giải pháp.", "difficulty": "B1", "score": 5.0, "answer": "Good morning. In our neighbourhood, one pressing issue is the lack of green recreational spaces and public parks for children and teenagers. Because there are few playgrounds, many young people spend their free time indoors glued to electronic devices. To address this issue, the local youth union can plant more trees in empty residential lots. Additionally, teenagers can organise weekend clean-up campaigns to make existing public areas safer and greener."}]},

  {"id": "g9-u1-les-05", "skill": "listening", "unitId": "unit-g9-u1", "unitTitle": "Unit 1: Local Community", "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Listening: Visiting Traditional Craft Villages", "description": "Nghe cuộc trò chuyện về chuyến tham quan làng gốm Bát Tràng và làm đồ thủ công truyền thống.", "durationMinutes": 15, "targetCefr": "B1", "status": "ready", "provenance": "Chương trình GDPT 2018 - Tiếng Anh 9 Global Success Unit 1 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g9-u1-l-q1", "type": "multiple_choice", "prompt": "What traditional craft is the village famous for?", "audioUrl": "/audio/g9-u1-craft-villages.mp3", "passage": "[Audio Transcript]\nGuide: Welcome to Bat Trang craft village! Our artisans have produced ceramics and pottery since the 14th century.\nTourist: Can visitors try making bowls on the potter's wheel themselves?\nGuide: Absolutely! You can join the workshop, mold clay with an artisan, and take your pottery home as a souvenir.", "options": [{"id": "A", "text": "Silk weaving"}, {"id": "B", "text": "Ceramics and pottery making"}, {"id": "C", "text": "Conical hat making"}, {"id": "D", "text": "Wood carving"}], "correctAnswer": "B", "hint": "Listen for 'ceramics and pottery since the 14th century'.", "explanation": "Người hướng dẫn nói: 'Our artisans have produced ceramics and pottery since the 14th century.' Do đó đáp án B là chính xác.", "difficulty": "B1", "score": 1.0, "answer": "B"}, {"id": "g9-u1-l-q2", "type": "multiple_choice", "prompt": "What can tourists do at the hands-on workshop?", "audioUrl": "/audio/g9-u1-craft-villages.mp3", "passage": "Guide: You can join the workshop, mold clay with an artisan, and take your pottery home as a souvenir.", "options": [{"id": "A", "text": "Mold clay with an artisan and make their own pottery"}, {"id": "B", "text": "Cook local traditional dishes"}, {"id": "C", "text": "Drive electric cars through the village"}, {"id": "D", "text": "Only watch artisans without touching anything"}], "correctAnswer": "A", "hint": "Listen to the activities tourists can try.", "explanation": "Hướng dẫn viên cho biết: 'You can join the workshop, mold clay with an artisan, and take your pottery home...' Chọn A.", "difficulty": "B1", "score": 1.0, "answer": "A"}]},

  {"id": "g9-midterm-exam-01", "skill": "reading", "unitId": "unit-g9-midterm", "unitTitle": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)", "courseTitle": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)", "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 9 (Thời Gian: 45 Phút)", "description": "Đề kiểm tra toàn diện bám sát cấu trúc đề khảo sát và thi tuyển sinh vào 10 THPT.", "durationMinutes": 45, "targetCefr": "B1", "status": "ready", "provenance": "Đề khảo sát định kỳ GDPT 2018 Tiếng Anh 9 (NXB Giáo Dục Việt Nam)", "questions": [{"id": "g9-mt-q1", "type": "multiple_choice", "prompt": "Stress: Choose the word whose stress pattern is different from the others:", "passage": null, "options": [{"id": "A", "text": "artisan"}, {"id": "B", "text": "handicraft"}, {"id": "C", "text": "community"}, {"id": "D", "text": "pottery"}], "correctAnswer": "C", "hint": "'community' có đuôi -ity nên trọng âm rơi vào âm tiết đứng ngay trước nó.", "explanation": "Quy tắc trọng âm: Từ có hậu tố '-ity' có trọng âm rơi vào âm tiết đứng ngay trước hậu tố đó -> com'munity (trọng âm 2). Các từ còn lại: 'handicraft' (trọng âm 1), 'pottery' (trọng âm 1), 'artisan' (trọng âm 1 theo chuẩn Oxford/Cambridge). Vì vậy chọn C.", "difficulty": "B1", "score": 0.5, "answer": "C"}, {"id": "g9-mt-q2", "type": "multiple_choice", "prompt": "Phrasal Verbs: When we visited the ancient village, the guide showed us _______ the centuries-old pagodas.", "passage": null, "options": [{"id": "A", "text": "around"}, {"id": "B", "text": "up"}, {"id": "C", "text": "down"}, {"id": "D", "text": "off"}], "correctAnswer": "A", "hint": "Cụm 'show somebody around' có nghĩa là dẫn ai đó đi tham quan xung quanh.", "explanation": "'show sb around' là cụm động từ chuẩn nghĩa 'dẫn ai đi tham quan quanh một địa điểm'. Do đó chọn 'around'.", "difficulty": "B1", "score": 0.5, "answer": "A"}, {"id": "g9-mt-q3", "type": "writing", "prompt": "Rewrite the sentence: 'They don't know who they should consult about the new community project.' -> 'They don't know...'", "passage": null, "options": null, "correctAnswer": "They don't know who to consult about the new community project.", "hint": "Rút gọn 'who they should consult' thành 'who to consult'.", "explanation": "Rút gọn mệnh đề quan hệ/danh từ với Wh-word: 'who they should consult' -> 'who to consult'. Câu hoàn chỉnh: 'They don't know who to consult about the new community project.'", "difficulty": "B1", "score": 1.5, "answer": "They don't know who to consult about the new community project."}]},

  {
    id: "lesson-reading-01",
    skill: "reading",
    unitId: "unit-r-1",
    unitTitle: "Unit 1: Xác Định Ý Chính & Chi Tiết Học Thuật",
    courseTitle: "Academic Reading B1 Foundation",
    title: "Skimming & Scanning: Đời Sống Hoang Dã",
    description: "Rèn luyện kỹ năng đọc lướt tìm từ khóa và phân tích ý chính trong đoạn văn ngắn về tập tính động vật.",
    durationMinutes: 12,
    targetCefr: "B1",
    status: "ready",
    provenance: "Khung năng lực ngoại ngữ 6 bậc / CEFR B1 Foundation",
    questions: [
      {
        id: "q-r-1",
        type: "multiple_choice",
        prompt: "Based on the statement: 'Emperor penguins huddle together in immense groups during winter to withstand Antarctic storms', what is the primary purpose of this behavior?",
        passage: "Antarctica is the coldest, windiest, and driest continent on Earth. Despite these harsh conditions, emperor penguins have evolved extraordinary social survival strategies. During the depth of winter, thousands of males huddle tightly together in immense clusters. They take turns moving from the freezing outer edges into the warm, sheltered core of the huddle, where temperatures can reach over 20°C even when outside wind chills drop below -50°C.",
        options: [
          { id: "opt-1", text: "To hunt for prey more effectively during the winter." },
          { id: "opt-2", text: "To protect their bodies and withstand severe Antarctic blizzards." },
          { id: "opt-3", text: "To lay eggs in cooler, ventilated areas." },
          { id: "opt-4", text: "To compete for territory with other polar bird species." },
        ],
        correctAnswer: "opt-2",
        hint: "Focus on the phrase 'withstand Antarctic storms' and 'take turns moving... into the warm core'.",
        explanation: "Cụm 'withstand Antarctic storms' có nghĩa là chống chọi với bão vùng Nam Cực. Đoạn văn giải thích chim cánh cụt tụ tập thành vòng tròn để giữ nhiệt độ ấm áp.",
        difficulty: "B1",
      },
      {
        id: "q-r-2",
        type: "multi_select",
        prompt: "Which TWO of the following statements are TRUE about the penguin huddle? (Select 2 options)",
        passage: "They take turns moving from the freezing outer edges into the warm, sheltered core of the huddle, where temperatures can reach over 20°C even when outside wind chills drop below -50°C.",
        options: [
          { id: "opt-a", text: "The temperature at the core of the huddle can exceed 20°C." },
          { id: "opt-b", text: "Only alpha males are permitted to occupy the center." },
          { id: "opt-c", text: "Penguins rotate positions from the cold perimeter to the sheltered core." },
          { id: "opt-d", text: "Sub-zero wind chills outside never drop below -20°C." },
        ],
        correctAnswer: ["opt-a", "opt-c"],
        hint: "Look for 'take turns' (rotate positions) and 'reach over 20°C'.",
        explanation: "Bài đọc nêu rõ: chúng luân phiên (take turns) di chuyển từ rìa vào trong, và nhiệt độ lõi đạt trên 20°C.",
        difficulty: "B1",
      },
      {
        id: "q-r-3",
        type: "fill_in_the_blank",
        prompt: "Complete the sentence with ONE word from the passage: 'The huddle provides a warm, _______ core for the penguins.'",
        passage: "...into the warm, sheltered core of the huddle...",
        correctAnswer: "sheltered",
        hint: "The missing word precedes 'core' and describes being protected from wind and cold.",
        explanation: "Từ chính xác trong bài đọc là 'sheltered' (được che chở / khuất gió).",
        difficulty: "B1",
      },
    ],
  },
  {
    id: "lesson-listening-01",
    skill: "listening",
    unitId: "unit-l-1",
    unitTitle: "Unit 1: Nghe Bắt Thông Tin Cá Nhân & Lịch Trình",
    courseTitle: "Academic Listening B1 Foundation",
    title: "Đặt Lịch Hẹn & Tra Cứu Thông Tin Dịch Vụ",
    description: "Nhận biết các con số, tên riêng và thông tin chi tiết qua cuộc hội thoại giữa học viên và tư vấn viên.",
    durationMinutes: 10,
    targetCefr: "B1",
    status: "ready",
    provenance: "Khung năng lực ngoại ngữ 6 bậc / CEFR B1 Foundation",
    questions: [
      {
        id: "q-l-1",
        type: "multiple_choice",
        prompt: "On which day of the week is the library orientation appointment scheduled?",
        audioUrl: "/audio/library-appointment.mp3",
        options: [
          { id: "opt-mon", text: "Monday morning (9:00 AM)" },
          { id: "opt-wed", text: "Wednesday afternoon (2:30 PM)" },
          { id: "opt-fri", text: "Friday evening (5:00 PM)" },
        ],
        correctAnswer: "opt-wed",
        hint: "The advisor suggests Monday first, but the student has a clash and reschedules to midweek.",
        explanation: "Hội thoại có bẫy: người hỏi đề xuất thứ Hai, nhưng bạn sinh viên bận học và cả hai thống nhất lịch vào chiều Thứ Tư lúc 2:30 chiều.",
        difficulty: "B1",
      },
      {
        id: "q-l-2",
        type: "match_pairs",
        prompt: "Match each facility department with its corresponding floor described in the audio:",
        pairs: [
          { left: "Circulation & Book Loans Desk", right: "Floor 1 (Ground Floor)" },
          { left: "Collaborative Study Pods", right: "Floor 2 (Second Floor)" },
          { left: "Rare Manuscripts Archive", right: "Floor 4 (Quiet Zone)" },
        ],
        correctAnswer: "matched",
        hint: "Note British English floor numbering conventions (Ground Floor = Floor 1).",
        explanation: "Khu mượn trả sách đặt ở sảnh Ground floor, phòng học nhóm ở tầng 2, và tài liệu hiếm ở tầng 4 yên tĩnh.",
        difficulty: "B1",
      },
    ],
  },
  {
    id: "lesson-grammar-01",
    skill: "grammar",
    unitId: "unit-g-1",
    unitTitle: "Unit 1: Hòa Hợp Chủ Vị & Thì Hiện Tại Đơn",
    courseTitle: "Grammar in Context B1",
    title: "Chủ Ngữ Số Ít & Trợ Động Từ",
    description: "Phân biệt các lỗi chia động từ cơ bản và mở rộng cấu trúc câu ghép.",
    durationMinutes: 8,
    targetCefr: "A2",
    status: "ready",
    provenance: "Khung năng lực ngoại ngữ 6 bậc / CEFR B1 Foundation",
    questions: [
      {
        id: "q-g-1",
        type: "multiple_choice",
        prompt: "Select the correct verb form: 'She ___ English vocabulary every single morning.'",
        options: [
          { id: "opt-1", text: "study" },
          { id: "opt-2", text: "studies" },
          { id: "opt-3", text: "studying" },
          { id: "opt-4", text: "studied" },
        ],
        correctAnswer: "opt-2",
        hint: "Third-person singular subject 'She' performing a daily recurring habit.",
        explanation: "Chủ ngữ 'She' ngôi thứ ba số ít trong thì hiện tại đơn đi với động từ kết thúc bằng đuôi -ies (study -> studies).",
        difficulty: "A2",
      },
      {
        id: "q-g-2",
        type: "unscramble",
        prompt: "Rearrange the tokens into a grammatically correct sentence:",
        tokens: ["He", "rarely", "makes", "spelling", "mistakes", "now"],
        correctAnswer: "He rarely makes spelling mistakes now",
        hint: "The frequency adverb 'rarely' precedes the main verb 'makes'.",
        explanation: "Thứ tự chuẩn của câu: Chủ ngữ (He) + Trạng từ tần suất (rarely) + Động từ (makes) + Cụm tân ngữ (spelling mistakes) + Trạng từ thời gian (now).",
        difficulty: "A2",
      },
    ],
  },
  {
    id: "lesson-writing-01",
    skill: "writing",
    unitId: "unit-w-1",
    unitTitle: "Unit 1: Viết Luận Học Thuật — Đoạn Thân Bài",
    courseTitle: "IELTS Writing Foundations",
    title: "Developing Supporting Ideas with Examples",
    description: "Viết một đoạn văn thân bài (80–120 từ) giải thích lý do tại sao làm việc nhóm giúp cải thiện hiệu suất.",
    durationMinutes: 20,
    targetCefr: "B1",
    status: "ready",
    provenance: "Khung năng lực ngoại ngữ 6 bậc / CEFR B1 Foundation",
    questions: [
      {
        id: "q-w-1",
        type: "writing",
        prompt: "Write a short paragraph (80–120 words) explaining one benefit of teamwork in modern education. Provide a specific example to support your view.",
        hint: "Gợi ý cấu trúc: Topic sentence (Lợi ích chính) -> Explanation (Giải thích tại sao) -> Concrete example (Ví dụ thực tế) -> Concluding link.",
        explanation: "Đoạn văn cần có tính liên kết chặt chẽ (Cohesion), từ nối phù hợp (For instance, Consequently), và từ vựng chính xác.",
        correctAnswer: "manual_evaluation",
        difficulty: "B1",
      },
    ],
  },
  {
    id: "lesson-speaking-01",
    skill: "speaking",
    unitId: "unit-s-1",
    unitTitle: "Unit 1: Trả Lời Trôi Chảy Part 1",
    courseTitle: "Speaking Confidence",
    title: "Talking About Daily Routines and Hobbies",
    description: "Luyện phát âm rõ ràng, mở rộng câu trả lời bằng cách nêu lý do và cảm xúc cá nhân.",
    durationMinutes: 15,
    targetCefr: "B1",
    status: "ready",
    provenance: "Khung năng lực ngoại ngữ 6 bậc / CEFR B1 Foundation",
    questions: [
      {
        id: "q-s-1",
        type: "speaking",
        prompt: "Describe your favorite hobby and explain how it helps you relax after a busy study day. Speak for 45–60 seconds.",
        hint: "Hãy nêu tên sở thích, bạn bắt đầu từ khi nào, làm việc đó với ai và cảm giác sau khi thực hiện.",
        explanation: "Tập trung vào ngữ điệu tự nhiên, tránh ngắt quãng quá lâu, và sử dụng các cụm diễn đạt cảm xúc (unwind, recharge my energy).",
        correctAnswer: "voice_evaluation",
        difficulty: "B1",
      },
    ],
  },
];

export const initialClassrooms: Classroom[] = [
  {
    id: "class-101",
    code: "IEL789",
    name: "IELTS Academic Target 6.5 (K24)",
    teacherName: "Thầy Vũ Hoàng (M.A TESOL)",
    room: "Online Hub Room A",
    studentCount: 22,
    assignmentsCount: 4,
    createdAt: "15/09/2026",
  },
  {
    id: "class-102",
    code: "ENG456",
    name: "Reading & Writing Lab B1+",
    teacherName: "Cô Mai Phương (CELTA)",
    room: "Phòng B204",
    studentCount: 18,
    assignmentsCount: 2,
    createdAt: "01/10/2026",
  },
];

export const initialAssignments: Assignment[] = [
  {
    id: "assign-1",
    classId: "class-101",
    className: "IELTS Academic Target 6.5 (K24)",
    title: "Writing Task 2: Remote Learning vs. Traditional Classrooms",
    skill: "writing",
    dueDate: "23:59 ngày mai",
    version: 1,
    status: "in_progress",
    maxScore: 9,
    allowAiTutor: true,
    promptText: "Some people believe that online education will completely replace physical universities in the near future. To what extent do you agree or disagree? Write at least 250 words.",
    studentDraft: "In recent years, the rapid advancement of digital technology has transformed the educational landscape. While remote learning offers unparalleled flexibility, I firmly believe that traditional classrooms remain irreplaceable due to face-to-face social interaction...",
  },
  {
    id: "assign-2",
    classId: "class-101",
    className: "IELTS Academic Target 6.5 (K24)",
    title: "Academic Reading Passage: Renewable Marine Energy",
    skill: "reading",
    dueDate: "Hết hạn sau 3 ngày",
    version: 1,
    status: "not_started",
    maxScore: 10,
    allowAiTutor: true,
    promptText: "Read the article on Tidal Barrage Systems and answer 10 questions (True/False/Not Given & Summary Completion).",
  },
  {
    id: "assign-3",
    classId: "class-101",
    className: "IELTS Academic Target 6.5 (K24)",
    title: "Speaking Part 2: A Time You Solved a Difficult Problem",
    skill: "speaking",
    dueDate: "Đã nộp",
    version: 1,
    status: "graded",
    score: 6.5,
    maxScore: 9,
    teacherFeedback: "Ý tưởng phát triển mạch lạc, phát âm âm cuối /t/ và /d/ rất rõ. Em cần chú ý thêm cấu trúc câu điều kiện loại 3 khi nhắc về quá khứ nhé!",
    aiPreGrade: "AI Dự đoán: Band 6.0-6.5 (Fluency 6.5, Lexical 6.0, Grammar 6.0, Pronunciation 7.0)",
    allowAiTutor: true,
    promptText: "Describe a challenge you faced and how you overcame it.",
  },
  {
    id: "assign-4",
    classId: "class-102",
    className: "Reading & Writing Lab B1+",
    title: "Vocabulary & Collocation Drill: Environment & Climate",
    skill: "vocabulary",
    dueDate: "Sau 5 ngày",
    version: 2,
    status: "not_started",
    maxScore: 10,
    allowAiTutor: false,
    promptText: "Luyện tập 15 collocations trọng tâm về bảo vệ môi trường và năng lượng tái tạo. (Bài tập kiểm tra: Không sử dụng AI Tutor).",
  },
];

export const initialSubmissions: Submission[] = [
  {
    id: "sub-1",
    assignmentId: "assign-1",
    assignmentTitle: "Writing Task 2: Remote Learning vs. Traditional Classrooms",
    studentId: "stu-101",
    studentName: "Nguyễn Minh Triết",
    submittedAt: "08/10/2026 14:30",
    versionId: 1,
    status: "pending_grading",
    maxScore: 9,
    aiDraftGrade: {
      estimatedBand: "6.5",
      fluencyOrCoherence: 6.5,
      lexicalResource: 6.5,
      grammarAccuracy: 6.0,
      summary: "Đoạn văn mở bài và thân bài 1 có luận điểm rõ ràng, sử dụng tốt các từ nối như 'unparalleled flexibility' và 'irreplaceable'. Lỗi ngữ pháp nhẹ ở vế câu điều kiện.",
    },
    content: "In recent years, the rapid advancement of digital technology has transformed the educational landscape. While remote learning offers unparalleled flexibility, I firmly believe that traditional classrooms remain irreplaceable due to face-to-face social interaction...",
  },
  {
    id: "sub-2",
    assignmentId: "assign-1",
    assignmentTitle: "Writing Task 2: Remote Learning vs. Traditional Classrooms",
    studentId: "stu-102",
    studentName: "Trần Bảo Ngọc",
    submittedAt: "08/10/2026 11:15",
    versionId: 1,
    status: "graded",
    teacherScore: 7.0,
    maxScore: 9,
    teacherFeedback: "Lập luận rất sắc bén, ví dụ thực tế thuyết phục. Giữ vững phong độ này trong bài thi sắp tới em nhé!",
    aiDraftGrade: {
      estimatedBand: "7.0",
      fluencyOrCoherence: 7.0,
      lexicalResource: 7.0,
      grammarAccuracy: 7.0,
      summary: "Bài viết chất lượng cao, ngữ pháp đa dạng.",
    },
    content: "Distance education has undoubtedly democratized access to global knowledge bases. However, the experiential pedagogy of physical university campuses cannot be replicated...",
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Bài tập mới từ Thầy Vũ Hoàng",
    message: "Lớp 'IELTS Target 6.5' vừa có bài mới: Academic Reading Passage.",
    time: "20 phút trước",
    unread: true,
    type: "assignment",
  },
  {
    id: "notif-2",
    title: "Giáo viên đã trả điểm và nhận xét",
    message: "Thầy Hoàng đã chấm bài 'Speaking Part 2': Điểm 6.5/9.0.",
    time: "2 giờ trước",
    unread: true,
    type: "grade",
  },
  {
    id: "notif-3",
    title: "Nhắc nhở ôn tập từ vựng FSRS",
    message: "Bạn có 4 từ vựng đến hạn ôn tập hôm nay (curious, resilient, subtle...).",
    time: "Sáng nay 08:00",
    unread: false,
    type: "reminder",
  },
];

export const mockAssignments = initialAssignments;

export const mockSkills = [
  { id: "listening" as const, name: "Listening", description: "Rèn luyện khả năng nghe hiểu học thuật và giao tiếp hàng ngày qua các đoạn hội thoại thực tế." },
  { id: "reading" as const, name: "Reading", description: "Đọc hiểu văn bản học thuật, nắm bắt ý chính và chi tiết với kỹ thuật Skimming & Scanning." },
  { id: "writing" as const, name: "Writing", description: "Luyện tập phát triển luận điểm, cấu trúc đoạn văn, bài luận học thuật và mô tả biểu đồ." },
  { id: "speaking" as const, name: "Speaking", description: "Thực hành phát âm, độ lưu loát và phản xạ nói tiếng Anh theo các chủ đề chuyên sâu." },
  { id: "vocabulary" as const, name: "Vocabulary", description: "Mở rộng vốn từ vựng học thuật theo chu kỳ ngắt quãng FSRS khoa học." },
  { id: "grammar" as const, name: "Grammar", description: "Hệ thống hóa ngữ pháp từ cơ bản đến nâng cao với bài tập tương tác tức thì." },
];

export const mockUnits = [
  {
    id: "unit-1",
    order: 1,
    title: "Unit 1: Nền Tảng Học Thuật & Giao Tiếp B1",
    level: "B1",
    description: "Xây dựng vốn từ, nhận diện thông tin then chốt và củng cố phản xạ tự nhiên.",
    lessons: [
      {
        id: "lesson-reading-01",
        title: "Skimming & Scanning: Đời Sống Hoang Dã",
        estimatedMinutes: 12,
        questionCount: 3,
        status: "completed",
      },
      {
        id: "lesson-listening-01",
        title: "Đặt Lịch Hẹn & Tra Cứu Thông Tin Dịch Vụ",
        estimatedMinutes: 10,
        questionCount: 3,
        status: "in_progress",
      },
    ],
  },
  {
    id: "unit-2",
    order: 2,
    title: "Unit 2: Nâng Cao Cấu Trúc & Phân Tích Chuyên Sâu B2",
    level: "B2",
    description: "Luyện tập các bài đọc dài, đoạn hội thoại nhiều người và kỹ năng lập luận phức hợp.",
    lessons: [
      {
        id: "lesson-adv-1",
        title: "Phân Tích Dữ Liệu Biểu Đồ & Xu Hướng",
        estimatedMinutes: 15,
        questionCount: 4,
        status: "not_started",
      },
      {
        id: "lesson-adv-2",
        title: "Thảo Luận Học Thuật & Tranh Biện",
        estimatedMinutes: 20,
        questionCount: 5,
        status: "not_started",
      },
    ],
  },
];
