import prisma from "../config/prisma.js";

const pathInclude = {
  items: {
    orderBy: { position: "asc" },
    include: {
      course: { select: { id: true, title: true, level: { select: { name: true } } } },
      section: { select: { id: true, title: true } },
    },
  },
};

export const findLearningPath = ({ userId, trackId }) =>
  prisma.learningPath.findUnique({
    where: { userId_trackId: { userId, trackId } },
    include: pathInclude,
  });

export const createLearningPath = ({ userId, trackId, items, summary, recommendedStartingPoint }) =>
  prisma.learningPath.create({
    data: {
      userId,
      trackId,
      summary,
      recommendedStartingPoint,
      items: {
        create: items.map((item, index) => ({
          courseId: item.courseId,
          sectionId: item.sectionId ?? null,
          position: index + 1,
          reason: item.reason,
        })),
      },
    },
    include: pathInclude,
  });
