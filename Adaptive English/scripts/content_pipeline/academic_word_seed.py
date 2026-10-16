"""
academic_word_seed.py - Seed headwords for Academic & IELTS English Vocabulary
"""

from scripts.content_pipeline.words_data import get_all_words

def get_seed_words():
    return get_all_words()

if __name__ == "__main__":
    words = get_seed_words()
    print(f"Total curated seeds: {len(words)}")
