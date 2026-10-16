#!/usr/bin/env python3
"""
update_grade6_curriculum.py - Extract and integrate authentic exercises from:
1. SGK Tiếng Anh 6 Tập 1 - Global Success (Unit 2: My House)
2. SGK Tiếng Anh 6 Tập 2 - Global Success (Unit 7: Television)

Updates:
- mockData.ts (lessons and vocabulary)
- data/catalog/ (courses.json, units.json, lessons.json)
- data/normalized/ (activities.jsonl, vocabulary.jsonl)
- data/sources/source-registry.json
"""

import os
import sys
import json
import re
import hashlib
from datetime import datetime

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MOCK_FILE = os.path.join(ROOT_DIR, "english-learning-platform", "src", "lib", "mockData.ts")
CATALOG_DIR = os.path.join(ROOT_DIR, "data", "catalog")
NORM_DIR = os.path.join(ROOT_DIR, "data", "normalized")
SOURCES_DIR = os.path.join(ROOT_DIR, "data", "sources")
NOW_ISO = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

def hash_content(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

# --- UNIT 2: MY HOUSE (SGK Tiếng Anh 6 Tập 1, pp. 16-25) ---
G6_U2_LESSONS = [
    {
        "id": "g6-u2-les-01",
        "skill": "reading",
        "unitId": "unit-g6-u2",
        "unitTitle": "Unit 2: My House",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Reading: A Room at the Crazy House Hotel, Da Lat",
        "description": "Đọc email của Nick gửi cho Phong và Mi miêu tả khách sạn Kỳ Dị (Crazy House Hotel) ở Đà Lạt và phòng Con Hổ.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 22)",
        "questions": [
            {
                "id": "g6-u2-r-q1",
                "type": "multiple_choice",
                "prompt": "Who is Nick in Da Lat with?",
                "passage": "Hi Phong and Mi,\n\nHow are you? I'm in Da Lat with my parents. We're staying at the Crazy House Hotel. Wow! It really is crazy.\n\nThere are ten rooms in the hotel. There's a Kangaroo Room, an Eagle Room, and even an Ant Room. I'm staying in the Tiger Room because there's a big tiger on the wall.\n\nThe tiger is between the bathroom door and the window. The bed is next to the window, but the window is a strange shape. I put my bag under the bed. There's a lamp, a wardrobe and a desk.\n\nYou should stay here when you visit Da Lat. It's great.\n\nSee you soon!\nNick",
                "options": [
                    {"id": "A", "text": "With his classmates"},
                    {"id": "B", "text": "With his parents"},
                    {"id": "C", "text": "With his teacher"},
                    {"id": "D", "text": "With his grandparents"}
                ],
                "correctAnswer": "B",
                "hint": "Check the second line of Nick's email: 'I'm in Da Lat with...'",
                "explanation": "Trong đoạn 1, Nick viết: 'I'm in Da Lat with my parents.' (Tôi đang ở Đà Lạt cùng với bố mẹ). Đáp án đúng là B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-r-q2",
                "type": "multiple_choice",
                "prompt": "How many rooms are there in the Crazy House Hotel?",
                "passage": "There are ten rooms in the hotel. There's a Kangaroo Room, an Eagle Room, and even an Ant Room. I'm staying in the Tiger Room because there's a big tiger on the wall.",
                "options": [
                    {"id": "A", "text": "Five rooms"},
                    {"id": "B", "text": "Eight rooms"},
                    {"id": "C", "text": "Ten rooms"},
                    {"id": "D", "text": "Twelve rooms"}
                ],
                "correctAnswer": "C",
                "hint": "Look for the sentence starting with 'There are... rooms in the hotel.'",
                "explanation": "Đoạn 2 nêu rõ: 'There are ten rooms in the hotel.' (Có 10 phòng trong khách sạn). Do đó chọn đáp án C.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            },
            {
                "id": "g6-u2-r-q3",
                "type": "multiple_choice",
                "prompt": "Why is the room called the Tiger Room?",
                "passage": "I'm staying in the Tiger Room because there's a big tiger on the wall.",
                "options": [
                    {"id": "A", "text": "Because there is a live tiger in the garden."},
                    {"id": "B", "text": "Because there is a big tiger on the wall."},
                    {"id": "C", "text": "Because it looks like a tiger cage."},
                    {"id": "D", "text": "Because tigers are Nick's favourite animals."}
                ],
                "correctAnswer": "B",
                "hint": "Find the reason after 'because there's...'",
                "explanation": "Nick giải thích: 'I'm staying in the Tiger Room because there's a big tiger on the wall.' (vì có một con hổ lớn trên tường). Đáp án B đúng.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-r-q4",
                "type": "multiple_choice",
                "prompt": "Where did Nick put his bag?",
                "passage": "The tiger is between the bathroom door and the window. The bed is next to the window, but the window is a strange shape. I put my bag under the bed. There's a lamp, a wardrobe and a desk.",
                "options": [
                    {"id": "A", "text": "On the desk"},
                    {"id": "B", "text": "In the wardrobe"},
                    {"id": "C", "text": "Under the bed"},
                    {"id": "D", "text": "Next to the bathroom door"}
                ],
                "correctAnswer": "C",
                "hint": "Look for 'I put my bag...'",
                "explanation": "Trong đoạn 3: 'I put my bag under the bed.' (Tôi để túi xách ở dưới gầm giường). Chọn C.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            },
            {
                "id": "g6-u2-r-q5",
                "type": "multiple_choice",
                "prompt": "Which of the following items is NOT in the Tiger Room?",
                "passage": "There's a lamp, a wardrobe and a desk.",
                "options": [
                    {"id": "A", "text": "A desk"},
                    {"id": "B", "text": "A wardrobe"},
                    {"id": "C", "text": "A cooker"},
                    {"id": "D", "text": "A lamp"}
                ],
                "correctAnswer": "C",
                "hint": "Check the list of furniture in the Tiger Room.",
                "explanation": "Nick liệt kê đồ đạc gồm 'a lamp, a wardrobe and a desk'. Bếp nấu (a cooker) không có trong phòng khách sạn này. Đáp án C đúng.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            }
        ]
    },
    {
        "id": "g6-u2-les-02",
        "skill": "listening",
        "unitId": "unit-g6-u2",
        "unitTitle": "Unit 2: My House",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Listening: Mai's Town House in Da Nang",
        "description": "Nghe đoạn giới thiệu của bạn Mai về ngôi nhà phố ở Đà Nẵng, số lượng phòng và đồ đạc trong phòng ngủ.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 23)",
        "questions": [
            {
                "id": "g6-u2-l-q1",
                "type": "multiple_choice",
                "prompt": "How many people are there in Mai's family?",
                "audioUrl": "/audio/g6-u2-mai-house.mp3",
                "passage": "[Audio Transcript]\nHello, I'm Mai. I live in a town house in Da Nang with my family.\nThere are four people in my family: my parents, my younger brother, and me.\nOur house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.\nThe living room is on the first floor, next to the kitchen.\nMy bedroom is on the second floor. It is small but very cosy.\nThere is a bed, a study desk, a chair, and a wardrobe in my bedroom.\nOn the wall, there is a big picture of my family, but there is no clock.\nI love my bedroom the most because I can do my homework and listen to music there after school.",
                "options": [
                    {"id": "A", "text": "Three people"},
                    {"id": "B", "text": "Four people"},
                    {"id": "C", "text": "Five people"},
                    {"id": "D", "text": "Six people"}
                ],
                "correctAnswer": "B",
                "hint": "Nghe câu: 'There are... people in my family: my parents, my younger brother, and me.'",
                "explanation": "Mai nói: 'There are four people in my family: my parents, my younger brother, and me.' (Bố mẹ, em trai và Mai = 4 người). Chọn B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-l-q2",
                "type": "multiple_choice",
                "prompt": "Where is the living room located in Mai's house?",
                "audioUrl": "/audio/g6-u2-mai-house.mp3",
                "passage": "The living room is on the first floor, next to the kitchen.",
                "options": [
                    {"id": "A", "text": "On the first floor, next to the kitchen"},
                    {"id": "B", "text": "On the second floor, next to her bedroom"},
                    {"id": "C", "text": "In the attic"},
                    {"id": "D", "text": "Behind the garden"}
                ],
                "correctAnswer": "A",
                "hint": "Nghe vị trí tầng và phòng bên cạnh: 'on the first floor, next to...'",
                "explanation": "Trong bài nghe: 'The living room is on the first floor, next to the kitchen.' Đáp án A chính xác.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u2-l-q3",
                "type": "multiple_choice",
                "prompt": "How many rooms are there in Mai's house in total?",
                "audioUrl": "/audio/g6-u2-mai-house.mp3",
                "passage": "Our house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.",
                "options": [
                    {"id": "A", "text": "Five rooms"},
                    {"id": "B", "text": "Six rooms"},
                    {"id": "C", "text": "Seven rooms"},
                    {"id": "D", "text": "Eight rooms"}
                ],
                "correctAnswer": "B",
                "hint": "Nghe câu: 'Our house has... rooms.'",
                "explanation": "Mai nói rõ: 'Our house has six rooms: a living room, a kitchen, three bedrooms, and two bathrooms.' Tổng cộng là 6 phòng (six rooms). Chọn B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-l-q4",
                "type": "multiple_choice",
                "prompt": "What is on the wall of Mai's bedroom?",
                "audioUrl": "/audio/g6-u2-mai-house.mp3",
                "passage": "On the wall, there is a big picture of my family, but there is no clock.",
                "options": [
                    {"id": "A", "text": "A round wall clock"},
                    {"id": "B", "text": "A big picture of her family"},
                    {"id": "C", "text": "A television set"},
                    {"id": "D", "text": "A bookshelf"}
                ],
                "correctAnswer": "B",
                "hint": "Nghe kĩ câu: 'there is a big picture... but there is no clock.'",
                "explanation": "Mai chia sẻ: 'On the wall, there is a big picture of my family, but there is no clock.' Vì vậy trên tường có một bức ảnh lớn của gia đình. Chọn B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-l-q5",
                "type": "multiple_choice",
                "prompt": "What does Mai often do in her bedroom after school?",
                "audioUrl": "/audio/g6-u2-mai-house.mp3",
                "passage": "I love my bedroom the most because I can do my homework and listen to music there after school.",
                "options": [
                    {"id": "A", "text": "She plays video games with her brother."},
                    {"id": "B", "text": "She cooks dinner with her mother."},
                    {"id": "C", "text": "She does her homework and listens to music."},
                    {"id": "D", "text": "She watches movies on television."}
                ],
                "correctAnswer": "C",
                "hint": "Nghe câu cuối về lý do Mai thích phòng ngủ.",
                "explanation": "Mai nói: 'I can do my homework and listen to music there after school.' Do đó đáp án C chính xác.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            }
        ]
    },
    {
        "id": "g6-u2-les-03",
        "skill": "grammar",
        "unitId": "unit-g6-u2",
        "unitTitle": "Unit 2: My House",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Grammar: Possessive Case ('s) & Prepositions of Place",
        "description": "Luyện tập ngữ pháp trọng tâm Unit 2: Sở hữu cách danh từ ('s), giới từ chỉ nơi chốn (between, next to, under, behind) và phát âm /s/ - /z/.",
        "durationMinutes": 12,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 18-20, 24)",
        "questions": [
            {
                "id": "g6-u2-g-q1",
                "type": "multiple_choice",
                "prompt": "Choose the correct possessive form: 'This is my _______ desk.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "sister"},
                    {"id": "B", "text": "sister's"},
                    {"id": "C", "text": "sisters'"},
                    {"id": "D", "text": "sister is"}
                ],
                "correctAnswer": "B",
                "hint": "Cấu trúc sở hữu cách sau danh từ số ít: N + 's + N.",
                "explanation": "Quy tắc ngữ pháp Unit 2: Dùng 's sau tên riêng hoặc danh từ số ít để chỉ quyền sở hữu. Ở đây là bàn của chị gái ('sister's desk').",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-g-q2",
                "type": "multiple_choice",
                "prompt": "Choose the correct sentence with the possessive case:",
                "passage": None,
                "options": [
                    {"id": "A", "text": "My cousin's dad is my uncle."},
                    {"id": "B", "text": "My cousins dad is my uncle."},
                    {"id": "C", "text": "My cousin dad is my uncle."},
                    {"id": "D", "text": "My cousins's dad is my uncle."}
                ],
                "correctAnswer": "A",
                "hint": "Danh từ số ít 'cousin' khi thêm sở hữu cách sẽ có dạng như thế nào?",
                "explanation": "Cấu trúc sở hữu cách cho 'cousin' là 'cousin's dad' (bố của anh em họ tôi). Đáp án A chính xác.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u2-g-q3",
                "type": "multiple_choice",
                "prompt": "Preposition of place: 'Look at the picture on page 19: The cat is sitting _______ the lamp and the armchair.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "in"},
                    {"id": "B", "text": "between"},
                    {"id": "C", "text": "behind"},
                    {"id": "D", "text": "under"}
                ],
                "correctAnswer": "B",
                "hint": "Khi một vật nằm ở khoảng giữa hai vật ('the lamp and the armchair'), ta dùng giới từ nào?",
                "explanation": "Giới từ 'between... and...' có nghĩa là ở giữa hai đối tượng. Ở đây con mèo ngồi ở giữa đèn và ghế bành nên chọn 'between'.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u2-g-q4",
                "type": "multiple_choice",
                "prompt": "Preposition of place: 'The dog is sleeping _______ the comfortable armchair.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "next to"},
                    {"id": "B", "text": "between"},
                    {"id": "C", "text": "among"},
                    {"id": "D", "text": "through"}
                ],
                "correctAnswer": "A",
                "hint": "Chọn giới từ có nghĩa là 'ở bên cạnh'.",
                "explanation": "'next to' mang nghĩa là bên cạnh ('next to the comfortable armchair'). Chọn A.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u2-g-q5",
                "type": "multiple_choice",
                "prompt": "Pronunciation: Choose the word whose final 's' is pronounced as /z/:",
                "passage": None,
                "options": [
                    {"id": "A", "text": "lamps (/s/)"},
                    {"id": "B", "text": "sinks (/s/)"},
                    {"id": "C", "text": "flats (/s/)"},
                    {"id": "D", "text": "cupboards (/z/)"}
                ],
                "correctAnswer": "D",
                "hint": "Âm đuôi 'd' là âm hữu thanh nên khi thêm 's' sẽ phát âm là /z/.",
                "explanation": "Quy tắc phát âm đuôi 's' trong Unit 2: lamps (/p/ + s = /s/), sinks (/k/ + s = /s/), flats (/t/ + s = /s/). Riêng cupboards kết thúc bằng phụ âm hữu thanh /d/ nên đuôi 's' phát âm là /z/ (/ˈkʌbədz/). Do đó chọn D.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "D"
            }
        ]
    },
    {
        "id": "g6-u2-les-04",
        "skill": "writing",
        "unitId": "unit-g6-u2",
        "unitTitle": "Unit 2: My House",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Writing: Describing Your House & Favourite Room",
        "description": "Thực hành sắp xếp câu hoàn chỉnh và viết email 40-50 từ miêu tả ngôi nhà cho bạn qua thư.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 23)",
        "questions": [
            {
                "id": "g6-u2-w-q1",
                "type": "writing",
                "prompt": "Rearrange the given words to make a complete sentence: 'next / The / to / living room / the / is / kitchen / .'",
                "passage": None,
                "options": None,
                "correctAnswer": "The living room is next to the kitchen.",
                "hint": "Cấu trúc khẳng định: Chủ ngữ (The living room) + Động từ to be (is) + Cụm giới từ (next to the kitchen).",
                "explanation": "Trật tự từ đúng trong câu là: 'The living room is next to the kitchen.' (Phòng khách ở bên cạnh nhà bếp).",
                "difficulty": "A1",
                "score": 2.0,
                "answer": "The living room is next to the kitchen."
            },
            {
                "id": "g6-u2-w-q2",
                "type": "writing",
                "prompt": "Write an email (40 - 50 words) to your pen friend Mira describing your house and your favourite room. Answer: 1. Where do you live? 2. How many rooms are there? 3. Which room do you like the best and why?",
                "passage": None,
                "options": None,
                "correctAnswer": "Dear Mira, Thanks for your email. I live in a town house in Hanoi with my family. My house has five rooms: a living room, a kitchen, two bedrooms, and a bathroom. My favourite room is my bedroom because it is quiet and comfortable. What about your house? Best, Nam.",
                "hint": "Bắt đầu bằng 'Dear Mira,', trả lời 3 câu hỏi gợi ý và kết thư bằng 'Best, [Tên của bạn]'.",
                "explanation": "Tiêu chí chấm: 1. Đủ bố cục email thân mật (chào hỏi, nội dung, chào tạm biệt). 2. Độ dài 40-50 từ. 3. Sử dụng đúng từ vựng Unit 2 (town house, bedrooms, comfortable). 4. Đúng thì hiện tại đơn.",
                "difficulty": "A1",
                "score": 3.0,
                "answer": "Dear Mira, Thanks for your email. I live in a town house in Hanoi with my family. My house has five rooms: a living room, a kitchen, two bedrooms, and a bathroom. My favourite room is my bedroom because it is quiet and comfortable. What about your house? Best, Nam."
            }
        ]
    },
    {
        "id": "g6-u2-les-05",
        "skill": "speaking",
        "unitId": "unit-g6-u2",
        "unitTitle": "Unit 2: My House",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Speaking: Presenting Your Dream House",
        "description": "Luyện nói miêu tả ngôi nhà hoặc căn phòng mơ ước của em (1-2 phút) có ghi âm và AI chấm điểm.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 1 - Global Success Unit 2 (NXB Giáo Dục Việt Nam & Pearson, tr. 22 & 25)",
        "questions": [
            {
                "id": "g6-u2-s-q1",
                "type": "speaking",
                "prompt": "Talk about your dream house or room (1-2 minutes). Guiding questions:\n1. Where is your dream house (in the city, country, or by the sea)?\n2. What rooms and special furniture does it have?\n3. Why do you like it?\n[Click Record and speak clearly in English]",
                "passage": None,
                "options": None,
                "correctAnswer": "Hello everyone, today I want to talk about my dream house. My dream house is a villa by the sea in Da Nang. It has six large rooms: a modern living room, a bright kitchen, three comfortable bedrooms, and a big balcony. In my bedroom, there is a soft bed next to a large window overlooking the ocean, and a smart bookshelf. I love this house because it is peaceful and full of fresh air. Thank you for listening.",
                "hint": "Chuẩn bị trong 30 giây. Sử dụng các mẫu câu: 'My dream house is a...', 'It has... rooms', 'In my room, there is... next to...'",
                "explanation": "Tiêu chí AI & Giáo viên đánh giá: 1. Phát âm rõ ràng các âm /s/ và /z/. 2. Trôi chảy, tự nhiên. 3. Sử dụng đúng cấu trúc There is/There are và giới từ chỉ vị trí (by, next to, in). 4. Trả lời đầy đủ 3 ý gợi ý.",
                "difficulty": "A1",
                "score": 5.0,
                "answer": "Hello everyone, today I want to talk about my dream house. My dream house is a villa by the sea in Da Nang. It has six large rooms: a modern living room, a bright kitchen, three comfortable bedrooms, and a big balcony. In my bedroom, there is a soft bed next to a large window overlooking the ocean, and a smart bookshelf. I love this house because it is peaceful and full of fresh air. Thank you for listening."
            }
        ]
    }
]

# --- UNIT 7: TELEVISION (SGK Tiếng Anh 6 Tập 2, pp. 6-15) ---
G6_U7_LESSONS = [
    {
        "id": "g6-u7-les-01",
        "skill": "reading",
        "unitId": "unit-g6-u7",
        "unitTitle": "Unit 7: Television",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Reading: TV Guide & Programme Schedule",
        "description": "Đọc bảng lịch phát sóng truyền hình (TV Guide) và trả lời các câu hỏi về thời gian, thể loại chương trình.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 12)",
        "questions": [
            {
                "id": "g6-u7-r-q1",
                "type": "multiple_choice",
                "prompt": "What is shown in the Wildlife programme at 8.00?",
                "passage": "TV GUIDE TODAY:\n• 8.00 - Wildlife: Cuc Phuong Forest (Watch the colourful world of plants, flowers, and animals in their real life.)\n• 9.00 - Comedy: The Fox Teacher (Have a lot of fun with a fox teacher and his students on their first day at school.)\n• 10.30 - Sports: The Pig Race (Watch the cute pigs compete in the most exciting races. Who wins?)\n• 11.00 - Game show: Children are Always Right (Join this game show today and try to answer interesting questions about pets.)\n• 12.15 - Science: The Dolphins (Watch funny and interesting clips of intelligent dolphins in their natural life - the sea.)",
                "options": [
                    {"id": "A", "text": "Funny clips about dolphins in the sea"},
                    {"id": "B", "text": "The colourful world of plants, flowers, and animals in Cuc Phuong Forest"},
                    {"id": "C", "text": "A race between cute little pigs"},
                    {"id": "D", "text": "A comedy show about school students"}
                ],
                "correctAnswer": "B",
                "hint": "Check the programme description at 8.00 in the TV Guide.",
                "explanation": "Mục 8.00 ghi: 'Watch the colourful world of plants, flowers, and animals in their real life' ở rừng Cúc Phương. Đáp án B đúng.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u7-r-q2",
                "type": "multiple_choice",
                "prompt": "Which programme should Bob watch if he likes shows that make him laugh?",
                "passage": "• 9.00 - Comedy: The Fox Teacher (Have a lot of fun with a fox teacher and his students on their first day at school.)",
                "options": [
                    {"id": "A", "text": "Wildlife: Cuc Phuong Forest"},
                    {"id": "B", "text": "Comedy: The Fox Teacher"},
                    {"id": "C", "text": "Science: The Dolphins"},
                    {"id": "D", "text": "Game show: Children are Always Right"}
                ],
                "correctAnswer": "B",
                "hint": "Look for the programme categorized as 'Comedy' (phim hài).",
                "explanation": "'Comedy: The Fox Teacher' là chương trình hài kịch ('Have a lot of fun...'), giúp khán giả cười thư giãn. Chọn B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u7-r-q3",
                "type": "multiple_choice",
                "prompt": "What time is the Sports programme broadcast?",
                "passage": "• 10.30 - Sports: The Pig Race (Watch the cute pigs compete in the most exciting races. Who wins?)",
                "options": [
                    {"id": "A", "text": "At 8.00"},
                    {"id": "B", "text": "At 9.00"},
                    {"id": "C", "text": "At 10.30"},
                    {"id": "D", "text": "At 11.00"}
                ],
                "correctAnswer": "C",
                "hint": "Find 'Sports: The Pig Race' in the time column.",
                "explanation": "Chương trình thể thao 'Sports: The Pig Race' phát sóng lúc 10.30. Chọn C.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            },
            {
                "id": "g6-u7-r-q4",
                "type": "multiple_choice",
                "prompt": "Phong wants to know more about dogs and cats. Which programme is best for him?",
                "passage": "• 11.00 - Game show: Children are Always Right (Join this game show today and try to answer interesting questions about pets.)",
                "options": [
                    {"id": "A", "text": "Game show: Children are Always Right"},
                    {"id": "B", "text": "Comedy: The Fox Teacher"},
                    {"id": "C", "text": "Wildlife: Cuc Phuong Forest"},
                    {"id": "D", "text": "Sports: The Pig Race"}
                ],
                "correctAnswer": "A",
                "hint": "Which programme features questions about 'pets' (thú cưng như chó, mèo)?",
                "explanation": "Game show 'Children are Always Right' lúc 11.00 có nội dung: 'answer interesting questions about pets' (chó mèo là thú cưng - pets). Chọn A.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u7-r-q5",
                "type": "multiple_choice",
                "prompt": "What is the main subject of the Science programme at 12.15?",
                "passage": "• 12.15 - Science: The Dolphins (Watch funny and interesting clips of intelligent dolphins in their natural life - the sea.)",
                "options": [
                    {"id": "A", "text": "Flowers and trees in natural forests"},
                    {"id": "B", "text": "Intelligent dolphins in their natural sea life"},
                    {"id": "C", "text": "School children participating in singing contests"},
                    {"id": "D", "text": "Famous athletes in international matches"}
                ],
                "correctAnswer": "B",
                "hint": "Check the programme title and description at 12.15.",
                "explanation": "Chương trình Science lúc 12.15 nói về cá heo thông minh: 'intelligent dolphins in their natural life - the sea'. Đáp án B chính xác.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            }
        ]
    },
    {
        "id": "g6-u7-les-02",
        "skill": "listening",
        "unitId": "unit-g6-u7",
        "unitTitle": "Unit 7: Television",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Listening: Evening TV Guide & Channels",
        "description": "Nghe bản tin giới thiệu các kênh và chương trình truyền hình buổi tối (Green Summer, My Childhood, Harry Potter, English and Fun).",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 13)",
        "questions": [
            {
                "id": "g6-u7-l-q1",
                "type": "multiple_choice",
                "prompt": "Which channel broadcasts the music programme 'Green Summer'?",
                "audioUrl": "/audio/g6-u7-tv-programmes.mp3",
                "passage": "[Audio Transcript]\nWelcome to What's On Today! Here are some great TV programmes for you this evening.\nFirst, on Channel 1 at seven o'clock, we have Green Summer. It is a fantastic music programme with songs performed by famous young singers.\nNext, on Channel 2 at eight o'clock, don't miss the movie My Childhood. It is a touching story about a lovely girl and her faithful dog in a peaceful village.\nIf you love magic and adventure, tune in to Channel 3 at eight thirty for Harry Potter. Children and teenagers all over the world love this magical movie series.\nFinally, on Channel 1 at five o'clock tomorrow afternoon, watch English and Fun. This educational programme helps you learn English vocabulary and songs. Enjoy your viewing!",
                "options": [
                    {"id": "A", "text": "Channel 1"},
                    {"id": "B", "text": "Channel 2"},
                    {"id": "C", "text": "Channel 3"},
                    {"id": "D", "text": "Channel 7"}
                ],
                "correctAnswer": "A",
                "hint": "Nghe câu: 'First, on Channel... at seven o'clock, we have Green Summer.'",
                "explanation": "Người dẫn chương trình nói rõ: 'First, on Channel 1 at seven o'clock, we have Green Summer.' Do đó phát sóng trên Kênh 1 (Channel 1).",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u7-l-q2",
                "type": "multiple_choice",
                "prompt": "What is the movie 'My Childhood' on Channel 2 about?",
                "audioUrl": "/audio/g6-u7-tv-programmes.mp3",
                "passage": "Next, on Channel 2 at eight o'clock, don't miss the movie My Childhood. It is a touching story about a lovely girl and her faithful dog in a peaceful village.",
                "options": [
                    {"id": "A", "text": "A school of magic for young wizards"},
                    {"id": "B", "text": "A lovely girl and her faithful dog"},
                    {"id": "C", "text": "An exciting football tournament"},
                    {"id": "D", "text": "Wild dolphins living in the sea"}
                ],
                "correctAnswer": "B",
                "hint": "Nghe nội dung sau 'It is a touching story about...'",
                "explanation": "Bài nghe mô tả: 'It is a touching story about a lovely girl and her faithful dog in a peaceful village.' Chọn B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u7-l-q3",
                "type": "multiple_choice",
                "prompt": "At what time can viewers watch the film 'Harry Potter' on Channel 3?",
                "audioUrl": "/audio/g6-u7-tv-programmes.mp3",
                "passage": "If you love magic and adventure, tune in to Channel 3 at eight thirty for Harry Potter.",
                "options": [
                    {"id": "A", "text": "At 7:00"},
                    {"id": "B", "text": "At 8:00"},
                    {"id": "C", "text": "At 8:30"},
                    {"id": "D", "text": "At 5:00"}
                ],
                "correctAnswer": "C",
                "hint": "Nghe mốc thời gian: 'tune in to Channel 3 at...'",
                "explanation": "Trong bài nghe: 'tune in to Channel 3 at eight thirty for Harry Potter' (8:30). Đáp án C đúng.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            },
            {
                "id": "g6-u7-l-q4",
                "type": "multiple_choice",
                "prompt": "What type of programme is 'English and Fun'?",
                "audioUrl": "/audio/g6-u7-tv-programmes.mp3",
                "passage": "Finally, on Channel 1 at five o'clock tomorrow afternoon, watch English and Fun. This educational programme helps you learn English vocabulary and songs.",
                "options": [
                    {"id": "A", "text": "A sports competition"},
                    {"id": "B", "text": "A comedy show for adults"},
                    {"id": "C", "text": "An educational programme for learning English"},
                    {"id": "D", "text": "A horror movie"}
                ],
                "correctAnswer": "C",
                "hint": "Nghe cụm từ 'This educational programme helps you learn...'",
                "explanation": "Bài nghe nêu: 'This educational programme helps you learn English vocabulary and songs.' Do đó đây là chương trình giáo dục tiếng Anh. Chọn C.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            }
        ]
    },
    {
        "id": "g6-u7-les-03",
        "skill": "grammar",
        "unitId": "unit-g6-u7",
        "unitTitle": "Unit 7: Television",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Grammar & Vocab: Wh-Questions & Conjunctions (and, but, so)",
        "description": "Nắm vững các từ để hỏi (What, When, Where, Why, How many, How often) và các liên từ kết hợp câu (and, but, so) cùng phát âm /θ/ - /ð/.",
        "durationMinutes": 12,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 8-10, 14)",
        "questions": [
            {
                "id": "g6-u7-g-q1",
                "type": "multiple_choice",
                "prompt": "Choose the correct question word: '_______ days a week do you go to class? - I go to class five days a week.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "How many"},
                    {"id": "B", "text": "How often"},
                    {"id": "C", "text": "When"},
                    {"id": "D", "text": "Why"}
                ],
                "correctAnswer": "A",
                "hint": "Hỏi về số lượng danh từ đếm được số nhiều ('days a week') dùng từ để hỏi nào?",
                "explanation": "Quy tắc ngữ pháp Unit 7: 'How many' + danh từ số nhiều dùng để hỏi số lượng ('How many days a week...?'). Chọn A.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u7-g-q2",
                "type": "multiple_choice",
                "prompt": "Choose the correct question word: '_______ do you like the Wildlife programme? - Because I love animals.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "What"},
                    {"id": "B", "text": "Where"},
                    {"id": "C", "text": "Why"},
                    {"id": "D", "text": "Who"}
                ],
                "correctAnswer": "C",
                "hint": "Câu trả lời bắt đầu bằng 'Because' (bởi vì) chỉ lý do.",
                "explanation": "Từ để hỏi lý do/nguyên nhân là 'Why'. Câu trả lời bắt đầu bằng 'Because I love animals.' Do đó chọn C.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            },
            {
                "id": "g6-u7-g-q3",
                "type": "multiple_choice",
                "prompt": "Conjunctions: Choose the correct conjunction: 'I'm tired, _______ I'll go to bed early tonight.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "so"},
                    {"id": "B", "text": "but"},
                    {"id": "C", "text": "and"},
                    {"id": "D", "text": "although"}
                ],
                "correctAnswer": "A",
                "hint": "Vế sau là kết quả của vế trước: 'Tôi mệt, vì thế tôi sẽ đi ngủ sớm'.",
                "explanation": "Liên từ 'so' dùng để diễn tả kết quả (so = vì vậy, cho nên). Chọn A.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "A"
            },
            {
                "id": "g6-u7-g-q4",
                "type": "multiple_choice",
                "prompt": "Conjunctions: 'The television programme is very interesting, _______ it is too long.'",
                "passage": None,
                "options": [
                    {"id": "A", "text": "so"},
                    {"id": "B", "text": "but"},
                    {"id": "C", "text": "and"},
                    {"id": "D", "text": "because"}
                ],
                "correctAnswer": "B",
                "hint": "Hai vế mang nghĩa đối lập tương phản (rất hay nhưng quá dài).",
                "explanation": "Liên từ 'but' dùng để nối hai mệnh đề mang ý nghĩa tương phản (nhưng). Do đó chọn B.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "B"
            },
            {
                "id": "g6-u7-g-q5",
                "type": "multiple_choice",
                "prompt": "Pronunciation: Choose the word with the underlined sound pronounced as /θ/ (voiceless):",
                "passage": None,
                "options": [
                    {"id": "A", "text": "there (/ð/)"},
                    {"id": "B", "text": "weather (/ð/)"},
                    {"id": "C", "text": "theatre (/θ/)"},
                    {"id": "D", "text": "them (/ð/)"}
                ],
                "correctAnswer": "C",
                "hint": "Từ 'theatre' phát âm âm đầu vô thanh /θ/, không rung dây thanh quản.",
                "explanation": "'theatre' (/ˈθɪətə/) có âm /θ/ vô thanh. Trong khi 'there' (/ðeə/), 'weather' (/ˈweðə/), 'them' (/ðem/) đều có âm /ð/ hữu thanh. Chọn C.",
                "difficulty": "A1",
                "score": 1.0,
                "answer": "C"
            }
        ]
    },
    {
        "id": "g6-u7-les-04",
        "skill": "writing",
        "unitId": "unit-g6-u7",
        "unitTitle": "Unit 7: Television",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Writing: Your TV-Viewing Habits",
        "description": "Nối câu bằng liên từ kết hợp và viết đoạn văn khoảng 50 từ về thói quen xem truyền hình của bản thân.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 13 & 14)",
        "questions": [
            {
                "id": "g6-u7-w-q1",
                "type": "writing",
                "prompt": "Connect the two sentences using the conjunction 'so': 'I like The Seven Kitties very much. I watch it every day.'",
                "passage": None,
                "options": None,
                "correctAnswer": "I like The Seven Kitties very much, so I watch it every day.",
                "hint": "Đặt dấu phẩy và từ 'so' vào giữa hai mệnh đề: S + V, so + S + V.",
                "explanation": "Câu ghép với liên từ 'so' tạo thành: 'I like The Seven Kitties very much, so I watch it every day.'",
                "difficulty": "A1",
                "score": 2.0,
                "answer": "I like The Seven Kitties very much, so I watch it every day."
            },
            {
                "id": "g6-u7-w-q2",
                "type": "writing",
                "prompt": "Write a paragraph (about 50 words) about your TV-viewing habits. Answer: 1. How much do you like watching TV? 2. How many hours a day do you watch? 3. When do you watch TV the most? 4. What is your favourite programme?",
                "passage": None,
                "options": None,
                "correctAnswer": "I like watching TV very much. I usually watch about one hour of TV a day, mostly in the evening after finishing my homework. I never watch TV while eating dinner because my family talks together. My favourite programme is English in a Minute because it is fun and educational.",
                "hint": "Dùng các từ: 'I like...', 'I usually watch... hours a day', 'in the evening', 'My favourite programme is... because...'",
                "explanation": "Tiêu chí chấm: Đầy đủ 4 ý theo hướng dẫn, độ dài khoảng 50 từ, sử dụng đúng thì Hiện tại đơn, liên từ 'because', 'and' và từ vựng Unit 7.",
                "difficulty": "A1",
                "score": 3.0,
                "answer": "I like watching TV very much. I usually watch about one hour of TV a day, mostly in the evening after finishing my homework. I never watch TV while eating dinner because my family talks together. My favourite programme is English in a Minute because it is fun and educational."
            }
        ]
    },
    {
        "id": "g6-u7-les-05",
        "skill": "speaking",
        "unitId": "unit-g6-u7",
        "unitTitle": "Unit 7: Television",
        "courseTitle": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "title": "Speaking: Talking About Your Favourite TV Programme",
        "description": "Luyện nói giới thiệu chương trình truyền hình yêu thích (tên chương trình, kênh, nội dung, lý do thích) có ghi âm & AI chấm điểm.",
        "durationMinutes": 15,
        "targetCefr": "A1",
        "status": "ready",
        "provenance": "SGK Tiếng Anh 6 Tập 2 - Global Success Unit 7 (NXB Giáo Dục Việt Nam & Pearson, tr. 7 & 13)",
        "questions": [
            {
                "id": "g6-u7-s-q1",
                "type": "speaking",
                "prompt": "Talk about your favourite TV programme (1-2 minutes). Guiding questions:\n1. What is the name of your favourite programme and which channel is it on?\n2. What is the programme about?\n3. Why do you like it?\n[Click Record and speak clearly in English]",
                "passage": None,
                "options": None,
                "correctAnswer": "Hello everyone! Today I want to tell you about my favourite TV programme. It is The Voice Kids on VTV3. It is a wonderful music talent show for children and teenagers. In this show, young singers from across Vietnam sing beautifully on stage. I love this programme because the songs are exciting and inspiring, and the judges are very friendly and funny. I always watch it with my family every Saturday night. Thank you for listening!",
                "hint": "Mẫu câu: 'My favourite TV programme is... on channel...', 'It is about...', 'I like it because...'",
                "explanation": "Tiêu chí AI & Giáo viên đánh giá: 1. Phát âm chuẩn từ vựng chủ đề truyền hình (programme, channel, talent show). 2. Phát âm chính xác âm /θ/ và /ð/. 3. Trôi chảy, tự nhiên. 4. Cấu trúc câu phong phú với các liên từ and, but, so.",
                "difficulty": "A1",
                "score": 5.0,
                "answer": "Hello everyone! Today I want to tell you about my favourite TV programme. It is The Voice Kids on VTV3. It is a wonderful music talent show for children and teenagers. In this show, young singers from across Vietnam sing beautifully on stage. I love this programme because the songs are exciting and inspiring, and the judges are very friendly and funny. I always watch it with my family every Saturday night. Thank you for listening!"
            }
        ]
    }
]

# --- 24 AUTHENTIC VOCABULARY WORDS FOR GRADE 6 ---
G6_VOCAB_WORDS = [
    # Unit 2: My House (SGK Tập 1)
    {
        "id": "vocab-g6-u2-01",
        "term": "town house",
        "phonetic": "/ˈtaʊn haʊs/",
        "partOfSpeech": "noun",
        "definition": "A house that is joined to other houses in a town or city row.",
        "example": "Mi lives with her family in a modern town house in Da Nang.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 1,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-02",
        "term": "country house",
        "phonetic": "/ˈkʌntri haʊs/",
        "partOfSpeech": "noun",
        "definition": "A house situated in the countryside, often with a large garden.",
        "example": "Nick lives in a peaceful country house surrounded by trees.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 2,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-03",
        "term": "stilt house",
        "phonetic": "/stɪlt haʊs/",
        "partOfSpeech": "noun",
        "definition": "A house raised on tall wooden posts over land or water.",
        "example": "Many ethnic minority families live in traditional stilt houses in northwestern Vietnam.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-04",
        "term": "villa",
        "phonetic": "/ˈvɪlə/",
        "partOfSpeech": "noun",
        "definition": "A large and luxurious house, often with a garden and swimming pool.",
        "example": "They rented a beautiful seaside villa for their summer holiday.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-05",
        "term": "flat",
        "phonetic": "/flæt/",
        "partOfSpeech": "noun",
        "definition": "A set of rooms for living in that is part of a larger building; an apartment.",
        "example": "Mi's family is moving to a new flat with three bedrooms next month.",
        "cefr": "A1",
        "state": "mastered",
        "intervalDays": 21,
        "nextReviewDate": "Sau 18 ngày",
        "recallSuccessDays": 3,
        "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-06",
        "term": "chest of drawers",
        "phonetic": "/ˌtʃest əv ˈdrɔːz/",
        "partOfSpeech": "noun phr.",
        "definition": "A piece of furniture with several sliding boxes for keeping clothes.",
        "example": "I keep my socks and T-shirts in the wooden chest of drawers.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 1,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Furniture", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-07",
        "term": "wardrobe",
        "phonetic": "/ˈwɔːdrəʊb/",
        "partOfSpeech": "noun",
        "definition": "A tall cupboard in which you can hang your clothes.",
        "example": "There is a large wardrobe next to the bed in my bedroom.",
        "cefr": "A1",
        "state": "mastered",
        "intervalDays": 30,
        "nextReviewDate": "Sau 25 ngày",
        "recallSuccessDays": 4,
        "tags": ["Furniture", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-08",
        "term": "dishwasher",
        "phonetic": "/ˈdɪʃwɒʃə/",
        "partOfSpeech": "noun",
        "definition": "An electrical machine used for washing dishes and cutlery automatically.",
        "example": "Using a modern dishwasher saves our family a lot of time after dinner.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 2,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Appliances", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-09",
        "term": "microwave",
        "phonetic": "/ˈmaɪkrəweɪv/",
        "partOfSpeech": "noun",
        "definition": "An electric oven that uses electromagnetic waves to heat food quickly.",
        "example": "She warmed up a bowl of soup in the microwave.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["Appliances", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-10",
        "term": "hall",
        "phonetic": "/hɔːl/",
        "partOfSpeech": "noun",
        "definition": "An entrance area or passage connecting rooms in a house.",
        "example": "Leave your coat and shoes on the rack in the entrance hall.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 1,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Rooms", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-11",
        "term": "cupboard",
        "phonetic": "/ˈkʌbəd/",
        "partOfSpeech": "noun",
        "definition": "A piece of furniture or cabinet with shelves used for storing cups, plates, and food.",
        "example": "We store all our cereal bowls in the kitchen cupboard.",
        "cefr": "A1",
        "state": "mastered",
        "intervalDays": 25,
        "nextReviewDate": "Sau 20 ngày",
        "recallSuccessDays": 3,
        "tags": ["Furniture", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },
    {
        "id": "vocab-g6-u2-12",
        "term": "balcony",
        "phonetic": "/ˈbælkəni/",
        "partOfSpeech": "noun",
        "definition": "A platform enclosed by a railing that projects from the outer wall of a building.",
        "example": "Our living room has a wide balcony with lots of colourful flower pots.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["House", "Grade 6 Unit 2", "SGK Tiếng Anh 6 Tập 1"]
    },

    # Unit 7: Television (SGK Tập 2)
    {
        "id": "vocab-g6-u7-01",
        "term": "animated film",
        "phonetic": "/ˈænɪmeɪtɪd fɪlm/",
        "partOfSpeech": "noun phr.",
        "definition": "A film made by using computer-generated drawings or cartoons rather than real actors.",
        "example": "Phong loves animated films like The Lion King and Coco.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 1,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-02",
        "term": "educational programme",
        "phonetic": "/ˌedʒuˈkeɪʃənl ˈprəʊɡræm/",
        "partOfSpeech": "noun phr.",
        "definition": "A TV broadcast designed to instruct or teach viewers useful knowledge.",
        "example": "English in a Minute is a very popular educational programme for secondary students.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 2,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-03",
        "term": "talent show",
        "phonetic": "/ˈtælənt ʃəʊ/",
        "partOfSpeech": "noun phr.",
        "definition": "A television competition where amateur performers show their singing, dancing, or skills.",
        "example": "The Voice Kids is an exciting music talent show watched by millions of teenagers.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 1,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-04",
        "term": "comedy",
        "phonetic": "/ˈkɒmədi/",
        "partOfSpeech": "noun",
        "definition": "A film, play, or programme that is funny and intended to make people laugh.",
        "example": "Watching a comedy after a stressful school day helps me relax.",
        "cefr": "A1",
        "state": "mastered",
        "intervalDays": 28,
        "nextReviewDate": "Sau 22 ngày",
        "recallSuccessDays": 4,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-05",
        "term": "game show",
        "phonetic": "/ˈɡeɪm ʃəʊ/",
        "partOfSpeech": "noun phr.",
        "definition": "A TV show in which contestants answer questions or play games to win prizes.",
        "example": "Children are Always Right is a fun game show with questions about domestic pets.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 3,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 2,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-06",
        "term": "wildlife",
        "phonetic": "/ˈwaɪldlaɪf/",
        "partOfSpeech": "noun",
        "definition": "Wild animals and plants living in their natural environment.",
        "example": "The wildlife documentary shows colourful birds and flowers in Cuc Phuong National Park.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["Nature", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-07",
        "term": "viewer",
        "phonetic": "/ˈvjuːə/",
        "partOfSpeech": "noun",
        "definition": "A person who watches a television programme or video.",
        "example": "A successful television show attracts millions of enthusiastic viewers.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-08",
        "term": "remote control",
        "phonetic": "/rɪˌməʊt kənˈtrəʊl/",
        "partOfSpeech": "noun phr.",
        "definition": "A handheld device used to operate a television from a distance.",
        "example": "Please pass me the remote control so I can turn to VTV7.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 1,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Technology", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-09",
        "term": "channel",
        "phonetic": "/ˈtʃænl/",
        "partOfSpeech": "noun",
        "definition": "A television station and its scheduled programmes.",
        "example": "VTV1 is the national news channel in Vietnam.",
        "cefr": "A1",
        "state": "mastered",
        "intervalDays": 24,
        "nextReviewDate": "Sau 19 ngày",
        "recallSuccessDays": 3,
        "tags": ["Media", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-10",
        "term": "character",
        "phonetic": "/ˈkærəktə/",
        "partOfSpeech": "noun",
        "definition": "A person or animal represented in a film, play, or story.",
        "example": "Jerry the mouse is a clever cartoon character loved by children.",
        "cefr": "A1",
        "state": "learning",
        "intervalDays": 2,
        "nextReviewDate": "Hôm nay",
        "recallSuccessDays": 1,
        "tags": ["Story", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-11",
        "term": "clever",
        "phonetic": "/ˈklevə/",
        "partOfSpeech": "adj",
        "definition": "Quick at learning and understanding things; intelligent.",
        "example": "Dolphins are very clever sea animals that can perform amazing tricks.",
        "cefr": "A1",
        "state": "mastered",
        "intervalDays": 30,
        "nextReviewDate": "Sau 26 ngày",
        "recallSuccessDays": 4,
        "tags": ["Personality", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    },
    {
        "id": "vocab-g6-u7-12",
        "term": "newsreader",
        "phonetic": "/ˈnjuːzriːdə/",
        "partOfSpeech": "noun",
        "definition": "A person who reads the news reports on television or radio.",
        "example": "The evening newsreader speaks clearly and professionally.",
        "cefr": "A1",
        "state": "saved",
        "intervalDays": 0,
        "nextReviewDate": "Chưa kích hoạt",
        "recallSuccessDays": 0,
        "tags": ["Jobs", "Grade 6 Unit 7", "SGK Tiếng Anh 6 Tập 2"]
    }
]

def update_sources():
    registry_file = os.path.join(SOURCES_DIR, "source-registry.json")
    if not os.path.exists(registry_file):
        return
    with open(registry_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {s["id"] for s in data.get("sources", [])}
    new_sources = [
        {
            "id": "sgk_tieng_anh_6_tap_1",
            "name": "SGK Tiếng Anh 6 Tập 1 - Global Success (NXB Giáo Dục Việt Nam & Pearson)",
            "domain": "nxbgd.vn",
            "homepage": "https://nxbgd.vn",
            "license": "Curriculum Standard Alignment",
            "license_url": "https://moet.gov.vn",
            "status": "approved",
            "rationale": "Sách giáo khoa Tiếng Anh 6 Tập 1 chính thống theo Chương trình GDPT 2018. Khai thác bài tập Unit 2 (My House), bài đọc Crazy House Hotel, bài nghe ngôi nhà của Mai, ngữ pháp sở hữu cách và giới từ chỉ vị trí.",
            "skills": ["reading", "listening", "speaking", "writing", "grammar", "vocabulary"],
            "allowed_content_types": ["reading_comprehension", "listening_dialogue", "grammar_drill", "writing_task", "speaking_prompt"],
            "rate_limit_delay_seconds": 0.5,
            "requires_auth": False
        },
        {
            "id": "sgk_tieng_anh_6_tap_2",
            "name": "SGK Tiếng Anh 6 Tập 2 - Global Success (NXB Giáo Dục Việt Nam & Pearson)",
            "domain": "nxbgd.vn",
            "homepage": "https://nxbgd.vn",
            "license": "Curriculum Standard Alignment",
            "license_url": "https://moet.gov.vn",
            "status": "approved",
            "rationale": "Sách giáo khoa Tiếng Anh 6 Tập 2 chính thống theo Chương trình GDPT 2018. Khai thác bài tập Unit 7 (Television), lịch phát sóng TV guide, các kênh truyền hình, từ để hỏi Wh-questions, và liên từ câu ghép (and, but, so).",
            "skills": ["reading", "listening", "speaking", "writing", "grammar", "vocabulary"],
            "allowed_content_types": ["reading_comprehension", "listening_dialogue", "grammar_drill", "writing_task", "speaking_prompt"],
            "rate_limit_delay_seconds": 0.5,
            "requires_auth": False
        }
    ]

    for s in new_sources:
        if s["id"] not in existing_ids:
            data["sources"].append(s)
            existing_ids.add(s["id"])

    data["updated_at"] = NOW_ISO
    with open(registry_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[OK] Updated source-registry.json with SGK Tiếng Anh 6 Tập 1 & Tập 2.")

def update_catalogs():
    courses_file = os.path.join(CATALOG_DIR, "courses.json")
    units_file = os.path.join(CATALOG_DIR, "units.json")
    lessons_file = os.path.join(CATALOG_DIR, "lessons.json")

    # Load existing
    with open(courses_file, "r", encoding="utf-8") as f:
        courses = json.load(f)
    with open(units_file, "r", encoding="utf-8") as f:
        units = json.load(f)
    with open(lessons_file, "r", encoding="utf-8") as f:
        lessons = json.load(f)

    # 1. Update Units
    unit_map = {u["id"]: u for u in units}
    unit_map["unit-g6-u2"] = {
        "id": "unit-g6-u2",
        "course_id": "course-thcs-g6",
        "grade": 6,
        "title": "Unit 2: My House",
        "description": "Khám phá các kiểu nhà ở (town house, country house, flat, villa), các phòng trong nhà, đồ dùng nội thất, sở hữu cách và giới từ chỉ vị trí.",
        "order": 2,
        "lesson_ids": [l["id"] for l in G6_U2_LESSONS]
    }
    unit_map["unit-g6-u7"] = {
        "id": "unit-g6-u7",
        "course_id": "course-thcs-g6",
        "grade": 6,
        "title": "Unit 7: Television",
        "description": "Khám phá thế giới truyền hình, các thể loại chương trình (animated film, comedy, game show, wildlife), từ để hỏi Wh-questions và liên từ kết hợp (and, but, so).",
        "order": 7,
        "lesson_ids": [l["id"] for l in G6_U7_LESSONS]
    }

    # 2. Update Courses
    for c in courses:
        if c["id"] == "course-thcs-g6":
            u_ids = set(c.get("unit_ids", []))
            u_ids.add("unit-g6-u1")
            u_ids.add("unit-g6-u2")
            u_ids.add("unit-g6-u7")
            u_ids.add("unit-g6-midterm")
            c["unit_ids"] = sorted(list(u_ids))

    # 3. Update Lessons
    lesson_map = {l["id"]: l for l in lessons}
    all_new_lessons = G6_U2_LESSONS + G6_U7_LESSONS
    for l in all_new_lessons:
        lesson_map[l["id"]] = {
            "id": l["id"],
            "skill": l["skill"],
            "unitId": l["unitId"],
            "unitTitle": l["unitTitle"],
            "courseTitle": l["courseTitle"],
            "title": l["title"],
            "description": l["description"],
            "durationMinutes": l["durationMinutes"],
            "targetCefr": l["targetCefr"],
            "questions": l["questions"]
        }

    with open(courses_file, "w", encoding="utf-8") as f:
        json.dump(courses, f, indent=2, ensure_ascii=False)
    with open(units_file, "w", encoding="utf-8") as f:
        json.dump(list(unit_map.values()), f, indent=2, ensure_ascii=False)
    with open(lessons_file, "w", encoding="utf-8") as f:
        json.dump(list(lesson_map.values()), f, indent=2, ensure_ascii=False)
    print(f"[OK] Updated catalogs: courses.json, units.json, lessons.json.")

def update_normalized_activities_and_vocab():
    act_file = os.path.join(NORM_DIR, "activities.jsonl")
    voc_file = os.path.join(NORM_DIR, "vocabulary.jsonl")

    # Activities
    existing_act_ids = set()
    if os.path.exists(act_file):
        with open(act_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        existing_act_ids.add(record["id"])
                    except Exception:
                        pass

    all_new_lessons = G6_U2_LESSONS + G6_U7_LESSONS
    with open(act_file, "a", encoding="utf-8") as f:
        for l in all_new_lessons:
            act_id = f"act-{l['id']}"
            if act_id not in existing_act_ids:
                source_book = "SGK Tiếng Anh 6 Tập 1" if "u2" in l["id"] else "SGK Tiếng Anh 6 Tập 2"
                act_record = {
                    "id": act_id,
                    "title": l["title"],
                    "skill": l["skill"],
                    "activity_type": f"{l['skill']}_practice",
                    "topic_tags": [l["unitTitle"], "Grade 6", "Global Success", source_book],
                    "learning_objectives": [l["description"]],
                    "source_url": "https://nxbgd.vn/chuong-trinh-gdpt-2018-tieng-anh-global-success",
                    "source_name": f"{source_book} - Global Success",
                    "license": "Curriculum Standard Alignment",
                    "attribution": "Bộ Giáo dục và Đào tạo Việt Nam & NXB Giáo dục Việt Nam - Tiếng Anh 6 Global Success",
                    "retrieved_at": NOW_ISO,
                    "source_content_hash": hash_content(l["title"] + l["description"]),
                    "content": l["questions"][0].get("passage") if l["questions"] and l["questions"][0].get("passage") else l["description"],
                    "questions": l["questions"],
                    "cefr_level": l["targetCefr"],
                    "cefr_origin": "source",
                    "difficulty_status": "calibrated",
                    "review_status": "approved",
                    "content_origin": "source"
                }
                f.write(json.dumps(act_record, ensure_ascii=False) + "\n")
                existing_act_ids.add(act_id)

    # Vocabulary
    existing_voc_ids = set()
    if os.path.exists(voc_file):
        with open(voc_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        record = json.loads(line)
                        existing_voc_ids.add(record["id"])
                    except Exception:
                        pass

    with open(voc_file, "a", encoding="utf-8") as f:
        for v in G6_VOCAB_WORDS:
            if v["id"] not in existing_voc_ids:
                f.write(json.dumps(v, ensure_ascii=False) + "\n")
                existing_voc_ids.add(v["id"])

    print(f"[OK] Appended activities and vocabulary to normalized JSONL files.")

def update_mock_data():
    with open(MOCK_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Insert vocabulary words into initialVocabWords
    vocab_marker = "export const initialVocabWords: VocabularyWord[] = ["
    if vocab_marker in content:
        v_pos = content.find(vocab_marker) + len(vocab_marker)
        # Check if already inserted
        if "vocab-g6-u2-01" not in content:
            vocab_json_strs = "\n"
            for w in G6_VOCAB_WORDS:
                vocab_json_strs += f"  {json.dumps(w, ensure_ascii=False)},\n"
            content = content[:v_pos] + vocab_json_strs + content[v_pos:]
            print("[OK] Injected 24 Grade 6 vocabulary words into mockData.ts.")
        else:
            print("[INFO] Grade 6 vocabulary already present in mockData.ts.")

    # 2. Update initialLessons in mockData.ts
    # Replace placeholder `g6-u2-prep-01` or insert U2 and U7
    all_new_lessons = G6_U2_LESSONS + G6_U7_LESSONS
    new_lessons_json = "\n"
    for l in all_new_lessons:
        new_lessons_json += f"  {json.dumps(l, ensure_ascii=False)},\n\n"

    # If g6-u2-prep-01 exists, replace it
    if '"id": "g6-u2-prep-01"' in content or "'id': 'g6-u2-prep-01'" in content:
        # Find start of g6-u2-prep-01 object
        p1 = content.find('"id": "g6-u2-prep-01"')
        if p1 == -1:
            p1 = content.find("'id': 'g6-u2-prep-01'")
        brace_start = content.rfind("{", 0, p1)
        brace_end = content.find("},", p1) + 2

        content = content[:brace_start] + new_lessons_json.strip() + ",\n  " + content[brace_end:].lstrip()
        print("[OK] Replaced g6-u2-prep-01 placeholder with authentic Unit 2 & Unit 7 lessons.")
    elif "g6-u2-les-01" not in content:
        # Insert at start of initialLessons
        les_marker = "export const initialLessons: Lesson[] = ["
        m_pos = content.find(les_marker) + len(les_marker)
        content = content[:m_pos] + new_lessons_json + content[m_pos:]
        print("[OK] Inserted authentic Unit 2 & Unit 7 lessons into initialLessons.")
    else:
        print("[INFO] Unit 2 and Unit 7 lessons already present in mockData.ts.")

    with open(MOCK_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] Successfully saved updated mockData.ts.")

if __name__ == "__main__":
    print("=== Extracting and Updating Grade 6 Authentic Curriculum ===")
    update_sources()
    update_catalogs()
    update_normalized_activities_and_vocab()
    update_mock_data()
    print("=== All updates completed successfully! ===")
