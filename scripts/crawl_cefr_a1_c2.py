import json
import os
import re

# Output path
OUTPUT_PATH = r"c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English\content\english\batch_003.json"

topics = [
    {
        "id": "top-014",
        "title": "CEFR A1: Tiếng Anh Sơ cấp & Nền tảng Giao tiếp",
        "description": "Kho bài tập 4 kỹ năng (Từ vựng, Ngữ pháp, Đọc hiểu, Nghe) dành cho người bắt đầu làm quen với tiếng Anh cơ bản."
    },
    {
        "id": "top-015",
        "title": "CEFR A2: Tiếng Anh Cơ sở & Đời sống Thực tế",
        "description": "Củng cố các chủ điểm ngữ pháp thì quá khứ, từ vựng du lịch, công sở, bài đọc hiểu và hội thoại văn phòng sinh động."
    },
    {
        "id": "top-016",
        "title": "CEFR B1: Tiếng Anh Trung cấp Độc lập",
        "description": "Nâng cao năng lực ngôn ngữ với hiện tại hoàn thành, câu điều kiện, bài đọc phong cách sống số và tin tức văn hóa xã hội."
    },
    {
        "id": "top-017",
        "title": "CEFR B2: Tiếng Anh Trung cấp Nâng cao & Tự chủ",
        "description": "Thành thạo cấu trúc câu phức, câu điều kiện hỗn hợp, bài đọc sinh thái đô thị và nghe tài liệu lịch sử hàng không."
    },
    {
        "id": "top-018",
        "title": "CEFR C1: Tiếng Anh Cao cấp & Học thuật Chuyên sâu",
        "description": "Chinh phục cấu trúc đảo ngữ (Inversion), từ vựng học thuật AWL, bài đọc phản biện AI và bài nghe phòng thủ thiên thạch."
    },
    {
        "id": "top-019",
        "title": "CEFR C2: Tiếng Anh Tinh thông Bản ngữ (Proficiency)",
        "description": "Bậc thầy ngôn ngữ với câu chẻ (Cleft sentences), sắc thái từ vựng tinh tế, chuyên khảo triết học ngôn ngữ và từ nguyên học."
    }
]

lessons = [
    # ==========================================
    # LEVEL A1
    # ==========================================
    {
        "id": "les-019",
        "topicId": "top-014",
        "title": "Từ vựng A1: Gia đình, Nhà cửa & Đồ vật Thường nhật",
        "summary": "Nắm vững các danh từ và tính từ cơ bản nhất về quan hệ gia đình, các phòng trong nhà và vật dụng quen thuộc.",
        "level": "A1",
        "kind": "VOCABULARY",
        "body": """### Từ vựng Cốt lõi A1 - Family & Home
1. **Gia đình (Family):**
   - *Parents* /ˈpeərənts/: Bố mẹ (father / mother)
   - *Sibling* /ˈsɪblɪŋ/: Anh chị em ruột (brother / sister)
   - *Cousin* /ˈkʌzn/: Anh chị em họ
   - *Grandparents* /ˈɡrænpeərənts/: Ông bà (grandfather / grandmother)

2. **Nhà cửa & Đồ đạc (Home & Rooms):**
   - *Living room* /ˈlɪv.ɪŋ ˌruːm/: Phòng khách
   - *Kitchen* /ˈkɪtʃ.ən/: Nhà bếp
   - *Bedroom* /ˈbed.ruːm/: Phòng ngủ
   - *Bathroom* /ˈbɑːθ.ruːm/: Phòng tắm
   - *Refrigerator / Fridge* /frɪdʒ/: Tủ lạnh
   - *Wardrobe* /ˈwɔː.drəʊb/: Tủ quần áo

3. **Mẫu câu giao tiếp cơ bản:**
   - *This is my brother. He is ten years old.* (Đây là em trai tôi. Cậu ấy 10 tuổi.)
   - *Where is the kitchen? It is next to the living room.* (Nhà bếp ở đâu? Nó ở cạnh phòng khách.)""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Oxford 3000 Vocabulary List (CEFR A1 Basic Wordlist)",
        "published": True,
        "exercises": [
            {
                "id": "ex-019-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What is the English word for 'anh trai' or 'em trai'?",
                "options": ["Brother", "Sister", "Uncle", "Cousin"],
                "correctAnswer": "Brother",
                "acceptedAnswers": ["Brother"],
                "explanation": "'Brother' có nghĩa là anh trai hoặc em trai trong tiếng Anh.",
                "segmentId": None
            },
            {
                "id": "ex-019-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "Which room do you cook food in?",
                "options": ["Kitchen", "Bedroom", "Bathroom", "Living room"],
                "correctAnswer": "Kitchen",
                "acceptedAnswers": ["Kitchen"],
                "explanation": "'Kitchen' là nhà bếp, nơi dùng để nấu nướng thức ăn.",
                "segmentId": None
            },
            {
                "id": "ex-019-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Choose the word that means 'cha mẹ':",
                "options": ["Parents", "Children", "Grandparents", "Cousins"],
                "correctAnswer": "Parents",
                "acceptedAnswers": ["Parents"],
                "explanation": "'Parents' chỉ chung cả bố và mẹ (cha mẹ).",
                "segmentId": None
            },
            {
                "id": "ex-019-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Where do you usually keep fresh food cold?",
                "options": ["In the refrigerator", "Under the bed", "In the wardrobe", "On the sofa"],
                "correctAnswer": "In the refrigerator",
                "acceptedAnswers": ["In the refrigerator"],
                "explanation": "'Refrigerator' (hoặc fridge) là tủ lạnh dùng để bảo quản đồ ăn tươi mát.",
                "segmentId": None
            },
            {
                "id": "ex-019-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "Fill in the blank: 'My father and mother have two sons. I am one son, so the other is my ________.'",
                "options": ["brother", "sister", "aunt", "uncle"],
                "correctAnswer": "brother",
                "acceptedAnswers": ["brother"],
                "explanation": "Người con trai còn lại của bố mẹ chính là anh/em trai (brother).",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-020",
        "topicId": "top-014",
        "title": "Ngữ pháp A1: Động từ To Be & Thì Hiện tại Đơn (Present Simple)",
        "summary": "Học cách chia động từ to be (am/is/are) và động từ thường ở thì hiện tại đơn với ngôi thứ ba số ít.",
        "level": "A1",
        "kind": "GRAMMAR",
        "body": """### 1. Động từ To Be (am / is / are)
- **Khẳng định:**
  - I + **am** (I'm a student.)
  - He / She / It / Danh từ số ít + **is** (She is nice. The dog is brown.)
  - You / We / They / Danh từ số nhiều + **are** (They are doctors.)
- **Phủ định:** S + am/is/are + not (I am not tired. He isn't at home.)
- **Nghi vấn:** Am/Is/Are + S ...? (Are you ready? Yes, I am.)

### 2. Thì Hiện tại đơn với Động từ thường (Simple Present)
- **Công thức:**
  - I / You / We / They + V(nguyên mẫu): *They speak English.*
  - He / She / It + V(s/es): *He speaks Vietnamese. She watches television.*
- **Phủ định:** S + do not (don't) / does not (doesn't) + V(nguyên mẫu)
- **Nghi vấn:** Do / Does + S + V(nguyên mẫu)?""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Essential Grammar in Use (CEFR A1 Elementary Rules)",
        "published": True,
        "exercises": [
            {
                "id": "ex-020-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "She ________ a teacher at my local school.",
                "options": ["is", "am", "are", "be"],
                "correctAnswer": "is",
                "acceptedAnswers": ["is"],
                "explanation": "Chủ ngữ là đại từ ngôi thứ 3 số ít 'She' nên động từ 'to be' chia là 'is'.",
                "segmentId": None
            },
            {
                "id": "ex-020-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "They ________ in a big apartment in the center of the city.",
                "options": ["live", "lives", "living", "is live"],
                "correctAnswer": "live",
                "acceptedAnswers": ["live"],
                "explanation": "Chủ ngữ số nhiều 'They' đi với động từ nguyên mẫu 'live' trong thì hiện tại đơn.",
                "segmentId": None
            },
            {
                "id": "ex-020-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "My brother ________ coffee every morning before work.",
                "options": ["drinks", "drink", "drinking", "are drink"],
                "correctAnswer": "drinks",
                "acceptedAnswers": ["drinks"],
                "explanation": "Chủ ngữ 'My brother' là ngôi thứ ba số ít, động từ thường phải thêm 's' -> 'drinks'.",
                "segmentId": None
            },
            {
                "id": "ex-020-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "________ you like playing badminton on weekends?",
                "options": ["Do", "Does", "Are", "Is"],
                "correctAnswer": "Do",
                "acceptedAnswers": ["Do"],
                "explanation": "Câu hỏi thì hiện tại đơn với chủ ngữ 'you' dùng trợ động từ 'Do'.",
                "segmentId": None
            },
            {
                "id": "ex-020-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "He ________ have a car, so he rides a bicycle to school.",
                "options": ["doesn't", "don't", "isn't", "aren't"],
                "correctAnswer": "doesn't",
                "acceptedAnswers": ["doesn't"],
                "explanation": "Câu phủ định thì hiện tại đơn với 'He' và động từ thường 'have' dùng trợ động từ 'doesn't'.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-021",
        "topicId": "top-014",
        "title": "Đọc hiểu A1: Bức thư làm quen từ London (A Letter from London)",
        "summary": "Đọc hiểu bức thư ngắn giới thiệu bản thân, trường học và sở thích của bạn Sarah gửi cho người bạn qua thư.",
        "level": "A1",
        "kind": "READING",
        "body": """### Reading Passage: A Letter from London

Dear Nam,

My name is Sarah. I am twelve years old and I live in London with my family. My family is small: my father, my mother, my younger brother Lucas, and me. We also have a lovely golden dog named Max.

On weekdays, I wake up at seven o'clock. I eat bread and drink orange juice for breakfast. My school is near my house, so Lucas and I walk to school every morning. My favourite subject at school is Science because I love nature and animals. After school, I often play badminton with my friends in the park.

London is cold in winter, but very beautiful in autumn. What about your city? Please write back to me soon!

Best wishes,  
Sarah""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Cambridge Young Learners & CEFR A1 Graded Reading",
        "published": True,
        "exercises": [
            {
                "id": "ex-021-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "How old is Sarah?",
                "options": ["Twelve years old", "Ten years old", "Fourteen years old", "Seven years old"],
                "correctAnswer": "Twelve years old",
                "acceptedAnswers": ["Twelve years old"],
                "explanation": "Đoạn văn viết: 'My name is Sarah. I am twelve years old.'",
                "segmentId": None
            },
            {
                "id": "ex-021-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "How does Sarah travel to school every morning?",
                "options": ["She walks", "She takes a bus", "She rides a bicycle", "Her father drives her"],
                "correctAnswer": "She walks",
                "acceptedAnswers": ["She walks"],
                "explanation": "Đoạn văn nêu rõ: 'My school is near my house, so Lucas and I walk to school every morning.'",
                "segmentId": None
            },
            {
                "id": "ex-021-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What is Sarah's favourite subject at school?",
                "options": ["Science", "Maths", "English", "History"],
                "correctAnswer": "Science",
                "acceptedAnswers": ["Science"],
                "explanation": "Văn bản viết: 'My favourite subject at school is Science because I love nature and animals.'",
                "segmentId": None
            },
            {
                "id": "ex-021-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Who is Max in the story?",
                "options": ["Sarah's pet dog", "Sarah's younger brother", "Sarah's school teacher", "Sarah's penpal"],
                "correctAnswer": "Sarah's pet dog",
                "acceptedAnswers": ["Sarah's pet dog"],
                "explanation": "Đoạn văn nêu: 'We also have a lovely golden dog named Max.'",
                "segmentId": None
            },
            {
                "id": "ex-021-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "What sport does Sarah play after school in the park?",
                "options": ["Badminton", "Football", "Basketball", "Swimming"],
                "correctAnswer": "Badminton",
                "acceptedAnswers": ["Badminton"],
                "explanation": "Đoạn văn viết: 'After school, I often play badminton with my friends in the park.'",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-022",
        "topicId": "top-014",
        "title": "Luyện nghe A1: Chào mừng đến căn hộ mới! (Let's Learn English - Lesson 1)",
        "summary": "Luyện nghe hội thoại chào hỏi, đánh vần tên và địa chỉ nhà với tốc độ phát âm chuẩn, chậm rãi.",
        "level": "A1",
        "kind": "LISTENING",
        "body": "Nghe đoạn hội thoại làm quen giữa Pete và Anna. Chú ý cách phát âm tên riêng, đánh vần và số nhà.",
        "audioUrl": "/media/cefr/cefr_a1_welcome.mp3",
        "transcript": [
            {
                "id": "seg-022-01",
                "startMs": 690,
                "endMs": 7230,
                "textEn": "Pete: Hi! Are you Anna? Anna: Yes! Hi there! Are you Pete? Pete: I am Pete. Anna: Nice to meet you.",
                "textVi": "Pete: Chào! Bạn là Anna phải không? Anna: Đúng rồi! Chào bạn! Bạn là Pete à? Pete: Tôi là Pete. Anna: Rất vui được gặp bạn."
            },
            {
                "id": "seg-022-02",
                "startMs": 7230,
                "endMs": 14250,
                "textEn": "Anna: I'm Anna. Nice to meet you. Pete: I'm Pete. Pete: \"Anna\". Is that A-N-A? Anna: No. A-N-N-A.",
                "textVi": "Anna: Tôi là Anna. Rất vui được gặp bạn. Pete: Tôi là Pete. Pete: \"Anna\". Có phải đánh vần là A-N-A không? Anna: Không, là A-N-N-A."
            },
            {
                "id": "seg-022-03",
                "startMs": 14250,
                "endMs": 24000,
                "textEn": "Pete: Well, Anna, welcome to 1400 Irving Street! Anna: Thank you! I am so excited to be here.",
                "textVi": "Pete: Chà, Anna, chào mừng bạn đến số 1400 phố Irving! Anna: Cảm ơn bạn! Tôi rất hào hứng khi ở đây."
            }
        ],
        "sourceAttribution": "Voice of America - Let's Learn English Level 1 (Public Domain)",
        "published": True,
        "exercises": [
            {
                "id": "ex-022-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What is the man's name in the conversation?",
                "options": ["Pete", "John", "David", "Lucas"],
                "correctAnswer": "Pete",
                "acceptedAnswers": ["Pete"],
                "explanation": "Người đàn ông tự giới thiệu: 'I am Pete.'",
                "segmentId": "seg-022-01"
            },
            {
                "id": "ex-022-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "How does Anna spell her first name?",
                "options": ["A-N-N-A", "A-N-A", "A-N-N-E", "A-H-N-A"],
                "correctAnswer": "A-N-N-A",
                "acceptedAnswers": ["A-N-N-A"],
                "explanation": "Anna đính chính lại cách đánh vần tên mình: 'No. A-N-N-A.'",
                "segmentId": "seg-022-02"
            },
            {
                "id": "ex-022-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What is the street address mentioned in the dialogue?",
                "options": ["1400 Irving Street", "1200 Irving Street", "1400 Oxford Street", "1500 Baker Street"],
                "correctAnswer": "1400 Irving Street",
                "acceptedAnswers": ["1400 Irving Street"],
                "explanation": "Pete chào đón: 'welcome to 1400 Irving Street!'",
                "segmentId": "seg-022-03"
            },
            {
                "id": "ex-022-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "How does Anna feel about being at her new apartment?",
                "options": ["Very excited", "Very tired", "Sad", "Angry"],
                "correctAnswer": "Very excited",
                "acceptedAnswers": ["Very excited"],
                "explanation": "Anna nói: 'Thank you! I am so excited to be here.'",
                "segmentId": "seg-022-03"
            },
            {
                "id": "ex-022-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "What phrase is used when two people meet each other for the first time?",
                "options": ["Nice to meet you", "Good night", "See you yesterday", "Have a good sleep"],
                "correctAnswer": "Nice to meet you",
                "acceptedAnswers": ["Nice to meet you"],
                "explanation": "'Nice to meet you' là câu chào lịch sự khi gặp ai đó lần đầu tiên.",
                "segmentId": "seg-022-01"
            }
        ]
    },

    # ==========================================
    # LEVEL A2
    # ==========================================
    {
        "id": "les-023",
        "topicId": "top-015",
        "title": "Từ vựng A2: Giao thông, Phương tiện & Chỉ đường (Transport & Directions)",
        "summary": "Mở rộng vốn từ về các loại phương tiện công cộng, sân bay, ga tàu và mẫu câu hỏi đường thông dụng.",
        "level": "A2",
        "kind": "VOCABULARY",
        "body": """### Từ vựng Trọng tâm A2 - Transport & Travel
1. **Phương tiện di chuyển (Vehicles):**
   - *Subway / Underground* /ˈsʌb.weɪ/: Tàu điện ngầm
   - *Train station* /ˈtreɪn ˌsteɪ.ʃən/: Nhà ga xe lửa
   - *Bus stop* /ˈbʌs ˌstɒp/: Điểm dừng xe buýt
   - *Luggage / Baggage* /ˈlʌɡ.ɪdʒ/: Hành lý
   - *Ticket counter* /ˈtɪk.ɪt ˌkaʊn.tər/: Quầy bán vé

2. **Chỉ đường (Giving & Asking Directions):**
   - *Go straight ahead*: Đi thẳng về phía trước
   - *Turn left / Turn right*: Rẽ trái / Rẽ phải
   - *At the traffic lights*: Tại cột đèn giao thông
   - *Cross the street*: Băng qua đường
   - *Opposite / Across from*: Đối diện với

3. **Cụm từ thông dụng:**
   - *How do I get to the airport?* (Làm thế nào để tôi đến được sân bay?)
   - *A single ticket / A return ticket* (Vé một chiều / Vé khứ hồi)""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Oxford 3000 Vocabulary List (CEFR A2 Everyday Travel)",
        "published": True,
        "exercises": [
            {
                "id": "ex-023-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "If you buy a ticket to travel somewhere and come back, you buy a ________ ticket.",
                "options": ["return", "single", "one-way", "broken"],
                "correctAnswer": "return",
                "acceptedAnswers": ["return"],
                "explanation": "'Return ticket' là vé khứ hồi (đi và về).",
                "segmentId": None
            },
            {
                "id": "ex-023-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "Where do passengers wait to catch a train?",
                "options": ["Platform", "Runway", "Port", "Balcony"],
                "correctAnswer": "Platform",
                "acceptedAnswers": ["Platform"],
                "explanation": "'Platform' là sân ga/ ke ga nơi hành khách đứng đợi tàu.",
                "segmentId": None
            },
            {
                "id": "ex-023-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Fill in the blank: 'Excuse me, could you tell me the ________ to the nearest pharmacy?'",
                "options": ["way", "track", "step", "walk"],
                "correctAnswer": "way",
                "acceptedAnswers": ["way"],
                "explanation": "Cụm từ hỏi đường thông dụng: 'the way to...' (đường đi đến...).",
                "segmentId": None
            },
            {
                "id": "ex-023-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "What do the red, yellow, and green lights on roads called?",
                "options": ["Traffic lights", "Street signs", "Zebra crossings", "Headlights"],
                "correctAnswer": "Traffic lights",
                "acceptedAnswers": ["Traffic lights"],
                "explanation": "'Traffic lights' là đèn tín hiệu giao thông gồm 3 màu đỏ, vàng, xanh.",
                "segmentId": None
            },
            {
                "id": "ex-023-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "When the museum is on the other side of the road facing the bank, it is ________ the bank.",
                "options": ["opposite", "behind", "inside", "between"],
                "correctAnswer": "opposite",
                "acceptedAnswers": ["opposite"],
                "explanation": "'Opposite' có nghĩa là đối diện (ở phía bên kia đường).",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-024",
        "topicId": "top-015",
        "title": "Ngữ pháp A2: Thì Quá khứ Đơn & Động từ Bất quy tắc (Past Simple)",
        "summary": "Quy tắc chia thì quá khứ đơn, cách phát âm đuôi -ed và các động từ bất quy tắc thường gặp nhất.",
        "level": "A2",
        "kind": "GRAMMAR",
        "body": """### 1. Thì Quá khứ đơn (Past Simple Tense)
- **Công thức với Động từ có quy tắc (Regular Verbs):**
  - Khẳng định: S + V-ed (*walked, watched, played*)
  - Phủ định: S + did not (didn't) + V(nguyên mẫu) (*didn't go, didn't see*)
  - Nghi vấn: Did + S + V(nguyên mẫu)? (*Did you visit your grandparents yesterday?*)

- **Các Động từ Bất quy tắc thường gặp (Irregular Verbs):**
  - go -> **went**
  - buy -> **bought**
  - have -> **had**
  - see -> **saw**
  - take -> **took**
  - make -> **made**
  - eat -> **ate**

- **Dấu hiệu nhận biết:**
  - *yesterday, last night, last week, 2 days ago, in 2020, when I was young.*""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "LearnEnglishFeelGood (A2 Past Simple Grammar Reference)",
        "published": True,
        "exercises": [
            {
                "id": "ex-024-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "Yesterday, we ________ a wonderful Italian restaurant near our hotel.",
                "options": ["found", "finded", "find", "finding"],
                "correctAnswer": "found",
                "acceptedAnswers": ["found"],
                "explanation": "Quá khứ của động từ bất quy tắc 'find' là 'found'.",
                "segmentId": None
            },
            {
                "id": "ex-024-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "She ________ go to the concert last night because she had a headache.",
                "options": ["didn't", "doesn't", "wasn't", "don't"],
                "correctAnswer": "didn't",
                "acceptedAnswers": ["didn't"],
                "explanation": "Câu phủ định trong quá khứ đi với động từ thường 'go' dùng trợ động từ 'didn't'.",
                "segmentId": None
            },
            {
                "id": "ex-024-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What time ________ you arrive home from work yesterday?",
                "options": ["did", "do", "were", "are"],
                "correctAnswer": "did",
                "acceptedAnswers": ["did"],
                "explanation": "Câu hỏi thì quá khứ đơn với động từ thường 'arrive' mượn trợ động từ 'did'.",
                "segmentId": None
            },
            {
                "id": "ex-024-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "My parents ________ in Paris for three years before moving back to Hanoi.",
                "options": ["lived", "live", "lives", "are living"],
                "correctAnswer": "lived",
                "acceptedAnswers": ["lived"],
                "explanation": "Hành động đã kết thúc hoàn toàn trong quá khứ, chia thì quá khứ đơn: 'lived'.",
                "segmentId": None
            },
            {
                "id": "ex-024-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "Choose the correct irregular past form of the verb 'buy':",
                "options": ["bought", "buyed", "boated", "brought"],
                "correctAnswer": "bought",
                "acceptedAnswers": ["bought"],
                "explanation": "Dạng quá khứ bất quy tắc của 'buy' là 'bought' ('brought' là quá khứ của 'bring').",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-025",
        "topicId": "top-015",
        "title": "Đọc hiểu A2: Chuyến dã ngoại đáng nhớ bên hồ (An Unforgettable Camping Trip)",
        "summary": "Đọc hiểu một câu chuyện kể về chuyến đi cắm trại cuối tuần, các thử thách dựng lều và cảm xúc hòa mình vào thiên nhiên.",
        "level": "A2",
        "kind": "READING",
        "body": """### Reading Passage: An Unforgettable Camping Trip

Last summer, Alex and his two friends, Leo and Maya, decided to go camping near Lake Windermere. They packed their backpacks with a green tent, sleeping bags, flashlights, and plenty of canned food.

They arrived at the lake on Saturday afternoon. The weather was warm and sunny. They chose a flat grassy spot close to tall pine trees to set up their tent. At first, putting the tent poles together was difficult, but they worked as a team and finished it before sunset.

Later that evening, they gathered around a small campfire. Leo played the acoustic guitar while Maya and Alex sang songs and roasted marshmallows. Suddenly, at around ten o'clock, heavy rain started to fall. Luckily, their tent was completely waterproof! They stayed inside, listening to the gentle sound of raindrops on the roof, feeling warm and safe.

The next morning, the sky was clear and fresh. They saw a family of wild ducks swimming peacefully in the lake. It was a wonderful adventure that brought the three friends closer together.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "British Council LearnEnglish (CEFR A2 Graded Reading Story)",
        "published": True,
        "exercises": [
            {
                "id": "ex-025-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "Where did Alex and his friends go camping?",
                "options": ["Near Lake Windermere", "On a snowy mountain", "In a city hotel", "At the seaside beach"],
                "correctAnswer": "Near Lake Windermere",
                "acceptedAnswers": ["Near Lake Windermere"],
                "explanation": "Đoạn văn viết: 'Alex and his two friends, Leo and Maya, decided to go camping near Lake Windermere.'",
                "segmentId": None
            },
            {
                "id": "ex-025-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "What problem did they face at first when they arrived?",
                "options": [
                    "Putting the tent poles together was difficult",
                    "They lost their backpacks",
                    "They had no drinking water",
                    "A wild bear approached them"
                ],
                "correctAnswer": "Putting the tent poles together was difficult",
                "acceptedAnswers": ["Putting the tent poles together was difficult"],
                "explanation": "Đoạn văn nêu: 'At first, putting the tent poles together was difficult, but they worked as a team and finished it before sunset.'",
                "segmentId": None
            },
            {
                "id": "ex-025-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What musical instrument did Leo play around the campfire?",
                "options": ["Guitar", "Piano", "Violin", "Drums"],
                "correctAnswer": "Guitar",
                "acceptedAnswers": ["Guitar"],
                "explanation": "Đoạn văn viết: 'Leo played the acoustic guitar while Maya and Alex sang songs.'",
                "segmentId": None
            },
            {
                "id": "ex-025-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Why did they not get wet when the heavy rain began?",
                "options": [
                    "Their tent was completely waterproof",
                    "They ran to a nearby hotel",
                    "They had large umbrellas",
                    "They hid under a stone cave"
                ],
                "correctAnswer": "Their tent was completely waterproof",
                "acceptedAnswers": ["Their tent was completely waterproof"],
                "explanation": "Đoạn văn nêu: 'Luckily, their tent was completely waterproof! They stayed inside, listening to the gentle sound of raindrops...'",
                "segmentId": None
            },
            {
                "id": "ex-025-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "What animals did the friends see swimming in the lake on Sunday morning?",
                "options": ["Wild ducks", "Fish and frogs", "Swans", "Otters"],
                "correctAnswer": "Wild ducks",
                "acceptedAnswers": ["Wild ducks"],
                "explanation": "Văn bản viết: 'They saw a family of wild ducks swimming peacefully in the lake.'",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-026",
        "topicId": "top-015",
        "title": "Luyện nghe A2: Cuộc họp Công sở & Cắt giảm Ngân sách (Budget Cuts)",
        "summary": "Luyện nghe hội thoại công sở về cuộc họp đột xuất, các quy định tiết kiệm chi phí và giao tiếp giữa đồng nghiệp.",
        "level": "A2",
        "kind": "LISTENING",
        "body": "Lắng nghe cuộc trao đổi tại văn phòng khi Anna và các đồng nghiệp nhận thông báo về việc cắt giảm ngân sách hoạt động.",
        "audioUrl": "/media/cefr/cefr_a2_budget_cuts.mp3",
        "transcript": [
            {
                "id": "seg-026-01",
                "startMs": 1000,
                "endMs": 12500,
                "textEn": "Anna: Important meeting. Everyone must come. Well, back to work. Pete, did you get the email about the meeting?",
                "textVi": "Anna: Cuộc họp quan trọng. Mọi người đều phải có mặt. Chà, quay lại làm việc thôi. Pete, anh đã nhận được email về cuộc họp chưa?"
            },
            {
                "id": "seg-026-02",
                "startMs": 12500,
                "endMs": 24000,
                "textEn": "Pete: Yes, Ms. Weaver called an all-hands meeting. She said there are budget cuts happening this quarter.",
                "textVi": "Pete: Có, bà Weaver đã triệu tập một cuộc họp toàn thể. Bà ấy nói sẽ có các đợt cắt giảm ngân sách trong quý này."
            },
            {
                "id": "seg-026-03",
                "startMs": 24000,
                "endMs": 35000,
                "textEn": "Anna: Budget cuts? Does that mean our travel funds or office supplies will be reduced? Pete: We will find out at 2 PM.",
                "textVi": "Anna: Cắt giảm ngân sách ư? Có phải kinh phí công tác hay đồ dùng văn phòng sẽ bị giảm không? Pete: Chúng ta sẽ biết vào lúc 2 giờ chiều."
            }
        ],
        "sourceAttribution": "Voice of America - Let's Learn English Level 2 (Public Domain)",
        "published": True,
        "exercises": [
            {
                "id": "ex-026-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "Who called the important company meeting?",
                "options": ["Ms. Weaver", "Anna", "Pete", "The security guard"],
                "correctAnswer": "Ms. Weaver",
                "acceptedAnswers": ["Ms. Weaver"],
                "explanation": "Pete cho biết: 'Ms. Weaver called an all-hands meeting.'",
                "segmentId": "seg-026-02"
            },
            {
                "id": "ex-026-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "What is the primary topic of the meeting announced in the email?",
                "options": ["Budget cuts", "A holiday party", "Hiring new interns", "Office relocation"],
                "correctAnswer": "Budget cuts",
                "acceptedAnswers": ["Budget cuts"],
                "explanation": "Pete giải thích: 'She said there are budget cuts happening this quarter.'",
                "segmentId": "seg-026-02"
            },
            {
                "id": "ex-026-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What time will the meeting take place?",
                "options": ["2 PM", "10 AM", "12 PM", "4 PM"],
                "correctAnswer": "2 PM",
                "acceptedAnswers": ["2 PM"],
                "explanation": "Pete trả lời: 'We will find out at 2 PM.'",
                "segmentId": "seg-026-03"
            },
            {
                "id": "ex-026-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "What concern does Anna express upon hearing the news?",
                "options": [
                    "Reduction in travel funds and office supplies",
                    "Cancellation of her annual leave",
                    "Moving to a different city",
                    "Working on weekends"
                ],
                "correctAnswer": "Reduction in travel funds and office supplies",
                "acceptedAnswers": ["Reduction in travel funds and office supplies"],
                "explanation": "Anna hỏi: 'Does that mean our travel funds or office supplies will be reduced?'",
                "segmentId": "seg-026-03"
            },
            {
                "id": "ex-026-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "What does the phrase 'all-hands meeting' mean in a business environment?",
                "options": [
                    "A meeting for all employees in the organization",
                    "A physical exercise session",
                    "A meeting only for handcraft workers",
                    "A private chat between two managers"
                ],
                "correctAnswer": "A meeting for all employees in the organization",
                "acceptedAnswers": ["A meeting for all employees in the organization"],
                "explanation": "'All-hands meeting' là cuộc họp toàn thể mọi nhân viên trong công ty hoặc bộ phận.",
                "segmentId": "seg-026-02"
            }
        ]
    },

    # ==========================================
    # LEVEL B1
    # ==========================================
    {
        "id": "les-027",
        "topicId": "top-016",
        "title": "Từ vựng B1: Môi trường & Lối sống Bền vững (Ecology & Green Living)",
        "summary": "Nắm vững các thuật ngữ sinh thái học, phân loại rác, năng lượng tái tạo và thói quen bảo vệ môi trường.",
        "level": "B1",
        "kind": "VOCABULARY",
        "body": """### Từ vựng Trọng tâm B1 - Environment & Sustainability
1. **Khái niệm môi trường cốt lõi:**
   - *Biodegradable* /ˌbaɪ.əʊ.dɪˈɡreɪ.də.bəl/ (adj): Có thể phân hủy sinh học tự nhiên
   - *Renewable energy* /rɪˈnjuː.ə.bəl ˈen.ə.dʒi/: Năng lượng tái tạo (mặt trời, gió, thủy điện)
   - *Carbon footprint* /ˈkɑː.bən ˌfʊt.prɪnt/: Lượng khí thải carbon của cá nhân hoặc tổ chức
   - *Fossil fuels* /ˈfɒs.əl ˌfjuː.əlz/: Nhiên liệu hóa thạch (than đá, dầu mỏ, khí đốt)
   - *Conservation* /ˌkɒn.səˈveɪ.ʃən/: Sự bảo tồn thiên nhiên và tài nguyên

2. **Hành động & Giải pháp:**
   - *To phase out*: Từng bước loại bỏ (ví dụ: phase out single-use plastics)
   - *To cut down on*: Cắt giảm (cut down on energy consumption)
   - *Eco-friendly / Sustainable*: Thân thiện với môi trường / Bền vững
   - *Pollution & Contamination*: Ô nhiễm môi trường""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Cambridge English Vocabulary in Use (CEFR B1 Intermediate)",
        "published": True,
        "exercises": [
            {
                "id": "ex-027-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "Materials that decay naturally through bacteria without harming the planet are described as:",
                "options": ["Biodegradable", "Synthetic", "Permanent", "Artificial"],
                "correctAnswer": "Biodegradable",
                "acceptedAnswers": ["Biodegradable"],
                "explanation": "'Biodegradable' có nghĩa là phân hủy sinh học được.",
                "segmentId": None
            },
            {
                "id": "ex-027-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "Solar power and wind energy are prime examples of ________ energy.",
                "options": ["renewable", "exhaustible", "toxic", "finite"],
                "correctAnswer": "renewable",
                "acceptedAnswers": ["renewable"],
                "explanation": "Năng lượng mặt trời và gió là năng lượng tái tạo (renewable energy).",
                "segmentId": None
            },
            {
                "id": "ex-027-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "The amount of greenhouse gases produced by an individual's lifestyle is known as their carbon ________.",
                "options": ["footprint", "fingerprint", "shadow", "handprint"],
                "correctAnswer": "footprint",
                "acceptedAnswers": ["footprint"],
                "explanation": "Thuật ngữ chuẩn xác là 'carbon footprint' (dấu chân carbon).",
                "segmentId": None
            },
            {
                "id": "ex-027-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Many countries plan to ________ single-use plastic straws and bags over the next five years.",
                "options": ["phase out", "speed up", "bring along", "run out"],
                "correctAnswer": "phase out",
                "acceptedAnswers": ["phase out"],
                "explanation": "'Phase out' là cụm động từ mang nghĩa từng bước loại bỏ dần.",
                "segmentId": None
            },
            {
                "id": "ex-027-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "Coal, petroleum, and natural gas are non-renewable resources known as ________ fuels.",
                "options": ["fossil", "solar", "synthetic", "organic"],
                "correctAnswer": "fossil",
                "acceptedAnswers": ["fossil"],
                "explanation": "Than đá, dầu mỏ và khí thiên nhiên là nhiên liệu hóa thạch ('fossil fuels').",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-028",
        "topicId": "top-016",
        "title": "Ngữ pháp B1: Hiện tại Hoàn thành vs. Quá khứ Đơn (Present Perfect vs. Past Simple)",
        "summary": "Phân biệt rạch ròi giữa hành động kết thúc ở thời điểm xác định và hành động kéo dài tới hiện tại hoặc nhấn mạnh trải nghiệm.",
        "level": "B1",
        "kind": "GRAMMAR",
        "body": """### So sánh Hiện tại hoàn thành và Quá khứ đơn

| Tiêu chí | Quá khứ đơn (Past Simple) | Hiện tại hoàn thành (Present Perfect) |
| :--- | :--- | :--- |
| **Bản chất** | Đã chấm dứt hoàn toàn trong quá khứ, không còn dính dáng hiện tại. | Bắt đầu ở quá khứ kéo dài đến hiện tại, hoặc để lại kết quả ở hiện tại. |
| **Thời điểm** | Thời điểm xác định rõ ràng (*yesterday, last year, in 2010, two weeks ago*). | Không nêu thời điểm cụ thể, nhấn mạnh kinh nghiệm/kết quả (*ever, never, yet, already, so far*). |
| **Công thức** | S + V2/ed | S + have/has + V3/ed |
| **Ví dụ** | *I lived in Da Nang for two years (now I live in Hanoi).* | *I have lived in Hanoi for two years (I still live in Hanoi).* |

### Cặp từ Since và For:
- `Since` + mốc thời gian bắt đầu (*since 2018, since Monday, since I was a child*).
- `For` + khoảng thời gian kéo dài (*for five years, for two months, for ages*).""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "English Grammar in Use - Raymond Murphy (CEFR B1 Intermediate)",
        "published": True,
        "exercises": [
            {
                "id": "ex-028-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "I ________ Dr. Harrison yesterday at the medical symposium.",
                "options": ["saw", "have seen", "am seeing", "was seen"],
                "correctAnswer": "saw",
                "acceptedAnswers": ["saw"],
                "explanation": "Có mốc thời gian xác định trong quá khứ 'yesterday', dùng thì Quá khứ đơn 'saw'.",
                "segmentId": None
            },
            {
                "id": "ex-028-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "She ________ at this biotechnology company since she graduated from university in 2021.",
                "options": ["has worked", "worked", "is working", "works"],
                "correctAnswer": "has worked",
                "acceptedAnswers": ["has worked"],
                "explanation": "Hành động bắt đầu từ quá khứ và vẫn tiếp diễn tới hiện tại với 'since', dùng Hiện tại hoàn thành 'has worked'.",
                "segmentId": None
            },
            {
                "id": "ex-028-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Have you ________ ridden an electric scooter across the city?",
                "options": ["ever", "yet", "ago", "last"],
                "correctAnswer": "ever",
                "acceptedAnswers": ["ever"],
                "explanation": "Hỏi về trải nghiệm từ trước tới nay dùng 'ever' trong câu nghi vấn Hiện tại hoàn thành.",
                "segmentId": None
            },
            {
                "id": "ex-028-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "They ________ that new science fiction film last Friday night.",
                "options": ["watched", "have watched", "were watching", "watch"],
                "correctAnswer": "watched",
                "acceptedAnswers": ["watched"],
                "explanation": "'Last Friday night' là thời điểm xác định trong quá khứ nên phải chia Quá khứ đơn: 'watched'.",
                "segmentId": None
            },
            {
                "id": "ex-028-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "We haven't received the quarterly financial report ________.",
                "options": ["yet", "already", "since", "ago"],
                "correctAnswer": "yet",
                "acceptedAnswers": ["yet"],
                "explanation": "'Yet' đứng cuối câu phủ định của thì Hiện tại hoàn thành để diễn tả sự việc chưa xảy ra tính đến thời điểm hiện tại.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-029",
        "topicId": "top-016",
        "title": "Đọc hiểu B1: Cuộc cách mạng của Người du mục số (The Digital Nomad Revolution)",
        "summary": "Khảo sát hiện tượng làm việc từ xa kết hợp du lịch toàn cầu, lợi ích về sự tự do và các thách thức về pháp lý, thuế và sự cô đơn.",
        "level": "B1",
        "kind": "READING",
        "body": """### Reading Passage: The Digital Nomad Revolution

Over the past decade, rapid improvements in high-speed Wi-Fi, cloud computing, and portable laptops have transformed the traditional workplace. Millions of knowledge workers—including software developers, graphic designers, copywriters, and online tutors—no longer commute to corporate offices. Instead, they embrace the lifestyle of 'digital nomads,' working from tropical beaches, bustling cafes, and co-working spaces across Southeast Asia, Europe, and Latin America.

The appeal of this lifestyle is undeniable. Digital nomads enjoy geographic freedom, flexible work schedules, and the opportunity to immerse themselves in diverse cultures. Many also benefit from 'geo-arbitrage'—earning income in strong currencies like US dollars or euros while living in countries with lower costs of living.

However, nomadic life is not without serious challenges. Navigating complex visa regulations and international taxation requires careful planning. Reliable internet access is essential, and unexpected power outages can disrupt crucial client deadlines. Furthermore, many nomads report feelings of chronic isolation, as frequently changing locations makes it difficult to maintain deep, long-term friendships. As a result, a growing number of remote professionals now opt for 'slow travel,' staying in each destination for several months rather than moving every few weeks.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "BBC Capital & British Council LearnEnglish (CEFR B1 Reading Series)",
        "published": True,
        "exercises": [
            {
                "id": "ex-029-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What primary technological factor enabled the rise of digital nomads?",
                "options": [
                    "High-speed internet, cloud computing, and portable laptops",
                    "Cheaper international airline tickets only",
                    "The invention of automated robotic manufacturing",
                    "Free hotel accommodation provided by governments"
                ],
                "correctAnswer": "High-speed internet, cloud computing, and portable laptops",
                "acceptedAnswers": ["High-speed internet, cloud computing, and portable laptops"],
                "explanation": "Đoạn 1 nêu: 'rapid improvements in high-speed Wi-Fi, cloud computing, and portable laptops have transformed the traditional workplace.'",
                "segmentId": None
            },
            {
                "id": "ex-029-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "What does the term 'geo-arbitrage' refer to in the text?",
                "options": [
                    "Earning in stronger currencies while spending in cheaper economies",
                    "Trading international real estate properties online",
                    "Changing citizenship to avoid paying income taxes",
                    "Working for international non-governmental organizations"
                ],
                "correctAnswer": "Earning in stronger currencies while spending in cheaper economies",
                "acceptedAnswers": ["Earning in stronger currencies while spending in cheaper economies"],
                "explanation": "Đoạn 2 giải thích: 'earning income in strong currencies like US dollars or euros while living in countries with lower costs of living.'",
                "segmentId": None
            },
            {
                "id": "ex-029-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Which of the following is cited as an emotional or social challenge of nomadic life?",
                "options": [
                    "Feelings of chronic isolation and loneliness",
                    "Lack of healthy food in tropical countries",
                    "Inability to speak foreign languages",
                    "Boredom from having too much free leisure time"
                ],
                "correctAnswer": "Feelings of chronic isolation and loneliness",
                "acceptedAnswers": ["Feelings of chronic isolation and loneliness"],
                "explanation": "Đoạn 3 nhấn mạnh: 'many nomads report feelings of chronic isolation, as frequently changing locations makes it difficult to maintain deep, long-term friendships.'",
                "segmentId": None
            },
            {
                "id": "ex-029-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Why are many nomads now choosing 'slow travel'?",
                "options": [
                    "To build deeper connections and reduce frequent relocations",
                    "Because high-speed trains have become too expensive",
                    "Because airlines ban portable computers on flights",
                    "To avoid working during cold winter seasons"
                ],
                "correctAnswer": "To build deeper connections and reduce frequent relocations",
                "acceptedAnswers": ["To build deeper connections and reduce frequent relocations"],
                "explanation": "Bài viết nêu: 'remote professionals now opt for slow travel, staying in each destination for several months rather than moving every few weeks.'",
                "segmentId": None
            },
            {
                "id": "ex-029-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "Which profession is NOT mentioned in the text as a typical digital nomad job?",
                "options": [
                    "Civil engineer building local bridges",
                    "Software developer",
                    "Graphic designer",
                    "Copywriter"
                ],
                "correctAnswer": "Civil engineer building local bridges",
                "acceptedAnswers": ["Civil engineer building local bridges"],
                "explanation": "Văn bản liệt kê developers, graphic designers, copywriters, và online tutors; kỹ sư xây cầu đòi hỏi phải có mặt trực tiếp tại công trường.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-030",
        "topicId": "top-016",
        "title": "Luyện nghe B1: Trào lưu Đan len trong Rạp chiếu phim tại Châu Âu (Cinema Knitting)",
        "summary": "Luyện nghe bản tin văn hóa xã hội về sự kiện kết hợp thú vị giữa đan len thư giãn và thưởng thức điện ảnh.",
        "level": "B1",
        "kind": "LISTENING",
        "body": "Bản tin kể về gần 200 khán giả tại thủ đô Vienna (Áo) mang kim và len đến rạp chiếu bóng để cùng nhau đan lát trong khi xem phim.",
        "audioUrl": "/media/cefr/cefr_b1_knitting_culture.mp3",
        "transcript": [
            {
                "id": "seg-030-01",
                "startMs": 0,
                "endMs": 14000,
                "textEn": "Nearly 200 people in Vienna, Austria, gathered recently to enjoy two fun activities at the same time: working with needles and yarn while watching a movie together.",
                "textVi": "Gần 200 người tại Vienna, Áo, đã tập hợp gần đây để cùng tận hưởng hai hoạt động thú vị: vừa đan len vừa xem phim cùng nhau."
            },
            {
                "id": "seg-030-02",
                "startMs": 14000,
                "endMs": 28000,
                "textEn": "Knitting or crocheting while watching movies has gained popularity across Europe. Organizers say it helps people de-stress and connect socially after years of isolation.",
                "textVi": "Đan hoặc móc len khi xem phim đã trở nên phổ biến khắp châu Âu. Các nhà tổ chức cho biết hoạt động này giúp giảm căng thẳng và kết nối cộng đồng sau nhiều năm cô lập."
            },
            {
                "id": "seg-030-03",
                "startMs": 28000,
                "endMs": 45000,
                "textEn": "Special lighting is kept slightly dimmer than daylight but brighter than a standard theater, allowing attendees to see their stitches clearly while viewing the big screen.",
                "textVi": "Hệ thống chiếu sáng đặc biệt được giữ mờ hơn ánh sáng ban ngày nhưng sáng hơn rạp phim thông thường, cho phép người tham gia nhìn rõ mũi đan trong khi vẫn xem được màn ảnh lớn."
            }
        ],
        "sourceAttribution": "Voice of America - Words and Their Stories / As It Is (Public Domain)",
        "published": True,
        "exercises": [
            {
                "id": "ex-030-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "In which European city did the cinema knitting event take place?",
                "options": ["Vienna, Austria", "Berlin, Germany", "Paris, France", "Madrid, Spain"],
                "correctAnswer": "Vienna, Austria",
                "acceptedAnswers": ["Vienna, Austria"],
                "explanation": "Bản tin mở đầu: 'Nearly 200 people in Vienna, Austria, gathered recently...'",
                "segmentId": "seg-030-01"
            },
            {
                "id": "ex-030-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "Approximately how many people attended this creative cinema gathering?",
                "options": ["Nearly 200 people", "Under 50 people", "Around 500 people", "Over 1,000 people"],
                "correctAnswer": "Nearly 200 people",
                "acceptedAnswers": ["Nearly 200 people"],
                "explanation": "Con số được nêu rõ trong bài nghe: 'Nearly 200 people...'",
                "segmentId": "seg-030-01"
            },
            {
                "id": "ex-030-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "How was the theater's lighting adjusted for the audience?",
                "options": [
                    "Brighter than a standard theater to see their stitches",
                    "Completely dark like an ordinary movie screening",
                    "Flickering strobe lights",
                    "Colored neon spotlights"
                ],
                "correctAnswer": "Brighter than a standard theater to see their stitches",
                "acceptedAnswers": ["Brighter than a standard theater to see their stitches"],
                "explanation": "Đoạn nghe giải thích: 'brighter than a standard theater, allowing attendees to see their stitches clearly.'",
                "segmentId": "seg-030-03"
            },
            {
                "id": "ex-030-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "According to the organizers, what key benefit does this activity offer?",
                "options": [
                    "De-stressing and connecting socially",
                    "Selling handmade sweaters for charity",
                    "Training professional clothing manufacturers",
                    "Saving electricity at home"
                ],
                "correctAnswer": "De-stressing and connecting socially",
                "acceptedAnswers": ["De-stressing and connecting socially"],
                "explanation": "Người tổ chức cho biết: 'it helps people de-stress and connect socially.'",
                "segmentId": "seg-030-02"
            },
            {
                "id": "ex-030-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "What materials did the audience bring with them into the cinema hall?",
                "options": ["Needles and yarn", "Paintbrushes and canvas", "Laptops and headphones", "Books and notebooks"],
                "correctAnswer": "Needles and yarn",
                "acceptedAnswers": ["Needles and yarn"],
                "explanation": "Bài nghe nêu: 'working with needles and yarn while watching a movie.'",
                "segmentId": "seg-030-01"
            }
        ]
    },

    # ==========================================
    # LEVEL B2
    # ==========================================
    {
        "id": "les-031",
        "topicId": "top-017",
        "title": "Từ vựng B2: Collocations Thương mại & Phrasal Verbs Doanh nghiệp",
        "summary": "Nắm bắt các cụm từ kết hợp tự nhiên (collocations) và phrasal verbs trong đàm phán, quản trị và phân tích thị trường.",
        "level": "B2",
        "kind": "VOCABULARY",
        "body": """### Cụm từ và Thuật ngữ B2 - Business & Negotiations
1. **Business Collocations:**
   - *Reach a consensus* /rits ə kənˈsensəs/: Đạt được sự đồng thuận chung
   - *Strike a deal / Close a deal*: Ký kết / chốt thỏa thuận kinh doanh thành công
   - *Conduct market research*: Tiến hành nghiên cứu thị trường bài bản
   - *Streamline operations*: Tinh gọn quy trình vận hành doanh nghiệp
   - *Gain a competitive edge*: Giành lợi thế cạnh tranh trước đối thủ
   - *Meet tight deadlines*: Đáp ứng kịp thời hạn công việc gấp rút

2. **Phrasal Verbs Nâng cao:**
   - *Iron out* (iron out differences/details): Giải quyết ổn thỏa các bất đồng hoặc tiểu tiết
   - *Weigh up* (weigh up the pros and cons): Cân nhắc kỹ lưỡng các ưu nhược điểm
   - *Scale up* (scale up production): Mở rộng quy mô sản xuất
   - *Fall through* (the deal fell through): Kế hoạch/thương vụ bị đổ bể vào phút chót""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Oxford Collocations Dictionary & Business Benchmark B2",
        "published": True,
        "exercises": [
            {
                "id": "ex-031-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "After days of strenuous negotiations, both executive teams finally managed to ________ a consensus.",
                "options": ["reach", "arrive", "do", "touch"],
                "correctAnswer": "reach",
                "acceptedAnswers": ["reach"],
                "explanation": "Collocation chuẩn xác trong tiếng Anh là 'reach a consensus' (đạt được đồng thuận).",
                "segmentId": None
            },
            {
                "id": "ex-031-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "The startup introduced automated robotic workflows in order to ________ its assembly operations.",
                "options": ["streamline", "undermine", "deteriorate", "congest"],
                "correctAnswer": "streamline",
                "acceptedAnswers": ["streamline"],
                "explanation": "'Streamline' có nghĩa là tinh gọn hóa, tối ưu hóa quy trình.",
                "segmentId": None
            },
            {
                "id": "ex-031-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Before committing venture capital into the initiative, the board must weigh ________ all potential financial risks.",
                "options": ["up", "down", "out", "away"],
                "correctAnswer": "up",
                "acceptedAnswers": ["up"],
                "explanation": "Phrasal verb 'weigh up' có nghĩa là cân nhắc, đo lường kỹ lưỡng.",
                "segmentId": None
            },
            {
                "id": "ex-031-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Unfortunately, the multi-million dollar acquisition fell ________ at the eleventh hour due to regulatory hurdles.",
                "options": ["through", "over", "off", "back"],
                "correctAnswer": "through",
                "acceptedAnswers": ["through"],
                "explanation": "'Fall through' dùng cho các kế hoạch, thương vụ bị thất bại / đổ vỡ.",
                "segmentId": None
            },
            {
                "id": "ex-031-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "By offering superior 24/7 post-purchase support, the enterprise gained a competitive ________ over its rivals.",
                "options": ["edge", "corner", "side", "border"],
                "correctAnswer": "edge",
                "acceptedAnswers": ["edge"],
                "explanation": "Collocation 'gain a competitive edge' nghĩa là giành được lợi thế cạnh tranh.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-032",
        "topicId": "top-017",
        "title": "Ngữ pháp B2: Câu Điều kiện Loại 3 & Điều kiện Hỗn hợp (Mixed Conditionals)",
        "summary": "Nắm vững giả định trái ngược với quá khứ và cách kết hợp mệnh đề quá khứ tạo ra hệ quả ở hiện tại.",
        "level": "B2",
        "kind": "GRAMMAR",
        "body": """### 1. Câu Điều kiện Loại 3 (Third Conditional)
- **Mục đích:** Giả định một sự việc trái ngược với thực tế đã xảy ra trong quá khứ (thường dùng để bày tỏ sự nuối tiếc hoặc trách cứ).
- **Công thức:**
  - `If + S + had + V3/ed` (Quá khứ hoàn thành), `S + would / could / might + have + V3/ed`
  - *Ví dụ:* If I had studied harder, I would have passed the scholarship exam. (Thực tế: Quá khứ không học chăm nên đã trượt).

### 2. Câu Điều kiện Hỗn hợp (Mixed Conditionals)
Thường gặp nhất là dạng: **Điều kiện trong quá khứ dẫn đến kết quả ở hiện tại**.
- **Công thức:**
  - `If + S + had + V3/ed` (quá khứ), `S + would + V_inf` (hiện tại)
  - *Ví dụ:* If I had taken that plane yesterday, I would be in London right now. (Quá khứ không lên máy bay, nên hiện tại không ở London).""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Advanced Grammar in Use - Martin Hewings (CEFR B2 Reference)",
        "published": True,
        "exercises": [
            {
                "id": "ex-032-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "If the engineer ________ the alarm promptly, the generator would not have overheated.",
                "options": ["had checked", "checked", "has checked", "would check"],
                "correctAnswer": "had checked",
                "acceptedAnswers": ["had checked"],
                "explanation": "Mệnh đề If của câu điều kiện loại 3 chia thì Quá khứ hoàn thành: 'had checked'.",
                "segmentId": None
            },
            {
                "id": "ex-032-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "If we had invested in renewable solar technology ten years ago, our company ________ much more resilient today.",
                "options": ["would be", "would have been", "will be", "had been"],
                "correctAnswer": "would be",
                "acceptedAnswers": ["would be"],
                "explanation": "Câu điều kiện hỗn hợp (giả định quá khứ -> kết quả hiện tại có 'today') dùng 'would + V_inf': 'would be'.",
                "segmentId": None
            },
            {
                "id": "ex-032-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "She wouldn't have missed her international flight if she ________ stuck in morning traffic.",
                "options": ["hadn't gotten", "didn't get", "hasn't gotten", "wouldn't get"],
                "correctAnswer": "hadn't gotten",
                "acceptedAnswers": ["hadn't gotten"],
                "explanation": "Mệnh đề If điều kiện loại 3 ở thể phủ định: 'hadn't gotten'.",
                "segmentId": None
            },
            {
                "id": "ex-032-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Had they known about the impending blizzard, they ________ their hiking expedition in the Alps.",
                "options": ["would have canceled", "will cancel", "canceled", "would cancel"],
                "correctAnswer": "would have canceled",
                "acceptedAnswers": ["would have canceled"],
                "explanation": "Đảo ngữ câu điều kiện loại 3 (Had they known...), mệnh đề chính dùng 'would have + V3/ed'.",
                "segmentId": None
            },
            {
                "id": "ex-032-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "If I ________ born into a bilingual household, I wouldn't need to study French grammar so intensively right now.",
                "options": ["had been", "were", "am", "have been"],
                "correctAnswer": "had been",
                "acceptedAnswers": ["had been"],
                "explanation": "Giả định sự việc sinh ra trong quá khứ dẫn đến kết quả ở hiện tại ('right now'), mệnh đề If dùng 'had been'.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-033",
        "topicId": "top-017",
        "title": "Đọc hiểu B2: Đảo nhiệt Đô thị & Thách thức Sinh thái (Urban Heat Islands)",
        "summary": "Phân tích hiện tượng vi khí hậu đô thị, nguyên nhân từ vật liệu bê tông/nhựa đường và các giải pháp kiến trúc xanh.",
        "level": "B2",
        "kind": "READING",
        "body": """### Reading Passage: Urban Heat Islands and Microclimatic Challenges

In modern metropolises, average surface temperatures are frequently several degrees higher than those in surrounding rural landscapes—a phenomenon known climatologically as the Urban Heat Island (UHI) effect. This thermal discrepancy is primarily triggered by the widespread substitution of natural vegetation with dark, impermeable artificial surfaces such as asphalt roads, stone pavements, and concrete skyscrapers. These dense materials exhibit high thermal mass, absorbing vast quantities of solar radiation during peak daylight hours and subsequently re-radiating that thermal energy slowly into the nocturnal atmosphere.

In addition to building materials, anthropogenic heat emissions exacerbate the UHI effect. Heavy vehicular traffic, industrial machinery, and round-the-clock air conditioning units continuously discharge massive volumes of waste heat directly into street canyons. As a consequence, urban centers suffer from elevated nocturnal temperatures, deteriorated outdoor air quality, and intensified photochemical smog formation.

To alleviate this environmental stress, urban planners and architects are increasingly pioneering biophilic engineering solutions. Retrofitting flat roofs with extensive green vegetation (green roofs) facilitates natural evapotranspiration, which dramatically cools ambient air. Concurrently, deploying reflective 'cool pavements' with high solar reflectance prevents surface thermal accumulation. Integrating continuous urban forest corridors not only mitigates heat stress but also sequesters carbon dioxide and restores essential urban biodiversity.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Nature Urban Sustainability & IELTS Academic Reading Archive (CEFR B2)",
        "published": True,
        "exercises": [
            {
                "id": "ex-033-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What is the primary physical cause of the Urban Heat Island (UHI) effect described in Paragraph 1?",
                "options": [
                    "Dense artificial materials absorbing and re-radiating solar thermal energy",
                    "Geothermal volcanic activity beneath city foundations",
                    "Increased cloud cover trapping sunlight in metropolitan areas",
                    "The proximity of major urban centers to ocean coastlines"
                ],
                "correctAnswer": "Dense artificial materials absorbing and re-radiating solar thermal energy",
                "acceptedAnswers": ["Dense artificial materials absorbing and re-radiating solar thermal energy"],
                "explanation": "Đoạn 1 nêu: 'These dense materials exhibit high thermal mass, absorbing vast quantities of solar radiation... and subsequently re-radiating that thermal energy...'",
                "segmentId": None
            },
            {
                "id": "ex-033-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "Which anthropogenic source of heat emission is explicitly cited in Paragraph 2?",
                "options": [
                    "Vehicular traffic and commercial air conditioning units",
                    "Underground sewage decomposition",
                    "Excessive street lighting bulbs",
                    "Residential wood-burning fireplaces"
                ],
                "correctAnswer": "Vehicular traffic and commercial air conditioning units",
                "acceptedAnswers": ["Vehicular traffic and commercial air conditioning units"],
                "explanation": "Đoạn 2 liệt kê: 'Heavy vehicular traffic, industrial machinery, and round-the-clock air conditioning units...'",
                "segmentId": None
            },
            {
                "id": "ex-033-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "How do green roofs contribute to lowering ambient urban air temperatures?",
                "options": [
                    "Through the natural process of evapotranspiration",
                    "By blowing cool mechanical breezes downward",
                    "By reflecting 100% of cosmic ultraviolet rays",
                    "By freezing condensation into ice crystals"
                ],
                "correctAnswer": "Through the natural process of evapotranspiration",
                "acceptedAnswers": ["Through the natural process of evapotranspiration"],
                "explanation": "Đoạn 3 giải thích: 'Retrofitting flat roofs with extensive green vegetation facilitates natural evapotranspiration, which dramatically cools ambient air.'",
                "segmentId": None
            },
            {
                "id": "ex-033-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "What design property makes 'cool pavements' effective in counteracting heat buildup?",
                "options": [
                    "High solar reflectance",
                    "Low structural durability",
                    "High moisture permeability only",
                    "Dark asphalt coloration"
                ],
                "correctAnswer": "High solar reflectance",
                "acceptedAnswers": ["High solar reflectance"],
                "explanation": "Đoạn 3 khẳng định: 'deploying reflective cool pavements with high solar reflectance prevents surface thermal accumulation.'",
                "segmentId": None
            },
            {
                "id": "ex-033-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "The word 'exacerbate' in Paragraph 2 is closest in meaning to:",
                "options": ["worsen", "improve", "eliminate", "disguise"],
                "correctAnswer": "worsen",
                "acceptedAnswers": ["worsen"],
                "explanation": "'Exacerbate' có nghĩa là làm trầm trọng thêm, làm tệ đi (= worsen).",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-034",
        "topicId": "top-017",
        "title": "Luyện nghe B2: Lịch sử Hàng không - Anh em nhà Wright (The Wright Brothers)",
        "summary": "Nghe tư liệu lịch sử khoa học về phát minh máy bay có động cơ đầu tiên của Wilbur và Orville Wright vào năm 1903.",
        "level": "B2",
        "kind": "LISTENING",
        "body": "Bản tin khoa học kể về quá trình chế tạo cỗ máy bay có người lái đầu tiên trong lịch sử nhân loại tại Kitty Hawk, Bắc Carolina.",
        "audioUrl": "/media/cefr/cefr_b2_wright_brothers.mp3",
        "transcript": [
            {
                "id": "seg-034-01",
                "startMs": 0,
                "endMs": 15000,
                "textEn": "Wilbur and Orville Wright are the American inventors who made a small, wood-and-cloth machine fly in the sky more than one hundred years ago.",
                "textVi": "Wilbur và Orville Wright là hai nhà phát minh người Mỹ đã chế tạo một cỗ máy nhỏ bằng gỗ và vải bay lên bầu trời hơn một trăm năm trước."
            },
            {
                "id": "seg-034-02",
                "startMs": 15000,
                "endMs": 32000,
                "textEn": "Before their historic breakthrough on December seventeenth, nineteen-o-three, they operated a bicycle repair shop in Dayton, Ohio, where they gained mechanical expertise.",
                "textVi": "Trước đột phá lịch sử vào ngày 17 tháng 12 năm 1903, họ vận hành một xưởng sửa chữa xe đạp ở Dayton, Ohio, nơi họ tích lũy chuyên môn cơ khí."
            },
            {
                "id": "seg-034-03",
                "startMs": 32000,
                "endMs": 52000,
                "textEn": "Their initial powered flight at Kitty Hawk, North Carolina, lasted just twelve seconds and covered thirty-six meters, yet it transformed global transportation forever.",
                "textVi": "Chuyến bay có động cơ đầu tiên của họ tại Kitty Hawk, Bắc Carolina kéo dài vỏn vẹn 12 giây trên quãng đường 36 mét, nhưng đã vĩnh viễn thay đổi ngành giao thông toàn cầu."
            }
        ],
        "sourceAttribution": "Voice of America - Science & Technology History Archive (Public Domain)",
        "published": True,
        "exercises": [
            {
                "id": "ex-034-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What materials did the Wright brothers use to construct their first historic aircraft?",
                "options": ["Wood and cloth", "Steel and titanium", "Plastic and aluminum", "Stone and bronze"],
                "correctAnswer": "Wood and cloth",
                "acceptedAnswers": ["Wood and cloth"],
                "explanation": "Bài nghe nêu rõ: 'made a small, wood-and-cloth machine fly in the sky...'",
                "segmentId": "seg-034-01"
            },
            {
                "id": "ex-034-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "What kind of business did Wilbur and Orville run before venturing into aeronautics?",
                "options": ["A bicycle repair shop", "A steam locomotive factory", "A clockmaking workshop", "A chemical laboratory"],
                "correctAnswer": "A bicycle repair shop",
                "acceptedAnswers": ["A bicycle repair shop"],
                "explanation": "Đoạn 2 cho biết: 'they operated a bicycle repair shop in Dayton, Ohio.'",
                "segmentId": "seg-034-02"
            },
            {
                "id": "ex-034-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "How long did their very first powered flight last on December 17, 1903?",
                "options": ["Twelve seconds", "Two minutes", "One hour", "Thirty seconds"],
                "correctAnswer": "Twelve seconds",
                "acceptedAnswers": ["Twelve seconds"],
                "explanation": "Bài nghe xác nhận: 'lasted just twelve seconds and covered thirty-six meters.'",
                "segmentId": "seg-034-03"
            },
            {
                "id": "ex-034-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Where did the Wright brothers conduct their famous first powered flight?",
                "options": [
                    "Kitty Hawk, North Carolina",
                    "Dayton, Ohio",
                    "Washington, D.C.",
                    "Chicago, Illinois"
                ],
                "correctAnswer": "Kitty Hawk, North Carolina",
                "acceptedAnswers": ["Kitty Hawk, North Carolina"],
                "explanation": "Đoạn 3 nêu địa điểm: 'Their initial powered flight at Kitty Hawk, North Carolina...'",
                "segmentId": "seg-034-03"
            },
            {
                "id": "ex-034-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "What distance did the aircraft cover during that inaugural twelve-second flight?",
                "options": ["36 meters", "100 meters", "12 meters", "500 meters"],
                "correctAnswer": "36 meters",
                "acceptedAnswers": ["36 meters"],
                "explanation": "Đoạn nghe nêu: 'covered thirty-six meters.'",
                "segmentId": "seg-034-03"
            }
        ]
    },

    # ==========================================
    # LEVEL C1
    # ==========================================
    {
        "id": "les-035",
        "topicId": "top-018",
        "title": "Từ vựng C1: Academic Word List Bậc cao & Thuật ngữ Phản biện",
        "summary": "Làm chủ các từ vựng học thuật cao cấp dùng trong luận văn, bài nghiên cứu và báo cáo khoa học quốc tế.",
        "level": "C1",
        "kind": "VOCABULARY",
        "body": """### Danh mục Từ vựng C1 - Academic Word List (High Tier)
1. **Thuật ngữ Học thuật & Nghiên cứu:**
   - *Corroborate* /kəˈrɒb.ə.reɪt/ (v): Đưa ra bằng chứng củng cố / xác thực một giả thuyết (*corroborate an empirical hypothesis*).
   - *Elucidate* /iˈluː.sɪ.deɪt/ (v): Làm sáng tỏ một vấn đề phức tạp (*elucidate the underlying mechanisms*).
   - *Ubiquitous* /juːˈbɪk.wɪ.təs/ (adj): Có mặt ở khắp mọi nơi, phổ biến rộng rãi (*ubiquitous computing*).
   - *Paradigm* /ˈpær.ə.daɪm/ (n): Mô hình, hệ hình tư duy chuẩn mực (*a fundamental paradigm shift*).
   - *Inadvertent* /ˌɪn.ədˈvɜː.tənt/ (adj): Vô tình, không cố ý (*an inadvertent oversight*).
   - *Untenable* /ʌnˈten.ə.bəl/ (adj): Không thể bảo vệ hoặc duy trì được trước các phản biện (*an untenable theoretical stance*).

2. **Cụm liên kết học thuật:**
   - *To call into question*: Đặt dấu hỏi nghi vấn về tính xác thực
   - *Bear little resemblance to*: Hầu như không có điểm tương đồng với
   - *Pave the way for*: Mở đường cho những đột phá mới""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Coxhead Academic Word List (Sublist 1-3) & Cambridge English C1 Advanced",
        "published": True,
        "exercises": [
            {
                "id": "ex-035-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "Subsequent genetic sequencing was able to ________ the controversial paleontology hypothesis proposed in 2020.",
                "options": ["corroborate", "deteriorate", "confiscate", "alleviate"],
                "correctAnswer": "corroborate",
                "acceptedAnswers": ["corroborate"],
                "explanation": "'Corroborate' có nghĩa là xác thực, cung cấp bằng chứng củng cố giả thuyết.",
                "segmentId": None
            },
            {
                "id": "ex-035-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "The keynote speaker utilized comprehensive three-dimensional graphs to ________ the intricate mathematical model.",
                "options": ["elucidate", "obfuscate", "truncate", "fabricate"],
                "correctAnswer": "elucidate",
                "acceptedAnswers": ["elucidate"],
                "explanation": "'Elucidate' nghĩa là giải thích rõ ràng, làm sáng tỏ một vấn đề phức tạp.",
                "segmentId": None
            },
            {
                "id": "ex-035-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Smartphones and wireless algorithmic sensors have become truly ________ across twenty-first century life.",
                "options": ["ubiquitous", "fleeting", "obsolete", "scant"],
                "correctAnswer": "ubiquitous",
                "acceptedAnswers": ["ubiquitous"],
                "explanation": "'Ubiquitous' mang nghĩa xuất hiện khắp nơi, phổ biến rộng khắp.",
                "segmentId": None
            },
            {
                "id": "ex-035-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "In the face of incontrovertible empirical counter-evidence, the professor's original stance became completely ________.",
                "options": ["untenable", "resilient", "imperative", "lucrative"],
                "correctAnswer": "untenable",
                "acceptedAnswers": ["untenable"],
                "explanation": "'Untenable' dùng để chỉ một quan điểm hoặc lập trường không thể bảo vệ/giữ vững được nữa.",
                "segmentId": None
            },
            {
                "id": "ex-035-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "The revolutionary discovery of CRISPR-Cas9 represented a monumental ________ shift in modern biological engineering.",
                "options": ["paradigm", "paradox", "parable", "perimeter"],
                "correctAnswer": "paradigm",
                "acceptedAnswers": ["paradigm"],
                "explanation": "Cụm danh từ học thuật nổi tiếng: 'paradigm shift' (sự thay đổi hệ hình/mô thức tư duy).",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-036",
        "topicId": "top-018",
        "title": "Ngữ pháp C1: Đảo ngữ Nâng cao với Trạng từ Phủ định (Advanced Inversion)",
        "summary": "Nắm vững kỹ thuật đảo trợ động từ lên trước chủ ngữ khi các cụm từ phủ định hoặc giới hạn đứng đầu câu để tạo sắc thái trang trọng.",
        "level": "C1",
        "kind": "GRAMMAR",
        "body": """### Ngữ pháp Đảo ngữ Nâng cao (Inversion with Negative Adverbials)

Khi các trạng từ mang ý nghĩa phủ định hoặc hạn chế đứng đầu câu, trật tự câu được đảo: **Trạng từ + Trợ động từ + S + V(chính)**.

1. **Nhóm 'Vừa mới... thì...' (Scarcely / Hardly / No sooner):**
   - *Hardly had S + V3/ed + when + S + V(quá khứ đơn)*
   - *No sooner had S + V3/ed + than + S + V(quá khứ đơn)*
   - *Ví dụ:* No sooner had the symposium begun than the fire alarm sounded.

2. **Nhóm 'Trong bất kỳ hoàn cảnh nào cũng không...' (Under no circumstances / On no account):**
   - *Under no circumstances should you disclose confidential laboratory passwords.*
   - *On no account must this radioactive material be left unattended.*

3. **Nhóm 'Không chỉ... mà còn...' (Not only... but also):**
   - *Not only did the team surpass their publication target, but they also secured vital international funding.*

4. **Nhóm 'Chỉ khi / Chỉ sau khi...' (Only when / Only after):**
   - *Only after the audit was concluded did the board comprehend the full extent of the shortfall.*""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Cambridge Certificate in Advanced English (CAE) Grammar Handbook",
        "published": True,
        "exercises": [
            {
                "id": "ex-036-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "No sooner ________ the laboratory than the power grid experienced a total blackout.",
                "options": [
                    "had we entered",
                    "we had entered",
                    "did we enter",
                    "have we entered"
                ],
                "correctAnswer": "had we entered",
                "acceptedAnswers": ["had we entered"],
                "explanation": "Cấu trúc đảo ngữ 'No sooner had + S + V3/ed... than...': 'had we entered'.",
                "segmentId": None
            },
            {
                "id": "ex-036-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "Under no circumstances ________ employees disclose proprietary client algorithms to external auditors.",
                "options": ["should", "they should", "that should", "are to be"],
                "correctAnswer": "should",
                "acceptedAnswers": ["should"],
                "explanation": "Đứng đầu bởi 'Under no circumstances' đòi hỏi đảo trợ động từ 'should' lên trước chủ ngữ 'employees'.",
                "segmentId": None
            },
            {
                "id": "ex-036-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Seldom ________ such an extraordinary convergence of astrophysical phenomena within a single solar cycle.",
                "options": [
                    "have astronomers witnessed",
                    "astronomers have witnessed",
                    "witnessed astronomers",
                    "astronomers witnessing"
                ],
                "correctAnswer": "have astronomers witnessed",
                "acceptedAnswers": ["have astronomers witnessed"],
                "explanation": "Trạng từ bán phủ định 'Seldom' đứng đầu câu đòi hỏi đảo trợ động từ: 'have astronomers witnessed'.",
                "segmentId": None
            },
            {
                "id": "ex-036-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Only after months of rigorous peer-review ________ the scientific consensus accept the paradigm shift.",
                "options": ["did", "was", "has", "had"],
                "correctAnswer": "did",
                "acceptedAnswers": ["did"],
                "explanation": "Cấu trúc 'Only after...' đảo trợ động từ ở mệnh đề chính: 'did the scientific consensus accept...'.",
                "segmentId": None
            },
            {
                "id": "ex-036-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "Not only ________ the mathematical paradox, but she also formulated a novel proof.",
                "options": [
                    "did she resolve",
                    "she resolved",
                    "she had resolved",
                    "resolved she"
                ],
                "correctAnswer": "did she resolve",
                "acceptedAnswers": ["did she resolve"],
                "explanation": "Đảo ngữ 'Not only did she resolve..., but she also...'.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-037",
        "topicId": "top-018",
        "title": "Đọc hiểu C1: Thiên kiến Nhận thức & Quyết định Thuật toán (Algorithmic Bias)",
        "summary": "Bài đọc học thuật phân tích cơ chế học máy, sự truyền thừa thiên kiến xã hội vào mạng nơ-ron và các biện pháp giảm thiểu rủi ro.",
        "level": "C1",
        "kind": "READING",
        "body": """### Reading Passage: Cognitive Biases and Algorithmic Decision-Making

As artificial intelligence models are increasingly entrusted with high-stakes decisions—from judicial bail calculations and mortgage approvals to medical diagnostics—an enduring misconception persists that automated mathematical systems are inherently objective. However, algorithmic frameworks do not operate in a vacuum. Instead, their predictive architectures reflect, reinforce, and occasionally magnify the latent historical prejudices embedded in the massive training datasets curated by human developers.

This phenomenon, commonly characterized as algorithmic bias, manifests predominantly through two pathways: sampling skew and label bias. When historical training data disproportionately underrepresents vulnerable minority demographics, machine learning classifiers inevitably exhibit degraded predictive fidelity for those cohorts. Similarly, if historical lending decisions reflected socio-economic discrimination, an optimization algorithm trained on repayment histories will conflate systemic disadvantage with intrinsic credit risk, thereby perpetuating disenfranchisement under the guise of statistical optimization.

Addressing this ethical dilemma requires far more than superficial algorithmic tweaks. Computer scientists and sociologists advocate for rigorous algorithmic audits conducted by independent supervisory bodies. Furthermore, techniques such as adversarial debiasing—wherein secondary networks deliberately penalize models for utilizing sensitive demographic attributes—offer promising avenues to decouple predictive accuracy from historical inequities. Without systemic accountability, artificial intelligence risks transforming past human prejudices into permanent automated realities.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Harvard Data Science Review & Cambridge C1 Reading Anthology",
        "published": True,
        "exercises": [
            {
                "id": "ex-037-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "According to Paragraph 1, what popular misconception regarding automated algorithms does the author challenge?",
                "options": [
                    "That automated systems possess inherent mathematical objectivity",
                    "That neural networks process data too slowly for judicial use",
                    "That computer models cost more than human decision-makers",
                    "That artificial intelligence cannot be applied to medical diagnosis"
                ],
                "correctAnswer": "That automated systems possess inherent mathematical objectivity",
                "acceptedAnswers": ["That automated systems possess inherent mathematical objectivity"],
                "explanation": "Đoạn 1 nêu: 'an enduring misconception persists that automated mathematical systems are inherently objective.'",
                "segmentId": None
            },
            {
                "id": "ex-037-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "How does 'sampling skew' in training data impact algorithmic outputs for minority demographics?",
                "options": [
                    "It leads to degraded predictive fidelity for underrepresented cohorts",
                    "It accelerates training speed exponentially",
                    "It ensures equitable treatment across all population groups",
                    "It eliminates the need for human supervision"
                ],
                "correctAnswer": "It leads to degraded predictive fidelity for underrepresented cohorts",
                "acceptedAnswers": ["It leads to degraded predictive fidelity for underrepresented cohorts"],
                "explanation": "Đoạn 2 nêu rõ: 'machine learning classifiers inevitably exhibit degraded predictive fidelity for those cohorts.'",
                "segmentId": None
            },
            {
                "id": "ex-037-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "The author argues that without corrective measures, algorithms trained on historical lending data will:",
                "options": [
                    "Conflate systemic disadvantage with intrinsic credit risk",
                    "Provide free credit to disadvantaged applicants",
                    "Eliminate mortgage interest rates across banks",
                    "Refuse to store historical borrower records"
                ],
                "correctAnswer": "Conflate systemic disadvantage with intrinsic credit risk",
                "acceptedAnswers": ["Conflate systemic disadvantage with intrinsic credit risk"],
                "explanation": "Đoạn 2 viết: 'will conflate systemic disadvantage with intrinsic credit risk, thereby perpetuating disenfranchisement...'",
                "segmentId": None
            },
            {
                "id": "ex-037-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "What does the technical method of 'adversarial debiasing' involve?",
                "options": [
                    "Using secondary networks to penalize reliance on sensitive attributes",
                    "Deleting half of all collected training records randomly",
                    "Replacing neural networks with manual paper spreadsheets",
                    "Forbidding the use of graphics processing units"
                ],
                "correctAnswer": "Using secondary networks to penalize reliance on sensitive attributes",
                "acceptedAnswers": ["Using secondary networks to penalize reliance on sensitive attributes"],
                "explanation": "Đoạn 3 mô tả: 'wherein secondary networks deliberately penalize models for utilizing sensitive demographic attributes...'",
                "segmentId": None
            },
            {
                "id": "ex-037-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "The word 'latent' in Paragraph 1 is closest in meaning to:",
                "options": ["hidden or unexpressed", "obvious and blatant", "destructive", "temporary"],
                "correctAnswer": "hidden or unexpressed",
                "acceptedAnswers": ["hidden or unexpressed"],
                "explanation": "'Latent' có nghĩa là tiềm tàng, ẩn giấu bên dưới bề mặt (= hidden or unexpressed).",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-038",
        "topicId": "top-018",
        "title": "Luyện nghe C1: Phòng thủ Trái Đất trước Nguy cơ Thiên Thạch (Asteroid Defense)",
        "summary": "Nghe chuyên đề vật lý thiên văn về các phương án làm chệch hướng tiểu hành tinh: va chạm động năng (DART), lực hấp dẫn và công nghệ laser.",
        "level": "C1",
        "kind": "LISTENING",
        "body": "Bản tin học thuật phân tích các phương pháp khoa học vũ trụ nhằm bảo vệ Trái Đất trước các vật thể không gian gần Trái Đất (NEOs).",
        "audioUrl": "/media/cefr/cefr_c1_asteroid_defense.mp3",
        "transcript": [
            {
                "id": "seg-038-01",
                "startMs": 0,
                "endMs": 17000,
                "textEn": "Astronomers following asteroid activity in deep space estimate there is a very small probability of a major celestial collision, yet planetary defense teams are actively developing mitigation strategies.",
                "textVi": "Các nhà thiên văn học theo dõi tiểu hành tinh ước tính khả năng va chạm lớn là rất nhỏ, tuy nhiên các đội phòng thủ hành tinh vẫn đang tích cực phát triển các chiến lược ngăn chặn."
            },
            {
                "id": "seg-038-02",
                "startMs": 17000,
                "endMs": 35000,
                "textEn": "The most mature deflection method demonstrated to date is the kinetic impactor technique, exemplified by NASA's DART mission, which intentionally crashed a spacecraft into an asteroid to alter its orbital period.",
                "textVi": "Phương pháp làm chệch hướng hoàn thiện nhất từng được chứng minh là kỹ thuật va chạm động năng, điển hình qua sứ mệnh DART của NASA khi chủ động đâm tàu vũ trụ để thay đổi chu kỳ quỹ đạo."
            },
            {
                "id": "seg-038-03",
                "startMs": 35000,
                "endMs": 55000,
                "textEn": "For longer warning lead times, researchers are exploring gravity tractors—massive probes flying alongside hazardous space rocks to gently alter their trajectories over decades through mutual gravitational pull.",
                "textVi": "Với thời gian cảnh báo sớm dài hơn, các nhà nghiên cứu đang khám phá máy kéo trọng lực—các tàu thăm dò bay song song để nhẹ nhàng làm đổi quỹ đạo qua lực hút hấp dẫn tương hỗ trong nhiều thập kỷ."
            }
        ],
        "sourceAttribution": "Voice of America - Science Report & NASA Planetary Defense Coordination (Public Domain)",
        "published": True,
        "exercises": [
            {
                "id": "ex-038-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What technique did NASA's landmark DART mission successfully demonstrate?",
                "options": [
                    "Kinetic impactor deflection",
                    "Nuclear thermal detonation",
                    "Solar sail towing",
                    "Laser vaporization of ice"
                ],
                "correctAnswer": "Kinetic impactor deflection",
                "acceptedAnswers": ["Kinetic impactor deflection"],
                "explanation": "Đoạn 2 nêu rõ: 'The most mature deflection method demonstrated to date is the kinetic impactor technique, exemplified by NASA's DART mission...'",
                "segmentId": "seg-038-02"
            },
            {
                "id": "ex-038-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "How does a 'gravity tractor' alter an asteroid's trajectory over time?",
                "options": [
                    "Through mutual gravitational pull by flying alongside it",
                    "By drilling deep explosive charges into its core",
                    "By spraying reflective white paint over its surface",
                    "By tethering the asteroid directly to the Moon"
                ],
                "correctAnswer": "Through mutual gravitational pull by flying alongside it",
                "acceptedAnswers": ["Through mutual gravitational pull by flying alongside it"],
                "explanation": "Đoạn 3 giải thích: 'massive probes flying alongside hazardous space rocks to gently alter their trajectories over decades through mutual gravitational pull.'",
                "segmentId": "seg-038-03"
            },
            {
                "id": "ex-038-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Under what condition is the gravity tractor method deemed most effective by scientists?",
                "options": [
                    "When there are extended warning lead times over decades",
                    "When the asteroid is less than 24 hours from Earth impact",
                    "Only when the asteroid is made entirely of liquid ice",
                    "During a total solar eclipse"
                ],
                "correctAnswer": "When there are extended warning lead times over decades",
                "acceptedAnswers": ["When there are extended warning lead times over decades"],
                "explanation": "Đoạn 3 nhấn mạnh: 'For longer warning lead times... alter their trajectories over decades...'",
                "segmentId": "seg-038-03"
            },
            {
                "id": "ex-038-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "What was the immediate physical consequence of the DART spacecraft collision on the target asteroid?",
                "options": [
                    "It altered the asteroid's orbital period",
                    "It split the asteroid into thousands of equal fragments",
                    "It completely disintegrated the space rock into vapor",
                    "It caused the asteroid to enter Earth's atmosphere"
                ],
                "correctAnswer": "It altered the asteroid's orbital period",
                "acceptedAnswers": ["It altered the asteroid's orbital period"],
                "explanation": "Đoạn 2 nêu: 'intentionally crashed a spacecraft into an asteroid to alter its orbital period.'",
                "segmentId": "seg-038-02"
            },
            {
                "id": "ex-038-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "The term 'mitigation strategies' in planetary defense refers to:",
                "options": [
                    "Plans designed to reduce or prevent the catastrophic impact of hazards",
                    "Commercial mining missions to extract rare minerals",
                    "Astronomical stargazing festivals for the public",
                    "Space tourism packages for international travelers"
                ],
                "correctAnswer": "Plans designed to reduce or prevent the catastrophic impact of hazards",
                "acceptedAnswers": ["Plans designed to reduce or prevent the catastrophic impact of hazards"],
                "explanation": "'Mitigation strategies' là các chiến lược giảm thiểu rủi ro và ngăn ngừa tác hại nguy hiểm.",
                "segmentId": "seg-038-01"
            }
        ]
    },

    # ==========================================
    # LEVEL C2
    # ==========================================
    {
        "id": "les-039",
        "topicId": "top-019",
        "title": "Từ vựng C2: Sắc thái Tinh tế & Thành ngữ Văn chương (Mastery of Nuance)",
        "summary": "Làm chủ những từ ngữ đắt giá nhất trong văn phong học thuật, triết học và thành ngữ có tính ẩn dụ sâu sắc.",
        "level": "C2",
        "kind": "VOCABULARY",
        "body": """### Từ vựng Tinh hoa C2 - Nuance & Literary Mastery
1. **Thuật ngữ Sắc thái Cao cấp:**
   - *Perspicacious* /ˌpɜː.spɪˈkeɪ.ʃəs/ (adj): Sáng suốt, có cái nhìn thấu suốt bản chất sự việc (*a perspicacious critique*).
   - *Juxtapose* /ˌdʒʌk.stəˈpəʊz/ (v): Đặt hai sự vật/khái niệm tương phản cạnh nhau để làm nổi bật sự khác biệt.
   - *Inchoate* /ɪnˈkəʊ.eɪt/ (adj): Mới manh nha, còn sơ khai chưa định hình rõ ràng (*an inchoate philosophical movement*).
   - *Esoteric* /ˌes.əˈter.ɪk/ (adj): Uyên thâm, bí truyền, chỉ số ít chuyên gia hiểu được (*esoteric semantic theory*).
   - *Equivocal* /ɪˈkwɪv.ə.kəl/ (adj): Nước đôi, mập mờ, có thể hiểu theo nhiều nghĩa đối lập.

2. **Thành ngữ Văn hóa & Triết lý:**
   - *A double-edged sword*: Con dao hai lưỡi (vừa có lợi vừa tiềm ẩn hiểm họa lớn).
   - *A Catch-22 situation*: Tình thế tiến thoái lưỡng nan vô lý, điều kiện này cản trở điều kiện kia.
   - *Pyrrhic victory*: Chiến thắng phải trả giá quá đắt đến mức tương đương thất bại.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Oxford English Dictionary & Cambridge C2 Proficiency (CPE) Lexicon",
        "published": True,
        "exercises": [
            {
                "id": "ex-039-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "The literary critic offered an exceptionally ________ analysis that immediately penetrated to the subtext of the novel.",
                "options": ["perspicacious", "inchoate", "obtuse", "rudimentary"],
                "correctAnswer": "perspicacious",
                "acceptedAnswers": ["perspicacious"],
                "explanation": "'Perspicacious' mang nghĩa có óc thấu thị, cực kỳ sâu sắc và sáng suốt.",
                "segmentId": None
            },
            {
                "id": "ex-039-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "In the museum exhibition, modern abstract sculptures were ________ with ancient classical pottery to accentuate aesthetic contrast.",
                "options": ["juxtaposed", "disassembled", "coerced", "confounded"],
                "correctAnswer": "juxtaposed",
                "acceptedAnswers": ["juxtaposed"],
                "explanation": "'Juxtapose' nghĩa là đặt cạnh nhau để đối chiếu và làm nổi bật sự tương phản.",
                "segmentId": None
            },
            {
                "id": "ex-039-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Requiring two years of job experience to get an entry-level position that offers experience is the quintessential ________.",
                "options": ["Catch-22", "Pyrrhic victory", "Achilles' heel", "Pandora's box"],
                "correctAnswer": "Catch-22",
                "acceptedAnswers": ["Catch-22"],
                "explanation": "'Catch-22' chỉ tình thế trớ trêu, nghịch lý và tiến thoái lưỡng nan.",
                "segmentId": None
            },
            {
                "id": "ex-039-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "The spokesman delivered an intentionally ________ statement that could be interpreted in several contradictory ways.",
                "options": ["equivocal", "unequivocal", "lucid", "transparent"],
                "correctAnswer": "equivocal",
                "acceptedAnswers": ["equivocal"],
                "explanation": "'Equivocal' có nghĩa là mập mờ, nước đôi, đa nghĩa gây khó hiểu.",
                "segmentId": None
            },
            {
                "id": "ex-039-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "Although the empire won the military campaign, the catastrophic casualties rendered it a costly ________ victory.",
                "options": ["Pyrrhic", "Trojan", "Spartan", "Platonic"],
                "correctAnswer": "Pyrrhic",
                "acceptedAnswers": ["Pyrrhic"],
                "explanation": "'Pyrrhic victory' là thành ngữ chỉ một chiến thắng phải trả cái giá quá đắt khôn hàn.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-040",
        "topicId": "top-019",
        "title": "Ngữ pháp C2: Câu chẻ Phức hợp & Cấu trúc Phân từ Lơ lửng (Cleft & Dangling Modifiers)",
        "summary": "Thao tác thuần thục câu chẻ nhấn mạnh (It-cleft, Wh-cleft, All-cleft), kỹ thuật tỉnh lược (ellipsis) và sửa lỗi phân từ độc lập.",
        "level": "C2",
        "kind": "GRAMMAR",
        "body": """### Cấu trúc Ngữ pháp Bậc cao C2 - Cleft Sentences & Advanced Syntax

1. **Câu chẻ (Cleft Sentences) để chuyển dịch tiêu điểm thông tin:**
   - **It-cleft:** `It + be + [yếu tố nhấn mạnh] + that/who + [mệnh đề]`
     * *It was not until the manuscript was deciphered that the truth came to light.*
   - **Wh-cleft (Pseudo-cleft):** `What S + V + is/was + [yếu tố nhấn mạnh]`
     * *What the epistemological community seeks to establish is a universal baseline.*
   - **All-cleft / The only thing:**
     * *All that remains to be scrutinized is the author's metaphysical presupposition.*

2. **Đảo ngữ Giả định Điều kiện không dùng If (Inverted Subjunctive):**
   - *Were it not for his timely intervention, the corporation would have disintegrated.* (= If it were not for...)
   - *Had it not been for the statistical anomalies, the null hypothesis would have been upheld.*

3. **Hiện tượng Ngữ pháp Lược bỏ (Ellipsis & Substitution):**
   - Giản lược mệnh đề mà không làm mất tính toàn vẹn của cấu trúc câu trang trọng.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "The Cambridge Grammar of the English Language (Huddleston & Pullum)",
        "published": True,
        "exercises": [
            {
                "id": "ex-040-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "It was not until the treaty ________ that hostilities along the border genuinely subsided.",
                "options": [
                    "was officially ratified",
                    "had been ratified officially",
                    "would be ratified",
                    "ratifies"
                ],
                "correctAnswer": "was officially ratified",
                "acceptedAnswers": ["was officially ratified"],
                "explanation": "Cấu trúc It-cleft chỉ thời điểm: 'It was not until... that...'.",
                "segmentId": None
            },
            {
                "id": "ex-040-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "________ it not been for the whistleblower's testimony, the systemic accounting fraud would never have been exposed.",
                "options": ["Had", "Were", "Should", "If"],
                "correctAnswer": "Had",
                "acceptedAnswers": ["Had"],
                "explanation": "Đảo ngữ câu điều kiện loại 3 không có 'If': 'Had it not been for...'.",
                "segmentId": None
            },
            {
                "id": "ex-040-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What the linguistic team struggled to comprehend ________ why the dialect preserved such archaic case inflections.",
                "options": ["was", "were", "are", "have been"],
                "correctAnswer": "was",
                "acceptedAnswers": ["was"],
                "explanation": "Wh-cleft clause làm chủ ngữ số ít đi với động từ to be quá khứ 'was'.",
                "segmentId": None
            },
            {
                "id": "ex-040-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "Were the board to approve the radical restructuring, substantial capital ________ required immediately.",
                "options": ["would be", "will be", "had been", "is"],
                "correctAnswer": "would be",
                "acceptedAnswers": ["would be"],
                "explanation": "Đảo ngữ câu điều kiện loại 2 tương lai 'Were S to V, S + would + V_inf'.",
                "segmentId": None
            },
            {
                "id": "ex-040-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "All ________ is to reconcile the divergent data sets collected during the longitudinal trial.",
                "options": [
                    "that remains to be accomplished",
                    "what remains accomplishing",
                    "which remain to accomplish",
                    "of it remaining"
                ],
                "correctAnswer": "that remains to be accomplished",
                "acceptedAnswers": ["that remains to be accomplished"],
                "explanation": "Cấu trúc All-cleft: 'All that remains to be [V3/ed] is to [V_inf]'.",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-041",
        "topicId": "top-019",
        "title": "Đọc hiểu C2: Triết học Ngôn ngữ - Thuyết Tương đối Ngôn ngữ học (Sapir-Whorf)",
        "summary": "Chuyên khảo hàn lâm về mối quan hệ giữa cấu trúc cú pháp, hệ thống từ vựng và phương thức tư duy nhận thức của con người.",
        "level": "C2",
        "kind": "READING",
        "body": """### Reading Passage: Linguistic Relativity and Cognitive Epistemology

The proposition that the structural idiosyncrasies of a language actively delineate and constrain the cognitive faculties of its speakers—a thesis popularized as the Sapir-Whorf hypothesis or linguistic relativity—has stimulated fierce academic dispute across cognitive science, anthropology, and linguistic philosophy. In its unyielding, deterministic incarnation (linguistic determinism), the hypothesis posits that human thought is inexorably trapped within the grammatical categories and lexical contours of one's native tongue. Under this strict paradigm, concepts absent from a lexicon remain conceptually inaccessible to its linguistic community.

However, subsequent experimental psycholinguistics has largely dismantled this absolutist stance. While empirical research demonstrates that speakers of languages with nuanced spatial coordinates (such as absolute geocentric navigation systems utilizing cardinal directions rather than egocentric left-right orientations) cultivate heightened cognitive vigilance regarding spatial awareness, these distinctions signify cognitive predisposition rather than intellectual incarceration. The human brain retains remarkable plasticity, continuously transcending maternal lexical boundaries through metaphorical abstraction, loanword integration, and poetic re-articulation.

Consequently, modern cognitive linguistics advances a nuanced, neo-Whorfian consensus. Language does not strictly imprison thought; rather, it functions as a habitual lens, nudging attention toward specific perceptual features—such as evidentiality, temporal aspect, or material composition. Thus, while syntax does not preclude the contemplation of novel realities, it subtly orchestrates the cognitive pathways through which subjective experience is processed, categorized, and recalled.""",
        "audioUrl": None,
        "transcript": [],
        "sourceAttribution": "Oxford Studies in the Philosophy of Language & Cambridge C2 Proficiency Collection",
        "published": True,
        "exercises": [
            {
                "id": "ex-041-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "What does the extreme 'linguistic determinism' version of the Sapir-Whorf hypothesis posit?",
                "options": [
                    "Human thought is inexorably trapped within native grammatical and lexical contours",
                    "Language is merely an accidental byproduct of biological vocal cords",
                    "All world languages share an identical universal deep syntax structure",
                    "Thought can only occur during vocalized external speech"
                ],
                "correctAnswer": "Human thought is inexorably trapped within native grammatical and lexical contours",
                "acceptedAnswers": ["Human thought is inexorably trapped within native grammatical and lexical contours"],
                "explanation": "Đoạn 1 nêu: 'posits that human thought is inexorably trapped within the grammatical categories and lexical contours of one's native tongue.'",
                "segmentId": None
            },
            {
                "id": "ex-041-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "How has contemporary experimental psycholinguistics evaluated the absolutist deterministic stance?",
                "options": [
                    "It has largely dismantled the absolutist claim of intellectual incarceration",
                    "It has fully validated and codified deterministic theory as natural law",
                    "It has declared that syntax has zero impact on spatial orientation",
                    "It has abandoned all research into cognitive linguistic relativity"
                ],
                "correctAnswer": "It has largely dismantled the absolutist claim of intellectual incarceration",
                "acceptedAnswers": ["It has largely dismantled the absolutist claim of intellectual incarceration"],
                "explanation": "Đoạn 2 nêu: 'subsequent experimental psycholinguistics has largely dismantled this absolutist stance... signify cognitive predisposition rather than intellectual incarceration.'",
                "segmentId": None
            },
            {
                "id": "ex-041-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "What evidence is cited in Paragraph 2 to illustrate that human thought can transcend maternal lexical constraints?",
                "options": [
                    "Metaphorical abstraction, loanword integration, and cognitive plasticity",
                    "The mandatory adoption of artificial computer programming languages",
                    "Surgical modification of the auditory cortex",
                    "The complete loss of native grammatical memory during travel"
                ],
                "correctAnswer": "Metaphorical abstraction, loanword integration, and cognitive plasticity",
                "acceptedAnswers": ["Metaphorical abstraction, loanword integration, and cognitive plasticity"],
                "explanation": "Đoạn 2 khẳng định: 'continuously transcending maternal lexical boundaries through metaphorical abstraction, loanword integration, and poetic re-articulation.'",
                "segmentId": None
            },
            {
                "id": "ex-041-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "According to the contemporary 'neo-Whorfian' perspective in Paragraph 3, language acts primarily as:",
                "options": [
                    "A habitual lens that nudges cognitive attention toward specific perceptual features",
                    "An impenetrable prison prohibiting abstract scientific deduction",
                    "A negligible social decorative tool without mental consequence",
                    "A genetic blueprint determined before embryonic conception"
                ],
                "correctAnswer": "A habitual lens that nudges cognitive attention toward specific perceptual features",
                "acceptedAnswers": ["A habitual lens that nudges cognitive attention toward specific perceptual features"],
                "explanation": "Đoạn 3 phân tích: 'it functions as a habitual lens, nudging attention toward specific perceptual features...'",
                "segmentId": None
            },
            {
                "id": "ex-041-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "The word 'preclude' in the concluding sentence is closest in meaning to:",
                "options": ["prevent", "facilitate", "encourage", "illuminate"],
                "correctAnswer": "prevent",
                "acceptedAnswers": ["prevent"],
                "explanation": "'Preclude' có nghĩa là ngăn chặn, loại trừ (= prevent).",
                "segmentId": None
            }
        ]
    },
    {
        "id": "les-042",
        "topicId": "top-019",
        "title": "Luyện nghe C2: Nguồn gốc Ngôn ngữ & Hình thái học Căn tố (Indo-European Roots)",
        "summary": "Nghe chuyên khảo từ nguyên học về sự tiến hóa của ngữ hệ Ấn-Âu, quy tắc chuyển dịch âm Grimm và cấu trúc hình thái học phức hợp.",
        "level": "C2",
        "kind": "LISTENING",
        "body": "Bài nghe nghiên cứu học thuật về lịch sử hình thái học căn tố (etymology & morphology), nguồn gốc từ vựng tiếng Anh hiện đại từ gốc Proto-Indo-European (PIE).",
        "audioUrl": "/media/cefr/cefr_c2_etymology_linguistics.mp3",
        "transcript": [
            {
                "id": "seg-042-01",
                "startMs": 0,
                "endMs": 18000,
                "textEn": "When English language learners examine the intricate architecture of modern vocabulary, discovering foundational root words derived from Latin, Greek, and Proto-Indo-European unlocks profound linguistic comprehension.",
                "textVi": "Khi người học tiếng Anh nghiên cứu cấu trúc tinh vi của từ vựng hiện đại, việc khám phá các căn tố nền tảng bắt nguồn từ tiếng Latinh, Hy Lạp và Ấn-Âu nguyên thủy sẽ mở ra khả năng hiểu sâu sắc về mặt ngôn ngữ."
            },
            {
                "id": "seg-042-02",
                "startMs": 18000,
                "endMs": 38000,
                "textEn": "Morphological analysis demonstrates how compounding prefixes and suffixes to a single ancient root—such as 'spect' meaning to look—yields diverse conceptual iterations ranging from introspection to retrospective and circumspect.",
                "textVi": "Phân tích hình thái học cho thấy cách ghép tiền tố và hậu tố vào một căn tố cổ duy nhất—chẳng hạn như 'spect' nghĩa là nhìn—tạo ra nhiều biến thể ý niệm đa dạng từ nội quan, hồi tưởng cho đến thận trọng."
            },
            {
                "id": "seg-042-03",
                "startMs": 38000,
                "endMs": 60000,
                "textEn": "By mastering these historical morphological paradigms, scholars cultivate the cognitive capacity to decipher esoteric academic texts and articulate complex nuances with supreme lexical precision.",
                "textVi": "Bằng cách tinh thông các mô thức hình thái học lịch sử này, các học giả phát triển năng lực nhận thức để giải mã các văn bản học thuật uyên thâm và diễn đạt các sắc thái phức tạp với độ chuẩn xác từ vựng tối cao."
            }
        ],
        "sourceAttribution": "Voice of America - Education Report & Oxford Etymology Archive (Public Domain)",
        "published": True,
        "exercises": [
            {
                "id": "ex-042-01",
                "kind": "SINGLE_CHOICE",
                "prompt": "According to the lecture, from which classical origins are foundational English root words predominantly derived?",
                "options": [
                    "Latin, Greek, and Proto-Indo-European",
                    "Sumerian and ancient Mayan dialects",
                    "Medieval Japanese and Celtic folklore",
                    "Modern Australian and Hawaiian pidgin"
                ],
                "correctAnswer": "Latin, Greek, and Proto-Indo-European",
                "acceptedAnswers": ["Latin, Greek, and Proto-Indo-European"],
                "explanation": "Đoạn 1 nêu rõ: 'foundational root words derived from Latin, Greek, and Proto-Indo-European...'",
                "segmentId": "seg-042-01"
            },
            {
                "id": "ex-042-02",
                "kind": "SINGLE_CHOICE",
                "prompt": "What core visual meaning is associated with the ancient root 'spect' cited in the audio?",
                "options": ["To look or observe", "To run quickly", "To build foundations", "To break apart"],
                "correctAnswer": "To look or observe",
                "acceptedAnswers": ["To look or observe"],
                "explanation": "Đoạn 2 nêu định nghĩa: 'such as spect meaning to look...'",
                "segmentId": "seg-042-02"
            },
            {
                "id": "ex-042-03",
                "kind": "SINGLE_CHOICE",
                "prompt": "Which group of derived words shares the root 'spect' in morphological analysis?",
                "options": [
                    "Introspection, retrospective, and circumspect",
                    "Auditory, inaudible, and audience",
                    "Chronology, synchronous, and chronic",
                    "Benevolent, benefactor, and benediction"
                ],
                "correctAnswer": "Introspection, retrospective, and circumspect",
                "acceptedAnswers": ["Introspection, retrospective, and circumspect"],
                "explanation": "Đoạn 2 liệt kê chính xác 3 từ: 'introspection to retrospective and circumspect.'",
                "segmentId": "seg-042-02"
            },
            {
                "id": "ex-042-04",
                "kind": "SINGLE_CHOICE",
                "prompt": "What academic benefit is cultivated by mastering historical morphological paradigms?",
                "options": [
                    "Deciphering esoteric academic texts with supreme precision",
                    "Passing driving tests in foreign countries",
                    "Memorizing mathematical formulas without proof",
                    "Designing computer microchips"
                ],
                "correctAnswer": "Deciphering esoteric academic texts with supreme precision",
                "acceptedAnswers": ["Deciphering esoteric academic texts with supreme precision"],
                "explanation": "Đoạn 3 khẳng định: 'cultivate the cognitive capacity to decipher esoteric academic texts and articulate complex nuances with supreme lexical precision.'",
                "segmentId": "seg-042-03"
            },
            {
                "id": "ex-042-05",
                "kind": "SINGLE_CHOICE",
                "prompt": "The word 'circumspect' derived from 'circum' (around) and 'spect' (look) literally means:",
                "options": [
                    "Carefully looking around before acting; cautious",
                    "Looking backwards into memories",
                    "Looking into one's own internal mental state",
                    "Overlooking or ignoring an error"
                ],
                "correctAnswer": "Carefully looking around before acting; cautious",
                "acceptedAnswers": ["Carefully looking around before acting; cautious"],
                "explanation": "'Circumspect' nghĩa đen là nhìn quanh quất bốn phía, nghĩa bóng là thận trọng, dè dặt trước khi hành động.",
                "segmentId": "seg-042-02"
            }
        ]
    }
]

batch_data = {
    "batchId": "batch_003",
    "topics": topics,
    "lessons": lessons
}

# Validation
print(f"Validating batch_003 data...")
print(f"Total topics: {len(topics)}")
print(f"Total lessons: {len(lessons)}")

total_exercises = 0
for l in lessons:
    total_exercises += len(l["exercises"])
    assert l["kind"] in ["VOCABULARY", "GRAMMAR", "READING", "LISTENING"], f"Invalid kind: {l['kind']}"
    assert l["level"] in ["A1", "A2", "B1", "B2", "C1", "C2"], f"Invalid level: {l['level']}"
    if l["kind"] == "LISTENING":
        assert l["audioUrl"] is not None and l["audioUrl"].startswith("/media/"), f"Listening lesson {l['id']} lacks audioUrl"
        assert len(l["transcript"]) > 0, f"Listening lesson {l['id']} lacks transcript"
        for s in l["transcript"]:
            assert s["endMs"] > s["startMs"], f"Segment timing error in {l['id']}"
    for ex in l["exercises"]:
        assert ex["correctAnswer"] in ex["options"], f"Exercise {ex['id']} correctAnswer not in options!"
        assert ex["prompt"] and len(ex["prompt"]) > 5, f"Exercise {ex['id']} empty prompt"

print(f"Total exercises: {total_exercises}")

# Write to destination
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(batch_data, f, ensure_ascii=False, indent=2)

print(f"[SUCCESS] Wrote batch_003.json to {OUTPUT_PATH}")
