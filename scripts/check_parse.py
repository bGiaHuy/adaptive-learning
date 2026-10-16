import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}

def parse_feelgood_quiz(url, limit=10):
    html = urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read().decode('utf-8', errors='ignore')
    
    # check if answers array exists in script
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
        # 1. try script answers
        if script_answers and i < len(script_answers):
            idx = script_answers[i]
            if 0 <= idx < len(options):
                correct_opt = options[idx]
        
        # 2. try feedback strong tag
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

for url in [
    'https://www.learnenglishfeelgood.com/grammar-secondconditional1.html',
    'https://www.learnenglishfeelgood.com/english-relative-pronouns2.html'
]:
    exs = parse_feelgood_quiz(url, 10)
    print(f"URL: {url} -> {len(exs)} exercises extracted!")
    if exs:
        print("  Q1:", exs[0]['prompt'], "->", exs[0]['correctAnswer'], "Options:", exs[0]['options'])
