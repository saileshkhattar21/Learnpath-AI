import prisma from "../config/prisma.js";

export const findQuestionsForTrackByLevel = async (trackId, levelId) => {
  return prisma.question.findMany({
    where: { levelId, section: { course: { trackId } } },
    include: { options: true },
  });
};

export const findQuestionsByIds = async (ids) => {
  return prisma.question.findMany({
    where: { id: { in: ids } },
    include: { options: true, section: { include: { course: true } } },
  });
};

export const createAttempt = async ({
  userId,
  trackId,
  score,
  totalQuestions,
  correctAnswers,
  answers,
}) => {
  return prisma.trackAssessmentAttempt.create({
    data: {
      userId,
      trackId,
      score,
      totalQuestions,
      correctAnswers,
      completedAt: new Date(),
      answers: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          optionId: a.optionId,
          isCorrect: a.isCorrect,
        })),
      },
    },
    include: { answers: true },
  });
};

export const findAttemptWithFullContext = async (attemptId) => {
  return prisma.trackAssessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true,
              section: {
                include: {
                  skills: { include: { skill: true } },
                },
              },
            },
          },
          option: true,
        },
      },
    },
  });
};

export const findAttemptWithAnswers = async (attemptId) => {
  return prisma.trackAssessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: {
            select: {
              id: true,
              levelId: true,
              question: true,
              section: { select: { title: true } },
            },
          },
        },
      },
    },
  });
};

export const findLatestAttemptForUserTrack = async ({ userId, trackId }) => {
  return prisma.trackAssessmentAttempt.findFirst({
    where: { userId, trackId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });
};
