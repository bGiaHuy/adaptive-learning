# Data Quality & Validation Report

**Generated at:** 2026-10-08T03:35:34Z  
**Status:** VALIDATED_AND_CATALOGED

---

## 1. Executive Summary

| Metric | Target | Actual Result | Status |
| :--- | :---: | :---: | :---: |
| **Total Activities** | 30–50 (Pilot) / 300 (Full) | **389** | PASS |
| **Total Vocabulary Entries** | 100 (Pilot) / 1,000 (Full) | **1022** | PASS |
| **Skill Coverage** | Reading, Grammar, Vocab + Audio/Writing/Speaking | **5 Skills** | PASS |
| **Activities with Audio** | Verified OER / Commons | **14** | PASS |
| **Activities with Questions** | Non-synthetic | **383** | PASS |
| **Quarantined Records** | < 5% | **0 Act / 0 Vocab** | PASS |

---

## 2. Skill Breakdown

- **Grammar**: 16 activities
- **Listening**: 16 activities
- **Reading**: 335 activities
- **Speaking**: 9 activities
- **Writing**: 13 activities

---

## 3. CEFR Level Distribution

- **A1**: 6 activities
- **A2**: 10 activities
- **B1**: 38 activities
- **B2**: 335 activities

> [!NOTE]
> All CEFR levels have `cefr_origin = "estimated"`. In accordance with the Data Contract, no activities have calibrated Elo scores prior to real user interaction. Every activity is strictly marked `difficulty_status = "uncalibrated"`.

---

## 4. Quality Checks Performed

1. **Schema Integrity**: All records validated against `docs/content-data-contract.md`.
2. **Deduplication**: Exact hash deduplication executed across SHA-256 digests.
3. **Question & Option Consistency**: Verified that all multiple choice answers correspond to valid option IDs.
4. **Vocabulary Multi-Sense Retention**: Senses and definitions were preserved per part-of-speech; no meanings were collapsed.
5. **No Synthetic Hallucinations**: Missing audio, answers, or rubrics were stored as `null` or empty arrays rather than fabricated.

---

## 5. Catalog Structure

- **Courses Created**: 5
- **Units Created**: 80
- **Lessons Assembled**: 389
