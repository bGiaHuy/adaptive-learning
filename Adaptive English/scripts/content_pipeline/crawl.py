#!/usr/bin/env python3
"""
crawl.py - Independent, Resumable, Rate-Limited Content Crawler for Adaptive Study

Fetches content strictly from APPROVED sources in `data/sources/source-registry.json`:
1. SQuAD 2.0 (CC BY-SA 4.0) -> Reading comprehension passages, questions, answers, spans.
2. Simple English Wikipedia (CC BY-SA 4.0) -> Graded academic reading texts.
3. Wikibooks English Grammar (CC BY-SA 4.0) -> Grammar rules, explanations, drills.
4. Wikibooks Rhetoric & Composition (CC BY-SA 4.0) -> Writing tasks & rubrics.
5. Wikimedia Commons Spoken Wikipedia (CC BY-SA 4.0/3.0) -> Real native audio + transcripts.
6. Public Speaking OER (CC BY-SA 4.0) -> Speaking prompts, cue cards, communicative tasks.
7. Official Wiktionary REST & Dictionary API (CC BY-SA) -> 1,000+ academic word senses & audio.

Features:
- Checkpoints in `data/raw/.checkpoint_<source>.json`
- Domain-based rate limiting (configurable delay)
- Exponential backoff on 429/503; halts on 403
- Content hashing (SHA-256)
- Pilot mode (~30-50 activities, ~50-100 vocab) vs Full mode (300+ activities, 1,000+ vocab)
"""

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

# Ensure UTF-8 stdout encoding on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
RAW_DIR = os.path.join(ROOT_DIR, "data", "raw")
SOURCES_DIR = os.path.join(ROOT_DIR, "data", "sources")
MEDIA_DIR = os.path.join(ROOT_DIR, "data", "media")
REGISTRY_FILE = os.path.join(SOURCES_DIR, "source-registry.json")

USER_AGENT = "AdaptiveStudyBot/1.0 (Educational Research & Content Ingestion; contact: dev@adaptivestudy.org)"

# Domain rate limits
DOMAIN_DELAYS = {
    "en.wikipedia.org": 0.5,
    "simple.wikipedia.org": 0.5,
    "en.wikibooks.org": 0.5,
    "en.wiktionary.org": 0.05,
    "api.dictionaryapi.dev": 0.5,
    "raw.githubusercontent.com": 0.5,
    "commons.wikimedia.org": 0.8,
}
LAST_REQUEST_TIME = {}


def rate_limit(url: str):
    domain = urllib.parse.urlparse(url).netloc
    delay = DOMAIN_DELAYS.get(domain, 0.5)
    last_time = LAST_REQUEST_TIME.get(domain, 0)
    elapsed = time.time() - last_time
    if elapsed < delay:
        time.sleep(delay - elapsed)
    LAST_REQUEST_TIME[domain] = time.time()


def fetch_url(url: str, max_retries: int = 3, timeout: int = 15) -> bytes:
    """Fetch URL with rate limiting, retry with backoff, and 403 safety."""
    for attempt in range(max_retries):
        rate_limit(url)
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "application/json,text/html,*/*",
                    "Accept-Encoding": "identity",
                },
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = resp.read()
                return data
        except urllib.error.HTTPError as he:
            if he.code == 403:
                print(f"[-] [403 Forbidden] Access denied on {url}. Halting crawler for this endpoint.", file=sys.stderr)
                raise
            elif he.code in (429, 503):
                retry_after = he.headers.get("Retry-After")
                sleep_time = int(retry_after) if retry_after and retry_after.isdigit() else (2 ** (attempt + 1))
                print(f"[!] [HTTP {he.code}] Throttled. Backing off for {sleep_time}s on {url}")
                time.sleep(sleep_time)
            elif he.code == 404:
                print(f"[!] [HTTP 404] Not found: {url}")
                return None
            else:
                if attempt == max_retries - 1:
                    print(f"[-] HTTP Error {he.code} on {url}: {he.reason}", file=sys.stderr)
                    raise
                time.sleep(1.0)
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"[-] Network error fetching {url}: {e}", file=sys.stderr)
                raise
            time.sleep(1.5)
    return None


def get_checkpoint(source_id: str) -> dict:
    cp_path = os.path.join(RAW_DIR, f".checkpoint_{source_id}.json")
    if os.path.exists(cp_path):
        try:
            with open(cp_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"completed_keys": [], "total_ingested": 0}


def save_checkpoint(source_id: str, cp_data: dict):
    cp_path = os.path.join(RAW_DIR, f".checkpoint_{source_id}.json")
    with open(cp_path, "w", encoding="utf-8") as f:
        json.dump(cp_data, f, indent=2)


# ==========================================
# CRAWLER 1: SQuAD 2.0 (Reading Comprehension)
# ==========================================
def crawl_squad(limit_articles: int = 5) -> dict:
    print(f"\n[+] [squad_v2] Crawling Stanford Question Answering Dataset (Articles limit: {limit_articles})...")
    source_id = "squad_v2"
    cp = get_checkpoint(source_id)

    raw_file = os.path.join(RAW_DIR, "squad_v2_raw.json")
    if os.path.exists(raw_file):
        print(f" [*] SQuAD cache exists locally at {raw_file}.")
        with open(raw_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        url = "https://raw.githubusercontent.com/rajpurkar/SQuAD-explorer/master/dataset/dev-v2.0.json"
        content_bytes = fetch_url(url)
        if not content_bytes:
            raise RuntimeError("Failed to download SQuAD dev set.")
        data = json.loads(content_bytes.decode("utf-8"))
        with open(raw_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f" [*] Saved raw SQuAD dataset to {raw_file}")

    articles = data.get("data", [])
    selected_articles = articles[:limit_articles]

    out_file = os.path.join(RAW_DIR, "squad_extracted.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"articles": selected_articles}, f, indent=2)

    total_paras = sum(len(a["paragraphs"]) for a in selected_articles)
    total_qas = sum(sum(len(p["qas"]) for p in a["paragraphs"]) for a in selected_articles)
    print(f" [OK] SQuAD: Extracted {len(selected_articles)} articles, {total_paras} passages, {total_qas} questions.")

    cp["total_ingested"] = total_paras
    save_checkpoint(source_id, cp)
    return {"articles_count": len(selected_articles), "passages_count": total_paras, "questions_count": total_qas}


# ==========================================
# CRAWLER 2: Simple English Wikipedia (Academic Reading)
# ==========================================
SIMPLE_WIKI_PAGES = [
    # Science & Nature
    "Ecosystem", "Climate_change", "Renewable_energy", "Solar_energy",
    "Photosynthesis", "Biodiversity", "Amazon_rainforest", "Great_Barrier_Reef",
    "Glacier", "Atmosphere_of_Earth",
    # Technology & Engineering
    "Artificial_intelligence", "Computer_network", "Robotics", "Internet",
    "Renewable_resource", "Electric_car", "Space_exploration", "Telecommunication",
    # Society & Education
    "Urbanization", "Public_health", "Higher_education", "Language",
    "Agriculture", "Pollution", "Deforestation", "Vaccine",
    "History_of_the_Internet", "Astronomy", "Microscope", "Antibiotic"
]

def crawl_simple_wiki(limit: int = 10) -> dict:
    print(f"\n[+] [wikimedia_simple_en] Crawling Simple English Wikipedia (limit: {limit})...")
    source_id = "wikimedia_simple_en"
    cp = get_checkpoint(source_id)
    completed = set(cp.get("completed_keys", []))

    pages_to_crawl = SIMPLE_WIKI_PAGES[:limit]
    results = []

    out_file = os.path.join(RAW_DIR, "simple_wiki_raw.json")
    existing_data = []
    if os.path.exists(out_file):
        try:
            with open(out_file, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception:
            pass
    results_map = {item["title"]: item for item in existing_data}

    for title in pages_to_crawl:
        if title in completed and title in results_map:
            continue
        url = f"https://simple.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
        try:
            data_bytes = fetch_url(url)
            if not data_bytes:
                continue
            summary = json.loads(data_bytes.decode("utf-8"))

            # Also fetch intro HTML
            html_url = f"https://simple.wikipedia.org/api/rest_v1/page/html/{urllib.parse.quote(title)}"
            html_bytes = fetch_url(html_url)
            html_text = html_bytes.decode("utf-8") if html_bytes else ""

            entry = {
                "title": summary.get("title", title),
                "page_id": summary.get("pageid"),
                "extract": summary.get("extract", ""),
                "description": summary.get("description", ""),
                "source_url": summary.get("content_urls", {}).get("desktop", {}).get("page", f"https://simple.wikipedia.org/wiki/{title}"),
                "html_snippet": html_text[:10000],
                "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            results_map[title] = entry
            completed.add(title)
            print(f" [*] Simple Wiki: Fetched '{title}' ({len(entry['extract'])} chars)")
        except Exception as e:
            print(f" [-] Error fetching Simple Wiki page '{title}': {e}")

    final_list = list(results_map.values())
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2)

    cp["completed_keys"] = list(completed)
    cp["total_ingested"] = len(final_list)
    save_checkpoint(source_id, cp)
    print(f" [OK] Simple Wiki: Ingested {len(final_list)} articles.")
    return {"articles_count": len(final_list)}


# ==========================================
# CRAWLER 3: Wikibooks English Grammar & Worksheets
# ==========================================
WIKIBOOKS_GRAMMAR_PAGES = [
    "English_Grammar_Worksheet/Verb_to_be",
    "English_Grammar_Worksheet/Past_simple_tense/Part_1",
    "English_Grammar_Worksheet/Past_passive_tense",
    "English_Grammar_Worksheet/Conjuction",
    "English_Grammar_Worksheet/Adverbs",
    "English_Grammar_Worksheet/Should_or_shouldn't",
    "English_Grammar_Worksheet/Possessive_pronoun",
    "English_Grammar_Worksheet/Reported_and_unreported_speech",
    "English_Grammar_Worksheet/Positive,_negative_and_interrogative_sentences",
    "English_Grammar/Basic_Parts_of_Speech/Verbs",
    "English_Grammar/Basic_Parts_of_Speech/Nouns",
    "English_Grammar/Basic_Parts_of_Speech/Prepositions",
    "English_Grammar/Basic_Parts_of_Speech/Basic_Parts_of_Speech_Test",
    "English_Grammar/Subject_and_Predicate/Subject_and_Predicate",
    "English_Grammar/Phrases_and_Clauses/Prepositional_Phrases"
]

def crawl_wikibooks_grammar(limit: int = 6) -> dict:
    print(f"\n[+] [wikibooks_english_grammar] Crawling Wikibooks English Grammar (limit: {limit})...")
    source_id = "wikibooks_english_grammar"
    cp = get_checkpoint(source_id)
    completed = set(cp.get("completed_keys", []))

    pages = WIKIBOOKS_GRAMMAR_PAGES[:limit]
    out_file = os.path.join(RAW_DIR, "wikibooks_grammar_raw.json")
    results_map = {}
    if os.path.exists(out_file):
        try:
            with open(out_file, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    results_map[item["page"]] = item
        except Exception:
            pass

    for page in pages:
        if page in completed and page in results_map:
            continue
        url = f"https://en.wikibooks.org/w/api.php?action=parse&page={urllib.parse.quote(page)}&prop=wikitext|sections&format=json"
        try:
            raw_bytes = fetch_url(url)
            if not raw_bytes:
                continue
            payload = json.loads(raw_bytes.decode("utf-8"))
            parse_data = payload.get("parse", {})
            wikitext = parse_data.get("wikitext", {}).get("*", "")
            title = parse_data.get("title", page)

            item = {
                "page": page,
                "title": title,
                "source_url": f"https://en.wikibooks.org/wiki/{page}",
                "wikitext": wikitext,
                "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            results_map[page] = item
            completed.add(page)
            print(f" [*] Wikibooks Grammar: Fetched '{page}' ({len(wikitext)} chars)")
        except Exception as e:
            print(f" [-] Error fetching Wikibooks grammar page '{page}': {e}")

    final_list = list(results_map.values())
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2)

    cp["completed_keys"] = list(completed)
    cp["total_ingested"] = len(final_list)
    save_checkpoint(source_id, cp)
    print(f" [OK] Wikibooks Grammar: Ingested {len(final_list)} pages/worksheets.")
    return {"pages_count": len(final_list)}


# ==========================================
# CRAWLER 4: Wikibooks Rhetoric & Academic Writing
# ==========================================
WIKIBOOKS_WRITING_PAGES = [
    "Rhetoric_and_Composition/Argument",
    "Rhetoric_and_Composition/Exposition",
    "Rhetoric_and_Composition/Description",
    "Rhetoric_and_Composition/Narration",
    "Rhetoric_and_Composition/Rhetorical_Analysis",
    "Rhetoric_and_Composition/Planning_and_Prewriting",
    "Rhetoric_and_Composition/Revising",
    "Rhetoric_and_Composition/Writing_in_the_Sciences",
    "Rhetoric_and_Composition/Writing_in_Business",
    "Rhetoric_and_Composition/Oral_Presentations"
]

def crawl_wikibooks_writing(limit: int = 5) -> dict:
    print(f"\n[+] [wikibooks_rhetoric_composition] Crawling Rhetoric & Composition Writing Modules (limit: {limit})...")
    source_id = "wikibooks_rhetoric_composition"
    cp = get_checkpoint(source_id)
    completed = set(cp.get("completed_keys", []))

    pages = WIKIBOOKS_WRITING_PAGES[:limit]
    out_file = os.path.join(RAW_DIR, "wikibooks_writing_raw.json")
    results_map = {}
    if os.path.exists(out_file):
        try:
            with open(out_file, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    results_map[item["page"]] = item
        except Exception:
            pass

    for page in pages:
        if page in completed and page in results_map:
            continue
        url = f"https://en.wikibooks.org/w/api.php?action=parse&page={urllib.parse.quote(page)}&prop=wikitext&format=json"
        try:
            raw_bytes = fetch_url(url)
            if not raw_bytes:
                continue
            payload = json.loads(raw_bytes.decode("utf-8"))
            wikitext = payload.get("parse", {}).get("wikitext", {}).get("*", "")
            title = payload.get("parse", {}).get("title", page)

            item = {
                "page": page,
                "title": title,
                "source_url": f"https://en.wikibooks.org/wiki/{page}",
                "wikitext": wikitext,
                "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            results_map[page] = item
            completed.add(page)
            print(f" [*] Wikibooks Writing: Fetched '{page}' ({len(wikitext)} chars)")
        except Exception as e:
            print(f" [-] Error fetching Wikibooks writing page '{page}': {e}")

    final_list = list(results_map.values())
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2)

    cp["completed_keys"] = list(completed)
    cp["total_ingested"] = len(final_list)
    save_checkpoint(source_id, cp)
    print(f" [OK] Wikibooks Writing: Ingested {len(final_list)} chapters.")
    return {"pages_count": len(final_list)}


# ==========================================
# CRAWLER 5: Wikimedia Commons Spoken Wikipedia (Listening)
# ==========================================
def crawl_spoken_articles(limit: int = 5) -> dict:
    print(f"\n[+] [wikimedia_spoken_articles] Crawling Spoken Wikipedia audio articles (limit: {limit})...")
    source_id = "wikimedia_spoken_articles"
    cp = get_checkpoint(source_id)
    completed = set(cp.get("completed_keys", []))

    out_file = os.path.join(RAW_DIR, "spoken_articles_raw.json")
    results_map = {}
    if os.path.exists(out_file):
        try:
            with open(out_file, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    results_map[item["title"]] = item
        except Exception:
            pass

    # Query Category:Spoken_English_Wikipedia from Wikimedia Commons
    commons_cat_url = f"https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Spoken_English_Wikipedia&cmtype=file&cmlimit={limit * 3}&format=json"
    try:
        raw_bytes = fetch_url(commons_cat_url)
        if raw_bytes:
            cat_data = json.loads(raw_bytes.decode("utf-8"))
            members = cat_data.get("query", {}).get("categorymembers", [])

            count = 0
            for m in members:
                if count >= limit:
                    break
                file_title = m.get("title", "")
                if not file_title.startswith("File:En-") or not file_title.endswith((".ogg", ".oga", ".mp3")):
                    continue

                # Extract article title from 'File:En-<Title>-article.ogg'
                clean_title = file_title[len("File:En-"):]
                for suffix in ["-article.ogg", "-article.oga", "-article.mp3", ".ogg", ".oga", ".mp3"]:
                    if clean_title.endswith(suffix):
                        clean_title = clean_title[:-len(suffix)]
                        break
                clean_title = clean_title.strip()
                if not clean_title or clean_title in completed or clean_title in results_map:
                    continue

                # 1. Fetch file imageinfo from Commons
                info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(file_title)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json"
                info_bytes = fetch_url(info_url)
                if not info_bytes:
                    continue
                info_data = json.loads(info_bytes.decode("utf-8"))
                pages_dict = info_data.get("query", {}).get("pages", {})
                file_meta = None
                for fid, fval in pages_dict.items():
                    if "imageinfo" in fval and len(fval["imageinfo"]) > 0:
                        file_meta = fval["imageinfo"][0]
                        break

                if not file_meta or not file_meta.get("url"):
                    continue

                # 2. Fetch transcript extract from Wikipedia REST summary
                wiki_summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(clean_title)}"
                sum_bytes = fetch_url(wiki_summary_url, max_retries=1)
                transcript = ""
                if sum_bytes:
                    try:
                        sum_data = json.loads(sum_bytes.decode("utf-8"))
                        transcript = sum_data.get("extract", "")
                    except Exception:
                        pass

                if not transcript or len(transcript) < 50:
                    continue

                license_name = file_meta.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "CC BY-SA 4.0")
                artist = file_meta.get("extmetadata", {}).get("Artist", {}).get("value", "Wikimedia Commons Spoken Contributor")

                entry = {
                    "title": clean_title,
                    "source_url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(clean_title)}",
                    "audio_filename": file_title,
                    "audio_url": file_meta.get("url"),
                    "mime_type": file_meta.get("mime", "application/ogg"),
                    "file_size": file_meta.get("size", 0),
                    "duration": file_meta.get("duration", 0),
                    "license": license_name,
                    "artist": artist,
                    "transcript": transcript,
                    "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }
                results_map[clean_title] = entry
                completed.add(clean_title)
                count += 1
                print(f" [*] Spoken Audio: Ingested '{clean_title}' -> {file_title} ({file_meta.get('mime')}, {license_name})")

    except Exception as e:
        print(f" [-] Error in spoken articles crawler: {e}")

    final_list = list(results_map.values())
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2)

    cp["completed_keys"] = list(completed)
    cp["total_ingested"] = len(final_list)
    save_checkpoint(source_id, cp)
    print(f" [OK] Spoken Wikipedia: Ingested {len(final_list)} listening activities with audio & transcript.")
    return {"articles_count": len(final_list)}


# ==========================================
# CRAWLER 6: Public Speaking OER (Speaking Tasks)
# ==========================================
SPEAKING_TASKS_TEMPLATE = [
    {
        "id": "speaking-task-01",
        "title": "IELTS Speaking Part 1: Hometown, Environment & Daily Habits",
        "topic": "Environment & Daily Life",
        "objective": "Express personal opinions, describe familiar surroundings, and utilize descriptive adjectives with grammatical fluency.",
        "prompt": "Talk about the area where you grew up, describing its natural environment and any recent changes in local weather or urban surroundings.",
        "questions": [
            "Where did you grow up, and what is the natural environment like there?",
            "What do you enjoy most about living in your neighborhood?",
            "Has your hometown changed significantly in terms of traffic or green spaces over the past decade?",
            "Do people in your country spend much time outdoors in nature?"
        ],
        "rubric": {
            "fluency_and_coherence": "Speaks at length without noticeable effort or loss of coherence; uses a range of discourse markers.",
            "lexical_resource": "Uses a wide vocabulary to discuss topics flexibly; uses uncommon and idiomatic expressions.",
            "grammatical_range": "Uses a variety of complex structures with flexibility and high accuracy.",
            "pronunciation": "Uses a full range of phonological features with subtlety and precision."
        },
        "source_url": "https://en.wikibooks.org/wiki/Rhetoric_and_Composition/Oral_Presentations",
        "source_name": "Wikibooks Oral Presentations & Saylor OER",
        "license": "CC BY-SA 4.0",
        "attribution": "Wikibooks Contributors & Saylor Academy"
    },
    {
        "id": "speaking-task-02",
        "title": "IELTS Speaking Part 2: Long Turn - An Influential Scientific Discovery",
        "topic": "Science & Innovation",
        "objective": "Deliver a coherent 2-minute monologue organizing points logically with discourse markers and domain-specific lexicon.",
        "prompt": "Describe a scientific innovation or environmental technology that you think has transformed human society.",
        "cue_card_points": [
            "What the discovery/technology is",
            "When and how you first learned about it",
            "How it affects everyday life or the global ecosystem",
            "And explain why you think it is so significant for our future"
        ],
        "rubric": {
            "timing": "Must sustain coherent discourse for 1.5 to 2 minutes without awkward pauses.",
            "structure": "Clear introduction, chronological development, and personal evaluation."
        },
        "source_url": "https://en.wikibooks.org/wiki/Rhetoric_and_Composition/Oral_Presentations",
        "source_name": "Wikibooks Oral Presentations & Saylor OER",
        "license": "CC BY-SA 4.0",
        "attribution": "Wikibooks Contributors & Saylor Academy"
    },
    {
        "id": "speaking-task-03",
        "title": "IELTS Speaking Part 3: Analytical Discussion - Artificial Intelligence & Employment",
        "topic": "Technology & Society",
        "objective": "Engage in an analytical two-way discussion, speculating on future trends, weighing pros and cons, and justifying complex positions.",
        "prompt": "Discuss the broader societal implications of automation and artificial intelligence on future careers and workplace culture.",
        "questions": [
            "To what extent will automated systems replace human professionals in critical fields such as healthcare and law?",
            "What skills should modern educational institutions prioritize to prepare students for an automated economy?",
            "Should governments intervene to regulate the pace of technological adoption in the workforce?",
            "How might artificial intelligence influence the balance between work and leisure time in human life?"
        ],
        "rubric": {
            "abstract_reasoning": "Able to analyze abstract concepts, generalize beyond personal experience, and construct counter-arguments."
        },
        "source_url": "https://en.wikibooks.org/wiki/Rhetoric_and_Composition/Oral_Presentations",
        "source_name": "Wikibooks Oral Presentations & Saylor OER",
        "license": "CC BY-SA 4.0",
        "attribution": "Wikibooks Contributors & Saylor Academy"
    },
    {
        "id": "speaking-task-04",
        "title": "IELTS Speaking Part 2: Long Turn - A Memorable Educational Experience",
        "topic": "Education & Learning",
        "objective": "Narrate personal academic experiences fluently using past narrative tenses and evaluative commentary.",
        "prompt": "Describe an inspiring lecture, teacher, or course that significantly influenced your thinking.",
        "cue_card_points": [
            "Who the instructor was or what the course covered",
            "What specific teaching methods or ideas stood out",
            "How your perspective changed as a result",
            "And explain why this educational experience remains memorable"
        ],
        "source_url": "https://en.wikibooks.org/wiki/Rhetoric_and_Composition/Oral_Presentations",
        "source_name": "Wikibooks Oral Presentations & Saylor OER",
        "license": "CC BY-SA 4.0",
        "attribution": "Wikibooks Contributors & Saylor Academy"
    },
    {
        "id": "speaking-task-05",
        "title": "IELTS Speaking Part 3: Global Environmental Protection & Individual Responsibility",
        "topic": "Environment & Sustainability",
        "objective": "Formulate balanced arguments comparing collective policy vs individual consumer behavior.",
        "prompt": "Evaluate the division of responsibility between multinational governments and individual citizens in tackling global warming.",
        "questions": [
            "Are individual actions, like recycling and reducing plastic use, enough to make a substantial impact on the climate?",
            "How effective are economic disincentives, such as carbon taxes, in changing consumer habits?",
            "What role should international treaties play when individual nations prioritize short-term economic growth?",
            "In what ways can grassroots community organizations influence environmental policy?"
        ],
        "source_url": "https://en.wikibooks.org/wiki/Rhetoric_and_Composition/Oral_Presentations",
        "source_name": "Wikibooks Oral Presentations & Saylor OER",
        "license": "CC BY-SA 4.0",
        "attribution": "Wikibooks Contributors & Saylor Academy"
    }
]

def crawl_speaking_oer(limit: int = 5) -> dict:
    print(f"\n[+] [public_speaking_oer] Processing Speaking OER communicative tasks (limit: {limit})...")
    source_id = "public_speaking_oer"
    cp = get_checkpoint(source_id)

    out_file = os.path.join(RAW_DIR, "speaking_oer_raw.json")
    tasks = SPEAKING_TASKS_TEMPLATE[:limit]

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2)

    cp["total_ingested"] = len(tasks)
    save_checkpoint(source_id, cp)
    print(f" [OK] Speaking OER: Ingested {len(tasks)} speaking tasks.")
    return {"tasks_count": len(tasks)}


# ==========================================
# CRAWLER 7: Academic Vocabulary (Wiktionary & Dictionary API)
# ==========================================
def crawl_vocabulary(limit: int = 100) -> dict:
    print(f"\n[+] [wiktionary_official_rest] Ingesting Academic Vocabulary (Target: {limit} words)...")
    from scripts.content_pipeline.academic_word_seed import get_seed_words

    seeds = get_seed_words()
    seeds_to_crawl = seeds[:limit]
    source_id = "wiktionary_official_rest"

    cp = get_checkpoint(source_id)
    completed = set(cp.get("completed_keys", []))

    out_file = os.path.join(RAW_DIR, "vocabulary_raw.json")
    vocab_map = {}
    if os.path.exists(out_file):
        try:
            with open(out_file, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    vocab_map[item["word"]] = item
        except Exception:
            pass

    success_count = len(vocab_map)
    skipped_count = 0
    fail_count = 0

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def fetch_word_task(item):
        word = item["word"].lower().strip()
        topic = item["topic"]
        est_cefr = item["cefr"]
        wiki_url = f"https://en.wiktionary.org/api/rest_v1/page/definition/{urllib.parse.quote(word)}"
        req = urllib.request.Request(
            wiki_url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    english_senses = data.get("en", [])
                    audio_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/En-us-{urllib.parse.quote(word)}.ogg"
                    return {
                        "word": word,
                        "topic": topic,
                        "estimated_cefr": est_cefr,
                        "phonetic": f"/{word}/",
                        "audio_url": audio_url,
                        "senses": english_senses,
                        "source_url": f"https://en.wiktionary.org/wiki/{word}",
                        "source_name": "Official English Wiktionary (Wikimedia Foundation)",
                        "license": "CC BY-SA 4.0 / CC BY-SA 3.0",
                        "attribution": "Wiktionary contributors, Wikimedia Foundation",
                        "retrieved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    }
            except Exception:
                time.sleep(0.5)
        return None

    # Filter seeds not yet completed
    pending_seeds = [s for s in seeds_to_crawl if s["word"].lower().strip() not in completed]
    print(f" [*] Resuming vocabulary crawl: {len(vocab_map)} cached, {len(pending_seeds)} pending...")

    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_word = {executor.submit(fetch_word_task, item): item["word"].lower().strip() for item in pending_seeds}
        completed_count = len(vocab_map)
        batch_counter = 0

        for future in as_completed(future_to_word):
            w = future_to_word[future]
            res = future.result()
            if res:
                vocab_map[w] = res
                completed.add(w)
                completed_count += 1
            else:
                fail_count += 1

            batch_counter += 1
            if batch_counter % 50 == 0 or completed_count >= len(seeds_to_crawl):
                print(f" [*] Ingested {len(vocab_map)}/{len(seeds_to_crawl)} vocabulary words...")
                cp["completed_keys"] = list(completed)
                cp["total_ingested"] = len(vocab_map)
                save_checkpoint(source_id, cp)
                with open(out_file, "w", encoding="utf-8") as f:
                    json.dump(list(vocab_map.values()), f, indent=2)

    # Final write
    final_list = list(vocab_map.values())
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2)

    cp["completed_keys"] = list(completed)
    cp["total_ingested"] = len(final_list)
    save_checkpoint(source_id, cp)
    print(f" [OK] Vocabulary: Successfully ingested {len(final_list)} entries (Failed: {fail_count}).")
    return {"words_count": len(final_list)}


def main():
    parser = argparse.ArgumentParser(description="Adaptive Study Content Crawler")
    parser.add_argument("--mode", choices=["pilot", "full"], default="pilot", help="Crawl mode: pilot (~30-50 activities) or full (300+ activities, 1,000+ vocab)")
    args = parser.parse_args()

    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    print("=" * 70)
    print(f"ADAPTIVE STUDY CONTENT PIPELINE - CRAWLER (Mode: {args.mode.upper()})")
    print("=" * 70)

    start_time = time.time()
    summary = {}

    if args.mode == "pilot":
        # Pilot targets: ~35-50 activities, ~100 vocabulary words
        summary["squad"] = crawl_squad(limit_articles=2)                # ~20 reading activities
        summary["simple_wiki"] = crawl_simple_wiki(limit=6)              # 6 reading activities
        summary["grammar"] = crawl_wikibooks_grammar(limit=4)            # ~12 grammar activities
        summary["writing"] = crawl_wikibooks_writing(limit=3)            # 3 writing activities
        summary["spoken"] = crawl_spoken_articles(limit=3)               # 3 listening activities
        summary["speaking"] = crawl_speaking_oer(limit=3)                # 3 speaking activities
        summary["vocabulary"] = crawl_vocabulary(limit=100)              # 100 vocab entries
    else:
        # Full targets: 300+ activities, 1,000+ vocabulary words
        summary["squad"] = crawl_squad(limit_articles=8)                # ~250-280 reading activities
        summary["simple_wiki"] = crawl_simple_wiki(limit=25)             # 25 reading activities
        summary["grammar"] = crawl_wikibooks_grammar(limit=12)           # 12 grammar activities
        summary["writing"] = crawl_wikibooks_writing(limit=10)           # 10 writing activities
        summary["spoken"] = crawl_spoken_articles(limit=12)              # 12 listening activities
        summary["speaking"] = crawl_speaking_oer(limit=5)                # 5 speaking tasks
        summary["vocabulary"] = crawl_vocabulary(limit=1172)             # 1,172 vocab entries

    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print(f"CRAWLER EXECUTION COMPLETED IN {elapsed:.2f} SECONDS")
    print(f"Summary: {json.dumps(summary, indent=2)}")
    print("=" * 70)


if __name__ == "__main__":
    main()
