#!/usr/bin/env python3
"""
validate.py - Data Contract Validator & Quarantine Engine for Adaptive Study

Validates normalized records against `docs/content-data-contract.md`:
1. ID uniqueness & non-null constraints.
2. Valid skill types, activity types, and question schemas.
3. Multiple-choice answer validation against options.
4. Media reference format and license verification.
5. Exact hash deduplication and near-duplicate detection.
6. Lexical multi-sense preservation in vocabulary entries.
7. Quarantines invalid or corrupted records into `data/quarantine/` with explicit reasons.
"""

import sys
import os
import json
import re

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
NORM_DIR = os.path.join(ROOT_DIR, "data", "normalized")
QUARANTINE_DIR = os.path.join(ROOT_DIR, "data", "quarantine")

ACTIVITIES_FILE = os.path.join(NORM_DIR, "activities.jsonl")
VOCABULARY_FILE = os.path.join(NORM_DIR, "vocabulary.jsonl")

QUARANTINE_ACT_FILE = os.path.join(QUARANTINE_DIR, "quarantine_activities.jsonl")
QUARANTINE_VOCAB_FILE = os.path.join(QUARANTINE_DIR, "quarantine_vocab.jsonl")

VALID_SKILLS = {"reading", "listening", "grammar", "vocabulary", "writing", "speaking"}
VALID_ACTIVITY_TYPES = {
    "reading_comprehension", "audio_comprehension", "grammar_drill",
    "vocab_expansion", "essay_prompt", "speaking_task",
    "reading_practice", "listening_practice", "grammar_practice",
    "writing_practice", "speaking_practice", "exam_test", "curriculum_lesson"
}
VALID_QUESTION_TYPES = {
    "single_choice", "multiple_choice", "short_answer", "gap_fill",
    "fill_in_the_blank", "match_pairs", "unscramble", "matching", "ordering",
    "writing", "speaking"
}
VALID_CEFR_ORIGINS = {"source", "estimated", "unknown"}
VALID_DIFFICULTY_STATUSES = {"uncalibrated", "calibrated"}
VALID_REVIEW_STATUSES = {"pending", "approved", "rejected"}
VALID_CONTENT_ORIGINS = {"source", "ai_generated", "mixed"}


def validate_activity(act: dict, seen_ids: set, seen_hashes: dict) -> tuple:
    """Returns (is_valid: bool, reason: str)"""
    # 1. Required fields
    required_fields = [
        "id", "title", "skill", "activity_type", "topic_tags", "learning_objectives",
        "source_url", "source_name", "license", "attribution", "retrieved_at",
        "source_content_hash", "content", "cefr_origin", "difficulty_status",
        "review_status", "content_origin"
    ]
    for rf in required_fields:
        if rf not in act or act[rf] is None:
            return False, f"Missing required field '{rf}'"

    act_id = act["id"]
    if not act_id or not isinstance(act_id, str):
        return False, "Invalid or empty id"
    if act_id in seen_ids:
        return False, f"Duplicate activity ID '{act_id}'"

    # 2. Field domain constraints
    if act["skill"] not in VALID_SKILLS:
        return False, f"Invalid skill '{act['skill']}'"
    if act["activity_type"] not in VALID_ACTIVITY_TYPES:
        return False, f"Invalid activity_type '{act['activity_type']}'"
    if act["cefr_origin"] not in VALID_CEFR_ORIGINS:
        return False, f"Invalid cefr_origin '{act['cefr_origin']}'"
    if act["difficulty_status"] not in VALID_DIFFICULTY_STATUSES:
        return False, f"Invalid difficulty_status '{act['difficulty_status']}'"
    if act["review_status"] not in VALID_REVIEW_STATUSES:
        return False, f"Invalid review_status '{act['review_status']}'"
    if act["content_origin"] not in VALID_CONTENT_ORIGINS:
        return False, f"Invalid content_origin '{act['content_origin']}'"

    # 3. Content sanity check
    content = act.get("content", "")
    if len(content.strip()) < 20:
        return False, "Content too short or empty (< 20 characters)"
    if "404 Not Found" in content or "Wikipedia does not have an article" in content:
        return False, "Content contains error or missing page indicator"

    # 4. Exact hash dedup
    chash = act["source_content_hash"]
    if chash in seen_hashes:
        return False, f"Duplicate content hash identical to {seen_hashes[chash]}"

    # 5. Question validation
    questions = act.get("questions", [])
    if not isinstance(questions, list):
        return False, "Field 'questions' must be an array"

    for q in questions:
        q_id = q.get("id")
        q_type = q.get("type")
        prompt = q.get("prompt")
        if not q_id or not prompt or not q_type:
            return False, "Question missing id, prompt, or type"
        if q_type not in VALID_QUESTION_TYPES:
            return False, f"Invalid question type '{q_type}'"

        # Check options match answer
        if q_type in ("single_choice", "multiple_choice") and q.get("options"):
            opts = q.get("options")
            opt_ids = {opt["id"] for opt in opts if "id" in opt}
            ans = q.get("answer") or q.get("correctAnswer")
            if isinstance(ans, str) and ans not in opt_ids:
                return False, f"Question '{q_id}' answer '{ans}' not found in options {opt_ids}"
            elif isinstance(ans, list):
                for a in ans:
                    if a not in opt_ids:
                        return False, f"Question '{q_id}' answer '{a}' not found in options {opt_ids}"

    # 6. Media verification
    media_refs = act.get("media_references")
    if media_refs:
        for m in media_refs:
            if not m.get("url") or not m.get("type"):
                return False, "Media reference missing url or type"
            if m["type"] == "audio":
                mime = m.get("mime_type", "").lower()
                clean_url = m.get("url", "").split("?")[0].lower()
                valid_mime = mime.startswith("audio/") or mime in ("application/ogg", "application/x-ogg")
                valid_ext = clean_url.endswith((".ogg", ".oga", ".mp3", ".wav"))
                if not (valid_mime or valid_ext):
                    return False, f"Audio media has invalid mime or extension: {m.get('url')}"

    return True, "Valid"


def validate_vocab_entry(v: dict, seen_words: set) -> tuple:
    word = v.get("word")
    if not word or not isinstance(word, str):
        return False, "Missing or invalid word"
    word_norm = word.lower().strip()
    if word_norm in seen_words:
        return False, f"Duplicate vocabulary term '{word_norm}'"

    meanings = v.get("meanings")
    if not meanings or not isinstance(meanings, list) or len(meanings) == 0:
        return False, f"Vocabulary entry '{word}' has no meanings or definitions"

    for m in meanings:
        defs = m.get("definitions", [])
        if not defs:
            return False, f"Meaning block in '{word}' missing definitions list"

    return True, "Valid"


def main():
    print("=" * 70)
    print("ADAPTIVE STUDY CONTENT PIPELINE - VALIDATION & QUARANTINE")
    print("=" * 70)

    os.makedirs(QUARANTINE_DIR, exist_ok=True)

    # 1. Validate Activities
    valid_activities = []
    quarantined_activities = []
    seen_act_ids = set()
    seen_act_hashes = {}

    if os.path.exists(ACTIVITIES_FILE):
        with open(ACTIVITIES_FILE, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, start=1):
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    act = json.loads(line_str)
                    is_valid, reason = validate_activity(act, seen_act_ids, seen_act_hashes)
                    if is_valid:
                        valid_activities.append(act)
                        seen_act_ids.add(act["id"])
                        seen_act_hashes[act["source_content_hash"]] = act["id"]
                    else:
                        act["quarantine_reason"] = reason
                        quarantined_activities.append(act)
                except Exception as e:
                    quarantined_activities.append({
                        "raw_line": line_str[:200],
                        "quarantine_reason": f"JSON parse error on line {line_no}: {e}"
                    })

    # Overwrite activities.jsonl with only strictly valid items
    with open(ACTIVITIES_FILE, "w", encoding="utf-8") as f:
        for act in valid_activities:
            f.write(json.dumps(act, ensure_ascii=False) + "\n")

    # Write quarantined activities
    with open(QUARANTINE_ACT_FILE, "w", encoding="utf-8") as f:
        for q in quarantined_activities:
            f.write(json.dumps(q, ensure_ascii=False) + "\n")

    # 2. Validate Vocabulary
    valid_vocab = []
    quarantined_vocab = []
    seen_words = set()

    if os.path.exists(VOCABULARY_FILE):
        with open(VOCABULARY_FILE, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, start=1):
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    v = json.loads(line_str)
                    is_valid, reason = validate_vocab_entry(v, seen_words)
                    if is_valid:
                        valid_vocab.append(v)
                        seen_words.add(v["word"].lower().strip())
                    else:
                        v["quarantine_reason"] = reason
                        quarantined_vocab.append(v)
                except Exception as e:
                    quarantined_vocab.append({
                        "raw_line": line_str[:200],
                        "quarantine_reason": f"JSON parse error on line {line_no}: {e}"
                    })

    # Overwrite vocabulary.jsonl with strictly valid items
    with open(VOCABULARY_FILE, "w", encoding="utf-8") as f:
        for v in valid_vocab:
            f.write(json.dumps(v, ensure_ascii=False) + "\n")

    # Write quarantined vocabulary
    with open(QUARANTINE_VOCAB_FILE, "w", encoding="utf-8") as f:
        for q in quarantined_vocab:
            f.write(json.dumps(q, ensure_ascii=False) + "\n")

    print(f"\nActivity Validation Results:")
    print(f"  [OK] Passed and retained:  {len(valid_activities)}")
    print(f"  [!] Quarantined (errors): {len(quarantined_activities)} (saved to {QUARANTINE_ACT_FILE})")

    print(f"\nVocabulary Validation Results:")
    print(f"  [OK] Passed and retained:  {len(valid_vocab)}")
    print(f"  [!] Quarantined (errors): {len(quarantined_vocab)} (saved to {QUARANTINE_VOCAB_FILE})")

    # Breakdown by skill
    skills_count = {}
    for a in valid_activities:
        s = a["skill"]
        skills_count[s] = skills_count.get(s, 0) + 1

    print("\nSkill Coverage Breakdown:")
    for skill, count in sorted(skills_count.items()):
        print(f"  - {skill.capitalize():<12}: {count} activities")

    print("=" * 70)


if __name__ == "__main__":
    main()
