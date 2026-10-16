-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "avatar" TEXT,
    "cefrTarget" TEXT DEFAULT 'B2',
    "dailyMinutes" INTEGER NOT NULL DEFAULT 20,
    "vocabDailyLimit" INTEGER NOT NULL DEFAULT 10,
    "masteryIntervalDays" INTEGER NOT NULL DEFAULT 21,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeafChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL DEFAULT 'legacy',
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'learning',
    "sourcesJson" TEXT NOT NULL DEFAULT '[]',
    "searchText" TEXT NOT NULL DEFAULT '',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeafChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeafMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL DEFAULT 'legacy',
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeafMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeafKnowledgeChunk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeafKnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "room" TEXT,
    "allowAiAssistance" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomMember" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 15,
    "targetCefr" TEXT NOT NULL DEFAULT 'B1',

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThematicPack" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cefrLevel" TEXT NOT NULL,
    "targetAudience" TEXT,
    "sourceFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThematicPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyItem" (
    "id" TEXT NOT NULL,
    "packId" TEXT,
    "no" INTEGER,
    "word" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "dictionarySenseId" INTEGER,
    "dictionaryWordId" INTEGER,
    "source" TEXT,
    "sourceUrl" TEXT,
    "license" TEXT,
    "definitionLang" TEXT,

    CONSTRAINT "VocabularyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordFormFamily" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "root" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "derivativesJson" TEXT NOT NULL,

    CONSTRAINT "WordFormFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarTopic" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "patternsJson" TEXT NOT NULL,

    CONSTRAINT "GrammarTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "exerciseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "hasImages" BOOLEAN NOT NULL DEFAULT false,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "audioMissing" BOOLEAN NOT NULL DEFAULT false,
    "hasSourceError" BOOLEAN NOT NULL DEFAULT false,
    "sourceErrorNotes" TEXT,
    "suggestedFix" TEXT,
    "originalFormatNote" TEXT,
    "dataJson" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocab" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'saved',
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "lastRating" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "UserVocab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabReviewHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userVocabId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "ratingLabel" TEXT NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabReviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'published',
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "allowAiTutor" BOOLEAN NOT NULL DEFAULT true,
    "promptText" TEXT NOT NULL,
    "packId" TEXT,
    "selectedExerciseIdsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentVersion" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "changeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "versionId" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending_grading',
    "content" TEXT,
    "audioUrl" TEXT,
    "answersJson" TEXT,
    "teacherScore" DOUBLE PRECISION,
    "teacherFeedback" TEXT,
    "aiPreGradeJson" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSkillProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "scoreDisplay" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "independentRate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentSkillProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "LeafChatMessage_userId_createdAt_idx" ON "LeafChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeafChatMessage_userId_conversationId_createdAt_idx" ON "LeafChatMessage"("userId", "conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeafMemory_userId_key_key" ON "LeafMemory"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_code_key" ON "Classroom"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomMember_classId_studentId_key" ON "ClassroomMember"("classId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyItem_dictionarySenseId_key" ON "VocabularyItem"("dictionarySenseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocab_userId_vocabId_key" ON "UserVocab"("userId", "vocabId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentVersion_assignmentId_version_key" ON "AssignmentVersion"("assignmentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSkillProfile_userId_skill_key" ON "StudentSkillProfile"("userId", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "LeafChatMessage" ADD CONSTRAINT "LeafChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeafMemory" ADD CONSTRAINT "LeafMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ThematicPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordFormFamily" ADD CONSTRAINT "WordFormFamily_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ThematicPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarTopic" ADD CONSTRAINT "GrammarTopic_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ThematicPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ThematicPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocab" ADD CONSTRAINT "UserVocab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocab" ADD CONSTRAINT "UserVocab_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "VocabularyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabReviewHistory" ADD CONSTRAINT "VocabReviewHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabReviewHistory" ADD CONSTRAINT "VocabReviewHistory_userVocabId_fkey" FOREIGN KEY ("userVocabId") REFERENCES "UserVocab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ThematicPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentVersion" ADD CONSTRAINT "AssignmentVersion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillProfile" ADD CONSTRAINT "StudentSkillProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

