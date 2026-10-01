import { describe, expect, it, vi } from 'vitest';
import { EnglishService } from '../src/modules/english/english.service';
import { UserRole } from '@prisma/client';

const sample = {
  id: 'lesson-1', published: true, topic: { id: 'topic-1', title: 'Daily life' },
  title: 'At school', summary: 'A short conversation', level: 'A1', kind: 'LISTENING',
  body: null, audioUrl: 'https://example.org/audio.mp3', transcript: [], sourceAttribution: 'Original',
  exercises: [{ id: 'q1', kind: 'SINGLE_CHOICE', prompt: 'Where?', options: ['School', 'Home'],
    correctAnswer: 'School', acceptedAnswers: [], explanation: 'They say school.', segmentId: null, orderIndex: 0 }]
};

describe('English lessons', () => {
  it('keeps the answer on the server until submission', async () => {
    const prisma: any = { englishLesson: { findFirst: vi.fn().mockResolvedValue(sample) } };
    const service = new EnglishService(prisma);
    const data = await service.lesson('lesson-1');
    expect(data.exercises[0]).toEqual({ id: 'q1', kind: 'SINGLE_CHOICE', prompt: 'Where?', options: ['School', 'Home'], segmentId: null });
    expect(JSON.stringify(data)).not.toContain('correctAnswer');
  });

  it('grades answers and persists progress for the authenticated learner', async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const prisma: any = { englishLesson: { findFirst: vi.fn().mockResolvedValue(sample) }, englishLessonProgress: { upsert } };
    const service = new EnglishService(prisma);
    const result = await service.submit('lesson-1', 'student-1', { answers: { q1: 'School' } });
    expect(result.correctCount).toBe(1);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { lessonId_studentId: { lessonId: 'lesson-1', studentId: 'student-1' } }
    }));
  });

  it('rejects broken imports before writing anything', async () => {
    const transaction = vi.fn();
    const service = new EnglishService({ $transaction: transaction } as any);
    await expect(service.importBatch({ topics: [{ id: 'topic-1', title: 'Daily life' }], lessons: [{
      id: 'lesson-1', topicId: 'topic-1', title: 'At school', level: 'A1', kind: 'LISTENING', exercises: []
    }] })).rejects.toThrow('audioUrl');
    expect(transaction).not.toHaveBeenCalled();
  });

  it('keeps author imports in draft even when the file requests publication', async () => {
    const lessonUpsert = vi.fn().mockResolvedValue({});
    const prisma: any = {
      $transaction: (callback: any) => callback({
        englishTopic: { upsert: vi.fn() },
        englishLesson: { upsert: lessonUpsert },
        englishExercise: { deleteMany: vi.fn(), createMany: vi.fn() }
      })
    };
    const service = new EnglishService(prisma);
    await service.importBatch({
      topics: [{ id: 'topic-1', title: 'Daily life' }],
      lessons: [{ id: 'lesson-1', topicId: 'topic-1', title: 'At school', level: 'A1',
        kind: 'READING', published: true, exercises: [] }]
    }, UserRole.CONTENT_AUTHOR);
    expect(lessonUpsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ published: false }) }));
  });

  it('hides placement answers and stores a starting level after grading', async () => {
    const questions = Array.from({ length: 6 }, (_, index) => ({
      id: `p${index}`, prompt: `Question ${index}`, options: ['Yes', 'No'], correctAnswer: 'Yes',
      lesson: { level: index < 2 ? 'A1' : index < 4 ? 'A2' : 'B1', kind: 'GRAMMAR' }
    }));
    const upsert = vi.fn().mockImplementation(({ create }) => create);
    const service = new EnglishService({
      englishExercise: { findMany: vi.fn().mockResolvedValue(questions) },
      englishPlacementResult: { upsert }
    } as any);
    const publicQuestions = await service.placementQuestions();
    expect(JSON.stringify(publicQuestions)).not.toContain('correctAnswer');
    const result = await service.submitPlacement('student-1', { answers: Object.fromEntries(questions.map(item => [item.id, 'Yes'])) });
    expect(result).toEqual({ correctCount: 6, totalCount: 6, suggestedLevel: 'B1' });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { studentId: 'student-1' } }));
  });
});
