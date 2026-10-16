import urllib.request
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode('utf-8', errors='ignore')

def parse_feelgood_quiz(url, limit=10):
    html = fetch(url)
    ans_arr_m = re.search(r'var\s+answers\s*=\s*\[([^\]]+)\]', html)
    script_answers = None
    if ans_arr_m:
        script_answers = [int(x.strip()) for x in ans_arr_m.group(1).split(',') if x.strip().isdigit()]

    qblocks = re.findall(r'<div class="qblock"[^>]*>[\s\S]*?</div>\s*</div>', html)
    exercises = []
    for i, q in enumerate(qblocks):
        text_m = re.search(r'<div class="q-text">([\s\S]*?)</div>', q)
        if not text_m:
            continue
        prompt_clean = re.sub(r'<span class="q-num">.*?</span>', '', text_m.group(1))
        prompt_clean = re.sub(r'^\d+\.\s*', '', re.sub(r'<[^>]+>', ' ', prompt_clean)).strip()
        options = [o.strip() for o in re.findall(r'<label><input[^>]*>([^<]+)</label>', q) if o.strip()]
        if not options:
            continue

        correct_opt = None
        if script_answers and i < len(script_answers):
            idx = script_answers[i]
            if 0 <= idx < len(options):
                correct_opt = options[idx]

        if not correct_opt:
            fb_m = re.search(r'Correct answer:\s*<strong>([^<]+)</strong>', q)
            if fb_m:
                correct_raw = fb_m.group(1).strip()
                correct_opt = next((o for o in options if o.strip().lower() == correct_raw.lower()), None)

        if not correct_opt:
            continue

        exercises.append({
            'prompt': prompt_clean,
            'options': options,
            'correctAnswer': correct_opt,
            'explanation': f"Đáp án chuẩn xác là '{correct_opt}'. Căn cứ theo quy tắc ngữ pháp của chủ điểm này."
        })
        if len(exercises) >= limit:
            break
    return exercises

def crawl_all():
    print("1. Crawling Grammar quizzes from LearnEnglishFeelGood.com...")
    grammar_sources = [
        {
            'id': 'les-006',
            'topicId': 'top-005',
            'title': 'Hiện tại đơn vs. Hiện tại tiếp diễn (Present Simple vs. Present Continuous)',
            'summary': 'Phân biệt hành động thường nhật, thói quen và chân lý (Hiện tại đơn) với hành động đang xảy ra tại thời điểm nói hoặc kế hoạch tương lai gần (Hiện tại tiếp diễn).',
            'level': 'A2',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/simple-present-present-continuous1.html',
            'body': """### 1. Hiện tại đơn (Present Simple)
- **Công thức:**
  - Khẳng định: S + V(s/es)
  - Phủ định: S + do/does not + V_inf
  - Nghi vấn: Do/Does + S + V_inf?
- **Cách dùng:** Diễn tả thói quen, hành động lặp đi lặp lại (every day, often, always, usually) hoặc chân lý, sự thật hiển nhiên.
- **Ví dụ:** She drinks coffee every morning. / The sun rises in the east.

### 2. Hiện tại tiếp diễn (Present Continuous)
- **Công thức:** S + am/is/are + V-ing
- **Cách dùng:** Diễn tả hành động đang diễn ra ngay lúc nói (now, right now, at the moment) hoặc xu hướng thay đổi.
- **Lưu ý:** Không dùng thì tiếp diễn với các động từ chỉ cảm giác, tri giác, sở hữu (stative verbs) như *know, understand, believe, love, hate, want, like*.
- **Ví dụ:** I am studying English right now. / Listen! Someone is knocking on the door.""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Simple Present or Present Continuous?)'
        },
        {
            'id': 'les-007',
            'topicId': 'top-005',
            'title': 'Quá khứ đơn vs. Hiện tại hoàn thành (Past Simple vs. Present Perfect)',
            'summary': 'Quy tắc phân biệt hành động đã kết thúc tại một thời điểm xác định trong quá khứ và hành động xảy ra không rõ thời điểm hoặc còn liên hệ tới hiện tại.',
            'level': 'B1',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/simple-past-present-perfect1.html',
            'body': """### 1. Quá khứ đơn (Past Simple)
- **Dấu hiệu nhận biết:** *yesterday, last week, in 1999, two days ago, when I was a child*.
- **Cách dùng:** Dùng cho hành động ĐÃ HOÀN TOÀN CHẤM DỨT tại một thời điểm cụ thể trong quá khứ, không còn tiếp diễn hay ảnh hưởng trực tiếp đến hiện tại.
- **Ví dụ:** I saw that movie yesterday. (Thời điểm xác định: yesterday)

### 2. Hiện tại hoàn thành (Present Perfect)
- **Công thức:** S + have/has + V3/ed
- **Dấu hiệu nhận biết:** *already, yet, just, ever, never, since, for, so far, recently*.
- **Cách dùng:**
  - Hành động xảy ra ở quá khứ nhưng thời gian KHÔNG được xác định.
  - Hành động bắt đầu ở quá khứ và vẫn đang tiếp diễn ở hiện tại (*I have lived here for 5 years*).
  - Trải nghiệm, kinh nghiệm sống (*Have you ever visited London?*).""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Simple Past vs. Present Perfect)'
        },
        {
            'id': 'les-008',
            'topicId': 'top-005',
            'title': 'Quá khứ đơn vs. Quá khứ tiếp diễn (Past Simple vs. Past Continuous)',
            'summary': 'Diễn đạt một hành động đang diễn ra trong quá khứ thì có một hành động khác xen vào (cấu trúc When / While).',
            'level': 'A2',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/simple-past-past-continuous1.html',
            'body': """### Phối hợp thì Quá khứ đơn và Quá khứ tiếp diễn
- **Quy tắc cơ bản:**
  - Hành động kéo dài liên tục làm nền: dùng **Quá khứ tiếp diễn** (was/were + V-ing).
  - Hành động ngắn, đột ngột xen vào: dùng **Quá khứ đơn** (V2/ed).
- **Liên từ thường dùng:**
  - `While` thường đi với Quá khứ tiếp diễn: *While I was sleeping, the phone rang.*
  - `When` thường đi với Quá khứ đơn: *I was cooking dinner when my mother arrived.*
- **Hai hành động song song:** Khi hai hành động cùng xảy ra đồng thời trong quá khứ: *While John was reading, Mary was playing the piano.*""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Simple Past or Past Continuous?)'
        },
        {
            'id': 'les-009',
            'topicId': 'top-006',
            'title': 'Câu điều kiện loại 1 (First Conditional: Real Possibility)',
            'summary': 'Diễn tả điều kiện có thật hoặc hoàn toàn có thể xảy ra ở hiện tại hoặc tương lai.',
            'level': 'A2',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/grammar-firstconditional1.html',
            'body': """### Cấu trúc Câu điều kiện loại 1 (First Conditional)
- **Công thức:**
  - Mệnh đề `If` (Điều kiện): **If + S + V(s/es)** (Hiện tại đơn)
  - Mệnh đề chính (Kết quả): **S + will / can / may + V_inf** (Tương lai đơn)
- **Cách dùng:**
  - Dùng để nói về một sự việc, hành động có khả năng xảy ra ở hiện tại hoặc tương lai nếu điều kiện được thỏa mãn.
- **Ví dụ:**
  - *If it rains tomorrow, we will stay at home.*
  - *If you study hard, you will pass the examination.*
- **Lưu ý:** Không dùng `will` trong mệnh đề `If` (*sai: If you will study...*).""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: First Conditional Practice)'
        },
        {
            'id': 'les-010',
            'topicId': 'top-006',
            'title': 'Câu điều kiện loại 2 (Second Conditional: Unreal Present)',
            'summary': 'Diễn tả tình huống giả định, không có thật hoặc trái ngược với thực tế ở hiện tại hoặc tương lai.',
            'level': 'B1',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/grammar-secondconditional1.html',
            'body': """### Cấu trúc Câu điều kiện loại 2 (Second Conditional)
- **Công thức:**
  - Mệnh đề `If`: **If + S + V2/ed** (Quá khứ đơn; to be dùng `were` cho mọi ngôi)
  - Mệnh đề chính: **S + would / could / might + V_inf**
- **Cách dùng:**
  - Giả định tình huống trái với thực tế ở hiện tại: *If I had a million dollars, I would buy a house on the beach.* (Thực tế: hiện tại tôi không có 1 triệu đô).
  - Đưa ra lời khuyên: *If I were you, I would accept that job offer.*
- **So sánh:**
  - Loại 1: *If I see him, I will tell him.* (Khả năng gặp là có thật)
  - Loại 2: *If I met the President, I would ask him...* (Rất khó xảy ra, chỉ là tưởng tượng)""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Second Conditional Practice)'
        },
        {
            'id': 'les-011',
            'topicId': 'top-007',
            'title': 'Động từ khuyết thiếu (Modal Verbs: Can, Should, Must, Might)',
            'summary': 'Sử dụng các động từ tình thái để diễn đạt khả năng (ability), lời khuyên (advice), sự bắt buộc (obligation) và khả năng suy đoán (speculation).',
            'level': 'B1',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/esl-mixed-modals1.html',
            'body': """### Các Động từ khuyết thiếu thông dụng và sắc thái nghĩa
1. **Should / Ought to:** Dùng để đưa ra lời khuyên, ý kiến nên làm gì.
   - *You look tired. You should go to sleep.*
2. **Must vs. Have to:** Diễn tả sự bắt buộc, nhiệm vụ cần làm.
   - *Must:* Bắt buộc xuất phát từ cảm xúc hoặc mệnh lệnh của người nói (*I must study harder*).
   - *Have to:* Bắt buộc do luật pháp, quy định khách quan (*Students have to wear uniforms*).
3. **Can / Could / Be able to:** Khả năng, năng lực.
   - *Can you speak Spanish?*
4. **May / Might:** Khả năng có thể xảy ra trong hiện tại hoặc tương lai (mức độ chắc chắn khoảng 50%).
   - *Take an umbrella; it might rain later.*""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Mixed Modals)'
        },
        {
            'id': 'les-012',
            'topicId': 'top-007',
            'title': 'Mệnh đề trạng ngữ (Adverb Clauses of Time, Cause & Concession)',
            'summary': 'Nối kết các mệnh đề phụ trạng ngữ bằng liên từ phụ thuộc: Although, Because, While, As soon as, Even if.',
            'level': 'B1',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/adverb-clauses1.html',
            'body': """### Các loại Mệnh đề trạng ngữ quan trọng
1. **Mệnh đề trạng ngữ chỉ sự nhượng bộ (Concession):**
   - *Although / Even though / Though + S + V:* Mặc dù...
   - *Although it rained heavily, we still went camping.*
2. **Mệnh đề trạng ngữ chỉ nguyên nhân (Reason/Cause):**
   - *Because / Since / As + S + V:* Bởi vì...
   - *Since you are already here, let's start the meeting.*
3. **Mệnh đề trạng ngữ chỉ thời gian (Time):**
   - *When, While, Before, After, As soon as, Until.*
   - *I will call you as soon as I arrive at the airport.* (Lưu ý: mệnh đề thời gian không chia thì tương lai).""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Adverb Clauses)'
        },
        {
            'id': 'les-013',
            'topicId': 'top-007',
            'title': 'Đại từ quan hệ (Relative Pronouns: Who, Whom, Which, Whose, Where)',
            'summary': 'Kết nối các mệnh đề quan hệ để bổ nghĩa cho danh từ chỉ người, vật, quyền sở hữu hoặc nơi chốn.',
            'level': 'B1',
            'kind': 'GRAMMAR',
            'url': 'https://www.learnenglishfeelgood.com/english-relative-pronouns2.html',
            'body': """### Phân loại và cách sử dụng Đại từ quan hệ
1. **Who:** Đại từ thay thế cho danh từ chỉ người, đóng vai trò chủ ngữ hoặc tân ngữ trong mệnh đề quan hệ.
   - *The man who called you is my uncle.*
2. **Whom:** Đại từ thay thế cho danh từ chỉ người, đóng vai trò tân ngữ (trang trọng, thường đứng sau giới từ).
   - *The woman to whom you were speaking is the headmaster.*
3. **Which:** Đại từ thay thế cho danh từ chỉ sự vật, hiện tượng hoặc con vật.
   - *This is the book which won the literary prize.*
4. **Whose:** Đại từ chỉ sở hữu cho người hoặc vật.
   - *That is the student whose essay was published.*
5. **Where:** Trạng từ quan hệ chỉ nơi chốn (= in/at which).
   - *This is the village where I grew up.*""",
            'sourceAttribution': 'LearnEnglishFeelGood.com (ESL Grammar Exercise: Relative Pronouns)'
        }
    ]

    crawled_lessons = []
    for item in grammar_sources:
        print(f"  Parsing: {item['title']} from {item['url']}...")
        exs = parse_feelgood_quiz(item['url'], limit=10)
        formatted_exercises = []
        for idx, ex in enumerate(exs):
            formatted_exercises.append({
                'id': f"ex-{item['id'][4:]}-{idx+1:02d}",
                'kind': 'SINGLE_CHOICE',
                'prompt': ex['prompt'],
                'options': ex['options'],
                'correctAnswer': ex['correctAnswer'],
                'acceptedAnswers': [ex['correctAnswer']],
                'explanation': ex['explanation'],
                'segmentId': None
            })
        print(f"    -> Extracted {len(formatted_exercises)} valid single-choice exercises.")
        crawled_lessons.append({
            'id': item['id'],
            'topicId': item['topicId'],
            'title': item['title'],
            'summary': item['summary'],
            'level': item['level'],
            'kind': item['kind'],
            'body': item['body'],
            'audioUrl': None,
            'transcript': [],
            'sourceAttribution': item['sourceAttribution'],
            'published': True,
            'exercises': formatted_exercises
        })

    print("\n2. Crawling IELTS Academic Reading Passages and Tests...")
    
    # IELTS 1: Bioluminescence (sifu-ewu)
    print("  Fetching IELTS Bioluminescence from sifu-ewu...")
    sifu_ts = fetch('https://raw.githubusercontent.com/sifu-ewu/ielts-reading-mock-test/main/src/data/mockTestData.ts')
    
    # extract passage 1 content
    p1_m = re.search(r"id:\s*'passage-1'[\s\S]*?content:\s*`([\s\S]*?)`", sifu_ts)
    p1_content = p1_m.group(1).strip() if p1_m else ""
    
    # Questions for passage 1 TFNG (q6-q9) + Headings
    p1_exercises = [
        {
            'id': 'ex-014-01',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "Bioluminescence is more common in land-dwelling creatures than in marine life."',
            'options': ['TRUE', 'FALSE', 'NOT GIVEN'],
            'correctAnswer': 'FALSE',
            'acceptedAnswers': ['FALSE', 'False', 'false'],
            'explanation': 'In Paragraph A, the text states: "While a few land-dwelling insects and fungi possess this trait, it is in the oceans that bioluminescence truly flourishes."',
            'segmentId': None
        },
        {
            'id': 'ex-014-02',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "The enzyme luciferase produces light without creating any heat whatsoever."',
            'options': ['TRUE', 'FALSE', 'NOT GIVEN'],
            'correctAnswer': 'FALSE',
            'acceptedAnswers': ['FALSE', 'False', 'false'],
            'explanation': 'In Paragraph B, bioluminescence is described as "cold light" because less than 20% is lost as thermal energy, meaning it still produces a small amount of heat (not zero).',
            'segmentId': None
        },
        {
            'id': 'ex-014-03',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "All deep-sea organisms emit bioluminescent light exclusively in shades of green."',
            'options': ['TRUE', 'FALSE', 'NOT GIVEN'],
            'correctAnswer': 'FALSE',
            'acceptedAnswers': ['FALSE', 'False', 'false'],
            'explanation': 'Paragraph B specifies that most marine light is blue or green, but some organisms like the dragonfish can emit red light.',
            'segmentId': None
        },
        {
            'id': 'ex-014-04',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "Scientists have used bioluminescent proteins to help trace the spread of certain medical diseases."',
            'options': ['TRUE', 'FALSE', 'NOT GIVEN'],
            'correctAnswer': 'TRUE',
            'acceptedAnswers': ['TRUE', 'True', 'true'],
            'explanation': 'Paragraph E discusses how biomedical researchers use green fluorescent protein (GFP) and luciferins to illuminate cellular pathways and track cancer cells.',
            'segmentId': None
        },
        {
            'id': 'ex-014-05',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Which is the most suitable heading for Paragraph B (the chemical mechanism of light production)?',
            'options': [
                'How light is produced chemically',
                'Light as a defence mechanism',
                'Using light to attract prey',
                'Practical uses for scientists'
            ],
            'correctAnswer': 'How light is produced chemically',
            'acceptedAnswers': ['How light is produced chemically'],
            'explanation': 'Paragraph B details the biochemical reaction between luciferin, luciferase, and oxygen.',
            'segmentId': None
        }
    ]
    
    crawled_lessons.append({
        'id': 'les-014',
        'topicId': 'top-008',
        'title': 'IELTS Academic Reading: Bioluminescence - Living Light (Sinh vật phát quang học)',
        'summary': 'Bài đọc IELTS chuẩn hóa về hiện tượng phát quang sinh học ở động vật biển và côn trùng, cơ chế hóa sinh luciferin-luciferase và ứng dụng y sinh hiện đại.',
        'level': 'B1',
        'kind': 'READING',
        'body': p1_content,
        'audioUrl': None,
        'transcript': [],
        'sourceAttribution': 'IELTS Academic Practice (Mock Test: Cambridge/British Council Format, Bioluminescence)',
        'published': True,
        'exercises': p1_exercises
    })
    
    # IELTS 2: The Hidden Life of Urban Trees (sifu-ewu)
    p2_m = re.search(r"id:\s*'passage-2'[\s\S]*?content:\s*`([\s\S]*?)`", sifu_ts)
    p2_content = p2_m.group(1).strip() if p2_m else ""
    
    p2_exercises = [
        {
            'id': 'ex-015-01',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'According to Paragraph B, urban trees cool ambient air temperatures primarily by:',
            'options': [
                'reflecting sunlight off their dark bark',
                'releasing water vapour from leaves',
                'absorbing exhaust fumes from passing vehicles',
                'blocking strong crosswinds between skyscrapers'
            ],
            'correctAnswer': 'releasing water vapour from leaves',
            'acceptedAnswers': ['releasing water vapour from leaves'],
            'explanation': 'Paragraph B explains the process of evapotranspiration, where moisture is released into the air from leaf stomata, drawing heat away from surroundings.',
            'segmentId': None
        },
        {
            'id': 'ex-015-02',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'What does clinical research say about hospital patients who can see green trees from their windows?',
            'options': [
                'They request more pain medication.',
                'They suffer from seasonal allergies more often.',
                'They recover faster with a view of greenery.',
                'Their blood pressure remains elevated.'
            ],
            'correctAnswer': 'They recover faster with a view of greenery.',
            'acceptedAnswers': ['They recover faster with a view of greenery.'],
            'explanation': 'Paragraph C cites Roger Ulrich’s landmark hospital study showing that patients with views of nature recovered significantly faster and used fewer analgesics.',
            'segmentId': None
        },
        {
            'id': 'ex-015-03',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'How do city trees mitigate flash flooding during severe storms?',
            'options': [
                'by intercepting rain and helping water soak into the soil',
                'by evaporating rainfall before it hits the ground',
                'by diverting water into sewer mains through hollow trunks',
                'by creating impermeable natural barriers around foundations'
            ],
            'correctAnswer': 'by intercepting rain and helping water soak into the soil',
            'acceptedAnswers': ['by intercepting rain and helping water soak into the soil'],
            'explanation': 'Paragraph D describes tree canopies intercepting heavy raindrops and root networks increasing soil porosity to absorb stormwater runoff.',
            'segmentId': None
        },
        {
            'id': 'ex-015-04',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'What is the primary challenge faced by urban tree root systems compared to forest trees?',
            'options': [
                'Lack of bird nesting sites in downtown streets',
                'Their roots lack water and air, and they are damaged by salt and traffic.',
                'Excessive organic compost leading to fungal infestations',
                'Overabundance of direct underground water supplies'
            ],
            'correctAnswer': 'Their roots lack water and air, and they are damaged by salt and traffic.',
            'acceptedAnswers': ['Their roots lack water and air, and they are damaged by salt and traffic.'],
            'explanation': 'Paragraph E highlights that asphalt compaction deprives roots of oxygen and water, while de-icing salts and vehicular tremors cause physical injury.',
            'segmentId': None
        }
    ]
    
    crawled_lessons.append({
        'id': 'les-015',
        'topicId': 'top-008',
        'title': 'IELTS Academic Reading: The Hidden Life of Urban Trees (Đời sống bí mật của cây xanh đô thị)',
        'summary': 'Bài đọc học thuật phân tích vai trò của lâm nghiệp đô thị trong việc giảm nhiệt độ đảo nhiệt, lọc không khí, giảm lũ lụt và những thách thức rễ cây phải đối mặt dưới vỉa hè bê tông.',
        'level': 'B1',
        'kind': 'READING',
        'body': p2_content,
        'audioUrl': None,
        'transcript': [],
        'sourceAttribution': 'IELTS Academic Practice (Mock Test: Urban Forestry & Ecosystem Services)',
        'published': True,
        'exercises': p2_exercises
    })
    
    # IELTS 3: The Rise of Vertical Farming (LuchoBazz)
    print("  Fetching IELTS Vertical Farming from LuchoBazz...")
    lucho_data = json.loads(fetch('https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/datasets/synthetic-official-mocks/reading/ielts-reading-academic-001.json'))
    
    p_vertical = lucho_data['passages'][0]
    p_vertical_content = p_vertical['content']
    p_vertical_tfng = lucho_data['passages'][0]['question_groups'][0]['questions']
    
    vertical_exercises = []
    for idx, q in enumerate(p_vertical_tfng):
        vertical_exercises.append({
            'id': f'ex-016-{idx+1:02d}',
            'kind': 'SINGLE_CHOICE',
            'prompt': f'Do the following statement agree with the information in the passage? "{q["text"]}"',
            'options': ['TRUE', 'FALSE', 'NOT GIVEN'],
            'correctAnswer': q['answer'],
            'acceptedAnswers': [q['answer'], q['answer'].capitalize(), q['answer'].lower()],
            'explanation': f"Đáp án được đối chiếu trực tiếp từ văn bản học thuật IELTS: '{q['answer']}'.",
            'segmentId': None
        })
    
    crawled_lessons.append({
        'id': 'les-016',
        'topicId': 'top-008',
        'title': 'IELTS Academic Reading: The Rise of Vertical Farming (Nông nghiệp thẳng đứng)',
        'summary': 'Khảo sát giải pháp nông nghiệp công nghệ cao trong nhà kính cao tầng: thủy canh (hydroponics), khí canh (aeroponics), tiết kiệm nước và tối ưu hóa diện tích đô thị.',
        'level': 'B1',
        'kind': 'READING',
        'body': p_vertical_content,
        'audioUrl': None,
        'transcript': [],
        'sourceAttribution': 'IELTS Academic Reading Test: Technology & Agricultural Design (LuchoBazz Dataset / CC BY 4.0)',
        'published': True,
        'exercises': vertical_exercises
    })
    
    # IELTS 4: The Psychology of Urban Design (LuchoBazz)
    print("  Fetching IELTS Psychology of Urban Design from LuchoBazz...")
    p_urban = lucho_data['passages'][1]
    p_urban_content = p_urban['content']
    p_urban_mc = lucho_data['passages'][1]['question_groups'][2]['questions']
    
    urban_exercises = []
    for idx, q in enumerate(p_urban_mc):
        opts = [o['text'] for o in q['options']]
        correct_text = next(o['text'] for o in q['options'] if o['is_correct'])
        urban_exercises.append({
            'id': f'ex-017-{idx+1:02d}',
            'kind': 'SINGLE_CHOICE',
            'prompt': q['text'],
            'options': opts,
            'correctAnswer': correct_text,
            'acceptedAnswers': [correct_text],
            'explanation': f"Căn cứ đoạn trích trong bài đọc tâm lý học đô thị, đáp án chính xác là: {correct_text}",
            'segmentId': None
        })
        
    crawled_lessons.append({
        'id': 'les-017',
        'topicId': 'top-009',
        'title': 'IELTS Academic Reading: The Psychology of Urban Design (Tâm lý học trong quy hoạch đô thị)',
        'summary': 'Khám phá sự tương tác giữa kiến trúc thành phố, bố cục đường phố và sức khỏe tâm thần của cư dân, bao gồm hội chứng quá tải cảm giác và giải pháp không gian cộng đồng.',
        'level': 'B1',
        'kind': 'READING',
        'body': p_urban_content,
        'audioUrl': None,
        'transcript': [],
        'sourceAttribution': 'IELTS Academic Reading Test: Psychology & Architectural Ergonomics (LuchoBazz Dataset / CC BY 4.0)',
        'published': True,
        'exercises': urban_exercises
    })
    
    # IELTS 5: How Children Learn Language (sifu-ewu)
    print("  Fetching IELTS Child Language Acquisition from sifu-ewu...")
    p3_m = re.search(r"id:\s*'passage-3'[\s\S]*?content:\s*`([\s\S]*?)`", sifu_ts)
    p3_content = p3_m.group(1).strip() if p3_m else ""
    
    p3_exercises = [
        {
            'id': 'ex-018-01',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "Children are capable of acquiring any human language they are regularly exposed to."',
            'options': ['YES', 'NO', 'NOT GIVEN'],
            'correctAnswer': 'YES',
            'acceptedAnswers': ['YES', 'Yes', 'yes'],
            'explanation': 'Paragraph A confirms that regardless of birthplace or genetics, human infants can master whichever language surrounds them.',
            'segmentId': None
        },
        {
            'id': 'ex-018-02',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "B.F. Skinner believed language is acquired through an innate biological Language Acquisition Device (LAD)."',
            'options': ['YES', 'NO', 'NOT GIVEN'],
            'correctAnswer': 'NO',
            'acceptedAnswers': ['NO', 'No', 'no'],
            'explanation': 'The text shows Skinner proposed behaviorist reinforcement, whereas Noam Chomsky proposed the innate Language Acquisition Device (LAD).',
            'segmentId': None
        },
        {
            'id': 'ex-018-03',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "Most children begin speaking in complete complex sentences before reaching their first birthday."',
            'options': ['YES', 'NO', 'NOT GIVEN'],
            'correctAnswer': 'NO',
            'acceptedAnswers': ['NO', 'No', 'no'],
            'explanation': 'Paragraph D describes the one-word stage starting around age 1, followed by telegraphic two-word speech around age 2, not complex sentences.',
            'segmentId': None
        },
        {
            'id': 'ex-018-04',
            'kind': 'SINGLE_CHOICE',
            'prompt': 'Do the following statement agree with the passage? "Studies prove bilingual children take twice as long to reach basic fluency compared to monolinguals."',
            'options': ['YES', 'NO', 'NOT GIVEN'],
            'correctAnswer': 'NOT GIVEN',
            'acceptedAnswers': ['NOT GIVEN', 'Not Given', 'not given'],
            'explanation': 'The passage does not state that bilingual children take twice as long to achieve fluency.',
            'segmentId': None
        }
    ]
    
    crawled_lessons.append({
        'id': 'les-018',
        'topicId': 'top-010',
        'title': 'IELTS Academic Reading: How Children Learn Language (Cơ chế học ngôn ngữ của trẻ em)',
        'summary': 'Bài đọc chuyên khảo ngôn ngữ học về các giai đoạn thụ đắc ngôn ngữ ở trẻ thơ, cuộc tranh luận kinh điển giữa thuyết hành vi (Behaviorism) và ngữ pháp phổ quát (Universal Grammar).',
        'level': 'B1',
        'kind': 'READING',
        'body': p3_content,
        'audioUrl': None,
        'transcript': [],
        'sourceAttribution': 'IELTS Academic Reading Test: Developmental Linguistics & Cognitive Science',
        'published': True,
        'exercises': p3_exercises
    })

    # New topics
    new_topics = [
        {
            'id': 'top-005',
            'title': 'Ngữ pháp: Các thì và Dạng thức động từ',
            'description': 'Hệ thống các thì trọng tâm trong tiếng Anh: Hiện tại đơn, Tiếp diễn, Quá khứ đơn, Quá khứ tiếp diễn và Hiện tại hoàn thành.'
        },
        {
            'id': 'top-006',
            'title': 'Ngữ pháp: Câu điều kiện & Giả định',
            'description': 'Quy tắc và bài tập thực hành câu điều kiện loại 1 (có thật) và câu điều kiện loại 2 (giả định).'
        },
        {
            'id': 'top-007',
            'title': 'Ngữ pháp: Động từ khuyết thiếu & Mệnh đề',
            'description': 'Động từ tình thái (Modals), Mệnh đề trạng ngữ và Đại từ quan hệ trong văn cảnh thực tế.'
        },
        {
            'id': 'top-008',
            'title': 'IELTS Academic: Khoa học Tự nhiên & Môi trường',
            'description': 'Các bài đọc hiểu học thuật chuẩn IELTS về sinh học biển, sinh thái đô thị và nông nghiệp công nghệ cao.'
        },
        {
            'id': 'top-009',
            'title': 'IELTS Academic: Quy hoạch Đô thị & Tâm lý học',
            'description': 'Nghiên cứu tương tác giữa kiến trúc, không gian sống và hành vi tâm lý con người trong thành phố hiện đại.'
        },
        {
            'id': 'top-010',
            'title': 'IELTS Academic: Ngôn ngữ học & Nhận thức',
            'description': 'Khám phá các lý thuyết khoa học về sự phát triển trí tuệ, cơ chế tiếp nhận tiếng mẹ đẻ và ngôn ngữ thứ hai.'
        }
    ]

    batch = {
        'batchId': 'batch_002',
        'topics': new_topics,
        'lessons': crawled_lessons
    }

    target_path = r'c:\Users\Administrator\Documents\Codespace\Adaptive Learning\Adaptive English\content\english\batch_002.json'
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(batch, f, ensure_ascii=False, indent=2)
    print(f"\n[SUCCESS] Wrote batch_002.json to {target_path}!")
    print(f"Total topics: {len(new_topics)}, Total lessons: {len(crawled_lessons)}")
    total_ex = sum(len(l['exercises']) for l in crawled_lessons)
    print(f"Total exercises: {total_ex}")

if __name__ == '__main__':
    crawl_all()
