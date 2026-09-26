import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateMistakeDto } from './dto/update-mistake.dto';
import { AttemptStatus } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Get student profile & summary statistics
  async getProfile(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true,
        classMemberships: {
          include: {
            classroom: {
              include: {
                teacher: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ học sinh.'
      });
    }

    const [attemptsCount, masteriesCount, mistakesTotal, mistakesUnmastered] = await Promise.all([
      this.prisma.diagnosticAttempt.count({
        where: { studentId, status: AttemptStatus.COMPLETED }
      }),
      this.prisma.skillMastery.count({
        where: { studentId, masteryScore: { gte: 70 } }
      }),
      this.prisma.mistakeRecord.count({
        where: { studentId }
      }),
      this.prisma.mistakeRecord.count({
        where: { studentId, isMastered: false }
      })
    ]);

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profile: user.studentProfile,
      joinedClassrooms: (user.classMemberships || []).map((m: any) => ({
        id: m.classroom.id,
        name: m.classroom.name,
        grade: m.classroom.grade,
        academicYear: m.classroom.academicYear,
        teacherName: m.classroom.teacher?.fullName || 'Giáo viên',
        joinedAt: m.joinedAt
      })),
      stats: {
        completedAssessments: attemptsCount,
        masteredSkills: masteriesCount,
        totalMistakes: mistakesTotal,
        unmasteredMistakes: mistakesUnmastered
      }
    };
  }

  // 2. Update Onboarding settings
  async updateOnboarding(studentId: string, dto: UpdateOnboardingDto) {
    const updated = await this.prisma.studentProfile.upsert({
      where: { userId: studentId },
      update: {
        ...(dto.grade && { grade: dto.grade }),
        ...(dto.targetGoal && { targetGoal: dto.targetGoal }),
        ...(dto.dailyMinutes && { dailyMinutes: dto.dailyMinutes }),
        ...(dto.examDate && { examDate: dto.examDate }),
        ...(dto.selfAssessment && { selfAssessment: dto.selfAssessment })
      },
      create: {
        userId: studentId,
        grade: dto.grade || 9,
        targetGoal: dto.targetGoal || 'Ôn thi vào lớp 10',
        dailyMinutes: dto.dailyMinutes || 45,
        examDate: dto.examDate || null,
        selfAssessment: dto.selfAssessment || 'Khá'
      }
    });

    return {
      message: 'Cập nhật thiết lập hồ sơ học tập thành công',
      profile: updated
    };
  }

  // 3. Get Student Mastery Overview
  async getMasteryOverview(studentId: string) {
    const masteries = await this.prisma.skillMastery.findMany({
      where: { studentId },
      include: {
        skill: true
      },
      orderBy: { masteryScore: 'desc' }
    });

    const totalCount = masteries.length;
    const avgScore = totalCount > 0
      ? Math.round(masteries.reduce((acc, m) => acc + m.masteryScore, 0) / totalCount)
      : 0;

    const strongSkills = masteries.filter(m => m.masteryScore >= 75);
    const averageSkills = masteries.filter(m => m.masteryScore >= 50 && m.masteryScore < 75);
    const weakSkills = masteries.filter(m => m.masteryScore < 50);

    return {
      averageMasteryScore: avgScore,
      totalAssessedSkills: totalCount,
      strongCount: strongSkills.length,
      averageCount: averageSkills.length,
      weakCount: weakSkills.length,
      skills: masteries.map(m => ({
        skillId: m.skillId,
        code: m.skill.code,
        title: m.skill.title,
        chapter: m.skill.chapter,
        score: m.masteryScore,
        level: m.masteryScore >= 75 ? 'THÀNH THẠO' : (m.masteryScore >= 50 ? 'TRUNG BÌNH' : 'CẦN LUYỆN TẬP'),
        lastAssessedAt: m.lastAssessedAt
      }))
    };
  }

  // 4. Get Personalized Learning Path
  async getLearningPath(studentId: string) {
    const userProfile = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId }
    });
    const grade = userProfile?.grade || 9;

    const allSkills = await this.prisma.skillNode.findMany({
      where: { grade },
      orderBy: { orderIndex: 'asc' }
    });

    const masteries = await this.prisma.skillMastery.findMany({
      where: { studentId }
    });
    const masteryMap = new Map(masteries.map(m => [m.skillId, m.masteryScore]));

    // Construct path modules
    const modules = allSkills.map((s, idx) => {
      const score = masteryMap.get(s.id) ?? 0;
      let status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' = 'LOCKED';

      if (score >= 75) {
        status = 'COMPLETED';
      } else if (idx === 0 || (masteryMap.get(allSkills[Math.max(0, idx - 1)].id) ?? 0) >= 50) {
        status = 'IN_PROGRESS';
      }

      return {
        id: s.id,
        code: s.code,
        title: s.title,
        chapter: s.chapter,
        orderIndex: s.orderIndex,
        masteryScore: score,
        status,
        recommendedAction: score >= 75
          ? 'Đã làm chủ kiến thức — Sẵn sàng làm bài thi tổng hợp'
          : (score >= 50 ? 'Luyện thêm 5-10 câu vận dụng để đạt 85%+' : 'Luyện lại dạng bài cơ bản')
      };
    });

    return {
      targetGoal: userProfile?.targetGoal || 'Ôn thi vào lớp 10',
      grade,
      modules
    };
  }

  // 5. Get Mistake Notebook Records
  async getMistakes(studentId: string, isMastered?: boolean) {
    const where: any = { studentId };
    if (typeof isMastered === 'boolean') {
      where.isMastered = isMastered;
    }

    const mistakes = await this.prisma.mistakeRecord.findMany({
      where,
      include: {
        question: {
          include: {
            skill: true,
            options: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      total: mistakes.length,
      mistakes: mistakes.map(m => {
        const correctOpt = m.question.options.find(o => o.isCorrect);
        const correctKey = correctOpt?.optionKey || '';
        const optionsList = m.question.options.map(o => ({
          key: o.optionKey,
          content: o.content,
          isCorrect: o.isCorrect
        }));

        return {
          id: m.id,
          questionId: m.questionId,
          skillCode: m.question.skill.code,
          skillTitle: m.question.skill.title,
          chapter: m.question.skill.chapter,
          content: m.question.content,
          cognitiveLevel: m.question.cognitiveLevel,
          explanation: m.question.explanation,
          selectedOptionKey: m.selectedOptionKey,
          correctOptionKey: correctKey,
          isMastered: m.isMastered,
          userNotes: m.userNotes,
          createdAt: m.createdAt,
          question: {
            id: m.question.id,
            content: m.question.content,
            cognitiveLevel: m.question.cognitiveLevel,
            explanation: m.question.explanation,
            skillId: m.question.skillId,
            skillCode: m.question.skill.code,
            skillTitle: m.question.skill.title,
            chapter: m.question.skill.chapter,
            correctOptionKey: correctKey,
            options: optionsList
          },
          options: optionsList
        };
      })
    };
  }

  // 6. Update Mistake (toggle mastered status or edit personal notes)
  async updateMistake(studentId: string, mistakeId: string, dto: UpdateMistakeDto) {
    const mistake = await this.prisma.mistakeRecord.findFirst({
      where: { id: mistakeId, studentId }
    });

    if (!mistake) {
      throw new NotFoundException({
        code: 'MISTAKE_NOT_FOUND',
        message: 'Không tìm thấy câu hỏi trong sổ tay lỗi sai.'
      });
    }

    const updated = await this.prisma.mistakeRecord.update({
      where: { id: mistakeId },
      data: {
        ...(dto.isMastered !== undefined && { isMastered: dto.isMastered }),
        ...(dto.userNotes !== undefined && { userNotes: dto.userNotes })
      }
    });

    return {
      message: 'Cập nhật sổ tay lỗi sai thành công',
      mistake: updated
    };
  }
}
