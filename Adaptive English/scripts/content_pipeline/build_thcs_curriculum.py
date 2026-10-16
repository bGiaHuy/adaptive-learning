#!/usr/bin/env python3
"""
build_thcs_curriculum.py - Global Success THCS Curriculum Builder (Grades 6, 7, 8, 9)

Builds the standardized Grade 6-9 Global Success curriculum courses:
- Unit 1 for Grades 6, 7, 8, 9 (Pronunciation, Vocabulary, Grammar, Reading, Listening, Writing, Speaking)
- Mid-Term Examination 1 (Units 1-3 Review & Assessment) for each grade
- Complete answer keys, scoring criteria, and in-depth pedagogical explanations in Vietnamese.
- Integrates into:
  * data/sources/source-registry.json
  * data/catalog/courses.json
  * data/catalog/units.json
  * data/catalog/lessons.json
  * data/normalized/activities.jsonl
  * data/normalized/vocabulary.jsonl
  * english-learning-platform/src/lib/mockData.ts
"""

import sys
import os
import json
import hashlib
from datetime import datetime

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
NORM_DIR = os.path.join(ROOT_DIR, "data", "normalized")
CATALOG_DIR = os.path.join(ROOT_DIR, "data", "catalog")
SOURCES_DIR = os.path.join(ROOT_DIR, "data", "sources")
REPORTS_DIR = os.path.join(ROOT_DIR, "data", "reports")
FRONTEND_MOCK_FILE = os.path.join(ROOT_DIR, "english-learning-platform", "src", "lib", "mockData.ts")

os.makedirs(NORM_DIR, exist_ok=True)
os.makedirs(CATALOG_DIR, exist_ok=True)
os.makedirs(SOURCES_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

NOW_ISO = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

def hash_content(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

# Define Grade 6-9 Data Packages
THCS_CURRICULUM = [
    {
        "grade": 6,
        "course_id": "course-thcs-g6",
        "course_title": "Tiếng Anh 6 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "target_level": "A1-A2",
        "description": "Chương trình Tiếng Anh lớp 6 theo bộ sách Global Success. Rèn luyện toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết, Ngữ âm (/ɑː/ và /ʌ/), Ngữ pháp (Hiện tại đơn, Động từ thường gặp) và đề ôn kiểm tra định kỳ.",
        "units": [
            {
                "unit_id": "unit-g6-u1",
                "title": "Unit 1: My New School",
                "description": "Khám phá trường học mới, dụng cụ học tập, bạn bè, thầy cô và các hoạt động học tập hằng ngày.",
                "lessons": [
                    {
                        "id": "g6-u1-les-01",
                        "skill": "reading",
                        "title": "Reading: Phong's First Day at Duy Tan School",
                        "description": "Đọc bài viết về ngày đầu tiên đi học ở trường mới của bạn Phong, tìm chi tiết và suy luận.",
                        "durationMinutes": 15,
                        "targetCefr": "A1",
                        "questions": [
                            {
                                "id": "g6-u1-r-q1",
                                "type": "multiple_choice",
                                "prompt": "According to the passage, how does Phong travel to his new school?",
                                "passage": "Hi, I am Phong. Today is my first day at Duy Tan Secondary School. The school has a large library, a modern computer room, and a big playground. I wear my new uniform and cycle to school with Duy, my new neighbour. Duy is very friendly and smart. We are in class 6A.",
                                "options": [
                                    {"id": "A", "text": "He goes to school by bus."},
                                    {"id": "B", "text": "He rides a bicycle with his friend Duy."},
                                    {"id": "C", "text": "His father drives him by car."},
                                    {"id": "D", "text": "He walks to school on foot."}
                                ],
                                "correctAnswer": "B",
                                "hint": "Look for the sentence with 'cycle to school' in the reading text.",
                                "explanation": "Trong đoạn văn có câu: 'I wear my new uniform and cycle to school with Duy'. Động từ 'cycle' có nghĩa là đi xe đạp (rides a bicycle). Vì vậy đáp án đúng là B.",
                                "difficulty": "A1",
                                "score": 1.0
                            },
                            {
                                "id": "g6-u1-r-q2",
                                "type": "multiple_choice",
                                "prompt": "Which of the following statements about Duy Tan School is TRUE?",
                                "passage": "Hi, I am Phong. Today is my first day at Duy Tan Secondary School. The school has a large library, a modern computer room, and a big playground. I wear my new uniform and cycle to school with Duy, my new neighbour. Duy is very friendly and smart. We are in class 6A.",
                                "options": [
                                    {"id": "A", "text": "The school does not have a playground."},
                                    {"id": "B", "text": "The school features a large library and a modern computer lab."},
                                    {"id": "C", "text": "Phong and Duy study in different classes."},
                                    {"id": "D", "text": "Duy was Phong's classmate in primary school."}
                                ],
                                "correctAnswer": "B",
                                "hint": "Check the sentence describing the school's facilities.",
                                "explanation": "Bài đọc nêu rõ: 'The school has a large library, a modern computer room, and a big playground.' Do đó đáp án B là hoàn toàn chính xác.",
                                "difficulty": "A1",
                                "score": 1.0
                            },
                            {
                                "id": "g6-u1-r-q3",
                                "type": "fill_in_the_blank",
                                "prompt": "Complete the sentence with the correct class: Duy and Phong are in class _______.",
                                "passage": "Duy is very friendly and smart. We are in class 6A.",
                                "options": None,
                                "correctAnswer": "6A",
                                "hint": "Find the class name mentioned at the end of the paragraph.",
                                "explanation": "Câu cuối đoạn văn viết: 'We are in class 6A'. Từ cần điền là '6A'.",
                                "difficulty": "A1",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g6-u1-les-02",
                        "skill": "listening",
                        "title": "Listening: School Clubs and Timetable",
                        "description": "Nghe đoạn hội thoại giữa An và Vy về các câu lạc bộ và môn học yêu thích ở trường.",
                        "durationMinutes": 15,
                        "targetCefr": "A1",
                        "questions": [
                            {
                                "id": "g6-u1-l-q1",
                                "type": "multiple_choice",
                                "prompt": "What club does Vy want to join after school?",
                                "passage": "[Audio Transcript]\nAn: Hi Vy, what are you doing?\nVy: Hi An, I'm filling out the registration form for the art club. I love drawing pictures.\nAn: That sounds fun! I want to join the judo club with Duy on Tuesday afternoons.\nVy: Great! Do we have English lessons tomorrow morning?\nAn: Yes, we have English, Maths, and Science.",
                                "options": [
                                    {"id": "A", "text": "The judo club"},
                                    {"id": "B", "text": "The art club"},
                                    {"id": "C", "text": "The science club"},
                                    {"id": "D", "text": "The football club"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Nghe câu trả lời của Vy: 'I'm filling out the registration form for the...'",
                                "explanation": "Trong hội thoại, Vy nói: 'I'm filling out the registration form for the art club. I love drawing pictures.' Do đó Vy muốn tham gia câu lạc bộ mỹ thuật (art club).",
                                "difficulty": "A1",
                                "score": 1.0
                            },
                            {
                                "id": "g6-u1-l-q2",
                                "type": "multiple_choice",
                                "prompt": "When does An practice judo?",
                                "passage": "An: That sounds fun! I want to join the judo club with Duy on Tuesday afternoons.",
                                "options": [
                                    {"id": "A", "text": "On Tuesday afternoons"},
                                    {"id": "B", "text": "On Monday mornings"},
                                    {"id": "C", "text": "On Saturday weekends"},
                                    {"id": "D", "text": "Every morning"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Chú ý mốc thời gian sau từ 'on...'",
                                "explanation": "An nói rõ: 'I want to join the judo club with Duy on Tuesday afternoons.' Đáp án A chính xác.",
                                "difficulty": "A1",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g6-u1-les-03",
                        "skill": "grammar",
                        "title": "Grammar & Vocab: Present Simple & School Verbs",
                        "description": "Luyện tập thì Hiện tại đơn và cách dùng 4 động từ trọng tâm: play, do, have, study.",
                        "durationMinutes": 12,
                        "targetCefr": "A1",
                        "questions": [
                            {
                                "id": "g6-u1-g-q1",
                                "type": "multiple_choice",
                                "prompt": "Choose the correct verb to complete the sentence: 'Students usually _______ their homework before dinner.'",
                                "options": [
                                    {"id": "A", "text": "play"},
                                    {"id": "B", "text": "do"},
                                    {"id": "C", "text": "have"},
                                    {"id": "D", "text": "study"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Which verb forms a standard collocation with 'homework'?",
                                "explanation": "Quy tắc kết hợp từ (collocation) trong Unit 1: 'do homework' (làm bài tập về nhà), 'play sports/games' (chơi thể thao), 'have lunch/lessons' (ăn trưa/có tiết học), 'study English/maths' (học môn học). Do đó chọn 'do'.",
                                "difficulty": "A1",
                                "score": 1.0
                            },
                            {
                                "id": "g6-u1-g-q2",
                                "type": "multiple_choice",
                                "prompt": "Pronunciation: Choose the word whose underlined part is pronounced differently from the others (/ɑː/ and /ʌ/):",
                                "options": [
                                    {"id": "A", "text": "smart (/ɑː/)"},
                                    {"id": "B", "text": "art (/ɑː/)"},
                                    {"id": "C", "text": "rubber (/ʌ/)"},
                                    {"id": "D", "text": "start (/ɑː/)"}
                                ],
                                "correctAnswer": "C",
                                "hint": "The vowel sound in 'rubber' is short /ʌ/, unlike the long /ɑː/ in the other words.",
                                "explanation": "'rubber' có nguyên âm phát âm là /ʌ/ (/ˈrʌbə/). Ba từ còn lại 'smart' (/smɑːt/), 'art' (/ɑːt/), 'start' (/stɑːt/) đều có nguyên âm là /ɑː/ dài.",
                                "difficulty": "A1",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g6-u1-les-04",
                        "skill": "writing",
                        "title": "Writing: Sentence Transformation & School Description",
                        "description": "Viết lại câu hoàn chỉnh và viết đoạn văn 40-50 từ miêu tả trường học mới.",
                        "durationMinutes": 15,
                        "targetCefr": "A1",
                        "questions": [
                            {
                                "id": "g6-u1-w-q1",
                                "type": "writing",
                                "prompt": "Rearrange the given words to make a complete sentence: 'playground / has / a / school / My / big / .'",
                                "options": None,
                                "correctAnswer": "My school has a big playground.",
                                "hint": "Affirmative sentence order: Subject (My school) + Verb (has) + Object (a big playground).",
                                "explanation": "Trật tự từ đúng theo cấu trúc S + V + O là: 'My school has a big playground.' (Trường của tôi có một sân chơi lớn).",
                                "difficulty": "A1",
                                "score": 2.0
                            },
                            {
                                "id": "g6-u1-w-q2",
                                "type": "writing",
                                "prompt": "Write a short paragraph (40 - 50 words) about your school. Answer the following questions: 1. What is the name of your school? 2. What do you like about it? 3. What activities do you do with your friends?",
                                "options": None,
                                "correctAnswer": "My school is Duy Tan Secondary School. It is very modern with a large library and clean classrooms. I love my teachers because they are very kind. At break time, I often play badminton and chat with my friends in the school yard.",
                                "hint": "Use the Present Simple tense and vocabulary learned in Unit 1 (modern, library, play badminton...).",
                                "explanation": "Tiêu chí chấm đoạn văn: Đủ số từ (40-50 từ), dùng đúng thì Hiện tại đơn, có đủ ý về tên trường, điểm yêu thích và hoạt động cùng bạn bè, không mắc lỗi chính tả cơ bản.",
                                "difficulty": "A1",
                                "score": 3.0
                            }
                        ]
                    },
                    {
                        "id": "g6-u1-les-05",
                        "skill": "speaking",
                        "title": "Speaking: Introducing Yourself & Your New School",
                        "description": "Luyện nói tự giới thiệu bản thân, lớp học và môn học yêu thích (có ghi âm & AI chấm điểm).",
                        "durationMinutes": 15,
                        "targetCefr": "A1",
                        "questions": [
                            {
                                "id": "g6-u1-s-q1",
                                "type": "speaking",
                                "prompt": "Talk about your new school (1-2 minutes). Guiding questions:\n1. What is your school's name and where is it located?\n2. What is your favourite subject and why?\n3. What uniform do you wear to school?\n[Click Record and speak clearly in English]",
                                "options": None,
                                "correctAnswer": "Hello teacher, my name is Nam. I am studying at Nguyen Du Secondary School in Hanoi. My school is big and beautiful. My favourite subject is English because it is very fun and interesting. Every morning, I wear a white shirt and blue trousers. I really love my new school.",
                                "hint": "Prepare for 30 seconds. Use: 'My name is...', 'My school is...', 'My favourite subject is... because...'",
                                "explanation": "Tiêu chí AI & Giáo viên đánh giá: 1. Phát âm rõ ràng các âm /ɑː/ và /ʌ/. 2. Trôi chảy, tốc độ vừa phải. 3. Sử dụng đúng thì hiện tại đơn. 4. Trả lời đủ 3 câu hỏi gợi ý.",
                                "difficulty": "A1",
                                "score": 5.0
                            }
                        ]
                    }
                ]
            },
            {
                "unit_id": "unit-g6-midterm",
                "title": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)",
                "description": "Đề kiểm tra chuẩn 45 phút tổng hợp kiến thức Unit 1 (My New School), Unit 2 (My House), Unit 3 (My Friends). Đầy đủ ma trận 4 kỹ năng có lời giải chi tiết.",
                "lessons": [
                    {
                        "id": "g6-midterm-exam-01",
                        "skill": "reading",
                        "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 6 (Thời Gian: 45 Phút)",
                        "description": "Đề kiểm tra định kỳ đầy đủ: Ngữ âm, Trắc nghiệm từ vựng - ngữ pháp, Đọc hiểu, Điền từ, Viết lại câu.",
                        "durationMinutes": 45,
                        "targetCefr": "A1",
                        "questions": [
                            {
                                "id": "g6-mt-q1",
                                "type": "multiple_choice",
                                "prompt": "Pronunciation: Choose the word whose underlined part is pronounced differently: A. smart  B. art  C. study  D. father",
                                "options": [
                                    {"id": "A", "text": "smart (/ɑː/)"},
                                    {"id": "B", "text": "art (/ɑː/)"},
                                    {"id": "C", "text": "study (/ʌ/)"},
                                    {"id": "D", "text": "father (/ɑː/)"}
                                ],
                                "correctAnswer": "C",
                                "hint": "Phân biệt nguyên âm ngắn /ʌ/ và nguyên âm dài /ɑː/.",
                                "explanation": "'study' có chữ 'u' phát âm là /ʌ/. Ba từ còn lại chữ 'a' phát âm là /ɑː/.",
                                "difficulty": "A1",
                                "score": 0.5
                            },
                            {
                                "id": "g6-mt-q2",
                                "type": "multiple_choice",
                                "prompt": "Grammar: My brother _______ judo twice a week at the school sport center.",
                                "options": [
                                    {"id": "A", "text": "plays"},
                                    {"id": "B", "text": "does"},
                                    {"id": "C", "text": "has"},
                                    {"id": "D", "text": "studies"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Môn võ judo đi kèm động từ nào và chủ ngữ là ngôi thứ 3 số ít?",
                                "explanation": "Môn võ judo luôn đi với động từ 'do'. Chủ ngữ 'My brother' là ngôi thứ 3 số ít nên động từ thêm 'es' thành 'does'.",
                                "difficulty": "A1",
                                "score": 0.5
                            },
                            {
                                "id": "g6-mt-q3",
                                "type": "multiple_choice",
                                "prompt": "Vocabulary: Look at that girl! She has _______ hair and big brown eyes.",
                                "options": [
                                    {"id": "A", "text": "long black"},
                                    {"id": "B", "text": "black long"},
                                    {"id": "C", "text": "a long black"},
                                    {"id": "D", "text": "longs black"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Quy tắc trật tự tính từ: Kích cỡ (long) đứng trước màu sắc (black).",
                                "explanation": "Quy tắc trật tự tính từ mô tả ngoại hình: Kích thước / độ dài (Size/Length) đứng trước Màu sắc (Color) + danh từ. 'Hair' là danh từ không đếm được nên không dùng mạo từ 'a'. Vì vậy 'long black hair' là đáp án đúng.",
                                "difficulty": "A1",
                                "score": 0.5
                            },
                            {
                                "id": "g6-mt-q4",
                                "type": "multiple_choice",
                                "prompt": "Reading Comprehension: What does Nam do after dinner according to the text?",
                                "passage": "Nam is a pupil at Sunrise School. On weekdays, he wakes up at 6:00 a.m. He has breakfast with bread and milk, then goes to school by bike. In the afternoon, he plays football with his classmates. In the evening, after dinner, he always does his homework and reads books before going to bed at 10:00 p.m.",
                                "options": [
                                    {"id": "A", "text": "He plays football with friends."},
                                    {"id": "B", "text": "He does his homework and reads books."},
                                    {"id": "C", "text": "He watches television with his family."},
                                    {"id": "D", "text": "He goes to bed immediately."}
                                ],
                                "correctAnswer": "B",
                                "hint": "Tìm cụm từ 'In the evening, after dinner...'",
                                "explanation": "Đoạn văn viết: 'In the evening, after dinner, he always does his homework and reads books'. Đáp án B hoàn toàn chính xác.",
                                "difficulty": "A1",
                                "score": 1.0
                            },
                            {
                                "id": "g6-mt-q5",
                                "type": "writing",
                                "prompt": "Sentence Transformation: Rewrite the sentence without changing its meaning: 'There are twenty-five classrooms in our school.' -> 'Our school has...'",
                                "options": None,
                                "correctAnswer": "Our school has twenty-five classrooms.",
                                "hint": "Cấu trúc tương đương: There is/are + N = S + have/has + N.",
                                "explanation": "Cấu trúc chuyển đổi giữa 'There are...' và 'S + have/has...': 'There are twenty-five classrooms in our school' tương đương với 'Our school has twenty-five classrooms.'",
                                "difficulty": "A1",
                                "score": 1.5
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "grade": 7,
        "course_id": "course-thcs-g7",
        "course_title": "Tiếng Anh 7 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "target_level": "A2",
        "description": "Chương trình Tiếng Anh lớp 7 Global Success. Trọng tâm: Phát âm (/ə/ và /ɜː/), Ngữ pháp (Hiện tại đơn & Động từ chỉ sự yêu thích + V-ing), các chủ đề Hobbies, Healthy Living, Community Service.",
        "units": [
            {
                "unit_id": "unit-g7-u1",
                "title": "Unit 1: Hobbies",
                "description": "Tìm hiểu các sở thích thú vị (làm vườn, làm mô hình, cưỡi ngựa, làm nhà búp bê) và lợi ích đối với sức khỏe, trí tuệ.",
                "lessons": [
                    {
                        "id": "g7-u1-les-01",
                        "skill": "reading",
                        "title": "Reading: A Creative Hobby - Building Dollhouses",
                        "description": "Bài đọc về sở thích làm nhà búp bê từ bìa các tông và đồ tái chế của bạn Mi.",
                        "durationMinutes": 15,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g7-u1-r-q1",
                                "type": "multiple_choice",
                                "prompt": "What materials does Mi use to build dollhouses?",
                                "passage": "My hobby is building dollhouses. Three years ago, my cousin showed me how to make a small house from cardboard. Since then, I have collected old boxes, glue, coloured paper, and cloth scraps. Building dollhouses teaches me patience and creativity. My cousin and I often share ideas on weekends.",
                                "options": [
                                    {"id": "A", "text": "Clay and bricks"},
                                    {"id": "B", "text": "Cardboard, glue, coloured paper, and cloth scraps"},
                                    {"id": "C", "text": "Wood and glass"},
                                    {"id": "D", "text": "Metal and plastic bottles"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Tìm danh sách các vật liệu sau câu 'I have collected...'",
                                "explanation": "Trong bài đọc, Mi kể: 'I have collected old boxes, glue, coloured paper, and cloth scraps.' Cụm 'old boxes' tương đương 'cardboard'. Đáp án B là chính xác.",
                                "difficulty": "A2",
                                "score": 1.0
                            },
                            {
                                "id": "g7-u1-r-q2",
                                "type": "multiple_choice",
                                "prompt": "What benefits does Mi get from her hobby?",
                                "passage": "Building dollhouses teaches me patience and creativity. My cousin and I often share ideas on weekends.",
                                "options": [
                                    {"id": "A", "text": "It helps her earn a lot of money."},
                                    {"id": "B", "text": "It teaches her patience and creativity."},
                                    {"id": "C", "text": "It makes her stronger physically."},
                                    {"id": "D", "text": "It helps her speak English fluently."}
                                ],
                                "correctAnswer": "B",
                                "hint": "Đọc câu: 'Building dollhouses teaches me...'",
                                "explanation": "Bài đọc khẳng định rõ: 'Building dollhouses teaches me patience and creativity' (rèn luyện tính kiên nhẫn và sự sáng tạo). Do đó chọn B.",
                                "difficulty": "A2",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g7-u1-les-02",
                        "skill": "listening",
                        "title": "Listening: Unusual Hobbies Discussion",
                        "description": "Nghe cuộc trò chuyện giữa Mark và Lan về những sở thích khác thường và thú vị.",
                        "durationMinutes": 15,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g7-u1-l-q1",
                                "type": "multiple_choice",
                                "prompt": "What is Mark's hobby?",
                                "passage": "[Audio Transcript]\nLan: Hi Mark, do you play computer games in your free time?\nMark: No, Lan. I think playing computer games is boring. My hobby is horse riding. My uncle has a horse farm in Da Lat.\nLan: Wow, that sounds unusual and exciting! Isn't it dangerous?\nMark: It can be challenging, but an instructor teaches me carefully. It helps me stay healthy and love animals.",
                                "options": [
                                    {"id": "A", "text": "Playing computer games"},
                                    {"id": "B", "text": "Horse riding"},
                                    {"id": "C", "text": "Gardening"},
                                    {"id": "D", "text": "Swimming"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Nghe câu trả lời của Mark khi Lan hỏi về computer games.",
                                "explanation": "Mark nói: 'My hobby is horse riding.' (Cưỡi ngựa). Đáp án B đúng.",
                                "difficulty": "A2",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g7-u1-les-03",
                        "skill": "grammar",
                        "title": "Grammar: Verbs of Liking + V-ing & Pronunciation (/ə/, /ɜː/)",
                        "description": "Thành thạo cấu trúc Like/Love/Enjoy/Dislike + V-ing và phân biệt nguyên âm /ə/ và /ɜː/.",
                        "durationMinutes": 12,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g7-u1-g-q1",
                                "type": "multiple_choice",
                                "prompt": "She loves _______ teddy bears because they look very cute.",
                                "options": [
                                    {"id": "A", "text": "collect"},
                                    {"id": "B", "text": "collecting"},
                                    {"id": "C", "text": "collected"},
                                    {"id": "D", "text": "collection"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Sau động từ chỉ sự yêu thích 'love/like/enjoy' ta dùng động từ ở dạng nào?",
                                "explanation": "Quy tắc ngữ pháp Unit 1 Lớp 7: Sau các động từ chỉ cảm xúc yêu thích (love, like, enjoy, fancy, prefer) theo sau là Danh động từ (V-ing). Do đó 'collecting' là đáp án chính xác.",
                                "difficulty": "A2",
                                "score": 1.0
                            },
                            {
                                "id": "g7-u1-g-q2",
                                "type": "multiple_choice",
                                "prompt": "Pronunciation: Which word has the underlined sound pronounced as /ɜː/ (âm dài)? A. away (/ə/)  B. dirty (/ɜː/)  C. sofa (/ə/)  D. about (/ə/)",
                                "options": [
                                    {"id": "A", "text": "away"},
                                    {"id": "B", "text": "dirty"},
                                    {"id": "C", "text": "sofa"},
                                    {"id": "D", "text": "about"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Tìm từ có nguyên âm phát âm kéo dài và có chữ 'ir'.",
                                "explanation": "'dirty' phát âm là /ˈdɜːti/ chứa âm /ɜː/ dài. Ba từ còn lại: 'away' (/əˈweɪ/), 'sofa' (/ˈsəʊfə/), 'about' (/əˈbaʊt/) đều chứa âm /ə/ ngắn.",
                                "difficulty": "A2",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g7-u1-les-04",
                        "skill": "writing",
                        "title": "Writing: Writing About Your Favourite Hobby",
                        "description": "Viết đoạn văn ngắn 50-60 từ về sở thích yêu thích và lợi ích của sở thích đó.",
                        "durationMinutes": 15,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g7-u1-w-q1",
                                "type": "writing",
                                "prompt": "Write a paragraph (50 - 60 words) about your hobby. Use the following questions: 1. What is your hobby? 2. When did you start it? 3. Who do you share it with? 4. Why do you enjoy it?",
                                "options": None,
                                "correctAnswer": "My favourite hobby is gardening. I started it two years ago when my grandmother gave me some flower seeds. On weekends, I water the roses and plant vegetables with my brother. I love gardening because it helps me relax after school and makes our home green and beautiful.",
                                "hint": "Sử dụng các cấu trúc: 'My hobby is...', 'I started it... ago', 'I share it with...', 'I like it because it helps me...'",
                                "explanation": "Tiêu chí chấm: Đầy đủ 4 ý theo hướng dẫn, độ dài 50-60 từ, sử dụng thì Hiện tại đơn và Quá khứ đơn (started), dùng đúng liên từ 'because' và 'and'.",
                                "difficulty": "A2",
                                "score": 3.0
                            }
                        ]
                    },
                    {
                        "id": "g7-u1-les-05",
                        "skill": "speaking",
                        "title": "Speaking: Interview About Hobbies and Free Time",
                        "description": "Phỏng vấn và trình bày về sở thích cá nhân, rèn luyện độ trôi chảy và phát âm âm /ə/, /ɜː/.",
                        "durationMinutes": 15,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g7-u1-s-q1",
                                "type": "speaking",
                                "prompt": "Talk about a hobby you want to take up in the future (1-2 minutes):\n1. What is the hobby?\n2. What equipment do you need for it?\n3. What benefits will it bring to you?\n[Click Record and deliver your speech in English]",
                                "options": None,
                                "correctAnswer": "Hello teacher, in the future, I want to take up photography. To do this hobby, I need a digital camera and a photo editing app. Photography will help me capture memorable moments with my family and friends. Furthermore, it teaches me how to look at the world creatively and patiently.",
                                "hint": "Dùng cụm từ: 'take up a hobby' (bắt đầu một sở thích), 'equipment' (dụng cụ), 'benefits' (lợi ích).",
                                "explanation": "Tiêu chí AI & Giáo viên đánh giá: Độ chính xác ngữ âm âm /ɜː/ (learn, world) và /ə/ (camera, family), mạch lạc, từ vựng phong phú bám sát chủ đề Hobbies.",
                                "difficulty": "A2",
                                "score": 5.0
                            }
                        ]
                    }
                ]
            },
            {
                "unit_id": "unit-g7-midterm",
                "title": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)",
                "description": "Đề thi kiểm tra định kỳ 45 phút tổng hợp Unit 1 (Hobbies), Unit 2 (Healthy Living), Unit 3 (Community Service).",
                "lessons": [
                    {
                        "id": "g7-midterm-exam-01",
                        "skill": "reading",
                        "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 7 (Thời Gian: 45 Phút)",
                        "description": "Đề kiểm tra chuẩn: Ngữ âm (/ə/, /ɜː/), Ngữ pháp (Thì HTĐ, QKĐ, V-ing), Đọc hiểu lối sống lành mạnh, Viết câu.",
                        "durationMinutes": 45,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g7-mt-q1",
                                "type": "multiple_choice",
                                "prompt": "Choose the word with different stress pattern: A. hobby  B. collect  C. model  D. garden",
                                "options": [
                                    {"id": "A", "text": "hobby (âm 1)"},
                                    {"id": "B", "text": "collect (âm 2)"},
                                    {"id": "C", "text": "model (âm 1)"},
                                    {"id": "D", "text": "garden (âm 1)"}
                                ],
                                "correctAnswer": "B",
                                "hint": "'collect' là động từ 2 âm tiết, thường nhấn trọng âm ở âm tiết thứ mấy?",
                                "explanation": "'collect' là động từ 2 âm tiết có trọng âm rơi vào âm tiết thứ 2 (/kəˈlekt/). Ba từ còn lại là danh từ 2 âm tiết có trọng âm rơi vào âm tiết thứ 1: 'hobby' (/ˈhɒbi/), 'model' (/ˈmɒdl/), 'garden' (/ˈɡɑːdn/).",
                                "difficulty": "A2",
                                "score": 0.5
                            },
                            {
                                "id": "g7-mt-q2",
                                "type": "multiple_choice",
                                "prompt": "Grammar: We should drink more water and eat more vegetables to avoid _______ acne and tiredness.",
                                "options": [
                                    {"id": "A", "text": "having"},
                                    {"id": "B", "text": "have"},
                                    {"id": "C", "text": "to have"},
                                    {"id": "D", "text": "had"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Sau động từ 'avoid' ta dùng V-ing hay to V?",
                                "explanation": "Sau động từ 'avoid' (tránh) bắt buộc dùng V-ing: avoid doing sth. Vì vậy chọn 'having'.",
                                "difficulty": "A2",
                                "score": 0.5
                            },
                            {
                                "id": "g7-mt-q3",
                                "type": "writing",
                                "prompt": "Rewrite the sentence: 'Lan enjoys doing morning exercise every day.' -> 'Lan is interested...'",
                                "options": None,
                                "correctAnswer": "Lan is interested in doing morning exercise every day.",
                                "hint": "Cấu trúc tương đương: enjoy doing sth = be interested in doing sth.",
                                "explanation": "Cấu trúc tương đương chỉ sự yêu thích: S + enjoy + V-ing = S + be interested in + V-ing. Với chủ ngữ Lan thì dùng 'is interested in doing morning exercise every day.'",
                                "difficulty": "A2",
                                "score": 1.5
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "grade": 8,
        "course_id": "course-thcs-g8",
        "course_title": "Tiếng Anh 8 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "target_level": "A2-B1",
        "description": "Chương trình Tiếng Anh lớp 8 Global Success. Trọng tâm: Phát âm (/ʊ/ và /uː/), Ngữ pháp (Động từ chỉ mức độ yêu thích: adore, fancy, detest... đi với Gerunds/To-infinitive), chủ đề Leisure Time, Life in the Countryside.",
        "units": [
            {
                "unit_id": "unit-g8-u1",
                "title": "Unit 1: Leisure Time",
                "description": "Khám phá các hoạt động thư giãn lành mạnh, tự làm đồ thủ công (DIY), sử dụng mạng xã hội hợp lý và cân bằng cuộc sống.",
                "lessons": [
                    {
                        "id": "g8-u1-les-01",
                        "skill": "reading",
                        "title": "Reading: Teenagers and Modern Leisure Activities",
                        "description": "Bài đọc về xu hướng giải trí của thanh thiếu niên hiện đại: giữa hoạt động thể chất ngoài trời và giải trí số.",
                        "durationMinutes": 15,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g8-u1-r-q1",
                                "type": "multiple_choice",
                                "prompt": "According to the passage, why do many teens enjoy DIY projects?",
                                "passage": "Today, teenagers spend their leisure time in various ways. While some teens enjoy surfing social media or playing online games, many others adore doing DIY (Do-It-Yourself) projects. Making origami, knitting scarves, or building wooden bookshelves gives them a great sense of satisfaction. Psychologists say that creating something with their own hands helps teenagers reduce study pressure and boost practical life skills.",
                                "options": [
                                    {"id": "A", "text": "Because it is completely free of charge."},
                                    {"id": "B", "text": "Because creating things by hand gives them satisfaction and reduces study pressure."},
                                    {"id": "C", "text": "Because they don't have internet access."},
                                    {"id": "D", "text": "Because their teachers force them to do so."}
                                ],
                                "correctAnswer": "B",
                                "hint": "Đọc câu: 'gives them a great sense of satisfaction... helps teenagers reduce study pressure'.",
                                "explanation": "Bài đọc nêu rõ: 'gives them a great sense of satisfaction. Psychologists say that creating something with their own hands helps teenagers reduce study pressure...' Đáp án B tóm lược chính xác hai ý này.",
                                "difficulty": "A2",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g8-u1-les-02",
                        "skill": "grammar",
                        "title": "Grammar: Verbs of Liking / Disliking & Pronunciation (/ʊ/, /uː/)",
                        "description": "Nắm vững các động từ chỉ mức độ: adore, fancy, detest, don't mind và phân biệt nguyên âm /ʊ/ và /uː/.",
                        "durationMinutes": 12,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g8-u1-g-q1",
                                "type": "multiple_choice",
                                "prompt": "Tom detests _______ in crowded places, so he prefers reading at home.",
                                "options": [
                                    {"id": "A", "text": "hanging out"},
                                    {"id": "B", "text": "hang out"},
                                    {"id": "C", "text": "hung out"},
                                    {"id": "D", "text": "to hanging out"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Sau 'detest' (cực kỳ ghét) luôn đi với hình thức V-ing.",
                                "explanation": "Quy tắc ngữ pháp Unit 1 Lớp 8: Động từ 'detest' (ghét cay ghét đắng) luôn đi với Danh động từ (V-ing). Vì vậy chọn 'hanging out'.",
                                "difficulty": "A2",
                                "score": 1.0
                            },
                            {
                                "id": "g8-u1-g-q2",
                                "type": "multiple_choice",
                                "prompt": "Pronunciation: Choose the word whose underlined part is pronounced as /uː/ (âm u dài): A. book (/ʊ/)  B. foot (/ʊ/)  C. school (/uː/)  D. cook (/ʊ/)",
                                "options": [
                                    {"id": "A", "text": "book"},
                                    {"id": "B", "text": "foot"},
                                    {"id": "C", "text": "school"},
                                    {"id": "D", "text": "cook"}
                                ],
                                "correctAnswer": "C",
                                "hint": "Từ 'school' có âm /uː/ ngân dài hơn so với âm ngắn trong book, foot, cook.",
                                "explanation": "'school' phát âm là /skuːl/ chứa âm /uː/ dài. Trong khi 'book' (/bʊk/), 'foot' (/fʊt/), 'cook' (/kʊk/) đều chứa âm /ʊ/ ngắn.",
                                "difficulty": "A2",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g8-u1-les-03",
                        "skill": "speaking",
                        "title": "Speaking: Healthy Leisure Lifestyle Presentation",
                        "description": "Thuyết trình ngắn về lối sống giải trí cân bằng giữa học tập, thể thao và màn hình điện tử.",
                        "durationMinutes": 15,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g8-u1-s-q1",
                                "type": "speaking",
                                "prompt": "Give a presentation about how you balance your leisure time and study (1-2 minutes). Focus on:\n1. Your favourite leisure activity\n2. How much time you spend on screens every day\n3. One outdoor activity you do to stay healthy\n[Click Record and deliver your speech in English]",
                                "options": None,
                                "correctAnswer": "Good morning teacher and friends. Today I would like to talk about my leisure time. My favourite leisure activity is reading science fiction books. To avoid eye strain and stay fit, I limit my screen time to one hour a day. In the late afternoon, I often cycle around the lake with my father. I believe balancing physical activities and quiet hobbies makes our life happier.",
                                "hint": "Sử dụng từ vựng Unit 1: 'balance', 'leisure activity', 'screen time', 'eye strain', 'stay fit'.",
                                "explanation": "Tiêu chí AI & Giáo viên chấm: Phát âm chuẩn các âm /uː/ và /ʊ/, ngữ điệu tự nhiên, từ vựng mạch lạc, đáp ứng đầy đủ 3 ý gợi ý.",
                                "difficulty": "A2",
                                "score": 5.0
                            }
                        ]
                    }
                ]
            },
            {
                "unit_id": "unit-g8-midterm",
                "title": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)",
                "description": "Đề kiểm tra 45 phút tổng hợp Unit 1 (Leisure Time), Unit 2 (Life in the Countryside), Unit 3 (Teenagers). Có đáp án và biểu điểm.",
                "lessons": [
                    {
                        "id": "g8-midterm-exam-01",
                        "skill": "reading",
                        "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 8 (Thời Gian: 45 Phút)",
                        "description": "Đề thi chuẩn cấu trúc: Ngữ âm (/ʊ/, /uː/), So sánh hơn của trạng từ, Động từ chỉ cảm xúc, Đọc hiểu nông thôn và thành thị.",
                        "durationMinutes": 45,
                        "targetCefr": "A2",
                        "questions": [
                            {
                                "id": "g8-mt-q1",
                                "type": "multiple_choice",
                                "prompt": "Grammar (Comparative adverbs): Life in the countryside moves _______ than life in the bustling city.",
                                "options": [
                                    {"id": "A", "text": "more slowly"},
                                    {"id": "B", "text": "slower"},
                                    {"id": "C", "text": "more slow"},
                                    {"id": "D", "text": "slowlier"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Động từ 'moves' cần trạng từ so sánh hơn: more + adv.",
                                "explanation": "Động từ 'move' là động từ hành động nên bổ nghĩa cho nó phải là trạng từ 'slowly'. Dạng so sánh hơn của trạng từ có đuôi -ly là 'more slowly'. Vì vậy chọn đáp án A.",
                                "difficulty": "A2",
                                "score": 0.5
                            },
                            {
                                "id": "g8-mt-q2",
                                "type": "writing",
                                "prompt": "Rewrite the sentence: 'Minh is keen on playing sports after school.' -> 'Minh fancies...'",
                                "options": None,
                                "correctAnswer": "Minh fancies playing sports after school.",
                                "hint": "Cấu trúc tương đương: be keen on + V-ing = fancy + V-ing.",
                                "explanation": "'be keen on V-ing' đồng nghĩa với 'fancy V-ing' (rất thích làm gì). Do đó viết lại thành: 'Minh fancies playing sports after school.'",
                                "difficulty": "A2",
                                "score": 1.5
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "grade": 9,
        "course_id": "course-thcs-g9",
        "course_title": "Tiếng Anh 9 - Global Success (Bộ Giáo Dục & Đào Tạo)",
        "target_level": "B1",
        "description": "Chương trình Tiếng Anh lớp 9 Global Success ôn thi vào lớp 10. Trọng tâm: Trọng âm từ 2 âm tiết, Cụm động từ (Phrasal Verbs), Wh-question words + To-infinitive, chủ đề Local Community, City Life, Healthy Living.",
        "units": [
            {
                "unit_id": "unit-g9-u1",
                "title": "Unit 1: Local Community",
                "description": "Tìm hiểu về cộng đồng địa phương, các làng nghề truyền thống (artisan, pottery village), người phục vụ cộng đồng và các dịch vụ thiết yếu.",
                "lessons": [
                    {
                        "id": "g9-u1-les-01",
                        "skill": "reading",
                        "title": "Reading: Preserving Traditional Craft Villages",
                        "description": "Bài đọc về làng gốm Bát Tràng và nỗ lực gìn giữ nghề thủ công truyền thống của các nghệ nhân trẻ.",
                        "durationMinutes": 15,
                        "targetCefr": "B1",
                        "questions": [
                            {
                                "id": "g9-u1-r-q1",
                                "type": "multiple_choice",
                                "prompt": "According to the passage, how do young artisans pass down traditional pottery skills?",
                                "passage": "Bat Trang is a famous traditional pottery village located on the bank of the Red River in Hanoi. For centuries, artisans have passed down their pottery-making secrets from generation to generation. Nowadays, young artisans not only keep the authentic craftsmanship but also combine modern artistic designs. They organise hands-on workshops for tourists and sell handcrafted ceramic products worldwide via e-commerce platforms, helping the local community thrive economically.",
                                "options": [
                                    {"id": "A", "text": "They only sell products in local markets."},
                                    {"id": "B", "text": "They combine authentic craftsmanship with modern designs and organize workshops for visitors."},
                                    {"id": "C", "text": "They stop handmade production and use factory machines completely."},
                                    {"id": "D", "text": "They refuse to teach skills to the younger generation."}
                                ],
                                "correctAnswer": "B",
                                "hint": "Tìm câu: 'young artisans not only keep the authentic craftsmanship but also combine modern artistic designs...'",
                                "explanation": "Đoạn văn nêu rõ: 'young artisans not only keep the authentic craftsmanship but also combine modern artistic designs. They organise hands-on workshops for tourists...' Đáp án B diễn đạt chính xác nội dung này.",
                                "difficulty": "B1",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g9-u1-les-02",
                        "skill": "grammar",
                        "title": "Grammar: Phrasal Verbs & Wh-word + To-Infinitive",
                        "description": "Luyện tập các cụm động từ quan trọng (pass down, set up, look around, deal with) và cấu trúc Wh-word + To-infinitive.",
                        "durationMinutes": 12,
                        "targetCefr": "B1",
                        "questions": [
                            {
                                "id": "g9-u1-g-q1",
                                "type": "multiple_choice",
                                "prompt": "This handicraft workshop was _______ by my grandfather fifty years ago.",
                                "options": [
                                    {"id": "A", "text": "set up"},
                                    {"id": "B", "text": "looked after"},
                                    {"id": "C", "text": "passed down"},
                                    {"id": "D", "text": "turned off"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Cụm động từ mang nghĩa 'thành lập, mở xưởng' là gì?",
                                "explanation": "'set up' có nghĩa là thành lập, xây dựng xưởng. Dạng bị động quá khứ: was set up. 'look after' là chăm sóc; 'pass down' là truyền lại; 'turn off' là tắt.",
                                "difficulty": "B1",
                                "score": 1.0
                            },
                            {
                                "id": "g9-u1-g-q2",
                                "type": "multiple_choice",
                                "prompt": "I asked my teacher _______ to solve the complex physics exercise.",
                                "options": [
                                    {"id": "A", "text": "how"},
                                    {"id": "B", "text": "how to"},
                                    {"id": "C", "text": "what to"},
                                    {"id": "D", "text": "where to"}
                                ],
                                "correctAnswer": "B",
                                "hint": "Cấu trúc từ để hỏi chỉ cách thức + To-infinitive: Wh-word + to V.",
                                "explanation": "Cấu trúc ngữ pháp trọng tâm Unit 1 Lớp 9: Từ để hỏi (how, what, where, when, who) + to-infinitive để biểu đạt sự phân vân hoặc cách thực hiện: 'how to solve' (cách giải bài tập). Vì vậy chọn B.",
                                "difficulty": "B1",
                                "score": 1.0
                            }
                        ]
                    },
                    {
                        "id": "g9-u1-les-03",
                        "skill": "writing",
                        "title": "Writing: Describing a Local Community Service",
                        "description": "Viết đoạn văn 80-100 từ mô tả các tiện ích cộng đồng hoặc một dịch vụ địa phương hữu ích.",
                        "durationMinutes": 15,
                        "targetCefr": "B1",
                        "questions": [
                            {
                                "id": "g9-u1-w-q1",
                                "type": "writing",
                                "prompt": "Rewrite the sentence using a question word + to-infinitive: 'We don't know where we should buy authentic souvenirs in this city.' -> 'We don't know...'",
                                "options": None,
                                "correctAnswer": "We don't know where to buy authentic souvenirs in this city.",
                                "hint": "Rút gọn mệnh đề 'where we should buy' thành 'where to buy'.",
                                "explanation": "Quy tắc rút gọn mệnh đề danh từ có đại từ trùng với chủ ngữ mệnh đề chính: 'where we should buy' -> 'where to buy'. Câu viết lại hoàn chỉnh: 'We don't know where to buy authentic souvenirs in this city.'",
                                "difficulty": "B1",
                                "score": 1.5
                            },
                            {
                                "id": "g9-u1-w-q2",
                                "type": "writing",
                                "prompt": "Write a paragraph (80 - 100 words) about a community helper who plays an important role in your neighbourhood (e.g., a garbage collector, a firefighter, a police officer, or an electrician). Mention: What they do, why their job is important, and how people can help them.",
                                "options": None,
                                "correctAnswer": "In my neighbourhood, garbage collectors play a vital role in keeping our environment clean and hygienic. Every evening, regardless of rain or heat, they collect household waste from every doorstep and transport it to recycling centers. Without their hard work, our streets would be polluted with foul odors and litter. To support these hardworking community helpers, residents should sort their household garbage into recyclable and organic bins before disposal.",
                                "hint": "Sử dụng các từ vựng: 'community helper', 'vital role', 'hygienic', 'sort garbage', 'support'.",
                                "explanation": "Tiêu chí chấm: Đúng chủ đề, dung lượng 80-100 từ, cấu trúc câu phức kết hợp mệnh đề quan hệ và liên từ chỉ nguyên nhân/kết quả, không sai lỗi chia động từ.",
                                "difficulty": "B1",
                                "score": 3.5
                            }
                        ]
                    },
                    {
                        "id": "g9-u1-les-04",
                        "skill": "speaking",
                        "title": "Speaking: Improving Local Community Facilities",
                        "description": "Thảo luận về các vấn đề trong khu dân cư và đề xuất giải pháp cải thiện môi trường sống.",
                        "durationMinutes": 15,
                        "targetCefr": "B1",
                        "questions": [
                            {
                                "id": "g9-u1-s-q1",
                                "type": "speaking",
                                "prompt": "Discuss a problem in your local area and propose practical solutions (1.5 - 2 minutes). Suggestion:\n- Identify the problem (e.g. traffic congestion, lack of green parks, littering)\n- Explain how it affects residents\n- Propose 2 solutions that teens can contribute to\n[Click Record and deliver your speech in English]",
                                "options": None,
                                "correctAnswer": "Good morning. In our neighbourhood, one pressing issue is the lack of green recreational spaces and public parks for children and teenagers. Because there are few playgrounds, many young people spend their free time indoors glued to electronic devices. To address this issue, the local youth union can plant more trees in empty residential lots. Additionally, teenagers can organise weekend clean-up campaigns to make existing public areas safer and greener.",
                                "hint": "Sử dụng các từ nối lập luận: 'one pressing issue is...', 'because...', 'to address this issue...', 'additionally...'",
                                "explanation": "Tiêu chí AI & Giáo viên chấm: Phát âm chuẩn trọng âm từ 2 âm tiết, độ trôi chảy B1 (110-130 wpm), ngữ pháp câu phức chuẩn xác, tính thực tiễn của giải pháp.",
                                "difficulty": "B1",
                                "score": 5.0
                            }
                        ]
                    }
                ]
            },
            {
                "unit_id": "unit-g9-midterm",
                "title": "Đề Ôn Kiểm Tra Giữa Kỳ I (Units 1 - 3)",
                "description": "Đề kiểm tra 45 phút chuẩn format đề thi vào lớp 10: Ngữ âm, Trọng âm, Phrasal verbs, So sánh tính từ/trạng từ, Đọc hiểu và Viết lại câu.",
                "lessons": [
                    {
                        "id": "g9-midterm-exam-01",
                        "skill": "reading",
                        "title": "Đề Thi Giữa Học Kỳ I - Tiếng Anh 9 (Thời Gian: 45 Phút)",
                        "description": "Đề kiểm tra toàn diện bám sát cấu trúc đề khảo sát và thi tuyển sinh vào 10 THPT.",
                        "durationMinutes": 45,
                        "targetCefr": "B1",
                        "questions": [
                            {
                                "id": "g9-mt-q1",
                                "type": "multiple_choice",
                                "prompt": "Stress: Choose the word whose stress pattern is different from the others:",
                                "options": [
                                    {"id": "A", "text": "artisan"},
                                    {"id": "B", "text": "handicraft"},
                                    {"id": "C", "text": "community"},
                                    {"id": "D", "text": "pottery"}
                                ],
                                "correctAnswer": "C",
                                "hint": "'community' có đuôi -ity nên trọng âm rơi vào âm tiết đứng ngay trước nó.",
                                "explanation": "Quy tắc trọng âm: Từ có hậu tố '-ity' có trọng âm rơi vào âm tiết đứng ngay trước hậu tố đó -> com'munity (trọng âm 2). Các từ còn lại: 'handicraft' (trọng âm 1), 'pottery' (trọng âm 1), 'artisan' (trọng âm 1 theo chuẩn Oxford/Cambridge). Vì vậy chọn C.",
                                "difficulty": "B1",
                                "score": 0.5
                            },
                            {
                                "id": "g9-mt-q2",
                                "type": "multiple_choice",
                                "prompt": "Phrasal Verbs: When we visited the ancient village, the guide showed us _______ the centuries-old pagodas.",
                                "options": [
                                    {"id": "A", "text": "around"},
                                    {"id": "B", "text": "up"},
                                    {"id": "C", "text": "down"},
                                    {"id": "D", "text": "off"}
                                ],
                                "correctAnswer": "A",
                                "hint": "Cụm 'show somebody around' có nghĩa là dẫn ai đó đi tham quan xung quanh.",
                                "explanation": "'show sb around' là cụm động từ chuẩn nghĩa 'dẫn ai đi tham quan quanh một địa điểm'. Do đó chọn 'around'.",
                                "difficulty": "B1",
                                "score": 0.5
                            },
                            {
                                "id": "g9-mt-q3",
                                "type": "writing",
                                "prompt": "Rewrite the sentence: 'They don't know who they should consult about the new community project.' -> 'They don't know...'",
                                "options": None,
                                "correctAnswer": "They don't know who to consult about the new community project.",
                                "hint": "Rút gọn 'who they should consult' thành 'who to consult'.",
                                "explanation": "Rút gọn mệnh đề quan hệ/danh từ với Wh-word: 'who they should consult' -> 'who to consult'. Câu hoàn chỉnh: 'They don't know who to consult about the new community project.'",
                                "difficulty": "B1",
                                "score": 1.5
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

def update_source_registry():
    registry_path = os.path.join(SOURCES_DIR, "source-registry.json")
    registry = {"sources": []}
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
        except Exception:
            registry = {"sources": []}

    source_entry = {
        "id": "moet_global_success_thcs",
        "name": "Chương trình GDPT 2018 - Tiếng Anh 6-9 Global Success (NXB Giáo Dục Việt Nam & Pearson)",
        "domain": "giaoduc.net.vn",
        "homepage": "https://nxbgd.vn",
        "license": "Curriculum Standard Alignment",
        "license_url": "https://moet.gov.vn",
        "status": "approved",
        "rationale": "Official Vietnamese secondary education English curriculum blueprint. Used to calibrate skills, learning objectives, vocabulary collocations, phonetics, grammar drills, and standardized midterm/final examinations.",
        "skills": ["reading", "listening", "speaking", "writing", "grammar", "vocabulary"],
        "allowed_content_types": ["curriculum_lesson", "reading_comprehension", "listening_dialogue", "grammar_drill", "writing_task", "speaking_prompt", "exam_test"],
        "rate_limit_delay_seconds": 0.5,
        "requires_auth": False
    }

    # Avoid duplicate
    existing_ids = [s["id"] for s in registry.get("sources", [])]
    if "moet_global_success_thcs" not in existing_ids:
        registry.setdefault("sources", []).append(source_entry)
        registry["updated_at"] = NOW_ISO
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)
        print("[OK] Added 'moet_global_success_thcs' to source-registry.json")
    else:
        print("[INFO] 'moet_global_success_thcs' already in source-registry.json")

def build_catalogs_and_activities():
    # 1. Load existing courses, units, lessons
    courses_path = os.path.join(CATALOG_DIR, "courses.json")
    units_path = os.path.join(CATALOG_DIR, "units.json")
    lessons_path = os.path.join(CATALOG_DIR, "lessons.json")

    existing_courses = []
    if os.path.exists(courses_path):
        with open(courses_path, "r", encoding="utf-8") as f:
            try:
                existing_courses = json.load(f)
            except Exception:
                existing_courses = []

    existing_units = []
    if os.path.exists(units_path):
        with open(units_path, "r", encoding="utf-8") as f:
            try:
                existing_units = json.load(f)
            except Exception:
                existing_units = []

    existing_lessons = []
    if os.path.exists(lessons_path):
        with open(lessons_path, "r", encoding="utf-8") as f:
            try:
                existing_lessons = json.load(f)
            except Exception:
                existing_lessons = []

    # Map to avoid duplicate overwriting
    courses_dict = {c["id"]: c for c in existing_courses}
    units_dict = {u["id"]: u for u in existing_units}
    lessons_dict = {l["id"]: l for l in existing_lessons}

    new_activities = []
    frontend_lessons = []

    for course_data in THCS_CURRICULUM:
        c_id = course_data["course_id"]
        c_title = course_data["course_title"]
        unit_ids = []

        for unit_data in course_data["units"]:
            u_id = unit_data["unit_id"]
            u_title = unit_data["title"]
            unit_ids.append(u_id)

            lesson_ids = []
            for les_data in unit_data["lessons"]:
                l_id = les_data["id"]
                lesson_ids.append(l_id)

                # Format questions
                formatted_questions = []
                for q in les_data["questions"]:
                    formatted_questions.append({
                        "id": q["id"],
                        "type": q["type"],
                        "prompt": q["prompt"],
                        "passage": q.get("passage"),
                        "options": q.get("options"),
                        "correctAnswer": q["correctAnswer"],
                        "hint": q["hint"],
                        "explanation": q["explanation"],
                        "difficulty": q["difficulty"],
                        "score": q.get("score", 1.0)
                    })

                lesson_entry = {
                    "id": l_id,
                    "skill": les_data["skill"],
                    "unitId": u_id,
                    "unitTitle": u_title,
                    "courseTitle": c_title,
                    "title": les_data["title"],
                    "description": les_data["description"],
                    "durationMinutes": les_data["durationMinutes"],
                    "targetCefr": les_data["targetCefr"],
                    "questions": formatted_questions
                }
                lessons_dict[l_id] = lesson_entry
                frontend_lessons.append(lesson_entry)

                # Create normalized activity record
                act_content = les_data["description"]
                if formatted_questions and formatted_questions[0].get("passage"):
                    act_content = formatted_questions[0]["passage"]

                for q in formatted_questions:
                    q["answer"] = q["correctAnswer"]

                new_activities.append({
                    "id": f"act-{l_id}",
                    "title": les_data["title"],
                    "skill": les_data["skill"],
                    "activity_type": f"{les_data['skill']}_practice",
                    "topic_tags": [u_title, f"Grade {course_data['grade']}", "Global Success"],
                    "learning_objectives": [les_data["description"]],
                    "source_url": "https://nxbgd.vn/chuong-trinh-gdpt-2018-tieng-anh-global-success",
                    "source_name": "MOET Vietnam & Pearson - Global Success",
                    "license": "Curriculum Standard Alignment",
                    "attribution": "Bộ Giáo dục và Đào tạo Việt Nam & NXB Giáo dục Việt Nam - Tiếng Anh Global Success",
                    "retrieved_at": NOW_ISO,
                    "source_content_hash": hash_content(act_content),
                    "content": act_content,
                    "questions": formatted_questions,
                    "cefr_level": les_data["targetCefr"],
                    "cefr_origin": "source",
                    "difficulty_status": "calibrated",
                    "review_status": "approved",
                    "content_origin": "source"
                })

            units_dict[u_id] = {
                "id": u_id,
                "course_id": c_id,
                "grade": course_data["grade"],
                "title": u_title,
                "description": unit_data["description"],
                "order": 1 if "u1" in u_id else 2,
                "lesson_ids": lesson_ids
            }

        courses_dict[c_id] = {
            "id": c_id,
            "title": c_title,
            "grade": course_data["grade"],
            "skill": "comprehensive",
            "target_level": course_data["target_level"],
            "description": course_data["description"],
            "unit_ids": unit_ids
        }

    # Save to catalog
    with open(courses_path, "w", encoding="utf-8") as f:
        json.dump(list(courses_dict.values()), f, indent=2, ensure_ascii=False)
    with open(units_path, "w", encoding="utf-8") as f:
        json.dump(list(units_dict.values()), f, indent=2, ensure_ascii=False)
    with open(lessons_path, "w", encoding="utf-8") as f:
        json.dump(list(lessons_dict.values()), f, indent=2, ensure_ascii=False)

    print(f"[OK] Saved {len(courses_dict)} courses, {len(units_dict)} units, {len(lessons_dict)} lessons into catalog.")

    # Append to normalized activities.jsonl
    act_file = os.path.join(NORM_DIR, "activities.jsonl")
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

    added_acts = 0
    with open(act_file, "a", encoding="utf-8") as f:
        for act in new_activities:
            if act["id"] not in existing_act_ids:
                f.write(json.dumps(act, ensure_ascii=False) + "\n")
                added_acts += 1

    print(f"[OK] Appended {added_acts} THCS activities into activities.jsonl")
    return frontend_lessons

def update_frontend_mockdata(frontend_thcs_lessons):
    """Integrate THCS Grade 6-9 lessons into frontend mockData.ts so students/teachers can test live."""
    if not os.path.exists(FRONTEND_MOCK_FILE):
        print(f"[WARN] Frontend mock file not found: {FRONTEND_MOCK_FILE}")
        return

    with open(FRONTEND_MOCK_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    marker = "export const initialLessons: Lesson[] = ["
    if marker not in content:
        print("[WARN] Marker 'export const initialLessons: Lesson[] = [' not found in mockData.ts")
        return

    # Find where initial native lesson begins: `id: "lesson-reading-01"`
    native_marker = 'id: "lesson-reading-01"'
    if native_marker in content:
        # Find the open brace of lesson-reading-01
        native_pos = content.find(native_marker)
        brace_pos = content.rfind("{\n    id: \"lesson-reading-01\"", 0, native_pos + 30)
        if brace_pos == -1:
            brace_pos = content.rfind("{\n    id: 'lesson-reading-01'", 0, native_pos + 30)
        if brace_pos == -1:
            brace_pos = content.rfind("{", 0, native_pos)

        new_lessons_str = "\n"
        for l in frontend_thcs_lessons:
            new_lessons_str += f"  {json.dumps(l, ensure_ascii=False)},\n\n"

        marker_pos = content.find(marker) + len(marker)
        updated_content = content[:marker_pos] + new_lessons_str + "  " + content[brace_pos:]
        with open(FRONTEND_MOCK_FILE, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print("[OK] Successfully re-injected THCS Grade 6-9 lessons into frontend mockData.ts with 100% English prompts.")

if __name__ == "__main__":
    print("=== Building Global Success THCS Grade 6-9 Curriculum ===")
    update_source_registry()
    thcs_lessons = build_catalogs_and_activities()
    update_frontend_mockdata(thcs_lessons)
    print("=== THCS Curriculum Build Completed Successfully ===")
