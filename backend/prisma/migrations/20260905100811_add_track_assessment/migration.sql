-- CreateTable
CREATE TABLE "track_assessment_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "track_assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_assessment_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_assessment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "track_assessment_attempts_userId_trackId_idx" ON "track_assessment_attempts"("userId", "trackId");

-- CreateIndex
CREATE INDEX "track_assessment_attempts_trackId_idx" ON "track_assessment_attempts"("trackId");

-- CreateIndex
CREATE INDEX "track_assessment_answers_questionId_idx" ON "track_assessment_answers"("questionId");

-- CreateIndex
CREATE INDEX "track_assessment_answers_optionId_idx" ON "track_assessment_answers"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "track_assessment_answers_attemptId_questionId_key" ON "track_assessment_answers"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "track_assessment_attempts" ADD CONSTRAINT "track_assessment_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_assessment_attempts" ADD CONSTRAINT "track_assessment_attempts_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_assessment_answers" ADD CONSTRAINT "track_assessment_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "track_assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_assessment_answers" ADD CONSTRAINT "track_assessment_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_assessment_answers" ADD CONSTRAINT "track_assessment_answers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
