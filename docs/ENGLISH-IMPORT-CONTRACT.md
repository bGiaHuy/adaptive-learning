# English Studio: content import and rollout

The English experience uses separate `EnglishTopic`, `EnglishLesson`, `EnglishExercise`, and `EnglishLessonProgress` tables. Existing mathematics records are retained. Student navigation now opens the English catalogue, listening lessons, and English progress.

## Apply schema

After setting `DATABASE_URL` for the target environment, run:

```bash
npm run prisma:generate
cd apps/api
npx prisma migrate deploy
```

Back up the database before applying the migration in a shared environment. The migration adds tables and does not delete existing records.

## Import format

The admin or content author uploads one UTF-8 JSON file in **Nội dung tiếng Anh**. `POST /api/v1/english/import` accepts the same body. Maximum practical file size in the UI is 2 MB, with at most 100 topics and 500 lessons per batch. The importer checks the full batch before writing, then upserts topics and lessons in one transaction. Lesson exercises are replaced on reimport. Use stable IDs. Admin imports can publish when `published` is `true`; content author imports are forced to draft.

```json
{
  "topics": [
    { "id": "daily-life", "title": "Đời sống hằng ngày", "description": "Tình huống quen thuộc" }
  ],
  "lessons": [
    {
      "id": "daily-life-greetings-a1",
      "topicId": "daily-life",
      "title": "A morning conversation",
      "summary": "Lời chào buổi sáng",
      "level": "A1",
      "kind": "LISTENING",
      "body": null,
      "audioUrl": "https://example.org/licensed/greetings.mp3",
      "transcript": [
        { "id": "s1", "startMs": 0, "endMs": 1800, "textEn": "Good morning.", "textVi": "Chào buổi sáng." }
      ],
      "sourceAttribution": "Original recording by the content team",
      "published": false,
      "exercises": [
        {
          "id": "greetings-q1",
          "kind": "SINGLE_CHOICE",
          "prompt": "What do you hear?",
          "options": ["Good morning.", "Good night."],
          "correctAnswer": "Good morning.",
          "acceptedAnswers": [],
          "explanation": "The speaker says good morning.",
          "segmentId": "s1"
        }
      ]
    }
  ]
}
```

`level` is `A1`, `A2`, or `B1`. `kind` is `LISTENING`, `VOCABULARY`, `GRAMMAR`, or `READING`. Exercise `kind` is `SINGLE_CHOICE`, `FILL_BLANK`, or `DICTATION`. For choice questions, `correctAnswer` must match one of the option strings exactly. Text answers are checked case insensitively after trimming and collapsing spaces; punctuation still matters, so put accepted variants in `acceptedAnswers`.

For listening lessons, `audioUrl` is required and must begin with `https://` or `/media/`. `/media/` needs a separately configured static file host; this repository does not store or serve audio files. Transcript timestamps are milliseconds. The importer checks their shape, but the content team must verify audio playback, transcript alignment, source rights, and age suitability before setting `published` to `true`.

The earlier crawl brief uses separate JSONL files and more provenance fields. The crawl coordinator should retain those source files and produce this JSON bundle as the final import export. Store rights evidence, checksums, and QA reports alongside the bundle; the current app stores only `sourceAttribution` for display.

## Current limits

- The English catalogue and progress work after content is imported. No sample lesson or third party media ships with the app.
- The starting-point quiz needs at least two published multiple-choice exercises at each of A1, A2, and B1. It suggests an A1/A2/B1 *lesson starting level* from raw accuracy; it is not a calibrated CEFR assessment. Progress recommends unfinished lessons, prioritizing a skill type when the student's completed exercises in that type have lower accuracy.
- Teacher assignment and legacy admin question bank still use the mathematics models. Keep those legacy screens out of the English pilot until they are converted.
- The existing video demo still depicts AdaptiveMath and needs a new recording when approved content is present.
