# Intellectual Property & Rights Compliance Report

**Audit Date:** 2026-10-08T03:35:34Z  
**Compliance Standard:** Strict Open Educational Resources (OER) & Permissive Open Content Only

---

## 1. Approved Ingestion Sources & Attribution

All content ingested into the Adaptive Study repository is legally cleared under verified open licenses:

| Source ID | Source Name | License | Allowed Usages |
| :--- | :--- | :--- | :--- |
| `squad_v2` | SQuAD 2.0 (Stanford / Wikipedia) | **CC BY-SA 4.0** | Reading comprehension passages & crowdsourced questions |
| `wikimedia_simple_en` | Simple English Wikipedia | **CC BY-SA 4.0** | Graded introductory expository passages |
| `wikibooks_english_grammar` | Wikibooks English Grammar & Worksheets | **CC BY-SA 4.0** | Grammar rules, examples, and drill exercises |
| `wikibooks_rhetoric_composition` | Wikibooks Rhetoric and Composition | **CC BY-SA 4.0** | Academic essay tasks, structuring guides, and rubrics |
| `wikimedia_spoken_articles` | Wikimedia Commons Spoken Wikipedia | **CC BY-SA 4.0 / 3.0** | Verbatim audio recordings with exact text transcripts |
| `wiktionary_official_rest` | English Wiktionary REST API | **CC BY-SA 4.0** | Lexical definitions, parts of speech, and IPA |
| `public_speaking_oer` | Public Speaking & Oral Presentation OER | **CC BY-SA 4.0** | Monologue prompts, cue cards, and speaking criteria |

---

## 2. Explicitly Excluded & Prohibited Sources

In accordance with strict copyright rules, the following sources were **REJECTED** from the crawling pipeline:

1. **British Council LearnEnglish**: All rights reserved. Automated extraction is strictly prohibited.
2. **Cambridge Assessment & Cambridge Dictionary**: Commercial copyright and anti-scraping terms of service.
3. **Official IELTS Past Papers & Audio Tracks**: Proprietary intellectual property of Cambridge Assessment / IDP.
4. **Commercial IELTS Preparation Blogs (IELTS Liz, IELTS Advantage)**: Commercial copyright protected.
5. **Google Search SERP Scraping**: Violates search engine terms of service.

---

## 3. Compliance Verification Checklist

- [x] Every activity contains `source_url`, `source_name`, `license`, and `attribution`.
- [x] No "free-to-read" website was treated as permission to republish.
- [x] Audio files link exclusively to Wikimedia Commons open repositories with verified CC licenses.
- [x] All content origins are marked `source`, separating crawled material from any potential AI-assisted steps.
