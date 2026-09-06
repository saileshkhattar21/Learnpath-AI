import prisma from "../config/prisma.js";

export const findProgressForSections = async (userId, sectionIds) => {
  const rows = await prisma.userSectionProgress.findMany({
    where: { userId, sectionId: { in: sectionIds } },
  });
  const map = {};
  for (const row of rows) map[row.sectionId] = row;
  return map;
};

export const findSectionProgress = (userId, sectionId) =>
  prisma.userSectionProgress.findUnique({
    where: { userId_sectionId: { userId, sectionId } },
  });

export const upsertSectionProgress = ({
  userId,
  sectionId,
  completed,
  bestScore,
}) =>
  prisma.userSectionProgress.upsert({
    where: { userId_sectionId: { userId, sectionId } },
    update: {
      completed,
      unlocked: true,
      bestScore,
      attempts: { increment: 1 },
      completedAt: completed ? new Date() : undefined,
    },
    create: {
      userId,
      sectionId,
      completed,
      unlocked: true,
      bestScore,
      attempts: 1,
      completedAt: completed ? new Date() : null,
    },
  });

export const findCompletedSectionIdsForTrack = async (userId, trackId) => {
  const rows = await prisma.userSectionProgress.findMany({
    where: { userId, completed: true, section: { course: { trackId } } },
    select: { sectionId: true },
  });
  return rows.map((r) => r.sectionId);
};
