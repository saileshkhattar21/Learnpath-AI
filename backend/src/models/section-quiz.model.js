import prisma from "../config/prisma.js";

export const findQuestionsForSection = (sectionId) =>
  prisma.question.findMany({
    where: { sectionId },
    include: { options: true },
  });

export const findQuestionsByIds = (ids) =>
  prisma.question.findMany({
    where: { id: { in: ids } },
    include: { options: true },
  });

export const createQuizAttempt = ({
  userId,
  sectionId,
  score,
  totalQuestions,
  correctAnswers,
  passed,
  answers,
}) =>
  prisma.quizAttempt.create({
    data: {
      userId,
      sectionId,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      completedAt: new Date(),
      answers: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          optionId: a.optionId,
          isCorrect: a.isCorrect,
        })),
      },
    },
  });
